import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Archive, Download, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function ArsipPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dosen: true, mahasiswa: true, pegawai: true },
  });
  if (!user) redirect("/login");

  const baseRole = user.system_role;
  let structuralPositions: string[] = [];

  if (user.dosen?.id) {
    const positions = await prisma.structuralPosition.findMany({
      where: { dosen_id: user.dosen.id, is_active: true },
    });
    structuralPositions = positions.map((p) => p.position_code);
  }

  const effectiveRoles = [baseRole, ...structuralPositions];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pengajuanWhere: any = { status: "selesai" };

  if (effectiveRoles.includes("mahasiswa") && user.mahasiswa) {
    pengajuanWhere.mahasiswa_id = user.mahasiswa.id;
  } else if (
    effectiveRoles.includes("dosen") &&
    user.dosen &&
    !effectiveRoles.some((r) =>
      ["kaprodi", "sekprodi", "wakil_dekan_1", "dekan"].includes(r)
    )
  ) {
    pengajuanWhere.assignments = {
      some: { dosen_id: user.dosen.id, is_active: true },
    };
  } else if (effectiveRoles.includes("staff_prodi")) {
    pengajuanWhere.scope_level = "prodi";
  } else if (
    effectiveRoles.includes("staff_akademik") ||
    effectiveRoles.includes("kabag")
  ) {
    pengajuanWhere.scope_level = "fakultas";
  }
  // WD1, Dekan, super_admin: semua selesai

  const selesaiList = await prisma.pengajuanLayanan.findMany({
    where: pengajuanWhere,
    include: {
      jenis_layanan: true,
      mahasiswa: true,
      dokumen_output: {
        where: { is_final: true },
        include: { dokumen_verifikasi: true },
        orderBy: { finalized_at: "desc" },
      },
    },
    orderBy: { completed_at: "desc" },
    take: 100,
  });

  const isMahasiswa = effectiveRoles.includes("mahasiswa");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Arsip Dokumen</h1>
        <p className="text-muted-foreground">
          {selesaiList.length} layanan selesai · Hanya dokumen final yang
          ditampilkan
        </p>
      </div>

      {selesaiList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Archive className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Belum ada arsip dokumen</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Dokumen akan muncul di sini setelah pengajuan selesai diproses.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {selesaiList.map((p) => {
            const docs = p.dokumen_output;
            const dateStr = p.completed_at
              ? format(p.completed_at, "d MMMM yyyy", { locale: idLocale })
              : "";

            if (docs.length > 0) {
              return docs.map((dok) => (
                <Card key={dok.id}>
                  <CardHeader className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-xs font-mono shrink-0"
                          >
                            {p.jenis_layanan?.kode}
                          </Badge>
                          <CardTitle className="text-sm truncate">
                            {dok.jenis_dokumen}
                          </CardTitle>
                        </div>
                        {!isMahasiswa && p.mahasiswa && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {p.mahasiswa.nama_lengkap} · {p.mahasiswa.nim}
                          </p>
                        )}
                        {dok.nomor_surat && (
                          <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                            {dok.nomor_surat}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {dateStr}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dok.dokumen_verifikasi && (
                          <Link
                            href={`/verifikasi?token=${dok.dokumen_verifikasi.token}`}
                            target="_blank"
                            title="Verifikasi"
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" })
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/api/pengajuan/${p.id}/pdf?mode=final&jenis=${
                            dok.jenis_dokumen === "Surat Tugas"
                              ? "surat_tugas"
                              : "berita_acara"
                          }`}
                          target="_blank"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" })
                          )}
                        >
                          <Download className="mr-1.5 h-4 w-4" />
                          Unduh
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ));
            }

            // Fallback: data lama tanpa DokumenOutput tersimpan
            return (
              <Card key={`p-${p.id}`}>
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono shrink-0"
                        >
                          {p.jenis_layanan?.kode}
                        </Badge>
                        <CardTitle className="text-sm truncate">
                          {p.jenis_layanan?.nama}
                        </CardTitle>
                      </div>
                      {!isMahasiswa && p.mahasiswa && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {p.mahasiswa.nama_lengkap} · {p.mahasiswa.nim}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {dateStr}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Link
                        href={`/api/pengajuan/${p.id}/pdf?mode=final`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" })
                        )}
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Unduh
                      </Link>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
