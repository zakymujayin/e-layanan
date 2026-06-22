"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitPengajuanTA02 } from "@/actions/pengajuan";

export default function TA02FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanTA02(formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SK Pembimbing Skripsi</h1>
        <p className="text-muted-foreground">TA-02 — Pengajuan SK Pembimbing setelah judul disetujui. Data judul dan PA akan otomatis terisi.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Konfirmasi Pengajuan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Judul skripsi Anda yang telah disetujui akan otomatis dilampirkan.
              Staff Prodi akan memverifikasi dan Sekprodi akan menetapkan Pembimbing 1 & 2.
            </p>
            <p className="text-sm font-medium">Pastikan Anda sudah upload KRS Semester Berjalan.</p>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Mengirim..." : "Ajukan SK Pembimbing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
