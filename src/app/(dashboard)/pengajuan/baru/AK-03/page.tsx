"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { submitPengajuanAK } from "@/actions/pengajuan";

export default function AK03FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanAK("AK-03", formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat Keterangan Pernah Kuliah</h1>
        <p className="text-muted-foreground">AK-03 — Pengajuan surat keterangan pernah kuliah untuk alumni atau mahasiswa D.O.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Form Pengajuan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
              Layanan ini khusus untuk alumni atau mahasiswa yang sudah keluar/D.O. Mahasiswa aktif tidak dapat mengajukan layanan ini.
            </div>

            <div className="space-y-2">
              <Label htmlFor="peruntukan">Peruntukan</Label>
              <Textarea
                id="peruntukan"
                name="peruntukan"
                placeholder="Tujuan pembuatan surat"
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Mengirim..." : "Ajukan Surat Keterangan Pernah Kuliah"}
          </Button>
        </div>
      </form>
    </div>
  );
}
