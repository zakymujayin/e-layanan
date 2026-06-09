import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateProfilForm, ChangePasswordForm, TtdScanForm } from "./forms";

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dosen: true, mahasiswa: true, pegawai: true, ttd_scan: true },
  });
  if (!user) redirect("/login");

  const namaLengkap =
    user.dosen?.nama_lengkap ??
    user.pegawai?.nama_lengkap ??
    user.mahasiswa?.nama_lengkap ??
    "";

  const identifier =
    user.dosen?.nidn
      ? `NIDN: ${user.dosen.nidn}`
      : user.pegawai?.nip
      ? `NIP: ${user.pegawai.nip}`
      : user.mahasiswa?.nim
      ? `NIM: ${user.mahasiswa.nim}`
      : "";

  const showTtdSection = !!user.dosen || !!user.pegawai;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        {identifier && <p className="text-muted-foreground">{identifier}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Pribadi</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateProfilForm namaLengkap={namaLengkap} email={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganti Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {showTtdSection && (
        <Card>
          <CardHeader>
            <CardTitle>Tanda Tangan Digital (TTD Scan)</CardTitle>
          </CardHeader>
          <CardContent>
            <TtdScanForm hasTtd={!!user.ttd_scan} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
