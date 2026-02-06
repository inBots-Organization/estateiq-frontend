'use client';

/**
 * Admin Voice Session Monitor
 *
 * Monitoring component for voice call sessions using ElevenLabs Conversational AI.
 * Shows session history and performance metrics for ALL trainees (admin view).
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Phone,
  PhoneOff,
  Clock,
  Award,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Timer,
  User,
  FileText,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

interface VoiceSessionWithTrainee {
  id: string;
  conversationId: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  startTime: string;
  duration: number;
  overallScore: number;
  status: string;
  hasAudio: boolean;
}

interface VoiceSessionsResponse {
  sessions: VoiceSessionWithTrainee[];
  total: number;
  page: number;
  totalPages: number;
}

interface VoiceSessionMonitorProps {
  className?: string;
  isTrainerView?: boolean;
}

export function VoiceSessionMonitor({ className, isTrainerView = false }: VoiceSessionMonitorProps) {
  const { isRTL } = useLanguage();
  const [data, setData] = useState<VoiceSessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to get token from multiple sources
  const getAuthToken = (): string | null => {
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.token;
          if (token) localStorage.setItem('auth_token', token);
        } catch (e) {
          console.error('Failed to parse auth-storage:', e);
        }
      }
    }
    return token;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/admin/voice-sessions?page=${currentPage}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(isRTL ? 'فشل تحميل الجلسات' : 'Failed to load sessions');
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      console.error('Failed to load session data:', err);
      setError(err instanceof Error ? err.message : (isRTL ? 'فشل تحميل الجلسات' : 'Failed to load sessions'));
    } finally {
      setIsLoading(false);
    }
  }, [isRTL, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return isRTL ? `${mins}د ${secs}ث` : `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/20';
    if (score >= 70) return 'text-blue-500 bg-blue-500/20';
    if (score >= 50) return 'text-amber-500 bg-amber-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const sessions = data?.sessions || [];

  // Calculate stats
  const stats = {
    totalSessions: data?.total || 0,
    averageScore: sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.overallScore, 0) / sessions.length
      : 0,
    averageDuration: sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0,
    totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (isLoading) {
    return (
      <Card className={cn("border-border", className)}>
        <CardContent className="py-8 text-center">
          <RefreshCw className={cn("h-8 w-8 animate-spin mx-auto mb-2", isTrainerView ? "text-teal-500" : "text-violet-500")} />
          <p className="text-muted-foreground">{isRTL ? 'جاري تحميل بيانات الجلسات...' : 'Loading session data...'}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-border", className)}>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'إجمالي الجلسات' : 'Total Sessions'}
            </CardTitle>
            <Phone className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'إجمالي المكالمات التدريبية المكتملة' : 'Total training calls completed'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'متوسط الدرجات' : 'Average Score'}
            </CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'عبر جميع الجلسات' : 'Across all sessions'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'متوسط المدة' : 'Avg Duration'}
            </CardTitle>
            <Timer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatDuration(Math.round(stats.averageDuration))}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'لكل جلسة' : 'Per session'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              {isRTL ? 'إجمالي الوقت' : 'Total Time'}
            </CardTitle>
            <Clock className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.floor(stats.totalDuration / 3600)}{isRTL ? 'س' : 'h'} {Math.floor((stats.totalDuration % 3600) / 60)}{isRTL ? 'د' : 'm'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'وقت التدريب المسجل' : 'Training time logged'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className={cn("h-5 w-5", isTrainerView ? "text-teal-500" : "text-violet-500")} />
              {isTrainerView
                ? (isRTL ? 'جلسات طلابي' : 'My Students Sessions')
                : (isRTL ? 'جلسات التدريب الصوتي' : 'Voice Training Sessions')
              }
            </CardTitle>
            <CardDescription>
              {isTrainerView
                ? (isRTL ? 'جلسات التدريب الصوتي لطلابك في المجموعات' : 'Voice training sessions for your assigned students')
                : (isRTL ? 'جميع جلسات التدريب الصوتي للفريق' : 'All voice training sessions for the team')
              }
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PhoneOff className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
              <p>
                {isTrainerView
                  ? (isRTL ? 'لم يتم تسجيل جلسات لطلابك بعد' : 'No sessions recorded for your students yet')
                  : (isRTL ? 'لم يتم تسجيل جلسات بعد' : 'No sessions recorded yet')
                }
              </p>
              <p className="text-sm">
                {isTrainerView
                  ? (isRTL ? 'ستظهر الجلسات هنا بعد إكمال طلابك للمكالمات الصوتية' : 'Sessions will appear here after your students complete voice calls')
                  : (isRTL ? 'ستظهر الجلسات هنا بعد إكمال المستخدمين للمكالمات الصوتية' : 'Sessions will appear here after users complete voice calls')
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Score Badge */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold",
                        getScoreColor(session.overallScore)
                      )}>
                        {session.overallScore}
                      </div>

                      {/* Session Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-foreground">
                            {session.traineeName}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{session.traineeEmail}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.duration)}
                          </span>
                          <span>•</span>
                          <span>{formatDate(session.startTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={session.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {session.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') : session.status}
                      </Badge>

                      {/* View Report Button */}
                      <Link href={`/admin/trainee/${session.traineeId}/reports`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <FileText className="h-4 w-4" />
                          {isRTL ? 'التقرير' : 'Report'}
                          <ChevronIcon className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
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
                      ? `صفحة ${data.page} من ${data.totalPages}`
                      : `Page ${data.page} of ${data.totalPages}`}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
