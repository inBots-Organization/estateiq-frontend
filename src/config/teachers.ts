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
    // Professional Arab male avatar - friendly, warm skin tone, beard
    avatarUrl: 'https://api.dicebear.com/9.x/personas/svg?seed=AhmedKSA&skinColor=b16a5b&hair=fade&facialHair=goatee&facialHairProbability=100&eyes=happy&mouth=bigSmile&body=squared&clothing=blazerAndShirt&clothingColor=3b82f6&backgroundColor=3b82f6',
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
    // Professional Arab woman avatar - confident look, long hair
    avatarUrl: 'https://api.dicebear.com/9.x/personas/svg?seed=NouraKSA&skinColor=e5a07e&hair=long&facialHairProbability=0&eyes=open&mouth=smile&body=rounded&clothing=blazerAndShirt&clothingColor=8b5cf6&backgroundColor=8b5cf6',
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
    // Professional Arab male avatar - senior expert, darker skin, full beard
    avatarUrl: 'https://api.dicebear.com/9.x/personas/svg?seed=AnasKSA&skinColor=92594b&hair=bald&facialHair=beardMustache&facialHairProbability=100&eyes=open&mouth=smirk&body=squared&clothing=blazerAndShirt&clothingColor=10b981&backgroundColor=10b981',
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
    // Professional Arab male avatar - wise mentor, warm skin, distinguished beard
    avatarUrl: 'https://api.dicebear.com/9.x/personas/svg?seed=AbdullahKSA&skinColor=b16a5b&hair=balding&facialHair=walrus&facialHairProbability=100&eyes=open&mouth=smile&body=rounded&clothing=blazerAndShirt&clothingColor=f59e0b&backgroundColor=f59e0b',
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
