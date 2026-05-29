"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setPengujiTA03 } from "@/actions/pengajuan";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";

export function PengujiPicker({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [p1Nidn, setP1Nidn] = useState("");
  const [p2Nidn, setP2Nidn] = useState("");
  const [dosen, setDosen] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dosen").then(r => r.json()).then(d => setDosen(d.data || d));
  }, []);

  async function handleSubmit() {
    const p1 = dosen.find(d => d.nidn === p1Nidn);
    const p2 = dosen.find(d => d.nidn === p2Nidn);
    if (!p1 || !p2) { toast.error("Dosen tidak ditemukan"); return; }
    if (p1.id === p2.id) { toast.error("Penguji 1 dan 2 harus berbeda"); return; }
    setLoading(true);
    try {
      await setPengujiTA03(pengajuanId, { penguji_1_dosen_id: p1.id, penguji_2_dosen_id: p2.id });
      await executeWorkflowAction({ pengajuanId, action: "approve" });
      toast.success("Penguji ditetapkan");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Penetapan Penguji</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Penguji 1 (NIDN)</Label>
          <Input placeholder="0115098501" value={p1Nidn} onChange={e => setP1Nidn(e.target.value)} />
          {p1Nidn && dosen.find(d => d.nidn === p1Nidn) && (
            <p className="text-sm text-green-600">{dosen.find(d => d.nidn === p1Nidn)!.nama_lengkap}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Penguji 2 (NIDN)</Label>
          <Input placeholder="0220077301" value={p2Nidn} onChange={e => setP2Nidn(e.target.value)} />
          {p2Nidn && dosen.find(d => d.nidn === p2Nidn) && (
            <p className="text-sm text-green-600">{dosen.find(d => d.nidn === p2Nidn)!.nama_lengkap}</p>
          )}
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Menyimpan..." : "Tetapkan Penguji & Lanjut"}
      </Button>
    </div>
  );
}
