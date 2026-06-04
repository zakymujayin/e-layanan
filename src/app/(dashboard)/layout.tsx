import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { IdleLogout } from "@/components/layout/IdleLogout";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { dosen: true, mahasiswa: true, pegawai: true },
  });
  if (!user) redirect("/login");

  const userName =
    user.dosen?.nama_lengkap ||
    user.pegawai?.nama_lengkap ||
    user.mahasiswa?.nama_lengkap ||
    user.email;

  return (
    <SidebarProvider>
      <IdleLogout />
      <AppSidebar systemRole={user.system_role} />
      <main className="flex flex-1 flex-col">
        <Header userName={userName} />
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
