"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { encrypt } from "@/lib/crypto";
import { cookies } from "next/headers";
import { type SystemRole } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (user?.system_role !== "super_admin") throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya super admin");
  return user;
}

// ============================================================
// USERS
// ============================================================

export async function createUser(formData: FormData) {
  await requireAdmin();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const systemRole = formData.get("system_role") as string;
  const namaLengkap = formData.get("nama_lengkap") as string;

  if (!email || !password || !systemRole || !namaLengkap) {
    throw new Error("ERR_VAL_REQUIRED_FIELD: Semua field wajib diisi");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const isDosen = ["dosen", "kaprodi", "sekprodi", "wakil_dekan_1", "dekan", "kepala_lab"].includes(systemRole);
  const isPegawai = ["staff_prodi", "staff_akademik", "kabag"].includes(systemRole);
  const isMahasiswa = systemRole === "mahasiswa";

  if (isDosen) {
    const nidn = (formData.get("nidn") as string) || "";
    if (!nidn) throw new Error("ERR_VAL_REQUIRED_FIELD: NIDN wajib untuk dosen");
    const dosen = await prisma.dosen.create({ data: { nidn, nama_lengkap: namaLengkap, is_active: true } });
    await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: systemRole as any, dosen_id: dosen.id, is_active: true } });
  } else if (isPegawai) {
    const nip = (formData.get("nip") as string) || "";
    if (!nip) throw new Error("ERR_VAL_REQUIRED_FIELD: NIP wajib untuk pegawai");
    const pegawai = await prisma.pegawai.create({ data: { nip, nama_lengkap: namaLengkap, is_active: true } });
    await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: systemRole as any, pegawai_id: pegawai.id, is_active: true } });
  } else if (isMahasiswa) {
    const nim = (formData.get("nim") as string) || "";
    const prodiId = Number(formData.get("prodi_id")) || 0;
    if (!nim) throw new Error("ERR_VAL_REQUIRED_FIELD: NIM wajib");
    if (!prodiId) throw new Error("ERR_VAL_REQUIRED_FIELD: Prodi wajib");
    const mhs = await prisma.mahasiswa.create({ data: { nim, nama_lengkap: namaLengkap, prodi_id: prodiId, angkatan: new Date().getFullYear(), semester_aktif: 1, status_mahasiswa: "aktif" } });
    await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: "mahasiswa", mahasiswa_id: mhs.id, is_active: true } });
  } else {
    await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: systemRole as any, is_active: true } });
  }

  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: number) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  await prisma.user.update({ where: { id: userId }, data: { is_active: !user.is_active } });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: number) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.system_role === "super_admin") throw new Error("Tidak bisa hapus super admin");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

// ============================================================
// ACADEMIC PERIODS
// ============================================================

export async function createAcademicPeriod(formData: FormData) {
  await requireAdmin();
  const nama = formData.get("nama_semester") as string;
  const tahun = formData.get("tahun_akademik") as string;
  const tipe = formData.get("tipe") as string;
  const mulai = formData.get("tanggal_mulai") as string;
  const berakhir = formData.get("tanggal_berakhir") as string;

  if (!nama || !tahun || !tipe || !mulai || !berakhir) {
    throw new Error("ERR_VAL_REQUIRED_FIELD: Semua field wajib");
  }

  await prisma.academicPeriod.create({
    data: {
      nama_semester: nama,
      tahun_akademik: tahun,
      tipe: tipe as any,
      tanggal_mulai: new Date(mulai),
      tanggal_berakhir: new Date(berakhir),
      status: "upcoming" as any,
    },
  });
  revalidatePath("/admin/periods");
}

export async function setActivePeriod(periodId: number) {
  await requireAdmin();
  await prisma.academicPeriod.updateMany({ data: { status: "completed" as any } });
  await prisma.academicPeriod.update({ where: { id: periodId }, data: { status: "active" } });
  revalidatePath("/admin/periods");
}

export async function deletePeriod(periodId: number) {
  await requireAdmin();
  const period = await prisma.academicPeriod.findUnique({ where: { id: periodId } });
  if (!period) throw new Error("Period not found");
  if (period.status === "active") throw new Error("Tidak bisa hapus periode aktif");
  await prisma.academicPeriod.delete({ where: { id: periodId } });
  revalidatePath("/admin/periods");
}

// ============================================================
// SYSTEM CONFIG
// ============================================================

export async function updateConfig(formData: FormData) {
  await requireAdmin();

  const entries = [
    { key: "app_name", value: formData.get("app_name") as string },
    { key: "logo_url", value: formData.get("logo_url") as string },
    { key: "footer_text", value: formData.get("footer_text") as string },
    { key: "turnitin_threshold", value: formData.get("turnitin_threshold") as string },
    { key: "smtp_host", value: formData.get("smtp_host") as string },
    { key: "smtp_port", value: formData.get("smtp_port") as string },
    { key: "smtp_user", value: formData.get("smtp_user") as string },
    {
      key: "smtp_pass",
      value: (() => {
        const pass = formData.get("smtp_pass") as string;
        return pass && pass.length > 0 ? encrypt(pass) : pass;
      })(),
    },
  ];

  for (const entry of entries) {
    if (entry.value !== null && entry.value !== undefined) {
      await prisma.appConfig.upsert({
        where: { key: entry.key },
        update: { value: entry.value, updated_at: new Date() },
        create: { key: entry.key, value: entry.value },
      });
    }
  }

  revalidatePath("/admin/config");
}

// ============================================================
// STRUCTURAL POSITIONS
// ============================================================

export async function assignStructuralPosition(formData: FormData) {
  await requireAdmin();

  const positionCode = formData.get("position_code") as string;
  const dosenIdRaw = formData.get("dosen_id") as string | null;
  const pegawaiIdRaw = formData.get("pegawai_id") as string | null;
  const prodiIdRaw = formData.get("prodi_id") as string | null;
  const dosenId = dosenIdRaw ? Number(dosenIdRaw) : null;
  const pegawaiId = pegawaiIdRaw ? Number(pegawaiIdRaw) : null;
  const prodiId = prodiIdRaw ? Number(prodiIdRaw) : null;

  if (!positionCode) {
    throw new Error("ERR_VAL_REQUIRED_FIELD: position_code wajib diisi");
  }
  if (!dosenId && !pegawaiId) {
    throw new Error("ERR_VAL_REQUIRED_FIELD: dosen_id atau pegawai_id wajib diisi");
  }

  await prisma.structuralPosition.updateMany({
    where: { position_code: positionCode as any, is_active: true },
    data: { is_active: false, end_date: new Date() },
  });

  await prisma.structuralPosition.create({
    data: {
      position_code: positionCode as any,
      dosen_id: dosenId,
      pegawai_id: pegawaiId,
      prodi_id: prodiId,
      is_active: true,
      start_date: new Date(),
    },
  });

  revalidatePath("/admin/positions");
}

export async function removeStructuralPosition(positionId: number) {
  await requireAdmin();
  await prisma.structuralPosition.update({
    where: { id: positionId },
    data: { is_active: false, end_date: new Date() },
  });
  revalidatePath("/admin/positions");
}

// ============================================================
// DOSEN
// ============================================================

export async function updateDosen(dosenId: number, formData: FormData) {
  await requireAdmin();
  await prisma.dosen.update({
    where: { id: dosenId },
    data: {
      nama_lengkap: (formData.get("nama_lengkap") as string) || undefined,
      gelar_depan: (formData.get("gelar_depan") as string) || null,
      gelar_belakang: (formData.get("gelar_belakang") as string) || null,
      jabatan_fungsional: (formData.get("jabatan_fungsional") as string) || null,
      bidang_keahlian: (formData.get("bidang_keahlian") as string) || null,
      pangkat_golongan: (formData.get("pangkat_golongan") as string) || null,
    },
  });
  revalidatePath("/admin/dosen");
}

export async function toggleDosenActive(dosenId: number) {
  await requireAdmin();
  const dosen = await prisma.dosen.findUnique({ where: { id: dosenId } });
  if (!dosen) throw new Error("Dosen tidak ditemukan");
  await prisma.dosen.update({ where: { id: dosenId }, data: { is_active: !dosen.is_active } });
  revalidatePath("/admin/dosen");
}

// ============================================================
// PEGAWAI
// ============================================================

export async function updatePegawai(pegawaiId: number, formData: FormData) {
  await requireAdmin();
  await prisma.pegawai.update({
    where: { id: pegawaiId },
    data: {
      nama_lengkap: (formData.get("nama_lengkap") as string) || undefined,
      golongan: (formData.get("golongan") as string) || null,
      unit_kerja: (formData.get("unit_kerja") as string) || null,
    },
  });
  revalidatePath("/admin/pegawai");
}

export async function togglePegawaiActive(pegawaiId: number) {
  await requireAdmin();
  const pegawai = await prisma.pegawai.findUnique({ where: { id: pegawaiId } });
  if (!pegawai) throw new Error("Pegawai tidak ditemukan");
  await prisma.pegawai.update({ where: { id: pegawaiId }, data: { is_active: !pegawai.is_active } });
  revalidatePath("/admin/pegawai");
}

// ============================================================
// PRODI
// ============================================================

export async function createProdi(formData: FormData) {
  await requireAdmin();
  const kode = formData.get("kode") as string;
  const nama = formData.get("nama") as string;
  const fakultasId = Number(formData.get("fakultas_id"));
  if (!kode || !nama || !fakultasId) throw new Error("ERR_VAL_REQUIRED_FIELD: Semua field wajib");
  await prisma.prodi.create({ data: { kode, nama, fakultas_id: fakultasId } });
  revalidatePath("/admin/prodi");
}

export async function updateProdi(prodiId: number, formData: FormData) {
  await requireAdmin();
  const nama = formData.get("nama") as string;
  if (!nama) throw new Error("ERR_VAL_REQUIRED_FIELD: Nama wajib");
  await prisma.prodi.update({ where: { id: prodiId }, data: { nama } });
  revalidatePath("/admin/prodi");
}

export async function toggleProdiActive(prodiId: number) {
  await requireAdmin();
  const prodi = await prisma.prodi.findUnique({ where: { id: prodiId } });
  if (!prodi) throw new Error("Prodi tidak ditemukan");
  await prisma.prodi.update({ where: { id: prodiId }, data: { is_active: !prodi.is_active } });
  revalidatePath("/admin/prodi");
}

// ============================================================
// KODE KLASIFIKASI
// ============================================================

export async function createKodeKlasifikasi(formData: FormData) {
  await requireAdmin();
  const kode = (formData.get("kode") as string)?.trim().toUpperCase();
  const nama = formData.get("nama") as string;
  const deskripsi = (formData.get("deskripsi") as string) || null;
  if (!kode || !nama) throw new Error("ERR_VAL_REQUIRED_FIELD: Kode dan nama wajib");
  await prisma.kodeKlasifikasi.create({ data: { kode, nama, deskripsi } });
  revalidatePath("/admin/kode-klasifikasi");
}

export async function updateKodeKlasifikasi(id: number, formData: FormData) {
  await requireAdmin();
  const nama = formData.get("nama") as string;
  const deskripsi = (formData.get("deskripsi") as string) || null;
  if (!nama) throw new Error("ERR_VAL_REQUIRED_FIELD: Nama wajib");
  await prisma.kodeKlasifikasi.update({ where: { id }, data: { nama, deskripsi } });
  revalidatePath("/admin/kode-klasifikasi");
}

// ============================================================
// PENOMORAN SURAT
// ============================================================

export async function voidPenomoranById(penomoranId: number) {
  await requireAdmin();
  const counter = await prisma.penomoranCounter.findUnique({ where: { id: penomoranId } });
  if (!counter) throw new Error("Penomoran tidak ditemukan");
  if (counter.status !== "reserved") throw new Error("Hanya penomoran berstatus 'reserved' yang bisa di-void");
  await prisma.penomoranCounter.update({
    where: { id: penomoranId },
    data: { status: "void", voided_at: new Date() },
  });
  revalidatePath("/admin/penomoran");
}

// ============================================================
// JENIS LAYANAN
// ============================================================

export async function toggleLayananActive(layananId: number) {
  await requireAdmin();
  const layanan = await prisma.jenisLayanan.findUnique({ where: { id: layananId } });
  if (!layanan) throw new Error("Layanan tidak ditemukan");
  await prisma.jenisLayanan.update({ where: { id: layananId }, data: { is_active: !layanan.is_active } });
  revalidatePath("/admin/layanan");
  revalidatePath("/pengajuan/baru");
}

// ============================================================
// USER EDIT
// ============================================================

export async function updateUserEmail(userId: number, formData: FormData) {
  await requireAdmin();
  const email = (formData.get("email") as string)?.trim();
  if (!email) throw new Error("ERR_VAL_REQUIRED_FIELD: Email wajib");
  const existing = await prisma.user.findFirst({ where: { email, id: { not: userId } } });
  if (existing) throw new Error("ERR_BUS_DUPLICATE: Email sudah digunakan");
  await prisma.user.update({ where: { id: userId }, data: { email } });
  revalidatePath("/admin/users");
}

export async function resetUserPassword(userId: number, formData: FormData) {
  await requireAdmin();
  const newPassword = formData.get("new_password") as string;
  if (!newPassword || newPassword.length < 8) throw new Error("ERR_VAL_MIN_LENGTH: Password minimal 8 karakter");
  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password_hash: hash } });
  revalidatePath("/admin/users");
}

// ============================================================
// SEMESTER SELECTOR
// ============================================================

export async function setActiveSemester(semesterId: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("selected_semester_id", String(semesterId), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

// ============================================================
// BULK IMPORT USERS
// ============================================================

export async function importUsersFromCsv(formData: FormData): Promise<{
  success: number;
  failed: Array<{ row: number; email: string; error: string }>;
}> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("File tidak ditemukan");

  const text = await file.text();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // skip header row
  const dataLines = lines.slice(1);

  let success = 0;
  const failed: Array<{ row: number; email: string; error: string }> = [];

  const isDosen = (role: string) =>
    ["dosen", "kaprodi", "sekprodi", "wakil_dekan_1", "dekan"].includes(role);
  const isPegawai = (role: string) =>
    ["staff_prodi", "staff_akademik", "kabag", "super_admin"].includes(role);

  for (let i = 0; i < dataLines.length; i++) {
    const rowNum = i + 2; // +2 because row 1 is header
    const cols = dataLines[i].split(",").map((c) => c.trim());
    const [email, password, system_role, nama_lengkap, identifier, prodi_kode, angkatan_str] = cols;

    if (!email || !password || !system_role || !nama_lengkap || !identifier) {
      failed.push({ row: rowNum, email: email ?? "", error: "Kolom wajib tidak lengkap (email, password, system_role, nama_lengkap, identifier)" });
      continue;
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        failed.push({ row: rowNum, email, error: "Email sudah terdaftar" });
        continue;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      if (system_role === "mahasiswa") {
        if (!prodi_kode) {
          failed.push({ row: rowNum, email, error: "prodi_kode wajib untuk mahasiswa" });
          continue;
        }
        const prodi = await prisma.prodi.findFirst({ where: { kode: prodi_kode } });
        if (!prodi) {
          failed.push({ row: rowNum, email, error: `Prodi dengan kode '${prodi_kode}' tidak ditemukan` });
          continue;
        }
        const angkatan = angkatan_str ? parseInt(angkatan_str, 10) : new Date().getFullYear();
        if (isNaN(angkatan)) {
          failed.push({ row: rowNum, email, error: "angkatan harus berupa angka tahun" });
          continue;
        }

        const mhs = await prisma.mahasiswa.create({
          data: {
            nim: identifier,
            nama_lengkap,
            prodi_id: prodi.id,
            angkatan,
            semester_aktif: 1,
            status_mahasiswa: "aktif",
          },
        });
        await prisma.user.create({
          data: {
            email,
            password_hash: passwordHash,
            system_role: "mahasiswa",
            mahasiswa_id: mhs.id,
            is_active: true,
          },
        });
      } else if (isDosen(system_role)) {
        const dosen = await prisma.dosen.create({
          data: {
            nidn: identifier,
            nama_lengkap,
            is_active: true,
          },
        });
        await prisma.user.create({
          data: {
            email,
            password_hash: passwordHash,
            system_role: system_role as SystemRole,
            dosen_id: dosen.id,
            is_active: true,
          },
        });
      } else if (isPegawai(system_role)) {
        const pegawai = await prisma.pegawai.create({
          data: {
            nip: identifier,
            nama_lengkap,
            is_active: true,
          },
        });
        await prisma.user.create({
          data: {
            email,
            password_hash: passwordHash,
            system_role: system_role as SystemRole,
            pegawai_id: pegawai.id,
            is_active: true,
          },
        });
      } else {
        failed.push({ row: rowNum, email, error: `system_role '${system_role}' tidak dikenal` });
        continue;
      }

      success++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error tidak diketahui";
      failed.push({ row: rowNum, email, error: msg });
    }
  }

  return { success, failed };
}
