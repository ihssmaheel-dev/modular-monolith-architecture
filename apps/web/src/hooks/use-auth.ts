import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const { user, accessToken, refreshToken, status } = useAuthStore();
  // Tokens are memory-only by design (HttpOnly cookie is durable).
  // After reload, user is re-validated via GET /auth/me in _app.tsx.
  const isAuthenticated = status === "authenticated" && !!user;
  return { user, accessToken, refreshToken, status, isAuthenticated };
}
