'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { flashcardApi } from '@/lib/api/flashcard.api';
import type { DeckListItemWithProgress, FlashcardProgress } from '@/types/flashcard';
import {
  Layers,
  BookOpen,
  Trophy,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function FlashcardsPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [decks, setDecks] = useState<DeckListItemWithProgress[]>([]);
  const [progress, setProgress] = useState<FlashcardProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [decksData, progressData] = await Promise.all([
          flashcardApi.getAvailableDecks(),
          flashcardApi.getProgress(),
        ]);
        setDecks(decksData.decks);
        setProgress(progressData);
      } catch (err) {
        console.error('Failed to fetch flashcards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMasteryPercent = (p: DeckListItemWithProgress['progress']) => {
    if (p.totalCards === 0) return 0;
    return Math.round((p.masteredCards / p.totalCards) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className={cn('p-6 space-y-6 max-w-5xl mx-auto', isRTL && 'text-right')}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="w-7 h-7 text-amber-500" />
          {t.flashcard.flashcards}
        </h1>
        <p className="text-gray-500 mt-1">{t.flashcard.description}</p>
      </div>

      {/* Progress Stats */}
      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{progress.totalCards}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.totalCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{progress.studiedCards}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.studiedCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{progress.masteredCards}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.masteredCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{progress.dueToday}</div>
              <div className="text-xs text-gray-500 mt-1">{t.flashcard.dueToday}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deck Grid */}
      {decks.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">{t.flashcard.noDecks}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const mastery = getMasteryPercent(deck.progress);
            return (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {isRTL && deck.titleAr ? deck.titleAr : deck.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {isRTL && deck.descriptionAr ? deck.descriptionAr : deck.description}
                      </p>
                    </div>
                    {deck.generationType === 'ai_generated' && (
                      <Badge className="bg-purple-100 text-purple-700 shrink-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {deck.cardCount} {t.flashcard.cards}
                    </span>
                    {deck.category && (
                      <Badge variant="outline" className="text-xs">
                        {deck.category}
                      </Badge>
                    )}
                  </div>

                  {/* Progress Ring */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="14" fill="none"
                            stroke={mastery >= 80 ? '#22c55e' : mastery >= 40 ? '#f59e0b' : '#94a3b8'}
                            strokeWidth="3"
                            strokeDasharray={`${mastery * 0.88} 88`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {mastery}%
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{t.flashcard.mastered}</div>
                        <div className="text-sm font-medium">
                          {deck.progress.masteredCards}/{deck.progress.totalCards}
                        </div>
                      </div>
                    </div>

                    {deck.progress.dueCards > 0 && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {deck.progress.dueCards} {t.flashcard.dueToday}
                      </Badge>
                    )}
                  </div>

                  {/* Study Button */}
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => router.push(`/flashcards/${deck.id}/study`)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t.flashcard.startStudy}
                    {deck.progress.dueCards > 0 && ` (${deck.progress.dueCards})`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
