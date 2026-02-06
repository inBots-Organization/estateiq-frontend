'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  BarChart3,
  Calendar,
  Award,
  AlertTriangle,
  Download,
  FileText,
} from 'lucide-react';

interface TeamReport {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
  };
  topPerformers: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  }[];
  lowPerformers: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  }[];
  monthlyTrends: {
    month: string;
    year: number;
    averageScore: number;
    totalSessions: number;
    activeUsers: number;
  }[];
}

export default function AdminReportsPage() {
  const { token } = useAuthStore();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TeamReport | null>(null);

  // Helper to get token from Zustand store or localStorage
  const getAuthToken = useCallback((): string | null => {
    if (token) return token;

    // Fallback to localStorage if store isn't hydrated yet
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || null;
      }
    } catch (e) {
      console.error('Failed to parse auth-storage:', e);
    }
    return null;
  }, [token]);

  const fetchData = useCallback(async () => {
    const authToken = getAuthToken();

    if (!authToken) {
      setError(isRTL ? 'غير مصرح' : 'Not authorized');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // NEXT_PUBLIC_API_URL already includes /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(isRTL ? 'فشل تحميل التقارير' : 'Failed to load reports');
      }

      const data = await response.json();

      // Transform dashboard data to report format
      setReport({
        overview: data.overview,
        topPerformers: data.teamPerformance?.bestPerformer
          ? [data.teamPerformance.bestPerformer]
          : [],
        lowPerformers: data.teamPerformance?.worstPerformer &&
          data.teamPerformance.worstPerformer.id !== data.teamPerformance.bestPerformer?.id
          ? [data.teamPerformance.worstPerformer]
          : [],
        monthlyTrends: data.monthlyTrends || [],
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : (isRTL ? 'فشل تحميل التقارير' : 'Failed to load reports'));
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, isRTL]);

  useEffect(() => {
    // Small delay to allow store hydration
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg w-1/3 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-6 bg-amber-500/10 rounded-full mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isRTL ? 'تعذر تحميل التقارير' : 'Unable to Load Reports'}
        </h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={fetchData} className="bg-violet-500 hover:bg-violet-600">
          <RefreshCw className="h-5 w-5 mr-2" />
          {isRTL ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    );
  }

  const engagementRate = report?.overview.totalUsers
    ? Math.round((report.overview.activeUsers / report.overview.totalUsers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isRTL ? 'تقارير الفريق' : 'Team Reports'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'تحليلات وإحصائيات أداء الفريق' : 'Team performance analytics and statistics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي المتدربين' : 'Total Trainees'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{report?.overview.totalUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {report?.overview.activeUsers ?? 0} {isRTL ? 'نشط' : 'active'}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-violet-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'متوسط الفريق' : 'Team Average'}</p>
                <p className={cn("text-3xl font-bold mt-1", getScoreColor(report?.overview.averageScore ?? 0))}>
                  {report?.overview.averageScore ?? '--'}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? 'الدرجة الإجمالية' : 'Overall score'}
                </p>
              </div>
              <div className="p-3 bg-violet-500/20 rounded-xl">
                <Target className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'الجلسات المكتملة' : 'Completed Sessions'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{report?.overview.completedSessions ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? 'من' : 'of'} {report?.overview.totalSessions ?? 0} {isRTL ? 'إجمالي' : 'total'}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'معدل المشاركة' : 'Engagement Rate'}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{engagementRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? 'المستخدمون النشطون' : 'Active users'}
                </p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-violet-500" />
                {isRTL ? 'اتجاهات الأداء الشهرية' : 'Monthly Performance Trends'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'تطور أداء الفريق خلال الأشهر الأخيرة' : 'Team performance progression over recent months'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {report?.monthlyTrends && report.monthlyTrends.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-2 h-48 pt-4">
                {report.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex flex-col items-center">
                      <span className="text-xs font-medium text-muted-foreground mb-1">
                        {trend.averageScore}%
                      </span>
                      <div
                        className={cn(
                          "w-full max-w-[60px] rounded-t-lg transition-all duration-500",
                          getScoreBg(trend.averageScore)
                        )}
                        style={{ height: `${Math.max(trend.averageScore * 1.5, 20)}px` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-medium text-foreground">{trend.month}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {trend.totalSessions} {isRTL ? 'جلسة' : 'sessions'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded" />
                  <span className="text-xs text-muted-foreground">{isRTL ? 'ممتاز (80%+)' : 'Excellent (80%+)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-xs text-muted-foreground">{isRTL ? 'جيد (70-79%)' : 'Good (70-79%)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span className="text-xs text-muted-foreground">{isRTL ? 'مقبول (60-69%)' : 'Fair (60-69%)'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{isRTL ? 'لا توجد بيانات كافية' : 'Not enough data yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top & Low Performers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5 text-emerald-500" />
              {isRTL ? 'أفضل الأداء' : 'Top Performers'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'المتدربون ذوو أعلى الدرجات' : 'Trainees with the highest scores'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report?.topPerformers && report.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {report.topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center gap-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-500">{performer.averageScore}%</p>
                      <p className="text-xs text-muted-foreground">
                        {performer.totalSessions} {isRTL ? 'جلسات' : 'sessions'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isRTL ? 'لا توجد بيانات بعد' : 'No data yet'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Low Performers */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {isRTL ? 'يحتاجون دعم' : 'Need Support'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'المتدربون الذين يحتاجون مساعدة إضافية' : 'Trainees who may need additional help'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report?.lowPerformers && report.lowPerformers.length > 0 ? (
              <div className="space-y-3">
                {report.lowPerformers.map((performer) => (
                  <div key={performer.id} className="flex items-center gap-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-500">{performer.averageScore}%</p>
                      <p className="text-xs text-muted-foreground">
                        {performer.totalSessions} {isRTL ? 'جلسات' : 'sessions'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-center">
                <Award className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-emerald-500">
                  {isRTL ? 'جميع المتدربين بخير!' : 'All trainees are doing well!'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'لا يوجد متدربون يحتاجون دعم إضافي' : 'No trainees need extra support'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
