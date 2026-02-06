'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRoleSafe } from '@/contexts/AdminRoleContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  ArrowUpDown,
  Shield,
  Target,
  Activity,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  UserX,
  GraduationCap,
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { EditEmployeeModal } from '@/components/admin/EditEmployeeModal';
import { AddUserModal } from '@/components/admin/AddUserModal';
import { UserPlus } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  lastActivityAt: string | null;
  createdAt: string;
  status: string;
}

interface EmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  totalPages: number;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
}

interface Group {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  const { token, user } = useAuthStore();
  const { isRTL } = useLanguage();
  const { isTrainer, isOrgAdmin, permissions } = useAdminRoleSafe();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<EmployeesResponse | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Action modals state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });
  const [editModal, setEditModal] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });
  const [addUserModal, setAddUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Trainers can only view, org_admins can modify
  const canModifyEmployees = permissions?.canModifyEmployees ?? isOrgAdmin;

  // Helper to get token
  const getAuthToken = useCallback((): string | null => {
    if (token) return token;
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
    if (!authToken) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const [employeesRes, dashboardRes] = await Promise.all([
        fetch(`${apiUrl}/admin/employees?${params}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${apiUrl}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (employeesRes.ok) {
        setData(await employeesRes.json());
      }
      if (dashboardRes.ok) {
        const dashData = await dashboardRes.json();
        setStats(dashData.overview);
      }

      // Fetch groups for the add user modal
      try {
        const groupsRes = await fetch(`${apiUrl}/admin/groups`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroups(groupsData.groups?.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })) || []);
        }
      } catch {
        // Groups fetch failed - non-critical
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, currentPage, sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchData]);

  // Action handlers
  const handleDelete = async () => {
    if (!deleteModal.employee) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    setActionLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/admin/employees/${deleteModal.employee.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }

      setDeleteModal({ open: false, employee: null });
      fetchData();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendToggle = async (reason?: string) => {
    if (!suspendModal.employee) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    const newStatus = suspendModal.employee.status === 'suspended' ? 'active' : 'suspended';

    setActionLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/admin/employees/${suspendModal.employee.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update status');
      }

      setSuspendModal({ open: false, employee: null });
      fetchData();
    } catch (err) {
      console.error('Error updating employee status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (data: { firstName: string; lastName: string; email: string; role: string }) => {
    if (!editModal.employee) return;

    const authToken = getAuthToken();
    if (!authToken) throw new Error('Not authenticated');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${apiUrl}/admin/employees/${editModal.employee.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update');
    }

    fetchData();
  };

  const handleAddUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    groupId?: string;
  }) => {
    const authToken = getAuthToken();
    if (!authToken) throw new Error('Not authenticated');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${apiUrl}/admin/employees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create user');
    }

    fetchData();
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return { label: '--', className: 'bg-muted text-muted-foreground' };
    if (score >= 80) return { label: 'A', className: 'bg-emerald-500/20 text-emerald-500' };
    if (score >= 70) return { label: 'B', className: 'bg-blue-500/20 text-blue-500' };
    if (score >= 60) return { label: 'C', className: 'bg-amber-500/20 text-amber-500' };
    return { label: 'D', className: 'bg-red-500/20 text-red-500' };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return isRTL ? 'أبداً' : 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return isRTL ? 'اليوم' : 'Today';
    if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday';
    if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const getRoleBadge = (role: string) => {
    if (role === 'org_admin') {
      return (
        <Badge className="bg-violet-500/20 text-violet-500 border-violet-500/30 text-xs">
          <Shield className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
          {isRTL ? 'مسؤول' : 'Admin'}
        </Badge>
      );
    }
    if (role === 'trainer') {
      return (
        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs">
          <Users className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
          {isRTL ? 'مدرب' : 'Trainer'}
        </Badge>
      );
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'suspended') {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
          <UserX className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
          {isRTL ? 'موقوف' : 'Suspended'}
        </Badge>
      );
    }
    return null;
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isTrainer && <GraduationCap className="h-6 w-6 text-teal-500" />}
            {isTrainer
              ? (isRTL ? 'طلابي' : 'My Students')
              : (isRTL ? 'أعضاء الفريق' : 'Team Members')
            }
          </h1>
          <p className="text-muted-foreground mt-1">
            {isTrainer
              ? (isRTL ? 'متابعة أداء الطلاب في مجموعاتك' : 'Monitor your assigned students performance')
              : (isRTL ? 'إدارة ومتابعة أداء الموظفين' : 'Manage and monitor employee performance')
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTrainer && (
            <Badge variant="outline" className="px-3 py-1.5 bg-teal-500/10 border-teal-500/30 text-teal-500">
              {isRTL ? 'عرض المدرب' : 'Trainer View'}
            </Badge>
          )}
          {canModifyEmployees && (
            <Button onClick={() => setAddUserModal(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              {isRTL ? 'إضافة مستخدم جديد' : 'Add New User'}
            </Button>
          )}
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={cn(
                "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                placeholder={isRTL ? 'البحث بالاسم أو البريد...' : 'Search by name or email...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={cn(isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-48">
                <ArrowUpDown className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                <SelectValue placeholder={isRTL ? 'ترتيب حسب' : 'Sort by'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastName">{isRTL ? 'الاسم' : 'Name'}</SelectItem>
                <SelectItem value="averageScore">{isRTL ? 'الدرجة' : 'Score'}</SelectItem>
                <SelectItem value="totalSessions">{isRTL ? 'الجلسات' : 'Sessions'}</SelectItem>
                <SelectItem value="lastActiveAt">{isRTL ? 'آخر نشاط' : 'Last Active'}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className={cn("h-4 w-4", sortOrder === 'desc' && "rotate-180")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={cn(
          "border-border bg-gradient-to-br to-transparent",
          isTrainer ? "from-teal-500/10" : "from-blue-500/10"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                isTrainer ? "bg-teal-500/20" : "bg-blue-500/20"
              )}>
                {isTrainer
                  ? <GraduationCap className="h-5 w-5 text-teal-500" />
                  : <Users className="h-5 w-5 text-blue-500" />
                }
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalUsers ?? data?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isTrainer
                    ? (isRTL ? 'طلابي' : 'My Students')
                    : (isRTL ? 'إجمالي الأعضاء' : 'Total Members')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.activeUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isTrainer
                    ? (isRTL ? 'طلاب نشطون' : 'Active Students')
                    : (isRTL ? 'متدربون نشطون' : 'Active Trainees')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-border bg-gradient-to-br to-transparent",
          isTrainer ? "from-cyan-500/10" : "from-violet-500/10"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                isTrainer ? "bg-cyan-500/20" : "bg-violet-500/20"
              )}>
                <Shield className={cn("h-5 w-5", isTrainer ? "text-cyan-500" : "text-violet-500")} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.completedSessions ?? 0}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'جلسات مكتملة' : 'Completed Sessions'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.averageScore ?? '--'}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'متوسط الدرجات' : 'Avg Score'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            {isTrainer
              ? (isRTL ? 'طلابي في المجموعات' : 'Students in My Groups')
              : (isRTL ? 'جميع أعضاء الفريق' : 'All Team Members')
            }
          </CardTitle>
          <CardDescription>
            {data?.total ?? 0} {isTrainer
              ? (isRTL ? 'طالب' : 'students found')
              : (isRTL ? 'أعضاء' : 'members found')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : data?.employees && data.employees.length > 0 ? (
            <>
              <div className="space-y-3">
                {data.employees.map((employee) => {
                  const scoreBadge = getScoreBadge(employee.averageScore);
                  const isCurrentUser = employee.id === user?.id;

                  return (
                    <div
                      key={employee.id}
                      className={cn(
                        "flex items-center gap-4 p-4 bg-muted/50 rounded-xl transition-colors hover:bg-muted/70",
                        employee.status === 'suspended' && "opacity-60"
                      )}
                    >
                      <Link
                        href={`/admin/employees/${employee.id}`}
                        className="flex items-center gap-4 flex-1 min-w-0"
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg",
                          employee.status === 'suspended'
                            ? "bg-muted-foreground"
                            : isTrainer
                              ? "bg-gradient-to-br from-teal-500 to-cyan-600"
                              : "bg-gradient-to-br from-violet-500 to-purple-600"
                        )}>
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>

                        {/* Info */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">
                              {employee.firstName} {employee.lastName}
                            </p>
                            {getRoleBadge(employee.role)}
                            {getStatusBadge(employee.status)}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">
                                {isRTL ? 'أنت' : 'You'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </Link>

                      {/* Stats - Hidden on mobile, visible on larger screens */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-semibold text-foreground">
                            {employee.completedSessions}
                          </p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'جلسات' : 'Sessions'}</p>
                        </div>

                        <div className="text-center min-w-[60px]">
                          <p className={cn("text-sm font-semibold", getScoreColor(employee.averageScore))}>
                            {employee.averageScore ?? '--'}
                          </p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'المتوسط' : 'Avg'}</p>
                        </div>

                        <div className="text-center hidden lg:block min-w-[80px]">
                          <p className="text-sm font-semibold text-foreground">
                            {formatDate(employee.lastActivityAt)}
                          </p>
                          <p className="text-xs text-muted-foreground">{isRTL ? 'آخر نشاط' : 'Last Active'}</p>
                        </div>

                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0",
                          scoreBadge.className
                        )}>
                          {scoreBadge.label}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Reports Button */}
                        <Link
                          href={`/admin/trainee/${employee.id}/reports`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="outline" size="sm" className="gap-1.5 h-9">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">{isRTL ? 'التقارير' : 'Reports'}</span>
                          </Button>
                        </Link>

                        {/* Actions Menu - Only for org_admin (not trainers) and not current user */}
                        {canModifyEmployees && !isCurrentUser ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                              <DropdownMenuItem
                                onClick={() => setEditModal({ open: true, employee })}
                                className="gap-2"
                              >
                                <Pencil className="h-4 w-4" />
                                {isRTL ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setSuspendModal({ open: true, employee })}
                                className="gap-2"
                              >
                                {employee.status === 'suspended' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    {isRTL ? 'تفعيل' : 'Activate'}
                                  </>
                                ) : (
                                  <>
                                    <Ban className="h-4 w-4" />
                                    {isRTL ? 'إيقاف' : 'Suspend'}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteModal({ open: true, employee })}
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                {isRTL ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          /* Placeholder to maintain consistent spacing */
                          <div className="w-9 h-9" />
                        )}

                        <ChevronIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
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
                    {isRTL ? `صفحة ${data.page} من ${data.totalPages}` : `Page ${data.page} of ${data.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={currentPage === data.totalPages}
                  >
                    {isRTL ? 'التالي' : 'Next'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              {isTrainer
                ? <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                : <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              }
              <p className="text-muted-foreground">
                {isTrainer
                  ? (isRTL ? 'لم يتم العثور على طلاب في مجموعاتك' : 'No students found in your groups')
                  : (isRTL ? 'لم يتم العثور على أعضاء' : 'No team members found')
                }
              </p>
              {searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setSearchTerm('')}
                  className={cn("mt-2", isTrainer ? "text-teal-500" : "text-violet-500")}
                >
                  {isRTL ? 'مسح البحث' : 'Clear search'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, employee: deleteModal.employee })}
        onConfirm={handleDelete}
        title={isRTL ? 'حذف الموظف' : 'Delete Employee'}
        description={
          isRTL
            ? `هل أنت متأكد من حذف "${deleteModal.employee?.firstName} ${deleteModal.employee?.lastName}"؟ سيتم حذف جميع بياناته ولا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${deleteModal.employee?.firstName} ${deleteModal.employee?.lastName}"? All their data will be permanently removed.`
        }
        confirmText={isRTL ? 'حذف' : 'Delete'}
        variant="danger"
        icon="delete"
        isLoading={actionLoading}
      />

      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        open={suspendModal.open}
        onOpenChange={(open) => setSuspendModal({ open, employee: suspendModal.employee })}
        onConfirm={handleSuspendToggle}
        title={
          suspendModal.employee?.status === 'suspended'
            ? (isRTL ? 'تفعيل الحساب' : 'Activate Account')
            : (isRTL ? 'إيقاف الحساب' : 'Suspend Account')
        }
        description={
          suspendModal.employee?.status === 'suspended'
            ? (isRTL
                ? `هل تريد تفعيل حساب "${suspendModal.employee?.firstName} ${suspendModal.employee?.lastName}"؟`
                : `Do you want to activate "${suspendModal.employee?.firstName} ${suspendModal.employee?.lastName}"'s account?`)
            : (isRTL
                ? `هل تريد إيقاف حساب "${suspendModal.employee?.firstName} ${suspendModal.employee?.lastName}"؟ لن يتمكن من تسجيل الدخول.`
                : `Do you want to suspend "${suspendModal.employee?.firstName} ${suspendModal.employee?.lastName}"'s account? They won't be able to log in.`)
        }
        confirmText={
          suspendModal.employee?.status === 'suspended'
            ? (isRTL ? 'تفعيل' : 'Activate')
            : (isRTL ? 'إيقاف' : 'Suspend')
        }
        variant={suspendModal.employee?.status === 'suspended' ? 'default' : 'warning'}
        icon="suspend"
        showReasonInput={suspendModal.employee?.status !== 'suspended'}
        reasonPlaceholder={isRTL ? 'سبب الإيقاف (اختياري)' : 'Reason for suspension (optional)'}
        isLoading={actionLoading}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ open, employee: editModal.employee })}
        employee={editModal.employee}
        onSave={handleEdit}
        currentUserId={user?.id}
      />

      {/* Add User Modal */}
      <AddUserModal
        open={addUserModal}
        onOpenChange={setAddUserModal}
        onSave={handleAddUser}
        groups={groups}
      />
    </div>
  );
}
