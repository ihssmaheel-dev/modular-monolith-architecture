import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-14 border-b border-sidebar-border bg-sidebar px-2 flex items-center">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-2 py-2">
        <NavMain />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-2">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
