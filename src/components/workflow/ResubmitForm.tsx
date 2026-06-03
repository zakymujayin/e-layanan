"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { resubmitTA06 } from "@/actions/pengajuan";

export function ResubmitForm({ pengajuanId }: { pengajuanId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await resubmitTA06(pengajuanId, formData);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal resubmit");
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Upload Ulang (Revisi Turnitin)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Revisi draft skripsi Anda untuk menurunkan similarity. Maksimal 3x revisi.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Submission ID Turnitin (baru)</Label>
            <Input name="submission_id_turnitin" placeholder="ID baru dari Turnitin" required />
          </div>
          <div className="space-y-2">
            <Label>URL Turnitin (baru)</Label>
            <Input name="url_turnitin" type="url" placeholder="https://..." required />
          </div>
          <div className="space-y-2">
            <Label>Similarity Percentage (%)</Label>
            <Input name="similarity_percentage" type="number" min="0" max="100" placeholder="Diharapkan lebih rendah" required />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Mengirim..." : "Upload Ulang"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
