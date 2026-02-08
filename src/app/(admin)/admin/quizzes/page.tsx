'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import type { QuizListItem } from '@/types/quiz';
import {
  Plus,
  ClipboardCheck,
  Eye,
  Pencil,
  Trash2,
  Users,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Sparkles,
  Clock,
  Target,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminQuizzesPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizApi.getAdminQuizzes();
      setQuizzes(res.quizzes);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleTogglePublish = async (quizId: string, currentPublished: boolean) => {
    setTogglingId(quizId);
    try {
      await quizApi.publishQuiz(quizId, !currentPublished);
      setQuizzes((prev) =>
        prev.map((q) => q.id === quizId ? { ...q, isPublished: !currentPublished } : q)
      );
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (quizId: string) => {
    setDeletingId(quizId);
    try {
      await quizApi.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t.quiz.easy;
      case 'medium': return t.quiz.medium;
      case 'hard': return t.quiz.hard;
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-violet-500" />
            {t.quiz.manageQuizzes}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {quizzes.length} {isRTL ? 'اختبار' : 'quizzes'}
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/quizzes/create')}
          className="bg-violet-500 hover:bg-violet-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.quiz.createQuiz}
        </Button>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">{t.quiz.noQuizzesAvailable}</h3>
          <p className="text-gray-400 mt-1">{isRTL ? 'ابدأ بإنشاء اختبار جديد' : 'Get started by creating a new quiz'}</p>
          <Button
            onClick={() => router.push('/admin/quizzes/create')}
            className="mt-4 bg-violet-500 hover:bg-violet-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.quiz.createQuiz}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {isRTL && quiz.titleAr ? quiz.titleAr : quiz.title}
                      </h3>
                      <Badge className={cn('text-xs', getDifficultyColor(quiz.difficulty))}>
                        {getDifficultyLabel(quiz.difficulty)}
                      </Badge>
                      <Badge variant={quiz.isPublished ? 'default' : 'secondary'}
                        className={cn(
                          'text-xs',
                          quiz.isPublished
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        )}
                      >
                        {quiz.isPublished ? t.quiz.published : t.quiz.draft}
                      </Badge>
                      {quiz.quizType === 'ai_generated' && (
                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {t.quiz.aiGenerated}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {isRTL && quiz.descriptionAr ? quiz.descriptionAr : quiz.description}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {quiz.questionCount} {t.quiz.questionCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {quiz.attemptCount} {t.quiz.attemptCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {t.quiz.passingScore}: {quiz.passingScore}%
                      </span>
                      {quiz.timeLimit && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {quiz.timeLimit} {isRTL ? 'دقيقة' : 'min'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}
                      disabled={togglingId === quiz.id}
                    >
                      {togglingId === quiz.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : quiz.isPublished ? (
                        <ToggleRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/quizzes/${quiz.id}/attempts`)}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/quizzes/${quiz.id}`)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(quiz.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <h3 className="text-lg font-semibold">{t.quiz.confirmDelete}</h3>
              </div>
              <p className="text-gray-500">{t.quiz.confirmDeleteDesc}</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                  {t.common.cancel}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deletingId === showDeleteConfirm}
                >
                  {deletingId === showDeleteConfirm ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  {t.common.delete}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
