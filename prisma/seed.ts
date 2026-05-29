import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Delete existing data in reverse dependency order
  await prisma.verifikasiLog.deleteMany();
  await prisma.dokumenVerifikasi.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ttdScan.deleteMany();
  await prisma.pengajuanLog.deleteMany();
  await prisma.pengajuanDokumen.deleteMany();
  await prisma.pengajuanData.deleteMany();
  await prisma.pengajuanVersi.deleteMany();
  await prisma.nilaiSidang.deleteMany();
  await prisma.dokumenOutput.deleteMany();
  await prisma.slaSchedule.deleteMany();
  await prisma.pengajuanLayanan.deleteMany();
  await prisma.penomoranCounter.deleteMany();
  await prisma.judulSkripsiHistory.deleteMany();
  await prisma.judulSkripsi.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.workflowStepAction.deleteMany();
  await prisma.workflowStep.deleteMany();
  await prisma.workflowDefinition.deleteMany();
  await prisma.dokumenPersyaratan.deleteMany();
  await prisma.fieldLayanan.deleteMany();
  await prisma.jenisLayanan.deleteMany();
  await prisma.structuralPosition.deleteMany();
  await prisma.session.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.dosen.deleteMany();
  await prisma.pegawai.deleteMany();
  await prisma.mahasiswa.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.kodeKlasifikasi.deleteMany();
  await prisma.prodi.deleteMany();
  await prisma.fakultas.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // 1. Kode Klasifikasi
  const kkPP = await prisma.kodeKlasifikasi.create({ data: { kode: "PP.00.9", nama: "Pendidikan dan Pengajaran", deskripsi: "Layanan akademik umum" } });
  const kkKP = await prisma.kodeKlasifikasi.create({ data: { kode: "KP.01.2", nama: "Kepegawaian - SK", deskripsi: "SK Pembimbing Skripsi" } });
  const kkTL = await prisma.kodeKlasifikasi.create({ data: { kode: "TL.00", nama: "Penelitian", deskripsi: "Pengantar penelitian" } });
  const kkKS = await prisma.kodeKlasifikasi.create({ data: { kode: "KS.01", nama: "Kerjasama", deskripsi: "Permohonan magang" } });

  // 2. Fakultas
  const fuda = await prisma.fakultas.create({ data: { kode: "FUDA", nama: "Fakultas Ushuluddin dan Adab" } });

  // 3. Prodi (2 dummy)
  const prodiIH = await prisma.prodi.create({ data: { kode: "IH", nama: "Ilmu Hadis", fakultas_id: fuda.id } });
  const prodiIAT = await prisma.prodi.create({ data: { kode: "IAT", nama: "Ilmu Al-Quran dan Tafsir", fakultas_id: fuda.id } });

  // 4. Academic Period
  await prisma.academicPeriod.create({
    data: {
      nama_semester: "Ganjil 2025/2026",
      tahun_akademik: "2025/2026",
      tipe: "ganjil",
      tanggal_mulai: new Date("2025-08-01"),
      tanggal_berakhir: new Date("2026-01-31"),
      status: "active",
    },
  });

  // 5. Dosen (6 orang)
  const dPA = await prisma.dosen.create({ data: { nidn: "0115098501", nama_lengkap: "Dr. Ahmad Fauzi, M.Pd", is_active: true } });
  await prisma.user.create({ data: { email: "ahmad@uinbanten.ac.id", password_hash: passwordHash, system_role: "dosen", dosen_id: dPA.id, is_active: true } });

  const dKaprodi = await prisma.dosen.create({ data: { nidn: "0220077301", nama_lengkap: "Prof. Dr. Siti Aminah, M.Ag", is_active: true } });
  await prisma.user.create({ data: { email: "siti@uinbanten.ac.id", password_hash: passwordHash, system_role: "dosen", dosen_id: dKaprodi.id, is_active: true } });

  const dSekprodi = await prisma.dosen.create({ data: { nidn: "0315088402", nama_lengkap: "Dr. Hasan Basri, M.Si", is_active: true } });
  await prisma.user.create({ data: { email: "hasan@uinbanten.ac.id", password_hash: passwordHash, system_role: "dosen", dosen_id: dSekprodi.id, is_active: true } });

  const dWD1 = await prisma.dosen.create({ data: { nidn: "0410067501", nama_lengkap: "Dr. H. Ahmad Yani, MA", is_active: true } });
  await prisma.user.create({ data: { email: "yani@uinbanten.ac.id", password_hash: passwordHash, system_role: "dosen", dosen_id: dWD1.id, is_active: true } });

  const dDekan = await prisma.dosen.create({ data: { nidn: "0505066001", nama_lengkap: "Prof. Dr. H. Masrukhin Muhsin, Lc., MA", is_active: true } });
  await prisma.user.create({ data: { email: "dekan@uinbanten.ac.id", password_hash: passwordHash, system_role: "dosen", dosen_id: dDekan.id, is_active: true } });

  const dKalab = await prisma.dosen.create({ data: { nidn: "0610088901", nama_lengkap: "Dr. Hamdan, M.Kom", is_active: true } });
  await prisma.user.create({ data: { email: "hamdan@uinbanten.ac.id", password_hash: passwordHash, system_role: "dosen", dosen_id: dKalab.id, is_active: true } });

  // 6. Pegawai (3 orang)
  const pStaffProdi = await prisma.pegawai.create({ data: { nip: "198001012010011001", nama_lengkap: "Budi Santoso, S.Kom", is_active: true } });
  await prisma.user.create({ data: { email: "budi@uinbanten.ac.id", password_hash: passwordHash, system_role: "staff_prodi", pegawai_id: pStaffProdi.id, is_active: true } });

  const pStaffAkad = await prisma.pegawai.create({ data: { nip: "198102022010012002", nama_lengkap: "Siti Maryam, A.Md", is_active: true } });
  await prisma.user.create({ data: { email: "maryam@uinbanten.ac.id", password_hash: passwordHash, system_role: "staff_akademik", pegawai_id: pStaffAkad.id, is_active: true } });

  const pKabag = await prisma.pegawai.create({ data: { nip: "197503032008011001", nama_lengkap: "Drs. Abdul Karim", is_active: true } });
  await prisma.user.create({ data: { email: "karim@uinbanten.ac.id", password_hash: passwordHash, system_role: "kabag", pegawai_id: pKabag.id, is_active: true } });

  // 7. Mahasiswa (1 orang)
  const mhs = await prisma.mahasiswa.create({ data: { nim: "221360001", nama_lengkap: "Aini Fitri Utami", prodi_id: prodiIH.id, angkatan: 2022, semester_aktif: 7, status_mahasiswa: "aktif" } });
  await prisma.user.create({ data: { email: "aini@student.uinbanten.ac.id", password_hash: passwordHash, system_role: "mahasiswa", mahasiswa_id: mhs.id, is_active: true } });

  // 8. Super Admin
  await prisma.user.create({ data: { email: "admin@sila.local", password_hash: passwordHash, system_role: "super_admin", is_active: true } });

  // 9. Structural Positions
  const now = new Date();
  await prisma.structuralPosition.createMany({
    data: [
      { position_code: "kaprodi", dosen_id: dKaprodi.id, prodi_id: prodiIH.id, start_date: now, is_active: true },
      { position_code: "sekprodi", dosen_id: dSekprodi.id, prodi_id: prodiIH.id, start_date: now, is_active: true },
      { position_code: "wakil_dekan_1", dosen_id: dWD1.id, start_date: now, is_active: true },
      { position_code: "dekan", dosen_id: dDekan.id, start_date: now, is_active: true },
      { position_code: "kepala_lab", dosen_id: dKalab.id, start_date: now, is_active: true },
      { position_code: "kabag_tu", pegawai_id: pKabag.id, start_date: now, is_active: true },
    ],
  });

  // 10. Assignment (PA for mahasiswa)
  await prisma.assignment.create({
    data: { assignment_type: "dosen_pa", dosen_id: dPA.id, mahasiswa_id: mhs.id, is_active: true },
  });

  // 11. Jenis Layanan (13)
  const layananData = [
    { kode: "TA-01", nama: "Pengajuan Judul Skripsi", kategori: "tugas_akhir" as const, kode_klasifikasi_id: kkPP.id, template_kode: "persetujuan_judul" },
    { kode: "TA-02", nama: "SK Pembimbing Skripsi", kategori: "tugas_akhir" as const, kode_klasifikasi_id: kkKP.id, template_kode: "sk_pembimbing" },
    { kode: "TA-03", nama: "Seminar Proposal Skripsi", kategori: "tugas_akhir" as const, kode_klasifikasi_id: kkPP.id, template_kode: "seminar_proposal" },
    { kode: "TA-04", nama: "Ujian Komprehensif", kategori: "tugas_akhir" as const, kode_klasifikasi_id: kkPP.id, template_kode: "ujian_komprehensif" },
    { kode: "TA-05", nama: "Ujian Skripsi (Munaqasyah)", kategori: "tugas_akhir" as const, kode_klasifikasi_id: kkPP.id, template_kode: "ujian_skripsi" },
    { kode: "TA-06", nama: "Cek Turnitin", kategori: "tugas_akhir" as const, kode_klasifikasi_id: kkPP.id, template_kode: "cek_turnitin" },
    { kode: "AK-01", nama: "Surat Keterangan Aktif Kuliah", kategori: "akademik" as const, kode_klasifikasi_id: kkPP.id, template_kode: "aktif_kuliah" },
    { kode: "AK-02", nama: "Surat Keterangan Masih Kuliah (PNS)", kategori: "akademik" as const, kode_klasifikasi_id: kkPP.id, template_kode: "masih_kuliah" },
    { kode: "AK-03", nama: "Surat Keterangan Pernah Kuliah", kategori: "akademik" as const, kode_klasifikasi_id: kkPP.id, template_kode: "pernah_kuliah" },
    { kode: "AK-04", nama: "Surat Pengantar Observasi", kategori: "akademik" as const, kode_klasifikasi_id: kkPP.id, template_kode: "pengantar_observasi" },
    { kode: "AK-05", nama: "Surat Pengantar Penelitian", kategori: "akademik" as const, kode_klasifikasi_id: kkTL.id, template_kode: "pengantar_penelitian" },
    { kode: "AK-06", nama: "Surat Permohonan Magang", kategori: "akademik" as const, kode_klasifikasi_id: kkKS.id, template_kode: "permohonan_magang" },
    { kode: "AK-07", nama: "Surat Rekomendasi", kategori: "akademik" as const, kode_klasifikasi_id: kkPP.id, template_kode: "rekomendasi" },
  ];

  const layananMap: Record<string, number> = {};
  for (const l of layananData) {
    const created = await prisma.jenisLayanan.create({
      data: {
        kode: l.kode,
        nama: l.nama,
        kategori: l.kategori,
        scope_level: l.kode.startsWith("TA-") ? "prodi" : "fakultas",
        kode_klasifikasi_id: l.kode_klasifikasi_id,
        template_kode: l.template_kode,
      },
    });
    layananMap[l.kode] = created.id;
  }

  // Helper function for workflow steps
  async function createWorkflow(jenis_layanan_id: number, steps: any[]) {
    return prisma.workflowDefinition.create({
      data: { jenis_layanan_id, versi: 1, is_active: true, steps: { create: steps } },
    });
  }

  // TA-01: 4 steps
  await createWorkflow(layananMap["TA-01"], [
    {
      step_code: "TA01-02", step_order: 1, status_code: "pending_staff_prodi", actor_type: "staff_prodi", sla_days: 2, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_pa", requires_reason: false, requires_confirmation: false, label: "Setujui & Teruskan ke PA" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak (Kembalikan ke Mahasiswa)" },
      ]},
    },
    {
      step_code: "TA01-03", step_order: 2, status_code: "pending_pa", actor_type: "dosen_pa", sla_days: 7, sla_consequence: "bypass",
      actions: { create: [
        { action_code: "select_judul", target_status: "pending_kaprodi", requires_reason: false, requires_confirmation: false, label: "Pilih Judul & Lanjutkan" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak Semua Judul" },
      ]},
    },
    {
      step_code: "TA01-04", step_order: 3, status_code: "pending_kaprodi", actor_type: "kaprodi", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_wd1", requires_reason: false, requires_confirmation: false, label: "Setujui & Teruskan ke WD1" },
        { action_code: "reject_to_step", target_status: "pending_pa", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke PA" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Mahasiswa" },
      ]},
    },
    {
      step_code: "TA01-05", step_order: 4, status_code: "pending_wd1", actor_type: "wakil_dekan_1", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "sign", target_status: "selesai", requires_reason: false, requires_confirmation: true, label: "Tanda Tangan & Terbitkan" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_pa", "pending_kaprodi"] } },
      ]},
    },
  ]);

  // TA-02: 4 steps
  await createWorkflow(layananMap["TA-02"], [
    {
      step_code: "TA02-02", step_order: 1, status_code: "pending_staff_prodi", actor_type: "staff_prodi", sla_days: 2, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_sekprodi", requires_reason: false, requires_confirmation: false, label: "Setujui" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak" },
      ]},
    },
    {
      step_code: "TA02-03", step_order: 2, status_code: "pending_sekprodi", actor_type: "sekprodi", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_wd1", requires_reason: false, requires_confirmation: false, label: "Tetapkan Pembimbing & Lanjut" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak" },
      ]},
    },
    {
      step_code: "TA02-04", step_order: 3, status_code: "pending_wd1", actor_type: "wakil_dekan_1", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_dekan", requires_reason: false, requires_confirmation: false, label: "Setujui" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
      ]},
    },
    {
      step_code: "TA02-05", step_order: 4, status_code: "pending_dekan", actor_type: "dekan", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "sign", target_status: "selesai", requires_reason: false, requires_confirmation: true, label: "Tanda Tangan & Terbitkan SK" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi", "pending_wd1"] } },
      ]},
    },
  ]);

  // TA-03: 3 steps
  await createWorkflow(layananMap["TA-03"], [
    {
      step_code: "TA03-02", step_order: 1, status_code: "pending_staff_prodi", actor_type: "staff_prodi", sla_days: 2, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_sekprodi", requires_reason: false, requires_confirmation: false, label: "Verifikasi & Simpan Jadwal" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak" },
      ]},
    },
    {
      step_code: "TA03-03", step_order: 2, status_code: "pending_sekprodi", actor_type: "sekprodi", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_wd1", requires_reason: false, requires_confirmation: false, label: "Tetapkan Penguji & Lanjut" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi" },
      ]},
    },
    {
      step_code: "TA03-04", step_order: 3, status_code: "pending_wd1", actor_type: "wakil_dekan_1", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "sign", target_status: "selesai", requires_reason: false, requires_confirmation: true, label: "Tanda Tangan & Terbitkan Surat Tugas" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
      ]},
    },
  ]);

  // TA-04: 3 steps
  await createWorkflow(layananMap["TA-04"], [
    {
      step_code: "TA04-02", step_order: 1, status_code: "pending_staff_prodi", actor_type: "staff_prodi", sla_days: 2, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_sekprodi", requires_reason: false, requires_confirmation: false, label: "Verifikasi & Simpan Jadwal" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak" },
      ]},
    },
    {
      step_code: "TA04-03", step_order: 2, status_code: "pending_sekprodi", actor_type: "sekprodi", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_wd1", requires_reason: false, requires_confirmation: false, label: "Tetapkan Penguji & Lanjut" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi" },
      ]},
    },
    {
      step_code: "TA04-04", step_order: 3, status_code: "pending_wd1", actor_type: "wakil_dekan_1", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "sign", target_status: "selesai", requires_reason: false, requires_confirmation: true, label: "Tanda Tangan & Terbitkan Surat Tugas" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
      ]},
    },
  ]);

  // TA-05: 4 steps
  await createWorkflow(layananMap["TA-05"], [
    {
      step_code: "TA05-02", step_order: 1, status_code: "pending_staff_prodi", actor_type: "staff_prodi", sla_days: 2, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_sekprodi", requires_reason: false, requires_confirmation: false, label: "Verifikasi Berkas" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak" },
      ]},
    },
    {
      step_code: "TA05-03", step_order: 2, status_code: "pending_sekprodi", actor_type: "sekprodi", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_wd1", requires_reason: false, requires_confirmation: false, label: "Tetapkan Jadwal & Majelis" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi" },
      ]},
    },
    {
      step_code: "TA05-04", step_order: 3, status_code: "pending_wd1", actor_type: "wakil_dekan_1", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "pending_dekan", requires_reason: false, requires_confirmation: false, label: "Setujui" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
      ]},
    },
    {
      step_code: "TA05-05", step_order: 4, status_code: "pending_dekan", actor_type: "dekan", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "sign", target_status: "selesai", requires_reason: false, requires_confirmation: true, label: "Tanda Tangan & Terbitkan" },
        { action_code: "reject_to_step", target_status: "pending_staff_prodi", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff Prodi", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi", "pending_wd1"] } },
      ]},
    },
  ]);

  // TA-06: 1 step (kepala lab)
  await createWorkflow(layananMap["TA-06"], [
    {
      step_code: "TA06-02", step_order: 1, status_code: "pending_kepala_lab", actor_type: "kepala_lab", sla_days: 3, sla_consequence: "reminder",
      actions: { create: [
        { action_code: "approve", target_status: "selesai", requires_reason: false, requires_confirmation: true, label: "Setujui & Terbitkan Sertifikat" },
        { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak (Perlu Revisi)" },
      ]},
    },
  ]);

  // Helper for AK services: 3-step pattern
  async function createAkWorkflow(kode: string, ttdTarget: string) {
    const code = kode.replace("-", "");
    return createWorkflow(layananMap[kode], [
      {
        step_code: `${code}-02`, step_order: 1, status_code: "pending_staff_akademik", actor_type: "staff_akademik", sla_days: 2, sla_consequence: "reminder",
        actions: { create: [
          { action_code: "approve", target_status: "pending_kabag", requires_reason: false, requires_confirmation: false, label: "Verifikasi & Setujui" },
          { action_code: "reject_to_submitter", target_status: "revision_required", requires_reason: true, requires_confirmation: true, label: "Tolak" },
        ]},
      },
      {
        step_code: `${code}-03`, step_order: 2, status_code: "pending_kabag", actor_type: "kabag", sla_days: 2, sla_consequence: "reminder",
        actions: { create: [
          { action_code: "approve", target_status: ttdTarget, requires_reason: false, requires_confirmation: false, label: "Setujui" },
          { action_code: "reject_to_step", target_status: "pending_staff_akademik", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff" },
        ]},
      },
      {
        step_code: `${code}-04`, step_order: 3, status_code: ttdTarget, actor_type: ttdTarget === "pending_wd1" ? "wakil_dekan_1" : "dekan", sla_days: 2, sla_consequence: "reminder",
        actions: { create: [
          { action_code: "sign", target_status: "selesai", requires_reason: false, requires_confirmation: true, label: "Tanda Tangan & Terbitkan" },
          { action_code: "reject_to_step", target_status: "pending_staff_akademik", requires_reason: true, requires_confirmation: true, label: "Kembalikan ke Staff", actionConfig: { allowTarget: ["pending_staff_akademik", "pending_kabag"] } },
        ]},
      },
    ]);
  }

  // AK services: WD1 or Dekan as TTD final
  await createAkWorkflow("AK-01", "pending_wd1");
  await createAkWorkflow("AK-02", "pending_wd1");
  await createAkWorkflow("AK-04", "pending_wd1");
  await createAkWorkflow("AK-05", "pending_wd1");
  await createAkWorkflow("AK-03", "pending_dekan");
  await createAkWorkflow("AK-06", "pending_dekan");
  await createAkWorkflow("AK-07", "pending_dekan");

  console.log("All 13 workflows seeded!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed complete!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
