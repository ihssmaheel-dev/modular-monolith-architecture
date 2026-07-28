import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  theme: "system",
  setTheme: (theme) => set({ theme }),
}));
