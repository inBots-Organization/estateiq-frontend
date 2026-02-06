'use client';

/**
 * Voice Training Page
 *
 * Real-time Arabic voice conversation training using ElevenLabs Conversational AI.
 * The trainee acts as the real estate agent while the AI plays the Saudi client role.
 */

import { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneOff, Mic, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Helper function to get auth token from all possible sources
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const directToken = localStorage.getItem('auth_token');
    if (directToken) {
      return directToken;
    }

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
        console.error('[VoiceTraining] Failed to parse auth-storage:', e);
      }
    }
  }

  return null;
}

// Types
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
  transcriptHighlights: {
    good: string[];
    needsWork: string[];
  };
}

interface SavedSession {
  sessionId: string;
  conversationId: string;
  analysis: PerformanceAnalysis;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending' | 'analyzing' | 'complete' | 'setup_required';

// Setup Instructions Component
function SetupInstructions({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
        <span>⚠️</span> إعداد ElevenLabs مطلوب
      </h2>
      <p className="text-muted-foreground mb-4">
        لاستخدام المكالمات الصوتية، يجب إنشاء Agent في ElevenLabs:
      </p>

      <div className="space-y-4 text-sm">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">الخطوة 1: افتح ElevenLabs Conversational AI</h3>
          <a
            href="https://elevenlabs.io/app/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            elevenlabs.io/app/conversational-ai
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">الخطوة 2: أنشئ Agent جديد</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ms-4">
            <li>اضغط على &quot;Create Agent&quot;</li>
            <li>اختر &quot;Blank Template&quot;</li>
            <li>اسم الAgent: &quot;Saudi Real Estate Client&quot;</li>
            <li>اللغة: Arabic</li>
            <li>الصوت: اختر صوت عربي ذكر</li>
          </ul>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">الخطوة 3: أضف System Prompt</h3>
          <p className="text-xs text-muted-foreground mb-2">انسخ هذا النص إلى حقل System Prompt:</p>
          <div className="bg-card border border-border p-3 rounded text-xs font-mono overflow-auto max-h-40 text-foreground" dir="rtl">
            أنت عميل سعودي (المشتري) تتصل بوكيل عقاري للاستفسار عن عقار للتدريب على المبيعات.
            <br/><br/>
            شخصيتك:
            <br/>- اسمك أبو محمد، رجل أعمال سعودي في الأربعينات
            <br/>- تبحث عن عقار استثماري في الرياض أو جدة
            <br/>- ميزانيتك بين 2-5 مليون ريال
            <br/>- مهتم بالعائد الاستثماري والموقع
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">الخطوة 4: انسخ Agent ID</h3>
          <p className="text-muted-foreground">بعد الحفظ، انسخ الـ Agent ID من الرابط أو الإعدادات</p>
          <p className="text-xs text-muted-foreground mt-1">سيكون شيء مثل: <code className="bg-muted px-1 rounded">pR7...xyz</code></p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-bold text-foreground mb-2">الخطوة 5: أضف ID إلى الإعدادات</h3>
          <p className="text-muted-foreground">في ملف <code className="bg-muted px-1 rounded">backend/.env</code>:</p>
          <code className="block bg-card border border-border p-2 rounded mt-2 text-emerald-600 dark:text-emerald-400" dir="ltr">
            ELEVENLABS_AGENT_ID=your-agent-id-here
          </code>
          <p className="text-xs text-muted-foreground mt-2">ثم أعد تشغيل الخادم</p>
        </div>
      </div>

      <Button
        onClick={onRetry}
        className="mt-6 w-full"
        size="lg"
      >
        <RefreshCw className="w-4 h-4 me-2" />
        حاول مرة أخرى
      </Button>
    </Card>
  );
}

export default function VoiceTrainingPage() {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const storeToken = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      setIsHydrated(true);
      const token = storeToken || getAuthToken();
      console.log('[VoiceTraining] Hydration complete:', {
        storeToken: storeToken ? `${storeToken.substring(0, 20)}...` : 'null',
        helperToken: getAuthToken() ? 'present' : 'null',
        isAuthenticated,
      });

      if (!storeToken && typeof window !== 'undefined') {
        const localToken = getAuthToken();
        if (localToken) {
          localStorage.setItem('auth_token', localToken);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [storeToken, isAuthenticated]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('[VoiceTraining] Connected to ElevenLabs');
      setCallStatus('active');
      setError(null);
    },
    onDisconnect: () => {
      console.log('[VoiceTraining] Disconnected from ElevenLabs');
      if (callStatus === 'active') {
        setCallStatus('ending');
      }
    },
    onMessage: (message) => {
      console.log('[VoiceTraining] Message:', message);
    },
    onError: (error) => {
      console.error('[VoiceTraining] Error:', error);
      setError(`Connection error: ${error}`);
      setCallStatus('idle');
    },
  });

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

  const handleStartCall = useCallback(async () => {
    try {
      setCallStatus('connecting');
      setError(null);
      setCallDuration(0);

      let token = storeToken || getAuthToken();

      if (!token) {
        throw new Error('يرجى تسجيل الدخول أولاً - لم يتم العثور على رمز المصادقة');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/elevenlabs/signed-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: { message?: string; error?: string } = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        if (response.status === 401) {
          throw new Error('جلسة المصادقة انتهت - يرجى تسجيل الدخول مرة أخرى');
        }

        if (errorData.message?.includes('permission') || errorData.message?.includes('create agent')) {
          setCallStatus('setup_required');
          return;
        }
        throw new Error(errorData.message || errorData.error || `فشل في الحصول على رابط الاتصال (${response.status})`);
      }

      const { signedUrl, agentId } = await response.json();
      console.log('[VoiceTraining] Got signed URL for agent:', agentId);

      const conversationId = await conversation.startSession({
        signedUrl,
      });

      setCurrentConversationId(conversationId);
      console.log('[VoiceTraining] Started conversation:', conversationId);
    } catch (err) {
      console.error('[VoiceTraining] Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setCallStatus('idle');
    }
  }, [conversation, storeToken]);

  const handleEndCall = useCallback(async () => {
    try {
      setCallStatus('ending');
      await conversation.endSession();

      if (currentConversationId) {
        setCallStatus('analyzing');

        const token = localStorage.getItem('auth_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const response = await fetch(`${apiUrl}/elevenlabs/conversations/${currentConversationId}/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Save failed: ${response.status}`);
        }

        const result: SavedSession = await response.json();
        setAnalysis(result.analysis);
        setCallStatus('complete');
      } else {
        setCallStatus('idle');
      }
    } catch (err) {
      console.error('[VoiceTraining] Failed to end call:', err);
      setError(err instanceof Error ? err.message : 'فشل في حفظ المكالمة');
      setCallStatus('idle');
    }
  }, [conversation, currentConversationId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNewSession = () => {
    setCallStatus('idle');
    setAnalysis(null);
    setCurrentConversationId(null);
    setCallDuration(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">تدريب المكالمات الصوتية</h1>
          <p className="text-muted-foreground">تحدث مع العميل السعودي الافتراضي لتحسين مهاراتك في المبيعات</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-rose-100 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-4 mb-6 text-center">
            <p className="text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {callStatus === 'setup_required' ? (
          <SetupInstructions onRetry={handleNewSession} />
        ) : callStatus === 'complete' && analysis ? (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="p-6 text-center">
              <h2 className="text-xl mb-4 text-foreground">النتيجة الإجمالية</h2>
              <div className="text-6xl font-bold mb-2" style={{
                color: analysis.overallScore >= 70 ? '#22c55e' :
                       analysis.overallScore >= 50 ? '#eab308' : '#ef4444'
              }}>
                {analysis.overallScore}%
              </div>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </Card>

            {/* Breakdown Scores */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">تحليل الأداء التفصيلي</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'opening', label: 'الافتتاحية', score: analysis.breakdown.opening },
                  { key: 'needsDiscovery', label: 'اكتشاف الاحتياجات', score: analysis.breakdown.needsDiscovery },
                  { key: 'objectionHandling', label: 'معالجة الاعتراضات', score: analysis.breakdown.objectionHandling },
                  { key: 'persuasion', label: 'الإقناع', score: analysis.breakdown.persuasion },
                  { key: 'closing', label: 'الإغلاق', score: analysis.breakdown.closing },
                  { key: 'communication', label: 'التواصل', score: analysis.breakdown.communication },
                ].map(({ key, label, score }) => (
                  <div key={key} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-bold text-foreground">{score}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <h3 className="text-lg font-semibold mb-3 text-emerald-700 dark:text-emerald-400">نقاط القوة</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6 border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20">
                <h3 className="text-lg font-semibold mb-3 text-rose-700 dark:text-rose-400">نقاط الضعف</h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2">
                      <span className="text-rose-600 dark:text-rose-400">✗</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Improvements */}
            <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-400">اقتراحات للتحسين</h3>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button onClick={handleNewSession} size="lg">
                <RefreshCw className="w-4 h-4 me-2" />
                مكالمة جديدة
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')} size="lg">
                العودة للوحة التحكم
              </Button>
            </div>
          </div>
        ) : (
          /* Call Interface */
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Call Visual */}
            <div className={cn(
              'relative w-48 h-48 rounded-full flex items-center justify-center',
              callStatus === 'active'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 animate-pulse'
                : callStatus === 'connecting' || callStatus === 'ending' || callStatus === 'analyzing'
                ? 'bg-amber-100 dark:bg-amber-900/30 animate-pulse'
                : 'bg-muted'
            )}>
              {/* Ripple effect for active call */}
              {callStatus === 'active' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                  <div className="absolute inset-4 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
                </>
              )}

              <div className={cn(
                'w-32 h-32 rounded-full flex items-center justify-center',
                callStatus === 'active' ? 'bg-emerald-500' :
                callStatus === 'connecting' || callStatus === 'ending' || callStatus === 'analyzing' ? 'bg-amber-500' :
                'bg-muted-foreground/20'
              )}>
                {callStatus === 'active' ? (
                  <Mic className="w-16 h-16 text-white" />
                ) : callStatus === 'connecting' || callStatus === 'ending' || callStatus === 'analyzing' ? (
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Phone className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">
                {callStatus === 'idle' && 'جاهز للمكالمة'}
                {callStatus === 'connecting' && 'جاري الاتصال...'}
                {callStatus === 'active' && 'المكالمة جارية'}
                {callStatus === 'ending' && 'جاري إنهاء المكالمة...'}
                {callStatus === 'analyzing' && 'جاري تحليل الأداء...'}
              </p>
              {callStatus === 'active' && (
                <p className="text-4xl font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatDuration(callDuration)}
                </p>
              )}
            </div>

            {/* Speaking indicator */}
            {callStatus === 'active' && conversation.isSpeaking && (
              <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full">
                <p className="text-emerald-700 dark:text-emerald-400">العميل يتحدث...</p>
              </div>
            )}

            {/* Instructions */}
            {callStatus === 'idle' && (
              <Card className="p-6 max-w-md text-center">
                <h3 className="font-semibold mb-2 text-foreground">تعليمات المكالمة</h3>
                <p className="text-muted-foreground text-sm">
                  سيتصل بك عميل سعودي يبحث عن عقار استثماري.
                  تصرف كوكيل عقاري محترف وحاول إقناعه بالعقار المناسب.
                </p>
              </Card>
            )}

            {/* Call Controls */}
            <div className="flex gap-4">
              {callStatus === 'idle' && (
                <Button
                  onClick={handleStartCall}
                  disabled={!isHydrated}
                  size="lg"
                  className="px-8"
                >
                  {!isHydrated ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Phone className="w-6 h-6 me-2" />
                  )}
                  {isHydrated ? 'ابدأ المكالمة' : 'جاري التحميل...'}
                </Button>
              )}

              {callStatus === 'active' && (
                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="lg"
                  className="px-8"
                >
                  <PhoneOff className="w-6 h-6 me-2" />
                  إنهاء المكالمة
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
