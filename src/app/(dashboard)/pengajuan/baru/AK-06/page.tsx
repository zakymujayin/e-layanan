"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitPengajuanAK } from "@/actions/pengajuan";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";

export default function AK06FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanAK("AK-06", formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat Permohonan Magang</h1>
        <p className="text-muted-foreground">AK-06 — Pengajuan surat permohonan magang ke instansi tujuan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Data Instansi</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pejabat_tujuan">Pejabat Tujuan</Label>
              <Input id="pejabat_tujuan" name="pejabat_tujuan" placeholder="Nama pejabat tujuan" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instansi_tujuan">Instansi Tujuan</Label>
              <Input id="instansi_tujuan" name="instansi_tujuan" placeholder="Nama instansi tujuan" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat_instansi">Alamat Instansi</Label>
              <Textarea id="alamat_instansi" name="alamat_instansi" placeholder="Alamat lengkap instansi" rows={2} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Periode Magang</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
              <Input id="tanggal_mulai" name="tanggal_mulai" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
              <Input id="tanggal_selesai" name="tanggal_selesai" type="date" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Detail Magang</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bidang_magang">Bidang Magang</Label>
              <Textarea id="bidang_magang" name="bidang_magang" placeholder="Bidang atau topik magang yang akan diikuti" rows={3} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosen_pembimbing_magang_id">Dosen Pembimbing Magang</Label>
              <Input id="dosen_pembimbing_magang_id" name="dosen_pembimbing_magang_id" placeholder="NIDN dosen" required />
            </div>
          </CardContent>
        </Card>

        <DokumenUploadSection
          layananKode="AK-06"
          onFilesChange={setUploadedIds}
        />
        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Mengirim..." : "Ajukan Surat Permohonan Magang"}
          </Button>
        </div>
      </form>
    </div>
  );
}
