"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setPengujiKomprehensif } from "@/actions/pengajuan";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";

export function PengujiKomprehensifPicker({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pProdiNidn, setPProdiNidn] = useState("");
  const [pKeislamanNidn, setPKeislamanNidn] = useState("");
  const [dosen, setDosen] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dosen").then(r => r.json()).then(d => setDosen(d.data || d));
  }, []);

  async function handleSubmit() {
    const pProdi = dosen.find(d => d.nidn === pProdiNidn);
    const pKeislaman = dosen.find(d => d.nidn === pKeislamanNidn);
    if (!pProdi || !pKeislaman) { toast.error("Dosen tidak ditemukan"); return; }
    if (pProdi.id === pKeislaman.id) { toast.error("Penguji Prodi dan Keislaman harus berbeda"); return; }
    setLoading(true);
    try {
      await setPengujiKomprehensif(pengajuanId, { penguji_prodi_dosen_id: pProdi.id, penguji_keislaman_dosen_id: pKeislaman.id });
      await executeWorkflowAction({ pengajuanId, action: "approve" });
      toast.success("Penguji komprehensif ditetapkan");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Penetapan Penguji Komprehensif</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Penguji Keahlian Prodi (NIDN)</Label>
          <Input placeholder="0115098501" value={pProdiNidn} onChange={e => setPProdiNidn(e.target.value)} />
          {pProdiNidn && dosen.find(d => d.nidn === pProdiNidn) && (
            <p className="text-sm text-green-600">{dosen.find(d => d.nidn === pProdiNidn)!.nama_lengkap}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Penguji Keislaman (NIDN)</Label>
          <Input placeholder="0220077301" value={pKeislamanNidn} onChange={e => setPKeislamanNidn(e.target.value)} />
          {pKeislamanNidn && dosen.find(d => d.nidn === pKeislamanNidn) && (
            <p className="text-sm text-green-600">{dosen.find(d => d.nidn === pKeislamanNidn)!.nama_lengkap}</p>
          )}
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Menyimpan..." : "Tetapkan Penguji & Lanjut"}
      </Button>
    </div>
  );
}
