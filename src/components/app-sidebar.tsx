import * as React from "react";
import {
  ChartBarIcon,
  CommandIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon
} from "lucide-react";
import { Link } from "react-router-dom";

import { NavMain, type NavItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useSession } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

/**
 * Every entry points at a route that exists. The shadcn scaffolding shipped three extra
 * groups of `url: "#"` placeholders (navClouds, documents, navSecondary); they were removed
 * rather than left to look like features that do not work.
 */
const NAV_ITEMS: NavItem[] = [
  { title: "Panel", url: "/dashboard", icon: <LayoutDashboardIcon /> },
  { title: "Evaluar estudiante", url: "/prediccion", icon: <ChartBarIcon /> },
  { title: "Evaluar por lotes", url: "/prediccion/lote", icon: <ListIcon /> },
  { title: "Modelo", url: "/modelo", icon: <FolderIcon /> },
  { title: "Historial", url: "/historial", icon: <UsersIcon />, adminOnly: true }
];

export function AppSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, role } = useSession();
  // Admin-only entries are hidden rather than shown-and-rejected; the route guard still
  // enforces it for anyone who types the URL.
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link to="/dashboard" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Web Académica</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {/* NavUser reads the session itself and derives the name and initials from the
            email; these props are only the fallback for a missing session. */}
        <NavUser user={{ name: "Usuario", email: user?.email ?? "", avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  );
}
