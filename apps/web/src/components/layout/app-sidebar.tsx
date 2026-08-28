import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-14 border-b border-sidebar-border bg-sidebar px-2">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-0 py-3">
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-2">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
