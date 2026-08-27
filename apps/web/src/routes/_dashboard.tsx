import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, SidebarInset } from "@repo/ui";

function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <Header />
        <div className="flex flex-1 flex-col bg-muted/20">
          <div className="mx-auto w-full max-w-7xl p-6 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});
