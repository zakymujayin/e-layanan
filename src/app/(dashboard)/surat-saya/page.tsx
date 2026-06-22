import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/pengajuan/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const ASSIGNMENT_GROUPS = [
  {
    key: "pa",
    label: "Pembimbing Akademik",
    types: ["dosen_pa"],
    description: "Mahasiswa bimbingan Anda",
  },
  {
    key: "pembimbing",
    label: "Pembimbing Skripsi",
    types: ["pembimbing_skripsi_1", "pembimbing_skripsi_2"],
    description: "Pengajuan SK Pembimbing yang melibatkan Anda",
  },
  {
    key: "penguji",
    label: "Penguji",
    types: ["penguji_proposal", "penguji_komprehensif_prodi", "penguji_komprehensif_keislaman", "penguji_skripsi"],
    description: "Seminar / sidang di mana Anda menjadi penguji",
  },
  {
    key: "majelis",
    label: "Majelis Sidang",
    types: ["ketua_sidang", "sekretaris_sidang"],
    description: "Sidang munaqasyah di mana Anda menjadi Ketua/Sekretaris",
  },
] as const;

const ASSIGNMENT_LABELS: Record<string, string> = {
  dosen_pa: "PA",
  pembimbing_skripsi_1: "Pembimbing 1",
  pembimbing_skripsi_2: "Pembimbing 2",
  penguji_proposal: "Penguji Proposal",
  penguji_komprehensif_prodi: "Penguji Komprehensif",
  penguji_komprehensif_keislaman: "Penguji Keislaman",
  penguji_skripsi: "Penguji Skripsi",
  ketua_sidang: "Ketua Sidang",
  sekretaris_sidang: "Sekretaris Sidang",
};

export default async function SuratSayaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dosen: true },
  });
  if (!user || !user.dosen) redirect("/dashboard");

  const dosenId = user.dosen.id;

  const allAssignments = await prisma.assignment.findMany({
    where: { dosen_id: dosenId },
    include: {
      pengajuan: {
        include: {
          jenis_layanan: true,
          mahasiswa: true,
          dokumen_output: {
            where: { is_final: true },
            orderBy: { finalized_at: "desc" },
          },
        },
      },
      mahasiswa: true,
    },
    orderBy: { created_at: "desc" },
  });

  function getGroupItems(types: readonly string[]) {
    return allAssignments.filter(a => types.includes(a.assignment_type));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat & SK Saya</h1>
        <p className="text-muted-foreground">
          Daftar pengajuan yang melibatkan Anda sebagai dosen
        </p>
      </div>

      <Tabs defaultValue="pa">
        <TabsList className="flex-wrap h-auto gap-1 overflow-x-auto">
          {ASSIGNMENT_GROUPS.map(group => (
            <TabsTrigger key={group.key} value={group.key} className="text-xs">
              {group.label}
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                {getGroupItems(group.types).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {ASSIGNMENT_GROUPS.map(group => {
          const items = getGroupItems(group.types);
          return (
            <TabsContent key={group.key} value={group.key} className="mt-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Belum ada data</p>
                </div>
              ) : (
                items.map(assignment => {
                  const mhs = assignment.mahasiswa ?? assignment.pengajuan?.mahasiswa;
                  const pengajuan = assignment.pengajuan;
                  return (
                    <Card key={assignment.id}>
                      <CardHeader className="py-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs shrink-0">
                                {ASSIGNMENT_LABELS[assignment.assignment_type] ?? assignment.assignment_type}
                              </Badge>
                              {pengajuan && (
                                <CardTitle className="text-sm truncate">
                                  {pengajuan.jenis_layanan?.nama}
                                </CardTitle>
                              )}
                            </div>
                            {mhs && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {mhs.nama_lengkap} · {mhs.nim}
                              </p>
                            )}
                            {pengajuan && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {format(assignment.created_at, "d MMM yyyy", { locale: idLocale })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            {pengajuan && <StatusBadge status={pengajuan.status} />}
                            {pengajuan && pengajuan.status === "selesai" &&
                              pengajuan.dokumen_output &&
                              pengajuan.dokumen_output.length > 0
                              ? pengajuan.dokumen_output.map((dok) => (
                                  <Link
                                    key={dok.id}
                                    href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final&jenis=${
                                      dok.jenis_dokumen === "Surat Tugas"
                                        ? "surat_tugas"
                                        : "berita_acara"
                                    }`}
                                    target="_blank"
                                    className={buttonVariants({ variant: "outline", size: "sm" })}
                                  >
                                    <Download className="mr-1.5 h-4 w-4" />
                                    {dok.jenis_dokumen === "Surat Tugas"
                                      ? "Surat Tugas"
                                      : "Berita Acara"}
                                  </Link>
                                ))
                              : pengajuan && pengajuan.status === "selesai"
                              ? (
                                  <Link
                                    href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final`}
                                    target="_blank"
                                    className={buttonVariants({ variant: "outline", size: "sm" })}
                                  >
                                    <Download className="mr-1.5 h-4 w-4" />
                                    Unduh
                                  </Link>
                                )
                              : null}
                            {pengajuan && (
                              <Link
                                href={`/pengajuan/${pengajuan.id}`}
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                              >
                                Lihat
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
