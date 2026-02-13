'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  GraduationCap,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Volume2,
  VolumeX,
  Sparkles,
  Target,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Settings,
  RefreshCw,
  X,
  FileText,
  Loader2,
  ChevronDown,
  Lightbulb,
  ClipboardList,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  Circle,
  CheckCircle,
  Award,
  Zap,
  Brain,
  Video,
  Music,
  ImageIcon,
  PenTool,
  Flame,
  Star,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLessonContext, LessonContext } from '@/contexts/LessonContext';
import { cn } from '@/lib/utils';
import { useAudioManager } from '@/lib/audio-manager';
import {
  aiTeacherApi,
  avContentApi,
  audioSummaryApi,
  WelcomeResponse,
  FileAttachment,
  TraineeProfile,
  AVContent,
} from '@/lib/api/ai-teacher.api';
import { GenerateAVButtons, AVPlayerModal, TeacherAvatar } from '@/components/ai-teacher';
import { useTeacherStore } from '@/stores/teacher.store';
import { traineeApi } from '@/lib/api/trainee.api';
import { diagnosticApi } from '@/lib/api/diagnostic.api';
import type { SkillReport } from '@/types/diagnostic';
import { courses, getCourseById } from '@/data/courses';
import Link from 'next/link';

// Helper to render message content with clickable links and proper formatting
function renderMessageContent(content: string, isRTL: boolean): React.ReactNode {
  // Remove markdown bold markers (**)
  let cleaned = content.replace(/\*\*/g, '');

  // Split by URLs and links
  // Match markdown links [text](url) or plain URLs
  const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = urlRegex.exec(cleaned)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const textBefore = cleaned.slice(lastIndex, match.index);
      // Split by newlines to preserve formatting
      textBefore.split('\n').forEach((line, i, arr) => {
        if (line) parts.push(<span key={`text-${keyIndex++}`}>{line}</span>);
        if (i < arr.length - 1) parts.push(<br key={`br-${keyIndex++}`} />);
      });
    }

    // Add the link
    const linkText = match[1] || match[3] || match[0];
    const linkUrl = match[2] || match[3] || match[0];

    // Check if it's an internal link
    const isInternal = linkUrl.includes('inlearn.macsoft.ai') || linkUrl.includes('estateiq-app.vercel.app') || linkUrl.includes('localhost');

    if (isInternal) {
      // Extract path from URL
      try {
        const urlObj = new URL(linkUrl);
        parts.push(
          <Link
            key={`link-${keyIndex++}`}
            href={urlObj.pathname}
            className="inline-flex items-center gap-1 px-3 py-1.5 my-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors border border-primary/20"
          >
            <BookOpen className="h-4 w-4" />
            {isRTL ? 'افتح الدورة' : 'Open Course'}
          </Link>
        );
      } catch {
        parts.push(
          <a
            key={`link-${keyIndex++}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors"
          >
            🔗 {linkText}
          </a>
        );
      }
    } else {
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors"
        >
          🔗 {linkText}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < cleaned.length) {
    const remaining = cleaned.slice(lastIndex);
    remaining.split('\n').forEach((line, i, arr) => {
      if (line) parts.push(<span key={`text-${keyIndex++}`}>{line}</span>);
      if (i < arr.length - 1) parts.push(<br key={`br-${keyIndex++}`} />);
    });
  }

  return parts.length > 0 ? parts : cleaned;
}

// Storage key for last studied lesson
const LAST_LESSON_KEY = 'ai-teacher-last-lesson';
const ENTRY_SOURCE_KEY = 'ai-teacher-entry-source';

interface LastLessonData {
  lessonId: string;
  lessonName: string;
  lessonNameAr: string;
  courseId: string;
  courseName: string;
  courseNameAr: string;
  timestamp: number;
}

// Save last studied lesson to localStorage
const saveLastLesson = (lessonContext: LessonContext) => {
  const data: LastLessonData = {
    lessonId: lessonContext.lessonId,
    lessonName: lessonContext.lessonName,
    lessonNameAr: lessonContext.lessonNameAr,
    courseId: lessonContext.courseId,
    courseName: lessonContext.courseName,
    courseNameAr: lessonContext.courseNameAr,
    timestamp: Date.now(),
  };
  localStorage.setItem(LAST_LESSON_KEY, JSON.stringify(data));
};

// Get last studied lesson from localStorage
const getLastLesson = (): LastLessonData | null => {
  try {
    const data = localStorage.getItem(LAST_LESSON_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Only return if less than 24 hours old
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch {}
  return null;
};

// Track entry source (sidebar or course page)
const setEntrySource = (source: 'sidebar' | 'course') => {
  sessionStorage.setItem(ENTRY_SOURCE_KEY, source);
};

const getEntrySource = (): 'sidebar' | 'course' | null => {
  return sessionStorage.getItem(ENTRY_SOURCE_KEY) as 'sidebar' | 'course' | null;
};

// Message type for local state
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioBase64?: string;
  attachments?: FileAttachment[];
  isPlaying?: boolean;
  // AV Content reference for playable content in chat
  avContent?: {
    id: string;
    type: 'lecture' | 'summary';
    title: string;
    titleAr?: string;
    duration: number; // in seconds
  };
  // Simple audio summary (audio-only, no slides)
  audioSummary?: {
    title: string;
    text: string;
    audioBase64: string;
    durationSeconds: number;
  };
}

export default function AITeacherPage() {
  const { t, isRTL, language } = useLanguage();
  const { lessonContext, clearLessonContext, hasLessonContext } = useLessonContext();

  // Global Audio Manager (Singleton - prevents all audio overlap)
  const audioManager = useAudioManager();

  // State
  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [currentLessonContext, setCurrentLessonContext] = useState<LessonContext | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [lastLesson, setLastLesson] = useState<LastLessonData | null>(null);
  const [entrySource, setEntrySourceState] = useState<'sidebar' | 'course' | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{
    questions: Array<{
      id: string;
      question: string;
      type: 'multiple_choice' | 'true_false';
      options?: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number; percentage: number } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [welcome, setWelcome] = useState<WelcomeResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWelcome, setIsLoadingWelcome] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  // Audio plays only when user clicks "Listen" button - no auto-play
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');

  // AV Content Generation State
  const [avContentId, setAVContentId] = useState<string | null>(null);
  const [showAVPlayer, setShowAVPlayer] = useState(false);
  const [isGeneratingAVContent, setIsGeneratingAVContent] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const initializationRef = useRef<boolean>(false);
  const hasPlayedInitialAudioRef = useRef<boolean>(false);

  // Setup audio manager events
  useEffect(() => {
    audioManager.setEvents({
      onStateChange: setAudioState,
      onError: (err) => console.error('[Audio Error]', err),
    });

    // Cleanup on unmount
    return () => {
      audioManager.stop();
    };
  }, [audioManager]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Play audio using global AudioManager (prevents all overlap)
  // Only called when user clicks "Listen" button
  const playAudio = useCallback((base64Audio: string, audioId?: string) => {
    audioManager.play(base64Audio, audioId);
  }, [audioManager]);

  // Stop any playing audio
  const stopAudio = useCallback(() => {
    audioManager.stop();
  }, [audioManager]);

  // Generate and play audio on demand
  const generateAndPlayAudio = useCallback(async (text: string) => {
    if (isGeneratingAudio) return;

    setIsGeneratingAudio(true);
    try {
      const lang = isRTL ? 'ar' : 'en';
      // Get the active teacher for persona-specific voice
      const activeTeacher = useTeacherStore.getState().activeTeacher || useTeacherStore.getState().assignedTeacher;
      const response = await aiTeacherApi.textToSpeech(text, lang as 'ar' | 'en', activeTeacher || undefined);
      if (response.audio) {
        // Use 'manual' in ID to bypass auto-play check
        audioManager.play(response.audio, `manual-${Date.now()}`);
      }
    } catch {
      // Audio generation failed - continue without audio
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [isRTL, audioManager, isGeneratingAudio]);

  // Generate lesson summary
  const generateLessonSummary = useCallback(async () => {
    if (!currentLessonContext || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    try {
      const lang = isRTL ? 'ar' : 'en';
      const summary = await aiTeacherApi.generateLessonSummary(currentLessonContext, lang as 'ar' | 'en');

      // Format the summary as a message
      const summaryMessage = isRTL
        ? `📚 **ملخص الدرس: ${currentLessonContext.lessonNameAr}**

${summary.summary}

**🎯 النقاط الرئيسية:**
${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

**💡 نصائح عملية:**
${summary.practicalTips.map((t, i) => `• ${t}`).join('\n')}

---
هل تريد اختبار قصير للتأكد من فهمك؟`
        : `📚 **Lesson Summary: ${currentLessonContext.lessonName}**

${summary.summary}

**🎯 Key Points:**
${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

**💡 Practical Tips:**
${summary.practicalTips.map((t, i) => `• ${t}`).join('\n')}

---
Would you like a quick quiz to test your understanding?`;

      const assistantMessage: Message = {
        id: `summary-${Date.now()}`,
        role: 'assistant',
        content: summaryMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) {
      // Extract detailed error message if available
      const errorDetails = err?.message || (typeof err === 'string' ? err : 'Unknown error');
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isRTL
          ? `عذراً، حدث خطأ أثناء إنشاء الملخص: ${errorDetails}. يرجى المحاولة مرة أخرى.`
          : `Sorry, an error occurred while generating the summary: ${errorDetails}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [currentLessonContext, isRTL, isGeneratingSummary]);

  // Generate mini quiz
  const generateMiniQuiz = useCallback(async () => {
    if (!currentLessonContext || isGeneratingQuiz) return;

    setIsGeneratingQuiz(true);
    setCurrentQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setCurrentQuestionIndex(0);

    try {
      const lang = isRTL ? 'ar' : 'en';
      const quiz = await aiTeacherApi.generateMiniQuiz(currentLessonContext, lang as 'ar' | 'en', 3);

      if (quiz.questions && quiz.questions.length > 0) {
        setCurrentQuiz(quiz);
        setShowQuizModal(true); // Open the modal instead of showing in sidebar

        // Add a message to indicate quiz started
        const quizIntro: Message = {
          id: `quiz-intro-${Date.now()}`,
          role: 'assistant',
          content: isRTL
            ? `📝 تم إنشاء اختبار قصير من ${quiz.questions.length} أسئلة. أجب في النافذة المنبثقة!`
            : `📝 Generated a quick quiz with ${quiz.questions.length} questions. Answer in the popup!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, quizIntro]);
      } else {
        throw new Error('No questions generated');
      }

    } catch (err: any) {
      const errorDetails = err?.message || (typeof err === 'string' ? err : 'Unknown error');
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isRTL
          ? `عذراً، حدث خطأ أثناء إنشاء الاختبار: ${errorDetails}. يرجى المحاولة مرة أخرى.`
          : `Sorry, an error occurred while generating the quiz: ${errorDetails}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, [currentLessonContext, isRTL, isGeneratingQuiz]);

  // Submit quiz answers
  const submitQuiz = useCallback(() => {
    if (!currentQuiz) return;

    setQuizSubmitted(true);

    // Calculate score
    let correct = 0;
    currentQuiz.questions.forEach((q) => {
      const userAnswer = quizAnswers[q.id];
      if (userAnswer === q.correctAnswer) correct++;
    });

    const percentage = Math.round((correct / currentQuiz.questions.length) * 100);
    setQuizScore({ correct, total: currentQuiz.questions.length, percentage });

    // Add result message to chat
    const resultMessage: Message = {
      id: `quiz-result-${Date.now()}`,
      role: 'assistant',
      content: isRTL
        ? `📊 **نتيجة الاختبار: ${percentage}%** (${correct}/${currentQuiz.questions.length})\n\n${percentage >= 70 ? '🎉 ممتاز! أداء رائع!' : percentage >= 50 ? '👍 جيد! استمر في التعلم.' : '💪 تحتاج مراجعة أكثر. لا تستسلم!'}`
        : `📊 **Quiz Result: ${percentage}%** (${correct}/${currentQuiz.questions.length})\n\n${percentage >= 70 ? '🎉 Excellent! Great performance!' : percentage >= 50 ? '👍 Good! Keep learning.' : '💪 Needs more review. Don\'t give up!'}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, resultMessage]);
  }, [currentQuiz, quizAnswers, isRTL]);

  // Close quiz modal and reset state
  const closeQuizModal = useCallback(() => {
    setShowQuizModal(false);
    // Don't clear quiz if submitted - let user review results
    if (!quizSubmitted) {
      setCurrentQuiz(null);
      setQuizAnswers({});
    }
  }, [quizSubmitted]);

  // Reset quiz to try again
  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setCurrentQuestionIndex(0);
  }, []);

  // Generate AV Lecture
  const handleGenerateAVLecture = useCallback(async () => {
    if (isGeneratingAVContent) return;

    setIsGeneratingAVContent(true);
    try {
      // Determine topic from lesson context or general
      const topic = currentLessonContext
        ? (isRTL ? currentLessonContext.lessonNameAr : currentLessonContext.lessonName)
        : (isRTL ? 'أساسيات السوق العقاري السعودي' : 'Saudi Real Estate Market Basics');

      const content = await avContentApi.generateLecture({
        topic,
        lessonContext: currentLessonContext?.lessonDescription,
        courseId: currentLessonContext?.courseId,
        duration: 10,
        language: isRTL ? 'ar' : 'en',
      });

      // Add message about lecture generation with playable content
      const lectureMessage: Message = {
        id: `av-lecture-${Date.now()}`,
        role: 'assistant',
        content: isRTL
          ? `🎬 تم إنشاء محاضرة فيديو: "${content.titleAr || content.title}"\n\nالمدة: ${Math.round(content.totalDuration / 60)} دقائق`
          : `🎬 Video lecture created: "${content.title}"\n\nDuration: ${Math.round(content.totalDuration / 60)} minutes`,
        timestamp: new Date(),
        avContent: {
          id: content.id,
          type: 'lecture',
          title: content.title,
          titleAr: content.titleAr,
          duration: content.totalDuration,
        },
      };
      setMessages((prev) => [...prev, lectureMessage]);

      // Automatically open the player
      setAVContentId(content.id);
      setShowAVPlayer(true);

    } catch (err: any) {
      const errorDetails = err?.message || 'Unknown error';
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isRTL
          ? `عذراً، حدث خطأ أثناء إنشاء المحاضرة: ${errorDetails}`
          : `Sorry, an error occurred while generating the lecture: ${errorDetails}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingAVContent(false);
    }
  }, [currentLessonContext, isRTL, isGeneratingAVContent]);

  // Generate Audio Summary (simple audio-only, displayed in chat)
  const handleGenerateAVSummary = useCallback(async () => {
    if (isGeneratingAVContent) return;

    setIsGeneratingAVContent(true);
    try {
      const topic = currentLessonContext
        ? (isRTL ? currentLessonContext.lessonNameAr : currentLessonContext.lessonName)
        : (isRTL ? 'مراجعة شاملة' : 'Comprehensive Review');

      // Get trainee weaknesses for adaptive content
      const focusAreas = profile?.weaknesses || [];

      // Use the new simple audio summary API
      const result = await audioSummaryApi.generate({
        topic,
        focusAreas,
        language: isRTL ? 'ar' : 'en',
      });

      // Add message with embedded audio player (audio only, no text shown)
      const summaryMessage: Message = {
        id: `audio-summary-${Date.now()}`,
        role: 'assistant',
        content: '', // Empty content - only audio player will show
        timestamp: new Date(),
        audioSummary: {
          title: result.title,
          text: result.text, // Keep text for accessibility but don't display
          audioBase64: result.audioBase64,
          durationSeconds: result.durationSeconds,
        },
      };
      setMessages((prev) => [...prev, summaryMessage]);

    } catch (err: any) {
      const errorDetails = err?.message || 'Unknown error';
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isRTL
          ? `عذراً، حدث خطأ أثناء إنشاء الملخص: ${errorDetails}`
          : `Sorry, an error occurred while generating the summary: ${errorDetails}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGeneratingAVContent(false);
    }
  }, [currentLessonContext, profile, isRTL, isGeneratingAVContent]);

  // Calculate course progress for a specific course
  const getCourseProgressInfo = (courseId: string, completedIds: Set<string>) => {
    const course = getCourseById(courseId);
    if (!course) return null;

    const totalLessons = course.lessons.length;
    const completedCount = course.lessons.filter(l => completedIds.has(l.id)).length;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return { totalLessons, completedCount, progress, isCompleted: progress === 100 };
  };

  // Generate contextual greeting based on lesson context
  const generateLessonContextGreeting = (
    ctx: LessonContext,
    profileData: TraineeProfile | null,
    completedIds: Set<string>,
    fromSidebar: boolean,
    lastLessonData: LastLessonData | null
  ): string => {
    const name = profileData?.firstName || '';
    const lessonName = isRTL ? ctx.lessonNameAr : ctx.lessonName;
    const courseName = isRTL ? ctx.courseNameAr : ctx.courseName;

    // Get course progress
    const progressInfo = getCourseProgressInfo(ctx.courseId, completedIds);
    const progressText = progressInfo
      ? (isRTL
          ? `📊 تقدمك في "${courseName}": ${progressInfo.progress}% (${progressInfo.completedCount}/${progressInfo.totalLessons} درس)`
          : `📊 Your progress in "${courseName}": ${progressInfo.progress}% (${progressInfo.completedCount}/${progressInfo.totalLessons} lessons)`)
      : '';

    // Check if this lesson is already completed
    const isLessonCompleted = completedIds.has(ctx.lessonId);
    const completedBadge = isLessonCompleted
      ? (isRTL ? '✅ أكملت هذا الدرس من قبل!' : '✅ You already completed this lesson!')
      : '';

    // Check if returning to same lesson
    const isReturning = lastLessonData && lastLessonData.lessonId === ctx.lessonId;
    const returningText = isReturning
      ? (isRTL
          ? '🔄 أهلاً بعودتك! أشوفك رجعت لنفس الدرس.'
          : '🔄 Welcome back! I see you returned to the same lesson.')
      : '';

    if (isRTL) {
      return `أهلاً ${name}! 📚✨

${returningText}
${completedBadge}

أشوف إنك تبي تتعمق في درس "${lessonName}" من دورة "${courseName}".

${progressText}

ممتاز! خليني أساعدك تفهم هالدرس بشكل أفضل.

💡 نقدر نسوي التالي:
• أشرح لك المفاهيم الرئيسية
• أعطيك أمثلة عملية من السوق السعودي
• نسوي اختبار قصير نتأكد من فهمك

إيش تحب نبدأ فيه؟`.trim().replace(/\n{3,}/g, '\n\n');
    } else {
      return `Hello ${name}! 📚✨

${returningText}
${completedBadge}

I see you want to dive deeper into the lesson "${lessonName}" from the course "${courseName}".

${progressText}

Excellent! Let me help you understand this lesson better.

💡 We can:
• Explain the key concepts
• Give you practical examples from the Saudi market
• Do a quick quiz to test your understanding

What would you like to start with?`.trim().replace(/\n{3,}/g, '\n\n');
    }
  };

  // Generate sidebar welcome with progress info
  const generateSidebarWelcome = (
    profileData: TraineeProfile | null,
    completedIds: Set<string>,
    lastLessonData: LastLessonData | null,
    diagnosticReport?: SkillReport | null
  ): string => {
    const name = profileData?.firstName || '';

    // Calculate overall progress
    const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);
    const completedCount = courses.reduce((sum, c) =>
      sum + c.lessons.filter(l => completedIds.has(l.id)).length, 0);
    const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Count completed courses
    const completedCourses = courses.filter(c =>
      c.lessons.length > 0 && c.lessons.every(l => completedIds.has(l.id))).length;

    // Get sessions info from profile
    const sessions = profileData?.totalSessions || 0;
    const avgScore = profileData?.averageScore || 0;
    const streak = profileData?.currentStreak || 0;

    // Last lesson info
    const lastLessonText = lastLessonData
      ? (isRTL
          ? `\n📖 آخر درس درسته: "${lastLessonData.lessonNameAr}"`
          : `\n📖 Last lesson you studied: "${lastLessonData.lessonName}"`)
      : '';

    // Build skill profile section from diagnostic report
    let skillSection = '';
    if (diagnosticReport) {
      const levelLabels: Record<string, { ar: string; en: string }> = {
        beginner: { ar: 'مبتدئ', en: 'Beginner' },
        intermediate: { ar: 'متوسط', en: 'Intermediate' },
        advanced: { ar: 'متقدم', en: 'Advanced' },
      };
      const levelLabel = isRTL
        ? levelLabels[diagnosticReport.level]?.ar || diagnosticReport.level
        : levelLabels[diagnosticReport.level]?.en || diagnosticReport.level;

      if (isRTL) {
        skillSection = `

🎯 **ملف مهاراتك:**
• المستوى: ${levelLabel}
• النتيجة: ${diagnosticReport.overallScore}%
• نقاط القوة: ${diagnosticReport.strengths.slice(0, 2).join('، ')}
• نقاط التحسين: ${diagnosticReport.weaknesses.slice(0, 2).join('، ')}`;
      } else {
        skillSection = `

🎯 **Your Skill Profile:**
• Level: ${levelLabel}
• Score: ${diagnosticReport.overallScore}%
• Strengths: ${diagnosticReport.strengths.slice(0, 2).join(', ')}
• Areas to improve: ${diagnosticReport.weaknesses.slice(0, 2).join(', ')}`;
      }
    }

    if (isRTL) {
      return `مرحباً ${name}! 🎓

أنا معلمك الذكي، مرشدك الشخصي في رحلة التعلم العقاري.

📊 **ملخص تقدمك:**
• التقدم الإجمالي: ${overallProgress}% (${completedCount}/${totalLessons} درس)
• الدورات المكتملة: ${completedCourses}/${courses.length}
• جلسات التدريب: ${sessions}
• متوسط الدرجات: ${avgScore > 0 ? avgScore + '%' : 'لم تبدأ بعد'}
• سلسلة الأيام: ${streak} ${streak === 1 ? 'يوم' : 'أيام'}
${lastLessonText}${skillSection}

💡 كيف أقدر أساعدك اليوم؟
• اسألني عن أي موضوع عقاري
• ارفع ملف وأشرحه لك
• روح لصفحة الدورات واختر درس وارجع لي!`;
    } else {
      return `Hello ${name}! 🎓

I'm your AI Teacher, your personal guide on your real estate learning journey.

📊 **Your Progress Summary:**
• Overall Progress: ${overallProgress}% (${completedCount}/${totalLessons} lessons)
• Courses Completed: ${completedCourses}/${courses.length}
• Training Sessions: ${sessions}
• Average Score: ${avgScore > 0 ? avgScore + '%' : 'Not started yet'}
• Current Streak: ${streak} ${streak === 1 ? 'day' : 'days'}
${lastLessonText}${skillSection}

💡 How can I help you today?
• Ask me about any real estate topic
• Upload a file and I'll explain it
• Go to courses page, pick a lesson, and come back!`;
    }
  };

  // Initialize - fetch profile quickly, then welcome (which takes longer)
  useEffect(() => {
    // Prevent multiple initializations (handles React StrictMode and multiple clicks)
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    const initialize = async () => {
      setIsLoading(true);
      setError(null);

      // Capture lesson context at initialization
      const capturedLessonContext = lessonContext;
      if (capturedLessonContext) {
        setCurrentLessonContext(capturedLessonContext);
        // Save lesson to localStorage for memory
        saveLastLesson(capturedLessonContext);
        // Mark entry source as coming from course page
        setEntrySource('course');
        setEntrySourceState('course');
      } else {
        // Coming from sidebar or direct navigation
        setEntrySource('sidebar');
        setEntrySourceState('sidebar');
      }

      // Load last lesson from localStorage
      const lastLessonData = getLastLesson();
      if (lastLessonData) {
        setLastLesson(lastLessonData);
      }

      try {
        // Show default welcome message immediately (instant feedback)
        const defaultWelcome: Message = {
          id: 'welcome-default',
          role: 'assistant',
          content: isRTL
            ? 'مرحباً! أنا المعلم الذكي، مرشدك الشخصي للتعلم. جاري تحميل بياناتك...'
            : 'Hello! I am your AI Teacher. Loading your data...',
          timestamp: new Date(),
        };
        setMessages([defaultWelcome]);
        setIsLoading(false);
        setIsLoadingWelcome(true);

        // Fetch profile, completed lessons, and diagnostic status in parallel
        const [profileData, traineeData, diagnosticStatus] = await Promise.all([
          aiTeacherApi.getProfile().catch(() => null),
          traineeApi.getProfile().catch(() => null),
          diagnosticApi.getStatus().catch(() => null),
        ]);

        if (profileData) {
          setProfile(profileData);
        }

        // Extract completed lesson IDs from trainee profile
        let completedIds = new Set<string>();
        if (traineeData?.progress?.completedLectureIds) {
          completedIds = new Set(traineeData.progress.completedLectureIds);
        }
        setCompletedLessonIds(completedIds);

        // If we have lesson context (coming from course page), generate contextual greeting
        if (capturedLessonContext) {
          const contextualGreeting = generateLessonContextGreeting(
            capturedLessonContext,
            profileData,
            completedIds,
            false, // not from sidebar
            lastLessonData
          );

          const contextualWelcome: Message = {
            id: 'welcome-contextual',
            role: 'assistant',
            content: contextualGreeting,
            timestamp: new Date(),
          };
          setMessages([contextualWelcome]);

          // Pre-generate audio for welcome message (don't auto-play)
          if (!hasPlayedInitialAudioRef.current && !document.hidden) {
            hasPlayedInitialAudioRef.current = true;
            try {
              const lang = isRTL ? 'ar' : 'en';
              // Get the active teacher for persona-specific voice
              const currentTeacher = useTeacherStore.getState().activeTeacher || useTeacherStore.getState().assignedTeacher;
              const response = await aiTeacherApi.textToSpeech(contextualGreeting, lang as 'ar' | 'en', currentTeacher || undefined);
              if (response.audio) {
                // Store audio with message - user can click to play
                setMessages([{ ...contextualWelcome, audioBase64: response.audio }]);
              }
            } catch {
              // Audio generation failed - continue without audio
            }
          }
        } else {
          // Coming from sidebar - generate sidebar welcome with full progress
          const sidebarGreeting = generateSidebarWelcome(profileData, completedIds, lastLessonData, diagnosticStatus?.currentReport);

          const sidebarWelcome: Message = {
            id: 'welcome-sidebar',
            role: 'assistant',
            content: sidebarGreeting,
            timestamp: new Date(),
          };
          setMessages([sidebarWelcome]);

          // Pre-generate audio for welcome message (don't auto-play)
          if (!hasPlayedInitialAudioRef.current && !document.hidden) {
            hasPlayedInitialAudioRef.current = true;
            try {
              const lang = isRTL ? 'ar' : 'en';
              // Get the active teacher for persona-specific voice
              const currentTeacher = useTeacherStore.getState().activeTeacher || useTeacherStore.getState().assignedTeacher;
              const response = await aiTeacherApi.textToSpeech(sidebarGreeting, lang as 'ar' | 'en', currentTeacher || undefined);
              if (response.audio) {
                // Store audio with message - user can click to play
                setMessages([{ ...sidebarWelcome, audioBase64: response.audio }]);
              }
            } catch {
              // Audio generation failed - continue without audio
            }
          }
        }
      } catch {
        setError(isRTL ? 'فشل في تحميل المعلم الذكي' : 'Failed to load AI Teacher');
      } finally {
        setIsLoadingWelcome(false);
      }
    };

    initialize();

    // Cleanup: stop audio when component unmounts (AudioManager handles this globally)
    return () => {
      initializationRef.current = false;
      hasPlayedInitialAudioRef.current = false;
    };
  }, [isRTL, playAudio, lessonContext]);

  // Send message with streaming support
  const sendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const messageToSend = inputMessage;
    const attachmentsToSend = [...attachments];

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsSending(true);

    // Create placeholder for streaming response
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    // Add empty assistant message immediately
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Use streaming API for real-time response
      let fullContent = '';
      let audioBase64: string | undefined;

      const activeTeacher = useTeacherStore.getState().activeTeacher;
      for await (const chunk of aiTeacherApi.sendMessageStream(
        messageToSend,
        attachmentsToSend,
        currentLessonContext || undefined,
        activeTeacher || undefined
      )) {
        if (chunk.type === 'chunk' && chunk.content) {
          fullContent += chunk.content;
          // Update message content in real-time
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullContent }
                : m
            )
          );
        } else if (chunk.type === 'done') {
          // Final update with full message and audio
          if (chunk.fullMessage) {
            fullContent = chunk.fullMessage;
          }
          audioBase64 = chunk.audioBase64;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullContent, audioBase64 }
                : m
            )
          );

          // Audio is stored with message - user clicks button to play
          // No auto-play
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error || 'Streaming error');
        }
      }
    } catch {
      // Update the assistant message with error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: isRTL
                  ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
                  : 'Sorry, an error occurred. Please try again.',
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const attachment = await aiTeacherApi.uploadFile(file);
        setAttachments((prev) => [...prev, attachment]);
      } catch {
        // File upload failed - silently continue
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Start voice recording using MediaRecorder + backend Whisper API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (audioBlob.size < 1000) {
          // Recording too short
          return;
        }

        // Show transcribing state (visual indicator, not a message)
        setIsTranscribing(true);

        try {
          // Send to backend for transcription
          const result = await aiTeacherApi.speechToText(audioBlob, isRTL ? 'ar' : 'en');

          if (result.text && result.text.trim()) {
            setInputMessage(result.text.trim());
          }
          // If no text, just silently fail - user can try again
        } catch {
          // Speech-to-text failed - user can try again
        } finally {
          setIsTranscribing(false);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

    } catch {
      // Only show error message for permission issues
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isRTL
          ? 'يرجى السماح بالوصول إلى الميكروفون. اضغط على أيقونة القفل في شريط العنوان وفعّل الميكروفون.'
          : 'Please allow microphone access. Click the lock icon in the address bar and enable microphone.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Sync profile
  const syncProfile = async () => {
    try {
      const updated = await aiTeacherApi.syncProfile();
      setProfile(updated);
    } catch {
      // Profile sync failed - silently continue
    }
  };

  // Handle keyboard submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-20 flex-1 rounded-xl" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {isRTL ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 px-4 max-w-7xl">
      {/* Header - Compact */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/10">
              <GraduationCap className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {isRTL ? 'المعلم الذكي' : 'AI Teacher'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-3">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="border border-border shadow-lg overflow-hidden h-[calc(100vh-120px)] flex flex-col">
            {/* Lesson Context Banner */}
            {currentLessonContext && (
              <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-b border-violet-500/20 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-violet-500/20 rounded-lg">
                      <BookOpen className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'تدرس الآن:' : 'Currently studying:'}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {isRTL ? currentLessonContext.lessonNameAr : currentLessonContext.lessonName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setCurrentLessonContext(null);
                      clearLessonContext();
                    }}
                  >
                    <X className="h-3 w-3 me-1" />
                    {isRTL ? 'إنهاء' : 'End'}
                  </Button>
                </div>
              </div>
            )}
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && (isRTL ? 'flex-row' : 'flex-row-reverse')
                  )}
                >
                  {/* Avatar */}
                  {message.role === 'assistant' ? (
                    <div className="shrink-0">
                      <TeacherAvatar teacherName={(useTeacherStore.getState().activeTeacher || 'abdullah') as any} size="md" />
                    </div>
                  ) : (
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      'bg-gradient-to-br from-primary to-teal-500'
                    )}>
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 relative group',
                      message.role === 'assistant'
                        ? 'bg-muted/50 text-foreground'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {message.attachments.map((att) => (
                          <Badge key={att.id} variant="secondary" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {att.filename}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                      {message.role === 'assistant' ? renderMessageContent(message.content, isRTL) : message.content}
                    </div>

                    {/* AV Content Play Button - for lectures and summaries */}
                    {message.avContent && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <Button
                          variant="default"
                          size="sm"
                          className={cn(
                            "w-full h-10 text-sm font-medium transition-all",
                            message.avContent.type === 'lecture'
                              ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                              : "bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
                          )}
                          onClick={() => {
                            setAVContentId(message.avContent!.id);
                            setShowAVPlayer(true);
                          }}
                        >
                          {message.avContent.type === 'lecture' ? (
                            <Video className="h-4 w-4 me-2" />
                          ) : (
                            <Music className="h-4 w-4 me-2" />
                          )}
                          {message.avContent.type === 'lecture'
                            ? (isRTL ? 'مشاهدة المحاضرة' : 'Watch Lecture')
                            : (isRTL ? 'تشغيل الملخص' : 'Play Summary')
                          }
                          <span className="ms-2 text-xs opacity-75">
                            ({Math.round(message.avContent.duration / 60)} {isRTL ? 'د' : 'min'})
                          </span>
                        </Button>
                      </div>
                    )}

                    {/* Audio Summary Player (voice message style like WhatsApp) */}
                    {message.audioSummary && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                        {/* Play/Stop Button */}
                        <button
                          className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all",
                            audioState === 'playing' && audioManager.getCurrentAudioId() === message.id
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-emerald-500 hover:bg-emerald-600"
                          )}
                          onClick={() => {
                            if (audioState === 'playing' && audioManager.getCurrentAudioId() === message.id) {
                              stopAudio();
                            } else if (message.audioSummary?.audioBase64) {
                              audioManager.play(message.audioSummary.audioBase64, message.id);
                            }
                          }}
                        >
                          {audioState === 'playing' && audioManager.getCurrentAudioId() === message.id ? (
                            <VolumeX className="h-6 w-6 text-white" />
                          ) : (
                            <Play className="h-6 w-6 text-white ms-0.5" />
                          )}
                        </button>

                        {/* Waveform visualization (static) */}
                        <div className="flex-1 flex items-center gap-0.5 h-8">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1 rounded-full transition-all duration-150",
                                audioState === 'playing' && audioManager.getCurrentAudioId() === message.id
                                  ? "bg-emerald-400 animate-pulse"
                                  : "bg-emerald-500/50"
                              )}
                              style={{
                                height: `${Math.random() * 60 + 20}%`,
                                animationDelay: `${i * 50}ms`
                              }}
                            />
                          ))}
                        </div>

                        {/* Duration */}
                        <div className="flex-shrink-0 text-sm text-emerald-300 font-medium">
                          {Math.floor((message.audioSummary?.durationSeconds || 60) / 60)}:{String((message.audioSummary?.durationSeconds || 60) % 60).padStart(2, '0')}
                        </div>
                      </div>
                    )}

                    {/* Audio playback button for assistant messages (text-to-speech) */}
                    {message.role === 'assistant' && !message.avContent && !message.audioSummary && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-7 px-3 text-xs transition-all",
                            audioState === 'playing' && audioManager.getCurrentAudioId() === message.id
                              ? "bg-violet-500/30 border-violet-500/50 text-violet-300"
                              : "bg-violet-500/10 border-violet-500/30 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50"
                          )}
                          disabled={isGeneratingAudio || audioState === 'loading'}
                          onClick={() => {
                            // If this message is playing, stop it
                            if (audioState === 'playing' && audioManager.getCurrentAudioId() === message.id) {
                              stopAudio();
                              return;
                            }
                            // Otherwise play this message
                            if (message.audioBase64) {
                              audioManager.play(message.audioBase64, message.id);
                            } else {
                              // Generate audio on demand if not available
                              generateAndPlayAudio(message.content);
                            }
                          }}
                        >
                          {isGeneratingAudio || (audioState === 'loading' && audioManager.getCurrentAudioId() === message.id) ? (
                            <Loader2 className="h-3.5 w-3.5 me-1.5 animate-spin" />
                          ) : audioState === 'playing' && audioManager.getCurrentAudioId() === message.id ? (
                            <VolumeX className="h-3.5 w-3.5 me-1.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5 me-1.5" />
                          )}
                          {audioState === 'playing' && audioManager.getCurrentAudioId() === message.id
                            ? (isRTL ? 'إيقاف' : 'Stop')
                            : (isRTL ? 'استمع للرسالة' : 'Listen')
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading welcome indicator */}
              {isLoadingWelcome && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm px-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isRTL ? 'جاري تحميل الترحيب الشخصي...' : 'Loading personalized greeting...'}</span>
                </div>
              )}

              {/* Typing indicator */}
              {isSending && (
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <TeacherAvatar teacherName={(useTeacherStore.getState().activeTeacher || 'abdullah') as any} size="md" showPulse />
                  </div>
                  <div className="bg-muted/50 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 border-t border-border bg-muted/30">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att) => (
                    <Badge key={att.id} variant="secondary" className="gap-1 pr-1">
                      <FileText className="h-3 w-3" />
                      {att.filename}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ms-1 hover:bg-destructive/20"
                        onClick={() => removeAttachment(att.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-card relative">
              {/* Recording/Transcribing indicator bubble */}
              {(isRecording || isTranscribing) && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg",
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-violet-500 text-white"
                  )}>
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        <span className="text-sm font-medium">
                          {isRTL ? 'جاري التسجيل...' : 'Recording...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">
                          {isRTL ? 'جاري التحويل...' : 'Transcribing...'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-end">
                {/* File upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.json,.doc,.docx"
                  className="hidden"
                  multiple
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || isRecording || isTranscribing}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                {/* Voice recording */}
                <Button
                  variant={isRecording ? 'destructive' : 'outline'}
                  size="icon"
                  className={cn(
                    "h-10 w-10 shrink-0 transition-all",
                    isRecording && "animate-pulse ring-2 ring-red-500 ring-offset-2"
                  )}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isSending || isTranscribing}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                {/* Text input */}
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isRecording
                      ? (isRTL ? 'تحدث الآن... اضغط على الميكروفون للإيقاف' : 'Speak now... Click mic to stop')
                      : isTranscribing
                        ? (isRTL ? 'جاري التحويل...' : 'Transcribing...')
                        : (isRTL ? 'اكتب رسالتك هنا...' : 'Type your message here...')
                  }
                  className="flex-1 min-h-[40px] max-h-[100px] resize-none text-[15px]"
                  disabled={isSending || isRecording || isTranscribing}
                />

                {/* Send button */}
                <Button
                  onClick={sendMessage}
                  disabled={isSending || isRecording || isTranscribing || (!inputMessage.trim() && attachments.length === 0)}
                  className="h-10 w-10 shrink-0 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Scrollable */}
        <div className="space-y-3 h-[calc(100vh-120px)] overflow-y-auto">
          {/* Quick Actions for Lesson Context */}
          {currentLessonContext && (
            <Card className="border border-border shadow-lg bg-gradient-to-br from-violet-500/5 to-purple-500/5">
              <CardContent className="p-3">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-violet-500" />
                  {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs h-auto py-2 px-3 border-violet-500/30 hover:bg-violet-500/10"
                    onClick={generateLessonSummary}
                    disabled={isGeneratingSummary}
                  >
                    {isGeneratingSummary ? (
                      <Loader2 className="h-3.5 w-3.5 me-2 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 me-2 text-violet-500" />
                    )}
                    {isRTL ? 'أنشئ ملخص الدرس' : 'Generate Lesson Summary'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs h-auto py-2 px-3 border-violet-500/30 hover:bg-violet-500/10"
                    onClick={generateMiniQuiz}
                    disabled={isGeneratingQuiz || currentQuiz !== null}
                  >
                    {isGeneratingQuiz ? (
                      <Loader2 className="h-3.5 w-3.5 me-2 animate-spin" />
                    ) : (
                      <ClipboardList className="h-3.5 w-3.5 me-2 text-violet-500" />
                    )}
                    {isRTL ? 'اختبار قصير' : 'Take a Quick Quiz'}
                  </Button>
                  {currentLessonContext.videoId && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-xs h-auto py-2 px-3 border-violet-500/30 hover:bg-violet-500/10"
                      onClick={() => setInputMessage(isRTL ? 'أعطني الأجزاء المهمة في الفيديو' : 'Give me the important parts of the video')}
                    >
                      <Play className="h-3.5 w-3.5 me-2 text-violet-500" />
                      {isRTL ? 'أجزاء الفيديو المهمة' : 'Key Video Sections'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Card */}
          {welcome && (
            <Card className="border border-border shadow-lg">
              <CardContent className="p-3">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {isRTL ? 'تقدمك' : 'Your Progress'}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isRTL ? 'الجلسات' : 'Sessions'}
                    </span>
                    <span className="font-medium">{welcome.recentProgress.sessionsCompleted}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {isRTL ? 'المعدل' : 'Score'}
                      </span>
                      <span className="font-medium">{welcome.recentProgress.averageScore}%</span>
                    </div>
                    <Progress value={welcome.recentProgress.averageScore} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggested Topics */}
          {welcome && welcome.suggestedTopics.length > 0 && (
            <Card className="border border-border shadow-lg">
              <CardContent className="p-3">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-amber-500" />
                  {isRTL ? 'مواضيع مقترحة' : 'Suggested Topics'}
                </h3>
                <div className="space-y-1.5">
                  {welcome.suggestedTopics.map((topic, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-xs h-auto py-1.5 px-2"
                      onClick={() => setInputMessage(
                        isRTL
                          ? `أريد أن أتعلم عن ${topic}`
                          : `I want to learn about ${topic}`
                      )}
                    >
                      <BookOpen className="h-3 w-3 me-1.5 shrink-0" />
                      <span className="truncate text-start">{topic}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Summary - Enhanced */}
          <Card className="border border-border shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  {isRTL ? 'ملفك الشخصي' : 'Your Profile'}
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={syncProfile}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <p className="text-lg font-bold text-violet-600">
                    {profile?.totalSessions || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isRTL ? 'جلسة' : 'Sessions'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    {profile?.averageScore || 0}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isRTL ? 'المعدل' : 'Avg Score'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <p className="text-lg font-bold text-amber-600">
                    {profile?.currentStreak || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isRTL ? 'يوم متتالي' : 'Day Streak'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    {profile?.completedLecturesCount || completedLessonIds.size || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isRTL ? 'درس مكتمل' : 'Lessons'}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              {profile && profile.strengths.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Star className="h-3 w-3 text-emerald-500" />
                    {isRTL ? 'نقاط القوة' : 'Strengths'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {profile.strengths.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {profile && profile.weaknesses.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Target className="h-3 w-3 text-amber-500" />
                    {isRTL ? 'مجالات التحسين' : 'Areas to Improve'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {profile.weaknesses.slice(0, 3).map((w, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600">
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* No data message */}
              {(!profile || (profile.strengths.length === 0 && profile.weaknesses.length === 0)) && (
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'استمر في التعلم لتحديد نقاط قوتك!' : 'Keep learning to identify your strengths!'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Content Generation Tools */}
          <Card className="border border-border shadow-lg bg-gradient-to-br from-fuchsia-500/5 to-pink-500/5">
            <CardContent className="p-3">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-fuchsia-500" />
                {isRTL ? 'أدوات الذكاء الاصطناعي' : 'AI Content Tools'}
              </h3>
              <div className="space-y-2">
                {/* AV Content Generation - Main Buttons */}
                <GenerateAVButtons
                  onGenerateLecture={handleGenerateAVLecture}
                  onGenerateSummary={handleGenerateAVSummary}
                  disabled={isGeneratingAVContent}
                  language={isRTL ? 'ar' : 'en'}
                />

                {/* Divider */}
                <div className="border-t border-border/50 my-2" />

                {/* Generate Practice Scenarios */}
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs h-auto py-2 px-3 border-purple-500/30 hover:bg-purple-500/10"
                  onClick={() => setInputMessage(isRTL
                    ? 'أعطني سيناريوهات تدريبية عملية لتطبيق ما تعلمته'
                    : 'Give me practical training scenarios to apply what I learned'
                  )}
                >
                  <PenTool className="h-3.5 w-3.5 me-2 text-purple-500" />
                  {isRTL ? 'سيناريوهات تدريبية' : 'Training Scenarios'}
                </Button>

                {/* Generate Study Plan */}
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs h-auto py-2 px-3 border-indigo-500/30 hover:bg-indigo-500/10"
                  onClick={() => setInputMessage(isRTL
                    ? 'أنشئ لي خطة دراسية مخصصة بناءً على مستواي وأهدافي'
                    : 'Create a personalized study plan based on my level and goals'
                  )}
                >
                  <Calendar className="h-3.5 w-3.5 me-2 text-indigo-500" />
                  {isRTL ? 'خطة دراسية مخصصة' : 'Custom Study Plan'}
                </Button>

                {/* Quick Knowledge Check */}
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs h-auto py-2 px-3 border-cyan-500/30 hover:bg-cyan-500/10"
                  onClick={() => setInputMessage(isRTL
                    ? 'اختبرني بأسئلة سريعة للتأكد من فهمي'
                    : 'Test me with quick questions to check my understanding'
                  )}
                >
                  <Zap className="h-3.5 w-3.5 me-2 text-cyan-500" />
                  {isRTL ? 'اختبار سريع' : 'Quick Knowledge Check'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AV Player Modal */}
      <AVPlayerModal
        contentId={avContentId}
        isOpen={showAVPlayer}
        onClose={() => {
          setShowAVPlayer(false);
          setAVContentId(null);
        }}
        language={isRTL ? 'ar' : 'en'}
      />

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
          {/* Modal Header - Fixed at top */}
          <div className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <span>{isRTL ? 'اختبار قصير' : 'Quick Quiz'}</span>
                  {currentLessonContext && (
                    <p className="text-sm font-normal text-white/80 mt-1">
                      {isRTL ? currentLessonContext.lessonNameAr : currentLessonContext.lessonName}
                    </p>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            {/* Progress indicator */}
            {currentQuiz && !quizSubmitted && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                  <span>{Object.keys(quizAnswers).length} / {currentQuiz.questions.length}</span>
                </div>
                <Progress
                  value={(Object.keys(quizAnswers).length / currentQuiz.questions.length) * 100}
                  className="h-2 bg-white/20"
                />
              </div>
            )}
          </div>

          {/* Modal Content - Scrollable area with proper height constraint */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {currentQuiz && !quizSubmitted ? (
              /* Questions Display */
              <div className="space-y-6">
                {currentQuiz.questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className={cn(
                      "p-5 rounded-xl border-2 transition-all duration-300",
                      quizAnswers[q.id]
                        ? "border-violet-500/50 bg-violet-500/5"
                        : "border-border bg-muted/30"
                    )}
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        quizAnswers[q.id]
                          ? "bg-violet-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {qIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-medium text-foreground leading-relaxed">
                          {q.question}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {q.type === 'multiple_choice'
                            ? (isRTL ? 'اختيار متعدد' : 'Multiple Choice')
                            : (isRTL ? 'صح أو خطأ' : 'True/False')
                          }
                        </Badge>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 ms-11">
                      {q.type === 'multiple_choice' && q.options?.map((option, oIndex) => (
                        <label
                          key={oIndex}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                            quizAnswers[q.id] === option
                              ? "border-violet-500 bg-violet-500/10 shadow-md"
                              : "border-border hover:border-violet-500/50 hover:bg-muted/50"
                          )}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={option}
                            checked={quizAnswers[q.id] === option}
                            onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            quizAnswers[q.id] === option
                              ? "border-violet-500 bg-violet-500"
                              : "border-muted-foreground"
                          )}>
                            {quizAnswers[q.id] === option && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="flex-1 text-sm">{option}</span>
                        </label>
                      ))}
                      {q.type === 'true_false' && ['True', 'False'].map((option) => {
                        const optionText = isRTL ? (option === 'True' ? 'صح' : 'خطأ') : option;
                        return (
                          <label
                            key={option}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                              quizAnswers[q.id] === optionText
                                ? "border-violet-500 bg-violet-500/10 shadow-md"
                                : "border-border hover:border-violet-500/50 hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={optionText}
                              checked={quizAnswers[q.id] === optionText}
                              onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              className="sr-only"
                            />
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              quizAnswers[q.id] === optionText
                                ? "border-violet-500 bg-violet-500"
                                : "border-muted-foreground"
                            )}>
                              {quizAnswers[q.id] === optionText && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="flex-1 text-sm font-medium">{optionText}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : quizSubmitted && currentQuiz && quizScore ? (
              /* Results Display */
              <div className="space-y-6">
                {/* Score Card */}
                <div className={cn(
                  "text-center p-8 rounded-2xl",
                  quizScore.percentage >= 70
                    ? "bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-2 border-emerald-500/30"
                    : quizScore.percentage >= 50
                      ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/30"
                      : "bg-gradient-to-br from-red-500/20 to-orange-500/10 border-2 border-red-500/30"
                )}>
                  <div className={cn(
                    "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
                    quizScore.percentage >= 70
                      ? "bg-emerald-500/20"
                      : quizScore.percentage >= 50
                        ? "bg-amber-500/20"
                        : "bg-red-500/20"
                  )}>
                    <Trophy className={cn(
                      "w-10 h-10",
                      quizScore.percentage >= 70
                        ? "text-emerald-500"
                        : quizScore.percentage >= 50
                          ? "text-amber-500"
                          : "text-red-500"
                    )} />
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{quizScore.percentage}%</h3>
                  <p className="text-lg text-muted-foreground mb-2">
                    {quizScore.correct} / {quizScore.total} {isRTL ? 'إجابات صحيحة' : 'Correct Answers'}
                  </p>
                  <p className={cn(
                    "text-lg font-medium",
                    quizScore.percentage >= 70
                      ? "text-emerald-600"
                      : quizScore.percentage >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                  )}>
                    {quizScore.percentage >= 70
                      ? (isRTL ? '🎉 ممتاز! أداء رائع!' : '🎉 Excellent! Great performance!')
                      : quizScore.percentage >= 50
                        ? (isRTL ? '👍 جيد! استمر في التعلم.' : '👍 Good! Keep learning.')
                        : (isRTL ? '💪 تحتاج مراجعة أكثر. لا تستسلم!' : '💪 Needs more review. Don\'t give up!')
                    }
                  </p>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    {isRTL ? 'تفاصيل الإجابات' : 'Answer Details'}
                  </h4>
                  {currentQuiz.questions.map((q, qIndex) => {
                    const userAnswer = quizAnswers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "p-4 rounded-xl border-2",
                          isCorrect
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-red-500/30 bg-red-500/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                            isCorrect ? "bg-emerald-500" : "bg-red-500"
                          )}>
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : (
                              <XCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-2">
                              {qIndex + 1}. {q.question}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p className={cn(
                                "flex items-center gap-2",
                                isCorrect ? "text-emerald-600" : "text-red-600"
                              )}>
                                <span className="font-medium">
                                  {isRTL ? 'إجابتك:' : 'Your answer:'}
                                </span>
                                {userAnswer || (isRTL ? 'لم تجب' : 'Not answered')}
                              </p>
                              {!isCorrect && (
                                <p className="text-emerald-600 flex items-center gap-2">
                                  <span className="font-medium">
                                    {isRTL ? 'الإجابة الصحيحة:' : 'Correct answer:'}
                                  </span>
                                  {q.correctAnswer}
                                </p>
                              )}
                              <p className="text-muted-foreground mt-2 bg-muted/50 p-2 rounded-lg">
                                <span className="font-medium">
                                  {isRTL ? 'الشرح:' : 'Explanation:'}
                                </span>{' '}
                                {q.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Loading State */
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            )}
          </div>

          {/* Modal Footer - Fixed at bottom, not sticky */}
          <div className="flex-shrink-0 border-t bg-background px-6 py-4 flex items-center justify-between">
            {!quizSubmitted ? (
              <>
                <Button variant="outline" onClick={closeQuizModal}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={submitQuiz}
                  disabled={!currentQuiz || Object.keys(quizAnswers).length !== currentQuiz?.questions.length}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isRTL ? 'إرسال الإجابات' : 'Submit Answers'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={resetQuiz} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Button>
                <Button
                  onClick={() => {
                    setShowQuizModal(false);
                    setCurrentQuiz(null);
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    setQuizScore(null);
                  }}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                  <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
