import type {
  SimulationScenarioType,
  ClientPersona,
  Sentiment,
  KeyMoment,
  Recommendation,
} from './entities';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ConversationState = 'opening' | 'discovery' | 'presenting' | 'negotiating' | 'closing' | 'ended';
export type SimulationOutcome =
  | 'deal_closed'
  | 'follow_up_scheduled'
  | 'client_interested'
  | 'client_undecided'
  | 'client_declined'
  | 'relationship_damaged';

// Input DTOs
export interface StartSimulationInput {
  scenarioType: SimulationScenarioType;
  difficultyLevel: DifficultyLevel;
  customPersonaConfig?: Partial<ClientPersona>;
  recordSession: boolean;
}

export interface SimulationMessageInput {
  sessionId: string;
  message: string;
  messageType: 'text' | 'voice_transcript';
}

export interface EndSimulationInput {
  sessionId: string;
  endReason: 'completed' | 'abandoned' | 'timeout' | 'error';
}

export interface AnalyzeSimulationInput {
  sessionId: string;
  includeDetailedTranscriptAnalysis: boolean;
  compareToHistory: boolean;
  generateRecommendations: boolean;
}

// Output DTOs
export interface StartSimulationOutput {
  sessionId: string;
  status: 'ready' | 'initializing';
  clientPersona: ClientPersona;
  scenarioContext: string;
  initialClientMessage: string;
  estimatedDurationMinutes: number;
  tips: string[];
}

export interface SimulationMessageOutput {
  sessionId: string;
  clientResponse: string;
  sentiment: Sentiment;
  conversationState: ConversationState;
  hints: string[];
  turnNumber: number;
  elapsedTimeSeconds: number;
}

export interface EndSimulationOutput {
  sessionId: string;
  status: 'completed' | 'abandoned';
  totalDurationSeconds: number;
  turnCount: number;
  preliminaryScore: number;
  outcome: SimulationOutcome;
  nextSteps: string[];
}

export interface SkillScoreDetail {
  score: number;
  benchmark: number;
  trend: 'improving' | 'stable' | 'declining';
  evidence: string[];
  tips: string[];
}

export interface SimulationAnalysisOutput {
  sessionId: string;
  traineeId: string;
  generatedAt: Date;
  overallPerformance: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
  };
  skillScores: {
    communication: SkillScoreDetail;
    negotiation: SkillScoreDetail;
    objectionHandling: SkillScoreDetail;
    relationshipBuilding: SkillScoreDetail;
    productKnowledge: SkillScoreDetail;
    closingTechnique: SkillScoreDetail;
  };
  conversationAnalysis: {
    talkTimeRatio: number;
    averageResponseTime: number;
    questionAsked: number;
    activeListeningIndicators: number;
    empathyStatements: number;
  };
  highlights: KeyMoment[];
  improvementAreas: KeyMoment[];
  missedOpportunities: KeyMoment[];
  recommendations: Recommendation[];
  suggestedPracticeScenarios: SimulationScenarioType[];
  historicalComparison?: {
    previousAverageScore: number;
    improvement: number;
    consistentStrengths: string[];
    persistentWeaknesses: string[];
  };
}
