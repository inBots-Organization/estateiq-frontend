import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { diagnosticApi } from '@/lib/api/diagnostic.api';
import type { SkillReport } from '@/types/diagnostic';

export type AssessmentPhase =
  | 'idle'
  | 'chat_pending'
  | 'chat_complete'
  | 'voice_pending'
  | 'voice_complete'
  | 'completing'
  | 'done';

interface DiagnosticState {
  assessmentRequired: boolean;
  assessmentPhase: AssessmentPhase;
  diagnosticSessionId: string | null;
  chatSimulationSessionId: string | null;
  voiceSimulationSessionId: string | null;
  skippedVoice: boolean;
  lastCheckTimestamp: number;
  latestReport: SkillReport | null;

  checkAndSetStatus: () => Promise<void>;
  startAssessment: () => Promise<void>;
  setChatComplete: (sessionId: string) => void;
  setVoiceComplete: (sessionId: string) => void;
  skipVoice: () => void;
  completeAssessment: () => Promise<SkillReport | null>;
  reset: () => void;
}

export const useDiagnosticStore = create<DiagnosticState>()(
  persist(
    (set, get) => ({
      assessmentRequired: false,
      assessmentPhase: 'idle',
      diagnosticSessionId: null,
      chatSimulationSessionId: null,
      voiceSimulationSessionId: null,
      skippedVoice: false,
      lastCheckTimestamp: 0,
      latestReport: null,

      checkAndSetStatus: async () => {
        try {
          const status = await diagnosticApi.getStatus();

          // CRITICAL: If server says diagnostic is needed, ALWAYS reset local state
          // This handles the case where admin reset evaluations
          if (status.needsDiagnostic) {
            console.log('[DiagnosticStore] Server says diagnostic needed - resetting local state');

            // Reset teacher assignment
            import('@/stores/teacher.store').then(({ useTeacherStore }) => {
              useTeacherStore.getState().reset();
            });

            // Clear all local diagnostic state
            set({
              assessmentRequired: true,
              assessmentPhase: 'idle',
              diagnosticSessionId: null,
              chatSimulationSessionId: null,
              voiceSimulationSessionId: null,
              skippedVoice: false,
              latestReport: null, // Clear old report!
              lastCheckTimestamp: Date.now(),
            });
            return;
          }

          // Server says no diagnostic needed - use server's current report
          set({
            assessmentRequired: false,
            lastCheckTimestamp: Date.now(),
            latestReport: status.currentReport,
          });

          // If they have a report, keep phase as idle (not done, to avoid confusion)
          if (status.currentReport && get().assessmentPhase !== 'done') {
            set({ assessmentPhase: 'idle' });
          }
        } catch (err) {
          console.error('[DiagnosticStore] Failed to check status:', err);
        }
      },

      startAssessment: async () => {
        try {
          const result = await diagnosticApi.trigger('system');
          if (result.status === 'started') {
            set({
              diagnosticSessionId: result.diagnosticSessionId,
              assessmentPhase: 'chat_pending',
              chatSimulationSessionId: null,
              voiceSimulationSessionId: null,
              skippedVoice: false,
            });
          }
        } catch (err) {
          console.error('[DiagnosticStore] Failed to trigger diagnostic:', err);
          throw err;
        }
      },

      setChatComplete: (sessionId: string) => {
        set({
          chatSimulationSessionId: sessionId,
          assessmentPhase: 'chat_complete',
        });
      },

      setVoiceComplete: (sessionId: string) => {
        set({
          voiceSimulationSessionId: sessionId,
          assessmentPhase: 'voice_complete',
        });
      },

      skipVoice: () => {
        set({
          assessmentPhase: 'voice_complete',
          skippedVoice: true,
        });
      },

      completeAssessment: async () => {
        const state = get();
        if (!state.diagnosticSessionId) return null;

        set({ assessmentPhase: 'completing' });

        try {
          const result = await diagnosticApi.complete({
            diagnosticSessionId: state.diagnosticSessionId,
            simulationSessionId: state.chatSimulationSessionId || undefined,
          });

          set({
            assessmentPhase: 'done',
            assessmentRequired: false,
            latestReport: result.report,
            lastCheckTimestamp: Date.now(),
          });

          return result.report;
        } catch (err) {
          console.error('[DiagnosticStore] Failed to complete diagnostic:', err);
          set({ assessmentPhase: 'voice_complete' });
          throw err;
        }
      },

      reset: () => {
        set({
          assessmentRequired: false,
          assessmentPhase: 'idle',
          diagnosticSessionId: null,
          chatSimulationSessionId: null,
          voiceSimulationSessionId: null,
          skippedVoice: false,
          latestReport: null,
        });
      },
    }),
    {
      name: 'diagnostic-assessment',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
