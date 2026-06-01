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

  const isPA = pengajuan.pengajuan_data?.field_values
    ? (pengajuan.pengajuan_data.field_values as any).pa_dosen_id === user?.dosen?.id
    : false;

  const fieldValues = pengajuan.pengajuan_data?.field_values as Record<string, unknown> | null;
  const judulCount = fieldValues
    ? Object.keys(fieldValues).filter((k) => k.startsWith("judul_") && fieldValues[k]).length
    : 0;

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
            {Object.entries(fieldValues)
              .filter(([k]) => k.startsWith("judul_"))
              .map(([k, v]) => (
                <p key={k} className="text-muted-foreground">{k.replace("_", " ")}: {String(v)}</p>
              ))}
            <p className="text-xs text-muted-foreground">PA Dosen ID: {fieldValues.pa_dosen_id as string}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Riwayat Aktivitas</h3>
        <ActivityTimeline pengajuanId={pengajuan.id} />
      </div>

      {currentStep && currentStep.actions.length > 0 && (
        <ActionButtons
          pengajuanId={pengajuan.id}
          actions={currentStep.actions}
          isPA={isPA}
          judulCount={judulCount}
        />
      )}

      {pengajuan.jenis_layanan.kode === "TA-02" && pengajuan.status === "pending_sekprodi" && (
        <PembimbingPicker pengajuanId={pengajuan.id} />
      )}

      {pengajuan.jenis_layanan.kode === "TA-03" && pengajuan.status === "pending_staff_prodi" && (
        <JadwalSidangInput pengajuanId={pengajuan.id} />
      )}

      {pengajuan.jenis_layanan.kode === "TA-03" && pengajuan.status === "pending_sekprodi" && (
        <PengujiPicker pengajuanId={pengajuan.id} />
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
