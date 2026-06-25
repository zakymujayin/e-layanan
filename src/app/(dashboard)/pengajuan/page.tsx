import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/pengajuan/StatusBadge";
import Link from "next/link";
import { Plus, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DataTable } from "@/components/shared/data-table";
import { PageContainer } from "@/components/shared/page-container";
import { TableRow, TableCell } from "@/components/ui/table";

interface PageProps {
  searchParams: Promise<{ status?: string; kode?: string; q?: string; period?: string; prodi?: string }>;
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
    include: { dosen: true, mahasiswa: { include: { prodi: true } }, pegawai: true },
  });
  if (!user) redirect("/login");

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

  const filterWhere: any = {};
  if (filters.status) filterWhere.status = filters.status;
  if (filters.kode) filterWhere.jenis_layanan = { kode: filters.kode };
  if (semesterIdParam) filterWhere.academic_period_id = Number(semesterIdParam);
  if (filters.prodi) filterWhere.prodi_id = Number(filters.prodi);
  if (filters.q) {
    filterWhere.OR = [
      { kode_pengajuan: { contains: filters.q, mode: "insensitive" } },
      { mahasiswa: { nama_lengkap: { contains: filters.q, mode: "insensitive" } } },
      { mahasiswa: { nim: { contains: filters.q } } },
    ];
  }

  const pengajuanList = await prisma.pengajuanLayanan.findMany({
    where: { ...scopeWhere, ...filterWhere },
    include: { jenis_layanan: true, mahasiswa: { include: { prodi: true } } },
    orderBy: { updated_at: "desc" },
    take: 50,
  });

  const [layananList, periodList, prodiList] = await Promise.all([
    prisma.jenisLayanan.findMany({ where: { is_active: true }, orderBy: { kode: "asc" }, select: { kode: true, nama: true } }),
    prisma.academicPeriod.findMany({ orderBy: { tanggal_mulai: "desc" }, take: 8, select: { id: true, nama_semester: true, tahun_akademik: true } }),
    prisma.prodi.findMany({ where: { is_active: true }, orderBy: { nama: "asc" } }),
  ]);

  const STATUS_OPTIONS = [
    "pending_staff_prodi", "pending_pa", "pending_kaprodi", "pending_wd1",
    "pending_sekprodi", "pending_dekan", "pending_staff_akademik",
    "pending_kabag", "pending_kepala_lab", "revision_required",
    "selesai", "terminated",
  ];

  const hasFilters = filters.status || filters.kode || filters.q || filters.period || filters.prodi;

  const emptyMessage = isMahasiswa
    ? "Ajukan layanan akademik baru melalui tombol Pengajuan Baru di atas."
    : "Belum ada pengajuan yang masuk dalam scope Anda saat ini.";

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pengajuan</h1>
          <p className="text-muted-foreground text-sm">
            {pengajuanList.length} pengajuan{hasFilters ? " (difilter)" : ""}
          </p>
        </div>
        {isMahasiswa && (
          <Link href="/pengajuan/baru" className={cn(buttonVariants(), "gap-2")}>
            <Plus className="h-4 w-4" />
            Pengajuan Baru
          </Link>
        )}
      </div>

      <form method="GET" className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              placeholder="Cari nama / kode pengajuan..."
              defaultValue={filters.q ?? ""}
              className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[170px]"
          >
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <select
            name="kode"
            defaultValue={filters.kode ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[180px]"
          >
            <option value="">Semua Layanan</option>
            {layananList.map(l => (
              <option key={l.kode} value={l.kode}>{l.kode} · {l.nama}</option>
            ))}
          </select>
          <select
            name="prodi"
            defaultValue={filters.prodi ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[180px]"
          >
            <option value="">Semua Prodi</option>
            {prodiList.map(p => (
              <option key={p.id} value={String(p.id)}>{p.nama}</option>
            ))}
          </select>
          {periodList.length > 0 && (
            <select
              name="period"
              defaultValue={filters.period ?? ""}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-[180px]"
            >
              <option value="">Semua Semester</option>
              {periodList.map(p => (
                <option key={p.id} value={String(p.id)}>{p.nama_semester} {p.tahun_akademik}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
          {hasFilters && (
            <Link href="/pengajuan" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-9 gap-1")}>
              <X className="h-3.5 w-3.5" />
              Reset
            </Link>
          )}
        </div>
      </form>

      <DataTable
        columns={["Kode", "Layanan", "Mahasiswa", "Prodi", "Status"]}
        dataLength={pengajuanList.length}
        emptyMessage={emptyMessage}
      >
        {pengajuanList.map(p => (
          <Link key={p.id} href={`/pengajuan/${p.id}`} className="contents">
            <TableRow className="cursor-pointer hover:bg-muted/50 group">
              <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                {p.kode_pengajuan}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">{p.jenis_layanan?.kode}</Badge>
                  <span className="text-sm font-medium truncate max-w-[200px]">{p.jenis_layanan?.nama}</span>
                </div>
              </TableCell>
              <TableCell>
                {!isMahasiswa && p.mahasiswa ? (
                  <div>
                    <p className="text-sm font-medium">{p.mahasiswa.nama_lengkap}</p>
                    <p className="text-xs text-muted-foreground">{p.mahasiswa.nim}</p>
                  </div>
                ) : isMahasiswa ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : null}
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium">{p.mahasiswa?.prodi?.nama ?? "—"}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <StatusBadge status={p.status} />
                  <span className="text-[10px] text-muted-foreground">
                    {format(p.updated_at, "d MMM yyyy", { locale: idLocale })}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </Link>
        ))}
      </DataTable>

      {pengajuanList.length === 0 && isMahasiswa && (
        <div className="flex justify-center">
          <Link href="/pengajuan/baru" className={cn(buttonVariants(), "gap-2")}>
            <Plus className="h-4 w-4" />
            Pengajuan Baru
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
