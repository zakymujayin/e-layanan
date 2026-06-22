import { prisma } from "../src/lib/prisma";
import { test, submitViaDb, workflowStep, assertStatus, getWorkflowDef, getFirstDosen } from "./test-helpers";

async function getUserId(email: string): Promise<number> {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) throw new Error(`User ${email} not found`);
  return u.id;
}

async function getLayananId(kode: string): Promise<number> {
  const l = await prisma.jenisLayanan.findUnique({ where: { kode } });
  if (!l) throw new Error(`Layanan ${kode} not found`);
  return l.id;
}

async function getWorkflowDefId(layananKode: string): Promise<number> {
  const w = await prisma.workflowDefinition.findFirst({
    where: { jenis_layanan: { kode: layananKode }, is_active: true },
  });
  if (!w) throw new Error(`Workflow for ${layananKode} not found`);
  return w.id;
}

async function getPeriodId(): Promise<number> {
  const p = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!p) throw new Error("No active academic period");
  return p.id;
}

async function getMahasiswaId(userEmail: string): Promise<number> {
  const u = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { mahasiswa: true },
  });
  if (!u?.mahasiswa) throw new Error(`Mahasiswa for ${userEmail} not found`);
  return u.mahasiswa.id;
}

export async function runWorkflowTests() {
  console.log("\n── Workflow Tests");

  const allDosen = await prisma.dosen.findMany({ where: { is_active: true }, take: 6, orderBy: { id: "asc" } });
  if (allDosen.length < 5) throw new Error(`Need at least 5 active dosen, found ${allDosen.length}`);
  const [dosenA, dosenB, dosenC, dosenD, dosenE] = allDosen;

  let ta01Id = 0;
  let ta02Id = 0;
  let ta03Id = 0;
  let ta04Id = 0;
  let ta05Id = 0;
  let ta06Id = 0;
  let ak01Id = 0;
  let ak02Id = 0;
  let ak03Id = 0;
  let ak04Id = 0;
  let ak05Id = 0;
  let ak06Id = 0;
  let ak07Id = 0;

  // ── TA-01: Pengajuan Judul Skripsi ──

  await test("TA-01: submit → pending_staff_prodi", async () => {
    const wfId = await getWorkflowDefId("TA-01");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ta01Id = await submitViaDb({
      kode: "TA-01",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "prodi",
      fieldValues: {
        judul_1: "Analisis Kritik Hadis dalam Kitab Shahih Muslim",
        judul_2: "Pengaruh Media Sosial terhadap Pemahaman Hadis",
        judul_3: "Studi Komparatif Metode Syarah Hadis Kontemporer",
        pa_dosen_id: dosenA.id,
      },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await prisma.assignment.create({
      data: {
        assignment_type: "dosen_pa",
        dosen_id: dosenA.id,
        mahasiswa_id: mhsUser.mahasiswa.id,
        pengajuan_id: ta01Id,
        is_active: true,
      },
    });

    const p = await prisma.pengajuanLayanan.findUnique({ where: { id: ta01Id } });
    if (!p || p.status !== "pending_staff_prodi") throw new Error("TA-01 not at pending_staff_prodi");
  });

  await test("TA-01: staff_prodi approve → pending_pa", async () => {
    const staffId = await getUserId("budi@uinbanten.ac.id");
    await workflowStep(ta01Id, staffId, "approve");
    await assertStatus(ta01Id, "pending_pa");
  });

  await test("TA-01: dosen_pa select_judul → pending_kaprodi", async () => {
    const paId = await getUserId("ahmad@uinbanten.ac.id");
    await workflowStep(ta01Id, paId, "select_judul", { selected_judul_index: 1 });
    await assertStatus(ta01Id, "pending_kaprodi");
  });

  await test("TA-01: kaprodi approve → pending_wd1", async () => {
    const kaprodiId = await getUserId("siti@uinbanten.ac.id");
    await workflowStep(ta01Id, kaprodiId, "approve");
    await assertStatus(ta01Id, "pending_wd1");
  });

  await test("TA-01: wd1 sign → selesai", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ta01Id, wd1Id, "sign");
    await assertStatus(ta01Id, "selesai");
  });

  // ── TA-02: SK Pembimbing Skripsi ──

  await test("TA-02: submit → pending_staff_prodi", async () => {
    const wfId = await getWorkflowDefId("TA-02");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ta02Id = await submitViaDb({
      kode: "TA-02",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "prodi",
      fieldValues: { ta01_id: ta01Id },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ta02Id, "pending_staff_prodi");
  });

  await test("TA-02: staff_prodi approve → pending_sekprodi", async () => {
    const staffId = await getUserId("budi@uinbanten.ac.id");
    await workflowStep(ta02Id, staffId, "approve");
    await assertStatus(ta02Id, "pending_sekprodi");
  });

  await test("TA-02: sekprodi set pembimbing + approve → pending_wd1", async () => {
    const p = await prisma.pengajuanLayanan.findUnique({ where: { id: ta02Id } });
    await prisma.assignment.createMany({
      data: [
        {
          assignment_type: "pembimbing_skripsi_1",
          dosen_id: dosenA.id,
          mahasiswa_id: p!.mahasiswa_id,
          pengajuan_id: ta02Id,
          is_active: true,
        },
        {
          assignment_type: "pembimbing_skripsi_2",
          dosen_id: dosenB.id,
          mahasiswa_id: p!.mahasiswa_id,
          pengajuan_id: ta02Id,
          is_active: true,
        },
      ],
    });

    const sekprodiId = await getUserId("hasan@uinbanten.ac.id");
    await workflowStep(ta02Id, sekprodiId, "approve");
    await assertStatus(ta02Id, "pending_wd1");
  });

  await test("TA-02: wd1 approve → pending_dekan", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ta02Id, wd1Id, "approve");
    await assertStatus(ta02Id, "pending_dekan");
  });

  await test("TA-02: dekan sign → selesai", async () => {
    const dekanId = await getUserId("dekan@uinbanten.ac.id");
    await workflowStep(ta02Id, dekanId, "sign");
    await assertStatus(ta02Id, "selesai");
  });

  // ── TA-03: Seminar Proposal Skripsi ──

  await test("TA-03: submit → pending_staff_prodi", async () => {
    const wfId = await getWorkflowDefId("TA-03");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ta03Id = await submitViaDb({
      kode: "TA-03",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "prodi",
      fieldValues: { ta02_id: ta02Id },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ta03Id, "pending_staff_prodi");
  });

  await test("TA-03: staff_prodi approve + jadwal → pending_sekprodi", async () => {
    const staffId = await getUserId("budi@uinbanten.ac.id");
    await workflowStep(ta03Id, staffId, "approve");
    await assertStatus(ta03Id, "pending_sekprodi");
  });

  await test("TA-03: sekprodi set penguji + approve → pending_wd1", async () => {
    await prisma.assignment.createMany({
      data: [
        { assignment_type: "penguji_proposal", dosen_id: dosenA.id, pengajuan_id: ta03Id, is_active: true },
        { assignment_type: "penguji_proposal", dosen_id: dosenB.id, pengajuan_id: ta03Id, is_active: true },
      ],
    });

    const sekprodiId = await getUserId("hasan@uinbanten.ac.id");
    await workflowStep(ta03Id, sekprodiId, "approve");
    await assertStatus(ta03Id, "pending_wd1");
  });

  await test("TA-03: wd1 sign → selesai", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ta03Id, wd1Id, "sign");
    await assertStatus(ta03Id, "selesai");
  });

  // Set TA-03 nilai_sidang to 'layak' for TA-04 prereq
  await prisma.nilaiSidang.create({
    data: {
      pengajuan_id: ta03Id,
      dosen_id: dosenA.id,
      assignment_type: "penguji_proposal",
      keputusan: "layak",
    },
  });

  // ── TA-04: Ujian Komprehensif ──

  await test("TA-04: submit → pending_staff_prodi", async () => {
    const wfId = await getWorkflowDefId("TA-04");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ta04Id = await submitViaDb({
      kode: "TA-04",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "prodi",
      fieldValues: {},
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ta04Id, "pending_staff_prodi");
  });

  await test("TA-04: staff_prodi approve → pending_sekprodi", async () => {
    const staffId = await getUserId("budi@uinbanten.ac.id");
    await workflowStep(ta04Id, staffId, "approve");
    await assertStatus(ta04Id, "pending_sekprodi");
  });

  await test("TA-04: sekprodi set penguji komprehensif + approve → pending_wd1", async () => {
    await prisma.assignment.createMany({
      data: [
        { assignment_type: "penguji_komprehensif_prodi", dosen_id: dosenA.id, pengajuan_id: ta04Id, is_active: true },
        { assignment_type: "penguji_komprehensif_keislaman", dosen_id: dosenB.id, pengajuan_id: ta04Id, is_active: true },
      ],
    });

    const sekprodiId = await getUserId("hasan@uinbanten.ac.id");
    await workflowStep(ta04Id, sekprodiId, "approve");
    await assertStatus(ta04Id, "pending_wd1");
  });

  await test("TA-04: wd1 sign → selesai", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ta04Id, wd1Id, "sign");
    await assertStatus(ta04Id, "selesai");
  });

  // Set TA-04 nilai_sidang to 'lulus' for TA-05 prereq
  await prisma.nilaiSidang.create({
    data: {
      pengajuan_id: ta04Id,
      dosen_id: dosenA.id,
      assignment_type: "penguji_komprehensif_prodi",
      keputusan: "lulus",
    },
  });

  // ── TA-06 first (needed before TA-05) ──

  await test("TA-06: submit (18%) → pending_kepala_lab", async () => {
    const wfId = await getWorkflowDefId("TA-06");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ta06Id = await submitViaDb({
      kode: "TA-06",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "prodi",
      fieldValues: {
        submission_id_turnitin: "TURN12345",
        url_turnitin: "https://turnitin.com/submission/12345",
        similarity_percentage: 18,
      },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ta06Id, "pending_kepala_lab");
  });

  await test("TA-06: kepala_lab approve → selesai", async () => {
    const kalabId = await getUserId("hamdan@uinbanten.ac.id");
    await workflowStep(ta06Id, kalabId, "approve");
    await assertStatus(ta06Id, "selesai");
  });

  // ── TA-05: Ujian Skripsi (Munaqasyah) ──

  await test("TA-05: submit → pending_staff_prodi", async () => {
    const wfId = await getWorkflowDefId("TA-05");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ta05Id = await submitViaDb({
      kode: "TA-05",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "prodi",
      fieldValues: {},
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ta05Id, "pending_staff_prodi");
  });

  await test("TA-05: staff_prodi approve → pending_sekprodi", async () => {
    const staffId = await getUserId("budi@uinbanten.ac.id");
    await workflowStep(ta05Id, staffId, "approve");
    await assertStatus(ta05Id, "pending_sekprodi");
  });

  await test("TA-05: sekprodi set majelis + approve → pending_wd1", async () => {
    const p = await prisma.pengajuanLayanan.findUnique({ where: { id: ta05Id } });
    // 4 different dosen for majelis
    const majelisDosenIds = [dosenA.id, dosenB.id, dosenC.id, dosenD.id];

    await prisma.assignment.createMany({
      data: [
        { assignment_type: "ketua_sidang", dosen_id: majelisDosenIds[0], pengajuan_id: ta05Id, mahasiswa_id: p!.mahasiswa_id, is_active: true },
        { assignment_type: "sekretaris_sidang", dosen_id: majelisDosenIds[1], pengajuan_id: ta05Id, mahasiswa_id: p!.mahasiswa_id, is_active: true },
        { assignment_type: "penguji_skripsi", dosen_id: majelisDosenIds[2], pengajuan_id: ta05Id, mahasiswa_id: p!.mahasiswa_id, is_active: true },
        { assignment_type: "penguji_skripsi", dosen_id: majelisDosenIds[3], pengajuan_id: ta05Id, mahasiswa_id: p!.mahasiswa_id, is_active: true },
      ],
    });

    const sekprodiId = await getUserId("hasan@uinbanten.ac.id");
    await workflowStep(ta05Id, sekprodiId, "approve");
    await assertStatus(ta05Id, "pending_wd1");
  });

  await test("TA-05: wd1 approve → pending_dekan", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ta05Id, wd1Id, "approve");
    await assertStatus(ta05Id, "pending_dekan");
  });

  await test("TA-05: dekan sign → selesai", async () => {
    const dekanId = await getUserId("dekan@uinbanten.ac.id");
    await workflowStep(ta05Id, dekanId, "sign");
    await assertStatus(ta05Id, "selesai");
  });

  // ── AK-01: Surat Keterangan Aktif Kuliah ──

  await test("AK-01: submit → pending_staff_akademik", async () => {
    const wfId = await getWorkflowDefId("AK-01");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ak01Id = await submitViaDb({
      kode: "AK-01",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "fakultas",
      fieldValues: { peruntukan: "Tunjangan Orang Tua" },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ak01Id, "pending_staff_akademik");
  });

  await test("AK-01: staff_akademik approve → pending_kabag", async () => {
    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(ak01Id, saId, "approve");
    await assertStatus(ak01Id, "pending_kabag");
  });

  await test("AK-01: kabag approve → pending_wd1", async () => {
    const kabagId = await getUserId("karim@uinbanten.ac.id");
    await workflowStep(ak01Id, kabagId, "approve");
    await assertStatus(ak01Id, "pending_wd1");
  });

  await test("AK-01: wd1 sign → selesai", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ak01Id, wd1Id, "sign");
    await assertStatus(ak01Id, "selesai");
  });

  // ── AK-02: Surat Keterangan Masih Kuliah (PNS) ──

  await test("AK-02: submit → pending_staff_akademik", async () => {
    const wfId = await getWorkflowDefId("AK-02");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ak02Id = await submitViaDb({
      kode: "AK-02",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "fakultas",
      fieldValues: {
        peruntukan: "Kenaikan Gaji Berkala",
        orang_tua_pns: "ya",
        nama_orang_tua: "Ahmad Syarif",
        nip_orang_tua: "123456789012345678",
        pangkat_golongan: "III/c",
        jabatan_orang_tua: "Kepala Bidang",
        instansi_orang_tua: "Kemenag Kab. Serang",
        hubungan_orang_tua: "ayah",
      },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ak02Id, "pending_staff_akademik");
  });

  await test("AK-02: staff_akademik approve → pending_kabag", async () => {
    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(ak02Id, saId, "approve");
    await assertStatus(ak02Id, "pending_kabag");
  });

  await test("AK-02: kabag approve → pending_wd1", async () => {
    const kabagId = await getUserId("karim@uinbanten.ac.id");
    await workflowStep(ak02Id, kabagId, "approve");
    await assertStatus(ak02Id, "pending_wd1");
  });

  await test("AK-02: wd1 sign → selesai", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ak02Id, wd1Id, "sign");
    await assertStatus(ak02Id, "selesai");
  });

  // ── AK-03: Surat Keterangan Pernah Kuliah (dekan signs) ──

  await test("AK-03: submit → pending_staff_akademik", async () => {
    const wfId = await getWorkflowDefId("AK-03");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ak03Id = await submitViaDb({
      kode: "AK-03",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "fakultas",
      fieldValues: { peruntukan: "Melamar Pekerjaan" },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ak03Id, "pending_staff_akademik");
  });

  await test("AK-03: staff_akademik approve → pending_kabag", async () => {
    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(ak03Id, saId, "approve");
    await assertStatus(ak03Id, "pending_kabag");
  });

  await test("AK-03: kabag approve → pending_dekan", async () => {
    const kabagId = await getUserId("karim@uinbanten.ac.id");
    await workflowStep(ak03Id, kabagId, "approve");
    await assertStatus(ak03Id, "pending_dekan");
  });

  await test("AK-03: dekan sign → selesai", async () => {
    const dekanId = await getUserId("dekan@uinbanten.ac.id");
    await workflowStep(ak03Id, dekanId, "sign");
    await assertStatus(ak03Id, "selesai");
  });

  // ── AK-04: Surat Pengantar Observasi ──

  await test("AK-04: submit → pending_staff_akademik", async () => {
    const wfId = await getWorkflowDefId("AK-04");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ak04Id = await submitViaDb({
      kode: "AK-04",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "fakultas",
      fieldValues: {
        mata_kuliah: "Metodologi Penelitian",
        instansi_tujuan: "Kemenag Kota Serang",
        pejabat_tujuan: "Kepala Kantor",
        lokasi_observasi: "Jl. Veteran No. 5",
        tanggal_mulai: "2026-09-01",
        tanggal_selesai: "2026-09-15",
        dosen_pembimbing_observasi_id: dosenB.id,
      },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ak04Id, "pending_staff_akademik");
  });

  await test("AK-04: staff_akademik approve → pending_kabag", async () => {
    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(ak04Id, saId, "approve");
    await assertStatus(ak04Id, "pending_kabag");
  });

  await test("AK-04: kabag approve → pending_wd1", async () => {
    const kabagId = await getUserId("karim@uinbanten.ac.id");
    await workflowStep(ak04Id, kabagId, "approve");
    await assertStatus(ak04Id, "pending_wd1");
  });

  await test("AK-04: wd1 sign → selesai", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ak04Id, wd1Id, "sign");
    await assertStatus(ak04Id, "selesai");
  });

  // ── AK-05: Surat Pengantar Penelitian ──

  await test("AK-05: submit → pending_staff_akademik", async () => {
    const wfId = await getWorkflowDefId("AK-05");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ak05Id = await submitViaDb({
      kode: "AK-05",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "fakultas",
      fieldValues: {
        judul_penelitian: "Analisis Hadis tentang Pendidikan",
        lokasi_penelitian: "Perpustakaan UIN Banten",
        tujuan_penelitian: "Mengumpulkan data primer",
        tanggal_mulai: "2026-10-01",
        tanggal_selesai: "2026-12-31",
      },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ak05Id, "pending_staff_akademik");
  });

  await test("AK-05: staff_akademik approve → pending_kabag", async () => {
    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(ak05Id, saId, "approve");
    await assertStatus(ak05Id, "pending_kabag");
  });

  await test("AK-05: kabag approve → pending_wd1", async () => {
    const kabagId = await getUserId("karim@uinbanten.ac.id");
    await workflowStep(ak05Id, kabagId, "approve");
    await assertStatus(ak05Id, "pending_wd1");
  });

  await test("AK-05: wd1 sign → selesai", async () => {
    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(ak05Id, wd1Id, "sign");
    await assertStatus(ak05Id, "selesai");
  });

  // ── AK-06: Surat Permohonan Magang (dekan signs) ──

  await test("AK-06: submit → pending_staff_akademik", async () => {
    const wfId = await getWorkflowDefId("AK-06");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ak06Id = await submitViaDb({
      kode: "AK-06",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "fakultas",
      fieldValues: {
        bidang_magang: "Teknologi Informasi",
        instansi_tujuan: "Diskominfo Provinsi Banten",
        alamat_instansi: "Jl. Syech Nawawi No. 1",
        pejabat_tujuan: "Kepala Dinas",
        tanggal_mulai: "2026-07-01",
        tanggal_selesai: "2026-08-31",
        dosen_pembimbing_magang_id: dosenC.id,
      },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ak06Id, "pending_staff_akademik");
  });

  await test("AK-06: staff_akademik approve → pending_kabag", async () => {
    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(ak06Id, saId, "approve");
    await assertStatus(ak06Id, "pending_kabag");
  });

  await test("AK-06: kabag approve → pending_dekan", async () => {
    const kabagId = await getUserId("karim@uinbanten.ac.id");
    await workflowStep(ak06Id, kabagId, "approve");
    await assertStatus(ak06Id, "pending_dekan");
  });

  await test("AK-06: dekan sign → selesai", async () => {
    const dekanId = await getUserId("dekan@uinbanten.ac.id");
    await workflowStep(ak06Id, dekanId, "sign");
    await assertStatus(ak06Id, "selesai");
  });

  // ── AK-07: Surat Rekomendasi (dekan signs) ──

  await test("AK-07: submit → pending_staff_akademik", async () => {
    const wfId = await getWorkflowDefId("AK-07");
    const periodId = await getPeriodId();
    const mhsEmail = "aini@student.uinbanten.ac.id";
    const mhsUser = await prisma.user.findUnique({
      where: { email: mhsEmail },
      include: { mahasiswa: { include: { prodi: true } } },
    });
    if (!mhsUser?.mahasiswa) throw new Error("Aini not found");

    ak07Id = await submitViaDb({
      kode: "AK-07",
      mahasiswaId: mhsUser.mahasiswa.id,
      prodiId: mhsUser.mahasiswa.prodi_id,
      fakultasId: mhsUser.mahasiswa.prodi.fakultas_id,
      scopeLevel: "fakultas",
      fieldValues: {
        tipe_rekomendasi: "beasiswa",
        tujuan_rekomendasi: "Beasiswa LPDP 2026",
        pihak_penerima: "LPDP Kemenkeu RI",
      },
      userId: mhsUser.id,
      workflowDefId: wfId,
      academicPeriodId: periodId,
    });

    await assertStatus(ak07Id, "pending_staff_akademik");
  });

  await test("AK-07: staff_akademik approve → pending_kabag", async () => {
    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(ak07Id, saId, "approve");
    await assertStatus(ak07Id, "pending_kabag");
  });

  await test("AK-07: kabag approve → pending_dekan", async () => {
    const kabagId = await getUserId("karim@uinbanten.ac.id");
    await workflowStep(ak07Id, kabagId, "approve");
    await assertStatus(ak07Id, "pending_dekan");
  });

  await test("AK-07: dekan sign → selesai", async () => {
    const dekanId = await getUserId("dekan@uinbanten.ac.id");
    await workflowStep(ak07Id, dekanId, "sign");
    await assertStatus(ak07Id, "selesai");
  });
}
