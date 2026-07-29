import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@repo/ui";

export function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
