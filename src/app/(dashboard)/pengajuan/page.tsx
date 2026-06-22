import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/pengajuan/StatusBadge";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface PageProps {
  searchParams: Promise<{ status?: string; kode?: string; q?: string; period?: string }>;
}

export default async function PengajuanListPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const filters = await searchParams;

  const cookieStore = await cookies();
  const cookieSemesterId = cookieStore.get("selected_semester_id")?.value;
  const semesterIdParam = filters.period ?? cookieSemesterId ?? null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      dosen: true,
      mahasiswa: { include: { prodi: true } },
      pegawai: true,
    },
  });
  if (!user) redirect("/login");

  // Determine scope (same pattern as dashboard)
  const baseRole = user.system_role;
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

  const effectiveRoles = [baseRole, ...structuralPositions];
  const isMahasiswa = effectiveRoles.includes("mahasiswa");

  // Build where clause based on scope
  let scopeWhere: any = {};

  if (isMahasiswa && user.mahasiswa) {
    scopeWhere = { mahasiswa_id: user.mahasiswa.id };
  } else if (effectiveRoles.includes("staff_prodi")) {
    scopeWhere = structuralProdiId ? { prodi_id: structuralProdiId } : { scope_level: "prodi" };
  } else if (effectiveRoles.includes("staff_akademik") || effectiveRoles.includes("kabag")) {
    scopeWhere = { scope_level: "fakultas" };
  } else if (effectiveRoles.includes("kepala_lab")) {
    scopeWhere = { jenis_layanan: { kode: "TA-06" } };
  } else if (
    effectiveRoles.includes("dosen") && user.dosen &&
    !effectiveRoles.some(r => ["kaprodi", "sekprodi", "wakil_dekan_1", "dekan"].includes(r))
  ) {
    scopeWhere = {
      OR: [
        { pengajuan_data: { field_values: { path: ["pa_dosen_id"], equals: user.dosen.id } } },
        { assignments: { some: { dosen_id: user.dosen.id, is_active: true } } },
      ],
    };
  }
  // kaprodi, sekprodi, WD1, dekan, super_admin: see all

  // Apply user filters
  const filterWhere: any = {};
  if (filters.status) filterWhere.status = filters.status;
  if (filters.kode) filterWhere.jenis_layanan = { kode: filters.kode };
  if (semesterIdParam) filterWhere.academic_period_id = Number(semesterIdParam);
  if (filters.q) {
    filterWhere.OR = [
      { kode_pengajuan: { contains: filters.q, mode: "insensitive" } },
      { mahasiswa: { nama_lengkap: { contains: filters.q, mode: "insensitive" } } },
      { mahasiswa: { nim: { contains: filters.q } } },
    ];
  }

  const pengajuanList = await prisma.pengajuanLayanan.findMany({
    where: { ...scopeWhere, ...filterWhere },
    include: {
      jenis_layanan: true,
      mahasiswa: true,
    },
    orderBy: { updated_at: "desc" },
    take: 50,
  });

  const [layananList, periodList] = await Promise.all([
    prisma.jenisLayanan.findMany({ where: { is_active: true }, orderBy: { kode: "asc" }, select: { kode: true, nama: true } }),
    prisma.academicPeriod.findMany({ orderBy: { tanggal_mulai: "desc" }, take: 8, select: { id: true, nama_semester: true, tahun_akademik: true } }),
  ]);

  const STATUS_OPTIONS = [
    "pending_staff_prodi", "pending_pa", "pending_kaprodi", "pending_wd1",
    "pending_sekprodi", "pending_dekan", "pending_staff_akademik",
    "pending_kabag", "pending_kepala_lab", "revision_required",
    "selesai", "terminated",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pengajuan</h1>
          <p className="text-muted-foreground">
            {pengajuanList.length} pengajuan ditemukan
          </p>
        </div>
        {isMahasiswa && (
          <Link href="/pengajuan/baru" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Pengajuan Baru
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <form method="GET" className="flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          type="text"
          name="q"
          placeholder="Cari nama / kode pengajuan..."
          defaultValue={filters.q ?? ""}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto min-w-[160px] sm:min-w-0"
        />
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto min-w-[160px]"
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          name="kode"
          defaultValue={filters.kode ?? ""}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto min-w-[160px]"
        >
          <option value="">Semua Layanan</option>
          {layananList.map(l => (
            <option key={l.kode} value={l.kode}>{l.kode} — {l.nama}</option>
          ))}
        </select>
        {periodList.length > 0 && (
            <select
              name="period"
              defaultValue={filters.period ?? ""}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto min-w-[160px]"
            >
            <option value="">Semua Semester</option>
            {periodList.map(p => (
              <option key={p.id} value={String(p.id)}>{p.nama_semester} {p.tahun_akademik}</option>
            ))}
          </select>
        )}
        <Button type="submit" variant="outline" size="sm" className="h-9">
          Filter
        </Button>
        {(filters.status || filters.kode || filters.q || filters.period) && (
          <Link href="/pengajuan" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9")}>
            Reset
          </Link>
        )}
      </form>

      {/* List */}
      {pengajuanList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Tidak ada pengajuan</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMahasiswa ? "Mulai pengajuan baru melalui tombol di atas." : "Tidak ada pengajuan dalam scope Anda saat ini."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pengajuanList.map((p) => (
            <Link key={p.id} href={`/pengajuan/${p.id}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 text-xs font-mono">
                          {p.jenis_layanan?.kode}
                        </Badge>
                        <CardTitle className="truncate text-sm">
                          {p.jenis_layanan?.nama}
                        </CardTitle>
                      </div>
                      {!isMahasiswa && p.mahasiswa && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {p.mahasiswa.nama_lengkap} · {p.mahasiswa.nim}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.kode_pengajuan} · {format(p.updated_at, "d MMM yyyy, HH:mm", { locale: idLocale })}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
