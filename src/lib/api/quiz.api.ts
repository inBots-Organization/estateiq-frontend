import { apiClient } from './client';
import type {
  QuizDetail,
  QuizListItem,
  QuizAttemptResult,
  TraineeAttemptHistoryItem,
  AdminAttemptItem,
  CreateQuizInput,
  UpdateQuizInput,
  SubmitResponseInput,
  GenerateQuizInput,
} from '@/types/quiz';

export const quizApi = {
  // ==========================================
  // Trainee endpoints
  // ==========================================

  /** List published quizzes available for trainee */
  getAvailableQuizzes: async (courseId?: string): Promise<{ quizzes: QuizListItem[] }> => {
    const params: Record<string, string> = {};
    if (courseId) params.courseId = courseId;
    return apiClient.get<{ quizzes: QuizListItem[] }>('/quizzes/available', params);
  },

  /** Get trainee's attempt history */
  getTraineeHistory: async (): Promise<{ history: TraineeAttemptHistoryItem[] }> => {
    return apiClient.get<{ history: TraineeAttemptHistoryItem[] }>('/quizzes/history');
  },

  /** Get quiz for taking (correct answers stripped) */
  getQuizForTaking: async (quizId: string): Promise<QuizDetail> => {
    return apiClient.get<QuizDetail>(`/quizzes/${quizId}/take`);
  },

  /** Start a new quiz attempt */
  startAttempt: async (quizId: string): Promise<{ attemptId: string }> => {
    return apiClient.post<{ attemptId: string }>(`/quizzes/${quizId}/start`);
  },

  /** Submit attempt responses and get score */
  submitAttempt: async (
    attemptId: string,
    responses: SubmitResponseInput[]
  ): Promise<QuizAttemptResult> => {
    return apiClient.post<QuizAttemptResult>(`/quizzes/attempts/${attemptId}/submit`, {
      responses,
    });
  },

  /** View attempt result with corrections */
  getAttemptResult: async (attemptId: string): Promise<QuizAttemptResult> => {
    return apiClient.get<QuizAttemptResult>(`/quizzes/attempts/${attemptId}/result`);
  },

  // ==========================================
  // Admin endpoints
  // ==========================================

  /** List all quizzes (admin view with stats) */
  getAdminQuizzes: async (): Promise<{ quizzes: QuizListItem[] }> => {
    return apiClient.get<{ quizzes: QuizListItem[] }>('/quizzes/manage');
  },

  /** Create quiz with questions & options */
  createQuiz: async (data: CreateQuizInput): Promise<QuizDetail> => {
    return apiClient.post<QuizDetail>('/quizzes', data);
  },

  /** Get full quiz detail with correct answers (admin) */
  getQuizForAdmin: async (quizId: string): Promise<QuizDetail> => {
    return apiClient.get<QuizDetail>(`/quizzes/${quizId}/admin`);
  },

  /** Update quiz */
  updateQuiz: async (quizId: string, data: UpdateQuizInput): Promise<QuizDetail> => {
    return apiClient.put<QuizDetail>(`/quizzes/${quizId}`, data);
  },

  /** Delete quiz */
  deleteQuiz: async (quizId: string): Promise<void> => {
    return apiClient.delete(`/quizzes/${quizId}`);
  },

  /** Toggle publish status */
  publishQuiz: async (quizId: string, publish: boolean): Promise<void> => {
    return apiClient.patch(`/quizzes/${quizId}/publish`, { publish });
  },

  /** All attempts for a quiz (admin view) */
  getQuizAttempts: async (quizId: string): Promise<{ attempts: AdminAttemptItem[] }> => {
    return apiClient.get<{ attempts: AdminAttemptItem[] }>(`/quizzes/${quizId}/attempts`);
  },

  /** AI-generate quiz */
  generateQuiz: async (data: GenerateQuizInput): Promise<QuizDetail> => {
    return apiClient.post<QuizDetail>('/quizzes/generate', data);
  },
};
