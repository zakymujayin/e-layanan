"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { setPengujiTA03 } from "@/actions/pengajuan";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";

interface Dosen {
  id: number;
  nidn: string;
  nama_lengkap: string;
}

export function PengujiPicker({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [p1Id, setP1Id] = useState("");
  const [p2Id, setP2Id] = useState("");
  const [dosen, setDosen] = useState<Dosen[]>([]);

  useEffect(() => {
    fetch("/api/dosen").then(r => r.json()).then(d => setDosen(d.data || d));
  }, []);

  async function handleSubmit() {
    const id1 = Number(p1Id);
    const id2 = Number(p2Id);
    if (!id1 || !id2) { toast.error("Semua penguji harus dipilih"); return; }
    if (id1 === id2) { toast.error("Penguji 1 dan 2 harus berbeda"); return; }
    setLoading(true);
    try {
      await setPengujiTA03(pengajuanId, { penguji_1_dosen_id: id1, penguji_2_dosen_id: id2 });
      await executeWorkflowAction({ pengajuanId, action: "approve" });
      toast.success("Penguji ditetapkan");
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
      <h3 className="font-semibold">Penetapan Penguji</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Penguji 1</Label>
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
          <Label>Penguji 2</Label>
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
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Menyimpan..." : "Tetapkan Penguji & Lanjut"}
      </Button>
    </div>
  );
}
