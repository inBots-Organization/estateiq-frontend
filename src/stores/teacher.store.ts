import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TeacherName } from '@/config/teachers';

interface TeacherState {
  assignedTeacher: TeacherName | null;
  activeTeacher: TeacherName | null;
  // Track which user this data belongs to
  userId: string | null;
  setAssignedTeacher: (name: TeacherName) => void;
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

      setAssignedTeacher: (name: TeacherName) => {
        set({ assignedTeacher: name, activeTeacher: name });
      },

      setActiveTeacher: (name: TeacherName | null) => {
        set({ activeTeacher: name });
      },

      setUserId: (id: string | null) => {
        set({ userId: id });
      },

      reset: () => {
        set({ assignedTeacher: null, activeTeacher: null, userId: null });
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
