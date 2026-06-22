"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitPengajuanTA05 } from "@/actions/pengajuan";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";

export default function TA05FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanTA05(formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ujian Skripsi Munaqasyah (TA-05)</h1>
        <p className="text-muted-foreground">Prasyarat: TA-04 Komprehensif harus LULUS dan TA-06 Turnitin harus selesai</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Konfirmasi Pengajuan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Judul skripsi dan data Pembimbing 1 & 2 akan otomatis dilampirkan.
              Sertifikat Lulus Komprehensif (TA-04) dan Sertifikat Turnitin (TA-06) akan otomatis dilampirkan jika sudah selesai.
            </p>
            <p className="text-sm font-medium">
              Dokumen yang perlu diupload: Skripsi Lengkap (Final Draft, max 15MB PDF), Lembar Persetujuan Pembimbing, Transkrip Nilai Lengkap, KRS Semester Berjalan, Bukti Pembayaran Ujian Skripsi
            </p>
          </CardContent>
        </Card>

        <DokumenUploadSection
          layananKode="TA-05"
          onFilesChange={setUploadedIds}
        />
        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Mengirim..." : "Ajukan Ujian Skripsi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
