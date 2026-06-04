"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resubmitTA06, resubmitPengajuan } from "@/actions/pengajuan";

interface ResubmitFormProps {
  pengajuanId: number;
  layananKode: string;
}

export function ResubmitForm({ pengajuanId, layananKode }: ResubmitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isTA06 = layananKode === "TA-06";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      if (isTA06) {
        await resubmitTA06(pengajuanId, fd);
      } else {
        await resubmitPengajuan(pengajuanId, fd);
      }
      toast.success("Pengajuan berhasil diajukan ulang");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Gagal mengajukan ulang");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <h3 className="mb-2 font-semibold text-amber-800 dark:text-amber-200">Ajukan Ulang</h3>
      <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
        Perbaiki sesuai catatan di timeline aktivitas di atas, lalu submit ulang.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {isTA06 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Submission ID Turnitin</label>
              <input
                name="submission_id_turnitin"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Turnitin</label>
              <input
                name="url_turnitin"
                type="url"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Persentase Similarity (%)</label>
              <input
                name="similarity_percentage"
                type="number"
                min="0"
                max="100"
                defaultValue="0"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                required
              />
            </div>
          </>
        )}
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Memproses..." : "Ajukan Ulang"}
        </Button>
      </form>
    </div>
  );
}
