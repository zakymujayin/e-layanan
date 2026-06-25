import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignStructuralPosition, removeStructuralPosition } from "@/actions/admin";
import { Separator } from "@/components/ui/separator";

type ManagedPosition = {
  code: string;
  label: string;
  needsProdi: boolean;
  type: "dosen" | "pegawai";
};

const DOSEN_POSITIONS: ManagedPosition[] = [
  { code: "kaprodi", label: "Ketua Program Studi", needsProdi: true, type: "dosen" },
  { code: "sekprodi", label: "Sekretaris Program Studi", needsProdi: true, type: "dosen" },
  { code: "wakil_dekan_1", label: "Wakil Dekan I (Bidang Akademik)", needsProdi: false, type: "dosen" },
  { code: "dekan", label: "Dekan", needsProdi: false, type: "dosen" },
  { code: "kepala_lab", label: "Kepala Laboratorium", needsProdi: false, type: "dosen" },
];

const PEGAWAI_POSITIONS: ManagedPosition[] = [
  { code: "kabag_tu", label: "Kepala Bagian Tata Usaha", needsProdi: false, type: "pegawai" },
  { code: "staff_prodi", label: "Staff Program Studi", needsProdi: false, type: "pegawai" },
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
  const [positions, dosenList, pegawaiList, prodiList] = await Promise.all([
    prisma.structuralPosition.findMany({
      where: { is_active: true },
      include: { dosen: true, pegawai: true, prodi: true },
      orderBy: { start_date: "desc" },
    }),
    prisma.dosen.findMany({ where: { is_active: true }, orderBy: { nama_lengkap: "asc" } }),
    prisma.pegawai.findMany({ where: { is_active: true }, orderBy: { nama_lengkap: "asc" } }),
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

      {/* Dosen Positions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Jabatan Dosen</h2>
        <div className="space-y-4">
          {DOSEN_POSITIONS.map(({ code, label, needsProdi }) => {
            const current = positionMap.get(code);
            const holderName = current?.dosen?.nama_lengkap;

            return (
              <PositionCard
                key={code}
                current={current}
                holderName={holderName}
                code={code}
                label={label}
                needsProdi={needsProdi}
                dosenList={dosenList}
                pegawaiList={pegawaiList}
                prodiList={prodiList}
                type="dosen"
              />
            );
          })}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Pegawai Positions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Jabatan Administrasi</h2>
        <div className="space-y-4">
          {PEGAWAI_POSITIONS.map(({ code, label, needsProdi }) => {
            const current = positionMap.get(code);
            const holderName = current?.pegawai?.nama_lengkap;

            return (
              <PositionCard
                key={code}
                current={current}
                holderName={holderName}
                code={code}
                label={label}
                needsProdi={needsProdi}
                dosenList={dosenList}
                pegawaiList={pegawaiList}
                prodiList={prodiList}
                type="pegawai"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PositionCard({
  current,
  holderName,
  code,
  label,
  needsProdi,
  dosenList,
  pegawaiList,
  prodiList,
  type,
}: {
  current: { id: number; start_date: Date; dosen?: { nama_lengkap: string } | null; pegawai?: { nama_lengkap: string } | null; prodi?: { nama: string } | null } | undefined;
  holderName: string | undefined;
  code: string;
  label: string;
  needsProdi: boolean;
  dosenList: { id: number; nama_lengkap: string }[];
  pegawaiList: { id: number; nama_lengkap: string }[];
  prodiList: { id: number; nama: string }[];
  type: "dosen" | "pegawai";
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base">{label}</CardTitle>
            {current && holderName ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {holderName}
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
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Aktif</Badge>
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
          {type === "dosen" ? (
            <div className="space-y-1.5 min-w-[220px]">
              <Label>Dosen</Label>
              <Select name="dosen_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dosen" />
                </SelectTrigger>
                <SelectContent>
                  {dosenList.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.nama_lengkap}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5 min-w-[220px]">
              <Label>Pegawai</Label>
              <Select name="pegawai_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pegawai" />
                </SelectTrigger>
                <SelectContent>
                  {pegawaiList.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nama_lengkap}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {needsProdi && (
            <div className="space-y-1.5 min-w-[160px]">
              <Label>Program Studi</Label>
              <Select name="prodi_id">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prodi" />
                </SelectTrigger>
                <SelectContent>
                  {prodiList.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" variant="outline" size="sm">Tetapkan</Button>
        </form>
      </CardContent>
    </Card>
  );
}
