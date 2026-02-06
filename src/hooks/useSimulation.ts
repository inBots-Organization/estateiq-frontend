'use client';

import { useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulation.store';
import { simulationApi } from '@/lib/api/simulation.api';
import type { StartSimulationInput } from '@/types/simulation.types';

export function useSimulation() {
  const store = useSimulationStore();

  const startSimulation = useCallback(async (input: StartSimulationInput) => {
    store.reset();
    store.setError(null);

    try {
      const result = await simulationApi.start(input);
      store.initializeSession(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start simulation';
      store.setError(message);
      throw error;
    }
  }, [store]);

  const sendMessage = useCallback(async (message: string) => {
    if (!store.sessionId) {
      throw new Error('No active session');
    }

    store.addTraineeMessage(message);
    store.setSending(true);
    store.setTyping(true);

    try {
      const result = await simulationApi.sendMessage({
        sessionId: store.sessionId,
        message,
        messageType: 'text',
      });
      store.handleClientResponse(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setSending(false);
    }
  }, [store]);

  const endSimulation = useCallback(async (reason: 'completed' | 'abandoned') => {
    if (!store.sessionId) {
      throw new Error('No active session');
    }

    try {
      const result = await simulationApi.end({
        sessionId: store.sessionId,
        endReason: reason,
      });
      store.completeSimulation(result);

      const analysis = await simulationApi.getAnalysis({
        sessionId: store.sessionId,
        includeDetailedTranscriptAnalysis: true,
        compareToHistory: true,
        generateRecommendations: true,
      });
      store.setAnalysis(analysis);

      return { result, analysis };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end simulation';
      store.setError(errorMessage);
      throw error;
    }
  }, [store]);

  return {
    sessionId: store.sessionId,
    status: store.status,
    clientPersona: store.clientPersona,
    scenarioContext: store.scenarioContext,
    conversationState: store.conversationState,
    messages: store.messages,
    currentSentiment: store.currentSentiment,
    turnNumber: store.turnNumber,
    elapsedTimeSeconds: store.elapsedTimeSeconds,
    hints: store.hints,
    outcome: store.outcome,
    preliminaryScore: store.preliminaryScore,
    analysis: store.analysis,
    isTyping: store.isTyping,
    isSending: store.isSending,
    error: store.error,

    startSimulation,
    sendMessage,
    endSimulation,
    reset: store.reset,
  };
}
