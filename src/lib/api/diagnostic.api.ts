import { apiClient } from './client';
import type {
  DiagnosticStatus,
  TriggerDiagnosticResult,
  CompleteDiagnosticResult,
} from '@/types/diagnostic';

export const diagnosticApi = {
  /** Check if trainee needs a diagnostic */
  getStatus: async (): Promise<DiagnosticStatus> => {
    return apiClient.get<DiagnosticStatus>('/diagnostics/status');
  },

  /** Trigger a new diagnostic session */
  trigger: async (triggeredBy: 'system' | 'manual' = 'manual'): Promise<TriggerDiagnosticResult> => {
    return apiClient.post<TriggerDiagnosticResult>('/diagnostics/trigger', { triggeredBy });
  },

  /** Complete a diagnostic and generate report */
  complete: async (data: {
    diagnosticSessionId: string;
    simulationSessionId?: string;
    quizAttemptId?: string;
  }): Promise<CompleteDiagnosticResult> => {
    return apiClient.post<CompleteDiagnosticResult>('/diagnostics/complete', data);
  },

  /** Build report from activity history (no formal diagnostic) */
  buildFromHistory: async (): Promise<CompleteDiagnosticResult> => {
    return apiClient.post<CompleteDiagnosticResult>('/diagnostics/build-from-history');
  },

  /** Get latest skill report */
  getLatestReport: async (): Promise<DiagnosticStatus['currentReport']> => {
    return apiClient.get('/diagnostics/report/latest');
  },

  /** Get report history */
  getReportHistory: async (days?: number): Promise<{
    currentReport: DiagnosticStatus['currentReport'];
    needsDiagnostic: boolean;
    hoursSinceLast: number | null;
  }> => {
    const params: Record<string, string> = {};
    if (days) params.days = String(days);
    return apiClient.get('/diagnostics/report/history', params);
  },
};
