import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthResponse } from "@repo/contracts";

interface AuthState {
  status: "loading" | "authenticated" | "unauthenticated";
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthResponse["user"] | null;
  setAuth: (response: AuthResponse) => void;
  setUser: (user: AuthResponse["user"]) => void;
  setStatus: (status: AuthState["status"]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "loading",
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (response) =>
        set({
          status: "authenticated",
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        }),
      setUser: (user) => set({ user, status: "authenticated" }),
      setStatus: (status) => set({ status }),
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null, status: "unauthenticated" }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage),
      ),
      // Credentials remain in memory. The API's HttpOnly refresh cookie is the
      // durable credential and cannot be read by injected browser scripts.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
