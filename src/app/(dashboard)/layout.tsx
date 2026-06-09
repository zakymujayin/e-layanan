import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { IdleLogout } from "@/components/layout/IdleLogout";
import { SemesterSelector } from "@/components/layout/SemesterSelector";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

  const cookieStore = await cookies();
  const cookieVal = cookieStore.get("selected_semester_id")?.value;

  const [semesters, activeSemester] = await Promise.all([
    prisma.academicPeriod.findMany({
      orderBy: { tanggal_mulai: "desc" },
      take: 8,
      select: { id: true, nama_semester: true, tahun_akademik: true, status: true },
    }),
    prisma.academicPeriod.findFirst({
      where: { status: "active" },
      select: { id: true },
    }),
  ]);

  const selectedSemesterId =
    cookieVal && semesters.some((s) => s.id === Number(cookieVal))
      ? Number(cookieVal)
      : (activeSemester?.id ?? semesters[0]?.id ?? 0);

  const isArchiveMode =
    activeSemester != null && selectedSemesterId !== activeSemester.id;

  const semesterOptions = semesters.map((s) => ({
    id: s.id,
    label: `${s.nama_semester} ${s.tahun_akademik}`,
    isActive: s.status === "active",
  }));

  return (
    <SidebarProvider>
      <IdleLogout />
      <AppSidebar systemRole={user.system_role} />
      <main className="flex flex-1 flex-col">
        <Header
          userName={userName}
          slot={
            semesterOptions.length > 0 ? (
              <SemesterSelector
                semesters={semesterOptions}
                selectedId={selectedSemesterId}
              />
            ) : undefined
          }
        />
        {isArchiveMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-sm text-amber-800">
            ⚠ Mode Arsip — {semesterOptions.find((s) => s.id === selectedSemesterId)?.label}. Data read-only.
          </div>
        )}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
