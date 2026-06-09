"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Permintaan Diterima</h2>
        <p className="text-sm text-muted-foreground">
          Jika email Anda terdaftar, link reset password telah dikirim. Bila tidak menerima email
          dalam beberapa menit, hubungi administrator sistem.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          ← Kembali ke login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Lupa Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Masukkan email akun Anda. Link reset akan dikirim jika email terdaftar.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="email@uinbanten.ac.id"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Memproses..." : "Kirim Link Reset"}
        </Button>
        <p className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">← Kembali ke login</Link>
        </p>
      </form>
    </div>
  );
}
