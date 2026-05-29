"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      identifier: form.get("identifier") as string,
      password: form.get("password") as string,
      redirect: false,
    });
    if (result?.error) {
      setError("Email/NIM/NIDN/NIP atau password salah");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk ke SILA</CardTitle>
        <CardDescription>
          Sistem Informasi Layanan Akademik
          <br />
          Fakultas Ushuluddin dan Adab
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email / NIM / NIDN / NIP</Label>
            <Input
              id="identifier"
              name="identifier"
              placeholder="221360001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Masuk..." : "Masuk"}
          </Button>
          <div className="text-center text-sm">
            <Link
              href="/lupa-password"
              className="text-muted-foreground hover:underline"
            >
              Lupa Password?
            </Link>
          </div>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Belum punya akun? </span>
            <Link href="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
