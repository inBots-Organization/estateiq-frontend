'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Smile, Meh, Frown } from 'lucide-react';
import type { ClientPersona, Sentiment } from '@/types/entities';
import type { ConversationState } from '@/types/simulation.types';
import { cn } from '@/lib/utils/cn';

interface ClientPersonaCardProps {
  persona: ClientPersona;
  sentiment: Sentiment;
  conversationState: ConversationState | null;
}

const personalityColors = {
  friendly: 'bg-green-100 text-green-800',
  skeptical: 'bg-yellow-100 text-yellow-800',
  demanding: 'bg-red-100 text-red-800',
  indecisive: 'bg-purple-100 text-purple-800',
  analytical: 'bg-blue-100 text-blue-800',
};

// Arabic personality labels
const personalityLabels: Record<string, string> = {
  friendly: 'ودود',
  skeptical: 'متشكك',
  demanding: 'متطلب',
  indecisive: 'متردد',
  analytical: 'تحليلي',
};

// Arabic state labels
const stateLabels: Record<ConversationState, string> = {
  opening: 'الافتتاحية',
  discovery: 'الاكتشاف',
  presenting: 'العرض',
  negotiating: 'التفاوض',
  closing: 'الإغلاق',
  ended: 'انتهت',
};

const SentimentIcon = ({ sentiment }: { sentiment: Sentiment }) => {
  switch (sentiment) {
    case 'positive':
      return <Smile className="h-5 w-5 text-green-500" />;
    case 'negative':
      return <Frown className="h-5 w-5 text-red-500" />;
    default:
      return <Meh className="h-5 w-5 text-gray-500" />;
  }
};

// Helper to detect if text contains Arabic characters
const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

export function ClientPersonaCard({ persona, sentiment, conversationState }: ClientPersonaCardProps) {
  const isArabicName = isArabicText(persona.name);
  const isArabicBackground = isArabicText(persona.background);

  return (
    <Card className="flex-grow">
      <CardContent className="p-4">
        <div className={cn(
          'flex items-start gap-4',
          isArabicName && 'flex-row-reverse'
        )} dir={isArabicName ? 'rtl' : 'ltr'}>
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="h-6 w-6" />
          </div>

          <div className="flex-grow">
            <div className={cn(
              'flex items-center gap-2 mb-1 flex-wrap',
              isArabicName && 'flex-row-reverse justify-end'
            )}>
              <h3 className={cn(
                'font-semibold',
                isArabicName && 'font-arabic text-lg'
              )}>
                {persona.name}
              </h3>
              <Badge variant="outline" className={cn(personalityColors[persona.personality], 'font-arabic')}>
                {personalityLabels[persona.personality] || persona.personality}
              </Badge>
            </div>

            <p className={cn(
              'text-sm text-muted-foreground line-clamp-2',
              isArabicBackground && 'font-arabic leading-relaxed text-right'
            )} dir={isArabicBackground ? 'rtl' : 'ltr'}>
              {persona.background}
            </p>

            <div className={cn(
              'flex items-center gap-4 mt-2',
              isArabicName && 'flex-row-reverse justify-end'
            )}>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-arabic">المزاج:</span>
                <SentimentIcon sentiment={sentiment} />
              </div>

              {conversationState && (
                <Badge variant="secondary" className="text-xs font-arabic">
                  {stateLabels[conversationState]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
