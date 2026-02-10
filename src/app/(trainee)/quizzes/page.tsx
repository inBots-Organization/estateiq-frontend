'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import type { QuizListItem, TraineeAttemptHistoryItem } from '@/types/quiz';
import {
  ClipboardCheck,
  Search,
  Clock,
  Target,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  BarChart3,
  Sparkles,
  BookOpen,
  History,
  Loader2,
  Wand2,
} from 'lucide-react';

export default function QuizzesPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [history, setHistory] = useState<TraineeAttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizzesRes, historyRes] = await Promise.all([
          quizApi.getAvailableQuizzes(),
          quizApi.getTraineeHistory(),
        ]);
        setQuizzes(quizzesRes.quizzes);
        setHistory(historyRes.history);
      } catch (err) {
        console.error('Failed to fetch quiz data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const difficulties = useMemo(() => [
    { id: 'all', label: isRTL ? 'جميع المستويات' : 'All Levels' },
    { id: 'easy', label: t.quiz.easy },
    { id: 'medium', label: t.quiz.medium },
    { id: 'hard', label: t.quiz.hard },
  ], [isRTL, t]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const title = (isRTL && quiz.titleAr ? quiz.titleAr : quiz.title).toLowerCase();
      const desc = (isRTL && quiz.descriptionAr ? quiz.descriptionAr : quiz.description).toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = title.includes(query) || desc.includes(query);
      const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [quizzes, searchQuery, selectedDifficulty, isRTL]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
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

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      // Generate a quiz based on trainee's level (AI will determine difficulty)
      const newQuiz = await quizApi.generateQuiz({
        topic: isRTL ? 'العقارات السعودية' : 'Saudi Real Estate',
        numberOfQuestions: 5,
        questionTypes: ['multiple_choice', 'true_false'],
      });

      // Refresh the quiz list
      const quizzesRes = await quizApi.getAvailableQuizzes();
      setQuizzes(quizzesRes.quizzes);

      // Navigate to the new quiz
      router.push(`/quizzes/${newQuiz.id}`);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      alert(isRTL ? 'فشل إنشاء الاختبار. حاول مرة أخرى.' : 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
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
            <ClipboardCheck className="w-7 h-7 text-emerald-500" />
            {t.quiz.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.quiz.quizzesDesc}</p>
        </div>
        <Button
          onClick={handleGenerateQuiz}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isRTL ? 'جاري الإنشاء...' : 'Generating...'}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {isRTL ? 'اختبار ذكي جديد' : 'AI Smart Quiz'}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('available')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'available'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <BookOpen className="w-4 h-4" />
          {t.quiz.availableQuizzes}
          <Badge variant="secondary" className="ml-1">{quizzes.length}</Badge>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <History className="w-4 h-4" />
          {t.quiz.myAttempts}
          <Badge variant="secondary" className="ml-1">{history.length}</Badge>
        </button>
      </div>

      {activeTab === 'available' && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={isRTL ? 'ابحث عن اختبار...' : 'Search quizzes...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("h-10", isRTL ? "pr-9" : "pl-9")}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {difficulties.map((d) => (
                <Button
                  key={d.id}
                  variant={selectedDifficulty === d.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={selectedDifficulty === d.id ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quiz Grid */}
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">{t.quiz.noQuizzesAvailable}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
                  onClick={() => router.push(`/quizzes/${quiz.id}`)}
                >
                  {/* Gradient top stripe */}
                  <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {isRTL && quiz.titleAr ? quiz.titleAr : quiz.title}
                      </h3>
                      <Badge className={cn('shrink-0 text-xs', getDifficultyColor(quiz.difficulty))}>
                        {getDifficultyLabel(quiz.difficulty)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {isRTL && quiz.descriptionAr ? quiz.descriptionAr : quiz.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {quiz.questionCount} {t.quiz.questions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {quiz.timeLimit ? `${quiz.timeLimit} ${isRTL ? 'دقيقة' : 'min'}` : t.quiz.noTimeLimit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {quiz.passingScore}%
                      </span>
                    </div>

                    {quiz.quizType === 'ai_generated' && (
                      <Badge variant="outline" className="text-xs text-purple-600 border-purple-300 bg-purple-50">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t.quiz.aiGenerated}
                      </Badge>
                    )}

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        size="sm"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {t.quiz.takeQuiz}
                        <ChevronIcon className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {history.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">{t.quiz.noAttemptsYet}</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((attempt) => (
                <Card
                  key={attempt.attemptId}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    if (attempt.status === 'completed') {
                      router.push(`/quizzes/results/${attempt.attemptId}`);
                    }
                  }}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        attempt.passed ? 'bg-green-100 text-green-600' :
                        attempt.status === 'completed' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      )}>
                        {attempt.passed ? <Trophy className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {isRTL && attempt.quizTitleAr ? attempt.quizTitleAr : attempt.quizTitle}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(attempt.startedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                          {attempt.timeSpentSeconds && ` • ${formatTime(attempt.timeSpentSeconds)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {attempt.status === 'completed' && attempt.score !== null && (
                        <div className={cn(
                          'text-lg font-bold',
                          attempt.passed ? 'text-green-600' : 'text-red-600'
                        )}>
                          {Math.round(attempt.score)}%
                        </div>
                      )}
                      <Badge variant={attempt.passed ? 'default' : 'secondary'} className={cn(
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
                      {attempt.status === 'completed' && (
                        <ChevronIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
