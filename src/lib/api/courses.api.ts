import { apiClient } from './client';
import type { Course, Lecture, Program } from '@/types/entities';

export interface CourseFilters {
  programId?: string;
  levelId?: string;
  category?: string;
  difficulty?: string;
}

export const coursesApi = {
  getPrograms: async (): Promise<Program[]> => {
    return apiClient.get<Program[]>('/programs');
  },

  getCourses: async (filters?: CourseFilters): Promise<Course[]> => {
    const params: Record<string, string> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    return apiClient.get<Course[]>('/courses', params);
  },

  getCoursesByProgram: async (programId: string): Promise<Course[]> => {
    return apiClient.get<Course[]>(`/courses/program/${programId}`);
  },

  getCoursesByLevel: async (levelId: string): Promise<Course[]> => {
    return apiClient.get<Course[]>(`/courses/level/${levelId}`);
  },

  getCourse: async (courseId: string): Promise<Course> => {
    return apiClient.get<Course>(`/courses/${courseId}`);
  },

  getLecture: async (lectureId: string): Promise<Lecture> => {
    return apiClient.get<Lecture>(`/courses/lectures/${lectureId}`);
  },

  getCourseProgress: async (courseId: string): Promise<{ courseId: string; progress: number }> => {
    return apiClient.get(`/courses/${courseId}/progress`);
  },

  searchCourses: async (query: string, filters?: CourseFilters): Promise<Course[]> => {
    const params: Record<string, string> = { q: query };
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    return apiClient.get<Course[]>('/courses/search', params);
  },
};
