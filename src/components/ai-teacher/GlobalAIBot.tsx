'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Send, X, Maximize2, Loader2, ClipboardCheck, Mic, Volume2, VolumeX, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEACHERS, type TeacherName } from '@/config/teachers';
import { useTeacherStore } from '@/stores/teacher.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { aiTeacherApi } from '@/lib/api/ai-teacher.api';
import { TeacherAvatar } from './TeacherAvatar';

interface BotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioBase64?: string;
}

function getPageContext(pathname: string, t: any): string {
  if (pathname.includes('/dashboard') || pathname === '/') return t.floatingBot.pageContext.dashboard;
  if (pathname.includes('/courses')) return t.floatingBot.pageContext.courses;
  if (pathname.includes('/simulation')) return t.floatingBot.pageContext.simulations;
  if (pathname.includes('/reports')) return t.floatingBot.pageContext.reports;
  return t.floatingBot.pageContext.general;
}

// Session storage key for welcome played flag
const WELCOME_PLAYED_KEY = 'globalbot_welcome_played';

export function GlobalAIBot() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, isRTL } = useLanguage();
  const { activeTeacher, assignedTeacher } = useTeacherStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice features state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  const [isLoadingWelcome, setIsLoadingWelcome] = useState(false);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Determine which teacher to use
  const currentTeacher = activeTeacher || assignedTeacher || 'abdullah';
  const teacher = TEACHERS[currentTeacher as TeacherName] || TEACHERS.abdullah;

  // Hide on specific pages
  const hiddenPaths = ['/ai-teacher', '/assessment'];
  const shouldHide = hiddenPaths.some(p => pathname.includes(p));

  // Check if assessment is complete (has assigned teacher)
  const hasCompletedAssessment = assignedTeacher !== null;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Play welcome audio on first open
  useEffect(() => {
    if (isOpen && hasCompletedAssessment && !welcomePlayed && messages.length === 0) {
      // Check session storage
      const played = sessionStorage.getItem(`${WELCOME_PLAYED_KEY}_${currentTeacher}`);
      if (played) {
        setWelcomePlayed(true);
        return;
      }

      const playWelcome = async () => {
        setIsLoadingWelcome(true);
        try {
          const result = await aiTeacherApi.getWelcomeAudio(currentTeacher, language);

          // Add welcome message to chat
          const welcomeMsg: BotMessage = {
            id: `welcome-${Date.now()}`,
            role: 'assistant',
            content: result.message,
            timestamp: new Date(),
            audioBase64: result.audio,
          };
          setMessages([welcomeMsg]);

          // Play audio
          if (result.audio) {
            const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
            currentAudioRef.current = audio;
            setPlayingMessageId(welcomeMsg.id);

            audio.onended = () => {
              setPlayingMessageId(null);
              currentAudioRef.current = null;
            };

            audio.play().catch(() => {
              setPlayingMessageId(null);
            });
          }

          // Mark as played
          sessionStorage.setItem(`${WELCOME_PLAYED_KEY}_${currentTeacher}`, 'true');
          setWelcomePlayed(true);
        } catch (error) {
          console.error('Failed to load welcome audio:', error);
          // Show text-only welcome
          const fallbackMsg: BotMessage = {
            id: `welcome-${Date.now()}`,
            role: 'assistant',
            content: language === 'ar'
              ? `أهلاً وسهلاً! أنا ${teacher.displayName.ar}، كيف أقدر أساعدك اليوم؟`
              : `Welcome! I'm ${teacher.displayName.en}, how can I help you today?`,
            timestamp: new Date(),
          };
          setMessages([fallbackMsg]);
          setWelcomePlayed(true);
        } finally {
          setIsLoadingWelcome(false);
        }
      };

      playWelcome();
    }
  }, [isOpen, hasCompletedAssessment, welcomePlayed, currentTeacher, language, messages.length, teacher.displayName]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: BotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiTeacherApi.sendMessage(trimmed, undefined, undefined, currentTeacher);

      // Get audio for response
      let audioBase64: string | undefined;
      if (response.message.length < 500) {
        try {
          const ttsResult = await aiTeacherApi.textToSpeech(response.message, language, currentTeacher);
          audioBase64 = ttsResult.audio;
        } catch {
          // TTS failed, continue without audio
        }
      }

      const assistantMsg: BotMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        audioBase64,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: BotMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: language === 'ar' ? 'عذراً، حدث خطأ. حاول مرة أخرى.' : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentTeacher, language]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        // Transcribe
        setIsTranscribing(true);
        try {
          const result = await aiTeacherApi.speechToText(audioBlob, language);
          if (result.text) {
            setInput(prev => prev + (prev ? ' ' : '') + result.text);
          }
        } catch (error) {
          console.error('Transcription failed:', error);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Audio playback handlers
  const playMessageAudio = (message: BotMessage) => {
    if (!message.audioBase64) return;

    // Stop current audio if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;

      // If clicking same message, just stop
      if (playingMessageId === message.id) {
        setPlayingMessageId(null);
        return;
      }
    }

    const audio = new Audio(`data:audio/mpeg;base64,${message.audioBase64}`);
    currentAudioRef.current = audio;
    setPlayingMessageId(message.id);

    audio.onended = () => {
      setPlayingMessageId(null);
      currentAudioRef.current = null;
    };

    audio.play().catch(() => {
      setPlayingMessageId(null);
    });
  };

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingMessageId(null);
    }
  };

  if (shouldHide) return null;

  // If no assessment completed, show "assessment required" bot
  if (!hasCompletedAssessment) {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 z-50 w-14 h-14 rounded-full shadow-lg',
            'bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center',
            'hover:scale-110 transition-transform duration-200',
            'ring-4 ring-white/20',
            isRTL ? 'left-6' : 'right-6'
          )}
          aria-label={language === 'ar' ? 'تحديد المستوى مطلوب' : 'Assessment Required'}
        >
          <ClipboardCheck className="h-6 w-6" />
          {/* Pulse */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 animate-ping opacity-20" />
        </button>
      );
    }

    // Expanded assessment required panel
    return (
      <div className={cn(
        'fixed bottom-6 z-50',
        'w-[320px] bg-card border border-border rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        isRTL ? 'left-6' : 'right-6'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">
              {language === 'ar' ? 'مرحباً بك!' : 'Welcome!'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <ClipboardCheck className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {language === 'ar' ? 'لنبدأ رحلتك التدريبية!' : "Let's Start Your Training Journey!"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ar'
                ? 'قبل أن نبدأ، نحتاج تحديد مستواك لنختار لك المعلم الأنسب. الاختبار سريع ويساعدنا نفهم نقاط قوتك.'
                : "Before we begin, we need to assess your level to match you with the right teacher. The assessment is quick and helps us understand your strengths."}
            </p>
          </div>

          <Button
            onClick={() => router.push('/assessment')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {language === 'ar' ? 'ابدأ تحديد المستوى' : 'Start Assessment'}
          </Button>
        </div>
      </div>
    );
  }

  // Collapsed state — floating button (assessment completed)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 z-50 w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-br text-white flex items-center justify-center',
          'hover:scale-110 transition-transform duration-200',
          'ring-4 ring-white/20',
          teacher.gradient,
          isRTL ? 'left-6' : 'right-6'
        )}
        aria-label={t.floatingBot.quickChat}
      >
        <span className="text-xl font-bold">{teacher.initial[language]}</span>
        {/* Pulse */}
        <span className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br animate-ping opacity-20',
          teacher.gradient
        )} />
      </button>
    );
  }

  // Expanded state — chat panel
  return (
    <div className={cn(
      'fixed bottom-6 z-50',
      'w-[400px] max-h-[520px] bg-card border border-border rounded-2xl shadow-2xl',
      'flex flex-col overflow-hidden',
      isRTL ? 'left-6' : 'right-6',
      // Mobile: full width
      'max-sm:w-[calc(100%-3rem)] max-sm:left-6 max-sm:right-6'
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3 border-b',
        'bg-gradient-to-r text-white',
        teacher.gradient
      )}>
        <div className="flex items-center gap-3">
          <TeacherAvatar teacherName={currentTeacher as TeacherName} size="md" />
          <div>
            <p className="font-semibold">{teacher.displayName[language]}</p>
            <p className="text-xs opacity-80">{teacher.shortDescription[language]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => {
              stopAudio();
              setIsOpen(false);
              router.push('/ai-teacher');
            }}
            title={t.teacher.openFullChat}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => {
              stopAudio();
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Banner */}
      <div className="px-3 py-2 bg-muted/50 text-xs text-muted-foreground border-b">
        {getPageContext(pathname, t)}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[220px] max-h-[320px]">
        {isLoadingWelcome && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          </div>
        )}
        {!isLoadingWelcome && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {t.floatingBot.greeting}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex flex-col gap-1',
              msg.role === 'user'
                ? (isRTL ? 'items-start' : 'items-end')
                : (isRTL ? 'items-end' : 'items-start')
            )}
          >
            <div className={cn(
              'max-w-[85%] px-3 py-2 rounded-xl text-sm',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            )}>
              <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
            </div>
            {/* Audio button for assistant messages */}
            {msg.role === 'assistant' && msg.audioBase64 && (
              <button
                onClick={() => playMessageAudio(msg)}
                className={cn(
                  'flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors',
                  playingMessageId === msg.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {playingMessageId === msg.id ? (
                  <>
                    <VolumeX className="h-3 w-3" />
                    <span>{language === 'ar' ? 'إيقاف' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3" />
                    <span>{language === 'ar' ? 'استمع' : 'Listen'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className={cn('flex', isRTL ? 'justify-end' : 'justify-start')}>
            <div className="bg-muted px-3 py-2 rounded-xl text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t.floatingBot.thinking}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t bg-background">
        <div className="flex items-center gap-2">
          {/* Voice Recording Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isTranscribing}
            className={cn(
              'h-9 w-9 rounded-lg shrink-0',
              isRecording && 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            )}
            title={isRecording
              ? (language === 'ar' ? 'إيقاف التسجيل' : 'Stop recording')
              : (language === 'ar' ? 'تسجيل صوتي' : 'Voice recording')
            }
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isTranscribing
              ? (language === 'ar' ? 'جاري تحويل الصوت...' : 'Transcribing...')
              : t.floatingBot.askAnything
            }
            className={cn(
              'flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'placeholder:text-muted-foreground',
              isRTL && 'text-right'
            )}
            disabled={isLoading || isTranscribing}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isTranscribing}
            className={cn('h-9 w-9 rounded-lg bg-gradient-to-br shrink-0', teacher.gradient)}
          >
            <Send className={cn('h-4 w-4', isRTL && 'rotate-180')} />
          </Button>
        </div>
      </div>
    </div>
  );
}
