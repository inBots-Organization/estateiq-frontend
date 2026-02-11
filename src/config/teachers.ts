/**
 * Teacher Configuration
 *
 * Shared configuration for the 4 AI teacher personas used across the frontend.
 */

export type TeacherName = 'ahmed' | 'noura' | 'anas' | 'abdullah';

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
    // Professional Saudi male avatar - friendly look with turban and light beard
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AhmedSaudi&top=turban&skinColor=d08b5b&facialHair=beardLight&facialHairProbability=100&eyes=happy&eyebrows=defaultNatural&mouth=smile&clothes=blazerAndShirt&clothesColor=3b82f6&backgroundColor=3b82f6',
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
    // Professional Saudi woman avatar - hijab with confident look
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=NouraSaudi&top=hijab&skinColor=edb98a&eyes=default&eyebrows=defaultNatural&mouth=serious&clothes=blazerAndSweater&clothesColor=8b5cf6&backgroundColor=8b5cf6',
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
    // Professional Saudi male avatar - senior expert with turban and medium beard
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AnasSaudi&top=turban&skinColor=ae5d29&facialHair=beardMedium&facialHairProbability=100&eyes=default&eyebrows=raisedExcitedNatural&mouth=serious&clothes=blazerAndShirt&clothesColor=10b981&backgroundColor=10b981',
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
    // Professional Saudi male avatar - wise mentor with turban and majestic beard
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AbdullahSaudi&top=turban&skinColor=d08b5b&facialHair=beardMajestic&facialHairProbability=100&eyes=default&eyebrows=defaultNatural&mouth=smile&clothes=blazerAndShirt&clothesColor=f59e0b&backgroundColor=f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-500/10',
    textColor: 'text-amber-600',
    iconName: 'Star',
    isAlwaysAvailable: true,
    personality: 'wise',
  },
};

export const TEACHER_LIST: TeacherConfig[] = Object.values(TEACHERS);
export const VALID_TEACHER_NAMES: TeacherName[] = ['ahmed', 'noura', 'anas', 'abdullah'];
