import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import {
  CameraIcon,
  ChartBarIcon,
  CircleHelpIcon,
  CommandIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  Settings2Icon,
  UsersIcon
} from "lucide-react";

const data = {
  user: {
    name: "Usuario",
    email: "usuario@universidad.edu.co",
    avatar: "/avatars/shadcn.jpg"
  },
  navMain: [
    {
      title: "Panel",
      url: "#",
      icon: <LayoutDashboardIcon />
    },
    {
      title: "Ciclo de vida",
      url: "#",
      icon: <ListIcon />
    },
    {
      title: "Analítica",
      url: "#",
      icon: <ChartBarIcon />
    },
    {
      title: "Proyectos",
      url: "#",
      icon: <FolderIcon />
    },
    {
      title: "Equipo",
      url: "#",
      icon: <UsersIcon />
    }
  ],
  navClouds: [
    {
      title: "Captura",
      icon: <CameraIcon />,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Propuestas activas",
          url: "#"
        },
        {
          title: "Archivadas",
          url: "#"
        }
      ]
    },
    {
      title: "Propuesta",
      icon: <FileTextIcon />,
      url: "#",
      items: [
        {
          title: "Propuestas activas",
          url: "#"
        },
        {
          title: "Archivadas",
          url: "#"
        }
      ]
    },
    {
      title: "Indicaciones",
      icon: <FileTextIcon />,
      url: "#",
      items: [
        {
          title: "Propuestas activas",
          url: "#"
        },
        {
          title: "Archivadas",
          url: "#"
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "#",
      icon: <Settings2Icon />
    },
    {
      title: "Obtener ayuda",
      url: "#",
      icon: <CircleHelpIcon />
    },
    {
      title: "Buscar",
      url: "#",
      icon: <SearchIcon />
    }
  ],
  documents: [
    {
      name: "Biblioteca de datos",
      url: "#",
      icon: <DatabaseIcon />
    },
    {
      name: "Informes",
      url: "#",
      icon: <FileChartColumnIcon />
    },
    {
      name: "Asistente de Word",
      url: "#",
      icon: <FileIcon />
    }
  ]
};

export function AppSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Web Académica</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

