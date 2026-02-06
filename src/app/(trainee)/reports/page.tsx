'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/context/auth.context';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils/cn';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { SkillRadarChart } from '@/components/charts/SkillRadarChart';
import { exportToPDF, downloadCSV } from '@/lib/utils/pdf-export';
import { VoiceReportsSection } from '@/components/reports/VoiceReportsSection';
import { TextReportsSection } from '@/components/reports/TextReportsSection';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Target,
  Calendar,
  Award,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  BarChart3,
  Lightbulb,
  BookOpen,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';

interface DashboardData {
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  improvement: number;
  scoreHistory: { date: string; score: number; sessionId: string }[];
  recentSessions: {
    id: string;
    scenarioType: string;
    difficultyLevel: string;
    completedAt: string;
    score: number | null;
    grade: string | null;
  }[];
}

interface SkillData {
  skills: {
    skill: string;
    skillKey: string;
    averageScore: number | null;
    sessionCount: number;
    benchmark: number;
    tips: string[];
    isStrength: boolean;
    isWeakness: boolean;
  }[];
  strengths: string[];
  weaknesses: string[];
}

interface SessionData {
  sessions: {
    id: string;
    scenarioType: string;
    difficultyLevel: string;
    status: string;
    completedAt: string;
    durationSeconds: number | null;
    score: number | null;
    grade: string | null;
  }[];
  total: number;
  page: number;
  totalPages: number;
}

interface TrendData {
  month: string;
  year: number;
  averageScore: number | null;
  sessionCount: number;
}

interface RecommendationData {
  recommendations: {
    priority: string;
    title: string;
    description: string;
    category: string;
  }[];
  weakSkills: string[];
  suggestedCourses: { title: string; reason: string }[];
}

export default function ReportsPage() {
  const { token } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [skills, setSkills] = useState<SkillData | null>(null);
  const [sessions, setSessions] = useState<SessionData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);

  const [scenarioFilter, setScenarioFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // RTL-aware chevron
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const fetchData = useCallback(async () => {
    // Get token from localStorage if not available in state yet
    let authToken = token;
    if (!authToken) {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          authToken = parsed?.state?.token;
        }
      } catch (e) {
        console.error('[ReportsPage] Failed to parse auth-storage:', e);
      }
    }

    if (!authToken) {
      console.log('[ReportsPage] No token available, skipping fetch');
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept-Language': language === 'ar' ? 'ar' : 'en',
    };

    try {
      // Use explicit base URL without /api suffix - we add it in the paths
      const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Remove trailing /api if present to avoid duplication
      const baseUrl = envUrl.replace(/\/api\/?$/, '');

      console.log('[ReportsPage] Fetching from:', baseUrl);

      const [dashboardRes, skillsRes, sessionsRes, trendsRes, recsRes] = await Promise.all([
        fetch(`${baseUrl}/api/reports/me/dashboard`, { headers }),
        fetch(`${baseUrl}/api/reports/me/skills`, { headers }),
        fetch(`${baseUrl}/api/reports/me/sessions?page=${currentPage}&limit=10&scenarioType=${scenarioFilter}`, { headers }),
        fetch(`${baseUrl}/api/reports/me/trends?months=6`, { headers }),
        fetch(`${baseUrl}/api/reports/me/recommendations`, { headers }),
      ]);

      // Log all response statuses for debugging
      console.log('[ReportsPage] Response statuses:', {
        dashboard: dashboardRes.status,
        skills: skillsRes.status,
        sessions: sessionsRes.status,
        trends: trendsRes.status,
        recommendations: recsRes.status,
      });

      // Check if any response is 401 (unauthorized) - token might be expired
      const allResponses = [dashboardRes, skillsRes, sessionsRes, trendsRes, recsRes];
      const unauthorized = allResponses.some(r => r.status === 401);
      if (unauthorized) {
        console.log('[ReportsPage] Unauthorized - redirecting');
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // Parse successful responses silently (no error shown for individual failures)
      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        console.log('[ReportsPage] Dashboard data:', data);
        setDashboard(data);
      } else {
        console.log('[ReportsPage] Dashboard failed:', dashboardRes.status, await dashboardRes.text().catch(() => ''));
      }

      if (skillsRes.ok) {
        const data = await skillsRes.json();
        console.log('[ReportsPage] Skills data:', data);
        setSkills(data);
      } else {
        console.log('[ReportsPage] Skills failed:', skillsRes.status);
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        console.log('[ReportsPage] Sessions data:', data);
        setSessions(data);
      } else {
        console.log('[ReportsPage] Sessions failed:', sessionsRes.status);
      }

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        console.log('[ReportsPage] Trends data:', data);
        setTrends(data);
      } else {
        console.log('[ReportsPage] Trends failed:', trendsRes.status);
      }

      if (recsRes.ok) {
        const data = await recsRes.json();
        console.log('[ReportsPage] Recommendations data:', data);
        setRecommendations(data);
      } else {
        console.log('[ReportsPage] Recommendations failed:', recsRes.status);
      }
    } catch (err) {
      // Only show error for network failures, not API errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.error('[ReportsPage] Network error:', err);
        setError(isRTL ? 'فشل الاتصال بالخادم' : 'Failed to connect to server');
      }
      // Silently ignore other errors - data will just be empty
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [token, currentPage, scenarioFilter, isRTL, language]);

  useEffect(() => {
    // Fetch immediately - no delay needed
    fetchData();
  }, [fetchData]);

  // Analyze missing sessions to generate skill reports
  const handleAnalyzeMissing = async () => {
    let authToken = token;
    if (!authToken) {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          authToken = parsed?.state?.token;
        }
      } catch {
        return;
      }
    }
    if (!authToken) return;

    setIsAnalyzing(true);
    try {
      const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const baseUrl = envUrl.replace(/\/api\/?$/, '');

      const response = await fetch(`${baseUrl}/api/reports/me/analyze-missing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh data after analysis
        await fetchData();
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      // Use html-to-image for better Arabic font rendering with direct PDF download
      await exportToPDF('reports-content', {
        filename: 'performance-report.pdf',
        isRTL: isRTL,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      setError(t.reports.exportFailed);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!sessions?.sessions?.length) {
      setError(t.reports.noDataToExport);
      return;
    }
    downloadCSV(
      sessions.sessions.map(s => ({
        date: s.completedAt,
        scenario: s.scenarioType,
        difficulty: s.difficultyLevel,
        score: s.score ?? 'N/A',
        grade: s.grade ?? 'N/A',
        duration_seconds: s.durationSeconds ?? 'N/A',
      })),
      'session-history.csv'
    );
  };

  const formatScenarioType = (type: string) => {
    const scenarioMap: Record<string, string> = {
      'property_showing': t.simulations.scenarios.propertyShowing,
      'price_negotiation': t.simulations.scenarios.priceNegotiation,
      'objection_handling': t.simulations.scenarios.objectionHandling,
      'first_contact': t.simulations.scenarios.firstContact,
      'closing_deal': t.simulations.scenarios.closingDeal,
      'difficult_client': t.simulations.scenarios.difficultClient,
    };
    return scenarioMap[type] || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const minutes = Math.round(seconds / 60);
    return isRTL ? `${minutes} ${t.reports.minutes}` : `${minutes} min`;
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'A': return 'bg-success/10 text-success border-success/20';
      case 'B': return 'bg-info/10 text-info border-info/20';
      case 'C': return 'bg-warning/10 text-warning border-warning/20';
      case 'D': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'F': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 70) return 'text-info';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const difficultyMap: Record<string, string> = {
      'easy': t.simulations.difficulty.easy,
      'medium': t.simulations.difficulty.medium,
      'hard': t.simulations.difficulty.hard,
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'high': t.reports.priority.high,
      'medium': t.reports.priority.medium,
      'low': t.reports.priority.low,
    };
    return priorityMap[priority] || priority;
  };

  // Only show loading skeleton on initial load, not on refreshes
  if (isLoading && !isInitialized) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 bg-muted rounded-xl"></div>
            <div className="h-80 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.reports.title}</h1>
          <p className="text-muted-foreground">
            {t.reports.subtitle}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2", isLoading && "animate-spin")} />
            {t.reports.refresh}
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={!sessions?.sessions?.length}>
            <FileText className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t.reports.exportCSV}
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
            ) : (
              <Download className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            )}
            {t.reports.exportPDF}
          </Button>
        </div>
      </div>

      {/* Content for PDF export */}
      <div id="reports-content">
        {/* PDF Header - hidden on screen, visible only in print/export */}
        <div className="hidden print:block mb-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">{t.reports.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.reports.subtitle}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {isRTL ? 'تم التصدير:' : 'Generated:'} {new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')} {new Date().toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.totalSessions}</CardTitle>
              <div className="stat-card-icon bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dashboard?.completedSessions ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{t.reports.completedSimulations}</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.averageScore}</CardTitle>
              <div className="stat-card-icon bg-info/10">
                <Target className="h-4 w-4 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", getScoreColor(dashboard?.averageScore ?? null))}>
                {dashboard?.averageScore ?? '--'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.reports.acrossAllScenarios}</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.improvement}</CardTitle>
              <div className={cn(
                "stat-card-icon",
                (dashboard?.improvement ?? 0) >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                {(dashboard?.improvement ?? 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold",
                (dashboard?.improvement ?? 0) >= 0 ? "text-success" : "text-destructive"
              )}>
                {(dashboard?.improvement ?? 0) >= 0 ? '+' : ''}{dashboard?.improvement ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.reports.pointsSinceStart}</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.reports.topSkill}</CardTitle>
              <div className="stat-card-icon bg-warning/10">
                <Award className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground truncate">
                {skills?.strengths?.[0] || t.reports.keepPracticing}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.reports.yourStrongestArea}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Skill Breakdown */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t.reports.skillPerformance}
              </CardTitle>
              <CardDescription>{t.reports.performanceAcrossAreas}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills?.skills.map((skill) => (
                  <div key={skill.skillKey} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {skill.isStrength && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {skill.isWeakness && <AlertCircle className="h-4 w-4 text-destructive" />}
                        <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                      </div>
                      <span className={cn("text-sm font-bold", getScoreColor(skill.averageScore))}>
                        {skill.averageScore ?? '--'}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "absolute inset-y-0 rounded-full transition-all duration-500",
                          isRTL ? "right-0" : "left-0",
                          skill.averageScore !== null && skill.averageScore >= 75 ? "bg-success" :
                          skill.averageScore !== null && skill.averageScore >= 60 ? "bg-info" :
                          skill.averageScore !== null ? "bg-warning" : "bg-muted-foreground"
                        )}
                        style={{ width: `${skill.averageScore ?? 0}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-0.5 bg-muted-foreground/50"
                        style={{ [isRTL ? 'right' : 'left']: '75%' }}
                        title={`${t.reports.benchmark}: 75`}
                      />
                    </div>
                    {skill.tips.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{skill.tips[0]}</p>
                    )}
                  </div>
                ))}
                {/* Show analyze button if no skills have scores but there are sessions */}
                {skills?.skills.every(s => s.averageScore === null) && dashboard && dashboard.completedSessions > 0 && (
                  <div className="text-center py-4 border-t border-border mt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {isRTL ? 'لديك جلسات مكتملة بدون تحليل مفصل' : 'You have sessions without detailed analysis'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyzeMissing}
                      disabled={isAnalyzing}
                      className="gap-2"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BarChart3 className="h-4 w-4" />
                      )}
                      {isRTL ? 'تحليل الجلسات السابقة' : 'Analyze Past Sessions'}
                    </Button>
                  </div>
                )}
                {(!skills?.skills || skills.skills.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">
                    {t.reports.completeSimulations}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Score Trend Chart */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-success" />
                {t.reports.scoreProgression}
              </CardTitle>
              <CardDescription>{t.reports.performanceOverTime}</CardDescription>
            </CardHeader>
            <CardContent>
              {trends.length > 0 ? (
                <div className="space-y-4">
                  <ScoreChart
                    data={trends}
                    height={200}
                    showBenchmark={true}
                    benchmarkValue={75}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>{trends.length} {t.reports.monthsTracked}</span>
                    <span>{trends.reduce((sum, t) => sum + t.sessionCount, 0)} {t.reports.totalSessionsLabel}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-16">
                  {t.reports.completeMoreSimulations}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Radar Chart */}
        {skills?.skills && skills.skills.some(s => s.averageScore !== null) && (
          <Card className="card-hover mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                {t.reports.skillRadar}
              </CardTitle>
              <CardDescription>{t.reports.visualComparison}</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillRadarChart
                skills={skills.skills}
                height={300}
                showBenchmark={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Sessions Table */}
        <Card className="card-hover mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-foreground">{t.reports.sessionHistory}</CardTitle>
                <CardDescription>{t.reports.allCompletedSessions}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={scenarioFilter} onValueChange={setScenarioFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    <SelectValue placeholder={t.reports.filterByScenario} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.reports.allScenarios}</SelectItem>
                    <SelectItem value="property_showing">{t.simulations.scenarios.propertyShowing}</SelectItem>
                    <SelectItem value="price_negotiation">{t.simulations.scenarios.priceNegotiation}</SelectItem>
                    <SelectItem value="first_contact">{t.simulations.scenarios.firstContact}</SelectItem>
                    <SelectItem value="objection_handling">{t.simulations.scenarios.objectionHandling}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sessions?.sessions && sessions.sessions.length > 0 ? (
              <>
                <div className="space-y-3">
                  {sessions.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border",
                          getGradeColor(session.grade)
                        )}>
                          {session.grade || '--'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {formatScenarioType(session.scenarioType)}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {formatDate(session.completedAt)}
                            <span className="text-border">|</span>
                            <Badge variant="outline" className="text-xs">
                              {getDifficultyLabel(session.difficultyLevel)}
                            </Badge>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={cn("text-right", isRTL && "text-left")}>
                          <p className={cn("text-xl font-bold", getScoreColor(session.score))}>
                            {session.score ?? '--'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(session.durationSeconds)}
                          </p>
                        </div>
                        <ChevronIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {sessions.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      {t.reports.previous}
                    </Button>
                    <span className="px-4 py-2 text-sm text-muted-foreground">
                      {t.reports.page} {sessions.page} {t.reports.of} {sessions.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(sessions.totalPages, p + 1))}
                      disabled={currentPage === sessions.totalPages}
                    >
                      {t.reports.next}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                {t.reports.noSessions}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-warning" />
              {t.reports.personalizedRecommendations}
            </CardTitle>
            <CardDescription>{t.reports.aiSuggestions}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {t.reports.focusAreas}
                </h4>
                {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
                  recommendations.recommendations.slice(0, 3).map((rec, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-xl",
                        isRTL ? "border-r-4" : "border-l-4",
                        rec.priority === 'high' ? "bg-destructive/5 border-destructive" :
                        rec.priority === 'medium' ? "bg-warning/5 border-warning" :
                        "bg-info/5 border-info"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs uppercase font-semibold",
                            rec.priority === 'high' ? "text-destructive border-destructive/50" :
                            rec.priority === 'medium' ? "text-warning border-warning/50" :
                            "text-info border-info/50"
                          )}
                        >
                          {getPriorityLabel(rec.priority)}
                        </Badge>
                      </div>
                      <h5 className="font-medium text-foreground mt-2">{rec.title}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground py-4">
                    {t.reports.completeMoreForRecommendations}
                  </p>
                )}
              </div>

              {/* Suggested Courses */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-success" />
                  {t.reports.suggestedCourses}
                </h4>
                {recommendations?.suggestedCourses && recommendations.suggestedCourses.length > 0 ? (
                  recommendations.suggestedCourses.map((course, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-xl">
                      <h5 className="font-medium text-foreground">{course.title}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{course.reason}</p>
                      <Button variant="link" className={cn("p-0 h-auto mt-2 text-primary", isRTL && "flex-row-reverse")}>
                        {t.reports.viewCourse}
                        <ChevronIcon className={cn("h-4 w-4", isRTL ? "mr-1" : "ml-1")} />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-success/5 rounded-xl border border-success/20">
                    <h5 className="font-medium text-success">{t.reports.greatJob}</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.reports.keepPracticingMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Text Chat Reports Section */}
        <div className="mt-8">
          <TextReportsSection />
        </div>

        {/* Voice Training Reports Section */}
        <div className="mt-8">
          <VoiceReportsSection />
        </div>
      </div>
    </div>
  );
}
