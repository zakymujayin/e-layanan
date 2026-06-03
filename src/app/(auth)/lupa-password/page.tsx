import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function LupaPasswordPage() {
  const adminEmailConfig = await prisma.appConfig.findUnique({ where: { key: "admin_email" } }).catch(() => null);
  const adminEmail = adminEmailConfig?.value ?? "admin@sila.local";

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center text-xl">Lupa Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Reset password otomatis belum tersedia. Hubungi administrator SILA untuk mereset password akun Anda.
        </p>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground">Email Administrator</p>
          <a
            href={`mailto:${adminEmail}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {adminEmail}
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Sertakan nama lengkap, NIM/NIDN/NIP, dan alasan reset password saat menghubungi admin.
        </p>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}>
          ← Kembali ke Login
        </Link>
      </CardContent>
    </Card>
  );
}
