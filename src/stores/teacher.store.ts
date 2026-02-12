import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TeacherName } from '@/config/teachers';

interface TeacherState {
  assignedTeacher: TeacherName | null;
  activeTeacher: TeacherName | null;
  // Track which user this data belongs to
  userId: string | null;
  // Custom teacher data from backend (for non-default teachers)
  customTeacherAvatar: string | null;
  customTeacherDisplayNameAr: string | null;
  customTeacherDisplayNameEn: string | null;
  setAssignedTeacher: (name: TeacherName, customData?: { avatar?: string | null; displayNameAr?: string | null; displayNameEn?: string | null }) => void;
  setActiveTeacher: (name: TeacherName | null) => void;
  setUserId: (id: string | null) => void;
  reset: () => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set) => ({
      assignedTeacher: null,
      activeTeacher: null,
      userId: null,
      customTeacherAvatar: null,
      customTeacherDisplayNameAr: null,
      customTeacherDisplayNameEn: null,

      setAssignedTeacher: (name: TeacherName, customData?: { avatar?: string | null; displayNameAr?: string | null; displayNameEn?: string | null }) => {
        set({
          assignedTeacher: name,
          activeTeacher: name,
          customTeacherAvatar: customData?.avatar || null,
          customTeacherDisplayNameAr: customData?.displayNameAr || null,
          customTeacherDisplayNameEn: customData?.displayNameEn || null,
        });
      },

      setActiveTeacher: (name: TeacherName | null) => {
        set({ activeTeacher: name });
      },

      setUserId: (id: string | null) => {
        set({ userId: id });
      },

      reset: () => {
        set({
          assignedTeacher: null,
          activeTeacher: null,
          userId: null,
          customTeacherAvatar: null,
          customTeacherDisplayNameAr: null,
          customTeacherDisplayNameEn: null,
        });
      },
    }),
    {
      name: 'teacher-selection',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
