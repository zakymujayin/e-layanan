import { prisma } from "../src/lib/prisma";
import { test, getFirstProdi, getFirstFakultas, getFreeDosen } from "./test-helpers";

export async function runCrudTests() {
  console.log("\n── CRUD Tests");

  // Cleanup any leftover test data
  const testEmail = "crudtest@uinbanten.ac.id";
  const testNim = "99999999";
  const testNidn = "9999999999";
  const testNip = "999999999999999999";

  const existingUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } }).catch(() => {});
  }
  await prisma.mahasiswa.deleteMany({ where: { nim: testNim } }).catch(() => {});
  await prisma.dosen.deleteMany({ where: { nidn: testNidn } }).catch(() => {});
  await prisma.pegawai.deleteMany({ where: { nip: testNip } }).catch(() => {});

  let testUserId = 0;
  let testDosenId = 0;
  let testPegawaiId = 0;
  let testMahasiswaId = 0;
  let testProdiId = 0;
  let testPeriodId = 0;

  // ── USER MANAGEMENT ──

  await test("Create user (mahasiswa)", async () => {
    const prodi = await getFirstProdi();
    const mhs = await prisma.mahasiswa.create({
      data: {
        nim: testNim,
        nama_lengkap: "Test Mahasiswa",
        prodi_id: prodi.id,
        angkatan: 2025,
        semester_aktif: 1,
        status_mahasiswa: "aktif",
      },
    });
    testMahasiswaId = mhs.id;

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password_hash: "$2a$12$dummyhash",
        system_role: "mahasiswa",
        mahasiswa_id: mhs.id,
        is_active: true,
      },
    });
    testUserId = user.id;

    const verify = await prisma.user.findUnique({
      where: { id: testUserId },
      include: { mahasiswa: true },
    });
    if (!verify || !verify.mahasiswa) throw new Error("User not created correctly");
  });

  await test("Create user (dosen)", async () => {
    const dosen = await prisma.dosen.create({
      data: {
        nidn: testNidn,
        nama_lengkap: "Test Dosen",
        is_active: true,
      },
    });
    testDosenId = dosen.id;

    const user = await prisma.user.create({
      data: {
        email: "dosen.test@uinbanten.ac.id",
        password_hash: "$2a$12$dummyhash",
        system_role: "dosen",
        dosen_id: dosen.id,
        is_active: true,
      },
    });

    const verify = await prisma.user.findUnique({
      where: { id: user.id },
      include: { dosen: true },
    });
    if (!verify || !verify.dosen) throw new Error("Dosen user not created correctly");
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    await prisma.dosen.delete({ where: { id: dosen.id } }).catch(() => {});
  });

  await test("Create user (pegawai)", async () => {
    const pegawai = await prisma.pegawai.create({
      data: {
        nip: testNip,
        nama_lengkap: "Test Pegawai",
        is_active: true,
      },
    });
    testPegawaiId = pegawai.id;

    const user = await prisma.user.create({
      data: {
        email: "pegawai.test@uinbanten.ac.id",
        password_hash: "$2a$12$dummyhash",
        system_role: "staff_akademik",
        pegawai_id: pegawai.id,
        is_active: true,
      },
    });

    const verify = await prisma.user.findUnique({
      where: { id: user.id },
      include: { pegawai: true },
    });
    if (!verify || !verify.pegawai) throw new Error("Pegawai user not created correctly");
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    await prisma.pegawai.delete({ where: { id: pegawai.id } }).catch(() => {});
  });

  await test("Create user duplicate email → error", async () => {
    let errored = false;
    try {
      await prisma.user.create({
        data: {
          email: testEmail,
          password_hash: "$2a$12$dummyhash",
          system_role: "mahasiswa",
          is_active: true,
        },
      });
    } catch {
      errored = true;
    }
    if (!errored) throw new Error("Should have thrown unique constraint error");
  });

  await test("Update user email", async () => {
    const updated = await prisma.user.update({
      where: { id: testUserId },
      data: { email: "crudtest-updated@uinbanten.ac.id" },
    });
    if (updated.email !== "crudtest-updated@uinbanten.ac.id")
      throw new Error("Email not updated");
    await prisma.user.update({
      where: { id: testUserId },
      data: { email: testEmail },
    });
  });

  await test("Toggle user active status", async () => {
    const u = await prisma.user.findUnique({ where: { id: testUserId } });
    const newActive = !u!.is_active;
    const updated = await prisma.user.update({
      where: { id: testUserId },
      data: { is_active: newActive },
    });
    if (updated.is_active !== newActive) throw new Error("Active toggle failed");
    await prisma.user.update({
      where: { id: testUserId },
      data: { is_active: true },
    });
  });

  // ── ACADEMIC PERIOD ──

  await test("Create academic period", async () => {
    const period = await prisma.academicPeriod.create({
      data: {
        nama_semester: "Test Ganjil 2026/2027",
        tahun_akademik: "2026/2027",
        tipe: "ganjil",
        tanggal_mulai: new Date("2026-08-01"),
        status: "upcoming",
      },
    });
    testPeriodId = period.id;
    const verify = await prisma.academicPeriod.findUnique({
      where: { id: testPeriodId },
    });
    if (!verify) throw new Error("Period not created");
  });

  // ── SYSTEM CONFIG ──

  await test("Update system config (app_name)", async () => {
    await prisma.appConfig.upsert({
      where: { key: "app_name" },
      update: { value: "SILA Test v2" },
      create: { key: "app_name", value: "SILA Test v2" },
    });
    const cfg = await prisma.appConfig.findUnique({ where: { key: "app_name" } });
    if (cfg!.value !== "SILA Test v2") throw new Error("Config not updated");
    await prisma.appConfig.update({
      where: { key: "app_name" },
      data: { value: "SILA - Sistem Informasi Layanan Akademik" },
    });
  });

  await test("Update system config (turnitin_threshold)", async () => {
    await prisma.appConfig.upsert({
      where: { key: "turnitin_threshold" },
      update: { value: "30" },
      create: { key: "turnitin_threshold", value: "30" },
    });
    const cfg = await prisma.appConfig.findUnique({ where: { key: "turnitin_threshold" } });
    if (cfg!.value !== "30") throw new Error("Threshold not updated");
    await prisma.appConfig.update({
      where: { key: "turnitin_threshold" },
      data: { value: "25" },
    });
  });

  // ── STRUCTURAL POSITIONS ──

  await test("Assign structural position (kaprodi)", async () => {
    const freeDosen = await getFreeDosen("kaprodi");
    const prodi = await getFirstProdi();
    const pos = await prisma.structuralPosition.create({
      data: {
        position_code: "kaprodi",
        dosen_id: freeDosen.id,
        prodi_id: prodi.id,
        start_date: new Date(),
        is_active: true,
      },
    });
    const verify = await prisma.structuralPosition.findUnique({ where: { id: pos.id } });
    if (!verify || !verify.is_active) throw new Error("Position not active");
    await prisma.structuralPosition.delete({ where: { id: pos.id } });
  });

  await test("Remove structural position (soft delete)", async () => {
    const freeDosen = await getFreeDosen("sekprodi");
    const prodi = await getFirstProdi();
    const pos = await prisma.structuralPosition.create({
      data: {
        position_code: "sekprodi",
        dosen_id: freeDosen.id,
        prodi_id: prodi.id,
        start_date: new Date(),
        is_active: true,
      },
    });
    const updated = await prisma.structuralPosition.update({
      where: { id: pos.id },
      data: { is_active: false, end_date: new Date() },
    });
    if (updated.is_active) throw new Error("Position not deactivated");
    await prisma.structuralPosition.delete({ where: { id: pos.id } });
  });

  // ── PRODI ──

  await test("Create prodi", async () => {
    const fakultas = await getFirstFakultas();
    const prodi = await prisma.prodi.create({
      data: {
        kode: "TEST-PRODI",
        nama: "Test Program Studi",
        fakultas_id: fakultas.id,
        is_active: true,
      },
    });
    testProdiId = prodi.id;
    const verify = await prisma.prodi.findUnique({ where: { id: prodi.id } });
    if (!verify) throw new Error("Prodi not created");
  });

  // ── JENIS LAYANAN TOGGLE ──

  await test("Toggle jenis layanan active", async () => {
    const layanan = await prisma.jenisLayanan.findFirst({ where: { kode: "AK-07" } });
    if (!layanan) throw new Error("AK-07 not found");
    await prisma.jenisLayanan.update({
      where: { id: layanan.id },
      data: { is_active: false },
    });
    const verify = await prisma.jenisLayanan.findUnique({ where: { id: layanan.id } });
    if (verify!.is_active) throw new Error("Layanan not deactivated");
    await prisma.jenisLayanan.update({
      where: { id: layanan.id },
      data: { is_active: true },
    });
  });

  // ── CLEANUP ──

  await test("Cleanup test data", async () => {
    await prisma.user.deleteMany({ where: { email: { in: [testEmail, "crudtest-updated@uinbanten.ac.id"] } } }).catch(() => {});
    await prisma.mahasiswa.deleteMany({ where: { id: testMahasiswaId } }).catch(() => {});
    await prisma.prodi.deleteMany({ where: { id: testProdiId } }).catch(() => {});
    if (testPeriodId > 0) {
      await prisma.academicPeriod.delete({ where: { id: testPeriodId } }).catch(() => {});
    }
  });
}
