"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitPengajuanTA06 } from "@/actions/pengajuan";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";

export default function TA06FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanTA06(formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cek Turnitin (TA-06)</h1>
        <p className="text-muted-foreground">Tidak ada prasyarat TA lain. Batas similarity: 25%. Maksimal 3x revisi.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Data Turnitin</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submission_id_turnitin">Submission ID Turnitin *</Label>
              <Input id="submission_id_turnitin" name="submission_id_turnitin" placeholder="ID dari akun Turnitin" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url_turnitin">URL Turnitin *</Label>
              <Input id="url_turnitin" name="url_turnitin" type="url" placeholder="https://..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="similarity_percentage">Similarity % *</Label>
              <Input id="similarity_percentage" name="similarity_percentage" type="number" min={0} max={100} placeholder="0-100" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informasi</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Judul skripsi akan otomatis dilampirkan. Dokumen yang perlu diupload: Draft Skripsi (PDF, max 15MB), Screenshot Hasil Turnitin (PDF/JPG/PNG, max 2MB)
            </p>
          </CardContent>
        </Card>

        <DokumenUploadSection
          layananKode="TA-06"
          onFilesChange={setUploadedIds}
        />
        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Mengirim..." : "Ajukan Cek Turnitin"}
          </Button>
        </div>
      </form>
    </div>
  );
}
