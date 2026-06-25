import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessPengajuan } from "@/lib/auth/check";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/pengajuan/StatusBadge";
import { ProgressBar } from "@/components/pengajuan/ProgressBar";
import { ActivityTimeline } from "@/components/pengajuan/ActivityTimeline";
import { ActionButtons } from "@/components/workflow/ActionButtons";
import { PembimbingPicker } from "@/components/workflow/PembimbingPicker";
import { JadwalSidangInput } from "@/components/workflow/JadwalSidangInput";
import { PengujiPicker } from "@/components/workflow/PengujiPicker";
import { PengujiKomprehensifPicker } from "@/components/workflow/PengujiKomprehensifPicker";
import { ResubmitForm } from "@/components/workflow/ResubmitForm";
import { MajelisPicker } from "@/components/workflow/MajelisPicker";
import { NilaiSemproInput } from "@/components/workflow/NilaiSemproInput";
import { NilaiKomprehensifInput } from "@/components/workflow/NilaiKomprehensifInput";
import { NilaiMunaqasyahInput } from "@/components/workflow/NilaiMunaqasyahInput";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";

export default async function PengajuanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ versi?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = Number(session.user.id);

  const { id } = await params;
  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: Number(id) },
    include: {
      jenis_layanan: true,
      mahasiswa: { include: { prodi: true } },
      pengajuan_data: true,
      pengajuan_dokumen: { include: { dokumen_persyaratan: true }, orderBy: { di_upload_pada: "asc" } },
    },
  });

  if (!pengajuan) notFound();

  const canAccess = await canAccessPengajuan(userId, pengajuan.id);
  if (!canAccess) notFound();

  // Fetch version history
  const versions = await prisma.pengajuanVersi.findMany({
    where: { pengajuan_id: pengajuan.id },
    orderBy: { versi_ke: "asc" },
    select: { versi_ke: true, data_snapshot: true, dibuat_pada: true },
  });

  const sp = searchParams ? await searchParams : {};
  const selectedVersi = sp.versi ? Number(sp.versi) : null;
  const activeSnapshot = selectedVersi
    ? (versions.find(v => v.versi_ke === selectedVersi)?.data_snapshot as Record<string, unknown> | null ?? null)
    : null;

  const currentStep = pengajuan.current_step_code
    ? await prisma.workflowStep.findFirst({
        where: { workflow_definition_id: pengajuan.workflow_definition_id, step_code: pengajuan.current_step_code },
        include: { actions: true },
      })
    : null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dosen: true, mahasiswa: true },
  });

  const userAssignments = user?.dosen
    ? await prisma.assignment.findMany({
        where: { pengajuan_id: pengajuan.id, dosen_id: user.dosen.id, is_active: true },
      })
    : [];

  const isPengujiProposal = userAssignments.some(a => a.assignment_type === "penguji_proposal");
  const isPengujiKomprehensif = userAssignments.some(a =>
    ["penguji_komprehensif_prodi", "penguji_komprehensif_keislaman"].includes(a.assignment_type)
  );
  const isSekretarisSidang = userAssignments.some(a => a.assignment_type === "sekretaris_sidang");

  const dokumenOutputs =
    pengajuan.status === "selesai"
      ? await prisma.dokumenOutput.findMany({
          where: { pengajuan_id: pengajuan.id, is_final: true },
          select: { jenis_dokumen: true, file_path_final: true },
        })
      : [];

  const hasSuratTugas = dokumenOutputs.some((d) => d.jenis_dokumen === "Surat Tugas");
  const hasBeritaAcara = dokumenOutputs.some((d) => d.jenis_dokumen === "Berita Acara dan Nilai");

  const isPA = pengajuan.pengajuan_data?.field_values
    ? (pengajuan.pengajuan_data.field_values as any).pa_dosen_id === user?.dosen?.id
    : false;

  const fieldValues = pengajuan.pengajuan_data?.field_values as Record<string, unknown> | null;
  const judulCount = fieldValues
    ? Object.keys(fieldValues).filter((k) => k.startsWith("judul_") && fieldValues[k] && !k.startsWith("judul_skripsi")).length
    : 0;
  const kode = pengajuan.jenis_layanan.kode;
  const isAk = kode.startsWith("AK-");

  const displayFields = isAk
    ? ["peruntukan", "orang_tua_pns", "nama_orang_tua", "nip_orang_tua", "pangkat_golongan", "jabatan_orang_tua", "instansi_orang_tua", "hubungan_orang_tua", "mata_kuliah", "pejabat_tujuan", "instansi_tujuan", "lokasi_observasi", "tanggal_mulai", "tanggal_selesai", "dosen_pembimbing_observasi_id", "judul_penelitian", "lokasi_penelitian", "tujuan_penelitian", "alamat_instansi", "bidang_magang", "dosen_pembimbing_magang_id", "tujuan_rekomendasi", "pihak_penerima", "tipe_rekomendasi"]
    : ["submission_id_turnitin", "url_turnitin", "similarity_percentage"];
  const akFields = fieldValues ? Object.entries(fieldValues).filter(([k]) => displayFields.includes(k) && fieldValues[k]) : [];
  const taFields = fieldValues ? Object.entries(fieldValues).filter(([k]) => displayFields.includes(k) && fieldValues[k]) : [];

  return (
    <PageContainer className="space-y-6">
      <div>
        <Link href="/pengajuan"><Button variant="ghost" size="sm">← Kembali ke Daftar Pengajuan</Button></Link>
      </div>

      {/* Header Card */}
      <Card className="rounded-xl border shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="min-w-0">
              <Badge variant="outline" className="mb-2 font-mono text-xs">{pengajuan.jenis_layanan.kode}</Badge>
              <h1 className="text-xl font-bold">{pengajuan.jenis_layanan.nama}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {pengajuan.kode_pengajuan} · Diajukan {new Date(pengajuan.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>
            <StatusBadge status={pengajuan.status} />
          </div>
          <div className="pt-4 border-t">
            <ProgressBar workflowDefinitionId={pengajuan.workflow_definition_id} currentStepCode={pengajuan.current_step_code} />
          </div>
        </CardContent>
      </Card>

      {versions.length > 1 && (
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-xs text-muted-foreground shrink-0">Versi:</span>
          {versions.map(v => (
            <Link
              key={v.versi_ke}
              href={`/pengajuan/${pengajuan.id}?versi=${v.versi_ke}`}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                selectedVersi === v.versi_ke
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-border"
              }`}
            >
              v{v.versi_ke}
            </Link>
          ))}
          {selectedVersi && (
            <Link
              href={`/pengajuan/${pengajuan.id}`}
              className="text-xs text-muted-foreground hover:underline"
            >
              (lihat terkini)
            </Link>
          )}
        </div>
      )}

      {/* 60/40 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT — 60% (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Data Pengajuan Card */}
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Data Pengajuan</h3>
              {activeSnapshot && (
                <div className="rounded-lg border border-dashed bg-muted/30 p-4 mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Data Versi {selectedVersi} (baca saja)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                    {Object.entries(activeSnapshot)
                      .filter(([, v]) => v !== null && v !== undefined && v !== "")
                      .map(([k, v]) => (
                        <p key={k} className="text-muted-foreground truncate">
                          <span className="font-medium">{k.replace(/_/g, " ")}:</span> {String(v)}
                        </p>
                      ))}
                  </div>
                </div>
              )}
              {fieldValues && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-sm">
                  {isAk && akFields.map(([k, v]) => (
                    <p key={k} className="text-muted-foreground truncate">{k.replace(/_/g, " ")}: {String(v ?? "")}</p>
                  ))}
                  {!isAk && taFields.map(([k, v]) => (
                    <p key={k} className="text-muted-foreground truncate">{k.replace(/_/g, " ")}: {String(v ?? "")}</p>
                  ))}
                  {!isAk && fieldValues && Object.entries(fieldValues)
                    .filter(([k]) => k.startsWith("judul_") && fieldValues[k] && k !== "judul_skripsi")
                    .map(([k, v]) => (
                      <p key={k} className="text-muted-foreground truncate">{k.replace(/_/g, " ")}: {String(v)}</p>
                    ))}
                  {String(fieldValues.judul_skripsi ?? "") && (
                    <p className="text-muted-foreground truncate">Judul Skripsi: {String(fieldValues.judul_skripsi)}</p>
                  )}
                  {String(fieldValues.pa_dosen_id ?? "") && (
                    <p className="text-xs text-muted-foreground">PA Dosen ID: {String(fieldValues.pa_dosen_id)}</p>
                  )}
                  {isAk && !akFields.length && !fieldValues.judul_skripsi && fieldValues.pa_dosen_id === undefined && (
                    <p className="text-xs text-muted-foreground italic col-span-full">Belum ada data input</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dokumen Card */}
          {pengajuan.pengajuan_dokumen.length > 0 && (
            <Card className="rounded-xl border shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dokumen ({pengajuan.pengajuan_dokumen.length})</h3>
                <div className="space-y-3">
                  {pengajuan.pengajuan_dokumen.map((dok) => (
                    <div key={dok.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-3 gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-sm min-w-0">
                        <span className="font-medium truncate">{dok.dokumen_persyaratan?.nama_dokumen ?? dok.file_name}</span>
                        {dok.is_auto_attached && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">Auto</span>
                        )}
                        <span className="text-muted-foreground text-xs shrink-0">({(dok.file_size_bytes / 1024).toFixed(0)} KB)</span>
                      </div>
                      <a
                        href={`/api/files/${dok.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline shrink-0"
                      >
                        Lihat
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Riwayat Card */}
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Riwayat Aktivitas</h3>
              <ActivityTimeline pengajuanId={pengajuan.id} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — 40% (2/5) — STICKY */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20 self-start">
          {currentStep && currentStep.actions.length > 0 && (
            <ActionButtons
              pengajuanId={pengajuan.id}
              actions={currentStep.actions}
              isPA={isPA}
              judulCount={judulCount}
            />
          )}

          {kode === "TA-02" && pengajuan.status === "pending_sekprodi" && (
            <PembimbingPicker pengajuanId={pengajuan.id} />
          )}

          {kode === "TA-03" && pengajuan.status === "pending_staff_prodi" && (
            <JadwalSidangInput pengajuanId={pengajuan.id} actionLabel="Verifikasi & Simpan Jadwal" />
          )}

          {kode === "TA-03" && pengajuan.status === "pending_sekprodi" && (
            <PengujiPicker pengajuanId={pengajuan.id} />
          )}

          {kode === "TA-04" && pengajuan.status === "pending_staff_prodi" && (
            <JadwalSidangInput pengajuanId={pengajuan.id} actionLabel="Verifikasi & Simpan Jadwal Komprehensif" />
          )}

          {kode === "TA-04" && pengajuan.status === "pending_sekprodi" && (
            <PengujiKomprehensifPicker pengajuanId={pengajuan.id} />
          )}

          {pengajuan.status === "revision_required" && (
            <ResubmitForm pengajuanId={pengajuan.id} layananKode={kode} />
          )}

          {kode === "TA-05" && pengajuan.status === "pending_sekprodi" && (
            <MajelisPicker pengajuanId={pengajuan.id} />
          )}

          {kode === "TA-03" && pengajuan.status === "selesai" && isPengujiProposal && (
            <NilaiSemproInput pengajuanId={pengajuan.id} />
          )}

          {kode === "TA-04" && pengajuan.status === "selesai" && isPengujiKomprehensif && (
            <NilaiKomprehensifInput pengajuanId={pengajuan.id} />
          )}

          {kode === "TA-05" && pengajuan.status === "selesai" && isSekretarisSidang && (
            <NilaiMunaqasyahInput pengajuanId={pengajuan.id} />
          )}

          {/* PDF Actions Card */}
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dokumen Output</h3>
              <div className="flex flex-col gap-2">
                {pengajuan.status !== "selesai" ? (
                  <Link href={`/api/pengajuan/${pengajuan.id}/pdf?mode=preview`} target="_blank">
                    <Button variant="outline" className="w-full" type="button">Pratinjau PDF</Button>
                  </Link>
                ) : (
                  <>
                    {hasSuratTugas && (
                      <Link href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final&jenis=surat_tugas`} className="w-full">
                        <Button variant="outline" className="w-full" type="button">Unduh Surat Tugas</Button>
                      </Link>
                    )}
                    {hasBeritaAcara && (
                      <Link href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final&jenis=berita_acara`} className="w-full">
                        <Button className="w-full" type="button">Unduh Berita Acara & Nilai</Button>
                      </Link>
                    )}
                    {!hasSuratTugas && !hasBeritaAcara && (
                      <Link href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final`} className="w-full">
                        <Button className="w-full" type="button">Unduh PDF Final</Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
