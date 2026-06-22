import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignStructuralPosition, removeStructuralPosition } from "@/actions/admin";

const MANAGED_POSITIONS = [
  { code: "kaprodi", label: "Ketua Program Studi", needsProdi: true },
  { code: "sekprodi", label: "Sekretaris Program Studi", needsProdi: true },
  { code: "wakil_dekan_1", label: "Wakil Dekan I (Bidang Akademik)", needsProdi: false },
  { code: "dekan", label: "Dekan", needsProdi: false },
  { code: "kepala_lab", label: "Kepala Laboratorium", needsProdi: false },
];

function RemoveButton({ positionId }: { positionId: number }) {
  return (
    <form action={removeStructuralPosition.bind(null, positionId)}>
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        Kosongkan
      </Button>
    </form>
  );
}

export default async function AdminPositionsPage() {
  const [positions, dosenList, prodiList] = await Promise.all([
    prisma.structuralPosition.findMany({
      where: { is_active: true },
      include: { dosen: true, prodi: true },
      orderBy: { start_date: "desc" },
    }),
    prisma.dosen.findMany({ where: { is_active: true }, orderBy: { nama_lengkap: "asc" } }),
    prisma.prodi.findMany({ where: { is_active: true }, orderBy: { nama: "asc" } }),
  ]);

  const positionMap = new Map<string, (typeof positions)[0]>();
  for (const p of positions) {
    if (!positionMap.has(p.position_code)) positionMap.set(p.position_code, p);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jabatan Struktural</h1>
        <p className="text-muted-foreground">
          Kelola pemegang jabatan yang digunakan oleh sistem workflow untuk mengarahkan pengajuan.
        </p>
      </div>

      <div className="space-y-4">
        {MANAGED_POSITIONS.map(({ code, label, needsProdi }) => {
          const current = positionMap.get(code);
          return (
            <Card key={code}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{label}</CardTitle>
                    {current ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {current.dosen?.nama_lengkap ?? "—"}
                        {current.prodi ? ` · ${current.prodi.nama}` : ""}
                        {" · "}
                        <span className="text-xs">
                          Sejak {current.start_date.toLocaleDateString("id-ID")}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground italic">Belum ada pemegang jabatan</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {current ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Kosong</Badge>
                    )}
                    {current && <RemoveButton positionId={current.id} />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form action={assignStructuralPosition} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="position_code" value={code} />
                  <div className="space-y-1.5 min-w-[220px]">
                    <Label>Dosen</Label>
                    <Select name="dosen_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dosen" />
                      </SelectTrigger>
                      <SelectContent>
                        {dosenList.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.nama_lengkap}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {needsProdi && (
                    <div className="space-y-1.5 min-w-[160px]">
                      <Label>Program Studi</Label>
                      <Select name="prodi_id">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih prodi" />
                        </SelectTrigger>
                        <SelectContent>
                          {prodiList.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button type="submit" variant="outline" size="sm">
                    Tetapkan
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
