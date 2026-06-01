import { prisma } from "@/lib/prisma";

function toBulanRomawi(month: number): string {
  const map = [
    "I", "II", "III", "IV", "V", "VI",
    "VII", "VIII", "IX", "X", "XI", "XII",
  ];
  return map[month - 1] ?? String(month);
}

function padNomor(urut: number): string {
  return String(urut).padStart(4, "0");
}

export async function reserveNomorSurat(
  pengajuanId: number
): Promise<string> {
  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: {
      jenis_layanan: { include: { kode_klasifikasi: true } },
      academic_period: true,
    },
  });

  if (!pengajuan) throw new Error("Pengajuan tidak ditemukan");

  const existing = await prisma.penomoranCounter.findFirst({
    where: { pengajuan_id: pengajuanId },
  });
  if (existing) return existing.nomor_formatted;

  const kode = pengajuan.jenis_layanan.kode_klasifikasi.kode;
  const bulan = toBulanRomawi(new Date().getMonth() + 1);
  const tahun = new Date().getFullYear();

  const [nomor] = await prisma.$transaction([
    prisma.penomoranCounter.create({
      data: {
        academic_period_id: pengajuan.academic_period_id,
        kode_klasifikasi_id: pengajuan.jenis_layanan.kode_klasifikasi_id,
        scope_level: pengajuan.scope_level,
        scope_id: pengajuan.prodi_id,
        pengajuan_id: pengajuan.id,
        nomor_urut: 0,
        nomor_formatted: "",
        status: "reserved",
      },
    }),
  ]);

  const count = await prisma.penomoranCounter.count({
    where: {
      academic_period_id: pengajuan.academic_period_id,
      kode_klasifikasi_id: pengajuan.jenis_layanan.kode_klasifikasi_id,
      id: { lte: nomor.id },
    },
  });

  const formatted = `${padNomor(count)}/Un.17/F.III/${kode}/${bulan}/${tahun}`;

  await prisma.penomoranCounter.update({
    where: { id: nomor.id },
    data: { nomor_urut: count, nomor_formatted: formatted },
  });

  return formatted;
}

export async function activateNomorSurat(
  pengajuanId: number
): Promise<void> {
  await prisma.penomoranCounter.updateMany({
    where: { pengajuan_id: pengajuanId, status: "reserved" },
    data: { status: "active", activated_at: new Date() },
  });
}

export async function voidNomorSurat(
  pengajuanId: number
): Promise<void> {
  await prisma.penomoranCounter.updateMany({
    where: { pengajuan_id: pengajuanId, status: "reserved" },
    data: { status: "void", voided_at: new Date() },
  });
}
