'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Send, X, Maximize2, Loader2, ClipboardCheck } from 'lucide-react';
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
}

function getPageContext(pathname: string, t: any): string {
  if (pathname.includes('/dashboard') || pathname === '/') return t.floatingBot.pageContext.dashboard;
  if (pathname.includes('/courses')) return t.floatingBot.pageContext.courses;
  if (pathname.includes('/simulation')) return t.floatingBot.pageContext.simulations;
  if (pathname.includes('/reports')) return t.floatingBot.pageContext.reports;
  return t.floatingBot.pageContext.general;
}

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
      const assistantMsg: BotMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
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
      'w-[360px] max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl',
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
        <div className="flex items-center gap-2">
          <TeacherAvatar teacherName={currentTeacher as TeacherName} size="sm" />
          <div>
            <p className="font-semibold text-sm">{teacher.displayName[language]}</p>
            <p className="text-[10px] opacity-80">{teacher.shortDescription[language]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => {
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
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
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
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[200px] max-h-[300px]">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {t.floatingBot.greeting}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.role === 'user'
                ? (isRTL ? 'justify-start' : 'justify-end')
                : (isRTL ? 'justify-end' : 'justify-start')
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
      <div className="px-3 py-2 border-t bg-background">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.floatingBot.askAnything}
            className={cn(
              'flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'placeholder:text-muted-foreground',
              isRTL && 'text-right'
            )}
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn('h-9 w-9 rounded-lg bg-gradient-to-br', teacher.gradient)}
          >
            <Send className={cn('h-4 w-4', isRTL && 'rotate-180')} />
          </Button>
        </div>
      </div>
    </div>
  );
}
