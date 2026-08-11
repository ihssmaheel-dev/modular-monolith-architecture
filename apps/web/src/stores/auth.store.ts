import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "@repo/shared";

type AuthUser = AuthResponse["user"];

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: { user: AuthUser }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (data) =>
        set({
          user: data.user,
          isAuthenticated: true,
        }),

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
