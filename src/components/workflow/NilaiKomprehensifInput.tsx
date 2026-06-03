"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { inputNilaiKomprehensif } from "@/actions/nilai";

export function NilaiKomprehensifInput({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nilai, setNilai] = useState<number>(0);
  const [catatan, setCatatan] = useState("");
  const [keputusan, setKeputusan] = useState<"lulus" | "tidak_lulus" | "">("");

  async function handleSubmit() {
    if (!keputusan) {
      toast.error("Pilih keputusan");
      return;
    }
    setLoading(true);
    try {
      await inputNilaiKomprehensif(pengajuanId, { nilai: Number(nilai), catatan, keputusan });
      toast.success("Nilai tersimpan");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Nilai Ujian Komprehensif</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Rumus: P = (X1 + X2) / 2. Sistem akan menghitung otomatis setelah kedua penguji input.
        </p>

        <div className="space-y-2">
          <Label htmlFor="nilai">Nilai (0-100)</Label>
          <Input
            id="nilai"
            type="number"
            min={0}
            max={100}
            value={nilai}
            onChange={(e) => setNilai(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="catatan">Catatan/Saran</Label>
          <Textarea
            id="catatan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={4}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Keputusan</legend>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="keputusan"
                value="lulus"
                checked={keputusan === "lulus"}
                onChange={(e) => setKeputusan(e.target.value as "lulus")}
              />
              Lulus
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="keputusan"
                value="tidak_lulus"
                checked={keputusan === "tidak_lulus"}
                onChange={(e) => setKeputusan(e.target.value as "tidak_lulus")}
              />
              Tidak Lulus
            </label>
          </div>
        </fieldset>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Nilai"}
        </Button>
      </CardContent>
    </Card>
  );
}
