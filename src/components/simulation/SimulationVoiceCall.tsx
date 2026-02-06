'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { voiceCallApi, VoiceCallMessage } from '@/lib/api/voice-call.api';
import { cn } from '@/lib/utils';
import type { SimulationScenarioType, DifficultyLevel } from '@/types';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Volume2,
  Loader2,
  MessageSquare,
  User,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Award,
} from 'lucide-react';

// Use any for speech recognition to avoid global type conflicts with useVoiceCall hook
/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionInstance = any;
type SpeechRecognitionEvent = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface SimulationVoiceCallProps {
  scenarioType: SimulationScenarioType;
  difficultyLevel: DifficultyLevel;
  onEnd: () => void;
  onBack: () => void;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'processing' | 'speaking' | 'ended';

interface CallSummary {
  summary: string;
  totalMessages: number;
  durationSeconds: number;
  feedback?: string;
}

export function SimulationVoiceCall({
  scenarioType,
  difficultyLevel,
  onEnd,
  onBack,
}: SimulationVoiceCallProps) {
  const [callId, setCallId] = useState<string | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<VoiceCallMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoRestartRef = useRef(false);

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

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // Arabic Saudi

    recognition.addEventListener('start', () => {
      console.log('[VoiceCall] Speech recognition started');
      setIsListening(true);
    });

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
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
        console.log('[VoiceCall] Final transcript:', finalTranscript);
        setInterimTranscript('');
        sendMessage(finalTranscript.trim());
      }
    });

    recognition.addEventListener('error', (event: { error: string }) => {
      console.error('[VoiceCall] Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    });

    recognition.addEventListener('end', () => {
      console.log('[VoiceCall] Speech recognition ended');
      setIsListening(false);
      // Auto-restart if we should be listening
      if (autoRestartRef.current && status === 'active') {
        setTimeout(() => {
          if (autoRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('[VoiceCall] Could not restart recognition');
            }
          }
        }, 100);
      }
    });

    return recognition;
  }, [status]);

  // Play audio from base64
  const playAudio = useCallback(async (base64Audio: string) => {
    return new Promise<void>((resolve) => {
      setIsSpeaking(true);
      setStatus('speaking');

      // Stop listening while AI speaks
      if (recognitionRef.current && isListening) {
        autoRestartRef.current = true;
        recognitionRef.current.stop();
      }

      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setStatus('active');
        // Resume listening after AI finishes speaking
        if (autoRestartRef.current && recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.log('[VoiceCall] Could not resume listening');
            }
          }, 300);
        }
        resolve();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setStatus('active');
        resolve();
      };

      audio.play().catch((e) => {
        console.error('[VoiceCall] Audio playback error:', e);
        setIsSpeaking(false);
        setStatus('active');
        resolve();
      });
    });
  }, [isListening]);

  // Start call
  const startCall = async () => {
    setStatus('connecting');
    setError(null);
    setElapsedTime(0);

    try {
      const response = await voiceCallApi.startCall({
        scenarioType,
        language: 'ar',
      });

      setCallId(response.callId);
      setMessages([{ role: 'assistant', content: response.greeting }]);
      setStatus('active');

      // Play greeting audio
      if (response.greetingAudioBase64) {
        await playAudio(response.greetingAudioBase64);
      }

      // Initialize and start speech recognition
      if (!recognitionRef.current) {
        recognitionRef.current = initSpeechRecognition();
      }
      if (recognitionRef.current && !useTextInput) {
        autoRestartRef.current = true;
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('[VoiceCall] Recognition already started');
        }
      }
    } catch (err) {
      console.error('[VoiceCall] Error starting call:', err);
      setError('Failed to start call. Please try again.');
      setStatus('idle');
    }
  };

  // Send message
  const sendMessage = async (message: string) => {
    if (!callId || !message.trim() || status === 'processing' || status === 'speaking') {
      return;
    }

    // Stop listening while processing
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    setStatus('processing');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);

    try {
      const response = await voiceCallApi.sendMessage({
        callId,
        message,
        includeAudio: true,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response.aiResponse }]);

      // Play response audio
      if (response.audioBase64) {
        await playAudio(response.audioBase64);
      } else {
        setStatus('active');
        // Resume listening if no audio
        if (autoRestartRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('[VoiceCall] Recognition already started');
          }
        }
      }
    } catch (err) {
      console.error('[VoiceCall] Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setStatus('active');
    }
  };

  // End call
  const endCall = async () => {
    if (!callId) return;

    autoRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setStatus('processing');

    try {
      const response = await voiceCallApi.endCall({
        callId,
        endReason: 'completed',
      });

      setCallSummary(response);
      setStatus('ended');
    } catch (err) {
      console.error('[VoiceCall] Error ending call:', err);
      setError('Failed to end call properly.');
      setStatus('ended');
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition();
    }

    if (isListening) {
      autoRestartRef.current = false;
      recognitionRef.current?.stop();
    } else {
      autoRestartRef.current = true;
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.log('[VoiceCall] Recognition already running');
      }
    }
  };

  // Send text message
  const handleTextSend = () => {
    if (textInput.trim()) {
      sendMessage(textInput.trim());
      setTextInput('');
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      autoRestartRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Call Summary View
  if (status === 'ended' && callSummary) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-foreground">Call Completed!</CardTitle>
          <p className="text-muted-foreground">
            Duration: {formatTime(callSummary.durationSeconds)} | {callSummary.totalMessages} messages
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-card rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Conversation Summary
            </h3>
            <p className="text-muted-foreground whitespace-pre-line">{callSummary.summary}</p>
          </div>

          {callSummary.feedback && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Performance Feedback
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{callSummary.feedback}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scenarios
            </Button>
            <Button onClick={onEnd}>
              View Full Report
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
          <CardTitle className="text-2xl text-foreground">Voice Call Simulation</CardTitle>
          <p className="text-muted-foreground">
            Practice with an AI client speaking Arabic Saudi dialect
          </p>
          <Badge className="mt-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            {scenarioType.replace(/_/g, ' ')} - {difficultyLevel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground text-center">
              The AI client will speak to you in Arabic (Saudi dialect).
              Speak naturally and the system will understand you.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={startCall}
              className="px-8"
            >
              <Phone className="h-5 w-5 mr-2" />
              Start Call
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
          <p className="text-lg text-foreground">Connecting...</p>
          <p className="text-sm text-muted-foreground">Setting up your voice call</p>
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
                'w-12 h-12 rounded-full flex items-center justify-center',
                isSpeaking ? 'bg-white/30 animate-pulse' : 'bg-white/20'
              )}
            >
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">AI Client (Saudi)</p>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Clock className="h-3 w-3" />
                {formatTime(elapsedTime)}
                {isSpeaking && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                    <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                    Speaking
                  </Badge>
                )}
                {isListening && (
                  <Badge variant="secondary" className="ml-2 bg-rose-500/80 text-white border-0">
                    <Mic className="h-3 w-3 mr-1 animate-pulse" />
                    Listening
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
            End Call
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

          {/* Processing indicator */}
          {status === 'processing' && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
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

      {/* Input Area */}
      <div className="bg-background border-t border-border p-4">
        {error && (
          <div className="mb-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          {/* Voice/Text Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setUseTextInput(!useTextInput)}
            className="flex-shrink-0"
            title={useTextInput ? 'Switch to voice input' : 'Switch to text input'}
          >
            {useTextInput ? <Mic className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          </Button>

          {!useTextInput ? (
            // Voice Input
            <div className="flex-1 flex flex-col items-center justify-center py-2">
              <Button
                size="lg"
                variant={isListening ? 'destructive' : 'default'}
                className={cn('rounded-full w-16 h-16 p-0', isListening && 'animate-pulse')}
                onClick={toggleListening}
                disabled={status === 'processing' || isSpeaking}
              >
                {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                {isListening ? 'Listening... speak now' : isSpeaking ? 'AI is speaking...' : 'Tap to speak'}
              </p>
            </div>
          ) : (
            // Text Input
            <>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSend();
                  }
                }}
                placeholder="Type your message... (Arabic preferred)"
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                disabled={status === 'processing' || isSpeaking}
                dir="rtl"
              />
              <Button
                onClick={handleTextSend}
                disabled={!textInput.trim() || status === 'processing' || isSpeaking}
                size="icon"
                className="flex-shrink-0"
              >
                {status === 'processing' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
