import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────

export type CourseCategory =
  | 'fundamentals'
  | 'sales'
  | 'customer-relations'
  | 'specialization'
  | 'marketing'
  | 'legal';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CourseAttachment {
  id: string;
  courseId: string;
  titleAr?: string | null;
  titleEn?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  displayOrder: number;
  createdAt: string;
}

export interface Lecture {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn: string;
  title: string; // Legacy field
  descriptionAr: string;
  descriptionEn: string;
  description: string; // Legacy field
  videoUrl: string;
  videoType: string;
  durationMinutes: number;
  orderInCourse: number;
  createdAt: string;
}

export interface Course {
  id: string;
  organizationId?: string | null;
  titleAr: string;
  titleEn: string;
  title: string; // Legacy field
  descriptionAr: string;
  descriptionEn: string;
  description: string; // Legacy field
  category: CourseCategory;
  difficulty: CourseDifficulty;
  estimatedDurationMinutes: number;
  objectivesAr: string; // JSON array
  objectivesEn: string; // JSON array
  objectives: string; // Legacy JSON array
  competencyTags: string[];
  thumbnailUrl?: string | null;
  notesAr?: string | null;
  notesEn?: string | null;
  recommendedSimulationType?: string | null;
  recommendedSimulationScenario?: string | null;
  recommendedSimulationDifficulty?: string | null;
  isPublished: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lectures?: Lecture[];
  attachments?: CourseAttachment[];
  _count?: {
    lectures: number;
    attachments: number;
  };
}

export interface CategoryOption {
  value: CourseCategory;
  labelAr: string;
  labelEn: string;
}

export interface DifficultyOption {
  value: CourseDifficulty;
  labelAr: string;
  labelEn: string;
}

export interface CourseListResponse {
  courses: Course[];
  categories: CategoryOption[];
  difficulties: DifficultyOption[];
}

export interface CourseDetailResponse {
  course: Course;
}

export interface CourseStatsResponse {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalLectures: number;
}

export interface CreateCourseData {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  estimatedDurationMinutes?: number;
  objectivesAr?: string[];
  objectivesEn?: string[];
  competencyTags?: string[];
  notesAr?: string;
  notesEn?: string;
  recommendedSimulationType?: string;
  recommendedSimulationScenario?: string;
  recommendedSimulationDifficulty?: string;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  isPublished?: boolean;
  thumbnailUrl?: string;
}

export interface CreateLectureData {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  videoUrl: string;
  durationMinutes?: number;
}

export interface UpdateLectureData extends Partial<CreateLectureData> {}

// ─── API ──────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('auth_token');
  if (!token) {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token || null;
      }
    } catch {
      /* ignore */
    }
  }
  return token || '';
}

export const adminCoursesApi = {
  // ─── Courses ────────────────────────────────────────

  /** Get course statistics */
  getStats: async (): Promise<CourseStatsResponse> => {
    return apiClient.get<CourseStatsResponse>('/admin/courses/stats');
  },

  /** List all courses for organization */
  listCourses: async (params?: {
    category?: CourseCategory | 'all';
    difficulty?: CourseDifficulty | 'all';
    isPublished?: boolean;
    search?: string;
  }): Promise<CourseListResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.category && params.category !== 'all') queryParams.category = params.category;
    if (params?.difficulty && params.difficulty !== 'all') queryParams.difficulty = params.difficulty;
    if (params?.isPublished !== undefined) queryParams.isPublished = String(params.isPublished);
    if (params?.search) queryParams.search = params.search;

    return apiClient.get<CourseListResponse>('/admin/courses', queryParams);
  },

  /** Get single course with lectures and attachments */
  getCourse: async (courseId: string): Promise<CourseDetailResponse> => {
    return apiClient.get<CourseDetailResponse>(`/admin/courses/${courseId}`);
  },

  /** Create new course */
  createCourse: async (data: CreateCourseData): Promise<CourseDetailResponse> => {
    return apiClient.post<CourseDetailResponse>('/admin/courses', data);
  },

  /** Update course */
  updateCourse: async (courseId: string, data: UpdateCourseData): Promise<CourseDetailResponse> => {
    return apiClient.patch<CourseDetailResponse>(`/admin/courses/${courseId}`, data);
  },

  /** Delete course */
  deleteCourse: async (courseId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/admin/courses/${courseId}`);
  },

  /** Toggle publish status */
  togglePublish: async (courseId: string, isPublished: boolean): Promise<CourseDetailResponse> => {
    return apiClient.patch<CourseDetailResponse>(`/admin/courses/${courseId}`, { isPublished });
  },

  // ─── Lectures ────────────────────────────────────────

  /** Add lecture to course */
  createLecture: async (courseId: string, data: CreateLectureData): Promise<{ lecture: Lecture }> => {
    return apiClient.post<{ lecture: Lecture }>(`/admin/courses/${courseId}/lectures`, data);
  },

  /** Update lecture */
  updateLecture: async (
    courseId: string,
    lectureId: string,
    data: UpdateLectureData
  ): Promise<{ lecture: Lecture }> => {
    return apiClient.patch<{ lecture: Lecture }>(`/admin/courses/${courseId}/lectures/${lectureId}`, data);
  },

  /** Delete lecture */
  deleteLecture: async (courseId: string, lectureId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/admin/courses/${courseId}/lectures/${lectureId}`);
  },

  /** Reorder lectures */
  reorderLectures: async (courseId: string, lectureIds: string[]): Promise<{ lectures: Lecture[] }> => {
    return apiClient.post<{ lectures: Lecture[] }>(`/admin/courses/${courseId}/lectures/reorder`, {
      lectureIds,
    });
  },

  // ─── Attachments ────────────────────────────────────────

  /** Upload attachment (PDF, image) */
  uploadAttachment: async (
    courseId: string,
    file: File,
    options?: {
      titleAr?: string;
      titleEn?: string;
    }
  ): Promise<{ attachment: CourseAttachment }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.titleAr) formData.append('titleAr', options.titleAr);
    if (options?.titleEn) formData.append('titleEn', options.titleEn);

    const response = await fetch(`${API_BASE}/admin/courses/${courseId}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  /** Delete attachment */
  deleteAttachment: async (courseId: string, attachmentId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/admin/courses/${courseId}/attachments/${attachmentId}`);
  },

  /** Upload thumbnail */
  uploadThumbnail: async (
    courseId: string,
    file: File
  ): Promise<{ course: Course; thumbnailUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/admin/courses/${courseId}/thumbnail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  // ─── Helpers ────────────────────────────────────────

  /** Parse objectives JSON string to array */
  parseObjectives: (objectivesJson: string): string[] => {
    try {
      return JSON.parse(objectivesJson);
    } catch {
      return [];
    }
  },

  /** Get YouTube video ID from URL */
  getYouTubeVideoId: (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  },

  /** Get YouTube thumbnail URL */
  getYouTubeThumbnail: (videoUrl: string): string | null => {
    const videoId = adminCoursesApi.getYouTubeVideoId(videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  },
};
