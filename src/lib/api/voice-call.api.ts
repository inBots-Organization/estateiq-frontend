import { apiClient } from './client';

export interface VoiceCallMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface StartCallInput {
  courseId?: string;
  scenarioType?: string;
  context?: string;
  language?: 'en' | 'ar';
}

export interface StartCallResponse {
  callId: string;
  greeting: string;
  greetingAudioBase64?: string;
  audioContentType?: string;
}

export interface SendMessageInput {
  callId: string;
  message: string;
  includeAudio?: boolean;
  language?: 'en' | 'ar';
}

export interface SendMessageResponse {
  callId: string;
  aiResponse: string;
  audioBase64?: string;
  audioContentType?: string;
  sentiment?: string;
  isComplete?: boolean;
  conversationHistory: VoiceCallMessage[];
}

export interface EndCallInput {
  callId: string;
  endReason?: 'completed' | 'abandoned' | 'error';
}

export interface EndCallResponse {
  callId: string;
  summary: string;
  totalMessages: number;
  durationSeconds: number;
  feedback?: string;
}

export interface VoiceStatusResponse {
  voiceServiceAvailable: boolean;
  provider: string;
  message: string;
}

export interface TTSInput {
  text: string;
  voiceId?: string;
  returnBase64?: boolean;
}

export interface TTSResponse {
  audioBase64: string;
  contentType: string;
}

export const voiceCallApi = {
  getStatus: async (): Promise<VoiceStatusResponse> => {
    return apiClient.get<VoiceStatusResponse>('/voice/status');
  },

  startCall: async (input: StartCallInput): Promise<StartCallResponse> => {
    return apiClient.post<StartCallResponse>('/voice/start', input);
  },

  sendMessage: async (input: SendMessageInput): Promise<SendMessageResponse> => {
    return apiClient.post<SendMessageResponse>(`/voice/${input.callId}/message`, {
      message: input.message,
      includeAudio: input.includeAudio ?? true,
      language: input.language,
    });
  },

  endCall: async (input: EndCallInput): Promise<EndCallResponse> => {
    return apiClient.post<EndCallResponse>(`/voice/${input.callId}/end`, {
      endReason: input.endReason,
    });
  },

  getCallState: async (callId: string): Promise<{ callId: string; messages: VoiceCallMessage[] }> => {
    return apiClient.get<{ callId: string; messages: VoiceCallMessage[] }>(`/voice/${callId}/state`);
  },

  textToSpeech: async (input: TTSInput): Promise<TTSResponse> => {
    return apiClient.post<TTSResponse>('/voice/tts', input);
  },
};
