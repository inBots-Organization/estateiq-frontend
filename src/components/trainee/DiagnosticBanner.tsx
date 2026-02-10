'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Brain,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { diagnosticApi } from '@/lib/api/diagnostic.api';
import type { DiagnosticStatus, SkillScores } from '@/types/diagnostic';

const SKILL_LABELS: Record<keyof SkillScores, { en: string; ar: string }> = {
  communication: { en: 'Communication', ar: 'التواصل' },
  negotiation: { en: 'Negotiation', ar: 'التفاوض' },
  objectionHandling: { en: 'Objection Handling', ar: 'التعامل مع الاعتراضات' },
  relationshipBuilding: { en: 'Relationship Building', ar: 'بناء العلاقات' },
  productKnowledge: { en: 'Product Knowledge', ar: 'المعرفة بالمنتج' },
  closingTechnique: { en: 'Closing Technique', ar: 'تقنيات الإغلاق' },
};

const LEVEL_CONFIG = {
  beginner: { en: 'Beginner', ar: 'مبتدئ', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  intermediate: { en: 'Intermediate', ar: 'متوسط', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  advanced: { en: 'Advanced', ar: 'متقدم', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

export function DiagnosticBanner() {
  const { t, isRTL, language } = useLanguage();
  const [status, setStatus] = useState<DiagnosticStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    diagnosticApi.getStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBuildReport = async () => {
    setBuilding(true);
    try {
      const result = await diagnosticApi.buildFromHistory();
      // Refresh status after building
      const newStatus = await diagnosticApi.getStatus();
      setStatus(newStatus);
    } catch {
      // Silently fail — banner will stay in "needs diagnostic" state
    } finally {
      setBuilding(false);
    }
  };

  if (loading) return null;
  if (!status) return null;

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const diag = t.diagnostic;

  // No report yet — prompt to run diagnostic
  if (status.needsDiagnostic && !status.currentReport) {
    return (
      <Card className="mb-6 border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{diag.assessmentNeeded}</h3>
                <p className="text-sm text-muted-foreground">{diag.assessmentNeededDesc}</p>
              </div>
            </div>
            <Button
              onClick={handleBuildReport}
              disabled={building}
              className="btn-gradient"
            >
              {building ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {diag.runAssessment}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Has a report — show skill summary
  if (status.currentReport) {
    const report = status.currentReport;
    const levelConf = LEVEL_CONFIG[report.level];
    const topSkills = Object.entries(report.skillScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return (
      <Card className="mb-6 border border-border overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{diag.skillProfile}</h3>
                  <Badge className={cn('text-xs', levelConf.color)}>
                    {language === 'ar' ? levelConf.ar : levelConf.en}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {diag.overallScore}: {report.overallScore}%
                </p>
              </div>
            </div>
            {status.needsDiagnostic && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBuildReport}
                disabled={building}
              >
                {building ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    {diag.refresh}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Top 3 skills mini-bars */}
          <div className="grid gap-2">
            {topSkills.map(([key, score]) => {
              const label = SKILL_LABELS[key as keyof SkillScores];
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-32 truncate">
                    {language === 'ar' ? label.ar : label.en}
                  </span>
                  <Progress value={score} className="flex-1 h-2" />
                  <span className="text-xs font-medium w-8 text-end">{score}%</span>
                </div>
              );
            })}
          </div>

          {/* Strengths & weaknesses chips */}
          {(report.strengths.length > 0 || report.weaknesses.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {report.strengths.map((s) => {
                const label = SKILL_LABELS[s as keyof SkillScores];
                return (
                  <Badge key={s} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {label ? (language === 'ar' ? label.ar : label.en) : s}
                  </Badge>
                );
              })}
              {report.weaknesses.map((w) => {
                const label = SKILL_LABELS[w as keyof SkillScores];
                return (
                  <Badge key={w} variant="secondary" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {label ? (language === 'ar' ? label.ar : label.en) : w}
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
