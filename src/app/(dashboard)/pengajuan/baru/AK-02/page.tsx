"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DokumenUploadSection } from "@/components/upload/DokumenUploadSection";
import { submitPengajuanAK } from "@/actions/pengajuan";

export default function AK02FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<number[]>([]);
  const [orangTuaPns, setOrangTuaPns] = useState("tidak");
  const [hubunganOrangTua, setHubunganOrangTua] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await submitPengajuanAK("AK-02", formData);
    } catch (err: any) {
      toast.error(err.message || "Gagal submit pengajuan");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Surat Keterangan Masih Kuliah (PNS/Tunjangan)</h1>
        <p className="text-muted-foreground">AK-02 — Ajukan surat keterangan untuk keperluan PNS/Tunjangan orang tua.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informasi Surat</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="peruntukan">Peruntukan *</Label>
              <Textarea
                id="peruntukan"
                name="peruntukan"
                placeholder="Tujuan surat"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Orang Tua PNS *</Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="orang_tua_pns"
                    value="ya"
                    checked={orangTuaPns === "ya"}
                    onChange={(e) => setOrangTuaPns(e.target.value)}
                  />
                  <span className="text-sm">Ya</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="orang_tua_pns"
                    value="tidak"
                    checked={orangTuaPns === "tidak"}
                    onChange={(e) => setOrangTuaPns(e.target.value)}
                  />
                  <span className="text-sm">Tidak</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {orangTuaPns === "ya" && (
          <Card>
            <CardHeader><CardTitle>Data Orang Tua PNS</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama_orang_tua">Nama Orang Tua *</Label>
                <Input id="nama_orang_tua" name="nama_orang_tua" placeholder="Nama lengkap orang tua" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip_orang_tua">NIP Orang Tua *</Label>
                <Input id="nip_orang_tua" name="nip_orang_tua" placeholder="18 digit" maxLength={18} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pangkat_golongan">Pangkat/Golongan *</Label>
                <Input id="pangkat_golongan" name="pangkat_golongan" placeholder="Contoh: III/a" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jabatan_orang_tua">Jabatan Orang Tua *</Label>
                <Input id="jabatan_orang_tua" name="jabatan_orang_tua" placeholder="Jabatan orang tua" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instansi_orang_tua">Instansi Orang Tua *</Label>
                <Textarea id="instansi_orang_tua" name="instansi_orang_tua" placeholder="Nama instansi tempat orang tua bekerja" rows={2} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hubungan_orang_tua">Hubungan Orang Tua *</Label>
                <Select value={hubunganOrangTua} onValueChange={(val) => setHubunganOrangTua(val ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hubungan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayah">Ayah</SelectItem>
                    <SelectItem value="ibu">Ibu</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="hubungan_orang_tua" value={hubunganOrangTua} />
              </div>
            </CardContent>
          </Card>
        )}

        <DokumenUploadSection
          layananKode="AK-02"
          onFilesChange={setUploadedIds}
        />

        <input type="hidden" name="dokumen_ids" value={uploadedIds.join(",")} />

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Mengirim..." : "Ajukan SK Masih Kuliah"}
          </Button>
        </div>
      </form>
    </div>
  );
}
