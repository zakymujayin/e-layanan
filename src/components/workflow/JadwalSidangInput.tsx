"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setJadwalTA03 } from "@/actions/pengajuan";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";

export function JadwalSidangInput({ pengajuanId, actionLabel }: { pengajuanId: number; actionLabel?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tanggalSidang, setTanggalSidang] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [ruangSidang, setRuangSidang] = useState("Ruang Sidang 1");

  async function handleSubmit() {
    if (!tanggalSidang || !waktuMulai || !waktuSelesai || !ruangSidang) {
      toast.error("Semua field jadwal wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await setJadwalTA03(pengajuanId, { tanggal_sidang: tanggalSidang, waktu_mulai: waktuMulai, waktu_selesai: waktuSelesai, ruang_sidang: ruangSidang });
      await executeWorkflowAction({ pengajuanId, action: "approve" });
      toast.success("Jadwal disimpan");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Verifikasi & Penjadwalan</h3>
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
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Menyimpan..." : (actionLabel ?? "Verifikasi & Simpan Jadwal")}
      </Button>
    </div>
  );
}
