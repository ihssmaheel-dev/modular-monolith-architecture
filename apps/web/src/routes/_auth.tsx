import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";

function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});
