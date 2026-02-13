'use client';

/**
 * Admin View of Trainee Reports
 *
 * This page allows admins to view the full reports page for any trainee,
 * showing the same data and visualizations as the trainee sees.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { SkillRadarChart } from '@/components/charts/SkillRadarChart';
import { VoiceReportsSection } from '@/components/reports/VoiceReportsSection';
import { TextReportsSection } from '@/components/reports/TextReportsSection';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Target,
  Calendar,
  Award,
  ChevronRight,
  ChevronLeft,
  Filter,
  BarChart3,
  Lightbulb,
  BookOpen,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  User,
} from 'lucide-react';

interface TraineeInfo {
  traineeId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DashboardData {
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  improvement: number;
  scoreHistory: { date: string; score: number; sessionId: string }[];
  recentSessions: {
    id: string;
    scenarioType: string;
    difficultyLevel: string;
    completedAt: string;
    score: number | null;
    grade: string | null;
  }[];
}

interface SkillData {
  skills: {
    skill: string;
    skillKey: string;
    averageScore: number | null;
    sessionCount: number;
    benchmark: number;
    tips: string[];
    isStrength: boolean;
    isWeakness: boolean;
  }[];
  strengths: string[];
  weaknesses: string[];
}

interface SessionData {
  sessions: {
    id: string;
    scenarioType: string;
    difficultyLevel: string;
    status: string;
    completedAt: string;
    durationSeconds: number | null;
    score: number | null;
    grade: string | null;
  }[];
  total: number;
  page: number;
  totalPages: number;
}

interface TrendData {
  month: string;
  year: number;
  averageScore: number | null;
  sessionCount: number;
}

interface RecommendationData {
  recommendations: {
    priority: string;
    title: string;
    description: string;
    category: string;
  }[];
  weakSkills: string[];
  suggestedCourses: { title: string; reason: string }[];
}

export default function AdminTraineeReportsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { isRTL } = useLanguage();

  const traineeId = params.traineeId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traineeInfo, setTraineeInfo] = useState<TraineeInfo | null>(null);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [skills, setSkills] = useState<SkillData | null>(null);
  const [sessions, setSessions] = useState<SessionData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);

  const [scenarioFilter, setScenarioFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to get token
  const getAuthToken = useCallback((): string | null => {
    console.log('[Admin Reports] getAuthToken called, zustand token:', token ? 'present' : 'null');
    if (token) return token;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      console.log('[Admin Reports] auth-storage from localStorage:', authStorage ? 'present' : 'null');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const storedToken = parsed?.state?.token || null;
        console.log('[Admin Reports] Parsed token from localStorage:', storedToken ? 'present' : 'null');
        return storedToken;
      }
    } catch (e) {
      console.error('Failed to parse auth-storage:', e);
    }
    return null;
  }, [token]);

  // Fetch trainee info and reports data
  const fetchData = useCallback(async () => {
    console.log('[Admin Reports] fetchData called for traineeId:', traineeId);
    const authToken = getAuthToken();
    console.log('[Admin Reports] authToken:', authToken ? `present (${authToken.substring(0, 20)}...)` : 'null');

    if (!authToken) {
      console.error('[Admin Reports] No auth token found!');
      setError(isRTL ? 'غير مصرح' : 'Not authorized');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Remove /api suffix if present to avoid duplication
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    console.log('[Admin Reports] API URLs - apiUrl:', apiUrl, ', baseUrl:', baseUrl);

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    try {
      // First verify admin has access to this trainee
      const traineeRes = await fetch(`${apiUrl}/admin/trainee/${traineeId}/reports`, { headers });
      if (!traineeRes.ok) {
        if (traineeRes.status === 404) {
          setError(isRTL ? 'المتدرب غير موجود' : 'Trainee not found');
        } else {
          setError(isRTL ? 'غير مصرح بالوصول' : 'Access denied');
        }
        setIsLoading(false);
        return;
      }
      const traineeData = await traineeRes.json();
      setTraineeInfo(traineeData);

      // Fetch all reports data for the trainee (using trainee's reports endpoints with admin override)
      console.log('[Admin Reports] Fetching reports for traineeId:', traineeId);
      console.log('[Admin Reports] API URL:', apiUrl, 'Base URL:', baseUrl);

      const [dashboardRes, skillsRes, sessionsRes, trendsRes, recsRes] = await Promise.all([
        fetch(`${baseUrl}/api/reports/${traineeId}/dashboard`, { headers }),
        fetch(`${baseUrl}/api/reports/${traineeId}/skills`, { headers }),
        fetch(`${baseUrl}/api/reports/${traineeId}/sessions?page=${currentPage}&limit=10&scenarioType=${scenarioFilter}`, { headers }),
        fetch(`${baseUrl}/api/reports/${traineeId}/trends?months=6`, { headers }),
        fetch(`${baseUrl}/api/reports/${traineeId}/recommendations`, { headers }),
      ]);

      console.log('[Admin Reports] Dashboard response:', dashboardRes.status, dashboardRes.ok);
      console.log('[Admin Reports] Skills response:', skillsRes.status, skillsRes.ok);
      console.log('[Admin Reports] Sessions response:', sessionsRes.status, sessionsRes.ok);
      console.log('[Admin Reports] Trends response:', trendsRes.status, trendsRes.ok);
      console.log('[Admin Reports] Recommendations response:', recsRes.status, recsRes.ok);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        console.log('[Admin Reports] Dashboard data:', dashboardData);
        setDashboard(dashboardData);
      } else {
        console.error('[Admin Reports] Dashboard error:', await dashboardRes.text());
      }

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        console.log('[Admin Reports] Skills data:', skillsData);
        setSkills(skillsData);
      } else {
        console.error('[Admin Reports] Skills error:', await skillsRes.text());
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        console.log('[Admin Reports] Sessions data:', sessionsData);
        setSessions(sessionsData);
      } else {
        console.error('[Admin Reports] Sessions error:', await sessionsRes.text());
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        console.log('[Admin Reports] Trends data:', trendsData);
        setTrends(trendsData);
      } else {
        console.error('[Admin Reports] Trends error:', await trendsRes.text());
      }

      if (recsRes.ok) {
        const recsData = await recsRes.json();
        console.log('[Admin Reports] Recommendations data:', recsData);
        setRecommendations(recsData);
      } else {
        console.error('[Admin Reports] Recommendations error:', await recsRes.text());
      }

    } catch (err) {
      console.error('Error fetching trainee reports:', err);
      setError(isRTL ? 'فشل تحميل التقارير' : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, traineeId, currentPage, scenarioFilter, isRTL]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const formatScenarioType = (type: string) => {
    const scenarioMap: Record<string, { en: string; ar: string }> = {
      'property_showing': { en: 'Property Showing', ar: 'عرض العقار' },
      'price_negotiation': { en: 'Price Negotiation', ar: 'التفاوض على السعر' },
      'objection_handling': { en: 'Objection Handling', ar: 'التعامل مع الاعتراضات' },
      'first_contact': { en: 'First Contact', ar: 'الاتصال الأول' },
      'closing_deal': { en: 'Closing Deal', ar: 'إغلاق الصفقة' },
      'difficult_client': { en: 'Difficult Client', ar: 'عميل صعب' },
    };
    return scenarioMap[type]?.[isRTL ? 'ar' : 'en'] || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const minutes = Math.round(seconds / 60);
    return isRTL ? `${minutes} دقيقة` : `${minutes} min`;
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
      case 'B': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
      case 'C': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
      case 'D': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
      case 'F': return 'bg-red-500/20 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      'easy': { en: 'Easy', ar: 'سهل' },
      'medium': { en: 'Medium', ar: 'متوسط' },
      'hard': { en: 'Hard', ar: 'صعب' },
    };
    return labels[difficulty]?.[isRTL ? 'ar' : 'en'] || difficulty;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      'high': { en: 'High', ar: 'عالي' },
      'medium': { en: 'Medium', ar: 'متوسط' },
      'low': { en: 'Low', ar: 'منخفض' },
    };
    return labels[priority]?.[isRTL ? 'ar' : 'en'] || priority;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        </div>
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
            <p className="text-muted-foreground">{isRTL ? 'جاري تحميل التقارير...' : 'Loading reports...'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isRTL ? 'تقارير المتدرب' : 'Trainee Reports'}
          </h1>
        </div>
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">{error}</p>
            <Link href="/admin/voice-sessions">
              <Button className="mt-4 bg-violet-600 hover:bg-violet-700">
                <BackIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'العودة للجلسات' : 'Back to Sessions'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-violet-500" />
              <h1 className="text-2xl font-bold text-foreground">
                {traineeInfo ? `${traineeInfo.firstName} ${traineeInfo.lastName}` : (isRTL ? 'تقارير المتدرب' : 'Trainee Reports')}
              </h1>
            </div>
            {traineeInfo && (
              <p className="text-muted-foreground text-sm mt-1">{traineeInfo.email}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'إجمالي الجلسات' : 'Total Sessions'}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{dashboard?.completedSessions ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'المحاكاة المكتملة' : 'Completed simulations'}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-violet-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'متوسط الدرجات' : 'Average Score'}
            </CardTitle>
            <Target className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", getScoreColor(dashboard?.averageScore ?? null))}>
              {dashboard?.averageScore ?? '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'عبر جميع السيناريوهات' : 'Across all scenarios'}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'التحسن' : 'Improvement'}
            </CardTitle>
            {(dashboard?.improvement ?? 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              (dashboard?.improvement ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {(dashboard?.improvement ?? 0) >= 0 ? '+' : ''}{dashboard?.improvement ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'نقاط منذ البداية' : 'Points since start'}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'أقوى مهارة' : 'Top Skill'}
            </CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">
              {skills?.strengths?.[0] || (isRTL ? 'يحتاج تدريب' : 'Keep practicing')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'أقوى منطقة' : 'Strongest area'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Breakdown */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              {isRTL ? 'أداء المهارات' : 'Skill Performance'}
            </CardTitle>
            <CardDescription>{isRTL ? 'الأداء عبر المجالات المختلفة' : 'Performance across different areas'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills?.skills?.map((skill) => (
                <div key={skill.skillKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {skill.isStrength && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {skill.isWeakness && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                    </div>
                    <span className={cn("text-sm font-bold", getScoreColor(skill.averageScore))}>
                      {skill.averageScore ?? '--'}
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 rounded-full transition-all duration-500",
                        isRTL ? "right-0" : "left-0",
                        skill.averageScore !== null && skill.averageScore >= 75 ? "bg-emerald-500" :
                        skill.averageScore !== null && skill.averageScore >= 60 ? "bg-blue-500" :
                        skill.averageScore !== null ? "bg-amber-500" : "bg-muted-foreground"
                      )}
                      style={{ width: `${skill.averageScore ?? 0}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-8">
                  {isRTL ? 'أكمل المحاكاة لرؤية تحليل المهارات' : 'Complete simulations to see skill analysis'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Trend Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {isRTL ? 'تطور الدرجات' : 'Score Progression'}
            </CardTitle>
            <CardDescription>{isRTL ? 'الأداء بمرور الوقت' : 'Performance over time'}</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ScoreChart
                data={trends}
                height={200}
                showBenchmark={true}
                benchmarkValue={75}
              />
            ) : (
              <p className="text-muted-foreground text-center py-16">
                {isRTL ? 'أكمل المزيد من المحاكاة لرؤية الرسم البياني' : 'Complete more simulations to see the chart'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill Radar Chart */}
      {skills?.skills && skills.skills.some(s => s.averageScore !== null) && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-violet-500" />
              {isRTL ? 'رادار المهارات' : 'Skill Radar'}
            </CardTitle>
            <CardDescription>{isRTL ? 'مقارنة مرئية للمهارات' : 'Visual comparison of skills'}</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillRadarChart
              skills={skills.skills}
              height={300}
              showBenchmark={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Sessions Table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">{isRTL ? 'سجل الجلسات' : 'Session History'}</CardTitle>
              <CardDescription>{isRTL ? 'جميع الجلسات المكتملة' : 'All completed sessions'}</CardDescription>
            </div>
            <Select value={scenarioFilter} onValueChange={setScenarioFilter}>
              <SelectTrigger className="w-48">
                <Filter className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                <SelectValue placeholder={isRTL ? 'تصفية حسب السيناريو' : 'Filter by scenario'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'جميع السيناريوهات' : 'All Scenarios'}</SelectItem>
                <SelectItem value="property_showing">{isRTL ? 'عرض العقار' : 'Property Showing'}</SelectItem>
                <SelectItem value="price_negotiation">{isRTL ? 'التفاوض على السعر' : 'Price Negotiation'}</SelectItem>
                <SelectItem value="objection_handling">{isRTL ? 'التعامل مع الاعتراضات' : 'Objection Handling'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {sessions?.sessions && sessions.sessions.length > 0 ? (
            <>
              <div className="space-y-3">
                {sessions.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border",
                        getGradeColor(session.grade)
                      )}>
                        {session.grade || '--'}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {formatScenarioType(session.scenarioType)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.completedAt)}
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {getDifficultyLabel(session.difficultyLevel)}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className={cn("text-xl font-bold", getScoreColor(session.score))}>
                        {session.score ?? '--'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(session.durationSeconds)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {sessions.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    {isRTL
                      ? `صفحة ${sessions.page} من ${sessions.totalPages}`
                      : `Page ${sessions.page} of ${sessions.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(sessions.totalPages, p + 1))}
                    disabled={currentPage === sessions.totalPages}
                  >
                    {isRTL ? 'التالي' : 'Next'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              {isRTL ? 'لا توجد جلسات' : 'No sessions yet'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            {isRTL ? 'التوصيات الشخصية' : 'Personalized Recommendations'}
          </CardTitle>
          <CardDescription>{isRTL ? 'اقتراحات الذكاء الاصطناعي للتحسين' : 'AI suggestions for improvement'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-500" />
                {isRTL ? 'مجالات التركيز' : 'Focus Areas'}
              </h4>
              {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
                recommendations.recommendations.slice(0, 3).map((rec, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-xl",
                      isRTL ? "border-r-4" : "border-l-4",
                      rec.priority === 'high' ? "bg-red-500/10 border-red-500" :
                      rec.priority === 'medium' ? "bg-amber-500/10 border-amber-500" :
                      "bg-blue-500/10 border-blue-500"
                    )}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs uppercase font-semibold mb-2",
                        rec.priority === 'high' ? "text-red-500 border-red-500/50" :
                        rec.priority === 'medium' ? "text-amber-500 border-amber-500/50" :
                        "text-blue-500 border-blue-500/50"
                      )}
                    >
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                    <h5 className="font-medium text-foreground">{rec.title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground py-4">
                  {isRTL ? 'أكمل المزيد من الجلسات للحصول على توصيات' : 'Complete more sessions for recommendations'}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                {isRTL ? 'الدورات المقترحة' : 'Suggested Courses'}
              </h4>
              {recommendations?.suggestedCourses && recommendations.suggestedCourses.length > 0 ? (
                recommendations.suggestedCourses.map((course, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-xl">
                    <h5 className="font-medium text-foreground">{course.title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{course.reason}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <h5 className="font-medium text-emerald-500">{isRTL ? 'عمل رائع!' : 'Great job!'}</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'استمر في التدريب للحفاظ على مهاراتك!' : 'Keep practicing to maintain your skills!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Reports Section */}
      <VoiceReportsSection traineeId={traineeId} />

      {/* Text Reports Section */}
      <TextReportsSection traineeId={traineeId} />
    </div>
  );
}
