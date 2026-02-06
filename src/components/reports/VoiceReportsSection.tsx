'use client';

/**
 * Voice Reports Section
 *
 * Displays voice training session reports with detailed performance analysis,
 * audio playback, and PDF export functionality.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { generateVoiceReportPDF, VoiceReportData } from '@/lib/utils/voice-report-pdf';
import {
  Phone,
  Clock,
  Award,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';

interface VoiceSession {
  id: string;
  conversationId: string;
  traineeId: string;
  startTime: string;
  endTime: string;
  duration: number;
  durationSeconds: number;
  transcript: string;
  analysis: string;
  overallScore: number;
  status: string;
  hasAudio: boolean;
}

interface ParsedAnalysis {
  overallScore: number;
  breakdown: {
    opening: number;
    needsDiscovery: number;
    objectionHandling: number;
    persuasion: number;
    closing: number;
    communication: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

interface VoiceReportsSectionProps {
  className?: string;
  traineeId?: string; // For admin view of specific trainee's reports
}

// Safe number helper - prevents NaN display
function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
}

// Safe percentage display
function safePercent(value: unknown): string {
  const num = safeNumber(value, 0);
  return `${Math.round(num)}%`;
}

// Default analysis structure
function getDefaultAnalysis(): ParsedAnalysis {
  return {
    overallScore: 0,
    breakdown: {
      opening: 0,
      needsDiscovery: 0,
      objectionHandling: 0,
      persuasion: 0,
      closing: 0,
      communication: 0,
    },
    strengths: ['لم يتم التحليل'],
    weaknesses: ['لم يتم التحليل'],
    improvements: ['أكمل المكالمة للحصول على تحليل'],
    summary: 'لم يتم تحليل هذه الجلسة',
  };
}

export function VoiceReportsSection({ className, traineeId }: VoiceReportsSectionProps) {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        // No token - silently return empty, user will be redirected by layout
        setSessions([]);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      // Use admin endpoint if traineeId is provided, otherwise use personal history
      const url = traineeId
        ? `${apiUrl}/admin/trainee/${traineeId}/voice-sessions`
        : `${apiUrl}/elevenlabs/history`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // For 401/403, silently return empty - user will be redirected
        if (response.status === 401 || response.status === 403) {
          setSessions([]);
          return;
        }
        // For other errors, silently return empty (no error shown)
        setSessions([]);
        return;
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      // Network errors - silently fail, show empty state
      console.error('[VoiceReportsSection] Failed to load:', err);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const parseAnalysis = (analysisJson: string | null): ParsedAnalysis => {
    if (!analysisJson) return getDefaultAnalysis();

    try {
      const parsed = JSON.parse(analysisJson);

      // Validate and sanitize all numeric values
      return {
        overallScore: safeNumber(parsed.overallScore, 0),
        breakdown: {
          opening: safeNumber(parsed.breakdown?.opening, 0),
          needsDiscovery: safeNumber(parsed.breakdown?.needsDiscovery, 0),
          objectionHandling: safeNumber(parsed.breakdown?.objectionHandling, 0),
          persuasion: safeNumber(parsed.breakdown?.persuasion, 0),
          closing: safeNumber(parsed.breakdown?.closing, 0),
          communication: safeNumber(parsed.breakdown?.communication, 0),
        },
        strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0
          ? parsed.strengths
          : ['لم يتم تحديد نقاط قوة'],
        weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
          ? parsed.weaknesses
          : ['لم يتم تحديد نقاط ضعف'],
        improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0
          ? parsed.improvements
          : ['لم يتم تحديد اقتراحات'],
        summary: parsed.summary || 'لم يتم تحليل هذه الجلسة',
      };
    } catch {
      return getDefaultAnalysis();
    }
  };

  const formatDuration = (seconds: unknown): string => {
    const secs = safeNumber(seconds, 0);
    if (secs <= 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const getScoreColor = (score: number) => {
    const safeScore = safeNumber(score, 0);
    if (safeScore >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (safeScore >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBarColor = (score: number) => {
    const safeScore = safeNumber(score, 0);
    if (safeScore >= 70) return 'bg-green-500';
    if (safeScore >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handlePlayAudio = async (session: VoiceSession) => {
    const token = getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // If already playing this session, pause it
    if (playingAudioId === session.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      // Create audio element with authenticated URL
      const audio = new Audio();
      audio.src = `${apiUrl}/elevenlabs/sessions/${session.id}/audio`;

      // Add authorization header via fetch and blob
      const response = await fetch(`${apiUrl}/elevenlabs/sessions/${session.id}/audio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('التسجيل غير متوفر');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      audio.src = audioUrl;
      audio.onended = () => {
        setPlayingAudioId(null);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setPlayingAudioId(null);
        console.error('فشل تشغيل التسجيل');
      };

      audioRef.current = audio;
      await audio.play();
      setPlayingAudioId(session.id);
    } catch (err) {
      console.error('Failed to play audio:', err);
    }
  };

  const handleExportPDF = async (session: VoiceSession) => {
    setExportingId(session.id);
    try {
      const analysis = parseAnalysis(session.analysis);

      const reportData: VoiceReportData = {
        sessionId: session.id,
        conversationId: session.conversationId,
        traineeId: session.traineeId,
        startTime: session.startTime,
        endTime: session.endTime,
        durationSeconds: safeNumber(session.durationSeconds || session.duration, 0),
        overallScore: safeNumber(session.overallScore, 0),
        breakdown: analysis.breakdown,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        improvements: analysis.improvements,
        summary: analysis.summary,
      };

      await generateVoiceReportPDF(reportData);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExportingId(null);
    }
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  // Calculate stats with safe numbers
  const stats = {
    totalSessions: sessions.length,
    averageScore: sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + safeNumber(s.overallScore, 0), 0) / sessions.length)
      : 0,
    totalDuration: sessions.reduce((sum, s) => sum + safeNumber(s.durationSeconds || s.duration, 0), 0),
    bestScore: sessions.length > 0
      ? Math.max(...sessions.map(s => safeNumber(s.overallScore, 0)))
      : 0,
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">جاري تحميل تقارير المكالمات...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Voice Training Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">المكالمات الصوتية</CardTitle>
            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-1">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">إجمالي جلسات التدريب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">متوسط النتيجة</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold mt-1",
              stats.averageScore >= 70 ? "text-green-600" :
              stats.averageScore >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
              {safePercent(stats.averageScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">عبر جميع المكالمات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">أفضل نتيجة</CardTitle>
            <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mt-1">{safePercent(stats.bestScore)}</div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">أعلى نتيجة محققة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium leading-relaxed">وقت التدريب</CardTitle>
            <Clock className="h-5 w-5 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mt-1">
              {Math.floor(safeNumber(stats.totalDuration, 0) / 60)} <span className="text-lg font-normal">دقيقة</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">إجمالي وقت التدريب</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              تقارير المكالمات الصوتية
            </CardTitle>
            <CardDescription>
              سجل تقييمات أدائك في التدريب الصوتي
            </CardDescription>
          </div>
          <button
            onClick={fetchSessions}
            className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </button>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">لا توجد تقارير بعد</p>
              <p className="text-sm mt-1">أكمل مكالمة تدريب صوتي لرؤية التقارير هنا</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const analysis = parseAnalysis(session.analysis);
                const isExpanded = expandedSession === session.id;
                const sessionScore = safeNumber(session.overallScore, 0);
                const sessionDuration = safeNumber(session.durationSeconds || session.duration, 0);

                return (
                  <div
                    key={session.id}
                    className="border rounded-xl overflow-hidden transition-all"
                  >
                    {/* Session Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(session.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border",
                          getScoreColor(sessionScore)
                        )}>
                          {safePercent(sessionScore)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            جلسة تدريب صوتي
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(session.startTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(sessionDuration)}
                            </span>
                            {session.hasAudio && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Volume2 className="h-3 w-3" />
                                تسجيل متوفر
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Audio Play Button */}
                        {session.hasAudio && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayAudio(session);
                            }}
                            className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                            title="تشغيل التسجيل"
                          >
                            {playingAudioId === session.id ? (
                              <Pause className="h-4 w-4 text-primary" />
                            ) : (
                              <Play className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        )}
                        {/* PDF Export Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPDF(session);
                          }}
                          disabled={exportingId === session.id}
                          className="inline-flex items-center px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                          {exportingId === session.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="mr-2">تحميل PDF</span>
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4 space-y-4">
                        {/* Score Breakdown */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            تحليل الأداء التفصيلي
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              { key: 'opening', label: 'الافتتاحية', score: analysis.breakdown.opening },
                              { key: 'needsDiscovery', label: 'اكتشاف الاحتياجات', score: analysis.breakdown.needsDiscovery },
                              { key: 'objectionHandling', label: 'معالجة الاعتراضات', score: analysis.breakdown.objectionHandling },
                              { key: 'persuasion', label: 'الإقناع', score: analysis.breakdown.persuasion },
                              { key: 'closing', label: 'الإغلاق', score: analysis.breakdown.closing },
                              { key: 'communication', label: 'التواصل', score: analysis.breakdown.communication },
                            ].map(({ key, label, score }) => {
                              const safeScore = safeNumber(score, 0);
                              return (
                                <div key={key} className="bg-white rounded-lg p-3 border">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">{label}</span>
                                    <span className={cn(
                                      "font-bold text-sm",
                                      safeScore >= 70 ? "text-green-600" :
                                      safeScore >= 50 ? "text-yellow-600" : "text-red-600"
                                    )}>
                                      {safePercent(safeScore)}
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={cn("h-full rounded-full transition-all", getScoreBarColor(safeScore))}
                                      style={{ width: `${safeScore}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Strengths */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              نقاط القوة
                            </h5>
                            <ul className="space-y-1">
                              {analysis.strengths.map((strength, i) => (
                                <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Weaknesses */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              نقاط الضعف
                            </h5>
                            <ul className="space-y-1">
                              {analysis.weaknesses.map((weakness, i) => (
                                <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">✗</span>
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Improvements */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            اقتراحات للتحسين
                          </h5>
                          <ul className="space-y-1">
                            {analysis.improvements.map((improvement, i) => (
                              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">→</span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-100 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-700 mb-2">ملخص الأداء</h5>
                          <p className="text-sm text-gray-600">{analysis.summary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VoiceReportsSection;
