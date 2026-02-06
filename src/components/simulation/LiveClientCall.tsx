'use client';

/**
 * Live Client Call Component
 *
 * Connects the simulation page to the existing ElevenLabs real-time call system.
 * This component reuses the working voice training infrastructure without modifications.
 *
 * Naming: "Live Client Call" for real estate professional training market positioning.
 */

import { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SimulationScenarioType, DifficultyLevel } from '@/types';
import {
  Phone,
  PhoneOff,
  Mic,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const directToken = localStorage.getItem('auth_token');
    if (directToken) return directToken;

    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          localStorage.setItem('auth_token', token);
          return token;
        }
      } catch (e) {
        console.error('[LiveClientCall] Failed to parse auth-storage:', e);
      }
    }
  }
  return null;
}

interface LiveClientCallProps {
  scenarioType: SimulationScenarioType;
  difficultyLevel: DifficultyLevel;
  onEnd: () => void;
  onBack: () => void;
}

interface PerformanceAnalysis {
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

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending' | 'analyzing' | 'complete' | 'setup_required';

export function LiveClientCall({
  scenarioType,
  difficultyLevel,
  onEnd,
  onBack,
}: LiveClientCallProps) {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // ElevenLabs conversation hook - uses the SAME service as voice-training
  const conversation = useConversation({
    onConnect: () => {
      console.log('[LiveClientCall] Connected to ElevenLabs');
      setCallStatus('active');
      setError(null);
    },
    onDisconnect: () => {
      console.log('[LiveClientCall] Disconnected from ElevenLabs');
      if (callStatus === 'active') {
        setCallStatus('ending');
      }
    },
    onMessage: (message) => {
      console.log('[LiveClientCall] Message:', message);
    },
    onError: (error) => {
      console.error('[LiveClientCall] Error:', error);
      setError(`خطأ في الاتصال: ${error}`);
      setCallStatus('idle');
    },
  });

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Start call - uses the SAME backend endpoint as voice-training
  const handleStartCall = useCallback(async () => {
    try {
      setCallStatus('connecting');
      setError(null);
      setCallDuration(0);

      const token = getAuthToken();
      if (!token) {
        throw new Error('يرجى تسجيل الدخول أولاً');
      }

      // Sync token
      localStorage.setItem('auth_token', token);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/elevenlabs/signed-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('جلسة المصادقة انتهت - يرجى تسجيل الدخول مرة أخرى');
        }

        if (errorData.message?.includes('permission') || errorData.message?.includes('create agent')) {
          setCallStatus('setup_required');
          return;
        }

        throw new Error(errorData.message || 'فشل بدء المكالمة');
      }

      const { signedUrl, agentId } = await response.json();
      console.log('[LiveClientCall] Got signed URL for agent:', agentId);

      // Start ElevenLabs conversation - SAME as voice-training
      const conversationId = await conversation.startSession({
        signedUrl,
      });

      setCurrentConversationId(conversationId);
      console.log('[LiveClientCall] Started conversation:', conversationId);
    } catch (err) {
      console.error('[LiveClientCall] Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'فشل بدء المكالمة');
      setCallStatus('idle');
    }
  }, [conversation]);

  // End call - uses the SAME backend endpoint as voice-training
  const handleEndCall = useCallback(async () => {
    try {
      setCallStatus('ending');
      await conversation.endSession();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (currentConversationId) {
        setCallStatus('analyzing');

        const token = getAuthToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/elevenlabs/conversations/${currentConversationId}/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('فشل حفظ المكالمة');
        }

        const result = await response.json();
        setAnalysis(result.analysis);
        setCallStatus('complete');
      } else {
        setCallStatus('idle');
      }
    } catch (err) {
      console.error('[LiveClientCall] Failed to end call:', err);
      setError(err instanceof Error ? err.message : 'فشل حفظ المكالمة');
      setCallStatus('idle');
    }
  }, [conversation, currentConversationId]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // View full report
  const handleViewReport = () => {
    router.push('/reports');
  };

  // New session
  const handleNewSession = () => {
    setCallStatus('idle');
    setAnalysis(null);
    setCurrentConversationId(null);
    setCallDuration(0);
    setError(null);
  };

  // ============ RENDER ============

  // Setup Required
  if (callStatus === 'setup_required') {
    return (
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-yellow-700">إعداد ElevenLabs مطلوب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 text-center">
            لاستخدام المكالمات الصوتية الحية، يجب إعداد ElevenLabs Agent.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              رجوع
            </Button>
            <Button onClick={handleNewSession}>
              حاول مرة أخرى
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Complete with Analysis
  if (callStatus === 'complete' && analysis) {
    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900">تقييم الأداء المهني</CardTitle>
            <p className="text-slate-500">مكالمة تدريب مع عميل افتراضي</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className={cn("text-6xl font-bold mb-2", getScoreColor(analysis.overallScore))}>
              {analysis.overallScore}%
            </div>
            <p className="text-slate-600">{analysis.summary}</p>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              تحليل الأداء التفصيلي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'opening', label: 'الافتتاحية', score: analysis.breakdown.opening },
                { key: 'needsDiscovery', label: 'اكتشاف الاحتياجات', score: analysis.breakdown.needsDiscovery },
                { key: 'objectionHandling', label: 'معالجة الاعتراضات', score: analysis.breakdown.objectionHandling },
                { key: 'persuasion', label: 'الإقناع', score: analysis.breakdown.persuasion },
                { key: 'closing', label: 'الإغلاق', score: analysis.breakdown.closing },
                { key: 'communication', label: 'التواصل', score: analysis.breakdown.communication },
              ].map(({ key, label, score }) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className={cn("font-bold text-sm", getScoreColor(score))}>{score}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", getScoreBg(score))}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                نقاط القوة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                <XCircle className="h-5 w-5" />
                نقاط الضعف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Improvements */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <Lightbulb className="h-5 w-5" />
              اقتراحات للتحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.improvements.map((item, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            رجوع للسيناريوهات
          </Button>
          <Button onClick={handleNewSession} variant="secondary">
            مكالمة جديدة
          </Button>
          <Button onClick={handleViewReport}>
            عرض التقرير الكامل
          </Button>
        </div>
      </div>
    );
  }

  // Idle - Start Call
  if (callStatus === 'idle') {
    return (
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Phone className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-foreground">مكالمة تدريب احترافية</CardTitle>
          <p className="text-muted-foreground">
            تدرب مع عميل افتراضي يتكلم باللهجة السعودية
          </p>
          <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-200">
            {scenarioType.replace(/_/g, ' ')} - {difficultyLevel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-xl border">
            <ul className="text-sm text-muted-foreground space-y-2" dir="rtl">
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                محادثة صوتية حقيقية باللهجة السعودية
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                رد فوري من العميل الافتراضي
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">•</span>
                تقييم أدائك في نهاية المكالمة
              </li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              رجوع
            </Button>
            <Button
              size="lg"
              onClick={handleStartCall}
              className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Phone className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
              ابدأ المكالمة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connecting
  if (callStatus === 'connecting') {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-foreground">جاري الاتصال...</p>
          <p className="text-sm text-muted-foreground">يتم تجهيز المكالمة الصوتية</p>
        </CardContent>
      </Card>
    );
  }

  // Analyzing
  if (callStatus === 'analyzing') {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-foreground">جاري تحليل الأداء...</p>
          <p className="text-sm text-muted-foreground">يتم تقييم مهاراتك في المبيعات</p>
        </CardContent>
      </Card>
    );
  }

  // Ending
  if (callStatus === 'ending') {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-lg text-foreground">جاري إنهاء المكالمة...</p>
        </CardContent>
      </Card>
    );
  }

  // Active Call
  return (
    <Card className="border-green-200">
      <CardContent className="py-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Call Visual */}
          <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-green-500/20 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
            <div className="absolute inset-4 rounded-full bg-green-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
              <Mic className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">المكالمة جارية</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-3xl font-mono text-green-600">{formatDuration(callDuration)}</span>
            </div>
          </div>

          {/* Speaking Indicator */}
          {conversation.isSpeaking && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
              العميل يتحدث...
            </div>
          )}

          {/* End Call Button */}
          <Button
            size="lg"
            variant="destructive"
            onClick={handleEndCall}
            className="px-8"
          >
            <PhoneOff className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            إنهاء المكالمة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveClientCall;
