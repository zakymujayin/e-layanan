"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";
import { submitPengajuanAK } from "@/actions/pengajuan";

export default function AK01FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanAK("AK-01", formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat Keterangan Aktif Kuliah</h1>
        <p className="text-muted-foreground">AK-01 — Pengajuan surat keterangan aktif kuliah untuk berbagai keperluan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Form Pengajuan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="peruntukan">Peruntukan</Label>
              <Textarea
                id="peruntukan"
                name="peruntukan"
                placeholder="Tujuan pembuatan surat, mis. Tunjangan Keluarga Orang Tua"
                required
              />
            </div>
          </CardContent>
        </Card>

        <DokumenUploadSection
          layananKode="AK-01"
          onFilesChange={setUploadedIds}
        />

        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Mengirim..." : "Ajukan Surat Keterangan Aktif Kuliah"}
          </Button>
        </div>
      </form>
    </div>
  );
}
