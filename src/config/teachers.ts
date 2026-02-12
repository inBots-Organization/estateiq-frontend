/**
 * Teacher Configuration
 *
 * Shared configuration for the 4 AI teacher personas used across the frontend.
 * All avatars are custom professional Saudi-style illustrations.
 */

export type TeacherName = 'ahmed' | 'noura' | 'anas' | 'abdullah' | 'firas';

export type TeacherPersonality = 'professional' | 'friendly' | 'wise' | 'challenging';

export interface TeacherConfig {
  name: TeacherName;
  displayName: { ar: string; en: string };
  description: { ar: string; en: string };
  shortDescription: { ar: string; en: string };
  initial: { ar: string; en: string };
  avatarUrl: string; // Avatar image URL
  gradient: string;
  bgLight: string;
  textColor: string;
  iconName: 'GraduationCap' | 'Target' | 'Brain' | 'Star';
  isAlwaysAvailable: boolean;
  personality: TeacherPersonality;
}

// Base URL for avatars (Vercel deployment)
const AVATAR_BASE_URL = 'https://estateiq-app.vercel.app/avatars';

export const TEACHERS: Record<TeacherName, TeacherConfig> = {
  ahmed: {
    name: 'ahmed',
    displayName: { ar: 'أحمد', en: 'Ahmed' },
    description: {
      ar: 'معلم الأساسيات — صبور ومشجع، يشرح المفاهيم بطريقة بسيطة',
      en: 'Fundamentals Teacher — Patient and encouraging, explains concepts simply',
    },
    shortDescription: {
      ar: 'معلم الأساسيات',
      en: 'Fundamentals',
    },
    initial: { ar: 'أ', en: 'A' },
    // Professional Saudi male - friendly fundamentals teacher
    avatarUrl: `${AVATAR_BASE_URL}/ahmed.png`,
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    iconName: 'GraduationCap',
    isAlwaysAvailable: false,
    personality: 'friendly',
  },
  noura: {
    name: 'noura',
    displayName: { ar: 'نورة', en: 'Noura' },
    description: {
      ar: 'معلمة الاستراتيجيات — حادة الذكاء، تتحداك بسيناريوهات واقعية',
      en: 'Sales Strategy Teacher — Sharp and challenging with realistic scenarios',
    },
    shortDescription: {
      ar: 'استراتيجيات المبيعات',
      en: 'Sales Strategy',
    },
    initial: { ar: 'ن', en: 'N' },
    // Professional Saudi woman with hijab - sales strategist
    avatarUrl: `${AVATAR_BASE_URL}/noura.png`,
    gradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    iconName: 'Target',
    isAlwaysAvailable: false,
    personality: 'challenging',
  },
  anas: {
    name: 'anas',
    displayName: { ar: 'أنس', en: 'Anas' },
    description: {
      ar: 'المدرب الاحترافي — خبير متقدم، يتوقع إجابات على مستوى المحترفين',
      en: 'Senior Closer Coach — Elite expert, expects professional-level answers',
    },
    shortDescription: {
      ar: 'الإغلاق الاحترافي',
      en: 'Senior Closer',
    },
    initial: { ar: 'أ', en: 'A' },
    // Professional Saudi male - senior closing coach
    avatarUrl: `${AVATAR_BASE_URL}/anas.png`,
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    iconName: 'Brain',
    isAlwaysAvailable: false,
    personality: 'professional',
  },
  abdullah: {
    name: 'abdullah',
    displayName: { ar: 'عبدالله', en: 'Abdullah' },
    description: {
      ar: 'مرشد النمو — حكيم ومتأمل، يحلل أداءك ويوجهك بناءً على البيانات',
      en: 'Growth Mentor — Wise and reflective, analyzes your performance data',
    },
    shortDescription: {
      ar: 'مرشد النمو',
      en: 'Growth Mentor',
    },
    initial: { ar: 'ع', en: 'A' },
    // Professional Saudi elder - wise growth mentor
    avatarUrl: `${AVATAR_BASE_URL}/abdullah.png`,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-500/10',
    textColor: 'text-amber-600',
    iconName: 'Star',
    isAlwaysAvailable: true,
    personality: 'wise',
  },
  firas: {
    name: 'firas',
    displayName: { ar: 'فراس', en: 'Firas' },
    description: {
      ar: 'كوتش الإغلاق — خبير متقدم في إتمام الصفقات وتحليل السوق',
      en: 'Closing Coach — Advanced expert in deal closing and market analysis',
    },
    shortDescription: {
      ar: 'كوتش الإغلاق',
      en: 'Closing Coach',
    },
    initial: { ar: 'ف', en: 'F' },
    // Professional Saudi male - closing coach (uses custom avatar from backend if available)
    avatarUrl: `${AVATAR_BASE_URL}/firas.png`,
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-500/10',
    textColor: 'text-cyan-600',
    iconName: 'Target',
    isAlwaysAvailable: false,
    personality: 'professional',
  },
};

export const TEACHER_LIST: TeacherConfig[] = Object.values(TEACHERS);
export const VALID_TEACHER_NAMES: TeacherName[] = ['ahmed', 'noura', 'anas', 'abdullah', 'firas'];
