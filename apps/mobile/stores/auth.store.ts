import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthResponse } from "@repo/contracts";

type AuthUser = AuthResponse["user"];

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (response) =>
        set({
          token: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
          isAuthenticated: true,
        }),
      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
      getToken: () => get().token,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
