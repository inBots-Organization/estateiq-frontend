'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRoleSafe } from '@/contexts/AdminRoleContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Activity,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Clock,
  Phone,
  MessageSquare,
  UserCheck,
  Zap,
  Trophy,
  GraduationCap,
} from 'lucide-react';

interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  averageSessionsPerUser: number;
}

interface TeamPerformance {
  bestPerformer: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  } | null;
  worstPerformer: {
    id: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  } | null;
  averageTeamScore: number;
}

interface MonthlyTrend {
  month: string;
  year: number;
  averageScore: number;
  totalSessions: number;
  activeUsers: number;
}

interface RecentActivity {
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

interface DashboardData {
  overview: OverviewStats;
  teamPerformance: TeamPerformance;
  monthlyTrends: MonthlyTrend[];
  recentActivity: RecentActivity[];
}

export default function AdminDashboardPage() {
  const { token, user } = useAuthStore();
  const { isRTL } = useLanguage();
  const { isTrainer, isOrgAdmin } = useAdminRoleSafe();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

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
      // NEXT_PUBLIC_API_URL already includes /api, so we just append the endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      console.log('[AdminDashboard] Fetching from:', `${apiUrl}/admin/dashboard`);

      const response = await fetch(`${apiUrl}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[AdminDashboard] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AdminDashboard] Error response:', errorText);
        if (response.status === 403) {
          setError(isRTL ? 'الوصول مرفوض. مطلوب صلاحيات المسؤول.' : 'Access denied. Admin privileges required.');
        } else {
          setError(isRTL ? 'فشل تحميل البيانات' : 'Failed to load dashboard data');
        }
        return;
      }

      const data = await response.json();
      console.log('[AdminDashboard] Data received:', data);
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error('[AdminDashboard] Error fetching:', err);
      setError(isRTL ? 'فشل الاتصال بالخادم' : 'Failed to connect to server');
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

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}${isRTL ? 'د' : 'm'}`;
    if (diffHours < 24) return `${diffHours}${isRTL ? 'س' : 'h'}`;
    if (diffDays < 7) return `${diffDays}${isRTL ? 'ي' : 'd'}`;
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg w-1/3 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 bg-muted rounded-2xl animate-pulse" />
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="p-6 bg-amber-500/10 rounded-full mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isRTL ? 'تعذر تحميل لوحة التحكم' : 'Unable to Load Dashboard'}
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
        <Button onClick={fetchData} size="lg" className="bg-violet-500 hover:bg-violet-600">
          <RefreshCw className="h-5 w-5 mr-2" />
          {isRTL ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    );
  }

  const engagementRate = dashboard?.overview.totalUsers
    ? Math.round((dashboard.overview.activeUsers / dashboard.overview.totalUsers) * 100)
    : 0;

  const completionRate = dashboard?.overview.totalSessions
    ? Math.round((dashboard.overview.completedSessions / dashboard.overview.totalSessions) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isRTL ? `مرحباً، ${user?.firstName}! 👋` : `Welcome back, ${user?.firstName}! 👋`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isTrainer
              ? (isRTL ? 'إليك نظرة على أداء طلابك' : "Here's how your assigned students are performing")
              : (isRTL ? 'إليك ما يحدث مع فريق التدريب' : "Here's what's happening with your training team")
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isTrainer && (
            <Badge variant="outline" className="px-3 py-1.5 bg-teal-500/10 border-teal-500/30 text-teal-500">
              <GraduationCap className="h-3.5 w-3.5 mr-2" />
              {isRTL ? 'عرض المدرب' : 'Trainer View'}
            </Badge>
          )}
          <Badge variant="outline" className="px-3 py-1.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
            {isRTL ? 'بيانات حية' : 'Live Data'}
          </Badge>
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Trainees */}
        <Card className={cn(
          "border-0 shadow-lg text-white overflow-hidden relative",
          isTrainer
            ? "bg-gradient-to-br from-teal-500 to-teal-600"
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isTrainer ? "text-teal-100" : "text-blue-100")}>
                  {isTrainer
                    ? (isRTL ? 'طلابي' : 'My Students')
                    : (isRTL ? 'إجمالي المتدربين' : 'Total Trainees')
                  }
                </p>
                <p className="text-4xl font-bold mt-2">{dashboard?.overview.totalUsers ?? 0}</p>
                <div className={cn("flex items-center gap-1 mt-2", isTrainer ? "text-teal-100" : "text-blue-100")}>
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm">{dashboard?.overview.activeUsers ?? 0} {isRTL ? 'نشط' : 'active'}</span>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                {isTrainer ? <GraduationCap className="h-8 w-8" /> : <Users className="h-8 w-8" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team/Students Average Score */}
        <Card className={cn(
          "border-0 shadow-lg text-white overflow-hidden relative",
          isTrainer
            ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
            : "bg-gradient-to-br from-violet-500 to-purple-600"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isTrainer ? "text-cyan-100" : "text-violet-100")}>
                  {isTrainer
                    ? (isRTL ? 'متوسط طلابي' : 'Students Average')
                    : (isRTL ? 'متوسط الفريق' : 'Team Average')
                  }
                </p>
                <p className="text-4xl font-bold mt-2">{dashboard?.teamPerformance.averageTeamScore ?? '--'}%</p>
                <div className={cn("flex items-center gap-1 mt-2", isTrainer ? "text-cyan-100" : "text-violet-100")}>
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">{isRTL ? 'درجة' : 'Grade'} {getGradeLabel(dashboard?.teamPerformance.averageTeamScore ?? 0)}</span>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <Target className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">{isRTL ? 'جلسات التدريب' : 'Training Sessions'}</p>
                <p className="text-4xl font-bold mt-2">{dashboard?.overview.totalSessions ?? 0}</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-100">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">{completionRate}% {isRTL ? 'مكتمل' : 'completed'}</span>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">{isRTL ? 'معدل المشاركة' : 'Engagement Rate'}</p>
                <p className="text-4xl font-bold mt-2">{engagementRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-amber-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{dashboard?.overview.averageSessionsPerUser?.toFixed(1) ?? 0} {isRTL ? 'جلسة/مستخدم' : 'sessions/user'}</span>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <BarChart3 className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Overview - Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Trends Chart */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart3 className={cn("h-5 w-5", isTrainer ? "text-teal-500" : "text-violet-500")} />
                    {isRTL ? 'اتجاهات الأداء' : 'Performance Trends'}
                  </CardTitle>
                  <CardDescription>
                    {isTrainer
                      ? (isRTL ? 'نظرة عامة شهرية على أداء طلابك' : 'Monthly overview of your students performance')
                      : (isRTL ? 'نظرة عامة شهرية على أداء الفريق' : 'Monthly team performance overview')
                    }
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {isRTL ? `آخر ${dashboard?.monthlyTrends?.length ?? 0} أشهر` : `Last ${dashboard?.monthlyTrends?.length ?? 0} months`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard?.monthlyTrends && dashboard.monthlyTrends.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between gap-2 h-48 pt-4">
                    {dashboard.monthlyTrends.map((trend, index) => (
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
                          <p className="text-[10px] text-muted-foreground">{trend.totalSessions} {isRTL ? 'جلسة' : 'sessions'}</p>
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
                  <p className="text-muted-foreground">{isRTL ? 'لا توجد بيانات اتجاهات' : 'No trend data available yet'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top & Needs Support */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Performer */}
            <Card className="border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Trophy className="h-5 w-5 text-emerald-500" />
                  {isRTL ? 'الأفضل أداءً' : 'Top Performer'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.teamPerformance.bestPerformer ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                        {dashboard.teamPerformance.bestPerformer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {dashboard.teamPerformance.bestPerformer.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {dashboard.teamPerformance.bestPerformer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-500">
                          {dashboard.teamPerformance.bestPerformer.averageScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'المتوسط' : 'Avg Score'}</p>
                      </div>
                      <div className="h-10 w-px bg-emerald-500/30" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-500">
                          {dashboard.teamPerformance.bestPerformer.totalSessions}
                        </p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'جلسات' : 'Sessions'}</p>
                      </div>
                      <div className="h-10 w-px bg-emerald-500/30" />
                      <Badge className="bg-emerald-500 text-white">
                        {isRTL ? 'درجة' : 'Grade'} {getGradeLabel(dashboard.teamPerformance.bestPerformer.averageScore)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{isRTL ? 'لا توجد بيانات' : 'No data yet'}</p>
                )}
              </CardContent>
            </Card>

            {/* Needs Support */}
            <Card className="border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {isRTL ? 'يحتاج دعم' : 'Needs Support'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.teamPerformance.worstPerformer &&
                 dashboard.teamPerformance.worstPerformer.id !== dashboard.teamPerformance.bestPerformer?.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {dashboard.teamPerformance.worstPerformer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {dashboard.teamPerformance.worstPerformer.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {dashboard.teamPerformance.worstPerformer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">
                          {dashboard.teamPerformance.worstPerformer.averageScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'المتوسط' : 'Avg Score'}</p>
                      </div>
                      <div className="h-10 w-px bg-amber-500/30" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">
                          {dashboard.teamPerformance.worstPerformer.totalSessions}
                        </p>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'جلسات' : 'Sessions'}</p>
                      </div>
                      <div className="h-10 w-px bg-amber-500/30" />
                      <Badge className="bg-amber-500 text-white">
                        {isRTL ? 'درجة' : 'Grade'} {getGradeLabel(dashboard.teamPerformance.worstPerformer.averageScore)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{isRTL ? 'جميع المتدربين بخير!' : 'All trainees performing well!'}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/employees">
                <Button variant="outline" className={cn(
                  "w-full justify-between",
                  isTrainer
                    ? "hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-500"
                    : "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-500"
                )}>
                  <span className="flex items-center gap-2">
                    {isTrainer ? <GraduationCap className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    {isTrainer
                      ? (isRTL ? 'طلابي' : 'My Students')
                      : (isRTL ? 'إدارة المتدربين' : 'Manage Trainees')
                    }
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
              <Link href="/admin/groups">
                <Button variant="outline" className={cn(
                  "w-full justify-between",
                  isTrainer
                    ? "hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-500"
                    : "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-500"
                )}>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {isTrainer
                      ? (isRTL ? 'مجموعاتي' : 'My Groups')
                      : (isRTL ? 'المجموعات' : 'Groups')
                    }
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
              <Link href="/admin/voice-sessions">
                <Button variant="outline" className={cn(
                  "w-full justify-between",
                  isTrainer
                    ? "hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-500"
                    : "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-500"
                )}>
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {isRTL ? 'جلسات الصوت' : 'Voice Sessions'}
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className={cn(
                  "w-full justify-between",
                  isTrainer
                    ? "hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-500"
                    : "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-500"
                )}>
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {isRTL ? 'التقارير' : 'View Reports'}
                  </span>
                  <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Activity className={cn("h-5 w-5", isTrainer ? "text-teal-500" : "text-violet-500")} />
                  {isTrainer
                    ? (isRTL ? 'نشاط طلابي' : 'Student Activity')
                    : (isRTL ? 'النشاط الأخير' : 'Recent Activity')
                  }
                </CardTitle>
                <Badge variant="outline" className="text-xs">{isRTL ? 'مباشر' : 'Live'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {dashboard.recentActivity.slice(0, 8).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0",
                        isTrainer
                          ? "bg-gradient-to-br from-teal-500 to-cyan-600"
                          : "bg-gradient-to-br from-violet-500 to-purple-600"
                      )}>
                        {activity.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.userName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {activity.details}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Activity className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground text-sm">
                    {isTrainer
                      ? (isRTL ? 'لا يوجد نشاط من طلابك' : 'No activity from your students')
                      : (isRTL ? 'لا يوجد نشاط' : 'No recent activity')
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
