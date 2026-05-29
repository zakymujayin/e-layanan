import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export default async function PilihLayananPage() {
  const layanan = await prisma.jenisLayanan.findMany({
    where: { is_active: true },
    orderBy: { kode: "asc" },
  });

  const ta = layanan.filter((l) => l.kode.startsWith("TA-"));
  const ak = layanan.filter((l) => l.kode.startsWith("AK-"));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ajukan Layanan Baru</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Tugas Akhir</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ta.map((l) => (
            <Link key={l.id} href={`/pengajuan/baru/${l.kode}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{l.kode}</Badge>
                  </div>
                  <CardTitle className="text-base">{l.nama}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Ajukan {l.nama.toLowerCase()} melalui sistem</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Layanan Akademik</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ak.map((l) => (
            <Link key={l.id} href={`/pengajuan/baru/${l.kode}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{l.kode}</Badge>
                  </div>
                  <CardTitle className="text-base">{l.nama}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Ajukan {l.nama.toLowerCase()} melalui sistem</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
