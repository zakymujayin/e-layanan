"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitPengajuanTA04 } from "@/actions/pengajuan";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";

export default function TA04FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanTA04(formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ujian Komprehensif (TA-04)</h1>
        <p className="text-muted-foreground">
          Prasyarat: TA-03 Seminar Proposal harus selesai dengan hasil LAYAK
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Konfirmasi Pengajuan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Judul skripsi Anda yang disetujui akan otomatis dilampirkan.
              Staff Prodi akan memverifikasi, Sekprodi akan menetapkan Penguji Keahlian Prodi & Penguji Keislaman.
            </p>
            <p className="text-sm font-medium">
              Pastikan Anda sudah upload: Transkrip Nilai Terbaru, Bukti Pembayaran Ujian Komprehensif, KRS Semester Berjalan
            </p>
          </CardContent>
        </Card>

        <DokumenUploadSection
          layananKode="TA-04"
          onFilesChange={setUploadedIds}
        />
        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Mengirim..." : "Ajukan Ujian Komprehensif"}
          </Button>
        </div>
      </form>
    </div>
  );
}
