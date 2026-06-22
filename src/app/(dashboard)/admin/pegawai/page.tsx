import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { updatePegawai, togglePegawaiActive } from "@/actions/admin";
import { format } from "date-fns";

function PegawaiRow({ pegawai }: { pegawai: any }) {
  return (
    <details className="group border rounded-lg">
      <summary className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 cursor-pointer list-none hover:bg-muted/50 transition-colors">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{pegawai.nama_lengkap}</p>
          <p className="text-xs text-muted-foreground">
            NIP: {pegawai.nip} · {pegawai.unit_kerja || "—"}
            {pegawai.golongan ? ` · Gol. ${pegawai.golongan}` : ""}
          </p>
          {pegawai.user && <p className="text-xs text-muted-foreground">{pegawai.user.email}</p>}
        </div>
        <Badge className={pegawai.is_active ? "bg-green-100 text-green-800 text-xs" : "text-xs"} variant={pegawai.is_active ? "default" : "outline"}>
          {pegawai.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      </summary>

      <div className="border-t px-4 py-4 bg-muted/20">
        <div className="grid gap-4 md:grid-cols-2">
          <form action={updatePegawai.bind(null, pegawai.id)} className="space-y-3 min-w-0">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
              <input name="nama_lengkap" defaultValue={pegawai.nama_lengkap} required className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Golongan</label>
              <input name="golongan" defaultValue={pegawai.golongan ?? ""} placeholder="III/b" className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Unit Kerja</label>
              <input name="unit_kerja" defaultValue={pegawai.unit_kerja ?? ""} placeholder="Bagian Akademik" className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Simpan
            </button>
          </form>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">NIP</p>
              <p className="text-sm font-mono">{pegawai.nip}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Akun</p>
              <p className="text-sm">{pegawai.user?.email ?? "Belum ada akun"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Terdaftar</p>
              <p className="text-sm">{format(new Date(pegawai.created_at), "d MMM yyyy")}</p>
            </div>
            <form action={togglePegawaiActive.bind(null, pegawai.id)}>
              <button type="submit" className={`rounded-md px-3 py-1.5 text-sm font-medium border transition-colors ${pegawai.is_active ? "border-destructive/50 text-destructive hover:bg-destructive/10" : "border-green-500/50 text-green-700 hover:bg-green-50"}`}>
                {pegawai.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </details>
  );
}

export default async function AdminPegawaiPage() {
  const pegawaiList = await prisma.pegawai.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { nama_lengkap: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pegawai</h1>
        <p className="text-muted-foreground">{pegawaiList.length} pegawai terdaftar · Klik baris untuk edit</p>
      </div>
      <div className="space-y-2">
        {pegawaiList.map(p => <PegawaiRow key={p.id} pegawai={p} />)}
        {pegawaiList.length === 0 && <p className="text-sm text-center text-muted-foreground py-8">Belum ada data pegawai.</p>}
      </div>
    </div>
  );
}
