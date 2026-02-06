'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, UserCircle } from 'lucide-react';
import type { Sentiment } from '@/types/entities';
import { cn } from '@/lib/utils/cn';

interface ConversationBubbleProps {
  speaker: 'trainee' | 'client';
  message: string;
  timestamp: Date;
  sentiment: Sentiment | null;
  isLatest?: boolean;
  isTyping?: boolean;
  clientName?: string;
}

// Helper to detect if text contains Arabic characters
const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

export function ConversationBubble({
  speaker,
  message,
  timestamp,
  sentiment,
  isLatest,
  isTyping,
  clientName,
}: ConversationBubbleProps) {
  const isTrainee = speaker === 'trainee';
  const isArabic = isArabicText(message);

  // Get sentiment indicator color
  const getSentimentIndicator = () => {
    if (!sentiment || isTrainee) return null;
    const colors = {
      positive: 'bg-emerald-500',
      neutral: 'bg-slate-400',
      negative: 'bg-rose-500',
    };
    return <span className={cn('w-2 h-2 rounded-full', colors[sentiment])} />;
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isTrainee ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Client Avatar - Left side */}
      {!isTrainee && (
        <Avatar className="h-10 w-10 shrink-0 border-2 border-slate-200 dark:border-slate-700">
          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300">
            <UserCircle className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn(
        'max-w-[70%] flex flex-col',
        isTrainee ? 'items-end' : 'items-start'
      )}>
        {/* Speaker label for client */}
        {!isTrainee && clientName && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className={cn(
              'text-xs font-medium text-slate-500 dark:text-slate-400',
              isArabic && 'font-arabic'
            )}>
              {clientName}
            </span>
            {getSentimentIndicator()}
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-3 shadow-sm',
          isTrainee
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md',
          isLatest && 'animate-fade-in'
        )}>
          {isTyping ? (
            <div className="flex gap-1.5 py-1 px-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className={cn(
              'text-sm leading-relaxed whitespace-pre-wrap',
              isArabic && 'font-arabic text-right',
              !isTrainee && 'text-slate-800 dark:text-slate-200'
            )} dir={isArabic ? 'rtl' : 'ltr'}>
              {message}
            </p>
          )}
        </div>

        {/* Timestamp */}
        {!isTyping && (
          <span className={cn(
            'text-[10px] text-slate-400 mt-1 px-1',
            isTrainee ? 'text-right' : 'text-left'
          )} dir="ltr">
            {new Date(timestamp).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        )}
      </div>

      {/* Trainee Avatar - Right side */}
      {isTrainee && (
        <Avatar className="h-10 w-10 shrink-0 border-2 border-blue-200 dark:border-blue-800">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
