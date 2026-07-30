
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/shared/error-boundary";

function RootComponent() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
