"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

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

  // Success state
  if (sent) {
    return (
      <Card className="w-full shadow-xl rounded-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Terkirim</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Jika email Anda terdaftar, link reset password telah dikirim. Periksa folder spam jika tidak menerima email.
          </p>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl rounded-2xl border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Lupa Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Masukkan email akun Anda. Link reset akan dikirim jika email terdaftar.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="email@uinbanten.ac.id"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Memproses..." : "Kirim Link Reset"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
