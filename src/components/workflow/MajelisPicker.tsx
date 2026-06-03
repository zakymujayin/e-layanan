"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setMajelisTA05 } from "@/actions/pengajuan";

export function MajelisPicker({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dosen, setDosen] = useState<any[]>([]);
  const [tanggalSidang, setTanggalSidang] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [ruangSidang, setRuangSidang] = useState("Ruang Sidang Utama");
  const [ketuaNidn, setKetuaNidn] = useState("");
  const [sekNidn, setSekNidn] = useState("");
  const [penguji1Nidn, setPenguji1Nidn] = useState("");
  const [penguji2Nidn, setPenguji2Nidn] = useState("");

  useEffect(() => {
    fetch("/api/dosen").then(r => r.json()).then(d => setDosen(d.data || d));
  }, []);

  async function handleSubmit() {
    if (!tanggalSidang || !waktuMulai || !waktuSelesai) {
      toast.error("Semua field jadwal wajib diisi");
      return;
    }

    const ketua = dosen.find(d => d.nidn === ketuaNidn);
    const sek = dosen.find(d => d.nidn === sekNidn);
    const p1 = dosen.find(d => d.nidn === penguji1Nidn);
    const p2 = dosen.find(d => d.nidn === penguji2Nidn);

    if (!ketua || !sek || !p1 || !p2) {
      toast.error("Semua dosen majelis wajib diisi dengan NIDN valid");
      return;
    }

    const allIds = [ketua.id, sek.id, p1.id, p2.id];
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
        ketua_sidang_dosen_id: ketua.id,
        sekretaris_sidang_dosen_id: sek.id,
        penguji_1_dosen_id: p1.id,
        penguji_2_dosen_id: p2.id,
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function DosenField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        {value && dosen.find(d => d.nidn === value) && (
          <p className="text-sm text-green-600">{dosen.find(d => d.nidn === value)!.nama_lengkap}</p>
        )}
      </div>
    );
  }

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
        <h4 className="text-sm font-medium text-muted-foreground">Anggota Majelis (4 dosen akan ditetapkan, P1 & P2 auto-fill dari TA-02)</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <DosenField label="Ketua Sidang (NIDN)" value={ketuaNidn} onChange={setKetuaNidn} placeholder="0115098501" />
          <DosenField label="Sekretaris Sidang (NIDN)" value={sekNidn} onChange={setSekNidn} placeholder="0220077301" />
          <DosenField label="Penguji 1 (NIDN)" value={penguji1Nidn} onChange={setPenguji1Nidn} placeholder="0315088402" />
          <DosenField label="Penguji 2 (NIDN)" value={penguji2Nidn} onChange={setPenguji2Nidn} placeholder="0410067501" />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Menyimpan..." : "Tetapkan Jadwal & Majelis"}
      </Button>
    </div>
  );
}
