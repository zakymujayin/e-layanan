"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { inputNilaiMunaqasyah } from "@/actions/nilai";

export function NilaiMunaqasyahInput({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nilaiP1, setNilaiP1] = useState("");
  const [nilaiP2, setNilaiP2] = useState("");
  const [nilaiPenguji1, setNilaiPenguji1] = useState("");
  const [nilaiPenguji2, setNilaiPenguji2] = useState("");
  const [catatan, setCatatan] = useState("");
  const [keputusan, setKeputusan] = useState("");

  async function handleSubmit() {
    const n1 = Number(nilaiP1);
    const n2 = Number(nilaiP2);
    const n3 = Number(nilaiPenguji1);
    const n4 = Number(nilaiPenguji2);

    if (!nilaiP1 || !nilaiP2 || !nilaiPenguji1 || !nilaiPenguji2) {
      toast.error("Semua nilai wajib diisi");
      return;
    }
    if (n1 < 0 || n1 > 100 || n2 < 0 || n2 > 100 || n3 < 0 || n3 > 100 || n4 < 0 || n4 > 100) {
      toast.error("Semua nilai harus antara 0-100");
      return;
    }
    if (!keputusan) {
      toast.error("Keputusan wajib dipilih");
      return;
    }

    setLoading(true);
    try {
      await inputNilaiMunaqasyah(pengajuanId, {
        nilaiP1: n1,
        nilaiP2: n2,
        nilaiPenguji1: n3,
        nilaiPenguji2: n4,
        keputusan: keputusan as "lulus" | "tidak_lulus",
        catatan,
      });
      toast.success("Nilai berhasil disimpan");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan nilai");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Nilai Munaqasyah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nilaiP1">Nilai Pembimbing 1</Label>
            <Input
              id="nilaiP1"
              type="number"
              min={0}
              max={100}
              value={nilaiP1}
              onChange={(e) => setNilaiP1(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nilaiP2">Nilai Pembimbing 2</Label>
            <Input
              id="nilaiP2"
              type="number"
              min={0}
              max={100}
              value={nilaiP2}
              onChange={(e) => setNilaiP2(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nilaiPenguji1">Nilai Penguji 1</Label>
            <Input
              id="nilaiPenguji1"
              type="number"
              min={0}
              max={100}
              value={nilaiPenguji1}
              onChange={(e) => setNilaiPenguji1(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nilaiPenguji2">Nilai Penguji 2</Label>
            <Input
              id="nilaiPenguji2"
              type="number"
              min={0}
              max={100}
              value={nilaiPenguji2}
              onChange={(e) => setNilaiPenguji2(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="catatan">Catatan Majelis</Label>
          <Textarea
            id="catatan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Keputusan</Label>
          <RadioGroup value={keputusan} onValueChange={setKeputusan}>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="lulus" />
              Lulus
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="tidak_lulus" />
              Tidak Lulus
            </label>
          </RadioGroup>
        </div>

        <p className="text-sm text-muted-foreground">
          Setelah input, sistem akan menghitung yudisium otomatis (Pujian/Sangat Memuaskan/Memuaskan)
        </p>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Nilai"}
        </Button>
      </CardContent>
    </Card>
  );
}
