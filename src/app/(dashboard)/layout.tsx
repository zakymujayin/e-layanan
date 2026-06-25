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
    include: { dosen: true, mahasiswa: { include: { prodi: true } }, pegawai: true },
  });
  if (!user) redirect("/login");

  const userName =
    user.dosen?.nama_lengkap ||
    user.pegawai?.nama_lengkap ||
    user.mahasiswa?.nama_lengkap ||
    user.email;

  // Determine role label and prodi for Header
  const ROLE_LABELS: Record<string, string> = {
    mahasiswa: "Mahasiswa", dosen: "Dosen", staff_prodi: "Staff Prodi",
    staff_akademik: "Staff Akademik", kabag: "Kabag", super_admin: "Super Admin",
  };
  let roleLabel = ROLE_LABELS[user.system_role] ?? user.system_role;
  let prodiName = user.mahasiswa?.prodi?.nama ?? "";

  if (user.dosen?.id) {
    const pos = await prisma.structuralPosition.findFirst({
      where: { dosen_id: user.dosen.id, is_active: true },
      include: { prodi: { select: { nama: true } } },
      orderBy: { start_date: "desc" },
    });
    if (pos) {
      const POS_LABELS: Record<string, string> = {
        kaprodi: "Kaprodi", sekprodi: "Sekprodi", wakil_dekan_1: "Wakil Dekan I",
        dekan: "Dekan", kepala_lab: "Kepala Lab",
      };
      roleLabel = POS_LABELS[pos.position_code] ?? pos.position_code;
      prodiName = pos.prodi?.nama ?? "";
    }
  }

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
      <main className="flex flex-1 flex-col min-h-screen w-full min-w-0">
        <Header
          userName={userName}
          roleLabel={roleLabel}
          prodiName={prodiName || undefined}
          slot={
            <SemesterSelector
              semesters={semesterOptions}
              selectedId={selectedSemesterId}
            />
          }
        />
        {isArchiveMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 text-sm text-amber-800">
            ⚠ Mode Arsip &mdash; {semesterOptions.find((s) => s.id === selectedSemesterId)?.label}. Data bersifat read-only.
          </div>
        )}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
