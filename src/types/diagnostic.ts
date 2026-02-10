export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillScores {
  communication: number;
  negotiation: number;
  objectionHandling: number;
  relationshipBuilding: number;
  productKnowledge: number;
  closingTechnique: number;
}

export interface SkillReport {
  level: SkillLevel;
  overallScore: number;
  skillScores: SkillScores;
  strengths: string[];
  weaknesses: string[];
  knowledgeGaps: string[];
  date?: string;
}

export interface DiagnosticStatus {
  needsDiagnostic: boolean;
  lastDiagnosticAt: string | null;
  hoursSinceLast: number | null;
  currentReport: SkillReport | null;
}

export interface TriggerDiagnosticResult {
  diagnosticSessionId: string;
  status: 'started' | 'skipped_recent';
  lastDiagnosticAt?: string;
}

export interface CompleteDiagnosticResult {
  report: SkillReport & {
    recommendedCourseIds: string[];
    recommendedTopics: string[];
  };
  improvement: number;
}
