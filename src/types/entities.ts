// Entity Types aligned with use-case-spec.md

export type TraineeStatus = 'active' | 'inactive' | 'completed' | 'suspended';

export interface Trainee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  enrolledProgramIds: string[];
  currentLevelId: string | null;
  credentials: {
    passwordChangedAt: Date | null;
  };
  progress: {
    completedLectureIds: string[];
    completedAssessmentIds: string[];
    completedSimulationIds: string[];
  };
  metrics: {
    totalTimeOnPlatform: number;
    currentStreak: number;
    lastActiveAt: Date;
  };
  status: TraineeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory = 'sales' | 'negotiation' | 'compliance' | 'client_relations' | 'market_analysis';

export interface Course {
  id: string;
  programId: string;
  levelId: string;
  title: string;
  description: string;
  objectives: string[];
  lectures: Lecture[];
  prerequisites: string[];
  estimatedDurationMinutes: number;
  difficulty: CourseDifficulty;
  category: CourseCategory;
  isPublished: boolean;
  orderInLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number;
  orderInCourse: number;
  triggerAssessmentOnComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  levels: Level[];
}

export interface Level {
  id: string;
  programId: string;
  title: string;
  orderInProgram: number;
}

export type SimulationScenarioType =
  | 'property_showing'
  | 'price_negotiation'
  | 'objection_handling'
  | 'first_contact'
  | 'closing_deal'
  | 'relationship_building'
  | 'difficult_client';

export type SimulationStatus = 'scheduled' | 'in_progress' | 'completed' | 'abandoned';
export type ClientPersonality = 'friendly' | 'skeptical' | 'demanding' | 'indecisive' | 'analytical';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface ClientPersona {
  name: string;
  background: string;
  personality: ClientPersonality;
  budget: string;
  motivations: string[];
  objections: string[];
  hiddenConcerns: string[];
}

export interface ConversationTurn {
  speaker: 'trainee' | 'client';
  message: string;
  timestamp: Date;
  sentiment: Sentiment | null;
  detectedIntent: string | null;
}

export interface KeyMoment {
  timestamp: Date;
  type: 'strength' | 'improvement_area' | 'missed_opportunity';
  description: string;
  recommendation: string | null;
}

export interface SimulationMetrics {
  overallScore: number;
  communicationScore: number;
  negotiationScore: number;
  objectionHandlingScore: number;
  relationshipBuildingScore: number;
  responseTimeAvgSeconds: number;
  keyMoments: KeyMoment[];
}

export interface SimulationSession {
  id: string;
  traineeId: string;
  scenarioType: SimulationScenarioType;
  clientPersona: ClientPersona;
  status: SimulationStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  durationSeconds: number | null;
  transcript: ConversationTurn[];
  recordingUrl: string | null;
  metrics: SimulationMetrics | null;
  createdAt: Date;
}

export type ReportType = 'session' | 'level_summary' | 'program_completion';
export type ReportSourceType = 'ai_assessment' | 'simulation' | 'aggregated';

export interface ReportSummary {
  overallScore: number;
  percentileRank: number | null;
  trend: 'improving' | 'stable' | 'declining';
  timeSpentMinutes: number;
}

export interface SkillAssessment {
  skillName: string;
  category: 'knowledge' | 'communication' | 'negotiation' | 'soft_skill';
  score: number;
  evidence: string[];
  benchmarkComparison: 'above' | 'at' | 'below';
}

export interface KnowledgeGap {
  topic: string;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  relatedLectureIds: string[];
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'review_content' | 'practice_skill' | 'seek_support' | 'advance';
  title: string;
  description: string;
  actionableSteps: string[];
}

export interface CompetencyTrend {
  competencyName: string;
  scores: { date: Date; score: number }[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface ProgressSummary {
  lecturesCompleted: number;
  lecturesTotal: number;
  assessmentsPassed: number;
  assessmentsTotal: number;
  simulationsCompleted: number;
  averageScore: number;
  competencyTrends: CompetencyTrend[];
}

export interface InteractionReport {
  id: string;
  traineeId: string;
  reportType: ReportType;
  sourceType: ReportSourceType;
  sourceId: string;
  generatedAt: Date;
  summary: ReportSummary;
  strengths: SkillAssessment[];
  weaknesses: SkillAssessment[];
  knowledgeGaps: KnowledgeGap[];
  recommendations: Recommendation[];
  suggestedNextSteps: string[];
  progressSummary: ProgressSummary | null;
  createdAt: Date;
}
