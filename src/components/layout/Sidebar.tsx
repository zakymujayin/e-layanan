"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Archive, Settings } from "lucide-react";
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"],
  },
  {
    label: "Pengajuan",
    href: "/pengajuan",
    icon: FileText,
    roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"],
  },
  {
    label: "Arsip",
    href: "/arsip",
    icon: Archive,
    roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"],
  },
  {
    label: "Surat & SK Saya",
    href: "/surat-saya",
    icon: FileText,
    roles: ["dosen"],
  },
  {
    label: "Admin Panel",
    href: "/admin",
    icon: Settings,
    roles: ["super_admin"],
  },
];

export function AppSidebar({ systemRole }: { systemRole: string }) {
  const pathname = usePathname();
  const filtered = menuItems.filter((item) => item.roles.includes(systemRole));

  return (
    <ShadSidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SILA FUDA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
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
