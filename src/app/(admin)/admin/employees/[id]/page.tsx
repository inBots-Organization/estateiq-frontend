'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  Mail,
  Calendar,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface EmployeeDetail {
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
  sessions: {
    id: string;
    scenarioType: string;
    difficultyLevel: string;
    status: string;
    score: number | null;
    grade: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
  }[];
  scoreHistory: {
    date: string;
    score: number;
    sessionId: string;
  }[];
  skillBreakdown: {
    skill: string;
    averageScore: number;
    sessionCount: number;
  }[];
  weakSkills: string[];
  recommendations: string[];
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

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
    if (!authToken || !params.id) {
      setError(isRTL ? 'غير مصرح' : 'Not authorized');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // NEXT_PUBLIC_API_URL already includes /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/admin/employees/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError(isRTL ? 'الموظف غير موجود' : 'Employee not found');
        } else {
          setError(isRTL ? 'فشل تحميل بيانات الموظف' : 'Failed to load employee data');
        }
        return;
      }

      setEmployee(await response.json());
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError(isRTL ? 'فشل الاتصال بالخادم' : 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, params.id, isRTL]);

  useEffect(() => {
    // Small delay to allow store hydration
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleRoleChange = async (newRole: string) => {
    const authToken = getAuthToken();
    if (!authToken || !employee) return;

    setIsUpdatingRole(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/admin/employees/${employee.id}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setEmployee({ ...employee, role: newRole });
      } else {
        const data = await response.json();
        alert(data.error || (isRTL ? 'فشل تحديث الدور' : 'Failed to update role'));
      }
    } catch (err) {
      console.error('Error updating role:', err);
      alert(isRTL ? 'فشل تحديث الدور' : 'Failed to update role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500/20 text-emerald-500';
      case 'B': return 'bg-blue-500/20 text-blue-500';
      case 'C': return 'bg-amber-500/20 text-amber-500';
      case 'D': return 'bg-orange-500/20 text-orange-500';
      case 'F': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatScenarioType = (type: string) => {
    if (isRTL) {
      const translations: Record<string, string> = {
        'property_showing': 'عرض العقار',
        'price_negotiation': 'التفاوض على السعر',
        'closing_deal': 'إغلاق الصفقة',
        'objection_handling': 'التعامل مع الاعتراضات',
        'client_consultation': 'استشارة العميل',
      };
      return translations[type] || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return isRTL ? 'غير محدد' : 'N/A';
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

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
            <p className="text-muted-foreground">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isRTL ? 'تفاصيل الموظف' : 'Employee Details'}
          </h1>
        </div>
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{error || (isRTL ? 'الموظف غير موجود' : 'Employee not found')}</h2>
            <Link href="/admin/employees">
              <Button className="mt-4 bg-violet-600 hover:bg-violet-700">
                <BackIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'العودة للموظفين' : 'Back to Employees'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate score trend
  const scoreTrend = employee.scoreHistory.length >= 2
    ? employee.scoreHistory[employee.scoreHistory.length - 1].score - employee.scoreHistory[0].score
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/employees')}>
          <BackIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
          {isRTL ? 'رجوع' : 'Back'}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  {employee.role === 'org_admin' && (
                    <Badge className="bg-violet-500/20 text-violet-500 border-violet-500/30">
                      <Shield className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
                      {isRTL ? 'مسؤول' : 'Admin'}
                    </Badge>
                  )}
                  {employee.role === 'trainer' && (
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                      <Users className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
                      {isRTL ? 'مدرب' : 'Trainer'}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {isRTL ? 'انضم في' : 'Joined'} {formatDate(employee.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={employee.role}
                onValueChange={handleRoleChange}
                disabled={isUpdatingRole}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainee">{isRTL ? 'متدرب' : 'Trainee'}</SelectItem>
                  <SelectItem value="trainer">{isRTL ? 'مدرب' : 'Trainer'}</SelectItem>
                  <SelectItem value="org_admin">{isRTL ? 'مسؤول' : 'Admin'}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{employee.completedSessions}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'جلسات مكتملة' : 'Completed Sessions'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-violet-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/20">
                <Target className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", getScoreColor(employee.averageScore))}>
                  {employee.averageScore ?? '--'}
                </p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'متوسط الدرجات' : 'Average Score'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                scoreTrend >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"
              )}>
                {scoreTrend >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className={cn(
                  "text-2xl font-bold",
                  scoreTrend >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {scoreTrend >= 0 ? '+' : ''}{scoreTrend}
                </p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'تغيير الدرجة' : 'Score Change'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {employee.lastActivityAt
                    ? formatDate(employee.lastActivityAt)
                    : (isRTL ? 'أبداً' : 'Never')}
                </p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'آخر نشاط' : 'Last Active'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Breakdown */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              {isRTL ? 'تحليل المهارات' : 'Skill Breakdown'}
            </CardTitle>
            <CardDescription>{isRTL ? 'الأداء عبر مختلف المجالات' : 'Performance across different areas'}</CardDescription>
          </CardHeader>
          <CardContent>
            {employee.skillBreakdown.length > 0 ? (
              <div className="space-y-4">
                {employee.skillBreakdown.map((skill) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {skill.averageScore >= 75 && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                        {skill.averageScore < 60 && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                      </div>
                      <span className={cn("text-sm font-bold", getScoreColor(skill.averageScore))}>
                        {skill.averageScore}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "absolute inset-y-0 rounded-full transition-all",
                          isRTL ? "right-0" : "left-0",
                          skill.averageScore >= 75 ? "bg-emerald-500" :
                          skill.averageScore >= 60 ? "bg-blue-500" : "bg-red-500"
                        )}
                        style={{ width: `${skill.averageScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? `بناءً على ${skill.sessionCount} جلسات` : `Based on ${skill.sessionCount} sessions`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isRTL ? 'لا توجد بيانات مهارات بعد' : 'No skill data available yet'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Score History */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {isRTL ? 'سجل الدرجات' : 'Score History'}
            </CardTitle>
            <CardDescription>{isRTL ? 'تطور الأداء بمرور الوقت' : 'Performance progression over time'}</CardDescription>
          </CardHeader>
          <CardContent>
            {employee.scoreHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-end gap-2 h-40">
                  {employee.scoreHistory.slice(-10).map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-foreground">{point.score}</span>
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all",
                          point.score >= 75 ? "bg-emerald-500" :
                          point.score >= 60 ? "bg-blue-500" : "bg-amber-500"
                        )}
                        style={{ height: `${point.score * 1.2}px` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {isRTL
                    ? `آخر ${Math.min(10, employee.scoreHistory.length)} جلسات`
                    : `Last ${Math.min(10, employee.scoreHistory.length)} sessions`}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-16">
                {isRTL ? 'لا يوجد سجل درجات بعد' : 'No score history available yet'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {(employee.weakSkills.length > 0 || employee.recommendations.length > 0) && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              {isRTL ? 'توصيات التدريب' : 'Training Recommendations'}
            </CardTitle>
            <CardDescription>{isRTL ? 'مجالات التركيز المقترحة للتحسين' : 'Suggested focus areas for improvement'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {employee.weakSkills.length > 0 && (
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <h4 className="font-semibold text-amber-500 mb-2">{isRTL ? 'نقاط الضعف' : 'Weak Areas'}</h4>
                  <ul className="space-y-2">
                    {employee.weakSkills.map((skill, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {employee.recommendations.length > 0 && (
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <h4 className="font-semibold text-blue-500 mb-2">{isRTL ? 'التوصيات' : 'Recommendations'}</h4>
                  <ul className="space-y-2">
                    {employee.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-400">
                        <NextIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">{isRTL ? 'سجل الجلسات' : 'Session History'}</CardTitle>
          <CardDescription>{isRTL ? 'جميع جلسات التدريب لهذا الموظف' : 'All training sessions for this employee'}</CardDescription>
        </CardHeader>
        <CardContent>
          {employee.sessions.length > 0 ? (
            <div className="space-y-3">
              {employee.sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                      getGradeColor(session.grade)
                    )}>
                      {session.grade || '--'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {formatScenarioType(session.scenarioType)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.completedAt)}
                        <span className="mx-2">|</span>
                        <Badge variant="outline" className="text-xs">
                          {session.difficultyLevel}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className={cn("text-right", isRTL && "text-left")}>
                    <p className={cn("text-lg font-bold", getScoreColor(session.score))}>
                      {session.score ?? '--'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.durationSeconds
                        ? `${Math.round(session.durationSeconds / 60)} ${isRTL ? 'دقيقة' : 'min'}`
                        : '--'}
                    </p>
                  </div>
                </div>
              ))}
              {employee.sessions.length > 10 && (
                <p className="text-center text-sm text-muted-foreground pt-4">
                  {isRTL
                    ? `عرض 10 من ${employee.sessions.length} جلسات`
                    : `Showing 10 of ${employee.sessions.length} sessions`}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              {isRTL ? 'لا توجد جلسات مكتملة بعد' : 'No sessions completed yet'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
