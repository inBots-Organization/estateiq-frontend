'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SimulationScenarioType, DifficultyLevel } from '@/types';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Loader2,
  User,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Award,
  MessageSquare,
} from 'lucide-react';

/**
 * Real-Time Voice Call Component
 *
 * Features:
 * - Voice Activity Detection (VAD) with 600ms silence threshold
 * - Real-time waveform visualization
 * - Streaming audio playback with interruption support
 * - Single audio channel control
 * - Natural conversation flow
 * - Arabic Saudi dialect
 */

interface RealtimeVoiceCallProps {
  scenarioType: SimulationScenarioType;
  difficultyLevel: DifficultyLevel;
  onEnd: () => void;
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CallSummary {
  summary: string;
  totalMessages: number;
  durationSeconds: number;
  feedback?: string;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'processing' | 'speaking' | 'ended';

// VAD Configuration
const VAD_CONFIG = {
  silenceThreshold: -50,      // dB
  silenceDuration: 600,       // ms of silence before end-of-speech
  minSpeechDuration: 200,     // ms minimum to consider valid speech
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
};

// Audio visualization config
const WAVEFORM_CONFIG = {
  barCount: 32,
  minBarHeight: 2,
  maxBarHeight: 40,
  barGap: 2,
};

export function RealtimeVoiceCall({
  scenarioType,
  difficultyLevel,
  onEnd,
  onBack,
}: RealtimeVoiceCallProps) {
  // State
  const [status, setStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(WAVEFORM_CONFIG.barCount).fill(0));
  const [aiThinking, setAiThinking] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const speechStartRef = useRef<number | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer for active call
  useEffect(() => {
    if (status === 'active' || status === 'processing' || status === 'speaking') {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      }
    } else if (status === 'ended' || status === 'idle') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Initialize WebSocket connection
   */
  const initWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws/voice';

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected');
      setWsConnected(true);

      // Authenticate
      const token = localStorage.getItem('token');
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', payload: { token } }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWSMessage(message);
      } catch (e) {
        console.error('[WS] Failed to parse message:', e);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      setWsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('[WS] Error:', error);
      setError('Connection error. Please try again.');
    };

    return ws;
  }, []);

  /**
   * Handle WebSocket messages
   */
  const handleWSMessage = useCallback((message: { type: string; payload?: Record<string, unknown> }) => {
    switch (message.type) {
      case 'authenticated':
        console.log('[WS] Authenticated');
        break;

      case 'session_started':
        setSessionId(message.payload?.sessionId as string);
        const greeting = message.payload?.greeting as string;
        if (greeting) {
          setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
        }
        setStatus('active');
        break;

      case 'ai_starting':
        setAiThinking(true);
        break;

      case 'ai_response':
        const response = message.payload?.response as string;
        if (response) {
          setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
        }
        setAiThinking(false);
        break;

      case 'audio_chunk':
        const audioBase64 = message.payload?.audio as string;
        const isFinal = message.payload?.isFinal as boolean;
        if (audioBase64) {
          playAudioChunk(audioBase64, isFinal);
        }
        break;

      case 'audio_complete':
        setIsAISpeaking(false);
        setStatus('active');
        // Resume listening after AI finishes
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already running
          }
        }
        break;

      case 'playback_interrupted':
        stopCurrentAudio();
        setIsAISpeaking(false);
        break;

      case 'session_ended':
        setCallSummary({
          summary: message.payload?.summary as string,
          totalMessages: message.payload?.totalMessages as number,
          durationSeconds: message.payload?.durationSeconds as number,
        });
        setStatus('ended');
        break;

      case 'error':
        setError(message.payload?.message as string);
        break;

      case 'listening':
        setAiThinking(false);
        break;

      case 'processing':
        setAiThinking(true);
        break;
    }
  }, []);

  /**
   * Initialize Audio Context and Analyser for waveform
   */
  const initAudioContext = useCallback(async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = VAD_CONFIG.fftSize;
      analyser.smoothingTimeConstant = VAD_CONFIG.smoothingTimeConstant;
      analyserRef.current = analyser;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Connect stream to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      return true;
    } catch (error) {
      console.error('[Audio] Failed to initialize:', error);
      setError('فشل الوصول للميكروفون. يرجى السماح بالوصول.');
      return false;
    }
  }, []);

  /**
   * Start waveform visualization
   */
  const startWaveformVisualization = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateWaveform = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate levels for each bar
      const barWidth = Math.floor(dataArray.length / WAVEFORM_CONFIG.barCount);
      const levels: number[] = [];

      for (let i = 0; i < WAVEFORM_CONFIG.barCount; i++) {
        let sum = 0;
        for (let j = 0; j < barWidth; j++) {
          sum += dataArray[i * barWidth + j];
        }
        const avg = sum / barWidth;
        const normalized = (avg / 255) * WAVEFORM_CONFIG.maxBarHeight;
        levels.push(Math.max(WAVEFORM_CONFIG.minBarHeight, normalized));
      }

      setAudioLevel(levels);

      // Detect speech activity
      const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
      const isSpeech = avgLevel > 8; // Threshold for speech detection

      if (isSpeech) {
        if (!speechStartRef.current) {
          speechStartRef.current = Date.now();
        }
        silenceStartRef.current = null;
        setIsSpeaking(true);
      } else {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        }

        // Check for end of speech (VAD)
        if (silenceStartRef.current && speechStartRef.current) {
          const silenceDuration = Date.now() - silenceStartRef.current;
          const speechDuration = silenceStartRef.current - speechStartRef.current;

          if (silenceDuration >= VAD_CONFIG.silenceDuration && speechDuration >= VAD_CONFIG.minSpeechDuration) {
            // End of speech detected
            speechStartRef.current = null;
            setIsSpeaking(false);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  /**
   * Stop waveform visualization
   */
  const stopWaveformVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(new Array(WAVEFORM_CONFIG.barCount).fill(0));
  }, []);

  /**
   * Initialize Speech Recognition
   */
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // Arabic Saudi

    recognition.onstart = () => {
      console.log('[STT] Started');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (finalTranscript.trim()) {
        console.log('[STT] Final:', finalTranscript);
        setInterimTranscript('');

        // Add user message
        setMessages((prev) => [...prev, { role: 'user', content: finalTranscript.trim(), timestamp: new Date() }]);

        // Send to backend
        sendSpeechToBackend(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[STT] Error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        // Politely ask to repeat in Arabic
        if (event.error === 'not-allowed') {
          setError('يرجى السماح بالوصول للميكروفون');
        }
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[STT] Ended');
      setIsListening(false);

      // Auto-restart if call is active and AI is not speaking
      if (status === 'active' && !isAISpeaking) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            // Already running
          }
        }, 100);
      }
    };

    return recognition;
  }, [status, isAISpeaking]);

  /**
   * Send speech transcript to backend
   */
  const sendSpeechToBackend = useCallback((transcript: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Fallback to REST API if WebSocket not available
      sendSpeechREST(transcript);
      return;
    }

    // Signal that user started speaking (for interruption)
    wsRef.current.send(JSON.stringify({ type: 'speech_start' }));

    // Send the transcript
    wsRef.current.send(JSON.stringify({
      type: 'speech',
      payload: { transcript },
    }));

    setStatus('processing');
    setAiThinking(true);
  }, []);

  /**
   * Fallback: Send speech via REST API
   */
  const sendSpeechREST = useCallback(async (transcript: string) => {
    if (!sessionId) return;

    setStatus('processing');
    setAiThinking(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/voice/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: transcript,
          includeAudio: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Add AI response to messages
      setMessages((prev) => [...prev, { role: 'assistant', content: data.aiResponse, timestamp: new Date() }]);

      // Play audio if available
      if (data.audioBase64) {
        playAudioChunk(data.audioBase64, true);
      } else {
        setStatus('active');
        setAiThinking(false);
      }
    } catch (error) {
      console.error('[REST] Error:', error);
      setError('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      setStatus('active');
      setAiThinking(false);
    }
  }, [sessionId]);

  /**
   * Play audio chunk with streaming support
   */
  const playAudioChunk = useCallback(async (base64Audio: string, isFinal: boolean) => {
    const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();

    if (!audioContextRef.current) {
      audioContextRef.current = audioContext;
    }

    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      // Add to queue
      audioQueueRef.current.push(audioBuffer);

      // Start playing if not already
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (error) {
      console.error('[Audio] Failed to decode:', error);
    }
  }, []);

  /**
   * Play next audio buffer in queue
   */
  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsAISpeaking(false);
      setStatus('active');

      // Resume listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already running
        }
      }
      return;
    }

    isPlayingRef.current = true;
    setIsAISpeaking(true);
    setStatus('speaking');

    // Stop listening while AI speaks
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Not running
      }
    }

    const audioBuffer = audioQueueRef.current.shift()!;
    const audioContext = audioContextRef.current!;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Add gain node for smooth fade
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.05); // Fade in

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    currentSourceRef.current = source;

    source.onended = () => {
      currentSourceRef.current = null;
      playNextInQueue();
    };

    source.start(0);
  }, []);

  /**
   * Stop current audio playback (for interruption)
   */
  const stopCurrentAudio = useCallback(() => {
    // Clear queue
    audioQueueRef.current = [];

    // Stop current source
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      currentSourceRef.current = null;
    }

    isPlayingRef.current = false;
    setIsAISpeaking(false);

    // Notify backend of interruption
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
  }, []);

  /**
   * Start the call
   */
  const startCall = async () => {
    setStatus('connecting');
    setError(null);
    setElapsedTime(0);

    try {
      // Initialize audio context
      const audioSuccess = await initAudioContext();
      if (!audioSuccess) {
        setStatus('idle');
        return;
      }

      // Initialize WebSocket
      const ws = initWebSocket();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);

        ws.onopen = () => {
          clearTimeout(timeout);

          // Authenticate
          const token = localStorage.getItem('token');
          if (token) {
            ws.send(JSON.stringify({ type: 'auth', payload: { token } }));
          }

          // Start session
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: 'start_session',
              payload: { scenarioType },
            }));
            resolve();
          }, 500);
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('WebSocket error'));
        };
      });

      // Initialize speech recognition
      recognitionRef.current = initSpeechRecognition();

      // Start waveform visualization
      startWaveformVisualization();

    } catch (error) {
      console.error('[Call] Error starting:', error);

      // Fallback to REST API mode
      await startCallREST();
    }
  };

  /**
   * Fallback: Start call via REST API
   */
  const startCallREST = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/voice/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          scenarioType,
          language: 'ar',
        }),
      });

      if (!response.ok) throw new Error('Failed to start call');

      const data = await response.json();

      setSessionId(data.callId);
      setMessages([{ role: 'assistant', content: data.greeting, timestamp: new Date() }]);
      setStatus('active');

      // Initialize audio
      await initAudioContext();
      startWaveformVisualization();

      // Play greeting
      if (data.greetingAudioBase64) {
        playAudioChunk(data.greetingAudioBase64, true);
      }

      // Start speech recognition
      recognitionRef.current = initSpeechRecognition();
      if (recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            // Already running
          }
        }, 1000);
      }
    } catch (error) {
      console.error('[Call] REST fallback error:', error);
      setError('فشل بدء المكالمة. يرجى المحاولة مرة أخرى.');
      setStatus('idle');
    }
  };

  /**
   * End the call
   */
  const endCall = async () => {
    // Stop everything
    stopCurrentAudio();
    stopWaveformVisualization();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Not running
      }
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setStatus('processing');

    // End session via WebSocket or REST
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }));
    } else if (sessionId) {
      // REST fallback
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/voice/${sessionId}/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ endReason: 'completed' }),
        });

        if (response.ok) {
          const data = await response.json();
          setCallSummary(data);
        }
      } catch (error) {
        console.error('[Call] Error ending:', error);
      }
    }

    setStatus('ended');
  };

  /**
   * Toggle microphone
   */
  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Interrupt AI if speaking
      if (isAISpeaking) {
        stopCurrentAudio();
      }
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // Already running
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopWaveformVisualization();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (wsRef.current) {
        wsRef.current.close();
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stopWaveformVisualization]);

  // ============ RENDER ============

  // Call Summary View
  if (status === 'ended' && callSummary) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-foreground">انتهت المكالمة!</CardTitle>
          <p className="text-muted-foreground">
            المدة: {formatTime(callSummary.durationSeconds)} | {callSummary.totalMessages} رسائل
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-card rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              ملخص المحادثة
            </h3>
            <p className="text-muted-foreground whitespace-pre-line" dir="rtl">{callSummary.summary}</p>
          </div>

          {callSummary.feedback && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                تقييم الأداء
              </h3>
              <p className="text-muted-foreground whitespace-pre-line" dir="rtl">{callSummary.feedback}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              رجوع
            </Button>
            <Button onClick={onEnd}>
              عرض التقرير الكامل
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Idle / Start Call View
  if (status === 'idle') {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-foreground">مكالمة صوتية تدريبية</CardTitle>
          <p className="text-muted-foreground">
            تدرب مع عميل افتراضي يتكلم باللهجة السعودية
          </p>
          <Badge className="mt-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            {scenarioType.replace(/_/g, ' ')} - {difficultyLevel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-xl">
            <ul className="text-sm text-muted-foreground space-y-2" dir="rtl">
              <li>• محادثة صوتية حقيقية باللهجة السعودية</li>
              <li>• رد فوري من العميل الافتراضي</li>
              <li>• تقييم أدائك في نهاية المكالمة</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              رجوع
            </Button>
            <Button
              size="lg"
              onClick={startCall}
              className="px-8"
            >
              <Phone className="h-5 w-5 mr-2" />
              ابدأ المكالمة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connecting View
  if (status === 'connecting') {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-foreground">جاري الاتصال...</p>
          <p className="text-sm text-muted-foreground">يتم تجهيز المكالمة الصوتية</p>
        </CardContent>
      </Card>
    );
  }

  // Active Call View
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-card rounded-xl overflow-hidden border border-border shadow-lg">
      {/* Call Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                isAISpeaking ? 'bg-white/30 animate-pulse' : 'bg-white/20'
              )}
            >
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">عميل سعودي</p>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Clock className="h-3 w-3" />
                {formatTime(elapsedTime)}
                {isAISpeaking && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                    <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                    يتكلم
                  </Badge>
                )}
                {isListening && (
                  <Badge variant="secondary" className="ml-2 bg-rose-500/80 text-white border-0">
                    <Mic className="h-3 w-3 mr-1 animate-pulse" />
                    يستمع
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={endCall}
            disabled={status === 'processing'}
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            إنهاء
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] p-4 rounded-2xl',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border rounded-bl-md'
                )}
                dir="rtl"
              >
                <p className={msg.role === 'user' ? 'text-primary-foreground' : 'text-card-foreground'}>{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking indicator */}
          {aiThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2 text-muted-foreground" dir="rtl">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  يفكر...
                </div>
              </div>
            </div>
          )}

          {/* Interim transcript */}
          {interimTranscript && (
            <div className="flex gap-3 justify-end opacity-50">
              <div className="max-w-[80%] p-4 rounded-2xl bg-primary/70 text-primary-foreground rounded-br-md" dir="rtl">
                <p>{interimTranscript}...</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Input Area with Waveform */}
      <div className="bg-background border-t border-border p-4">
        {error && (
          <div className="mb-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
              إغلاق
            </Button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
          {/* Waveform Visualization */}
          <div className="flex items-end justify-center gap-[2px] h-12 w-full max-w-md bg-muted rounded-lg p-2">
            {audioLevel.map((level, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-2 rounded-full transition-all duration-75',
                  isSpeaking ? 'bg-emerald-500' : isAISpeaking ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                style={{ height: `${level}px` }}
              />
            ))}
          </div>

          {/* Mic Button */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              className={cn(
                'rounded-full w-16 h-16 p-0 transition-all',
                isListening && 'ring-4 ring-rose-200 dark:ring-rose-800 animate-pulse',
                isSpeaking && 'ring-4 ring-emerald-200 dark:ring-emerald-800'
              )}
              onClick={toggleMic}
              disabled={aiThinking}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center" dir="rtl">
            {isAISpeaking ? 'العميل يتكلم... اضغط للمقاطعة' :
             isListening ? 'يستمع... تكلم الآن' :
             aiThinking ? 'يفكر...' :
             'اضغط للتحدث'}
          </p>
        </div>
      </div>
    </div>
  );
}
