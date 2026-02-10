import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TeacherName } from '@/config/teachers';

interface TeacherState {
  assignedTeacher: TeacherName | null;
  activeTeacher: TeacherName | null;
  setAssignedTeacher: (name: TeacherName) => void;
  setActiveTeacher: (name: TeacherName | null) => void;
  reset: () => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set) => ({
      assignedTeacher: null,
      activeTeacher: null,

      setAssignedTeacher: (name: TeacherName) => {
        set({ assignedTeacher: name, activeTeacher: name });
      },

      setActiveTeacher: (name: TeacherName | null) => {
        set({ activeTeacher: name });
      },

      reset: () => {
        set({ assignedTeacher: null, activeTeacher: null });
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
