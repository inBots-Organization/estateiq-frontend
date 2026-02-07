'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  MessageSquare,
  BarChart,
  Flame,
  Clock,
  Award,
  TrendingUp,
  Target,
  Phone,
  Calendar,
  CheckCircle2,
  Play,
  ArrowUpRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { traineeApi, DashboardStats } from '@/lib/api/trainee.api';
import { courses } from '@/data/courses';

export default function DashboardPage() {
  const { t, isRTL, language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate local courses progress
  const totalLocalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLocalLessons = courses.reduce((sum, course) => {
    return sum + course.lessons.filter(lesson => completedLessonIds.has(lesson.id)).length;
  }, 0);
  const localCoursesProgress = totalLocalLessons > 0
    ? Math.round((completedLocalLessons / totalLocalLessons) * 100)
    : 0;

  // Count completed local courses (all lessons done)
  const completedLocalCourses = courses.filter(course => {
    return course.lessons.every(lesson => completedLessonIds.has(lesson.id));
  }).length;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats and profile in parallel
        const [dashboardData, profile] = await Promise.all([
          traineeApi.getDashboardStats(),
          traineeApi.getProfile()
        ]);

        setStats(dashboardData);

        // Set completed lecture IDs from profile
        if (profile.progress?.completedLectureIds) {
          setCompletedLessonIds(new Set(profile.progress.completedLectureIds));
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(isRTL ? 'فشل في تحميل البيانات' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isRTL]);

  // Format time based on language
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return isRTL ? `${mins} دقيقة` : `${mins}m`;
    }
    if (mins === 0) {
      return isRTL ? `${hours} ساعة` : `${hours}h`;
    }
    return isRTL ? `${hours} ساعة ${mins} دقيقة` : `${hours}h ${mins}m`;
  };

  // Format days
  const formatDays = (days: number) => {
    if (days === 0) {
      return isRTL ? 'ابدأ اليوم!' : 'Start today!';
    }
    return isRTL ? `${days} ${days === 1 ? 'يوم' : 'أيام'}` : `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get session type label
  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      simulation: { ar: 'محاكاة', en: 'Simulation' },
      voice: { ar: 'محادثة صوتية', en: 'Voice Call' },
      lecture: { ar: 'درس', en: 'Lecture' },
    };
    return labels[type]?.[language] || type;
  };

  // Day name translation
  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      Sun: 'الأحد',
      Mon: 'الإثنين',
      Tue: 'الثلاثاء',
      Wed: 'الأربعاء',
      Thu: 'الخميس',
      Fri: 'الجمعة',
      Sat: 'السبت',
    };
    return isRTL ? days[day] || day : day;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {isRTL ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use stats or default values, and merge with local course progress
  const data = {
    totalTimeOnPlatform: stats?.totalTimeOnPlatform || 0,
    currentStreak: stats?.currentStreak || 0,
    // Use local courses progress if available, otherwise use backend
    overallProgress: localCoursesProgress > 0 ? localCoursesProgress : (stats?.overallProgress || 0),
    averageScore: stats?.averageScore || 0,
    simulationsCompleted: stats?.simulationsCompleted || 0,
    // Use local completed courses count
    coursesCompleted: completedLocalCourses > 0 ? completedLocalCourses : (stats?.coursesCompleted || 0),
    voiceCallsCompleted: stats?.voiceCallsCompleted || 0,
    // Use local completed lessons count
    lecturesCompleted: completedLocalLessons > 0 ? completedLocalLessons : (stats?.lecturesCompleted || 0),
    assessmentsPassed: stats?.assessmentsPassed || 0,
    recentSessions: stats?.recentSessions || [],
    weeklyActivity: stats?.weeklyActivity || [],
    currentCourse: stats?.currentCourse || null,
  };

  // Calculate max for weekly activity chart
  const maxMinutes = Math.max(...(data.weeklyActivity?.map(d => d.minutes) || [0]), 1);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t.dashboard.welcome}</h1>
        </div>
        <p className="text-muted-foreground">{t.dashboard.continueJourney}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Overall Progress */}
        <Card className="relative overflow-hidden border border-border/50 shadow-lg bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.overallProgress}
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground">{data.overallProgress}%</div>
            <Progress value={data.overallProgress} className="mt-3 h-2" />
            {data.overallProgress > 0 && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  {isRTL ? 'استمر!' : 'Keep going!'}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="relative overflow-hidden border border-border/50 shadow-lg bg-gradient-to-br from-emerald-500/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.averageScore}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground">
              {data.averageScore > 0 ? `${data.averageScore}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t.dashboard.acrossAssessments}</p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="relative overflow-hidden border border-border/50 shadow-lg bg-gradient-to-br from-amber-500/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.currentStreak}
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Flame className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground">{formatDays(data.currentStreak)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t.dashboard.keepItGoing}</p>
          </CardContent>
        </Card>

        {/* Time Invested */}
        <Card className="relative overflow-hidden border border-border/50 shadow-lg bg-gradient-to-br from-blue-500/10 via-background to-background">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.dashboard.timeInvested}
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-foreground">{formatTime(data.totalTimeOnPlatform)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalTimeOnPlatform} {t.dashboard.minutesTotal}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Left Column - Action Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Course Progress */}
          {data.currentCourse && (
            <Card className="border border-border/50 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t.dashboard.continueLearning}
                </CardTitle>
                <CardDescription>{t.dashboard.pickUpWhereYouLeft}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className={cn('font-semibold text-foreground mb-1', isRTL && 'font-arabic')}>
                        {data.currentCourse.title}
                      </h4>
                      {data.currentCourse.nextLectureTitle && (
                        <p className={cn('text-sm text-muted-foreground', isRTL && 'font-arabic')}>
                          {isRTL ? 'الدرس التالي:' : 'Next:'} {data.currentCourse.nextLectureTitle}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {data.currentCourse.progress}%
                    </Badge>
                  </div>
                  <Progress value={data.currentCourse.progress} className="h-2 mb-4" />
                  <Link href="/courses">
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      <Play className="h-4 w-4 me-2" />
                      {t.dashboard.continueCourse}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Practice Simulations */}
            <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {t.dashboard.practiceSimulations}
                </CardTitle>
                <CardDescription>{t.dashboard.sharpenSkills}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/30 rounded-lg border border-border/50 mb-4">
                  <p className={cn('text-sm text-muted-foreground', isRTL && 'font-arabic')}>
                    {t.dashboard.recommendedScenario}
                  </p>
                  <p className={cn('font-medium text-foreground', isRTL && 'font-arabic')}>
                    {t.dashboard.priceNegotiation}
                  </p>
                </div>
                <Link href="/simulation">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {t.dashboard.startSimulation}
                    <ArrowUpRight className="h-4 w-4 ms-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Voice Practice */}
            <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-all group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                  <Phone className="h-5 w-5 text-primary" />
                  {t.dashboard.voicePractice}
                </CardTitle>
                <CardDescription>{t.dashboard.practiceWithAI}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/30 rounded-lg border border-border/50 mb-4">
                  <p className={cn('text-sm text-muted-foreground', isRTL && 'font-arabic')}>
                    {t.dashboard.realtimeConversation}
                  </p>
                  <Badge variant="secondary" className="mt-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    {t.dashboard.newFeature}
                  </Badge>
                </div>
                <Link href="/voice-training">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {t.dashboard.startVoiceCall}
                    <ArrowUpRight className="h-4 w-4 ms-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Weekly Activity */}
        <div className="space-y-6">
          <Card className="border border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                {isRTL ? 'نشاط الأسبوع' : 'Weekly Activity'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'آخر 7 أيام' : 'Last 7 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.weeklyActivity?.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-12 shrink-0">
                      {getDayName(day.day)}
                    </span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                        style={{ width: `${(day.minutes / maxMinutes) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-end">
                      {day.minutes > 0 ? `${day.minutes}m` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Summary Section */}
      <Card className="border border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart className="h-5 w-5 text-primary" />
            {t.dashboard.yourProgress}
          </CardTitle>
          <CardDescription>{t.dashboard.viewDetailedAnalytics}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{data.simulationsCompleted}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.simulations}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mx-auto mb-2">
                <Phone className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{data.voiceCallsCompleted}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.voiceCalls}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-blue-500/10 w-fit mx-auto mb-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{data.lecturesCompleted}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'دروس' : 'Lectures'}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-500/5 to-transparent rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-amber-500/10 w-fit mx-auto mb-2">
                <CheckCircle2 className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{data.coursesCompleted}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.courses}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-purple-500/10 w-fit mx-auto mb-2">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{data.averageScore > 0 ? `${data.averageScore}%` : '—'}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.avgScore}</p>
            </div>
          </div>

          {/* Recent Sessions */}
          {data.recentSessions && data.recentSessions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {isRTL ? 'الجلسات الأخيرة' : 'Recent Sessions'}
              </h4>
              <div className="space-y-2">
                {data.recentSessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-1.5 rounded-lg',
                        session.type === 'simulation' && 'bg-primary/10',
                        session.type === 'voice' && 'bg-emerald-500/10',
                        session.type === 'lecture' && 'bg-blue-500/10'
                      )}>
                        {session.type === 'simulation' && <MessageSquare className="h-4 w-4 text-primary" />}
                        {session.type === 'voice' && <Phone className="h-4 w-4 text-emerald-500" />}
                        {session.type === 'lecture' && <BookOpen className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {getSessionTypeLabel(session.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.completedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      {session.score !== null && (
                        <Badge variant={session.score >= 70 ? 'default' : 'secondary'} className={cn(
                          session.score >= 70 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''
                        )}>
                          {session.score}%
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(session.durationSeconds / 60)}m
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link href="/reports">
            <Button variant="outline" className="w-full">
              <BarChart className="h-4 w-4 me-2" />
              {t.dashboard.viewReports}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
