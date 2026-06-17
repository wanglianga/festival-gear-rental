import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  brightMode: boolean;
  userRole: 'audience' | 'staff';
  currentPointId: string;
  toggleBrightMode: () => void;
  setUserRole: (role: 'audience' | 'staff') => void;
  setCurrentPointId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      brightMode: false,
      userRole: 'audience',
      currentPointId: 'point-1',
      toggleBrightMode: () => set((state) => ({ brightMode: !state.brightMode })),
      setUserRole: (role) => set({ userRole: role }),
      setCurrentPointId: (id) => set({ currentPointId: id }),
    }),
    {
      name: 'festival-app-storage',
    }
  )
);
