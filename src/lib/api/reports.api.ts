import { apiClient } from './client';
import type { InteractionReport } from '@/types/entities';

export const reportsApi = {
  getMyReports: async (): Promise<InteractionReport[]> => {
    return apiClient.get<InteractionReport[]>('/reports/me');
  },

  getSessionReport: async (sessionId: string): Promise<InteractionReport> => {
    return apiClient.get<InteractionReport>(`/reports/session/${sessionId}`);
  },

  getLevelReport: async (levelId: string): Promise<InteractionReport> => {
    return apiClient.get<InteractionReport>(`/reports/level/${levelId}`);
  },

  getProgramReport: async (programId: string): Promise<InteractionReport> => {
    return apiClient.get<InteractionReport>(`/reports/program/${programId}`);
  },
};
