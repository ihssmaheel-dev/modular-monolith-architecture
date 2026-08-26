import { Hash, Activity, Gauge, MoreHorizontal } from "lucide-react";

interface ProjectItem {
  name: string;
  url: string;
  icon: typeof Hash;
  isExternal?: boolean;
}

export function NavProjects({ collapsed }: { collapsed?: boolean }) {
  const projects: ProjectItem[] = [
    { name: "Modular Monolith", url: "/", icon: Hash },
    { name: "Scalar API Docs", url: "/api/docs", icon: Activity, isExternal: true },
    { name: "Metrics & Traces", url: "/metrics", icon: Gauge, isExternal: true },
  ];

  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground/80">
          Projects
        </div>
      )}
      <div className="space-y-0.5">
        {projects.map((project) => {
          const Icon = project.icon;
          return (
            <a
              key={project.name}
              href={project.url}
              target={project.isExternal ? "_blank" : undefined}
              rel={project.isExternal ? "noreferrer" : undefined}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              {!collapsed && <span className="truncate">{project.name}</span>}
            </a>
          );
        })}
        {!collapsed && (
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>More</span>
          </button>
        )}
      </div>
    </div>
  );
}
