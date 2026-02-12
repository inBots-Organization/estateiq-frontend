'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Clock, MessageCircle, StopCircle, Lightbulb, User, UserCircle } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulation.store';
import { cn } from '@/lib/utils/cn';
import type { Sentiment } from '@/types/entities';

interface SimulationChatProps {
  onSendMessage: (message: string) => Promise<unknown>;
  onEndSimulation: (reason: 'completed' | 'abandoned') => Promise<unknown>;
  isDiagnosticMode?: boolean;
  minMessagesRequired?: number;
}

// Helper to detect if text contains Arabic characters
const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

const MIN_DIAGNOSTIC_MESSAGES = 5; // Minimum trainee messages for diagnostic

export function SimulationChat({ onSendMessage, onEndSimulation, isDiagnosticMode = false, minMessagesRequired }: SimulationChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate minimum messages needed
  const minMessages = minMessagesRequired ?? (isDiagnosticMode ? MIN_DIAGNOSTIC_MESSAGES : 0);

  const {
    clientPersona,
    scenarioContext,
    messages,
    conversationState,
    currentSentiment,
    turnNumber,
    elapsedTimeSeconds,
    hints,
    isTyping,
    isSending,
    status,
  } = useSimulationStore();

  // Detect if content is Arabic based on client persona name
  const isArabicSession = clientPersona?.name ? isArabicText(clientPersona.name) : false;

  // Count trainee messages
  const traineeMessageCount = messages.filter(m => m.speaker === 'trainee').length;
  const canEndSimulation = traineeMessageCount >= minMessages;
  const messagesRemaining = Math.max(0, minMessages - traineeMessageCount);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Allow interaction on error status too so user can retry
  const isActive = status === 'ready' || status === 'in_progress' || status === 'error';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-focus input after AI finishes typing
  useEffect(() => {
    if (!isTyping && !isSending && isActive) {
      inputRef.current?.focus();
    }
  }, [isTyping, isSending, isActive]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;
    const message = inputMessage.trim();
    setInputMessage('');
    try {
      await onSendMessage(message);
    } catch {
      // Error is handled by the hook, chat stays open for retry
      // Could optionally show a toast notification here
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get sentiment badge
  const getSentimentBadge = (sentiment: Sentiment | null) => {
    if (!sentiment) return null;
    const config = {
      positive: { label: isArabicSession ? 'إيجابي' : 'Positive', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      neutral: { label: isArabicSession ? 'محايد' : 'Neutral', class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
      negative: { label: isArabicSession ? 'سلبي' : 'Negative', class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    };
    return (
      <Badge variant="secondary" className={cn('text-xs', config[sentiment].class)}>
        {config[sentiment].label}
      </Badge>
    );
  };

  // Get conversation state label
  const getStateLabel = (state: string | null) => {
    if (!state) return '';
    const labels: Record<string, { ar: string; en: string }> = {
      opening: { ar: 'المقدمة', en: 'Opening' },
      discovery: { ar: 'الاكتشاف', en: 'Discovery' },
      presenting: { ar: 'العرض', en: 'Presenting' },
      negotiating: { ar: 'التفاوض', en: 'Negotiating' },
      closing: { ar: 'الإغلاق', en: 'Closing' },
      ended: { ar: 'انتهت', en: 'Ended' },
    };
    return labels[state]?.[isArabicSession ? 'ar' : 'en'] || state;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        {/* Client Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <UserCircle className="w-7 h-7 text-slate-500 dark:text-slate-400" />
            </div>
            <span className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900',
              currentSentiment === 'positive' && 'bg-emerald-500',
              currentSentiment === 'negative' && 'bg-rose-500',
              (!currentSentiment || currentSentiment === 'neutral') && 'bg-slate-400'
            )} />
          </div>
          <div>
            <h2 className={cn(
              'font-semibold text-foreground',
              isArabicSession && 'font-arabic'
            )}>
              {clientPersona?.name || 'Client'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn(isArabicSession && 'font-arabic')}>
                {getStateLabel(conversationState)}
              </span>
              {getSentimentBadge(currentSentiment)}
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(elapsedTimeSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>{turnNumber}</span>
          </div>
          {isActive && (
            <>
              {/* Show progress for diagnostic mode */}
              {isDiagnosticMode && messagesRemaining > 0 && (
                <span className="text-xs text-muted-foreground">
                  {isArabicSession ? `${messagesRemaining} رسائل متبقية` : `${messagesRemaining} messages left`}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEndSimulation('completed')}
                disabled={!canEndSimulation}
                className={cn(
                  "text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:hover:bg-rose-900/20",
                  !canEndSimulation && "opacity-50 cursor-not-allowed"
                )}
                title={!canEndSimulation ? (isArabicSession ? `أرسل ${messagesRemaining} رسائل إضافية` : `Send ${messagesRemaining} more messages`) : ''}
              >
                <StopCircle className="w-4 h-4 mr-1.5" />
                {isArabicSession ? 'إنهاء' : 'End'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Scenario Context Banner */}
      {scenarioContext && (
        <div className="mx-2 mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <p className={cn(
            'text-sm text-blue-700 dark:text-blue-300',
            isArabicText(scenarioContext) && 'font-arabic text-right leading-relaxed'
          )} dir={isArabicText(scenarioContext) ? 'rtl' : 'ltr'}>
            {scenarioContext}
          </p>
        </div>
      )}

      {/* Chat Messages Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((turn, index) => (
            <MessageBubble
              key={index}
              speaker={turn.speaker}
              message={turn.message}
              timestamp={turn.timestamp}
              sentiment={turn.sentiment}
              isLatest={index === messages.length - 1}
              clientName={clientPersona?.name}
              isArabic={isArabicSession}
            />
          ))}

          {isTyping && (
            <MessageBubble
              speaker="client"
              message=""
              timestamp={new Date()}
              sentiment={null}
              isTyping
              clientName={clientPersona?.name}
              isArabic={isArabicSession}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Tips Section */}
        {hints.length > 0 && isActive && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/30">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className={cn(
                'text-xs text-amber-700 dark:text-amber-300',
                isArabicText(hints[0]) && 'font-arabic'
              )} dir={isArabicText(hints[0]) ? 'rtl' : 'ltr'}>
                {hints[0]}
              </p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isActive
                  ? (isArabicSession ? "اكتب ردك هنا..." : "Type your message...")
                  : (isArabicSession ? "انتهت الجلسة" : "Session ended")
                }
                disabled={!isActive || isSending}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700',
                  'bg-slate-50 dark:bg-slate-800',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isArabicSession && 'font-arabic text-right'
                )}
                dir={isArabicSession ? 'rtl' : 'ltr'}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!isActive || !inputMessage.trim() || isSending}
              size="lg"
              className="rounded-xl px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className={cn('h-5 w-5', isArabicSession && 'rotate-180')} />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Separate Message Bubble component for cleaner rendering
interface MessageBubbleProps {
  speaker: 'trainee' | 'client';
  message: string;
  timestamp: Date;
  sentiment: Sentiment | null;
  isLatest?: boolean;
  isTyping?: boolean;
  clientName?: string;
  isArabic?: boolean;
}

function MessageBubble({
  speaker,
  message,
  timestamp,
  sentiment,
  isLatest,
  isTyping,
  clientName,
  isArabic,
}: MessageBubbleProps) {
  const isTrainee = speaker === 'trainee';
  const isArabicMessage = isArabicText(message);

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
        {/* Client Name */}
        {!isTrainee && clientName && !isTyping && (
          <span className={cn(
            'text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 px-1',
            isArabic && 'font-arabic'
          )}>
            {clientName}
          </span>
        )}

        {/* Bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-2.5',
          isTrainee
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-bl-sm',
          isLatest && !isTyping && 'animate-fade-in'
        )}>
          {isTyping ? (
            <div className="flex gap-1.5 py-1 px-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className={cn(
              'text-sm leading-relaxed',
              isArabicMessage && 'font-arabic',
              !isTrainee && 'text-slate-800 dark:text-slate-200'
            )} dir={isArabicMessage ? 'rtl' : 'ltr'}>
              {message}
            </p>
          )}
        </div>

        {/* Timestamp */}
        {!isTyping && (
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {new Date(timestamp).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Trainee Avatar */}
      {isTrainee && (
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
