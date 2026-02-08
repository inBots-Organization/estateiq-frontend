'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import type { QuizAttemptResult } from '@/types/quiz';
import {
  Trophy,
  XCircle,
  CheckCircle2,
  CircleDot,
  Clock,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ClipboardCheck,
  Loader2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function QuizResultsPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await quizApi.getAttemptResult(attemptId);
        setResult(data);
      } catch (err: any) {
        console.error('Failed to fetch result:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />
          <p className="text-gray-500">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-6">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold">{t.common.error}</h2>
            <p className="text-gray-500">{error}</p>
            <Button onClick={() => router.push('/quizzes')} variant="outline">
              {t.common.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctCount = result.responses.filter((r) => r.isCorrect).length;
  const incorrectCount = result.responses.filter((r) => !r.isCorrect && r.selectedOptionId).length;
  const unansweredCount = result.responses.filter((r) => !r.selectedOptionId).length;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Result Header Card */}
      <Card className={cn(
        'border-2 overflow-hidden',
        result.passed ? 'border-green-300' : 'border-red-300'
      )}>
        <div className={cn(
          'h-3',
          result.passed
            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
            : 'bg-gradient-to-r from-red-400 to-rose-500'
        )} />
        <CardContent className="p-8 text-center space-y-4">
          <div className={cn(
            'w-20 h-20 rounded-full mx-auto flex items-center justify-center',
            result.passed ? 'bg-green-100' : 'bg-red-100'
          )}>
            {result.passed
              ? <Trophy className="w-10 h-10 text-green-600" />
              : <XCircle className="w-10 h-10 text-red-600" />
            }
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {result.passed ? t.quiz.congratulations : t.quiz.tryAgain}
            </h1>
            <p className="text-gray-500 mt-1">{result.quizTitle}</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center">
            <div className={cn(
              'text-5xl font-bold',
              result.passed ? 'text-green-600' : 'text-red-600'
            )}>
              {Math.round(result.score)}%
            </div>
          </div>

          <Badge className={cn(
            'text-base px-4 py-1',
            result.passed
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-red-100 text-red-700 border-red-300'
          )}>
            {result.passed ? t.quiz.passed : t.quiz.failed}
          </Badge>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-xs text-gray-500">{t.quiz.correct}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-xs text-gray-500">{t.quiz.incorrect}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{unansweredCount}</div>
              <div className="text-xs text-gray-500">{t.quiz.unanswered}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {t.quiz.timeSpent}: {formatTime(result.timeSpentSeconds)}
          </div>

          <Progress
            value={result.score}
            className={cn('h-3', result.passed ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500')}
          />
          <p className="text-xs text-gray-400">
            {t.quiz.passingScore}: {result.earnedPoints}/{result.totalPoints} {isRTL ? 'نقاط' : 'points'}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push('/quizzes')}
        >
          {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {isRTL ? 'العودة للاختبارات' : 'Back to Quizzes'}
        </Button>
        {!result.passed && (
          <Button
            onClick={() => router.push(`/quizzes/${result.quizId}`)}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t.quiz.retakeQuiz}
          </Button>
        )}
      </div>

      {/* Question Review */}
      {result.showCorrectAnswers && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-500" />
            {t.quiz.reviewAnswers}
          </h2>

          {result.responses.map((response, idx) => {
            const isExpanded = expandedQuestions.has(response.questionId);
            return (
              <Card
                key={response.questionId}
                className={cn(
                  'border-l-4',
                  response.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                )}
              >
                <CardContent className="p-4">
                  <button
                    onClick={() => toggleQuestion(response.questionId)}
                    className="w-full flex items-center justify-between text-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0',
                        response.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      )}>
                        {response.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {idx + 1}. {isRTL && response.questionTextAr ? response.questionTextAr : response.questionText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {response.earnedPoints}/{response.points} {isRTL ? 'نقطة' : 'pt'}
                      </Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 pl-10">
                      {response.selectedOptionId && response.selectedOptionId !== response.correctOptionId && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>{isRTL ? 'إجابتك' : 'Your answer'}: {isRTL ? 'خطأ' : 'Incorrect'}</span>
                        </div>
                      )}
                      {!response.selectedOptionId && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <CircleDot className="w-4 h-4 shrink-0" />
                          <span>{t.quiz.unanswered}</span>
                        </div>
                      )}
                      {(response.explanation || response.explanationAr) && (
                        <div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{isRTL && response.explanationAr ? response.explanationAr : response.explanation}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
