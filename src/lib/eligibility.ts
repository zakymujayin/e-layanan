import { prisma } from "@/lib/prisma";

export type EligibilityResult = {
  eligible: boolean;
  reason?: string;
};

export async function checkLayananEligibility(
  mahasiswaId: number,
  statusMahasiswa: string,
  kode: string
): Promise<EligibilityResult> {
  switch (kode) {
    case "TA-01": {
      if (statusMahasiswa !== "aktif") return { eligible: false, reason: "Status mahasiswa harus aktif" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-01" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-01 aktif" };
      return { eligible: true };
    }
    case "TA-02": {
      const done = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-01" }, status: "selesai" },
      });
      if (!done) return { eligible: false, reason: "Pengajuan Judul Skripsi (TA-01) harus selesai terlebih dahulu" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-02" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-02 aktif" };
      return { eligible: true };
    }
    case "TA-03": {
      const done = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-02" }, status: "selesai" },
      });
      if (!done) return { eligible: false, reason: "SK Pembimbing (TA-02) harus selesai terlebih dahulu" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-03" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-03 aktif" };
      return { eligible: true };
    }
    case "TA-04": {
      const ta03 = await prisma.pengajuanLayanan.findFirst({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-03" }, status: "selesai" },
      });
      if (!ta03) return { eligible: false, reason: "Seminar Proposal (TA-03) harus selesai terlebih dahulu" };
      const hasil = await prisma.nilaiSidang.findFirst({
        where: { pengajuan_id: ta03.id },
        orderBy: { input_at: "desc" },
      });
      if (!hasil || hasil.keputusan !== "layak") return { eligible: false, reason: "Hasil Seminar Proposal harus LAYAK" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-04" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-04 aktif" };
      return { eligible: true };
    }
    case "TA-05": {
      const ta04 = await prisma.pengajuanLayanan.findFirst({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-04" }, status: "selesai" },
      });
      if (!ta04) return { eligible: false, reason: "Ujian Komprehensif (TA-04) harus selesai terlebih dahulu" };
      const hasilKomp = await prisma.nilaiSidang.findFirst({
        where: { pengajuan_id: ta04.id },
        orderBy: { input_at: "desc" },
      });
      if (!hasilKomp || hasilKomp.keputusan !== "lulus") return { eligible: false, reason: "Ujian Komprehensif harus LULUS" };
      const ta06Done = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-06" }, status: "selesai" },
      });
      if (!ta06Done) return { eligible: false, reason: "Cek Turnitin (TA-06) harus selesai terlebih dahulu" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-05" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-05 aktif" };
      return { eligible: true };
    }
    case "TA-06":
      if (statusMahasiswa !== "aktif") return { eligible: false, reason: "Status mahasiswa harus aktif" };
      return { eligible: true };
    case "AK-03":
      if (!["alumni", "keluar", "do"].includes(statusMahasiswa))
        return { eligible: false, reason: "Hanya untuk alumni atau mahasiswa berstatus keluar/DO" };
      return { eligible: true };
    case "AK-01":
    case "AK-02":
    case "AK-04":
    case "AK-05":
    case "AK-06":
      if (statusMahasiswa !== "aktif") return { eligible: false, reason: "Status mahasiswa harus aktif" };
      return { eligible: true };
    case "AK-07":
      if (!["aktif", "alumni"].includes(statusMahasiswa))
        return { eligible: false, reason: "Status mahasiswa harus aktif atau alumni" };
      return { eligible: true };
    default:
      return { eligible: true };
  }
}
