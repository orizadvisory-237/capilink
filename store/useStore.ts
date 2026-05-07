import { create } from "zustand";

interface GlobalState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
