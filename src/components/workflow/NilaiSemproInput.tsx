"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { inputNilaiSempro } from "@/actions/nilai";

export function NilaiSemproInput({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nilai, setNilai] = useState<number>(0);
  const [catatan, setCatatan] = useState("");
  const [keputusan, setKeputusan] = useState<"layak" | "tidak_layak" | "">("");

  async function handleSubmit() {
    if (!keputusan) {
      toast.error("Pilih keputusan");
      return;
    }
    setLoading(true);
    try {
      await inputNilaiSempro(pengajuanId, { nilai, catatan, keputusan });
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
        <CardTitle>Input Nilai Seminar Proposal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                value="layak"
                checked={keputusan === "layak"}
                onChange={(e) => setKeputusan(e.target.value as "layak")}
              />
              Layak
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="keputusan"
                value="tidak_layak"
                checked={keputusan === "tidak_layak"}
                onChange={(e) => setKeputusan(e.target.value as "tidak_layak")}
              />
              Tidak Layak
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
