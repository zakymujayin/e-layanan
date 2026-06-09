import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createProdi, updateProdi, toggleProdiActive } from "@/actions/admin";

export default async function AdminProdiPage() {
  const [prodiList, fakultasList] = await Promise.all([
    prisma.prodi.findMany({ include: { fakultas: true, _count: { select: { mahasiswa: true } } }, orderBy: { kode: "asc" } }),
    prisma.fakultas.findMany({ orderBy: { nama: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Program Studi</h1>
        <p className="text-muted-foreground">{prodiList.length} program studi</p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {prodiList.map(prodi => (
          <details key={prodi.id} className="border rounded-lg">
            <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none hover:bg-muted/50 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">{prodi.kode}</Badge>
                  <p className="text-sm font-medium">{prodi.nama}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {prodi.fakultas.nama} · {prodi._count.mahasiswa} mahasiswa
                </p>
              </div>
              <Badge className={prodi.is_active ? "bg-green-100 text-green-800 text-xs" : "text-xs"} variant={prodi.is_active ? "default" : "outline"}>
                {prodi.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </summary>
            <div className="border-t px-4 py-4 bg-muted/20 flex items-end gap-4">
              <form action={updateProdi.bind(null, prodi.id)} className="flex items-end gap-2 flex-1">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground">Nama Prodi</label>
                  <input name="nama" defaultValue={prodi.nama} required className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shrink-0">
                  Simpan
                </button>
              </form>
              <form action={toggleProdiActive.bind(null, prodi.id)}>
                <button type="submit" className={`rounded-md px-3 py-1.5 text-sm font-medium border transition-colors shrink-0 ${prodi.is_active ? "border-destructive/50 text-destructive hover:bg-destructive/10" : "border-green-500/50 text-green-700 hover:bg-green-50"}`}>
                  {prodi.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>

      {/* Tambah Prodi */}
      <Card>
        <CardHeader><CardTitle>Tambah Program Studi</CardTitle></CardHeader>
        <CardContent>
          <form action={createProdi} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Kode</label>
                <input name="kode" placeholder="IH" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium">Nama Program Studi</label>
                <input name="nama" placeholder="Ilmu Hadis" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium">Fakultas</label>
                <select name="fakultas_id" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Pilih fakultas</option>
                  {fakultasList.map(f => (
                    <option key={f.id} value={f.id}>{f.nama}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Tambah Prodi
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
