'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  voiceCallApi,
  VoiceCallMessage,
  StartCallInput,
  EndCallResponse,
} from '@/lib/api/voice-call.api';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VoiceCallStatus = 'idle' | 'starting' | 'active' | 'ending' | 'ended' | 'error';

interface UseVoiceCallReturn {
  status: VoiceCallStatus;
  callId: string | null;
  messages: VoiceCallMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  error: string | null;
  callSummary: EndCallResponse | null;
  voiceAvailable: boolean;

  startCall: (input: StartCallInput) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  endCall: (reason?: 'completed' | 'abandoned') => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  playAudio: (base64Audio: string) => Promise<void>;
  reset: () => void;
}

export function useVoiceCall(): UseVoiceCallReturn {
  const [status, setStatus] = useState<VoiceCallStatus>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoiceCallMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callSummary, setCallSummary] = useState<EndCallResponse | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check voice service availability on mount
  useEffect(() => {
    voiceCallApi.getStatus()
      .then(res => setVoiceAvailable(res.voiceServiceAvailable))
      .catch(() => setVoiceAvailable(false));
  }, []);

  // Initialize speech recognition with Arabic Saudi support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Enable continuous listening
        recognition.interimResults = true; // Show interim results for real-time feedback
        recognition.lang = 'ar-SA'; // Arabic Saudi dialect
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const playAudio = useCallback(async (base64Audio: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
        audioRef.current = audio;

        setIsSpeaking(true);

        audio.onended = () => {
          setIsSpeaking(false);
          resolve();
        };

        audio.onerror = (e) => {
          setIsSpeaking(false);
          console.error('Audio playback error:', e);
          reject(new Error('Failed to play audio'));
        };

        audio.play().catch(err => {
          setIsSpeaking(false);
          console.error('Audio play error:', err);
          reject(err);
        });
      } catch (err) {
        setIsSpeaking(false);
        reject(err);
      }
    });
  }, []);

  const startCall = useCallback(async (input: StartCallInput): Promise<void> => {
    setStatus('starting');
    setError(null);
    setMessages([]);
    setCallSummary(null);

    try {
      const response = await voiceCallApi.startCall(input);
      setCallId(response.callId);
      setMessages([{ role: 'assistant', content: response.greeting }]);
      setStatus('active');

      // Play greeting audio if available
      if (response.greetingAudioBase64) {
        await playAudio(response.greetingAudioBase64);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setStatus('error');
    }
  }, [playAudio]);

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!callId || status !== 'active') {
      throw new Error('No active call');
    }

    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const response = await voiceCallApi.sendMessage({
        callId,
        message,
        includeAudio: voiceAvailable,
      });

      setMessages(response.conversationHistory);

      // Play response audio if available
      if (response.audioBase64) {
        await playAudio(response.audioBase64);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  }, [callId, status, voiceAvailable, playAudio]);

  const endCall = useCallback(async (reason: 'completed' | 'abandoned' = 'completed'): Promise<void> => {
    if (!callId) return;

    setStatus('ending');

    try {
      const summary = await voiceCallApi.endCall({ callId, endReason: reason });
      setCallSummary(summary);
      setStatus('ended');
      setCallId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end call');
      setStatus('error');
    }
  }, [callId]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || isSpeaking) return;

    const recognition = recognitionRef.current;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (transcript.trim()) {
        await sendMessage(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
    }
  }, [isListening, isSpeaking, sendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setStatus('idle');
    setCallId(null);
    setMessages([]);
    setError(null);
    setCallSummary(null);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  }, []);

  return {
    status,
    callId,
    messages,
    isListening,
    isSpeaking,
    isProcessing,
    error,
    callSummary,
    voiceAvailable,
    startCall,
    sendMessage,
    endCall,
    startListening,
    stopListening,
    playAudio,
    reset,
  };
}
