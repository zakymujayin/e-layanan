"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { setPembimbingTA02 } from "@/actions/pengajuan";

interface Dosen {
  id: number;
  nidn: string;
  nama_lengkap: string;
}

export function PembimbingPicker({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [dosen, setDosen] = useState<Dosen[]>([]);
  const [p1Id, setP1Id] = useState("");
  const [p2Id, setP2Id] = useState("");
  const [nomor, setNomor] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dosen")
      .then((r) => r.json())
      .then((d) => setDosen(d.data || d))
      .catch(() => toast.error("Gagal memuat data dosen"));
  }, []);

  async function handleSubmit() {
    const id1 = Number(p1Id);
    const id2 = Number(p2Id);
    if (!id1 || !id2) {
      setError("Semua pembimbing harus dipilih");
      return;
    }
    if (id1 === id2) {
      setError("Pembimbing 1 dan 2 harus berbeda");
      return;
    }
    if (!nomor) {
      setError("Nomor surat prodi wajib diisi");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await setPembimbingTA02(pengajuanId, {
        pembimbing_1_dosen_id: id1,
        pembimbing_2_dosen_id: id2,
        nomor_surat_prodi: nomor,
        tanggal_surat_prodi: tanggal,
      });
      toast.success("Pembimbing berhasil ditetapkan");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menetapkan pembimbing");
    } finally {
      setLoading(false);
    }
  }

  if (dosen.length === 0) return <p className="text-sm text-muted-foreground">Memuat data dosen...</p>;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Penetapan Pembimbing</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Pembimbing 1</Label>
          <Select value={p1Id} onValueChange={(v) => setP1Id(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih dosen..." />
            </SelectTrigger>
            <SelectContent>
              {dosen.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.nama_lengkap} (NIDN: {d.nidn})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Pembimbing 2</Label>
          <Select value={p2Id} onValueChange={(v) => setP2Id(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih dosen..." />
            </SelectTrigger>
            <SelectContent>
              {dosen.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.nama_lengkap} (NIDN: {d.nidn})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nomor Surat Permohonan Prodi</Label>
          <Input placeholder="IH/PP.00.9/045/V/2026" value={nomor} onChange={(e) => setNomor(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Tanggal Surat Prodi</Label>
          <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Menyimpan..." : "Tetapkan Pembimbing & Lanjutkan"}
      </Button>
    </div>
  );
}
