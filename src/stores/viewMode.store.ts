import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'admin' | 'trainee';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isTraineeView: boolean;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set, get) => ({
      viewMode: 'admin',
      isTraineeView: false,

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode, isTraineeView: mode === 'trainee' });
      },

      toggleViewMode: () => {
        const current = get().viewMode;
        const newMode = current === 'admin' ? 'trainee' : 'admin';
        set({ viewMode: newMode, isTraineeView: newMode === 'trainee' });
      },
    }),
    {
      name: 'view-mode-storage',
    }
  )
);
