"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  const [p1Nidn, setP1Nidn] = useState("");
  const [p2Nidn, setP2Nidn] = useState("");
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
    const p1 = dosen.find((d) => d.nidn === p1Nidn);
    const p2 = dosen.find((d) => d.nidn === p2Nidn);
    if (!p1 || !p2) {
      setError("Dosen tidak ditemukan");
      return;
    }
    if (p1.id === p2.id) {
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
        pembimbing_1_dosen_id: p1.id,
        pembimbing_2_dosen_id: p2.id,
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
          <Label>Pembimbing 1 (NIDN)</Label>
          <Input placeholder="0115098501" value={p1Nidn} onChange={(e) => setP1Nidn(e.target.value)} />
          {p1Nidn && dosen.find((d) => d.nidn === p1Nidn) && (
            <p className="text-sm text-green-600">{dosen.find((d) => d.nidn === p1Nidn)!.nama_lengkap}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Pembimbing 2 (NIDN)</Label>
          <Input placeholder="0220077301" value={p2Nidn} onChange={(e) => setP2Nidn(e.target.value)} />
          {p2Nidn && dosen.find((d) => d.nidn === p2Nidn) && (
            <p className="text-sm text-green-600">{dosen.find((d) => d.nidn === p2Nidn)!.nama_lengkap}</p>
          )}
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
