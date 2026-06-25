"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { setMajelisTA05 } from "@/actions/pengajuan";

interface Dosen {
  id: number;
  nidn: string;
  nama_lengkap: string;
}

export function MajelisPicker({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dosen, setDosen] = useState<Dosen[]>([]);
  const [tanggalSidang, setTanggalSidang] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [ruangSidang, setRuangSidang] = useState("Ruang Sidang Utama");
  const [ketuaId, setKetuaId] = useState("");
  const [sekId, setSekId] = useState("");
  const [penguji1Id, setPenguji1Id] = useState("");
  const [penguji2Id, setPenguji2Id] = useState("");

  useEffect(() => {
    fetch("/api/dosen").then(r => r.json()).then(d => setDosen(d.data || d));
  }, []);

  async function handleSubmit() {
    if (!tanggalSidang || !waktuMulai || !waktuSelesai) {
      toast.error("Semua field jadwal wajib diisi");
      return;
    }

    const idKetua = Number(ketuaId);
    const idSek = Number(sekId);
    const idP1 = Number(penguji1Id);
    const idP2 = Number(penguji2Id);

    if (!idKetua || !idSek || !idP1 || !idP2) {
      toast.error("Semua dosen majelis wajib dipilih");
      return;
    }

    const allIds = [idKetua, idSek, idP1, idP2];
    if (new Set(allIds).size !== allIds.length) {
      toast.error("Semua anggota majelis harus berbeda");
      return;
    }

    setLoading(true);
    try {
      await setMajelisTA05(pengajuanId, {
        tanggal_sidang: tanggalSidang,
        waktu_mulai: waktuMulai,
        waktu_selesai: waktuSelesai,
        ruang_sidang: ruangSidang,
        ketua_sidang_dosen_id: idKetua,
        sekretaris_sidang_dosen_id: idSek,
        penguji_1_dosen_id: idP1,
        penguji_2_dosen_id: idP2,
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (dosen.length === 0) return <p className="text-sm text-muted-foreground">Memuat data dosen...</p>;

  return (
    <div className="space-y-8 rounded-lg border p-4">
      <h3 className="font-semibold">Penjadwalan & Penetapan Majelis</h3>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Jadwal Sidang</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tanggal Sidang</Label>
            <Input type="date" value={tanggalSidang} onChange={e => setTanggalSidang(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Ruang Sidang</Label>
            <Input value={ruangSidang} onChange={e => setRuangSidang(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Waktu Mulai</Label>
            <Input type="time" value={waktuMulai} onChange={e => setWaktuMulai(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Waktu Selesai</Label>
            <Input type="time" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Anggota Majelis</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Ketua Sidang</Label>
            <Select value={ketuaId} onValueChange={(v) => setKetuaId(v ?? "")}>
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
            <Label>Sekretaris Sidang</Label>
            <Select value={sekId} onValueChange={(v) => setSekId(v ?? "")}>
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
            <Label>Penguji 1</Label>
            <Select value={penguji1Id} onValueChange={(v) => setPenguji1Id(v ?? "")}>
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
            <Label>Penguji 2</Label>
            <Select value={penguji2Id} onValueChange={(v) => setPenguji2Id(v ?? "")}>
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
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Menyimpan..." : "Tetapkan Jadwal & Majelis"}
      </Button>
    </div>
  );
}
