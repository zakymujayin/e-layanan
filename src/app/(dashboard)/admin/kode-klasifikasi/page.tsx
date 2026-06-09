import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createKodeKlasifikasi, updateKodeKlasifikasi } from "@/actions/admin";

export default async function AdminKodeKlasifikasiPage() {
  const kodeList = await prisma.kodeKlasifikasi.findMany({
    include: { _count: { select: { jenis_layanan: true } } },
    orderBy: { kode: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kode Klasifikasi Surat</h1>
        <p className="text-muted-foreground">
          Kode digunakan dalam format penomoran surat: {" "}
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">0001/Un.17/F.III/<strong>[KODE]</strong>/VI/2026</span>
        </p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {kodeList.map(kode => (
          <details key={kode.id} className="border rounded-lg">
            <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none hover:bg-muted/50 transition-colors">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <Badge variant="outline" className="text-xs font-mono shrink-0">{kode.kode}</Badge>
                <div>
                  <p className="text-sm font-medium">{kode.nama}</p>
                  {kode.deskripsi && <p className="text-xs text-muted-foreground">{kode.deskripsi}</p>}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">{kode._count.jenis_layanan} layanan</Badge>
            </summary>
            <div className="border-t px-4 py-4 bg-muted/20">
              <form action={updateKodeKlasifikasi.bind(null, kode.id)} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Nama</label>
                  <input name="nama" defaultValue={kode.nama} required className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Deskripsi</label>
                  <input name="deskripsi" defaultValue={kode.deskripsi ?? ""} className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shrink-0">
                  Simpan
                </button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">Kode tidak bisa diubah karena digunakan dalam nomor surat yang sudah ada.</p>
            </div>
          </details>
        ))}
      </div>

      {/* Tambah */}
      <Card>
        <CardHeader><CardTitle>Tambah Kode Klasifikasi</CardTitle></CardHeader>
        <CardContent>
          <form action={createKodeKlasifikasi} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Kode</label>
                <input name="kode" placeholder="PP.00.9" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring" />
                <p className="text-xs text-muted-foreground mt-1">Contoh: PP.00.9, KP.01.2</p>
              </div>
              <div>
                <label className="text-sm font-medium">Nama</label>
                <input name="nama" placeholder="Pendidikan dan Pengajaran" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium">Deskripsi <span className="text-muted-foreground">(opsional)</span></label>
                <input name="deskripsi" placeholder="Keterangan singkat" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Tambah Kode
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
