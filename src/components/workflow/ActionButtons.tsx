"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";
import type { WorkflowStepAction } from "@/generated/prisma/client";
import { CheckCircle, XCircle, CornerUpLeft, Pen, AlertTriangle, Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Mahasiswa (awal)",
  pending_staff_prodi: "Staff Prodi",
  pending_staff_akademik: "Staff Akademik",
  pending_pa: "Pembimbing Akademik",
  pending_kaprodi: "Kepala Prodi",
  pending_sekprodi: "Sekretaris Prodi",
  pending_kabag: "Kepala Bagian",
  pending_wd1: "Wakil Dekan 1",
  pending_dekan: "Dekan",
  pending_kepala_lab: "Kepala Lab",
};

const ACTION_CONFIG: Record<string, { icon: typeof CheckCircle; variant: "default" | "destructive" | "outline"; label: string }> = {
  approve: { icon: CheckCircle, variant: "default", label: "Setujui" },
  sign: { icon: Pen, variant: "default", label: "Tanda Tangan" },
  select_judul: { icon: CheckCircle, variant: "default", label: "Pilih Judul" },
  reject_to_submitter: { icon: XCircle, variant: "destructive", label: "Kembalikan ke Mahasiswa" },
  reject_to_step: { icon: CornerUpLeft, variant: "destructive", label: "Kembalikan" },
};

const DIALOG_MESSAGES: Record<string, { title: string; desc: string }> = {
  approve: { title: "Setujui Pengajuan", desc: "Pengajuan akan dilanjutkan ke tahap berikutnya." },
  sign: { title: "Tanda Tangan Dokumen", desc: "Dokumen final akan diterbitkan dengan tanda tangan Anda. Pastikan data sudah benar." },
  select_judul: { title: "Pilih Judul Skripsi", desc: "Judul yang dipilih akan menjadi judul skripsi resmi mahasiswa." },
  reject_to_submitter: { title: "Kembalikan ke Mahasiswa", desc: "Mahasiswa akan diminta merevisi dan mengirim ulang pengajuan." },
  reject_to_step: { title: "Kembalikan ke Tahap Sebelumnya", desc: "Pengajuan akan dikirim kembali ke tahap yang dipilih untuk diperiksa ulang." },
};

interface ActionButtonsProps {
  pengajuanId: number;
  actions: WorkflowStepAction[];
  isPA: boolean;
  judulCount: number;
}

export function ActionButtons({ pengajuanId, actions, isPA, judulCount }: ActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedJudul, setSelectedJudul] = useState<number | null>(null);
  const [alasan, setAlasan] = useState("");
  const [targetStatus, setTargetStatus] = useState<string>("");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  async function execute(action: string) {
    setLoading(action);
    try {
      await executeWorkflowAction({
        pengajuanId,
        action,
        data: {
          ...(alasan ? { alasan } : {}),
          ...(selectedJudul !== null ? { selected_judul_index: selectedJudul } : {}),
          ...(action === "reject_to_step" && targetStatus ? { target_status: targetStatus } : {}),
        },
      });
      toast.success("Aksi berhasil");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengeksekusi aksi");
    } finally {
      setLoading(null);
    }
  }

  function confirmAndExecute() {
    if (confirmAction) {
      execute(confirmAction);
      setConfirmAction(null);
    }
  }

  const confirmDialog = confirmAction ? (DIALOG_MESSAGES[confirmAction] ?? { title: "Konfirmasi Aksi", desc: "Apakah Anda yakin ingin melanjutkan?" }) : null;

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="font-semibold text-lg">Aksi</h3>

      {/* PA Judul Selection */}
      {isPA && actions.some(a => a.action_code === "select_judul") && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <Label className="text-sm font-medium">Pilih 1 Judul Skripsi:</Label>
          <div className="space-y-2">
            {Array.from({ length: judulCount }, (_, i) => (
              <label
                key={i}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all
                  ${selectedJudul === i + 1
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "bg-background hover:border-primary/40 hover:bg-muted/50"
                  }`}
              >
                <input
                  type="radio"
                  name="selected_judul"
                  value={i + 1}
                  checked={selectedJudul === i + 1}
                  onChange={() => setSelectedJudul(i + 1)}
                  className="accent-primary h-4 w-4 shrink-0"
                />
                <span className="text-sm">Judul {i + 1}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {actions.map(a => {
          const cfg = ACTION_CONFIG[a.action_code] ?? { icon: CheckCircle, variant: "default" as const, label: a.label };
          const needsReason = a.requires_reason || a.action_code === "reject_to_submitter" || a.action_code === "reject_to_step";
          const actionConfig = a.actionConfig as { allow_target?: string[] } | null;
          const allowTarget = actionConfig?.allow_target ?? [];
          const needsTarget = a.action_code === "reject_to_step" && allowTarget.length > 0;
          const isCurrentLoading = loading === a.action_code;

          return (
            <div key={a.id} className="flex flex-col gap-2">
              {/* Target dropdown for reject_to_step */}
              {needsTarget && (
                <div>
                  <Label className="text-xs font-medium mb-1 block">Kembalikan ke:</Label>
                  <select
                    value={targetStatus}
                    onChange={e => setTargetStatus(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Pilih tujuan pengembalian...</option>
                    {allowTarget.map(t => (
                      <option key={t} value={t}>{STATUS_LABELS[t] ?? t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Alasan input + button row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {needsReason && (
                  <input
                    type="text"
                    placeholder="Alasan (wajib)..."
                    value={alasan}
                    onChange={e => setAlasan(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-0"
                  />
                )}
                <Button
                  variant={cfg.variant}
                  size={needsReason ? "default" : "lg"}
                  disabled={
                    loading !== null ||
                    (needsReason && !alasan.trim()) ||
                    (needsTarget && !targetStatus)
                  }
                  onClick={() => setConfirmAction(a.action_code)}
                  className="gap-2 shrink-0 w-full sm:w-auto"
                >
                  {isCurrentLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <cfg.icon className="h-4 w-4" />
                  )}
                  {isCurrentLoading ? "Memproses..." : cfg.label}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AlertDialog — all actions require confirmation */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-center">{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {confirmDialog?.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAndExecute} className="w-full sm:w-auto">
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
