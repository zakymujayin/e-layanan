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

  function handleActionClick(actionCode: string) {
    setConfirmAction(actionCode);
  }

  function confirmAndExecute() {
    if (confirmAction) {
      execute(confirmAction);
      setConfirmAction(null);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Aksi</h3>

      {isPA && actions.some(a => a.action_code === "select_judul") && (
        <div className="space-y-2">
          <Label>Pilih 1 Judul:</Label>
          {Array.from({ length: judulCount }, (_, i) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="selected_judul"
                value={i + 1}
                checked={selectedJudul === i + 1}
                onChange={() => setSelectedJudul(i + 1)}
              />
              Judul {i + 1}
            </label>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {actions.map(a => {
          const isDestructive = ["reject_to_submitter", "reject_to_step"].includes(a.action_code);
          const needsReason = a.requires_reason || isDestructive;
          const actionConfig = a.actionConfig as { allow_target?: string[] } | null;
          const allowTarget = actionConfig?.allow_target ?? [];
          const needsTarget = a.action_code === "reject_to_step" && allowTarget.length > 0;

          return (
            <div key={a.id} className="flex flex-col gap-2">
              {needsTarget && (
                <div>
                  <Label className="text-xs mb-1 block">Kembalikan ke:</Label>
                  <select
                    value={targetStatus}
                    onChange={e => setTargetStatus(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm"
                  >
                    <option value="">Pilih tujuan pengembalian...</option>
                    {allowTarget.map(t => (
                      <option key={t} value={t}>{STATUS_LABELS[t] ?? t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                {needsReason && (
                  <input
                    type="text"
                    placeholder="Alasan penolakan (wajib)..."
                    value={alasan}
                    onChange={e => setAlasan(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm min-w-[220px]"
                  />
                )}
                <Button
                  variant={isDestructive ? "destructive" : "default"}
                  disabled={
                    loading !== null ||
                    (needsReason && !alasan.trim()) ||
                    (needsTarget && !targetStatus)
                  }
                  onClick={() => isDestructive ? handleActionClick(a.action_code) : execute(a.action_code)}
                >
                  {loading === a.action_code ? "Memproses..." : a.label}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Aksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin melakukan aksi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAndExecute}>Ya, Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
