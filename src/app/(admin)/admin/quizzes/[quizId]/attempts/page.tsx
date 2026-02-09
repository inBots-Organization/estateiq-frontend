'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import type { AdminAttemptItem, QuizDetail } from '@/types/quiz';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Trophy,
  XCircle,
  Clock,
  ClipboardCheck,
  Loader2,
  Mail,
  User,
  BarChart3,
} from 'lucide-react';

export default function QuizAttemptsPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [attempts, setAttempts] = useState<AdminAttemptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizData, attemptsData] = await Promise.all([
          quizApi.getQuizForAdmin(quizId),
          quizApi.getQuizAttempts(quizId),
        ]);
        setQuiz(quizData);
        setAttempts(attemptsData.attempts);
      } catch (err) {
        console.error('Failed to fetch attempts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const passedCount = attempts.filter((a) => a.passed).length;
  const completedCount = attempts.filter((a) => a.status === 'completed').length;
  const avgScore = completedCount > 0
    ? Math.round(
        attempts
          .filter((a) => a.status === 'completed' && a.score !== null)
          .reduce((sum, a) => sum + (a.score || 0), 0) / completedCount
      )
    : 0;

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/quizzes')}>
          <BackIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-violet-500" />
            {t.quiz.traineeAttempts}
          </h1>
          <p className="text-gray-500 mt-1">
            {quiz ? (isRTL && quiz.titleAr ? quiz.titleAr : quiz.title) : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-violet-600">{attempts.length}</div>
            <div className="text-xs text-gray-500 mt-1">{isRTL ? 'إجمالي المحاولات' : 'Total Attempts'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{passedCount}</div>
            <div className="text-xs text-gray-500 mt-1">{t.quiz.passed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{completedCount - passedCount}</div>
            <div className="text-xs text-gray-500 mt-1">{t.quiz.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{avgScore}%</div>
            <div className="text-xs text-gray-500 mt-1">{isRTL ? 'متوسط الدرجة' : 'Avg Score'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attempts Table */}
      {attempts.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">{t.quiz.noAttempts}</h3>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-start font-medium text-gray-500">{isRTL ? 'المتدرب' : 'Trainee'}</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">{isRTL ? 'البريد' : 'Email'}</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">{t.quiz.score}</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">{isRTL ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">{t.quiz.timeSpent}</th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">{isRTL ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.attemptId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-violet-600" />
                          </div>
                          <span className="font-medium">{attempt.traineeFirstName} {attempt.traineeLastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {attempt.traineeEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {attempt.score !== null ? (
                          <span className={cn('font-bold', attempt.passed ? 'text-green-600' : 'text-red-600')}>
                            {Math.round(attempt.score)}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn(
                          'text-xs',
                          attempt.passed ? 'bg-green-100 text-green-700' :
                          attempt.status === 'completed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          {attempt.status === 'completed'
                            ? (attempt.passed ? t.quiz.passed : t.quiz.failed)
                            : attempt.status === 'in_progress'
                              ? (isRTL ? 'قيد التنفيذ' : 'In Progress')
                              : (isRTL ? 'متروك' : 'Abandoned')
                          }
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(attempt.timeSpentSeconds)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(attempt.startedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
