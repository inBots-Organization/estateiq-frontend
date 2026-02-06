import { apiClient } from './client';
import type {
  StartSimulationInput,
  StartSimulationOutput,
  SimulationMessageInput,
  SimulationMessageOutput,
  EndSimulationInput,
  EndSimulationOutput,
  AnalyzeSimulationInput,
  SimulationAnalysisOutput,
} from '@/types/simulation.types';
import type { SimulationSession } from '@/types/entities';

export const simulationApi = {
  start: async (input: StartSimulationInput): Promise<StartSimulationOutput> => {
    return apiClient.post<StartSimulationOutput>('/simulations/start', input);
  },

  sendMessage: async (input: SimulationMessageInput): Promise<SimulationMessageOutput> => {
    const { sessionId, ...data } = input;
    return apiClient.post<SimulationMessageOutput>(`/simulations/${sessionId}/message`, data);
  },

  end: async (input: EndSimulationInput): Promise<EndSimulationOutput> => {
    const { sessionId, ...data } = input;
    return apiClient.post<EndSimulationOutput>(`/simulations/${sessionId}/end`, data);
  },

  getAnalysis: async (input: AnalyzeSimulationInput): Promise<SimulationAnalysisOutput> => {
    const { sessionId, ...params } = input;
    return apiClient.get<SimulationAnalysisOutput>(`/simulations/${sessionId}/analysis`, {
      includeDetailedTranscriptAnalysis: String(params.includeDetailedTranscriptAnalysis),
      compareToHistory: String(params.compareToHistory),
      generateRecommendations: String(params.generateRecommendations),
    });
  },

  getSession: async (sessionId: string): Promise<SimulationSession> => {
    return apiClient.get<SimulationSession>(`/simulations/${sessionId}`);
  },

  getHistory: async (limit = 10): Promise<SimulationSession[]> => {
    return apiClient.get<SimulationSession[]>('/simulations', { limit: String(limit) });
  },
};
