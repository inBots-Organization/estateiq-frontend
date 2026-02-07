'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Target,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileDown,
  Loader2
} from 'lucide-react';
import type { SimulationAnalysisOutput, SkillScoreDetail } from '@/types/simulation.types';
import { cn } from '@/lib/utils/cn';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResultsSummaryProps {
  analysis: SimulationAnalysisOutput;
  onViewFullReport: () => void;
  onPracticeAgain: () => void;
  sessionData?: {
    sessionId: string;
    traineeId: string;
    traineeName?: string;
    startTime: string;
    endTime?: string;
    durationSeconds: number;
    scenarioType: string;
    difficultyLevel: string;
    clientPersona: {
      name: string;
      personality: string;
      background: string;
      budget: string;
    };
    conversationTurns: Array<{
      speaker: 'trainee' | 'client';
      message: string;
      timestamp: Date;
    }>;
  };
}

// Helper to detect Arabic text
const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

const gradeConfigEn = {
  A: { bg: 'bg-gradient-to-br from-emerald-500 to-green-600', text: 'text-white', glow: 'shadow-emerald-500/30', label: 'Excellent' },
  B: { bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', text: 'text-white', glow: 'shadow-blue-500/30', label: 'Great' },
  C: { bg: 'bg-gradient-to-br from-yellow-500 to-amber-600', text: 'text-white', glow: 'shadow-yellow-500/30', label: 'Good' },
  D: { bg: 'bg-gradient-to-br from-orange-500 to-red-500', text: 'text-white', glow: 'shadow-orange-500/30', label: 'Needs Work' },
  F: { bg: 'bg-gradient-to-br from-red-500 to-rose-600', text: 'text-white', glow: 'shadow-red-500/30', label: 'Keep Practicing' },
};

const gradeConfigAr = {
  A: { bg: 'bg-gradient-to-br from-emerald-500 to-green-600', text: 'text-white', glow: 'shadow-emerald-500/30', label: 'ممتاز' },
  B: { bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', text: 'text-white', glow: 'shadow-blue-500/30', label: 'جيد جداً' },
  C: { bg: 'bg-gradient-to-br from-yellow-500 to-amber-600', text: 'text-white', glow: 'shadow-yellow-500/30', label: 'جيد' },
  D: { bg: 'bg-gradient-to-br from-orange-500 to-red-500', text: 'text-white', glow: 'shadow-orange-500/30', label: 'يحتاج تحسين' },
  F: { bg: 'bg-gradient-to-br from-red-500 to-rose-600', text: 'text-white', glow: 'shadow-red-500/30', label: 'استمر بالتدريب' },
};

// Arabic skill names
const skillNamesAr: Record<string, string> = {
  'Communication': 'التواصل',
  'Negotiation': 'التفاوض',
  'Objection Handling': 'معالجة الاعتراضات',
  'Relationship Building': 'بناء العلاقات',
  'Product Knowledge': 'معرفة المنتج',
  'Closing Technique': 'تقنيات الإغلاق',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
}

function SkillScore({ name, detail, index }: { name: string; detail: SkillScoreDetail; index: number }) {
  const isStrength = detail.score >= 75;
  const isWeakness = detail.score < 60;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-300",
        isStrength && "bg-emerald-50/50 border-emerald-200/60",
        isWeakness && "bg-red-50/50 border-red-200/60",
        !isStrength && !isWeakness && "bg-slate-50/50 border-slate-200/60"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isStrength && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {isWeakness && <AlertCircle className="h-4 w-4 text-red-500" />}
          <span className="font-semibold text-sm text-slate-700">{name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-lg font-bold", getScoreTextColor(detail.score))}>
            {detail.score}
          </span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>

      <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out", getScoreColor(detail.score))}
          style={{ width: `${detail.score}%` }}
        />
        {/* Benchmark indicator */}
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-400"
          style={{ left: `${detail.benchmark || 75}%` }}
        />
      </div>

      {detail.tips && detail.tips.length > 0 && (
        <p className="mt-2.5 text-xs text-slate-500 line-clamp-2">
          {detail.tips[0]}
        </p>
      )}
    </div>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string | number; label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/60">
      <Icon className="h-5 w-5 text-slate-400 mb-2" />
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 text-center mt-1">{label}</p>
    </div>
  );
}

export function ResultsSummary({ analysis, onViewFullReport, onPracticeAgain, sessionData }: ResultsSummaryProps) {
  const { overallPerformance, skillScores, conversationAnalysis, recommendations, highlights, improvementAreas } = analysis;
  const { isRTL } = useLanguage();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Detect if content is Arabic based on summary or highlights
  const isArabicContent = isArabicText(overallPerformance.summary) ||
    (highlights && highlights.some(h => isArabicText(typeof h === 'string' ? h : h.description)));

  const gradeConfig = isArabicContent ? gradeConfigAr : gradeConfigEn;
  const gradeStyle = gradeConfig[overallPerformance.grade];

  // RTL-aware arrow
  const DirectionalArrow = isRTL ? ArrowLeft : ArrowRight;

  const handleExportPDF = async () => {
    if (!sessionData) return;

    setIsExportingPDF(true);
    try {
      const { generateTextReportPDF } = await import('@/lib/utils/text-report-pdf');
      await generateTextReportPDF({
        sessionId: sessionData.sessionId,
        traineeId: sessionData.traineeId,
        traineeName: sessionData.traineeName,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        durationSeconds: sessionData.durationSeconds,
        scenarioType: sessionData.scenarioType,
        difficultyLevel: sessionData.difficultyLevel,
        clientPersona: sessionData.clientPersona,
        conversationTurns: sessionData.conversationTurns,
        analysis: {
          overallScore: overallPerformance.score,
          grade: overallPerformance.grade,
          summary: overallPerformance.summary,
          skillScores: {
            communication: { score: skillScores.communication.score, tips: skillScores.communication.tips || [] },
            negotiation: { score: skillScores.negotiation.score, tips: skillScores.negotiation.tips || [] },
            objectionHandling: { score: skillScores.objectionHandling.score, tips: skillScores.objectionHandling.tips || [] },
            relationshipBuilding: { score: skillScores.relationshipBuilding.score, tips: skillScores.relationshipBuilding.tips || [] },
            productKnowledge: { score: skillScores.productKnowledge.score, tips: skillScores.productKnowledge.tips || [] },
            closingTechnique: { score: skillScores.closingTechnique.score, tips: skillScores.closingTechnique.tips || [] },
          },
          highlights: highlights?.map(h => typeof h === 'string' ? h : h.description) || [],
          improvementAreas: improvementAreas?.map(i => typeof i === 'string' ? i : i.description) || [],
          conversationMetrics: {
            talkTimeRatio: conversationAnalysis.talkTimeRatio,
            questionsAsked: conversationAnalysis.questionAsked,
            empathyStatements: conversationAnalysis.empathyStatements,
            activeListeningIndicators: conversationAnalysis.activeListeningIndicators,
          },
        },
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Hero Performance Card */}
      <Card className="overflow-hidden border border-border/50 shadow-xl">
        <div className={cn("p-8", gradeStyle.bg)}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Grade Circle */}
            <div className="relative">
              <div className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center",
                "bg-white/20 backdrop-blur-sm border-4 border-white/30",
                "shadow-2xl",
                gradeStyle.glow
              )}>
                <div className="text-center">
                  <span className={cn("text-5xl font-black", gradeStyle.text)}>
                    {overallPerformance.grade}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-white/90 text-slate-700 font-semibold shadow-lg">
                  {gradeStyle.label}
                </Badge>
              </div>
            </div>

            {/* Score and Summary */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-baseline justify-center md:justify-start gap-2 mb-3">
                <span className={cn("text-6xl font-black", gradeStyle.text)}>
                  {overallPerformance.score}
                </span>
                <span className="text-2xl font-medium text-white/70">/100</span>
              </div>
              <p className={cn("text-lg font-medium", gradeStyle.text, "opacity-90 max-w-md")}>
                {overallPerformance.summary}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills Grid */}
      <Card className="border-slate-200/60 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Target className="h-5 w-5 text-indigo-600" />
            </div>
            Skill Performance
            <span className="ml-auto text-xs font-normal text-slate-400">
              | = Industry Benchmark (75)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <SkillScore name="Communication" detail={skillScores.communication} index={0} />
            <SkillScore name="Negotiation" detail={skillScores.negotiation} index={1} />
            <SkillScore name="Objection Handling" detail={skillScores.objectionHandling} index={2} />
            <SkillScore name="Relationship Building" detail={skillScores.relationshipBuilding} index={3} />
            <SkillScore name="Product Knowledge" detail={skillScores.productKnowledge} index={4} />
            <SkillScore name="Closing Technique" detail={skillScores.closingTechnique} index={5} />
          </div>
        </CardContent>
      </Card>

      {/* Highlights and Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {highlights && highlights.length > 0 && (
          <Card className="border-emerald-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-emerald-700 text-base">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                </div>
                What You Did Well
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {highlights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      {typeof item === 'string' ? item : item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {improvementAreas && improvementAreas.length > 0 && (
          <Card className="border-amber-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-amber-700 text-base">
                <div className="p-2 rounded-lg bg-amber-100">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {improvementAreas.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600">
                      {typeof item === 'string' ? item : item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Conversation Metrics */}
      <Card className="border-slate-200/60 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            Conversation Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              value={`${Math.round(conversationAnalysis.talkTimeRatio * 100)}%`}
              label="Your Talk Time"
              icon={MessageSquare}
            />
            <StatCard
              value={conversationAnalysis.questionAsked}
              label="Questions Asked"
              icon={Lightbulb}
            />
            <StatCard
              value={conversationAnalysis.empathyStatements}
              label="Empathy Shown"
              icon={Trophy}
            />
            <StatCard
              value={conversationAnalysis.activeListeningIndicators}
              label="Active Listening"
              icon={CheckCircle2}
            />
            <StatCard
              value={`${conversationAnalysis.averageResponseTime.toFixed(0)}s`}
              label="Avg Response"
              icon={Target}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card className="border-slate-200/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 rounded-lg bg-purple-100">
                <Lightbulb className="h-5 w-5 text-purple-600" />
              </div>
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl border-l-4",
                    rec.priority === 'high' && "bg-red-50/50 border-l-red-500",
                    rec.priority === 'medium' && "bg-amber-50/50 border-l-amber-500",
                    rec.priority === 'low' && "bg-blue-50/50 border-l-blue-500"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      className={cn(
                        "shrink-0 font-semibold text-xs uppercase tracking-wide",
                        rec.priority === 'high' && "bg-red-100 text-red-700 border-red-200",
                        rec.priority === 'medium' && "bg-amber-100 text-amber-700 border-amber-200",
                        rec.priority === 'low' && "bg-blue-100 text-blue-700 border-blue-200"
                      )}
                      variant="outline"
                    >
                      {rec.priority}
                    </Badge>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-slate-800 mb-1">{rec.title}</h4>
                      <p className="text-sm text-slate-600 mb-3">{rec.description}</p>
                      {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                        <ul className="space-y-1.5">
                          {rec.actionableSteps.slice(0, 3).map((step, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className={cn(
        "flex flex-col sm:flex-row gap-4 pt-4",
        isRTL && "sm:flex-row-reverse"
      )}>
        <Button
          onClick={onViewFullReport}
          size="lg"
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300"
        >
          {isArabicContent ? 'عرض التقرير الكامل' : 'View Full Report'}
          <DirectionalArrow className={cn("h-5 w-5", isRTL ? "mr-2" : "ml-2")} />
        </Button>

        {sessionData && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex-1 sm:flex-none border-2 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 font-semibold transition-all duration-300"
          >
            {isExportingPDF ? (
              <Loader2 className={cn("h-5 w-5 animate-spin", isRTL ? "ml-2" : "mr-2")} />
            ) : (
              <FileDown className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            )}
            {isArabicContent ? 'تحميل PDF' : 'Export PDF'}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={onPracticeAgain}
          className="flex-1 sm:flex-none border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold transition-all duration-300"
        >
          <RotateCcw className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          {isArabicContent ? 'تدرب مرة أخرى' : 'Practice Again'}
        </Button>
      </div>
    </div>
  );
}
