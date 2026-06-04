import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkLayananEligibility } from "@/lib/eligibility";

export default async function PilihLayananPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);

  const [layanan, user] = await Promise.all([
    prisma.jenisLayanan.findMany({
      where: { is_active: true },
      orderBy: { kode: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: { mahasiswa: true },
    }),
  ]);

  if (!user) redirect("/login");

  // Build eligibility map — only for mahasiswa
  const eligibilityMap: Record<string, { eligible: boolean; reason?: string }> = {};
  if (user.mahasiswa) {
    const results = await Promise.all(
      layanan.map((l) =>
        checkLayananEligibility(user.mahasiswa!.id, user.mahasiswa!.status_mahasiswa, l.kode).then((r) => ({
          kode: l.kode,
          ...r,
        }))
      )
    );
    for (const r of results) eligibilityMap[r.kode] = { eligible: r.eligible, reason: r.reason };
  }

  const ta = layanan.filter((l) => l.kode.startsWith("TA-"));
  const ak = layanan.filter((l) => l.kode.startsWith("AK-"));

  function renderCard(l: (typeof layanan)[number]) {
    const elig = user!.mahasiswa ? (eligibilityMap[l.kode] ?? { eligible: true }) : { eligible: true };

    if (!elig.eligible) {
      return (
        <div
          key={l.kode}
          className="rounded-lg border border-dashed p-4 opacity-50 cursor-not-allowed"
          title={elig.reason}
        >
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">{l.kode}</Badge>
          </div>
          <p className="font-semibold text-sm">{l.nama}</p>
          <p className="text-xs text-muted-foreground mt-1">{elig.reason}</p>
        </div>
      );
    }

    return (
      <Link key={l.kode} href={`/pengajuan/baru/${l.kode}`}>
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
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ajukan Layanan Baru</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Tugas Akhir</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ta.map((l) => renderCard(l))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Layanan Akademik</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ak.map((l) => renderCard(l))}
        </div>
      </div>
    </div>
  );
}
