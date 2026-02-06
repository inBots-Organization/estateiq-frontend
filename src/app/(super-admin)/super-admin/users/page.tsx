'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuperAdminApi, type UserSummary, type PaginatedResult } from '@/hooks/useSuperAdminApi';
import { cn } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Building2,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCircle,
  RefreshCw,
  AlertTriangle,
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
import Link from 'next/link';

export default function UsersPage() {
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const searchParams = useSearchParams();
  const organizationFilter = searchParams.get('organization');

  const [users, setUsers] = useState<PaginatedResult<UserSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.searchUsers({
        page: currentPage,
        limit: 10,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { query: searchQuery }),
        ...(organizationFilter && { organizationId: organizationFilter }),
      });
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, organizationFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { color: string; label: string; labelAr: string }> = {
      saas_super_admin: { color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', label: 'Super Admin', labelAr: 'مدير المنصة' },
      org_admin: { color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', label: 'Org Admin', labelAr: 'مدير المؤسسة' },
      trainer: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', label: 'Trainer', labelAr: 'مدرب' },
      trainee: { color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400', label: 'Trainee', labelAr: 'متدرب' },
    };

    const config = roleConfig[role] || roleConfig.trainee;

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.color)}>
        {isRTL ? config.labelAr : config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; labelAr: string }> = {
      active: { color: 'bg-green-500/10 text-green-600', label: 'Active', labelAr: 'نشط' },
      suspended: { color: 'bg-amber-500/10 text-amber-600', label: 'Suspended', labelAr: 'معلق' },
      blocked: { color: 'bg-red-500/10 text-red-600', label: 'Blocked', labelAr: 'محظور' },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.color)}>
        {isRTL ? config.labelAr : config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return isRTL ? 'لم يسجل دخول' : 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchUsers} variant="outline" className="gap-2">
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
          {isRTL ? 'إدارة المستخدمين' : 'User Management'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {organizationFilter
            ? isRTL ? 'عرض مستخدمي المؤسسة المحددة' : 'Viewing users for selected organization'
            : isRTL ? 'البحث وإدارة المستخدمين عبر جميع المؤسسات' : 'Search and manage users across all organizations'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? 'البحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue placeholder={isRTL ? 'الدور' : 'Role'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'كل الأدوار' : 'All Roles'}</SelectItem>
                <SelectItem value="org_admin">{isRTL ? 'مدير المؤسسة' : 'Org Admin'}</SelectItem>
                <SelectItem value="trainer">{isRTL ? 'مدرب' : 'Trainer'}</SelectItem>
                <SelectItem value="trainee">{isRTL ? 'متدرب' : 'Trainee'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'كل الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="active">{isRTL ? 'نشط' : 'Active'}</SelectItem>
                <SelectItem value="suspended">{isRTL ? 'معلق' : 'Suspended'}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-rose-500" />
            {isRTL ? 'قائمة المستخدمين' : 'User List'}
          </CardTitle>
          <CardDescription>
            {users?.total
              ? isRTL
                ? `${users.total.toLocaleString()} مستخدم على المنصة`
                : `${users.total.toLocaleString()} users on the platform`
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
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm">
                      <th className="text-start py-3 px-4 font-medium text-muted-foreground">
                        {isRTL ? 'المستخدم' : 'User'}
                      </th>
                      <th className="text-start py-3 px-4 font-medium text-muted-foreground">
                        {isRTL ? 'المؤسسة' : 'Organization'}
                      </th>
                      <th className="text-start py-3 px-4 font-medium text-muted-foreground">
                        {isRTL ? 'الدور' : 'Role'}
                      </th>
                      <th className="text-start py-3 px-4 font-medium text-muted-foreground">
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className="text-start py-3 px-4 font-medium text-muted-foreground">
                        {isRTL ? 'آخر نشاط' : 'Last Active'}
                      </th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.data.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/super-admin/organizations/${user.organizationId}`}
                            className="flex items-center gap-2 text-sm hover:text-rose-500 transition-colors"
                          >
                            <Building2 className="h-4 w-4" />
                            {user.organizationName}
                          </Link>
                        </td>
                        <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatTimeAgo(user.lastActiveAt)}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {users?.data.map((user) => (
                  <div key={user.id} className="p-4 rounded-xl border bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <Link
                        href={`/super-admin/organizations/${user.organizationId}`}
                        className="flex items-center gap-1 hover:text-rose-500"
                      >
                        <Building2 className="h-4 w-4" />
                        {user.organizationName}
                      </Link>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatTimeAgo(user.lastActiveAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {users && users.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? `صفحة ${users.page} من ${users.totalPages}`
                      : `Page ${users.page} of ${users.totalPages}`}
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
                      disabled={!users.hasMore}
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
