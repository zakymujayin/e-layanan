"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Archive, Settings, GraduationCap } from "lucide-react";
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    matchExact: true,
    roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"],
  },
  {
    label: "Pengajuan",
    href: "/pengajuan",
    icon: FileText,
    matchExact: false,
    roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"],
  },
  {
    label: "Arsip",
    href: "/arsip",
    icon: Archive,
    matchExact: true,
    roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"],
  },
  {
    label: "Surat & SK Saya",
    href: "/surat-saya",
    icon: FileText,
    matchExact: true,
    roles: ["dosen"],
  },
  {
    label: "Admin Panel",
    href: "/admin",
    icon: Settings,
    matchExact: false,
    roles: ["super_admin"],
  },
];

export function AppSidebar({ systemRole }: { systemRole: string }) {
  const pathname = usePathname();
  const filtered = menuItems.filter((item) => item.roles.includes(systemRole));

  function isItemActive(item: (typeof menuItems)[number]): boolean {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href + "/") || pathname === item.href;
  }

  return (
    <ShadSidebar>
      <SidebarHeader className="flex items-center gap-2 pb-4 pt-3">
        <GraduationCap className="h-6 w-6 text-primary shrink-0" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">SILA</span>
          <span className="text-[10px] text-muted-foreground">FUDA UIN SMH Banten</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isItemActive(item)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadSidebar>
  );
}
