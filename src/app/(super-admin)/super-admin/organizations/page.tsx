'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuperAdminApi, type OrganizationSummary, type PaginatedResult } from '@/hooks/useSuperAdminApi';
import { cn } from '@/lib/utils';
import {
  Building2,
  Search,
  Filter,
  MoreVertical,
  Users,
  CreditCard,
  Eye,
  Ban,
  CheckCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function OrganizationsPage() {
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const [organizations, setOrganizations] = useState<PaginatedResult<OrganizationSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrganizations({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });
      setOrganizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      console.error('Organizations fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrganizations();
  };

  const handleStatusChange = async (orgId: string, newStatus: 'active' | 'suspended') => {
    try {
      await api.updateOrganizationStatus(orgId, { status: newStatus });
      fetchOrganizations();
    } catch (err) {
      console.error('Failed to update organization status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; labelAr: string }> = {
      active: { color: 'bg-green-500/10 text-green-600 dark:text-green-400', label: 'Active', labelAr: 'نشط' },
      suspended: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Suspended', labelAr: 'معلق' },
      blocked: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', label: 'Blocked', labelAr: 'محظور' },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.color)}>
        {isRTL ? config.labelAr : config.label}
      </span>
    );
  };

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return null;

    const planConfig: Record<string, string> = {
      starter: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
      Starter: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
      professional: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      Professional: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      enterprise: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      Enterprise: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', planConfig[plan] || 'bg-gray-500/10 text-gray-600')}>
        {plan}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchOrganizations} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isRTL && 'rtl')}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'إدارة المؤسسات' : 'Organizations'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'إدارة جميع المؤسسات المسجلة على المنصة' : 'Manage all registered organizations on the platform'}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
          <Plus className="h-4 w-4 me-2" />
          {isRTL ? 'إضافة مؤسسة' : 'Add Organization'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? 'البحث عن مؤسسة...' : 'Search organizations...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All Status'}</SelectItem>
                <SelectItem value="active">{isRTL ? 'نشط' : 'Active'}</SelectItem>
                <SelectItem value="suspended">{isRTL ? 'معلق' : 'Suspended'}</SelectItem>
                <SelectItem value="blocked">{isRTL ? 'محظور' : 'Blocked'}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-rose-500" />
            {isRTL ? 'قائمة المؤسسات' : 'Organization List'}
          </CardTitle>
          <CardDescription>
            {organizations?.total
              ? isRTL
                ? `${organizations.total} مؤسسة مسجلة`
                : `${organizations.total} organizations registered`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : organizations?.data && organizations.data.length > 0 ? (
            <>
              <div className="space-y-4">
                {organizations.data.map((org) => (
                  <div
                    key={org.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {/* Org Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">{org.name}</h3>
                          {getStatusBadge(org.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{org.contactEmail || (isRTL ? 'لا يوجد بريد' : 'No email')}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <span className="font-medium">{org.activeUserCount}</span>
                          <span className="text-muted-foreground">/{org.userCount}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {org.subscriptionPlan ? getPlanBadge(org.subscriptionPlan) : (
                          <span className="text-muted-foreground text-xs">{isRTL ? 'لا يوجد' : 'None'}</span>
                        )}
                      </div>
                      <div className="text-muted-foreground hidden lg:block">
                        {formatDate(org.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/super-admin/organizations/${org.id}`}>
                            <Eye className="h-4 w-4 me-2" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {org.status === 'active' ? (
                          <DropdownMenuItem
                            className="text-amber-600"
                            onClick={() => handleStatusChange(org.id, 'suspended')}
                          >
                            <Ban className="h-4 w-4 me-2" />
                            {isRTL ? 'تعليق المؤسسة' : 'Suspend Organization'}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => handleStatusChange(org.id, 'active')}
                          >
                            <CheckCircle className="h-4 w-4 me-2" />
                            {isRTL ? 'تفعيل المؤسسة' : 'Activate Organization'}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {organizations.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? `صفحة ${organizations.page} من ${organizations.totalPages}`
                      : `Page ${organizations.page} of ${organizations.totalPages}`}
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
                      disabled={!organizations.hasMore}
                    >
                      {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا توجد مؤسسات' : 'No organizations found'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
