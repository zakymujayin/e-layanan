import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/pengajuan/StatusBadge";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value.toLocaleString("id-ID")}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default async function AdminMonitoringPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    activeUsers,
    totalPengajuan,
    selesaiMonth,
    selesaiLastMonth,
    activeCount,
    stuckPengajuan,
    byLayanan,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { is_active: true } }),
    prisma.pengajuanLayanan.count(),
    prisma.pengajuanLayanan.count({ where: { status: "selesai", completed_at: { gte: startOfMonth } } }),
    prisma.pengajuanLayanan.count({ where: { status: "selesai", completed_at: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.pengajuanLayanan.count({ where: { status: { notIn: ["selesai", "terminated"] } } }),
    // Stuck: aktif lebih dari 14 hari
    prisma.pengajuanLayanan.findMany({
      where: {
        status: { notIn: ["selesai", "terminated"] },
        updated_at: { lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      include: { jenis_layanan: true, mahasiswa: true },
      orderBy: { updated_at: "asc" },
      take: 20,
    }),
    // Pengajuan per layanan
    prisma.jenisLayanan.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: {
            pengajuan: true,
          },
        },
      },
      orderBy: { kode: "asc" },
    }),
    // Aktivitas terbaru
    prisma.pengajuanLayanan.findMany({
      where: { status: "selesai" },
      include: { jenis_layanan: true, mahasiswa: true },
      orderBy: { completed_at: "desc" },
      take: 10,
    }),
  ]);

  const growthPct = selesaiLastMonth > 0
    ? Math.round(((selesaiMonth - selesaiLastMonth) / selesaiLastMonth) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monitoring Sistem</h1>
        <p className="text-muted-foreground">Statistik dan status real-time SILA</p>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total User Aktif" value={activeUsers} icon={Users} sub={`dari ${totalUsers} total user`} />
        <StatCard label="Pengajuan Aktif" value={activeCount} icon={Clock} sub="Belum selesai/terminated" />
        <StatCard
          label="Selesai Bulan Ini"
          value={selesaiMonth}
          icon={CheckCircle}
          sub={growthPct !== 0 ? `${growthPct > 0 ? "+" : ""}${growthPct}% vs bulan lalu` : `${selesaiLastMonth} bulan lalu`}
        />
        <StatCard label="Total Pengajuan" value={totalPengajuan} icon={FileText} sub="Sepanjang masa" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pengajuan per Layanan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengajuan per Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byLayanan.map(l => (
                <div key={l.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">{l.kode}</Badge>
                    <span className="text-sm truncate max-w-[160px]">{l.nama}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{l._count.pengajuan}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selesai Terbaru */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengajuan Selesai Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(p => (
                  <Link key={p.id} href={`/pengajuan/${p.id}`} className="flex items-center justify-between hover:bg-muted rounded-md px-2 py-1 -mx-2 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.mahasiswa.nama_lengkap}</p>
                      <p className="text-xs text-muted-foreground">{p.jenis_layanan.nama}</p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0 ml-2">
                      {p.completed_at ? format(p.completed_at, "d MMM", { locale: idLocale }) : "—"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pengajuan Stuck */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Pengajuan Tidak Bergerak &gt;14 Hari ({stuckPengajuan.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stuckPengajuan.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada pengajuan yang stuck.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Kode</th>
                    <th className="text-left py-2 pr-4">Mahasiswa</th>
                    <th className="text-left py-2 pr-4">Layanan</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2">Terakhir Update</th>
                  </tr>
                </thead>
                <tbody>
                  {stuckPengajuan.map(p => (
                    <tr key={p.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 pr-4">
                        <Link href={`/pengajuan/${p.id}`} className="font-mono text-xs text-primary hover:underline">
                          {p.kode_pengajuan}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{p.mahasiswa.nama_lengkap}</td>
                      <td className="py-2 pr-4">{p.jenis_layanan.kode}</td>
                      <td className="py-2 pr-4"><StatusBadge status={p.status} /></td>
                      <td className="py-2 text-muted-foreground">
                        {format(p.updated_at, "d MMM yyyy", { locale: idLocale })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
