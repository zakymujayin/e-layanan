import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpdateProfilForm, ChangePasswordForm, TtdScanForm } from "./forms";
import { User, Shield, Key } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  mahasiswa: "Mahasiswa", dosen: "Dosen", staff_prodi: "Staff Prodi",
  staff_akademik: "Staff Akademik", kabag: "Kabag", super_admin: "Super Admin",
  kaprodi: "Kaprodi", sekprodi: "Sekprodi", wakil_dekan_1: "Wakil Dekan I",
  dekan: "Dekan", kepala_lab: "Kepala Lab",
};

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dosen: true, mahasiswa: { include: { prodi: true } }, pegawai: true, ttd_scan: true },
  });
  if (!user) redirect("/login");

  const namaLengkap =
    user.dosen?.nama_lengkap ??
    user.pegawai?.nama_lengkap ??
    user.mahasiswa?.nama_lengkap ??
    "";

  const initials = namaLengkap
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Determine role label
  let roleLabel = ROLE_LABELS[user.system_role] ?? user.system_role;
  let extraInfo = "";
  if (user.dosen?.id) {
    const pos = await prisma.structuralPosition.findFirst({
      where: { dosen_id: user.dosen.id, is_active: true },
      select: { position_code: true },
    });
    if (pos) roleLabel = ROLE_LABELS[pos.position_code] ?? pos.position_code;
  }
  if (user.mahasiswa) {
    extraInfo = user.pegawai?.nip
      ? `NIM: ${user.mahasiswa.nim} · ${user.mahasiswa.prodi?.nama ?? ""}`
      : `NIM: ${user.mahasiswa.nim} · ${user.mahasiswa.prodi?.nama ?? ""}`;
  } else if (user.dosen) {
    extraInfo = `NIDN: ${user.dosen.nidn}`;
  } else if (user.pegawai) {
    extraInfo = `NIP: ${user.pegawai.nip}`;
  }

  const showTtdSection = !!user.dosen || !!user.pegawai;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Avatar Card */}
      <Card className="shadow-sm rounded-xl border-0">
        <CardContent className="flex flex-col items-center py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-2xl font-bold text-primary-foreground shadow-lg ring-4 ring-primary/10">
            {initials}
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight">{namaLengkap}</h2>
          <Badge variant="secondary" className="mt-1.5">{roleLabel}</Badge>
          {extraInfo && (
            <p className="mt-2 text-sm text-muted-foreground">{extraInfo}</p>
          )}
        </CardContent>
      </Card>

      {/* Data Pribadi */}
      <Card className="shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Data Pribadi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <UpdateProfilForm namaLengkap={namaLengkap} email={user.email} />
        </CardContent>
      </Card>

      {/* Ganti Password */}
      <Card className="shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Ganti Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* TTD Scan */}
      {showTtdSection && (
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Tanda Tangan Digital (TTD Scan)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TtdScanForm hasTtd={!!user.ttd_scan} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
