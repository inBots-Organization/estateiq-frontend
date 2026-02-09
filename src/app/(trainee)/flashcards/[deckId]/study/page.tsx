'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { flashcardApi } from '@/lib/api/flashcard.api';
import type { StudyCard, ReviewResult } from '@/types/flashcard';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Loader2,
  CheckCircle2,
  Trophy,
  BookOpen,
  Layers,
} from 'lucide-react';

const qualityColors = [
  'bg-red-500 hover:bg-red-600',       // 0
  'bg-orange-500 hover:bg-orange-600',  // 1
  'bg-yellow-500 hover:bg-yellow-600',  // 2
  'bg-blue-500 hover:bg-blue-600',      // 3
  'bg-emerald-500 hover:bg-emerald-600',// 4
  'bg-green-500 hover:bg-green-600',    // 5
];

export default function StudyPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;

  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastResult, setLastResult] = useState<ReviewResult | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const data = await flashcardApi.getStudyCards(deckId);
        setCards(data.cards);
        if (data.cards.length === 0) {
          setCompleted(true);
        }
      } catch (err) {
        console.error('Failed to fetch study cards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [deckId]);

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setFlipped(prev => !prev);
  }, []);

  const handleRate = async (quality: number) => {
    if (!currentCard || submitting) return;

    setSubmitting(true);
    try {
      const result = await flashcardApi.submitReview(currentCard.id, quality);
      setLastResult(result);
      setReviewedCount(prev => prev + 1);
      if (quality >= 3) setCorrectCount(prev => prev + 1);

      // Move to next card or complete
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setFlipped(false);
        setShowHint(false);
        setLastResult(null);
      } else {
        setCompleted(true);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed || loading) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (flipped && e.key >= '0' && e.key <= '5') {
        handleRate(parseInt(e.key));
      } else if (e.key === 'h') {
        setShowHint(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completed, loading, flipped, currentCard, handleFlip]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  // Session Complete
  if (completed) {
    const accuracy = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0;
    return (
      <div className={cn('p-6 max-w-lg mx-auto', isRTL && 'text-right')}>
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
          <CardContent className="p-8 text-center space-y-6">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.flashcard.sessionComplete}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">{reviewedCount}</div>
                <div className="text-xs text-gray-500">{t.flashcard.cardsReviewed}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-xs text-gray-500">
                  {isRTL ? 'الدقة' : 'Accuracy'}
                </div>
              </div>
            </div>

            {cards.length === 0 && (
              <p className="text-gray-500">{t.flashcard.noDueCards}</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/flashcards')}
              >
                <Layers className="w-4 h-4 mr-2" />
                {t.flashcard.decks}
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  setCurrentIndex(0);
                  setFlipped(false);
                  setShowHint(false);
                  setCompleted(false);
                  setReviewedCount(0);
                  setCorrectCount(0);
                  setLastResult(null);
                  setLoading(true);
                  flashcardApi.getStudyCards(deckId).then(data => {
                    setCards(data.cards);
                    if (data.cards.length === 0) setCompleted(true);
                    setLoading(false);
                  });
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isRTL ? 'جلسة جديدة' : 'New Session'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const qualityLabels = [
    t.flashcard.quality0,
    t.flashcard.quality1,
    t.flashcard.quality2,
    t.flashcard.quality3,
    t.flashcard.quality4,
    t.flashcard.quality5,
  ];

  return (
    <div className={cn('p-6 max-w-2xl mx-auto space-y-4', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/flashcards')}>
          <BackIcon className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen className="w-4 h-4" />
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      {currentCard && (
        <div
          className="perspective-1000 cursor-pointer"
          onClick={() => !flipped && handleFlip()}
        >
          <Card className={cn(
            'min-h-[280px] transition-all duration-500 relative overflow-hidden',
            !flipped && 'hover:shadow-lg'
          )}>
            <div className={cn(
              'h-2',
              flipped
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
            )} />
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[260px]">
              {!flipped ? (
                /* FRONT */
                <div className="text-center space-y-4 w-full">
                  <Badge className="bg-amber-100 text-amber-700 mb-2">
                    {t.flashcard.front}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {isRTL && currentCard.frontAr ? currentCard.frontAr : currentCard.front}
                  </h2>

                  {/* Hint */}
                  {(currentCard.hint || currentCard.hintAr) && (
                    <div className="mt-4">
                      {showHint ? (
                        <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                          <Lightbulb className="w-4 h-4 inline mr-1" />
                          {isRTL && currentCard.hintAr ? currentCard.hintAr : currentCard.hint}
                        </p>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowHint(true); }}>
                          <Lightbulb className="w-4 h-4 mr-1" />
                          {t.flashcard.hint}
                        </Button>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-400 mt-6">
                    {isRTL ? 'انقر لقلب البطاقة' : 'Click to flip'} (Space)
                  </p>

                  {/* Proficiency indicator */}
                  {currentCard.proficiency && (
                    <div className="text-xs text-gray-400">
                      {isRTL ? 'المراجعة السابقة: ' : 'Last quality: '}
                      {qualityLabels[currentCard.proficiency.quality]}
                    </div>
                  )}
                </div>
              ) : (
                /* BACK */
                <div className="text-center space-y-4 w-full">
                  <Badge className="bg-green-100 text-green-700 mb-2">
                    {t.flashcard.back}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {isRTL && currentCard.backAr ? currentCard.backAr : currentCard.back}
                  </h2>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Show Answer / Rating Buttons */}
      {currentCard && !flipped && (
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg"
          onClick={handleFlip}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {t.flashcard.showAnswer}
        </Button>
      )}

      {currentCard && flipped && (
        <div className="space-y-3">
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {t.flashcard.rateRecall}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((q) => (
              <Button
                key={q}
                disabled={submitting}
                className={cn('text-white flex flex-col py-3 h-auto', qualityColors[q])}
                onClick={() => handleRate(q)}
              >
                <span className="text-lg font-bold">{q}</span>
                <span className="text-[10px] leading-tight">{qualityLabels[q]}</span>
              </Button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400">
            {isRTL ? 'اضغط 0-5 على لوحة المفاتيح' : 'Press 0-5 on keyboard'}
          </p>
        </div>
      )}
    </div>
  );
}
