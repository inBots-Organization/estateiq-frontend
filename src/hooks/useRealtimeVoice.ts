'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceCallApi, VoiceCallMessage } from '@/lib/api/voice-call.api';
import { useLanguage, LANGUAGE_CONFIGS, Language } from '@/contexts/LanguageContext';

/**
 * REAL-TIME VOICE CALL HOOK
 *
 * Implements TRUE real-time conversational voice with:
 * - HARD SINGLE-PLAYBACK GUARANTEE (no audio overlap ever)
 * - Interaction ID for duplicate response prevention
 * - Instant interruption (<150ms)
 * - VAD with 600ms silence detection
 * - Natural turn-taking
 * - Language-aware STT/TTS (Arabic/English)
 *
 * Latency targets:
 * - Silence-to-STT: < 300ms
 * - STT final: < 700ms
 * - LLM first token: < 800ms
 * - First TTS sound: < 1.2s
 */

// Unique interaction ID to prevent duplicate responses
let globalInteractionId = 0;

export type CallStatus = 'idle' | 'connecting' | 'active' | 'ending' | 'ended' | 'error';

interface AudioState {
  isPlaying: boolean;
  currentAudioId: string | null;
  audioElement: HTMLAudioElement | null;
}

interface VADConfig {
  silenceThreshold: number;  // RMS threshold for silence
  silenceDuration: number;   // ms of silence before end-of-speech
  minSpeechDuration: number; // Minimum ms to consider valid speech
}

interface LatencyMetrics {
  silenceToSTT: number;
  sttToLLM: number;
  llmToTTS: number;
  totalLatency: number;
}

export interface RealtimeVoiceState {
  status: CallStatus;
  callId: string | null;
  messages: VoiceCallMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  isAISpeaking: boolean;
  isProcessing: boolean;
  error: string | null;
  audioLevel: number;
  interimTranscript: string;
  latencyMetrics: LatencyMetrics | null;
}

const VAD_CONFIG: VADConfig = {
  silenceThreshold: 0.01,    // RMS threshold
  silenceDuration: 600,      // 600ms silence = end of speech
  minSpeechDuration: 200,    // Min 200ms of speech
};

// Arabic filler phrases for natural response
const ARABIC_FILLERS = [
  'تمام، لحظة...',
  'ثانية بس...',
  'خلني أوضح لك...',
  'طيب...',
];

export function useRealtimeVoice() {
  // Language context for STT/TTS
  const { language, config: langConfig, t } = useLanguage();

  // State
  const [status, setStatus] = useState<CallStatus>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoiceCallMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [latencyMetrics, setLatencyMetrics] = useState<LatencyMetrics | null>(null);

  // Refs for audio control - CRITICAL for single-playback guarantee
  const audioStateRef = useRef<AudioState>({
    isPlaying: false,
    currentAudioId: null,
    audioElement: null,
  });

  // Current interaction ID - prevents duplicate responses
  const currentInteractionRef = useRef<number | null>(null);

  // Audio context for VAD
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Speech recognition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // VAD state
  const vadStateRef = useRef({
    isSpeaking: false,
    silenceStart: 0,
    speechStart: 0,
  });

  // Animation frame for audio level
  const animationFrameRef = useRef<number | null>(null);

  // Timestamps for latency measurement
  const timestampsRef = useRef({
    silenceDetected: 0,
    sttComplete: 0,
    llmStart: 0,
    ttsStart: 0,
  });

  /**
   * HARD STOP ALL AUDIO - Guaranteed to stop any playing audio immediately
   */
  const hardStopAudio = useCallback(() => {
    const state = audioStateRef.current;

    // Stop current audio element
    if (state.audioElement) {
      try {
        state.audioElement.pause();
        state.audioElement.currentTime = 0;
        state.audioElement.src = '';
      } catch (e) {
        // Ignore errors during cleanup
      }
      state.audioElement = null;
    }

    // Clear state
    state.isPlaying = false;
    state.currentAudioId = null;

    setIsAISpeaking(false);
  }, []);

  /**
   * Play audio with SINGLE-PLAYBACK GUARANTEE
   * Any new audio call will FIRST cancel any existing playback
   */
  const playAudio = useCallback(async (base64Audio: string, audioId: string): Promise<boolean> => {
    // STEP 1: Always hard stop any existing audio first
    hardStopAudio();

    // STEP 2: Check if this is still the current interaction
    if (currentInteractionRef.current !== null) {
      const interactionId = parseInt(audioId.split('_')[0] || '0');
      if (interactionId !== currentInteractionRef.current) {
        console.log('[Audio] Discarding stale audio for old interaction');
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);

        // Set as current
        audioStateRef.current.audioElement = audio;
        audioStateRef.current.currentAudioId = audioId;
        audioStateRef.current.isPlaying = true;

        setIsAISpeaking(true);

        // Smooth fade-in
        audio.volume = 0;
        const fadeIn = setInterval(() => {
          if (audio.volume < 0.95) {
            audio.volume = Math.min(1, audio.volume + 0.1);
          } else {
            audio.volume = 1;
            clearInterval(fadeIn);
          }
        }, 30);

        audio.onended = () => {
          // Only clear if this is still the current audio
          if (audioStateRef.current.currentAudioId === audioId) {
            audioStateRef.current.isPlaying = false;
            audioStateRef.current.currentAudioId = null;
            audioStateRef.current.audioElement = null;
            setIsAISpeaking(false);
          }
          clearInterval(fadeIn);
          resolve(true);
        };

        audio.onerror = () => {
          console.error('[Audio] Playback error');
          hardStopAudio();
          clearInterval(fadeIn);
          resolve(false);
        };

        // Handle interruption - if user starts speaking, stop immediately
        audio.onpause = () => {
          if (audioStateRef.current.currentAudioId === audioId) {
            setIsAISpeaking(false);
          }
        };

        audio.play().catch(err => {
          console.error('[Audio] Play failed:', err);
          hardStopAudio();
          resolve(false);
        });

      } catch (err) {
        console.error('[Audio] Error creating audio:', err);
        hardStopAudio();
        resolve(false);
      }
    });
  }, [hardStopAudio]);

  /**
   * Initialize audio context for VAD
   */
  const initAudioContext = useCallback(async (): Promise<boolean> => {
    try {
      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser for VAD
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      return true;
    } catch (err) {
      console.error('[Audio] Failed to init:', err);
      setError(t.voiceCall.micPermissionError);
      return false;
    }
  }, [t.voiceCall.micPermissionError]);

  /**
   * Start VAD monitoring
   */
  const startVADMonitoring = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length) / 255;

      setAudioLevel(rms);

      const now = Date.now();
      const vad = vadStateRef.current;

      // Detect speech activity
      if (rms > VAD_CONFIG.silenceThreshold) {
        if (!vad.isSpeaking) {
          vad.speechStart = now;
          vad.isSpeaking = true;
          setIsSpeaking(true);

          // INTERRUPT AI if speaking
          if (audioStateRef.current.isPlaying) {
            console.log('[VAD] User started speaking - interrupting AI');
            hardStopAudio();
          }
        }
        vad.silenceStart = 0;
      } else {
        if (vad.isSpeaking && vad.silenceStart === 0) {
          vad.silenceStart = now;
        }

        // Check for end of speech
        if (vad.isSpeaking && vad.silenceStart > 0) {
          const silenceDuration = now - vad.silenceStart;
          const speechDuration = vad.silenceStart - vad.speechStart;

          if (silenceDuration >= VAD_CONFIG.silenceDuration &&
              speechDuration >= VAD_CONFIG.minSpeechDuration) {
            // End of speech detected
            vad.isSpeaking = false;
            setIsSpeaking(false);

            // Record timestamp for latency measurement
            timestampsRef.current.silenceDetected = now;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
    };

    animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
  }, [hardStopAudio]);

  /**
   * Stop VAD monitoring
   */
  const stopVADMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  /**
   * Initialize speech recognition with current language
   */
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition ||
                              (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[STT] Speech recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langConfig.sttLocale; // ar-SA or en-US based on language context

    return recognition;
  }, [langConfig.sttLocale]);

  /**
   * Send message with interaction locking
   */
  const sendMessage = useCallback(async (transcript: string): Promise<void> => {
    if (!callId || status !== 'active' || !transcript.trim()) return;

    // Generate new interaction ID
    const interactionId = ++globalInteractionId;
    currentInteractionRef.current = interactionId;

    // HARD STOP any playing audio before processing
    hardStopAudio();

    setIsProcessing(true);
    setInterimTranscript('');

    // Record STT complete time
    timestampsRef.current.sttComplete = Date.now();

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: transcript }]);

    try {
      // Record LLM start time
      timestampsRef.current.llmStart = Date.now();

      const response = await voiceCallApi.sendMessage({
        callId,
        message: transcript,
        includeAudio: true,
      });

      // Check if this is still the current interaction (prevent duplicates)
      if (currentInteractionRef.current !== interactionId) {
        console.log('[Response] Discarding stale response');
        return;
      }

      // Record TTS start time
      timestampsRef.current.ttsStart = Date.now();

      // Update messages
      setMessages(response.conversationHistory);

      // Calculate latency metrics
      const metrics: LatencyMetrics = {
        silenceToSTT: timestampsRef.current.sttComplete - timestampsRef.current.silenceDetected,
        sttToLLM: timestampsRef.current.llmStart - timestampsRef.current.sttComplete,
        llmToTTS: timestampsRef.current.ttsStart - timestampsRef.current.llmStart,
        totalLatency: Date.now() - timestampsRef.current.silenceDetected,
      };
      setLatencyMetrics(metrics);
      console.log('[Latency]', metrics);

      // Play audio if available and still current interaction
      if (response.audioBase64 && currentInteractionRef.current === interactionId) {
        const audioId = `${interactionId}_${Date.now()}`;
        await playAudio(response.audioBase64, audioId);
      }

    } catch (err) {
      // Only show error if still current interaction
      if (currentInteractionRef.current === interactionId) {
        console.error('[Message] Error:', err);
        setError(err instanceof Error ? err.message : t.errors.somethingWentWrong);
      }
    } finally {
      // Only clear processing if still current interaction
      if (currentInteractionRef.current === interactionId) {
        setIsProcessing(false);
      }
    }
  }, [callId, status, hardStopAudio, playAudio, t.errors.somethingWentWrong]);

  /**
   * Start listening with VAD and STT
   */
  const startListening = useCallback(() => {
    if (isListening || isProcessing) return;

    // Stop any AI audio immediately
    hardStopAudio();

    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error('[STT] Recognition not available');
      return;
    }

    let finalTranscript = '';
    let lastResultTime = Date.now();

    recognition.onresult = (event: any) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          lastResultTime = Date.now();
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      // Check for end of speech via final result
      if (finalTranscript.trim() && Date.now() - lastResultTime > 300) {
        // User finished speaking
        recognition.stop();
        setIsListening(false);
        sendMessage(finalTranscript.trim());
        finalTranscript = '';
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[STT] Error:', event.errors.somethingWentWrong);
      if (event.errors.somethingWentWrong === 'not-allowed') {
        setError(t.voiceCall.micPermissionError);
      } else if (event.errors.somethingWentWrong !== 'no-speech' && event.errors.somethingWentWrong !== 'aborted') {
        // Ask to repeat politely
        setError(t.voiceCall.didntHear + ' ' + t.voiceCall.pleaseRepeat);
        setTimeout(() => setError(null), 3000);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // Send any remaining transcript
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim());
        finalTranscript = '';
      }
      setIsListening(false);
      setInterimTranscript('');

      // Auto-restart if call is active and AI not speaking
      if (status === 'active' && !audioStateRef.current.isPlaying && !isProcessing) {
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch (e) {
            // Already running
          }
        }, 300);
      }
    };

    try {
      recognition.start();
      setIsListening(true);
      startVADMonitoring();
    } catch (err) {
      console.error('[STT] Start failed:', err);
    }
  }, [isListening, isProcessing, status, hardStopAudio, sendMessage, startVADMonitoring, t.voiceCall.micPermissionError, t.voiceCall.didntHear, t.voiceCall.pleaseRepeat]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Not running
      }
    }
    setIsListening(false);
    stopVADMonitoring();
  }, [stopVADMonitoring]);

  /**
   * Start call
   */
  const startCall = useCallback(async (scenarioType?: string, courseId?: string): Promise<void> => {
    setStatus('connecting');
    setError(null);
    setMessages([]);
    currentInteractionRef.current = null;

    // Initialize audio context
    const audioInit = await initAudioContext();
    if (!audioInit) {
      setStatus('error');
      return;
    }

    // Initialize speech recognition
    recognitionRef.current = initSpeechRecognition();

    try {
      const response = await voiceCallApi.startCall({
        scenarioType,
        courseId,
        language: language, // Use current language from context
      });

      setCallId(response.callId);
      setMessages([{ role: 'assistant', content: response.greeting }]);
      setStatus('active');

      // Play greeting audio
      if (response.greetingAudioBase64) {
        const audioId = `greeting_${Date.now()}`;
        await playAudio(response.greetingAudioBase64, audioId);
      }

      // Start listening after greeting
      setTimeout(() => {
        startListening();
      }, 500);

    } catch (err) {
      console.error('[Call] Start failed:', err);
      setError(err instanceof Error ? err.message : t.errors.somethingWentWrong);
      setStatus('error');
    }
  }, [initAudioContext, initSpeechRecognition, playAudio, startListening, language, t.errors.somethingWentWrong]);

  /**
   * End call
   */
  const endCall = useCallback(async (): Promise<void> => {
    if (!callId) return;

    setStatus('ending');

    // Stop everything
    hardStopAudio();
    stopListening();

    // Clear interaction to prevent any late responses
    currentInteractionRef.current = null;

    try {
      const summary = await voiceCallApi.endCall({ callId, endReason: 'completed' });
      setStatus('ended');
      return summary as any;
    } catch (err) {
      console.error('[Call] End failed:', err);
      setStatus('error');
    }
  }, [callId, hardStopAudio, stopListening]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    hardStopAudio();
    stopListening();

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setStatus('idle');
    setCallId(null);
    setMessages([]);
    setError(null);
    setAudioLevel(0);
    setInterimTranscript('');
    setLatencyMetrics(null);
    currentInteractionRef.current = null;
  }, [hardStopAudio, stopListening]);

  /**
   * Silence re-engagement (if silent > 8s)
   */
  useEffect(() => {
    if (status !== 'active') return;

    let silenceTimer: NodeJS.Timeout | null = null;

    const checkSilence = () => {
      // If not listening and not processing and not AI speaking
      if (!isListening && !isProcessing && !isAISpeaking) {
        silenceTimer = setTimeout(() => {
          // Re-engage in current language
          setMessages(prev => [...prev, { role: 'assistant', content: t.voiceCall.stillThere }]);

          // Start listening again
          startListening();
        }, 8000);
      }
    };

    checkSilence();

    return () => {
      if (silenceTimer) clearTimeout(silenceTimer);
    };
  }, [status, isListening, isProcessing, isAISpeaking, startListening, t.voiceCall.stillThere]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return {
    // State
    status,
    callId,
    messages,
    isListening,
    isSpeaking,
    isAISpeaking,
    isProcessing,
    error,
    audioLevel,
    interimTranscript,
    latencyMetrics,

    // Actions
    startCall,
    sendMessage,
    endCall,
    startListening,
    stopListening,
    hardStopAudio,
    reset,
  };
}
