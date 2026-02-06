import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ClientPersona, ConversationTurn, Sentiment } from '@/types/entities';
import type {
  ConversationState,
  SimulationOutcome,
  StartSimulationOutput,
  SimulationMessageOutput,
  EndSimulationOutput,
  SimulationAnalysisOutput,
} from '@/types/simulation.types';

type SimulationStatus = 'idle' | 'initializing' | 'ready' | 'in_progress' | 'ending' | 'completed' | 'error';

interface SimulationState {
  sessionId: string | null;
  status: SimulationStatus;
  clientPersona: ClientPersona | null;
  scenarioContext: string | null;
  conversationState: ConversationState | null;
  messages: ConversationTurn[];
  currentSentiment: Sentiment;
  turnNumber: number;
  elapsedTimeSeconds: number;
  hints: string[];
  outcome: SimulationOutcome | null;
  preliminaryScore: number | null;
  analysis: SimulationAnalysisOutput | null;
  isTyping: boolean;
  isSending: boolean;
  error: string | null;

  initializeSession: (data: StartSimulationOutput) => void;
  addTraineeMessage: (message: string) => void;
  handleClientResponse: (response: SimulationMessageOutput) => void;
  completeSimulation: (result: EndSimulationOutput) => void;
  setAnalysis: (analysis: SimulationAnalysisOutput) => void;
  setTyping: (isTyping: boolean) => void;
  setSending: (isSending: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  status: 'idle' as SimulationStatus,
  clientPersona: null,
  scenarioContext: null,
  conversationState: null,
  messages: [],
  currentSentiment: 'neutral' as Sentiment,
  turnNumber: 0,
  elapsedTimeSeconds: 0,
  hints: [],
  outcome: null,
  preliminaryScore: null,
  analysis: null,
  isTyping: false,
  isSending: false,
  error: null,
};

export const useSimulationStore = create<SimulationState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initializeSession: (data: StartSimulationOutput) => {
        set({
          sessionId: data.sessionId,
          status: data.status === 'ready' ? 'ready' : 'initializing',
          clientPersona: data.clientPersona,
          scenarioContext: data.scenarioContext,
          conversationState: 'opening',
          messages: [
            {
              speaker: 'client',
              message: data.initialClientMessage,
              timestamp: new Date(),
              sentiment: 'neutral',
              detectedIntent: null,
            },
          ],
          hints: data.tips,
          error: null,
        });
      },

      addTraineeMessage: (message: string) => {
        const newMessage: ConversationTurn = {
          speaker: 'trainee',
          message,
          timestamp: new Date(),
          sentiment: null,
          detectedIntent: null,
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
          status: 'in_progress',
        }));
      },

      handleClientResponse: (response: SimulationMessageOutput) => {
        const clientMessage: ConversationTurn = {
          speaker: 'client',
          message: response.clientResponse,
          timestamp: new Date(),
          sentiment: response.sentiment,
          detectedIntent: null,
        };
        set((state) => ({
          messages: [...state.messages, clientMessage],
          currentSentiment: response.sentiment,
          conversationState: response.conversationState,
          turnNumber: response.turnNumber,
          elapsedTimeSeconds: response.elapsedTimeSeconds,
          hints: response.hints,
          isTyping: false,
        }));
      },

      completeSimulation: (result: EndSimulationOutput) => {
        set({
          status: 'completed',
          outcome: result.outcome,
          preliminaryScore: result.preliminaryScore,
        });
      },

      setAnalysis: (analysis: SimulationAnalysisOutput) => {
        set({ analysis });
      },

      setTyping: (isTyping: boolean) => set({ isTyping }),
      setSending: (isSending: boolean) => set({ isSending }),
      setError: (error: string | null) => set({ error, status: error ? 'error' : get().status }),
      reset: () => set(initialState),
    }),
    { name: 'simulation-store' }
  )
);
