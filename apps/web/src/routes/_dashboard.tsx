import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});
