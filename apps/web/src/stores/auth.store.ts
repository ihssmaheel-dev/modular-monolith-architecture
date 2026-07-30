import { create } from "zustand";
import { persist } from "zustand/middleware";


interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  getAccessToken: () => string | null;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          isAuthenticated: true,
        }),

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
      },

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      getAccessToken: () => {
        const state = get();
        return state.accessToken;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
