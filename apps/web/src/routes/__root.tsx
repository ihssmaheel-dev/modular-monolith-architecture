import { createRootRoute, Outlet } from "@tanstack/react-router";

function RootComponent() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
