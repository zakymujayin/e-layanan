import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Pejabat {
  nama: string;
  nip: string;
  pangkat_golongan?: string;
  ttd_html?: string;
}

export interface DocumentContext {
  logo_src: string;
  nama_mahasiswa: string;
  nim: string;
  kode_prodi: string;
  nama_prodi: string;
  semester_aktif: string;
  semester_teks: string;
  tahun_akademik: string;
  jenis_semester: string;
  tempat_lahir_mahasiswa: string;
  tanggal_lahir_mahasiswa: string;

  nomor_surat: string | null;
  nomor_surat_status: string | null;
  tanggal_surat: string | null;

  wakil_dekan_1: Pejabat | null;
  dekan: Pejabat | null;

  judul_disetujui: string | null;
  judul_list: string[];

  pembimbing_1: string | null;
  pembimbing_2: string | null;
  nomor_srt_jurusan: string | null;
  tgl_srt_jurusan: string | null;

  hari_sidang: string | null;
  tanggal_sidang: string | null;
  waktu_sidang: string | null;
  ruang_sidang: string | null;
  penguji_1: string | null;
  penguji_2: string | null;

  ttd: string | null;
  qrcode: string | null;
  mode: "preview" | "final";
}

function angkaKeTeks(n: number): string {
  const map: Record<number, string> = {
    1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
    6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X",
    11: "XI", 12: "XII", 13: "XIII", 14: "XIV",
  };
  return map[n] ?? String(n);
}

async function getPejabat(
  positionCode: string
): Promise<Pejabat | null> {
  const pos = await prisma.structuralPosition.findFirst({
    where: { position_code: positionCode, is_active: true },
    include: { dosen: { include: { user: { include: { ttd_scan: true } } } } },
  });
  if (!pos?.dosen) return null;
  const dosen = pos.dosen;
  let ttdHtml: string | undefined;
  if (dosen.user?.ttd_scan?.file_path) {
    ttdHtml = `<img src="${dosen.user.ttd_scan.file_path}" style="height:70px;" alt="TTD">`;
  }
  return {
    nama: [dosen.gelar_depan, dosen.nama_lengkap, dosen.gelar_belakang]
      .filter(Boolean).join(" "),
    nip: dosen.nidn,
    pangkat_golongan: dosen.pangkat_golongan ?? undefined,
    ttd_html: ttdHtml,
  };
}

export async function buildDocumentContext(
  pengajuanId: number,
  mode: "preview" | "final" = "preview"
): Promise<DocumentContext> {
  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: {
      mahasiswa: { include: { prodi: true } },
      jenis_layanan: { include: { kode_klasifikasi: true } },
      academic_period: true,
      pengajuan_data: true,
      assignments: { include: { dosen: true } },
    },
  });

  if (!pengajuan) throw new Error("Pengajuan tidak ditemukan");

  const mhs = pengajuan.mahasiswa;
  const prodi = mhs.prodi;
  const period = pengajuan.academic_period;
  const fieldValues = (pengajuan.pengajuan_data?.field_values as Record<string, unknown>) ?? {};

  const [wd1, dekan, penomoran, judulSkripsi] = await Promise.all([
    getPejabat("wakil_dekan_1"),
    getPejabat("dekan"),
    prisma.penomoranCounter.findFirst({
      where: { pengajuan_id: pengajuanId },
      orderBy: { reserved_at: "desc" },
    }),
    prisma.judulSkripsi.findFirst({
      where: { mahasiswa_id: mhs.id, status: "aktif" },
    }),
  ]);

  const semesterAktif = mhs.semester_aktif ?? 1;

  const pembimbing1 = pengajuan.assignments.find(
    (a) => a.assignment_type === "pembimbing_skripsi_1" && a.is_active
  );
  const pembimbing2 = pengajuan.assignments.find(
    (a) => a.assignment_type === "pembimbing_skripsi_2" && a.is_active
  );

  const penguji1 = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_proposal" && a.is_active
  );
  const penguji2 = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_proposal" && a.is_active
      && a.id !== penguji1?.id
  );

  const judulList: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const v = fieldValues[`judul_${i}`];
    if (typeof v === "string" && v.trim()) judulList.push(v);
  }

  const tanggalSidang = fieldValues["tanggal_sidang"] as string | undefined;
  let hariSidang: string | null = null;
  if (tanggalSidang) {
    try {
      hariSidang = format(new Date(tanggalSidang), "EEEE", { locale: id });
    } catch { /* ignore invalid date */ }
  }

  return {
    logo_src: "/images/logo-uin.png",
    nama_mahasiswa: mhs.nama_lengkap,
    nim: mhs.nim,
    kode_prodi: prodi.kode,
    nama_prodi: prodi.nama,
    semester_aktif: String(semesterAktif),
    semester_teks: `${semesterAktif} (${angkaKeTeks(semesterAktif)})`,
    tahun_akademik: period.tahun_akademik,
    jenis_semester: period.tipe,
    tempat_lahir_mahasiswa: mhs.tempatLahir ?? "",
    tanggal_lahir_mahasiswa: mhs.tanggalLahir
      ? format(new Date(mhs.tanggalLahir), "d MMMM yyyy", { locale: id })
      : "",

    nomor_surat: penomoran?.nomor_formatted ?? null,
    nomor_surat_status: penomoran?.status ?? null,
    tanggal_surat: mode === "final"
      ? format(new Date(), "d MMMM yyyy", { locale: id })
      : null,

    wakil_dekan_1: wd1,
    dekan,

    judul_disetujui: judulSkripsi?.judul_aktif ?? null,
    judul_list: judulList,

    pembimbing_1: pembimbing1?.dosen?.nama_lengkap ?? null,
    pembimbing_2: pembimbing2?.dosen?.nama_lengkap ?? null,
    nomor_srt_jurusan: (fieldValues["nomor_surat_prodi"] as string) ?? null,
    tgl_srt_jurusan: (fieldValues["tanggal_surat_prodi"] as string) ?? null,

    hari_sidang: hariSidang,
    tanggal_sidang: tanggalSidang ?? null,
    waktu_sidang: fieldValues["waktu_mulai"]
      ? `${fieldValues["waktu_mulai"]} - ${fieldValues["waktu_selesai"] ?? ""} WIB`
      : null,
    ruang_sidang: (fieldValues["ruang_sidang"] as string) ?? null,
    penguji_1: penguji1?.dosen?.nama_lengkap ?? null,
    penguji_2: penguji2?.dosen?.nama_lengkap ?? null,

    ttd: mode === "final"
      ? (wd1?.ttd_html ?? dekan?.ttd_html ?? null)
      : null,
    qrcode: null,
    mode,
  };
}
