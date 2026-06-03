import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { headers } from "next/headers";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

async function verifyToken(token: string, ip: string) {
  const dokumen = await prisma.dokumenVerifikasi.findUnique({
    where: { token },
    include: {
      dokumen: {
        include: {
          pengajuan: {
            include: {
              mahasiswa: { include: { prodi: { include: { fakultas: true } } } },
              jenis_layanan: true,
            },
          },
        },
      },
    },
  });

  // Log attempt
  if (dokumen) {
    await prisma.verifikasiLog.create({
      data: {
        dokumen_verifikasi_id: dokumen.id,
        ip_address: ip,
        is_success: dokumen.is_active && dokumen.dokumen.pengajuan.status === "selesai",
      },
    }).catch(() => {});
  }

  return dokumen;
}

export default async function VerifikasiPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token?.trim();

  let verificationResult: Awaited<ReturnType<typeof verifyToken>> | null = null;
  let error: string | null = null;

  if (token) {
    try {
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
      verificationResult = await verifyToken(token, ip);
      if (!verificationResult) error = "Token tidak ditemukan atau tidak valid.";
    } catch {
      error = "Terjadi kesalahan saat memverifikasi dokumen.";
    }
  }

  const isValid = verificationResult?.is_active && verificationResult.dokumen.pengajuan.status === "selesai";

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-start pt-16 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verifikasi Dokumen</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan token verifikasi atau scan QR Code untuk memastikan keaslian dokumen.
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="pt-6">
            <form method="GET" className="flex gap-2">
              <input
                type="text"
                name="token"
                placeholder="Masukkan token verifikasi..."
                defaultValue={token ?? ""}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Verifikasi
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {token && (
          <>
            {error && (
              <Card className="border-destructive/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-destructive shrink-0" />
                    <div>
                      <CardTitle className="text-base text-destructive">Dokumen Tidak Valid</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {verificationResult && (
              <Card className={isValid ? "border-green-500/50" : "border-destructive/50"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {isValid ? (
                      <CheckCircle2 className="h-7 w-7 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-7 w-7 text-destructive shrink-0" />
                    )}
                    <div>
                      <CardTitle className={`text-base ${isValid ? "text-green-700" : "text-destructive"}`}>
                        {isValid ? "Dokumen Valid & Sah" : "Dokumen Tidak Aktif"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Token: <span className="font-mono">{token}</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="rounded-md bg-muted p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama Mahasiswa</span>
                      <span className="font-medium">{verificationResult.dokumen.pengajuan.mahasiswa.nama_lengkap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NIM</span>
                      <span className="font-medium">{verificationResult.dokumen.pengajuan.mahasiswa.nim}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program Studi</span>
                      <span className="font-medium">{verificationResult.dokumen.pengajuan.mahasiswa.prodi?.nama ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jenis Layanan</span>
                      <span className="font-medium">{verificationResult.dokumen.pengajuan.jenis_layanan.nama}</span>
                    </div>
                    {verificationResult.dokumen.nomor_surat && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nomor Surat</span>
                        <span className="font-medium font-mono text-xs">{verificationResult.dokumen.nomor_surat}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Diterbitkan</span>
                      <span className="font-medium">
                        {verificationResult.dokumen.finalized_at
                          ? format(verificationResult.dokumen.finalized_at, "d MMMM yyyy", { locale: idLocale })
                          : format(verificationResult.dokumen.generated_at, "d MMMM yyyy", { locale: idLocale })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status Dokumen</span>
                      <Badge className={isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {isValid ? "Sah & Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Dokumen ini diterbitkan oleh Fakultas Ushuluddin dan Adab UIN SMH Banten
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline underline-offset-2">← Kembali ke Beranda</Link>
        </p>
      </div>
    </div>
  );
}
