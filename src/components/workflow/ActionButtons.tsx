"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";
import type { WorkflowStepAction } from "@/generated/prisma/client";

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

  async function execute(action: string, extraData?: Record<string, unknown>) {
    setLoading(action);
    try {
      await executeWorkflowAction({
        pengajuanId,
        action,
        data: {
          ...extraData,
          ...(alasan ? { alasan } : {}),
          ...(selectedJudul !== null ? { selected_judul_index: selectedJudul } : {}),
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

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Aksi</h3>

      {isPA && actions.some((a) => a.action_code === "select_judul") && (
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

      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const isDestructive = a.action_code === "reject_to_submitter" || a.action_code === "reject_to_step";
          const needsReason = a.requires_reason || a.action_code === "reject_to_submitter";

          return (
            <div key={a.id} className="flex items-center gap-2">
              {needsReason && (
                <input
                  type="text"
                  placeholder="Alasan..."
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="rounded border px-2 py-1 text-sm"
                />
              )}
              <Button
                variant={isDestructive ? "destructive" : "default"}
                disabled={loading !== null || (needsReason && !alasan)}
                onClick={() => execute(a.action_code)}
              >
                {loading === a.action_code ? "Memproses..." : a.label}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
