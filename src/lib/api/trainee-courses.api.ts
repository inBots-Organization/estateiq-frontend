/**
 * Trainee Courses API Client
 * For trainees to view dynamic courses from the database
 */

import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────

export interface Lesson {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  videoId: string;
  videoUrl: string;
  durationMinutes: number;
  order: number;
}

export interface CourseAttachment {
  id: string;
  titleAr?: string | null;
  titleEn?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  displayOrder: number;
}

export interface RecommendedSimulation {
  type: 'text' | 'voice';
  scenarioType: string;
  difficultyLevel: string;
}

export interface Course {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDurationMinutes: number;
  objectivesAr: string[];
  objectivesEn: string[];
  thumbnailUrl?: string | null;
  notesAr?: string | null;
  notesEn?: string | null;
  recommendedSimulation?: RecommendedSimulation | null;
  lessons: Lesson[];
  attachments?: CourseAttachment[];
  lecturesCount?: number;
  attachmentsCount?: number;
}

export interface CategoryOption {
  value: string;
  labelAr: string;
  labelEn: string;
}

export interface DifficultyOption {
  value: string;
  labelAr: string;
  labelEn: string;
}

export interface CoursesListResponse {
  courses: Course[];
  categories: CategoryOption[];
  difficulties: DifficultyOption[];
}

export interface CourseDetailResponse {
  course: Course;
}

// For AI Teacher context
export interface CourseContextItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  objectivesAr: string[];
  objectivesEn: string[];
  lecturesCount: number;
  lectures: {
    id: string;
    titleAr: string;
    titleEn: string;
    durationMinutes: number;
    order: number;
  }[];
  link: string;
}

export interface CoursesContextResponse {
  courses: CourseContextItem[];
}

// ─── API ──────────────────────────────────────────────────

export const traineeCoursesApi = {
  /**
   * Get all published courses for the trainee's organization
   */
  listCourses: async (params?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<CoursesListResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.category && params.category !== 'all' && params.category !== 'All') {
      queryParams.category = params.category;
    }
    if (params?.difficulty && params.difficulty !== 'all' && params.difficulty !== 'All') {
      queryParams.difficulty = params.difficulty;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }

    return apiClient.get<CoursesListResponse>('/trainee/courses', queryParams);
  },

  /**
   * Get a single course with all lectures and attachments
   */
  getCourse: async (courseId: string): Promise<CourseDetailResponse> => {
    return apiClient.get<CourseDetailResponse>(`/trainee/courses/${courseId}`);
  },

  /**
   * Get courses context for AI Teacher recommendations
   */
  getCoursesContext: async (): Promise<CoursesContextResponse> => {
    return apiClient.get<CoursesContextResponse>('/trainee/courses/context/ai-teacher');
  },

  // ─── Helper Functions ────────────────────────────────────

  /**
   * Get course title based on language
   */
  getCourseTitle: (course: Course, isRTL: boolean): string => {
    return isRTL ? course.titleAr : course.titleEn;
  },

  /**
   * Get course description based on language
   */
  getCourseDescription: (course: Course, isRTL: boolean): string => {
    return isRTL ? course.descriptionAr : course.descriptionEn;
  },

  /**
   * Get lesson title based on language
   */
  getLessonTitle: (lesson: Lesson, isRTL: boolean): string => {
    return isRTL ? lesson.titleAr : lesson.titleEn;
  },

  /**
   * Get lesson description based on language
   */
  getLessonDescription: (lesson: Lesson, isRTL: boolean): string => {
    return isRTL ? lesson.descriptionAr : lesson.descriptionEn;
  },

  /**
   * Get course objectives based on language
   */
  getCourseObjectives: (course: Course, isRTL: boolean): string[] => {
    return isRTL ? course.objectivesAr : course.objectivesEn;
  },

  /**
   * Get YouTube video ID from URL or direct ID
   */
  getYouTubeVideoId: (url: string): string | null => {
    if (!url) return null;

    // If it's already just an ID (11 characters, alphanumeric with hyphens/underscores)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

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

  /**
   * Get YouTube thumbnail URL
   */
  getYouTubeThumbnail: (videoIdOrUrl: string): string | null => {
    const videoId = traineeCoursesApi.getYouTubeVideoId(videoIdOrUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  },

  /**
   * Format duration to human readable
   */
  formatDuration: (minutes: number, isRTL: boolean): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (isRTL) {
      return hours > 0 ? `${hours} ساعة ${mins} دقيقة` : `${mins} دقيقة`;
    }
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  },

  /**
   * Get difficulty color classes
   */
  getDifficultyColor: (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  },

  /**
   * Get difficulty label
   */
  getDifficultyLabel: (difficulty: string, isRTL: boolean): string => {
    const labels: Record<string, { ar: string; en: string }> = {
      beginner: { ar: 'مبتدئ', en: 'Beginner' },
      intermediate: { ar: 'متوسط', en: 'Intermediate' },
      advanced: { ar: 'متقدّم', en: 'Advanced' },
    };
    return isRTL ? labels[difficulty]?.ar : labels[difficulty]?.en || difficulty;
  },

  /**
   * Get category color
   */
  getCategoryColor: (category: string): string => {
    const colors: Record<string, string> = {
      'fundamentals': 'bg-blue-500',
      'Fundamentals': 'bg-blue-500',
      'sales': 'bg-purple-500',
      'Sales Skills': 'bg-purple-500',
      'customer-relations': 'bg-green-500',
      'Client Relations': 'bg-green-500',
      'specialization': 'bg-orange-500',
      'Specialization': 'bg-orange-500',
      'marketing': 'bg-pink-500',
      'Marketing': 'bg-pink-500',
      'legal': 'bg-indigo-500',
    };
    return colors[category] || 'bg-muted-foreground';
  },

  /**
   * Get category label
   */
  getCategoryLabel: (category: string, isRTL: boolean): string => {
    const categoryMap: Record<string, { ar: string; en: string }> = {
      'fundamentals': { ar: 'الأساسيات', en: 'Fundamentals' },
      'Fundamentals': { ar: 'الأساسيات', en: 'Fundamentals' },
      'sales': { ar: 'مهارات البيع', en: 'Sales Skills' },
      'Sales Skills': { ar: 'مهارات البيع', en: 'Sales Skills' },
      'customer-relations': { ar: 'علاقات العملاء', en: 'Customer Relations' },
      'Client Relations': { ar: 'علاقات العملاء', en: 'Client Relations' },
      'specialization': { ar: 'التخصص', en: 'Specialization' },
      'Specialization': { ar: 'التخصص', en: 'Specialization' },
      'marketing': { ar: 'التسويق', en: 'Marketing' },
      'Marketing': { ar: 'التسويق', en: 'Marketing' },
      'legal': { ar: 'القانون العقاري', en: 'Real Estate Law' },
    };
    return isRTL ? categoryMap[category]?.ar : categoryMap[category]?.en || category;
  },
};
