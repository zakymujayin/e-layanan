"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { registerMahasiswa } from "@/actions/auth";
import { nimValidator } from "@/lib/nim-validator/local";
import Link from "next/link";
import { UserPlus, Hash, Mail, Lock, ArrowRight, ArrowLeft, GraduationCap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"nim" | "form">("nim");
  const [nim, setNim] = useState("");
  const [nimData, setNimData] = useState<{
    nama: string;
    prodi: string;
    angkatan: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function checkNim(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const result = await nimValidator.validate(nim);
    if (!result.valid) {
      toast.error("NIM tidak valid atau tidak terdaftar");
    } else {
      setNimData(result);
      setStep("form");
    }
    setIsLoading(false);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await registerMahasiswa({
      nim,
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
    if (result.success) {
      toast.success("Pendaftaran berhasil! Silakan login.");
      router.push("/login");
    } else {
      toast.error(result.error?.message);
    }
    setIsLoading(false);
  }

  // Step 2: Fill data form
  if (step === "form" && nimData) {
    return (
      <Card className="w-full shadow-xl rounded-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Lengkapi Data</h2>
        </CardHeader>
        <CardContent>
          {/* Mahasiswa info card */}
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{nimData.nama}</p>
              <p className="text-xs text-muted-foreground">
                {nimData.prodi} · Angkatan {nimData.angkatan}
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" className="pl-10" placeholder="email@student.uinbanten.ac.id" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" name="password" type="password" className="pl-10" minLength={8} placeholder="Minimal 8 karakter" required />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setStep("nim")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Ganti NIM
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: NIM input
  return (
    <Card className="w-full shadow-xl rounded-2xl border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Daftar Akun</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Masukkan NIM untuk verifikasi
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={checkNim} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="nim"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="pl-10"
                placeholder="221360001"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Memeriksa..." : (
              <span className="inline-flex items-center gap-2">
                Lanjutkan <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
