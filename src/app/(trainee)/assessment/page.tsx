'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDiagnosticStore } from '@/stores/diagnostic.store';
import { useTeacherStore } from '@/stores/teacher.store';
import { diagnosticApi, type EvaluatorReport } from '@/lib/api/diagnostic.api';
import { cn } from '@/lib/utils';
import type { SkillReport } from '@/types/diagnostic';
import {
  MessageSquare,
  Phone,
  Loader2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  SkipForward,
  ClipboardCheck,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  Brain,
} from 'lucide-react';

export default function AssessmentPage() {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const store = useDiagnosticStore();
  const [report, setReport] = useState<SkillReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Evaluator state
  const [evaluatorReport, setEvaluatorReport] = useState<EvaluatorReport | null>(null);
  const [evaluatorStatus, setEvaluatorStatus] = useState<string>('pending');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shortTerm' | 'mediumTerm' | 'longTerm'>('shortTerm');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Poll for evaluator report
  const pollEvaluatorReport = useCallback(async () => {
    try {
      const result = await diagnosticApi.getEvaluatorReport();
      setEvaluatorStatus(result.evaluatorStatus);
      if (result.evaluatorReport) {
        setEvaluatorReport(result.evaluatorReport);
        // Store assigned teacher in Zustand
        if (result.evaluatorReport.teacherAssignment?.teacherName) {
          useTeacherStore.getState().setAssignedTeacher(
            result.evaluatorReport.teacherAssignment.teacherName as any
          );
        }
        // Stop polling once completed
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch {
      // Silently fail polling — report may not exist yet
    }
  }, []);

  // Start polling when we enter "done" phase
  useEffect(() => {
    if (store.assessmentPhase === 'done' && !evaluatorReport) {
      // Initial fetch
      pollEvaluatorReport();
      // Poll every 3 seconds
      pollingRef.current = setInterval(pollEvaluatorReport, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [store.assessmentPhase, evaluatorReport, pollEvaluatorReport]);

  // Auto-advance based on phase
  useEffect(() => {
    const phase = store.assessmentPhase;

    if (phase === 'chat_pending') {
      router.push('/simulation?diagnostic=true');
    } else if (phase === 'voice_pending') {
      router.push('/voice-training?diagnostic=true');
    }
  }, [store.assessmentPhase, router]);

  // Auto-complete when voice is done
  useEffect(() => {
    if (store.assessmentPhase === 'voice_complete' && !report) {
      handleComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.assessmentPhase]);

  const handleStart = async () => {
    setError(null);
    try {
      await store.startAssessment();
    } catch {
      setError(isRTL ? 'فشل في بدء التقييم. حاول مرة أخرى.' : 'Failed to start assessment. Please try again.');
    }
  };

  const handleComplete = async () => {
    setError(null);
    try {
      const result = await store.completeAssessment();
      if (result) {
        setReport(result);
      }
    } catch {
      setError(isRTL ? 'فشل في إنشاء التقرير. حاول مرة أخرى.' : 'Failed to generate report. Please try again.');
    }
  };

  const handleContinueToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStartVoice = () => {
    store.skipVoice();
    useDiagnosticStore.setState({ assessmentPhase: 'voice_pending', skippedVoice: false });
  };

  const handleSkipVoice = () => {
    store.skipVoice();
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      beginner: { ar: 'مبتدئ', en: 'Beginner' },
      intermediate: { ar: 'متوسط', en: 'Intermediate' },
      advanced: { ar: 'متقدم', en: 'Advanced' },
    };
    return isRTL ? labels[level]?.ar || level : labels[level]?.en || level;
  };

  const getSkillLabel = (key: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      communication: { ar: 'التواصل', en: 'Communication' },
      negotiation: { ar: 'التفاوض', en: 'Negotiation' },
      objectionHandling: { ar: 'معالجة الاعتراضات', en: 'Objection Handling' },
      relationshipBuilding: { ar: 'بناء العلاقات', en: 'Relationship Building' },
      productKnowledge: { ar: 'المعرفة بالمنتج', en: 'Product Knowledge' },
      closingTechnique: { ar: 'تقنيات الإغلاق', en: 'Closing Technique' },
    };
    return isRTL ? labels[key]?.ar || key : labels[key]?.en || key;
  };

  const getSkillLevelLabel = (level: string) => {
    const key = level as keyof Pick<typeof t.diagnostic, 'weak' | 'developing' | 'competent' | 'strong' | 'excellent'>;
    return t.diagnostic[key] || level;
  };

  const getSkillLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      weak: 'text-red-500 bg-red-50 dark:bg-red-900/20',
      developing: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      competent: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
      strong: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      excellent: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    };
    return colors[level] || 'text-muted-foreground bg-muted';
  };

  const getTeacherColor = (name: string) => {
    const colors: Record<string, string> = {
      ahmed: 'from-blue-500 to-blue-600',
      noura: 'from-purple-500 to-purple-600',
      anas: 'from-emerald-500 to-emerald-600',
    };
    return colors[name] || 'from-primary to-primary';
  };

  const getTeacherInitial = (name: string) => {
    const initials: Record<string, string> = {
      ahmed: 'أ',
      noura: 'ن',
      anas: 'أ',
    };
    return isRTL ? (initials[name] || name[0]) : name[0]?.toUpperCase() || '?';
  };

  const bilingual = (obj: { ar: string; en: string } | undefined) => {
    if (!obj) return '';
    return language === 'ar' ? obj.ar : obj.en;
  };

  // --- PHASE: Completing (loading) ---
  if (store.assessmentPhase === 'completing') {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
              <Target className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{t.diagnostic.generating}</h2>
            <p className="text-muted-foreground">
              {isRTL ? 'يتم تحليل أدائك وإنشاء تقرير مخصص...' : 'Analyzing your performance and creating a personalized report...'}
            </p>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // --- PHASE: Done (show results) ---
  if (store.assessmentPhase === 'done' && (report || store.latestReport)) {
    const displayReport = report || store.latestReport!;
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t.diagnostic.reportReady}</h1>
        </div>

        {/* Overall Score */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">{t.diagnostic.overallScore}</p>
            <div className={cn("text-5xl font-bold mb-2", getScoreColor(displayReport.overallScore))}>
              {displayReport.overallScore}%
            </div>
            <p className="text-lg font-medium text-foreground">{getLevelLabel(displayReport.level)}</p>
          </CardContent>
        </Card>

        {/* Teacher Assignment Card */}
        {evaluatorReport?.teacherAssignment && (
          <Card className="mb-6 overflow-hidden">
            <div className={cn("h-2 bg-gradient-to-r", getTeacherColor(evaluatorReport.teacherAssignment.teacherName))} />
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t.diagnostic.assignedTeacher}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br",
                  getTeacherColor(evaluatorReport.teacherAssignment.teacherName)
                )}>
                  {getTeacherInitial(evaluatorReport.teacherAssignment.teacherName)}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">
                    {bilingual(evaluatorReport.teacherAssignment.teacherDisplayName)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bilingual(evaluatorReport.teacherAssignment.teacherDescription)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                {bilingual(evaluatorReport.teacherAssignment.assignmentReason)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Skill Scores */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">{t.diagnostic.skillProfile}</h3>
            {Object.entries(displayReport.skillScores).map(([key, score]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{getSkillLabel(key)}</span>
                  <span className={cn("font-semibold", getScoreColor(score))}>{score}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", getScoreBarColor(score))}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-green-700 dark:text-green-400">
                  {isRTL ? 'نقاط القوة' : 'Strengths'}
                </h4>
              </div>
              <ul className="space-y-1.5">
                {displayReport.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold text-red-700 dark:text-red-400">
                  {isRTL ? 'نقاط الضعف' : 'Areas to Improve'}
                </h4>
              </div>
              <ul className="space-y-1.5">
                {displayReport.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">-</span>
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Evaluator Report Section */}
        {evaluatorStatus !== 'completed' && evaluatorStatus !== 'failed' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t.diagnostic.evaluatorGenerating}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'سيظهر التقييم التفصيلي هنا خلال لحظات...' : 'Detailed evaluation will appear here shortly...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Narrative */}
        {evaluatorReport?.overallNarrative && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t.diagnostic.overallNarrative}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {bilingual(evaluatorReport.overallNarrative)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Detailed Skill Analysis */}
        {evaluatorReport?.skillAnalyses && evaluatorReport.skillAnalyses.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t.diagnostic.detailedAnalysis}</h3>
              </div>
              <div className="space-y-2">
                {evaluatorReport.skillAnalyses.map((skill) => (
                  <div key={skill.skillName} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedSkill(expandedSkill === skill.skillName ? null : skill.skillName)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{getSkillLabel(skill.skillName)}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getSkillLevelColor(skill.level))}>
                          {getSkillLevelLabel(skill.level)}
                        </span>
                      </div>
                      {expandedSkill === skill.skillName ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedSkill === skill.skillName && (
                      <div className="px-3 pb-3 space-y-3 border-t">
                        <p className="text-sm text-muted-foreground pt-3">{bilingual(skill.analysis)}</p>
                        {skill.improvementTips.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-1.5">
                              {isRTL ? 'نصائح للتحسين:' : 'Tips for improvement:'}
                            </p>
                            <ul className="space-y-1">
                              {skill.improvementTips.map((tip, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5">&#x2022;</span>
                                  {bilingual(tip)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Improvement Plan */}
        {evaluatorReport?.improvementPlan && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t.diagnostic.improvementPlan}</h3>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
                {(['shortTerm', 'mediumTerm', 'longTerm'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors",
                      activeTab === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.diagnostic[tab]}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <ul className="space-y-2">
                {evaluatorReport.improvementPlan[activeTab]?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {bilingual(item)}
                  </li>
                ))}
                {(!evaluatorReport.improvementPlan[activeTab] || evaluatorReport.improvementPlan[activeTab].length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'لا توجد توصيات لهذه الفترة' : 'No recommendations for this period'}
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          className="w-full h-12 btn-gradient text-lg"
          onClick={handleContinueToDashboard}
        >
          {t.diagnostic.continueToDashboard}
          <ArrowIcon className={cn("h-5 w-5", isRTL ? "mr-2" : "ml-2")} />
        </Button>
      </div>
    );
  }

  // --- PHASE: Chat Complete (show step 2 prompt) ---
  if (store.assessmentPhase === 'chat_complete') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t.diagnostic.assessmentGateway}</h1>
          <p className="text-muted-foreground">{t.diagnostic.assessmentGatewayDesc}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Step 1 - Done */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{t.diagnostic.step1Title}</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          {/* Step 2 - Pending */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <span className="text-sm font-medium text-foreground">{t.diagnostic.step2Title}</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t.diagnostic.step2Title}</h3>
                <p className="text-sm text-muted-foreground">{t.diagnostic.step2Desc}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 btn-gradient" onClick={handleStartVoice}>
                <Phone className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t.diagnostic.continueAssessment}
              </Button>
              <Button variant="outline" onClick={handleSkipVoice}>
                <SkipForward className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t.diagnostic.skipVoice}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>
    );
  }

  // --- PHASE: Idle (intro) ---
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <ClipboardCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.diagnostic.assessmentGateway}</h1>
        <p className="text-muted-foreground">{t.diagnostic.assessmentGatewayDesc}</p>
      </div>

      {/* Steps Preview */}
      <div className="space-y-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary">{t.diagnostic.stepOf} 1/2</span>
                </div>
                <h3 className="font-semibold text-foreground">{t.diagnostic.step1Title}</h3>
                <p className="text-sm text-muted-foreground">{t.diagnostic.step1Desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary">{t.diagnostic.stepOf} 2/2</span>
                  <span className="text-xs text-muted-foreground">({isRTL ? 'اختياري' : 'optional'})</span>
                </div>
                <h3 className="font-semibold text-foreground">{t.diagnostic.step2Title}</h3>
                <p className="text-sm text-muted-foreground">{t.diagnostic.step2Desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        className="w-full h-12 btn-gradient text-lg"
        onClick={handleStart}
      >
        {t.diagnostic.startAssessment}
        <ArrowIcon className={cn("h-5 w-5", isRTL ? "mr-2" : "ml-2")} />
      </Button>

      {error && (
        <p className="text-sm text-destructive text-center mt-4">{error}</p>
      )}
    </div>
  );
}
