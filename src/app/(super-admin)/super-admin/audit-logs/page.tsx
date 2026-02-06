'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuperAdminApi, type AuditLogEntry, type PaginatedResult } from '@/hooks/useSuperAdminApi';
import { cn } from '@/lib/utils';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  CreditCard,
  Shield,
  Settings,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AuditLogsPage() {
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const [logs, setLogs] = useState<PaginatedResult<AuditLogEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAuditLogs({
        page: currentPage,
        limit: 20,
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(targetTypeFilter !== 'all' && { targetType: targetTypeFilter }),
        ...(searchQuery && { actorId: searchQuery }),
      });
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
      console.error('Audit logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, targetTypeFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const getActionLabel = (action: string): { label: string; labelAr: string; color: string } => {
    const actionConfig: Record<string, { label: string; labelAr: string; color: string }> = {
      organization_created: { label: 'Org Created', labelAr: 'إنشاء مؤسسة', color: 'bg-green-500/10 text-green-600' },
      organization_suspended: { label: 'Org Suspended', labelAr: 'تعليق مؤسسة', color: 'bg-amber-500/10 text-amber-600' },
      organization_unsuspended: { label: 'Org Activated', labelAr: 'تفعيل مؤسسة', color: 'bg-green-500/10 text-green-600' },
      organization_impersonated: { label: 'Org Impersonated', labelAr: 'انتحال مؤسسة', color: 'bg-purple-500/10 text-purple-600' },
      subscription_assigned: { label: 'Sub Assigned', labelAr: 'تعيين اشتراك', color: 'bg-blue-500/10 text-blue-600' },
      subscription_updated: { label: 'Sub Updated', labelAr: 'تحديث اشتراك', color: 'bg-blue-500/10 text-blue-600' },
      subscription_cancelled: { label: 'Sub Cancelled', labelAr: 'إلغاء اشتراك', color: 'bg-red-500/10 text-red-600' },
      plan_created: { label: 'Plan Created', labelAr: 'إنشاء خطة', color: 'bg-green-500/10 text-green-600' },
      plan_updated: { label: 'Plan Updated', labelAr: 'تحديث خطة', color: 'bg-blue-500/10 text-blue-600' },
      user_role_changed: { label: 'Role Changed', labelAr: 'تغيير دور', color: 'bg-purple-500/10 text-purple-600' },
    };

    return actionConfig[action] || { label: action, labelAr: action, color: 'bg-gray-500/10 text-gray-600' };
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'organization':
        return <Building2 className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'subscription':
        return <CreditCard className="h-4 w-4" />;
      case 'plan':
        return <Settings className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const parseDetails = (details: string): Record<string, unknown> => {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchLogs} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isRTL && 'rtl')}>
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'سجل المراجعة' : 'Audit Logs'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'تتبع جميع إجراءات المشرف على المنصة' : 'Track all administrative actions on the platform'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? 'البحث بالبريد الإلكتروني...' : 'Search by email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue placeholder={isRTL ? 'الإجراء' : 'Action'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'كل الإجراءات' : 'All Actions'}</SelectItem>
                <SelectItem value="organization_created">{isRTL ? 'إنشاء مؤسسة' : 'Org Created'}</SelectItem>
                <SelectItem value="organization_suspended">{isRTL ? 'تعليق مؤسسة' : 'Org Suspended'}</SelectItem>
                <SelectItem value="subscription_assigned">{isRTL ? 'تعيين اشتراك' : 'Sub Assigned'}</SelectItem>
                <SelectItem value="subscription_cancelled">{isRTL ? 'إلغاء اشتراك' : 'Sub Cancelled'}</SelectItem>
                <SelectItem value="plan_updated">{isRTL ? 'تحديث خطة' : 'Plan Updated'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder={isRTL ? 'نوع الهدف' : 'Target Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All Types'}</SelectItem>
                <SelectItem value="organization">{isRTL ? 'مؤسسة' : 'Organization'}</SelectItem>
                <SelectItem value="user">{isRTL ? 'مستخدم' : 'User'}</SelectItem>
                <SelectItem value="subscription">{isRTL ? 'اشتراك' : 'Subscription'}</SelectItem>
                <SelectItem value="plan">{isRTL ? 'خطة' : 'Plan'}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-rose-500" />
            {isRTL ? 'سجل الأحداث' : 'Activity Log'}
          </CardTitle>
          <CardDescription>
            {logs?.total
              ? isRTL
                ? `${logs.total.toLocaleString()} سجل`
                : `${logs.total.toLocaleString()} entries`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {logs?.data.map((log) => {
                  const actionInfo = getActionLabel(log.action);
                  const { date, time } = formatDateTime(log.createdAt);
                  const details = parseDetails(log.details);

                  return (
                    <div
                      key={log.id}
                      className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                    >
                      {/* Action Badge */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className={cn('p-2 rounded-lg', actionInfo.color)}>
                          {getTargetIcon(log.targetType)}
                        </div>
                        <div>
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', actionInfo.color)}>
                            {isRTL ? actionInfo.labelAr : actionInfo.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">{log.targetType}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {log.actorEmail}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.entries(details).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="me-4">
                              <span className="text-foreground">{key}:</span> {String(value)}
                            </span>
                          ))}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {log.ipAddress && (
                          <span className="hidden lg:inline">{log.ipAddress}</span>
                        )}
                        <div className="flex items-center gap-1 min-w-[150px]">
                          <Calendar className="h-4 w-4" />
                          <span>{date}</span>
                          <span className="text-xs">{time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {logs?.data.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد سجلات مطابقة' : 'No matching audit logs found'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {logs && logs.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? `صفحة ${logs.page} من ${logs.totalPages}`
                      : `Page ${logs.page} of ${logs.totalPages}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!logs.hasMore}
                    >
                      {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
