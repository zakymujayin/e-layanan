"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfil, changePassword, uploadTtdScan } from "@/actions/profil";
import { CheckCircle, AlertCircle, Upload } from "lucide-react";

function ActionMessage({ state }: { state: { error?: string; success?: boolean } | null }) {
  if (!state) return null;
  if (state.error) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {state.error}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
      <CheckCircle className="h-4 w-4 shrink-0" />
      Berhasil disimpan
    </div>
  );
}

async function updateProfilAction(_: any, formData: FormData) {
  try {
    await updateProfil(formData);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function changePasswordAction(_: any, formData: FormData) {
  try {
    await changePassword(formData);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function uploadTtdAction(_: any, formData: FormData) {
  try {
    await uploadTtdScan(formData);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export function UpdateProfilForm({ namaLengkap, email }: { namaLengkap: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfilAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nama Lengkap</Label>
          <Input name="nama_lengkap" defaultValue={namaLengkap} required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled className="bg-muted" />
        </div>
      </div>
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Password Lama</Label>
        <Input type="password" name="old_password" required />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Password Baru</Label>
          <Input type="password" name="new_password" required minLength={8} />
        </div>
        <div className="space-y-1.5">
          <Label>Konfirmasi Password</Label>
          <Input type="password" name="confirm_password" required />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
      <ActionMessage state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Memproses..." : "Ganti Password"}
      </Button>
    </form>
  );
}

export function TtdScanForm({ hasTtd }: { hasTtd: boolean }) {
  const [state, action, pending] = useActionState(uploadTtdAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="rounded-md border border-dashed p-4 text-center">
        {hasTtd ? (
          <p className="text-sm text-muted-foreground mb-3">
            TTD scan sudah ada. Upload ulang untuk mengganti.
          </p>
        ) : (
          <div className="mb-3">
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Upload Tanda Tangan Scan</p>
            <p className="text-xs text-muted-foreground">JPG atau PNG, maks 2MB</p>
          </div>
        )}
        <Input
          type="file"
          name="ttd_scan"
          accept=".jpg,.jpeg,.png"
          required
          className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        TTD scan digunakan untuk dokumen final PDF. Pastikan tanda tangan jelas di atas kertas putih.
      </p>
      <ActionMessage state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Mengupload..." : hasTtd ? "Ganti TTD Scan" : "Upload TTD Scan"}
      </Button>
    </form>
  );
}
