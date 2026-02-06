'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuperAdminApi, type PlatformOverview } from '@/hooks/useSuperAdminApi';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'org_created':
        return <Building2 className="h-4 w-4 text-green-500" />;
      case 'subscription_updated':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'user_registered':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'org_suspended':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    } else {
      return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchOverview} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', isRTL && 'rtl')}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'لوحة تحكم المنصة' : 'Platform Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? 'نظرة عامة على صحة المنصة والمقاييس الرئيسية'
              : 'Overview of platform health and key metrics'}
          </p>
        </div>
        <Button onClick={fetchOverview} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.mrr || 0)}</div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="text-muted-foreground">
                {isRTL ? 'الإيرادات المتكررة الشهرية' : 'MRR'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'المؤسسات' : 'Organizations'}
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalOrganizations || 0)}</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-green-500">{overview?.activeOrganizations || 0} {isRTL ? 'نشط' : 'active'}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-amber-500">{overview?.suspendedOrganizations || 0} {isRTL ? 'معلق' : 'suspended'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'المستخدمون' : 'Total Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalUsers || 0)}</div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">
                {formatNumber(overview?.activeUsersLast30Days || 0)} {isRTL ? 'نشط (30 يوم)' : 'active (30d)'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Activity Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'نشاط المنصة' : 'Platform Activity'}
            </CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalSimulations || 0)}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <span>{isRTL ? 'المحاكاة الإجمالية' : 'total simulations'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ARR Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-500" />
              {isRTL ? 'الإيرادات السنوية' : 'Annual Revenue (ARR)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(overview?.arr || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isRTL ? 'استناداً إلى الاشتراكات الحالية' : 'Based on current subscriptions'}
            </p>
          </CardContent>
        </Card>

        {/* Voice Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              {isRTL ? 'جلسات الصوت' : 'Voice Sessions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(overview?.totalVoiceSessions || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isRTL ? 'إجمالي جلسات التدريب الصوتي' : 'Total voice training sessions'}
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/super-admin/organizations">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                {isRTL ? 'إدارة المؤسسات' : 'Manage Organizations'}
              </Button>
            </Link>
            <Link href="/super-admin/subscriptions">
              <Button variant="outline" className="w-full justify-start gap-2">
                <CreditCard className="h-4 w-4" />
                {isRTL ? 'إدارة الاشتراكات' : 'Manage Subscriptions'}
              </Button>
            </Link>
            <Link href="/super-admin/analytics">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                {isRTL ? 'عرض التحليلات' : 'View Analytics'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'آخر الأحداث على المنصة' : 'Latest platform events'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview?.recentActivity && overview.recentActivity.length > 0 ? (
              overview.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-full bg-background">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.targetName}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Link href="/super-admin/audit-logs">
              <Button variant="ghost" className="w-full">
                {isRTL ? 'عرض كل السجلات' : 'View All Activity Logs'}
                <ArrowUpRight className="h-4 w-4 ms-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
