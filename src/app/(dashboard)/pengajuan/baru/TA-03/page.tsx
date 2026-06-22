"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitPengajuanTA03 } from "@/actions/pengajuan";

export default function TA03FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanTA03(formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seminar Proposal Skripsi</h1>
        <p className="text-muted-foreground">TA-03 — Setelah SK Pembimbing terbit, ajukan seminar proposal. Data judul dan pembimbing akan otomatis terisi.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Persyaratan</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Dokumen berikut diperlukan (siapkan sebelum submit):</p>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>Draft Proposal Skripsi (lengkap, PDF max 10MB)</li>
              <li>Lembar Persetujuan Pembimbing 1 & 2 (sudah TTD, PDF max 2MB)</li>
              <li>Form Bimbingan Proposal (PDF max 2MB)</li>
              <li>Bukti Pembayaran Seminar Proposal (PDF/JPG max 2MB)</li>
              <li>KRS yang Memuat Skripsi (PDF max 2MB)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Auto-Fill Data</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Judul skripsi dan data pembimbing akan otomatis diambil dari TA-01 dan TA-02.
              SK Pembimbing akan otomatis dilampirkan.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Mengirim..." : "Ajukan Seminar Proposal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
