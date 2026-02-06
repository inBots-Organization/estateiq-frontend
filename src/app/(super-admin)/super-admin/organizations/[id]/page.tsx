'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuperAdminApi, type OrganizationDetails } from '@/hooks/useSuperAdminApi';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckCircle,
  LogIn,
  BarChart3,
  Clock,
  Settings,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function OrganizationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const startImpersonation = useAuthStore((state) => state.startImpersonation);
  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState(false);

  const fetchOrganizationDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrganization(id as string);
      setOrganization(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organization details');
      console.error('Organization details fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganizationDetails();
  }, [fetchOrganizationDetails]);

  const handleStatusChange = async (newStatus: 'active' | 'suspended') => {
    if (!id) return;
    try {
      await api.updateOrganizationStatus(id as string, { status: newStatus });
      fetchOrganizationDetails();
    } catch (err) {
      console.error('Failed to update organization status:', err);
    }
  };

  const handleImpersonate = async () => {
    if (!id || !organization) return;
    try {
      setImpersonating(true);
      const result = await api.impersonateOrganization(id as string);
      // Start impersonation session
      startImpersonation(result.token, result.organizationId, result.organizationName);
      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Failed to impersonate organization:', err);
      setImpersonating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchOrganizationDetails} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; labelAr: string }> = {
      active: { color: 'bg-green-500/10 text-green-600 dark:text-green-400', label: 'Active', labelAr: 'نشط' },
      suspended: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Suspended', labelAr: 'معلق' },
      blocked: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', label: 'Blocked', labelAr: 'محظور' },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={cn('px-3 py-1 rounded-full text-sm font-medium', config.color)}>
        {isRTL ? config.labelAr : config.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { color: string; label: string }> = {
      org_admin: { color: 'bg-purple-500/10 text-purple-600', label: 'Admin' },
      trainer: { color: 'bg-blue-500/10 text-blue-600', label: 'Trainer' },
      trainee: { color: 'bg-gray-500/10 text-gray-600', label: 'Trainee' },
    };

    const config = roleConfig[role] || roleConfig.trainee;

    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.color)}>
        {config.label}
      </span>
    );
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{isRTL ? 'المؤسسة غير موجودة' : 'Organization not found'}</p>
        <Link href="/super-admin/organizations">
          <Button variant="link">{isRTL ? 'العودة للقائمة' : 'Back to list'}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isRTL && 'rtl')}>
      {/* Back Button */}
      <Link href="/super-admin/organizations">
        <Button variant="ghost" className="gap-2">
          <BackIcon className="h-4 w-4" />
          {isRTL ? 'العودة للمؤسسات' : 'Back to Organizations'}
        </Button>
      </Link>

      {/* Organization Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
            <Building2 className="h-8 w-8 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{organization.name}</h1>
              {getStatusBadge(organization.status)}
            </div>
            <p className="text-muted-foreground mt-1">{organization.type.replace(/_/g, ' ')}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              {organization.contactEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {organization.contactEmail}
                </span>
              )}
              {organization.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {organization.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleImpersonate}
            disabled={impersonating}
          >
            <LogIn className="h-4 w-4" />
            {impersonating
              ? (isRTL ? 'جاري التحميل...' : 'Loading...')
              : (isRTL ? 'تسجيل الدخول كمؤسسة' : 'Impersonate')}
          </Button>
          {organization.status === 'active' ? (
            <Button
              variant="outline"
              className="gap-2 text-amber-600 hover:text-amber-700"
              onClick={() => handleStatusChange('suspended')}
            >
              <Ban className="h-4 w-4" />
              {isRTL ? 'تعليق' : 'Suspend'}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-2 text-green-600 hover:text-green-700"
              onClick={() => handleStatusChange('active')}
            >
              <CheckCircle className="h-4 w-4" />
              {isRTL ? 'تفعيل' : 'Activate'}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{organization.userCount}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'المستخدمون' : 'Total Users'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{organization.activeUserCount}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'نشط' : 'Active'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{organization.totalSimulations}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'المحاكاة' : 'Simulations'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{organization.totalVoiceSessions}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'جلسات صوتية' : 'Voice Sessions'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="subscription">{isRTL ? 'الاشتراك' : 'Subscription'}</TabsTrigger>
          <TabsTrigger value="users">{isRTL ? 'المستخدمون' : 'Users'}</TabsTrigger>
          <TabsTrigger value="usage">{isRTL ? 'الاستخدام' : 'Usage'}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'معلومات المؤسسة' : 'Organization Info'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {isRTL ? 'تاريخ الإنشاء: ' : 'Created: '}
                    {formatDate(organization.createdAt)}
                  </span>
                </div>
                {organization.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{organization.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {organization.trainerCount} {isRTL ? 'مدرب' : 'trainers'}, {organization.traineeCount} {isRTL ? 'متدرب' : 'trainees'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{organization.groupCount} {isRTL ? 'مجموعة' : 'groups'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'آخر المستخدمين' : 'Recent Users'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organization.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center text-xs font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {organization.subscription ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-rose-500" />
                  {isRTL ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10">
                  <div>
                    <p className="text-lg font-bold">{organization.subscription.plan.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(organization.subscription.plan.monthlyPrice)}/{isRTL ? 'شهر' : 'month'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600">
                    {organization.subscription.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'دورة الفوترة' : 'Billing Cycle'}</p>
                    <p className="font-medium capitalize">{organization.subscription.billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'حد المقاعد' : 'Seat Limit'}</p>
                    <p className="font-medium">
                      {organization.subscription.plan.seatLimit
                        ? `${organization.userCount} / ${organization.subscription.plan.seatLimit}`
                        : isRTL ? 'غير محدود' : 'Unlimited'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'بداية الفترة' : 'Period Start'}</p>
                    <p className="font-medium">{formatDate(organization.subscription.currentPeriodStart)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isRTL ? 'نهاية الفترة' : 'Period End'}</p>
                    <p className="font-medium">{formatDate(organization.subscription.currentPeriodEnd)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline">{isRTL ? 'تغيير الخطة' : 'Change Plan'}</Button>
                  <Button variant="outline" className="text-red-600">{isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription'}</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{isRTL ? 'لا يوجد اشتراك نشط' : 'No active subscription'}</p>
                <Button className="mt-4">{isRTL ? 'تعيين اشتراك' : 'Assign Subscription'}</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'مستخدمو المؤسسة' : 'Organization Users'}</CardTitle>
              <CardDescription>
                {isRTL
                  ? `${organization.userCount} مستخدم مسجل، ${organization.activeUserCount} نشط`
                  : `${organization.userCount} registered users, ${organization.activeUserCount} active`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organization.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getRoleBadge(user.role)}
                      {user.lastActiveAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(user.lastActiveAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href={`/super-admin/users?organization=${id}`}>
                  <Button variant="outline" className="w-full">
                    {isRTL ? 'عرض جميع المستخدمين' : 'View All Users'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'إحصائيات الاستخدام' : 'Usage Statistics'}</CardTitle>
              <CardDescription>{isRTL ? 'الشهر الحالي' : 'Current Month'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-blue-500/10">
                  <p className="text-sm text-muted-foreground">{isRTL ? 'المحاكاة هذا الشهر' : 'Simulations This Month'}</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {organization.usageStats.simulationsThisMonth}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10">
                  <p className="text-sm text-muted-foreground">{isRTL ? 'دقائق الصوت' : 'Voice Minutes'}</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {organization.usageStats.voiceMinutesThisMonth}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10">
                  <p className="text-sm text-muted-foreground">{isRTL ? 'تكلفة API' : 'API Cost'}</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                    {formatCurrency(organization.usageStats.apiCostThisMonth)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
