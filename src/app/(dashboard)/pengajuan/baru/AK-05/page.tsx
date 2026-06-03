"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitPengajuanAK } from "@/actions/pengajuan";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";

export default function AK05FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanAK("AK-05", formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat Pengantar Penelitian</h1>
        <p className="text-muted-foreground">AK-05 — Pengajuan surat pengantar untuk keperluan penelitian.</p>
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
                placeholder="Tujuan pembuatan surat pengantar penelitian"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="judul_penelitian">Judul Penelitian</Label>
              <Input
                id="judul_penelitian"
                name="judul_penelitian"
                placeholder="Auto-fill dari judul skripsi jika ada"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pejabat_tujuan">Pejabat Tujuan</Label>
              <Textarea
                id="pejabat_tujuan"
                name="pejabat_tujuan"
                placeholder="Bisa multiple, pisahkan dengan koma"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi_penelitian">Lokasi Penelitian</Label>
              <Textarea
                id="lokasi_penelitian"
                name="lokasi_penelitian"
                placeholder="Bisa multiple, pisahkan dengan koma"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                <Input id="tanggal_mulai" name="tanggal_mulai" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                <Input id="tanggal_selesai" name="tanggal_selesai" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tujuan_penelitian">Tujuan Penelitian</Label>
              <Textarea id="tujuan_penelitian" name="tujuan_penelitian" />
            </div>
          </CardContent>
        </Card>

        <DokumenUploadSection
          layananKode="AK-05"
          onFilesChange={setUploadedIds}
        />
        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Mengirim..." : "Ajukan Surat Pengantar Penelitian"}
          </Button>
        </div>
      </form>
    </div>
  );
}
