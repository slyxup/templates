import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // Add your state here
  count: number;
  isLoading: boolean;
}

interface AppActions {
  // Add your actions here
  increment: () => void;
  decrement: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: AppState = {
  count: 0,
  isLoading: false,
};

export const useStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        setLoading: (loading) => set({ isLoading: loading }),
        reset: () => set(initialState),
      }),
      {
        name: 'app-storage',
      }
    )
  )
);
