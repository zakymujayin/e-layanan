import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateDosen, toggleDosenActive } from "@/actions/admin";
import { format } from "date-fns";

function DosenRow({ dosen }: { dosen: any }) {
  const namaLengkap = [dosen.gelar_depan, dosen.nama_lengkap, dosen.gelar_belakang]
    .filter(Boolean).join(" ");

  return (
    <details className="group border rounded-lg">
      <summary className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 cursor-pointer list-none hover:bg-muted/50 transition-colors">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{namaLengkap || dosen.nama_lengkap}</p>
          <p className="text-xs text-muted-foreground">{dosen.nidn} · {dosen.jabatan_fungsional || "—"}</p>
          {dosen.user && (
            <p className="text-xs text-muted-foreground">{dosen.user.email}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {dosen.is_active ? (
            <Badge className="bg-green-100 text-green-800 text-xs">Aktif</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs">Nonaktif</Badge>
          )}
        </div>
      </summary>

      <div className="border-t px-4 py-4 bg-muted/20">
        <div className="grid gap-4 md:grid-cols-2">
          <form action={updateDosen.bind(null, dosen.id)} className="space-y-3 min-w-0">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Gelar Depan</label>
                <input name="gelar_depan" defaultValue={dosen.gelar_depan ?? ""} placeholder="Dr." className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nama Lengkap</label>
                <input name="nama_lengkap" defaultValue={dosen.nama_lengkap} required className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Gelar Belakang</label>
              <input name="gelar_belakang" defaultValue={dosen.gelar_belakang ?? ""} placeholder="M.Ag." className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Jabatan Fungsional</label>
              <input name="jabatan_fungsional" defaultValue={dosen.jabatan_fungsional ?? ""} placeholder="Lektor Kepala" className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bidang Keahlian</label>
              <input name="bidang_keahlian" defaultValue={dosen.bidang_keahlian ?? ""} className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Pangkat / Golongan</label>
              <input name="pangkat_golongan" defaultValue={dosen.pangkat_golongan ?? ""} placeholder="III/d" className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Simpan
            </button>
          </form>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">NIDN</p>
              <p className="text-sm font-mono">{dosen.nidn}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Akun Terhubung</p>
              <p className="text-sm">{dosen.user?.email ?? "Belum ada akun"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Terdaftar</p>
              <p className="text-sm">{format(new Date(dosen.created_at), "d MMM yyyy")}</p>
            </div>
            <form action={toggleDosenActive.bind(null, dosen.id)}>
              <button type="submit" className={`rounded-md px-3 py-1.5 text-sm font-medium border transition-colors ${dosen.is_active ? "border-destructive/50 text-destructive hover:bg-destructive/10" : "border-green-500/50 text-green-700 hover:bg-green-50"}`}>
                {dosen.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </details>
  );
}

export default async function AdminDosenPage() {
  const dosenList = await prisma.dosen.findMany({
    include: { user: { select: { email: true, is_active: true } } },
    orderBy: { nama_lengkap: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Dosen</h1>
        <p className="text-muted-foreground">{dosenList.length} dosen terdaftar · Klik baris untuk edit</p>
      </div>

      <div className="space-y-2">
        {dosenList.map(d => <DosenRow key={d.id} dosen={d} />)}
        {dosenList.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-8">Belum ada data dosen.</p>
        )}
      </div>
    </div>
  );
}
