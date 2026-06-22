"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitPengajuanTA01 } from "@/actions/pengajuan";

export default function TA01FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanTA01(formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengajuan Judul Skripsi</h1>
        <p className="text-muted-foreground">TA-01 — Ajukan minimal 3 judul. PA akan memilih 1 dari judul yang Anda ajukan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Judul Skripsi</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judul_1">Judul 1 *</Label>
              <Textarea id="judul_1" name="judul_1" placeholder="Masukkan judul skripsi pertama" rows={2} required minLength={10} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judul_2">Judul 2 *</Label>
              <Textarea id="judul_2" name="judul_2" placeholder="Masukkan judul skripsi kedua" rows={2} required minLength={10} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judul_3">Judul 3 *</Label>
              <Textarea id="judul_3" name="judul_3" placeholder="Masukkan judul skripsi ketiga" rows={2} required minLength={10} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judul_4">Judul 4 (opsional)</Label>
              <Textarea id="judul_4" name="judul_4" placeholder="Masukkan judul keempat (opsional)" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judul_5">Judul 5 (opsional)</Label>
              <Textarea id="judul_5" name="judul_5" placeholder="Masukkan judul kelima (opsional)" rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pembimbing Akademik</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="pa_dosen_id">NIDN Dosen PA *</Label>
              <Input id="pa_dosen_id" name="pa_dosen_id" placeholder="Masukkan NIDN (contoh: 0115098501)" required />
              <p className="text-xs text-muted-foreground">Masukkan NIDN Dosen Pembimbing Akademik Anda (untuk demo: 0115098501 = Dr. Ahmad Fauzi)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dokumen</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Upload dokumen belum tersedia di Phase 2. Pengajuan akan tetap diproses tanpa file upload.</p>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Mengirim..." : "Submit Pengajuan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
