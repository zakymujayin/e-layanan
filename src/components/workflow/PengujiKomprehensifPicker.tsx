"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { setPengujiKomprehensif } from "@/actions/pengajuan";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";

interface Dosen {
  id: number;
  nidn: string;
  nama_lengkap: string;
}

export function PengujiKomprehensifPicker({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pProdiId, setPProdiId] = useState("");
  const [pKeislamanId, setPKeislamanId] = useState("");
  const [dosen, setDosen] = useState<Dosen[]>([]);

  useEffect(() => {
    fetch("/api/dosen").then(r => r.json()).then(d => setDosen(d.data || d));
  }, []);

  async function handleSubmit() {
    const idProdi = Number(pProdiId);
    const idKeislaman = Number(pKeislamanId);
    if (!idProdi || !idKeislaman) { toast.error("Semua penguji harus dipilih"); return; }
    if (idProdi === idKeislaman) { toast.error("Penguji Prodi dan Keislaman harus berbeda"); return; }
    setLoading(true);
    try {
      await setPengujiKomprehensif(pengajuanId, { penguji_prodi_dosen_id: idProdi, penguji_keislaman_dosen_id: idKeislaman });
      await executeWorkflowAction({ pengajuanId, action: "approve" });
      toast.success("Penguji komprehensif ditetapkan");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (dosen.length === 0) return <p className="text-sm text-muted-foreground">Memuat data dosen...</p>;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Penetapan Penguji Komprehensif</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Penguji Keahlian Prodi</Label>
          <Select value={pProdiId} onValueChange={(v) => setPProdiId(v ?? "")}>
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
          <Label>Penguji Keislaman</Label>
          <Select value={pKeislamanId} onValueChange={(v) => setPKeislamanId(v ?? "")}>
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
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Menyimpan..." : "Tetapkan Penguji & Lanjut"}
      </Button>
    </div>
  );
}
