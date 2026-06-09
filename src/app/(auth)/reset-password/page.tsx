"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-destructive">Token tidak ditemukan atau tidak valid.</p>
        <Link href="/lupa-password" className="text-sm text-primary hover:underline">
          Minta link reset baru
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== konfirmasi) { setError("Password tidak cocok"); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, password);
      router.push("/login?reset=success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-1">Masukkan password baru Anda.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="password">Password Baru</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Minimal 8 karakter" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="konfirmasi">Konfirmasi Password</Label>
          <Input id="konfirmasi" type="password" value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
