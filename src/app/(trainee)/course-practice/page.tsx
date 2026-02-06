'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getCourseById,
  getCourseTitle,
  getCourseObjectives,
  getLessonTitle,
  getLessonDescription,
  Course
} from '@/data/courses';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Send,
  Loader2,
  MessageCircle,
  StopCircle,
  User,
  UserCircle,
  ArrowLeft,
  CheckCircle,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Award,
  Phone,
} from 'lucide-react';

function CoursePracticeContent() {
  const searchParams = useSearchParams();
  const { isRTL } = useLanguage();
  const courseId = searchParams.get('courseId');

  const {
    status,
    messages,
    isProcessing,
    error,
    callSummary,
    startCall,
    sendMessage,
    endCall,
    reset,
  } = useVoiceCall();

  const [course, setCourse] = useState<Course | null>(null);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load course data
  useEffect(() => {
    if (courseId) {
      const foundCourse = getCourseById(courseId);
      setCourse(foundCourse || null);
    }
  }, [courseId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when active
  useEffect(() => {
    if (status === 'active') {
      inputRef.current?.focus();
    }
  }, [status]);

  const handleStartPractice = useCallback(async () => {
    if (!course) return;

    const courseTitle = getCourseTitle(course, isRTL);
    const objectives = getCourseObjectives(course, isRTL);

    const context = `
You are a client interested in real estate. The trainee has been learning about: ${courseTitle}.

Course topics covered:
${course.lessons.map(l => `- ${getLessonTitle(l, isRTL)}: ${getLessonDescription(l, isRTL)}`).join('\n')}

Learning objectives:
${objectives.map(o => `- ${o}`).join('\n')}

Engage in a realistic conversation related to these topics. Ask questions, present objections, and test the trainee's knowledge. Be conversational and natural.
${isRTL ? 'Respond in Arabic Saudi dialect.' : ''}
    `.trim();

    await startCall({
      courseId: courseId!,
      context,
      language: isRTL ? 'ar' : 'en',
    });
  }, [course, courseId, startCall, isRTL]);

  const handleSendMessage = async () => {
    if (!textInput.trim() || isProcessing) return;
    const message = textInput.trim();
    setTextInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // No course found
  if (!course && courseId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="text-center p-8 max-w-md border-amber-200 dark:border-amber-800">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isRTL ? 'الدورة غير موجودة' : 'Course Not Found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isRTL ? 'الدورة التي تبحث عنها غير متوفرة' : "The course you're looking for doesn't exist."}
          </p>
          <Link href="/courses">
            <Button>
              <BookOpen className="w-4 h-4 me-2" />
              {isRTL ? 'العودة للدورات' : 'Back to Courses'}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // No course selected
  if (!courseId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isRTL ? 'اختر دورة' : 'Select a Course'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isRTL ? 'اختر دورة للتدريب مع المحادثات الذكية' : 'Choose a course to practice with AI-powered conversations.'}
          </p>
          <Link href="/courses">
            <Button>
              <BookOpen className="w-4 h-4 me-2" />
              {isRTL ? 'تصفح الدورات' : 'Browse Courses'}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Practice completed - show summary
  if (status === 'ended' && callSummary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="p-8 max-w-lg w-full border-emerald-200 dark:border-emerald-800">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {isRTL ? 'تم إكمال التدريب!' : 'Practice Completed!'}
            </h1>
            <p className="text-muted-foreground">
              {callSummary.totalMessages} {isRTL ? 'رسالة' : 'messages'} | {Math.floor(callSummary.durationSeconds / 60)}:{(callSummary.durationSeconds % 60).toString().padStart(2, '0')} {isRTL ? 'دقيقة' : 'duration'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                {isRTL ? 'الملخص' : 'Summary'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{callSummary.summary}</p>
            </div>

            {callSummary.feedback && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  {isRTL ? 'ملاحظات الذكاء الاصطناعي' : 'AI Feedback'}
                </h3>
                <p className="text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line">{callSummary.feedback}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Link href={`/courses/${courseId}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className={cn("w-4 h-4 me-2", isRTL && "rotate-180")} />
                {isRTL ? 'العودة للدورة' : 'Back to Course'}
              </Button>
            </Link>
            <Button onClick={() => reset()} className="flex-1">
              <RefreshCw className="w-4 h-4 me-2" />
              {isRTL ? 'تدريب مرة أخرى' : 'Practice Again'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Initial state - ready to start
  if (status === 'idle' && course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="p-8 max-w-lg w-full">
          <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
            {isRTL ? 'العودة للدورة' : 'Back to Course'}
          </Link>

          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isRTL ? 'تدريب على:' : 'Practice:'} {getCourseTitle(course, isRTL)}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'تدرب على ما تعلمته مع محادثة عميل ذكية' : 'Practice what you\'ve learned with an AI-powered client conversation'}
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3">
              {isRTL ? 'المواضيع التي ستتدرب عليها:' : 'Topics You\'ll Practice:'}
            </h3>
            <ul className="space-y-2">
              {course.lessons.slice(0, 4).map((lesson, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {getLessonTitle(lesson, isRTL)}
                </li>
              ))}
              {course.lessons.length > 4 && (
                <li className="text-sm text-muted-foreground ps-6">
                  +{course.lessons.length - 4} {isRTL ? 'مواضيع أخرى' : 'more topics'}
                </li>
              )}
            </ul>
          </div>

          <Button onClick={handleStartPractice} size="lg" className="w-full">
            <MessageCircle className="w-5 h-5 me-2" />
            {isRTL ? 'ابدأ التدريب' : 'Start Practice'}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground mb-2">{isRTL ? 'أو جرب التدريب الصوتي:' : 'Or try voice practice:'}</p>
            <Link href="/voice-training" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm">
              <Phone className="w-4 h-4" />
              {isRTL ? 'تدريب المكالمات الصوتية' : 'Voice Call Practice'}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Active practice session - Chat Interface
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 py-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <UserCircle className="w-7 h-7 text-slate-500 dark:text-slate-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {isRTL ? 'عميل افتراضي' : 'AI Client'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {course ? getCourseTitle(course, isRTL) : ''}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => endCall('completed')}
          disabled={status === 'ending'}
          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:hover:bg-rose-900/20"
        >
          <StopCircle className="w-4 h-4 me-1.5" />
          {isRTL ? 'إنهاء التدريب' : 'End Practice'}
        </Button>
      </div>

      {/* Chat Messages Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-muted/30">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              speaker={msg.role === 'user' ? 'trainee' : 'client'}
              message={msg.content}
              isLatest={idx === messages.length - 1}
              isRTL={isRTL}
            />
          ))}

          {isProcessing && (
            <MessageBubble
              speaker="client"
              message=""
              isTyping
              isRTL={isRTL}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 border-t border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isRTL ? 'اكتب ردك هنا...' : 'Type your response...'}
                disabled={isProcessing}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border border-input',
                  'bg-muted/50',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!textInput.trim() || isProcessing}
              size="lg"
              className="rounded-xl px-6"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className={cn('h-5 w-5', isRTL && 'rotate-180')} />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  speaker: 'trainee' | 'client';
  message: string;
  isLatest?: boolean;
  isTyping?: boolean;
  isRTL?: boolean;
}

function MessageBubble({
  speaker,
  message,
  isLatest,
  isTyping,
  isRTL,
}: MessageBubbleProps) {
  const isTrainee = speaker === 'trainee';

  return (
    <div className={cn(
      'flex gap-3 py-2',
      isTrainee ? 'justify-end' : 'justify-start'
    )}>
      {/* Client Avatar */}
      {!isTrainee && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shrink-0">
          <UserCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </div>
      )}

      {/* Message */}
      <div className={cn(
        'max-w-[75%] flex flex-col',
        isTrainee ? 'items-end' : 'items-start'
      )}>
        {/* Bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-2.5',
          isTrainee
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card border border-border shadow-sm rounded-bl-sm',
          isLatest && !isTyping && 'animate-fade-in'
        )}>
          {isTyping ? (
            <div className="flex gap-1.5 py-1 px-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className={cn(
              'text-sm leading-relaxed',
              !isTrainee && 'text-card-foreground'
            )} dir={isRTL ? 'rtl' : 'ltr'}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Trainee Avatar */}
      {isTrainee && (
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading practice session...</p>
    </div>
  );
}

export default function CoursePracticePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CoursePracticeContent />
    </Suspense>
  );
}
