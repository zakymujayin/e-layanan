import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { voidPenomoranById } from "@/actions/admin";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  reserved: "bg-amber-100 text-amber-800",
  void: "bg-gray-100 text-gray-500",
};

export default async function AdminPenomoranPage() {
  const counters = await prisma.penomoranCounter.findMany({
    include: {
      kode_klasifikasi: true,
      academic_period: true,
      pengajuan: { include: { mahasiswa: true } },
    },
    orderBy: [{ academic_period_id: "desc" }, { kode_klasifikasi_id: "asc" }, { nomor_urut: "asc" }],
  });

  // Group by period + kode_klasifikasi
  type Group = {
    periodNama: string;
    kodeKlasifikasi: string;
    items: typeof counters;
    countActive: number;
    countReserved: number;
    countVoid: number;
  };

  const groups = new Map<string, Group>();
  for (const c of counters) {
    const key = `${c.academic_period_id}-${c.kode_klasifikasi_id}`;
    if (!groups.has(key)) {
      groups.set(key, {
        periodNama: `${c.academic_period.nama_semester} ${c.academic_period.tahun_akademik}`,
        kodeKlasifikasi: `${c.kode_klasifikasi.kode} — ${c.kode_klasifikasi.nama}`,
        items: [],
        countActive: 0,
        countReserved: 0,
        countVoid: 0,
      });
    }
    const g = groups.get(key)!;
    g.items.push(c);
    if (c.status === "active") g.countActive++;
    else if (c.status === "reserved") g.countReserved++;
    else g.countVoid++;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Penomoran Surat</h1>
        <p className="text-muted-foreground">Pantau dan kelola nomor surat yang direservasi, aktif, atau void.</p>
      </div>

      {groups.size === 0 && (
        <p className="text-sm text-center text-muted-foreground py-12">Belum ada penomoran surat.</p>
      )}

      <div className="space-y-4">
        {Array.from(groups.entries()).map(([key, group]) => (
          <details key={key} className="border rounded-lg">
            <summary className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 cursor-pointer list-none hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-medium">{group.kodeKlasifikasi}</p>
                <p className="text-xs text-muted-foreground">{group.periodNama}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-green-700 font-medium">{group.countActive} aktif</span>
                {group.countReserved > 0 && (
                  <span className="text-xs text-amber-700 font-medium">{group.countReserved} reserved</span>
                )}
                {group.countVoid > 0 && (
                  <span className="text-xs text-muted-foreground">{group.countVoid} void</span>
                )}
              </div>
            </summary>
            <div className="border-t overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b bg-muted/30 text-muted-foreground">
                    <th className="text-left px-4 py-2">Nomor</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Mahasiswa</th>
                    <th className="text-left px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-2 font-mono">{item.nomor_formatted}</td>
                      <td className="px-4 py-2">
                        <Badge className={`${STATUS_COLOR[item.status] ?? ""} text-xs`}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {item.pengajuan?.mahasiswa.nama_lengkap ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {format(item.reserved_at, "d MMM yyyy", { locale: idLocale })}
                        {item.activated_at && ` → ${format(item.activated_at, "d MMM", { locale: idLocale })}`}
                      </td>
                      <td className="px-4 py-2">
                        {item.status === "reserved" && (
                          <form action={voidPenomoranById.bind(null, item.id)}>
                            <button type="submit" className="text-xs text-destructive hover:underline">
                              Void
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
