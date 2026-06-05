import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/local";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { PositionCode } from "@/generated/prisma/enums";

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

  peruntukan: string | null;
  pejabat_tujuan: string | null;
  instansi_tujuan: string | null;
  lokasi_observasi: string | null;
  mata_kuliah: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  dosen_pembimbing: string | null;
  judul_penelitian: string | null;
  lokasi_penelitian: string | null;
  tujuan_penelitian: string | null;
  alamat_instansi: string | null;
  bidang_magang: string | null;
  tujuan_rekomendasi: string | null;
  pihak_penerima: string | null;
  tipe_rekomendasi: string | null;
  is_ortu_pns: string | null;
  nama_ortu: string | null;
  nip_ortu: string | null;
  pangkat_ortu: string | null;
  jabatan_ortu: string | null;
  instansi_ortu: string | null;
  hubungan_ortu: string | null;
  submission_id_turnitin: string | null;
  url_turnitin: string | null;
  similarity_percentage: string | null;
  ketua_sidang: string | null;
  sekretaris_sidang: string | null;
  layanan_kode: string | null;
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
  positionCode: PositionCode
): Promise<Pejabat | null> {
  const pos = await prisma.structuralPosition.findFirst({
    where: { position_code: positionCode, is_active: true },
    include: { dosen: { include: { user: { include: { ttd_scan: true } } } } },
  });
  if (!pos?.dosen) return null;
  const dosen = pos.dosen;
  let ttdHtml: string | undefined;
  if (dosen.user?.ttd_scan?.file_path) {
    try {
      const buf = await storage.download(dosen.user.ttd_scan.file_path);
      ttdHtml = `<img src="data:image/png;base64,${buf.toString("base64")}" style="height:70px;" alt="TTD">`;
    } catch {
      // TTD file missing from disk — leave ttdHtml undefined, template uses placeholder
    }
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

  const kompProdi = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_komprehensif_prodi" && a.is_active
  );
  const kompKeislaman = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_komprehensif_keislaman" && a.is_active
  );

  const ketuaSidang = pengajuan.assignments.find(
    (a) => a.assignment_type === "ketua_sidang" && a.is_active
  );
  const sekretarisSidang = pengajuan.assignments.find(
    (a) => a.assignment_type === "sekretaris_sidang" && a.is_active
  );

  const pengujiSkripsi = pengajuan.assignments.filter(
    (a) => a.assignment_type === "penguji_skripsi" && a.is_active
  );

  const penguji1 = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_proposal" && a.is_active
  );
  const penguji2 = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_proposal" && a.is_active
      && a.id !== penguji1?.id
  );

  const dosenPembimbingObs = pengajuan.assignments.find(
    (a) => (a.assignment_type === "dosen_pembimbing_observasi" || a.assignment_type === "dosen_pembimbing_magang") && a.is_active
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
    penguji_1: kompProdi?.dosen?.nama_lengkap ?? penguji1?.dosen?.nama_lengkap ?? kompProdi?.dosen?.nama_lengkap ?? null,
    penguji_2: kompKeislaman?.dosen?.nama_lengkap ?? penguji2?.dosen?.nama_lengkap ?? null,

    ttd: mode === "final"
      ? (wd1?.ttd_html ?? dekan?.ttd_html ?? null)
      : null,
    qrcode: null,
    mode,

    peruntukan: (fieldValues["peruntukan"] as string) ?? null,
    pejabat_tujuan: (fieldValues["pejabat_tujuan"] as string) ?? null,
    instansi_tujuan: (fieldValues["instansi_tujuan"] as string) ?? null,
    lokasi_observasi: (fieldValues["lokasi_observasi"] as string) ?? null,
    mata_kuliah: (fieldValues["mata_kuliah"] as string) ?? null,
    tanggal_mulai: (fieldValues["tanggal_mulai"] as string) ?? null,
    tanggal_selesai: (fieldValues["tanggal_selesai"] as string) ?? null,
    dosen_pembimbing: dosenPembimbingObs?.dosen?.nama_lengkap ?? null,
    judul_penelitian: (fieldValues["judul_penelitian"] as string) ?? null,
    lokasi_penelitian: (fieldValues["lokasi_penelitian"] as string) ?? null,
    tujuan_penelitian: (fieldValues["tujuan_penelitian"] as string) ?? null,
    alamat_instansi: (fieldValues["alamat_instansi"] as string) ?? null,
    bidang_magang: (fieldValues["bidang_magang"] as string) ?? null,
    tujuan_rekomendasi: (fieldValues["tujuan_rekomendasi"] as string) ?? null,
    pihak_penerima: (fieldValues["pihak_penerima"] as string) ?? null,
    tipe_rekomendasi: (fieldValues["tipe_rekomendasi"] as string) ?? null,
    is_ortu_pns: (fieldValues["orang_tua_pns"] as string) ?? null,
    nama_ortu: (fieldValues["nama_orang_tua"] as string) ?? null,
    nip_ortu: (fieldValues["nip_orang_tua"] as string) ?? null,
    pangkat_ortu: (fieldValues["pangkat_golongan"] as string) ?? null,
    jabatan_ortu: (fieldValues["jabatan_orang_tua"] as string) ?? null,
    instansi_ortu: (fieldValues["instansi_orang_tua"] as string) ?? null,
    hubungan_ortu: (fieldValues["hubungan_orang_tua"] as string) ?? null,
    submission_id_turnitin: (fieldValues["submission_id_turnitin"] as string) ?? null,
    url_turnitin: (fieldValues["url_turnitin"] as string) ?? null,
    similarity_percentage: fieldValues["similarity_percentage"] != null ? String(fieldValues["similarity_percentage"]) : null,
    ketua_sidang: ketuaSidang?.dosen?.nama_lengkap ?? null,
    sekretaris_sidang: sekretarisSidang?.dosen?.nama_lengkap ?? null,
    layanan_kode: pengajuan.jenis_layanan.kode ?? null,
  };
}
