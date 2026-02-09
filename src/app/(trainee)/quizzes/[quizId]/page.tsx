'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import type { QuizDetail, SubmitResponseInput } from '@/types/quiz';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Send,
  ArrowLeft,
  ArrowRight,
  Timer,
  HelpCircle,
  Target,
  Loader2,
} from 'lucide-react';

export default function TakeQuizPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch quiz and start attempt
  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);
        const quizData = await quizApi.getQuizForTaking(quizId);
        setQuiz(quizData);

        // Start attempt
        const { attemptId: newAttemptId } = await quizApi.startAttempt(quizId);
        setAttemptId(newAttemptId);

        // Set timer if time limit exists
        if (quizData.timeLimit) {
          setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (err: any) {
        console.error('Failed to start quiz:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    initQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining !== null]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || !quiz) return;
    setSubmitting(true);
    setShowConfirm(false);

    try {
      const responses: SubmitResponseInput[] = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] || null,
      }));

      const result = await quizApi.submitAttempt(attemptId, responses);
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/quizzes/results/${result.attemptId}`);
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setError(err.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  }, [attemptId, quiz, answers, router]);

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

  if (error || !quiz) {
    return (
      <div className="p-6">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold">{t.common.error}</h2>
            <p className="text-gray-500">{error || 'Quiz not found'}</p>
            <Button onClick={() => router.push('/quizzes')} variant="outline">
              {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
              {t.common.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {isRTL && quiz.titleAr ? quiz.titleAr : quiz.title}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {quiz.questions.length} {t.quiz.questions}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {t.quiz.passingScore}: {quiz.passingScore}%
            </span>
          </div>
        </div>
        {timeRemaining !== null && (
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold',
            timeRemaining <= 60 ? 'bg-red-100 text-red-600 animate-pulse' :
            timeRemaining <= 300 ? 'bg-amber-100 text-amber-600' :
            'bg-emerald-100 text-emerald-600'
          )}>
            <Timer className="w-5 h-5" />
            {formatTimer(timeRemaining)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>{t.quiz.question} {currentQuestionIndex + 1} {t.quiz.of} {quiz.questions.length}</span>
          <span>{answeredCount}/{quiz.questions.length} {isRTL ? 'تم الإجابة' : 'answered'}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Navigation Dots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quiz.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={cn(
              'w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-all',
              idx === currentQuestionIndex
                ? 'bg-emerald-500 text-white scale-110 shadow-lg'
                : answers[q.id]
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
              {currentQuestionIndex + 1}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isRTL && currentQuestion.questionTextAr ? currentQuestion.questionTextAr : currentQuestion.questionText}
              </h2>
              <Badge variant="outline" className="mt-2 text-xs">
                {currentQuestion.questionType === 'true_false'
                  ? (isRTL ? 'صح أو خطأ' : 'True / False')
                  : (isRTL ? 'اختيار متعدد' : 'Multiple Choice')
                }
              </Badge>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-start',
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <div className={cn(
                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'border-gray-300 text-gray-500'
                  )}>
                    {isSelected ? <CheckCircle2 className="w-5 h-5" /> : letters[idx]}
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {isRTL && option.optionTextAr ? option.optionTextAr : option.optionText}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          {isRTL ? <ChevronRight className="w-4 h-4 mr-1" /> : <ChevronLeft className="w-4 h-4 mr-1" />}
          {t.quiz.previousQuestion}
        </Button>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {t.quiz.nextQuestion}
            {isRTL ? <ChevronLeft className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        ) : (
          <Button
            onClick={() => setShowConfirm(true)}
            className="bg-emerald-500 hover:bg-emerald-600"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            {t.quiz.submitQuiz}
          </Button>
        )}
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <h3 className="text-lg font-semibold">{t.quiz.confirmSubmit}</h3>
              </div>
              <p className="text-gray-500">{t.quiz.confirmSubmitDesc}</p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{isRTL ? 'الإجابات المكتملة' : 'Answered'}</span>
                  <span className="font-medium">{answeredCount} / {quiz.questions.length}</span>
                </div>
                {answeredCount < quiz.questions.length && (
                  <p className="text-amber-600 mt-2 text-xs">
                    {isRTL
                      ? `لديك ${quiz.questions.length - answeredCount} أسئلة لم يتم الإجابة عليها`
                      : `You have ${quiz.questions.length - answeredCount} unanswered questions`
                    }
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                  {t.common.confirm}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
