import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Clock, CheckCircle, Users, AlertCircle, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/pengajuan/StatusBadge";

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

const ROLE_LABELS: Record<string, string> = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
  staff_prodi: "Staff Prodi",
  staff_akademik: "Staff Akademik",
  kabag: "Kabag",
  super_admin: "Super Admin",
  kaprodi: "Kaprodi",
  sekprodi: "Sekprodi",
  wakil_dekan_1: "Wakil Dekan 1",
  dekan: "Dekan",
  kepala_lab: "Kepala Lab",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      dosen: true,
      mahasiswa: { include: { prodi: true } },
      pegawai: true,
    },
  });
  if (!user) redirect("/login");

  const baseRole = user.system_role;
  const userName = user.dosen?.nama_lengkap || user.pegawai?.nama_lengkap || user.mahasiswa?.nama_lengkap || user.email;

  // Detect structural position
  let structuralPositions: string[] = [];
  let structuralProdiId: number | null = null;
  if (user.dosen?.id) {
    const positions = await prisma.structuralPosition.findMany({
      where: { dosen_id: user.dosen.id, is_active: true },
    });
    structuralPositions = positions.map(p => p.position_code);
    const prodiPos = positions.find(p => p.prodi_id);
    if (prodiPos) structuralProdiId = prodiPos.prodi_id;
  }
  if (user.pegawai?.id) {
    const positions = await prisma.structuralPosition.findMany({
      where: { pegawai_id: user.pegawai.id, is_active: true },
    });
    structuralPositions = [...structuralPositions, ...positions.map(p => p.position_code)];
    const prodiPos = positions.find(p => p.prodi_id);
    if (!structuralProdiId && prodiPos) structuralProdiId = prodiPos.prodi_id;
  }

  // Effective roles: base role + structural positions
  const effectiveRoles = [baseRole, ...structuralPositions];

  // Determine effective role display
  let displayRole: string = baseRole;
  if (structuralPositions.includes("dekan")) displayRole = "dekan";
  else if (structuralPositions.includes("wakil_dekan_1")) displayRole = "wakil_dekan_1";
  else if (structuralPositions.includes("kepala_lab")) displayRole = "kepala_lab";
  else if (structuralPositions.includes("sekprodi")) displayRole = "sekprodi";
  else if (structuralPositions.includes("kaprodi")) displayRole = "kaprodi";

  // Stats & tasks per effective role
  let stat1 = { label: "Pengajuan Aktif", value: 0 };
  let stat2 = { label: "Menunggu Tindakan", value: 0 };
  let stat3 = { label: "Selesai Bulan Ini", value: 0 };
  let stat4 = { label: "Total", value: 0 };
  let tasks: any[] = [];
  let revisiTasks: any[] = [];
  let taskTitle = "Pengajuan Terbaru";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // MAHASISWA
  if (effectiveRoles.includes("mahasiswa") && user.mahasiswa) {
    const mhsId = user.mahasiswa.id;
    stat1 = { label: "Pengajuan Aktif", value: await prisma.pengajuanLayanan.count({ where: { mahasiswa_id: mhsId, status: { notIn: ["selesai", "terminated"] } } }) };
    stat2 = { label: "Perlu Revisi", value: await prisma.pengajuanLayanan.count({ where: { mahasiswa_id: mhsId, status: "revision_required" } }) };
    stat3 = { label: "Selesai", value: await prisma.pengajuanLayanan.count({ where: { mahasiswa_id: mhsId, status: "selesai" } }) };
    stat4 = { label: "Total", value: await prisma.pengajuanLayanan.count({ where: { mahasiswa_id: mhsId } }) };

    revisiTasks = await prisma.pengajuanLayanan.findMany({
      where: { mahasiswa_id: mhsId, status: "revision_required" },
      include: { jenis_layanan: true, pengajuan_log: { orderBy: { created_at: "desc" }, take: 1 } },
      orderBy: { updated_at: "desc" },
    });
    tasks = await prisma.pengajuanLayanan.findMany({
      where: { mahasiswa_id: mhsId, status: { notIn: ["revision_required", "selesai", "terminated"] } },
      include: { jenis_layanan: true },
      take: 8,
      orderBy: { updated_at: "desc" },
    });
    taskTitle = "Pengajuan Aktif";
  }

  // STAFF PRODI — verifikasi TA-01 through TA-05
  else if (effectiveRoles.includes("staff_prodi")) {
    const taStatuses: any[] = ["pending_staff_prodi"];
    const prodiWhere = structuralProdiId ? { prodi_id: structuralProdiId } : {};
    stat2 = { label: "Menunggu Verifikasi", value: await prisma.pengajuanLayanan.count({ where: { status: { in: taStatuses }, ...prodiWhere } }) };
    stat1 = { label: "Semua Aktif", value: await prisma.pengajuanLayanan.count({ where: { status: { notIn: ["selesai", "terminated"] as any[] }, ...prodiWhere } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth }, ...prodiWhere } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: { in: taStatuses }, ...prodiWhere },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Menunggu Verifikasi";
  }

  // STAFF AKADEMIK — verifikasi AK-01 through AK-07
  else if (effectiveRoles.includes("staff_akademik")) {
    stat2 = { label: "Menunggu Verifikasi", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_staff_akademik" } }) };
    stat1 = { label: "Semua Aktif", value: await prisma.pengajuanLayanan.count({ where: { status: { notIn: ["selesai", "terminated"] } } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth } } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: "pending_staff_akademik" },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Menunggu Verifikasi";
  }

  // KABAG — approval AK
  else if (effectiveRoles.includes("kabag")) {
    stat2 = { label: "Menunggu Approval", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_kabag" } }) };
    stat1 = { label: "Semua AK Aktif", value: await prisma.pengajuanLayanan.count({ where: { jenis_layanan: { kategori: "akademik" }, status: { notIn: ["selesai", "terminated"] } } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth }, jenis_layanan: { kategori: "akademik" } } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: "pending_kabag" },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Menunggu Approval Kabag";
  }

  // KEPALA LAB — TA-06 cek Turnitin
  else if (effectiveRoles.includes("kepala_lab")) {
    stat2 = { label: "Menunggu Review", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_kepala_lab" } }) };
    stat1 = { label: "Semua Turnitin", value: await prisma.pengajuanLayanan.count({ where: { jenis_layanan: { kode: "TA-06" } } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth }, jenis_layanan: { kode: "TA-06" } } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: { in: ["pending_kepala_lab", "revision_required"] }, jenis_layanan: { kode: "TA-06" } },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Turnitin Menunggu Review";
  }

  // DEKAN — TTD final
  else if (effectiveRoles.includes("dekan")) {
    stat2 = { label: "Menunggu TTD", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_dekan" } }) };
    stat1 = { label: "Semua Aktif", value: await prisma.pengajuanLayanan.count({ where: { status: { notIn: ["selesai", "terminated"] } } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth } } }) };
    stat4 = { label: "TTD Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth }, current_step_code: { contains: "dekan" } } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: "pending_dekan" },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Menunggu Tanda Tangan Dekan";
  }

  // WAKIL DEKAN 1 — TTD
  else if (effectiveRoles.includes("wakil_dekan_1")) {
    stat2 = { label: "Menunggu TTD / Approve", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_wd1" } }) };
    stat1 = { label: "Semua Aktif", value: await prisma.pengajuanLayanan.count({ where: { status: { notIn: ["selesai", "terminated"] } } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth } } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: "pending_wd1" },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Menunggu Tindakan WD1";
  }

  // KAPRODI — approve TA-01 judul
  else if (effectiveRoles.includes("kaprodi")) {
    const prodiWhere = structuralProdiId ? { prodi_id: structuralProdiId } : {};
    stat2 = { label: "Menunggu Approve", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_kaprodi", ...prodiWhere } }) };
    stat1 = { label: "TA Aktif", value: await prisma.pengajuanLayanan.count({ where: { jenis_layanan: { kategori: "tugas_akhir" }, status: { notIn: ["selesai", "terminated"] as any[] }, ...prodiWhere } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth }, ...prodiWhere } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: "pending_kaprodi", ...prodiWhere },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10, orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Judul Menunggu Approval Kaprodi";
  }

  // SEKPRODI — set pembimbing / penguji / jadwal
  else if (effectiveRoles.includes("sekprodi")) {
    const prodiWhere = structuralProdiId ? { prodi_id: structuralProdiId } : {};
    stat2 = { label: "Menunggu Tindakan", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_sekprodi", ...prodiWhere } }) };
    stat1 = { label: "TA Aktif", value: await prisma.pengajuanLayanan.count({ where: { jenis_layanan: { kategori: "tugas_akhir" }, status: { notIn: ["selesai", "terminated"] as any[] }, ...prodiWhere } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth }, ...prodiWhere } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: "pending_sekprodi", ...prodiWhere },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10, orderBy: { created_at: "desc" },
    });
    taskTitle = "Pengajuan Menunggu Penetapan Sekprodi";
  }

  // DOSEN (PA) — select judul TA-01
  else if (effectiveRoles.includes("dosen") && user.dosen) {
    const dosenId = user.dosen.id;
    stat2 = { label: "Judul Menunggu Dipilih", value: await prisma.pengajuanLayanan.count({ where: { status: "pending_pa", pengajuan_data: { field_values: { path: ["pa_dosen_id"], equals: dosenId } } } }) };
    stat1 = { label: "Mahasiswa Bimbingan", value: await prisma.assignment.count({ where: { dosen_id: dosenId, is_active: true } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth }, assignments: { some: { dosen_id: dosenId } } } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      where: {
        OR: [
          { status: "pending_pa", pengajuan_data: { field_values: { path: ["pa_dosen_id"], equals: dosenId } } },
          { assignments: { some: { dosen_id: dosenId, is_active: true } }, status: { notIn: ["selesai", "terminated"] } },
        ],
      },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10, orderBy: { updated_at: "desc" },
    });
    taskTitle = "Pengajuan Terkait Anda";
  }

  // SUPER ADMIN — lihat semua
  else {
    stat1 = { label: "Semua Aktif", value: await prisma.pengajuanLayanan.count({ where: { status: { notIn: ["selesai", "terminated"] } } }) };
    stat2 = { label: "Selesai", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai" } }) };
    stat3 = { label: "Selesai Bulan Ini", value: await prisma.pengajuanLayanan.count({ where: { status: "selesai", updated_at: { gte: startOfMonth } } }) };
    stat4 = { label: "Total Users", value: await prisma.user.count({ where: { is_active: true } }) };

    tasks = await prisma.pengajuanLayanan.findMany({
      include: { mahasiswa: true, jenis_layanan: true },
      take: 15,
      orderBy: { updated_at: "desc" },
    });
    taskTitle = "Semua Pengajuan Terbaru";
  }

  // Role badge chips for multi-hat users
  const roleBadges: string[] = [];
  if (structuralPositions.includes("dekan")) roleBadges.push("Dekan");
  if (structuralPositions.includes("wakil_dekan_1")) roleBadges.push("Wakil Dekan I");
  if (structuralPositions.includes("kaprodi")) roleBadges.push("Kaprodi");
  if (structuralPositions.includes("sekprodi")) roleBadges.push("Sekprodi");
  if (structuralPositions.includes("kepala_lab")) roleBadges.push("Kepala Lab");
  if (baseRole === "dosen" && roleBadges.length > 0) roleBadges.push("Dosen PA");
  if (baseRole === "mahasiswa") roleBadges.push("Mahasiswa");
  if (baseRole === "staff_prodi") roleBadges.push("Staff Prodi");
  if (baseRole === "staff_akademik") roleBadges.push("Staff Akademik");
  if (baseRole === "kabag") roleBadges.push("Kabag");
  if (baseRole === "super_admin") roleBadges.push("Super Admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Halo, {userName}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {roleBadges.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {label}
            </span>
          ))}
          {effectiveRoles.includes("mahasiswa") && user.mahasiswa?.prodi && (
            <span className="text-xs text-muted-foreground">· {user.mahasiswa.prodi.nama}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label={stat1.label} value={stat1.value} icon={FileText} />
        <StatCard label={stat2.label} value={stat2.value} icon={Clock} />
        <StatCard label={stat3.label} value={stat3.value} icon={CheckCircle} />
        <StatCard label={stat4.label} value={stat4.value} icon={Users} />
      </div>

      {/* Perlu Tindakan — hanya untuk mahasiswa yang punya revisi */}
      {revisiTasks.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-destructive">
            <AlertCircle className="h-5 w-5" />
            Perlu Tindakan Anda ({revisiTasks.length})
          </h2>
          <div className="space-y-2">
            {revisiTasks.map((t) => (
              <Link key={t.id} href={`/pengajuan/${t.id}`}>
                <Card className="border-destructive/30 bg-destructive/5 transition-shadow hover:shadow-md">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm">
                          {t.kode_pengajuan} · {t.jenis_layanan?.nama}
                        </CardTitle>
                        {t.pengajuan_log?.[0]?.alasan && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            Alasan: {t.pengajuan_log[0].alasan}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">
                          Perlu Revisi
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">{taskTitle}</h2>
          <div className="space-y-2">
            {tasks.map((t) => (
              <Link key={t.id} href={`/pengajuan/${t.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm truncate">
                          {t.kode_pengajuan} · {t.jenis_layanan?.nama}
                        </CardTitle>
                        {t.mahasiswa && (
                          <p className="text-xs text-muted-foreground">
                            {t.mahasiswa.nama_lengkap} ({t.mahasiswa.nim})
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={t.status} />
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && revisiTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Belum ada pengajuan</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {effectiveRoles.includes("mahasiswa")
              ? "Ajukan layanan akademik melalui menu Pengajuan."
              : "Belum ada pengajuan yang memerlukan tindakan Anda."}
          </p>
        </div>
      )}
    </div>
  );
}
