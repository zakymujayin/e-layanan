import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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

export default async function PengajuanDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/pengajuan"><Button variant="outline" size="sm">Kembali</Button></Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{pengajuan.jenis_layanan.nama}</h1>
          <p className="text-muted-foreground">
            {pengajuan.kode_pengajuan} · Diajukan {new Date(pengajuan.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
        <StatusBadge status={pengajuan.status} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Progress:</span>
        <ProgressBar workflowDefinitionId={pengajuan.workflow_definition_id} currentStepCode={pengajuan.current_step_code} />
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Data Pengajuan</h3>
        {fieldValues && (
          <div className="space-y-1 text-sm">
            {isAk && akFields.map(([k, v]) => (
              <p key={k} className="text-muted-foreground">{k.replace(/_/g, " ")}: {String(v ?? "")}</p>
            ))}
            {!isAk && taFields.map(([k, v]) => (
              <p key={k} className="text-muted-foreground">{k.replace(/_/g, " ")}: {String(v ?? "")}</p>
            ))}
            {!isAk && fieldValues && Object.entries(fieldValues)
              .filter(([k]) => k.startsWith("judul_") && fieldValues[k] && k !== "judul_skripsi")
              .map(([k, v]) => (
                <p key={k} className="text-muted-foreground">{k.replace(/_/g, " ")}: {String(v)}</p>
              ))}
            {String(fieldValues.judul_skripsi ?? "") && (
              <p className="text-muted-foreground">Judul Skripsi: {String(fieldValues.judul_skripsi)}</p>
            )}
            {String(fieldValues.pa_dosen_id ?? "") && (
              <p className="text-xs text-muted-foreground">PA Dosen ID: {String(fieldValues.pa_dosen_id)}</p>
            )}
            {isAk && !akFields.length && !fieldValues.judul_skripsi && fieldValues.pa_dosen_id === undefined && (
              <p className="text-xs text-muted-foreground italic">Belum ada data input</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Riwayat Aktivitas</h3>
        <ActivityTimeline pengajuanId={pengajuan.id} />
      </div>

      {pengajuan.pengajuan_dokumen.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Dokumen ({pengajuan.pengajuan_dokumen.length})</h3>
          <div className="space-y-2">
            {pengajuan.pengajuan_dokumen.map((dok) => (
              <div key={dok.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{dok.dokumen_persyaratan?.nama_dokumen ?? dok.file_name}</span>
                  {dok.is_auto_attached && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Auto</span>
                  )}
                  <span className="text-muted-foreground text-xs">
                    (v{dok.versi} · {dok.file_name} · {(dok.file_size_bytes / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <a
                  href={`/api/files/${dok.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Lihat
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {kode === "TA-06" && pengajuan.status === "revision_required" && (
        <ResubmitForm pengajuanId={pengajuan.id} />
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

      {/* PDF Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        {pengajuan.status !== "selesai" ? (
          <Link
            href={`/api/pengajuan/${pengajuan.id}/pdf?mode=preview`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" type="button">
              Pratinjau PDF
            </Button>
          </Link>
        ) : (
          <Link
            href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final`}
          >
            <Button type="button">Unduh PDF Final</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
