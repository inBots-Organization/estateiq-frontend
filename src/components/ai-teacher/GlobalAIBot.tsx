'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Send, X, Maximize2, Loader2, ClipboardCheck, Mic, Volume2, VolumeX, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEACHERS, type TeacherName } from '@/config/teachers';
import { useTeacherStore } from '@/stores/teacher.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { aiTeacherApi } from '@/lib/api/ai-teacher.api';
import { TalkingAvatar } from './TalkingAvatar';

interface BotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioBase64?: string;
}

// Detailed page context for smart guidance
interface PageContextInfo {
  key: string;
  displayText: string;
  aiPrompt: string; // What the bot should know about this page
}

function getDetailedPageContext(pathname: string, language: 'ar' | 'en'): PageContextInfo {
  const isAr = language === 'ar';

  if (pathname.includes('/dashboard') || pathname === '/') {
    return {
      key: 'dashboard',
      displayText: isAr ? 'أنت في لوحة التحكم — اسألني عن تقدمك!' : "You're on the Dashboard — ask me about your progress!",
      aiPrompt: isAr
        ? 'المستخدم في لوحة التحكم الرئيسية. هنا يشوف ملخص تقدمه، نتائجه، وإحصائياته. ساعده يفهم أرقامه ووجهه للخطوة الجاية في رحلته التعليمية.'
        : 'User is on the main dashboard. They can see their progress summary, scores, and stats. Help them understand their numbers and guide them to the next step in their learning journey.'
    };
  }

  if (pathname.includes('/courses')) {
    const isCoursePage = pathname.match(/\/courses\/[^/]+$/);
    const isLessonPage = pathname.includes('/lessons/');

    if (isLessonPage) {
      return {
        key: 'lesson',
        displayText: isAr ? 'أنت في درس — اسألني عن أي شي ما فهمته!' : "You're in a lesson — ask me about anything you didn't understand!",
        aiPrompt: isAr
          ? 'المستخدم يشاهد درس. ساعده يفهم المحتوى، اشرحله المفاهيم الصعبة، وأعطيه أمثلة عملية من السوق السعودي.'
          : 'User is watching a lesson. Help them understand the content, explain difficult concepts, and give practical examples from the Saudi market.'
      };
    }

    if (isCoursePage) {
      return {
        key: 'course',
        displayText: isAr ? 'أنت في دورة تدريبية — أقدر أساعدك تختار الدرس المناسب!' : "You're in a course — I can help you choose the right lesson!",
        aiPrompt: isAr
          ? 'المستخدم يتصفح دورة تدريبية. ساعده يفهم محتوى الدورة ورتبله الدروس حسب مستواه وأهدافه.'
          : 'User is browsing a course. Help them understand the course content and organize lessons based on their level and goals.'
      };
    }

    return {
      key: 'courses',
      displayText: isAr ? 'أنت في الدورات — خليني أرشحلك الأنسب لمستواك!' : "You're in Courses — let me recommend the best ones for your level!",
      aiPrompt: isAr
        ? 'المستخدم يتصفح قائمة الدورات. ساعده يختار الدورة المناسبة لمستواه ونقاط ضعفه. رشحله دورات محددة بناءً على احتياجاته.'
        : 'User is browsing the courses list. Help them choose the right course for their level and weaknesses. Recommend specific courses based on their needs.'
    };
  }

  if (pathname.includes('/simulation')) {
    return {
      key: 'simulation',
      displayText: isAr ? 'أنت في المحاكاة — جاهز تتدرب على مواقف حقيقية!' : "You're in Simulation — ready to practice real scenarios!",
      aiPrompt: isAr
        ? 'المستخدم في قسم المحاكاة. هنا يتدرب على محادثات مع عملاء افتراضيين. ساعده يستعد للسيناريو وأعطيه نصائح قبل يبدأ.'
        : 'User is in the simulation section. Here they practice conversations with virtual clients. Help them prepare for the scenario and give tips before starting.'
    };
  }

  if (pathname.includes('/voice-training')) {
    return {
      key: 'voice',
      displayText: isAr ? 'أنت في التدريب الصوتي — تدرب على المكالمات الحقيقية!' : "You're in Voice Training — practice real phone calls!",
      aiPrompt: isAr
        ? 'المستخدم في التدريب الصوتي. هنا يتدرب على مكالمات هاتفية مع عملاء. ساعده يحسن نبرة صوته وأسلوبه في الإقناع.'
        : 'User is in voice training. Here they practice phone calls with clients. Help them improve their tone and persuasion style.'
    };
  }

  if (pathname.includes('/reports')) {
    return {
      key: 'reports',
      displayText: isAr ? 'أنت في التقارير — خليني أحللك أداءك!' : "You're in Reports — let me analyze your performance!",
      aiPrompt: isAr
        ? 'المستخدم يشاهد تقاريره. حلل أداءه، حدد نقاط القوة والضعف، واقترح خطة تحسين واضحة.'
        : 'User is viewing their reports. Analyze their performance, identify strengths and weaknesses, and suggest a clear improvement plan.'
    };
  }

  if (pathname.includes('/quizzes')) {
    return {
      key: 'quizzes',
      displayText: isAr ? 'أنت في الاختبارات — اختبر معلوماتك!' : "You're in Quizzes — test your knowledge!",
      aiPrompt: isAr
        ? 'المستخدم في قسم الاختبارات. ساعده يستعد للاختبار وراجع معاه المواضيع المهمة.'
        : 'User is in the quizzes section. Help them prepare for the quiz and review important topics.'
    };
  }

  if (pathname.includes('/flashcards')) {
    return {
      key: 'flashcards',
      displayText: isAr ? 'أنت في البطاقات التعليمية — راجع معلوماتك بطريقة ذكية!' : "You're in Flashcards — review your knowledge smartly!",
      aiPrompt: isAr
        ? 'المستخدم في قسم البطاقات التعليمية. ساعده يراجع المفاهيم المهمة ويحفظها. اشرحله طريقة استخدام البطاقات بفعالية.'
        : 'User is in the flashcards section. Help them review and memorize important concepts. Explain how to use flashcards effectively.'
    };
  }

  return {
    key: 'general',
    displayText: isAr ? 'كيف أقدر أساعدك اليوم؟' : 'How can I help you today?',
    aiPrompt: isAr
      ? 'المستخدم في صفحة عامة. كن مستعداً لمساعدته في أي سؤال عن العقارات أو استخدام المنصة.'
      : 'User is on a general page. Be ready to help with any question about real estate or using the platform.'
  };
}

function getPageContext(pathname: string, t: any): string {
  if (pathname.includes('/dashboard') || pathname === '/') return t.floatingBot.pageContext.dashboard;
  if (pathname.includes('/courses')) return t.floatingBot.pageContext.courses;
  if (pathname.includes('/simulation')) return t.floatingBot.pageContext.simulations;
  if (pathname.includes('/reports')) return t.floatingBot.pageContext.reports;
  return t.floatingBot.pageContext.general;
}

// Session storage keys
const WELCOME_PLAYED_KEY = 'globalbot_welcome_played';
const AUTO_OPENED_KEY = 'globalbot_auto_opened';

export function GlobalAIBot() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, isRTL } = useLanguage();
  const { activeTeacher, assignedTeacher } = useTeacherStore();
  const { user } = useAuthStore();

  // Start closed, then check if should auto-open on client
  const [isOpen, setIsOpen] = useState(false);
  const [hasCheckedAutoOpen, setHasCheckedAutoOpen] = useState(false);
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
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true); // Auto-play responses
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]); // Queue for auto-playing audio

  // Determine which teacher to use
  const currentTeacher = activeTeacher || assignedTeacher || 'abdullah';
  const teacher = TEACHERS[currentTeacher as TeacherName] || TEACHERS.abdullah;

  // Get detailed page context
  const pageContext = getDetailedPageContext(pathname, language);

  // Auto-play audio helper
  const autoPlayAudio = useCallback((audioBase64: string, messageId: string) => {
    if (!autoPlayEnabled) return;

    // Stop any current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
    currentAudioRef.current = audio;
    setPlayingMessageId(messageId);

    audio.onended = () => {
      setPlayingMessageId(null);
      currentAudioRef.current = null;
    };

    audio.onerror = () => {
      setPlayingMessageId(null);
      currentAudioRef.current = null;
    };

    // Play with user interaction fallback
    audio.play().catch(() => {
      // Autoplay blocked - will need user interaction
      setPlayingMessageId(null);
      setAutoPlayEnabled(false); // Disable auto-play since browser blocked it
    });
  }, [autoPlayEnabled]);

  // Hide on specific pages
  const hiddenPaths = ['/ai-teacher', '/assessment'];
  const shouldHideOnPath = hiddenPaths.some(p => pathname.includes(p));

  // Hide for admin roles - bot is only for trainees
  const adminRoles = ['saas_super_admin', 'org_admin', 'trainer'];
  const isAdminUser = user?.role && adminRoles.includes(user.role);

  // Combined hide condition
  const shouldHide = shouldHideOnPath || isAdminUser;

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

  // Auto-open on first visit (client-side only)
  useEffect(() => {
    if (!hasCheckedAutoOpen && hasCompletedAssessment) {
      const wasAutoOpened = sessionStorage.getItem(AUTO_OPENED_KEY);
      if (!wasAutoOpened) {
        // First visit - auto open the bot
        setIsOpen(true);
        sessionStorage.setItem(AUTO_OPENED_KEY, 'true');
      }
      setHasCheckedAutoOpen(true);
    }
  }, [hasCheckedAutoOpen, hasCompletedAssessment]);

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

          // Play audio automatically
          if (result.audio) {
            const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
            currentAudioRef.current = audio;
            setPlayingMessageId(welcomeMsg.id);

            audio.onended = () => {
              setPlayingMessageId(null);
              currentAudioRef.current = null;
            };

            // Try to play - may be blocked by browser autoplay policy
            audio.play().catch((e) => {
              console.log('Autoplay blocked, user interaction required:', e);
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

  // Detect page changes and offer contextual help
  useEffect(() => {
    if (!isOpen || !hasCompletedAssessment || !welcomePlayed) return;
    if (previousPathname === pathname) return;
    if (previousPathname === null) {
      // First load, just set the pathname
      setPreviousPathname(pathname);
      return;
    }

    // Page changed! Offer contextual guidance
    setPreviousPathname(pathname);
    const newPageContext = getDetailedPageContext(pathname, language);

    // Don't add guidance for every tiny navigation
    if (newPageContext.key === 'general') return;

    // Add a contextual message from the teacher
    const guidanceMsg: BotMessage = {
      id: `guidance-${Date.now()}`,
      role: 'assistant',
      content: language === 'ar'
        ? `📍 ${newPageContext.displayText}\n\nهل تحتاج مساعدة في هذه الصفحة؟`
        : `📍 ${newPageContext.displayText}\n\nNeed help with this page?`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, guidanceMsg]);

    // Get audio for the guidance (shorter version)
    const shortGuidance = language === 'ar' ? newPageContext.displayText : newPageContext.displayText;
    aiTeacherApi.textToSpeech(shortGuidance, language, currentTeacher)
      .then(result => {
        // Update the message with audio
        setMessages(prev => prev.map(msg =>
          msg.id === guidanceMsg.id ? { ...msg, audioBase64: result.audio } : msg
        ));
        // Auto-play the guidance
        autoPlayAudio(result.audio, guidanceMsg.id);
      })
      .catch(() => {
        // TTS failed, no audio
      });
  }, [pathname, previousPathname, isOpen, hasCompletedAssessment, welcomePlayed, language, currentTeacher, autoPlayAudio]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Re-enable auto-play on user interaction (browser allows it after user interaction)
    setAutoPlayEnabled(true);

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
      // Add page context to the message for smarter responses
      const contextualMessage = `[سياق الصفحة: ${pageContext.aiPrompt}]\n\nسؤال المستخدم: ${trimmed}`;

      const response = await aiTeacherApi.sendMessage(contextualMessage, undefined, undefined, currentTeacher);

      const assistantMsgId = `assistant-${Date.now()}`;

      // Get audio for response (increased limit for better experience)
      let audioBase64: string | undefined;
      if (response.message.length < 800) {
        try {
          const ttsResult = await aiTeacherApi.textToSpeech(response.message, language, currentTeacher);
          audioBase64 = ttsResult.audio;
        } catch {
          // TTS failed, continue without audio
        }
      }

      const assistantMsg: BotMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        audioBase64,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Auto-play the response audio
      if (audioBase64) {
        autoPlayAudio(audioBase64, assistantMsgId);
      }
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
  }, [input, isLoading, currentTeacher, language, pageContext.aiPrompt, autoPlayAudio]);

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

  // If no assessment completed, show welcoming onboarding bot
  if (!hasCompletedAssessment) {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 z-50 w-16 h-16 rounded-full shadow-xl',
            'bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600 text-white flex items-center justify-center',
            'hover:scale-110 transition-all duration-300',
            'ring-4 ring-white/30',
            isRTL ? 'left-6' : 'right-6'
          )}
          aria-label={language === 'ar' ? 'مرحباً!' : 'Welcome!'}
        >
          {/* Welcoming Avatar Emoji */}
          <span className="text-3xl">👋</span>
          {/* Pulse */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400 to-green-600 animate-ping opacity-25" />
          {/* Sparkle effect */}
          <span className="absolute -top-1 -right-1 text-xl animate-bounce">✨</span>
        </button>
      );
    }

    // Expanded welcoming onboarding panel
    return (
      <div className={cn(
        'fixed bottom-6 z-50',
        'w-[360px] bg-card border border-border rounded-3xl shadow-2xl',
        'flex flex-col overflow-hidden',
        isRTL ? 'left-6' : 'right-6'
      )}>
        {/* Header with friendly gradient */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white">
          <div className="flex items-center gap-3">
            {/* Friendly welcoming avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl animate-pulse">
                🎉
              </div>
              <span className="absolute -bottom-1 -right-1 text-lg">👋</span>
            </div>
            <div>
              <span className="font-bold text-lg block">
                {language === 'ar' ? 'أهلاً وسهلاً!' : 'Welcome!'}
              </span>
              <span className="text-xs text-white/80">
                {language === 'ar' ? 'مرشدك للبداية' : 'Your Onboarding Guide'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content with welcoming message */}
        <div className="p-5 space-y-5">
          {/* Welcoming Avatar Section */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {/* Animated welcoming character */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-100 via-emerald-100 to-green-100 flex items-center justify-center shadow-lg">
                <span className="text-5xl animate-bounce">🧑‍🏫</span>
              </div>
              {/* Floating elements */}
              <span className="absolute top-0 right-0 text-2xl animate-pulse">⭐</span>
              <span className="absolute bottom-0 left-0 text-xl animate-bounce delay-100">🎯</span>
            </div>

            <h3 className="font-bold text-xl text-foreground mb-2">
              {language === 'ar' ? 'يا هلا والله! 🌟' : 'Hello There! 🌟'}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {language === 'ar'
                ? 'أنا سعيد إنك معانا! قبل ما نبدأ رحلتك في عالم العقارات، خلينا نتعرف على مستواك عشان نختارلك المعلم المناسب.'
                : "I'm so happy you're here! Before we start your real estate journey, let's discover your level so we can match you with the perfect teacher."}
            </p>

            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 text-sm">
              <div className="flex items-center gap-2 text-teal-700 font-medium mb-1">
                <span>💡</span>
                <span>{language === 'ar' ? 'الاختبار بسيط!' : 'Quick Assessment!'}</span>
              </div>
              <p className="text-teal-600/80 text-xs">
                {language === 'ar'
                  ? '5 دقائق فقط وبنعرف نقاط قوتك وضعفك'
                  : 'Just 5 minutes to discover your strengths and areas to improve'}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            {[
              { emoji: '🎯', ar: 'معلم مخصص لمستواك', en: 'Personalized teacher for your level' },
              { emoji: '📈', ar: 'خطة تدريب شخصية', en: 'Custom training plan' },
              { emoji: '🏆', ar: 'تتبع تقدمك يومياً', en: 'Track your daily progress' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-lg">{benefit.emoji}</span>
                <span>{language === 'ar' ? benefit.ar : benefit.en}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => router.push('/assessment')}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 hover:from-teal-600 hover:via-emerald-600 hover:to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="mr-2">🚀</span>
            {language === 'ar' ? 'يلا نبدأ!' : "Let's Start!"}
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
      {/* Header with Talking Avatar */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3 border-b',
        'bg-gradient-to-r text-white',
        teacher.gradient
      )}>
        <div className="flex items-center gap-3">
          <TalkingAvatar
            teacherName={currentTeacher as TeacherName}
            size="lg"
            isSpeaking={playingMessageId !== null}
            audioElement={currentAudioRef.current}
          />
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

      {/* Context Banner - Smart guidance */}
      <div className="px-3 py-2 bg-muted/50 text-xs text-muted-foreground border-b flex items-center gap-2">
        <span className="text-base">📍</span>
        <span>{pageContext.displayText}</span>
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
