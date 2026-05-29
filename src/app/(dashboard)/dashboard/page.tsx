import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dosen: true, mahasiswa: true, pegawai: true },
  });
  if (!user) redirect("/login");

  const userRole = (session.user as any).systemRole as string || user.system_role;
  const userName = user.dosen?.nama_lengkap || user.pegawai?.nama_lengkap || user.mahasiswa?.nama_lengkap || user.email;

  // Stats per role
  let pengajuanAktif = 0;
  let menungguTindakan = 0;
  let selesaiBulanIni = 0;

  if (userRole === "mahasiswa" && user.mahasiswa) {
    pengajuanAktif = await prisma.pengajuanLayanan.count({
      where: { mahasiswa_id: user.mahasiswa.id, status: { notIn: ["selesai", "terminated"] } },
    });
    menungguTindakan = await prisma.pengajuanLayanan.count({
      where: { mahasiswa_id: user.mahasiswa.id, status: "revision_required" },
    });
  } else if (userRole === "staff_prodi") {
    menungguTindakan = await prisma.pengajuanLayanan.count({
      where: { status: "pending_staff_prodi" },
    });
  } else if (userRole === "dosen") {
    menungguTindakan = await prisma.pengajuanLayanan.count({
      where: { status: { in: ["pending_pa", "pending_kaprodi", "pending_sekprodi", "pending_wd1", "pending_dekan"] } },
    });
  } else if (userRole === "staff_akademik") {
    menungguTindakan = await prisma.pengajuanLayanan.count({
      where: { status: "pending_staff_akademik" },
    });
  } else if (userRole === "kabag") {
    menungguTindakan = await prisma.pengajuanLayanan.count({
      where: { status: "pending_kabag" },
    });
  }

  // Get recent pengajuan menunggu
  let tasks: any[] = [];
  if (userRole === "dosen" && user.dosen) {
    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: { notIn: ["selesai", "terminated", "revision_required"] } },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
  } else if (userRole === "staff_prodi") {
    tasks = await prisma.pengajuanLayanan.findMany({
      where: { status: "pending_staff_prodi" },
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
  } else if (userRole === "mahasiswa" && user.mahasiswa) {
    tasks = await prisma.pengajuanLayanan.findMany({
      where: { mahasiswa_id: user.mahasiswa.id },
      include: { jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
  } else {
    tasks = await prisma.pengajuanLayanan.findMany({
      include: { mahasiswa: true, jenis_layanan: true },
      take: 10,
      orderBy: { created_at: "desc" },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Halo, {userName} 👋</h1>
        <p className="text-muted-foreground">
          {userRole === "mahasiswa" ? "Mahasiswa" :
           userRole === "dosen" ? "Dosen" :
           userRole === "staff_prodi" ? "Staff Prodi" :
           userRole === "staff_akademik" ? "Staff Akademik" :
           userRole === "kabag" ? "Kabag" : "Super Admin"} · Semester Aktif
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pengajuan Aktif" value={pengajuanAktif} icon={FileText} />
        <StatCard label="Menunggu Tindakan" value={menungguTindakan} icon={Clock} />
        <StatCard label="Selesai Bulan Ini" value={selesaiBulanIni} icon={CheckCircle} />
        <StatCard label="Status TA Terkini" value="—" icon={AlertTriangle} />
      </div>

      {tasks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            {userRole === "dosen" || userRole === "staff_prodi" || userRole === "staff_akademik" || userRole === "kabag"
              ? "Pengajuan Menunggu Tindakan Anda"
              : "Pengajuan Anda"}
          </h2>
          <div className="space-y-2">
            {tasks.map((t) => (
              <Link key={t.id} href={`/pengajuan/${t.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">
                          {t.kode_pengajuan} · {t.jenis_layanan?.nama}
                        </CardTitle>
                        {t.mahasiswa && (
                          <p className="text-xs text-muted-foreground">
                            {t.mahasiswa.nama_lengkap} ({t.mahasiswa.nim})
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {t.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Belum ada pengajuan</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {userRole === "mahasiswa"
              ? "Ajukan layanan akademik melalui menu Pengajuan."
              : "Belum ada pengajuan yang memerlukan tindakan Anda."}
          </p>
        </div>
      )}
    </div>
  );
}
