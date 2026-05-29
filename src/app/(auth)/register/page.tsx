"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { registerMahasiswa } from "@/actions/auth";
import { nimValidator } from "@/lib/nim-validator/local";

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

  if (step === "form" && nimData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lengkapi Data</CardTitle>
          <CardDescription>
            {nimData.nama} — {nimData.prodi} — Angkatan {nimData.angkatan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Akun</CardTitle>
        <CardDescription>
          Masukkan NIM Anda untuk memulai pendaftaran
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={checkNim} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <Input
              id="nim"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="221360001"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Memeriksa..." : "Lanjutkan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
