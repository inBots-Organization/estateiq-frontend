import { apiClient } from './client';

export interface TraineeProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  currentLevelId: string | null;
  status: string;
  metrics: {
    totalTimeOnPlatform: number;
    currentStreak: number;
    lastActiveAt: Date | null;
  };
  progress: {
    completedLectureIds: string[];
    completedAssessmentIds: string[];
    completedSimulationIds: string[];
  };
}

export interface AssignedTeacherInfo {
  hasAssignedTeacher: boolean;
  teacherName: string | null;
  teacherId: string | null;
  displayNameAr: string | null;
  displayNameEn: string | null;
  avatarUrl: string | null;
  voiceId: string | null;
  currentSkillLevel: string | null;
}

export interface TraineeProgress {
  traineeId: string;
  programId: string;
  lecturesCompleted: number;
  lecturesTotal: number;
  assessmentsPassed: number;
  assessmentsTotal: number;
  simulationsCompleted: number;
  currentLevel: {
    id: string;
    title: string;
    progress: number;
  } | null;
  overallProgress: number;
}

export interface DashboardStats {
  totalTimeOnPlatform: number;
  currentStreak: number;
  overallProgress: number;
  averageScore: number;
  simulationsCompleted: number;
  coursesCompleted: number;
  voiceCallsCompleted: number;
  lecturesCompleted: number;
  assessmentsPassed: number;
  recentSessions: {
    id: string;
    type: 'simulation' | 'voice' | 'lecture';
    score: number | null;
    completedAt: string;
    durationSeconds: number;
  }[];
  weeklyActivity: {
    day: string;
    sessions: number;
    minutes: number;
  }[];
  currentCourse: {
    id: string;
    title: string;
    progress: number;
    nextLectureTitle: string | null;
  } | null;
}

export const traineeApi = {
  getProfile: async (): Promise<TraineeProfile> => {
    return apiClient.get<TraineeProfile>('/trainees/me');
  },

  /**
   * Get current assigned AI teacher with full details from database
   * This is the source of truth - always fresh, not cached
   */
  getAssignedTeacher: async (): Promise<AssignedTeacherInfo> => {
    return apiClient.get<AssignedTeacherInfo>('/trainees/me/assigned-teacher');
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/trainees/me/dashboard-stats');
  },

  updateProfile: async (data: { firstName?: string; lastName?: string }): Promise<TraineeProfile> => {
    return apiClient.patch<TraineeProfile>('/trainees/me', data);
  },

  getProgress: async (programId: string): Promise<TraineeProgress> => {
    return apiClient.get<TraineeProgress>(`/trainees/me/progress/${programId}`);
  },

  enrollInProgram: async (programId: string): Promise<void> => {
    return apiClient.post('/trainees/me/enroll', { programId });
  },

  completeLecture: async (lectureId: string, timeSpentMinutes: number): Promise<void> => {
    return apiClient.post('/trainees/me/complete-lecture', { lectureId, timeSpentMinutes });
  },

  completeAssessment: async (assessmentId: string, score: number): Promise<{ passed: boolean }> => {
    return apiClient.post('/trainees/me/complete-assessment', { assessmentId, score });
  },

  updateActivity: async (timeSpentMinutes: number): Promise<void> => {
    return apiClient.post('/trainees/me/activity', { timeSpentMinutes });
  },
};
