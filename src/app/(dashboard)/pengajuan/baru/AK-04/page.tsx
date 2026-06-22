"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";
import { submitPengajuanAK } from "@/actions/pengajuan";

export default function AK04FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanAK("AK-04", formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat Pengantar Observasi</h1>
        <p className="text-muted-foreground">AK-04 — Pengajuan surat pengantar observasi ke instansi tujuan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Form Pengajuan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mata_kuliah">Mata Kuliah</Label>
              <Input id="mata_kuliah" name="mata_kuliah" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pejabat_tujuan">Pejabat Tujuan</Label>
              <Input id="pejabat_tujuan" name="pejabat_tujuan" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instansi_tujuan">Instansi Tujuan</Label>
              <Input id="instansi_tujuan" name="instansi_tujuan" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokasi_observasi">Lokasi Observasi</Label>
              <Input
                id="lokasi_observasi"
                name="lokasi_observasi"
                placeholder="Pisahkan dengan koma untuk multiple"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
              <Input id="tanggal_mulai" name="tanggal_mulai" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
              <Input id="tanggal_selesai" name="tanggal_selesai" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosen_pembimbing_observasi_id">Dosen Pembimbing Observasi</Label>
              <Input
                id="dosen_pembimbing_observasi_id"
                name="dosen_pembimbing_observasi_id"
                placeholder="NIDN dosen"
                required
              />
            </div>
          </CardContent>
        </Card>

        <DokumenUploadSection
          layananKode="AK-04"
          onFilesChange={setUploadedIds}
        />

        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Mengirim..." : "Ajukan Surat Pengantar Observasi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
