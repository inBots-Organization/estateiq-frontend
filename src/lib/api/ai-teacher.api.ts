/**
 * AI Teacher API Client
 *
 * Frontend API client for the AI Teacher feature.
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface TraineeProfile {
  traineeId: string;
  firstName: string;
  lastName: string;
  email: string;
  personalityTraits: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed';
  communicationPreference: 'formal' | 'casual' | 'mixed';
  language: 'ar' | 'en';
  strengths: string[];
  weaknesses: string[];
  knowledgeGaps: string[];
  likes: string[];
  dislikes: string[];
  totalSessions: number;
  averageScore: number;
  currentStreak: number;
  lastActiveAt: string | null;
  // Course progress tracking
  completedCoursesCount?: number;
  completedLecturesCount?: number;
  completedAssessmentsCount?: number;
  recentTopics: string[];
  improvementAreas: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WelcomeResponse {
  greeting: string;
  greetingAudio?: string;
  recentProgress: {
    sessionsCompleted: number;
    averageScore: number;
    improvement: string;
  };
  suggestedTopics: string[];
}

export interface ChatResponse {
  message: string;
  audioBase64?: string;
  followUpQuestions?: string[];
  relatedTopics?: string[];
  assessmentQuestion?: {
    question: string;
    type: 'multiple_choice' | 'open_ended' | 'true_false';
    options?: string[];
  };
}

// Streaming chat response types
export interface StreamingChatResponse {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  fullMessage?: string;
  audioBase64?: string;
  followUpQuestions?: string[];
  assessmentQuestion?: {
    question: string;
    type: 'multiple_choice' | 'open_ended' | 'true_false';
    options?: string[];
  };
  error?: string;
}

export interface FileAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  attachments?: FileAttachment[];
}

// Lesson context for course integration
export interface LessonContextPayload {
  lessonId: string;
  lessonName: string;
  lessonNameAr: string;
  lessonDescription: string;
  lessonDescriptionAr: string;
  courseId: string;
  courseName: string;
  courseNameAr: string;
  courseCategory: string;
  courseDifficulty: string;
  courseObjectives: string[];
  courseObjectivesAr: string[];
  attachedFiles?: Array<{
    id: string;
    filename: string;
    mimeType: string;
    url?: string;
  }>;
  videoId?: string;
  videoDurationMinutes?: number;
}

export interface TeacherSession {
  id: string;
  traineeId: string;
  messages: ChatMessage[];
  topic?: string;
  startedAt: string;
  lastMessageAt: string;
  status: 'active' | 'completed';
}

// ============================================================================
// AV CONTENT TYPES
// ============================================================================

export interface AVSlide {
  id: string;
  slideNumber: number;
  title: string;
  titleAr?: string;
  bulletPoints: string[];
  bulletPointsAr?: string[];
  visualType: 'bullets' | 'diagram' | 'chart' | 'image';
  visualData?: Record<string, unknown>;
  narrationText: string;
  narrationTextAr?: string;
  audioStartTime: number;
  audioEndTime: number;
  duration: number;
}

export interface AVContent {
  id: string;
  traineeId: string;
  type: 'lecture' | 'summary';
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  topic: string;
  sourceContext?: string;
  totalDuration: number;
  status: 'generating' | 'ready' | 'failed';
  audioUrl?: string;
  metadata: {
    language: 'ar' | 'en' | 'bilingual';
    voiceId?: string;
    adaptations?: string[];
    generationModel?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AVContentWithSlides extends AVContent {
  slides: AVSlide[];
}

export interface GenerateLectureRequest {
  topic: string;
  lessonContext?: string;
  courseId?: string;
  duration?: number;
  language: 'ar' | 'en' | 'bilingual';
}

export interface GenerateSummaryRequest {
  topic: string;
  sourceText?: string;
  focusAreas?: string[];
  language: 'ar' | 'en' | 'bilingual';
}

export interface AVFeedbackRequest {
  rating?: number;
  helpful?: boolean;
  comment?: string;
  watchDuration?: number;
  completedSlides?: number[];
}

export interface PaginatedAVContent {
  data: AVContent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API CLIENT
// ============================================================================

export const aiTeacherApi = {
  // Profile endpoints
  getProfile: async (): Promise<TraineeProfile> => {
    return apiClient.get<TraineeProfile>('/ai-teacher/profile');
  },

  updateProfile: async (updates: Partial<TraineeProfile>): Promise<TraineeProfile> => {
    return apiClient.patch<TraineeProfile>('/ai-teacher/profile', updates);
  },

  syncProfile: async (): Promise<TraineeProfile> => {
    return apiClient.post<TraineeProfile>('/ai-teacher/profile/sync', {});
  },

  // Chat endpoints
  getWelcome: async (teacherName?: string): Promise<WelcomeResponse> => {
    const params = teacherName ? `?teacherName=${teacherName}` : '';
    return apiClient.get<WelcomeResponse>(`/ai-teacher/welcome${params}`);
  },

  sendMessage: async (message: string, attachments?: FileAttachment[], lessonContext?: LessonContextPayload, teacherName?: string): Promise<ChatResponse> => {
    return apiClient.post<ChatResponse>('/ai-teacher/chat', { message, attachments, lessonContext, teacherName });
  },

  /**
   * Send message with streaming response using Server-Sent Events
   * Returns an async generator that yields streaming chunks
   */
  sendMessageStream: async function* (
    message: string,
    attachments?: FileAttachment[],
    lessonContext?: LessonContextPayload,
    teacherName?: string
  ): AsyncGenerator<StreamingChatResponse, void, unknown> {
    const token = localStorage.getItem('auth-storage');
    let authToken = '';
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed?.state?.token || '';
      } catch {
        // Ignore parse errors
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/ai-teacher/chat/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message, attachments, lessonContext, teacherName }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to start streaming chat');
    }

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data) as StreamingChatResponse;
              yield parsed;

              if (parsed.type === 'done' || parsed.type === 'error') {
                return;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  getHistory: async (limit?: number, teacherName?: string): Promise<TeacherSession[]> => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (teacherName) params.set('teacherName', teacherName);
    const qs = params.toString();
    return apiClient.get<TeacherSession[]>(`/ai-teacher/history${qs ? `?${qs}` : ''}`);
  },

  getAssignedTeacher: async (): Promise<{ assignedTeacher: string | null; assignedTeacherAt: string | null }> => {
    return apiClient.get('/ai-teacher/assigned-teacher');
  },

  // Voice endpoints
  textToSpeech: async (text: string, language: 'ar' | 'en', teacherName?: string): Promise<{ audio: string }> => {
    return apiClient.post<{ audio: string }>('/ai-teacher/tts', { text, language, teacherName });
  },

  /**
   * Get welcome audio for a teacher persona
   * Uses pre-defined welcome messages for instant response
   */
  getWelcomeAudio: async (teacherName: string, language: 'ar' | 'en'): Promise<{ message: string; audio: string }> => {
    return apiClient.get<{ message: string; audio: string }>(
      `/ai-teacher/tts/welcome?teacherName=${teacherName}&language=${language}`
    );
  },

  speechToText: async (audioBlob: Blob, language: 'ar' | 'en'): Promise<{ text: string }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', language);

    const token = localStorage.getItem('auth-storage');
    let authToken = '';
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed?.state?.token || '';
      } catch {
        // Ignore parse errors
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/ai-teacher/stt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Speech-to-text failed: ${error}`);
    }

    return response.json();
  },

  // File upload (single file)
  uploadFile: async (file: File): Promise<FileAttachment> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth-storage');
    let authToken = '';
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed?.state?.token || '';
      } catch {}
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/ai-teacher/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return response.json();
  },

  // Multi-file upload (up to 5 files including images, PDFs, PPTs)
  uploadMultipleFiles: async (files: File[]): Promise<{ attachments: FileAttachment[]; count: number }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const token = localStorage.getItem('auth-storage');
    let authToken = '';
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed?.state?.token || '';
      } catch {}
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/ai-teacher/upload-multiple`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload files');
    }

    return response.json();
  },

  // Pre-render TTS for first sentence (for streaming optimization)
  preRenderTTS: async (text: string, language: 'ar' | 'en'): Promise<{ audio: string; text: string; isPartial: boolean }> => {
    return apiClient.post('/ai-teacher/tts/prerender', { text, language });
  },

  // Gemini-powered educational content
  generateLessonSummary: async (
    lessonContext: LessonContextPayload,
    language: 'ar' | 'en'
  ): Promise<{
    summary: string;
    keyPoints: string[];
    practicalTips: string[];
  }> => {
    return apiClient.post('/ai-teacher/lesson-summary', { lessonContext, language });
  },

  generateMiniQuiz: async (
    lessonContext: LessonContextPayload,
    language: 'ar' | 'en',
    numQuestions?: number
  ): Promise<{
    questions: Array<{
      id: string;
      question: string;
      type: 'multiple_choice' | 'true_false';
      options?: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  }> => {
    return apiClient.post('/ai-teacher/mini-quiz', { lessonContext, language, numQuestions });
  },

  generateVideoTimestamps: async (
    lessonContext: LessonContextPayload,
    question: string,
    language: 'ar' | 'en'
  ): Promise<{
    timestamps: Array<{
      startTime: string;
      endTime: string;
      description: string;
      relevance: 'high' | 'medium' | 'low';
    }>;
  }> => {
    return apiClient.post('/ai-teacher/video-timestamps', { lessonContext, question, language });
  },
};

// ============================================================================
// AV CONTENT API
// ============================================================================

export const avContentApi = {
  /**
   * Generate a video lecture with slides and audio
   */
  generateLecture: async (params: GenerateLectureRequest): Promise<AVContent> => {
    return apiClient.post<AVContent>('/ai-teacher/av/generate-lecture', params);
  },

  /**
   * Generate an audio summary focused on weak areas
   */
  generateSummary: async (params: GenerateSummaryRequest): Promise<AVContent> => {
    return apiClient.post<AVContent>('/ai-teacher/av/generate-summary', params);
  },

  /**
   * Get specific AV content with all slides
   */
  getContent: async (id: string): Promise<AVContentWithSlides> => {
    return apiClient.get<AVContentWithSlides>(`/ai-teacher/av/content/${id}`);
  },

  /**
   * List user's AV content with pagination
   */
  listContent: async (params?: {
    page?: number;
    limit?: number;
    type?: 'lecture' | 'summary';
  }): Promise<PaginatedAVContent> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.type) searchParams.set('type', params.type);

    const queryString = searchParams.toString();
    return apiClient.get<PaginatedAVContent>(
      `/ai-teacher/av/content${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Submit feedback for AV content
   */
  submitFeedback: async (id: string, feedback: AVFeedbackRequest): Promise<void> => {
    await apiClient.post(`/ai-teacher/av/content/${id}/feedback`, feedback);
  },

  /**
   * Delete AV content
   */
  deleteContent: async (id: string): Promise<void> => {
    await apiClient.delete(`/ai-teacher/av/content/${id}`);
  },
};
