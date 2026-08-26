import { useUIStore } from "@/stores/ui.store";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

export function Sidebar() {
  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 select-none ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* 1. Top Organization / Team Switcher */}
      <div className="p-2 border-b border-border">
        <TeamSwitcher collapsed={!sidebarOpen} />
      </div>

      {/* 2. Main Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <NavMain collapsed={!sidebarOpen} />
        <div className="border-t border-border/60 pt-3">
          <NavProjects collapsed={!sidebarOpen} />
        </div>
      </div>

      {/* 3. Footer User Profile Card */}
      <NavUser collapsed={!sidebarOpen} />
    </aside>
  );
}
