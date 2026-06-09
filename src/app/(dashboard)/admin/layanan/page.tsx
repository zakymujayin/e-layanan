import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { toggleLayananActive } from "@/actions/admin";

export default async function AdminLayananPage() {
  const layananList = await prisma.jenisLayanan.findMany({
    include: {
      kode_klasifikasi: true,
      _count: { select: { pengajuan: true } },
    },
    orderBy: [{ kategori: "asc" }, { urutan: "asc" }],
  });

  const taLayanan = layananList.filter(l => l.kategori === "tugas_akhir");
  const akLayanan = layananList.filter(l => l.kategori === "akademik");

  function LayananGroup({ title, items }: { title: string; items: typeof layananList }) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h2>
        <div className="space-y-2">
          {items.map(l => (
            <div key={l.id} className="flex items-center justify-between gap-4 border rounded-lg px-4 py-3">
              <div className="min-w-0 flex-1 flex items-start gap-3">
                <Badge variant="outline" className="text-xs font-mono shrink-0 mt-0.5">{l.kode}</Badge>
                <div>
                  <p className="text-sm font-medium">{l.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    Kode klasifikasi: {l.kode_klasifikasi.kode} · {l._count.pengajuan} pengajuan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {l.is_active ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">Aktif</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-xs">Nonaktif</Badge>
                )}
                <form action={toggleLayananActive.bind(null, l.id)}>
                  <button
                    type="submit"
                    className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${l.is_active ? "border-destructive/50 text-destructive hover:bg-destructive/10" : "border-green-500/50 text-green-700 hover:bg-green-50"}`}
                  >
                    {l.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Jenis Layanan</h1>
        <p className="text-muted-foreground">
          Aktifkan atau nonaktifkan layanan. Layanan nonaktif tidak muncul di halaman pilih layanan mahasiswa.
        </p>
      </div>

      <LayananGroup title="Layanan Tugas Akhir (TA)" items={taLayanan} />
      <LayananGroup title="Layanan Akademik (AK)" items={akLayanan} />
    </div>
  );
}
