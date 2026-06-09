"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { saveUploadedFile } from "@/lib/upload";

async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { dosen: true, pegawai: true, mahasiswa: true },
  });
  if (!user) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  return user;
}

export async function updateProfil(formData: FormData) {
  const user = await getAuthUser();
  const namaLengkap = (formData.get("nama_lengkap") as string)?.trim();

  if (!namaLengkap) throw new Error("ERR_VAL_REQUIRED_FIELD: Nama lengkap wajib diisi");

  if (user.dosen) {
    await prisma.dosen.update({ where: { id: user.dosen.id }, data: { nama_lengkap: namaLengkap } });
  } else if (user.pegawai) {
    await prisma.pegawai.update({ where: { id: user.pegawai.id }, data: { nama_lengkap: namaLengkap } });
  } else if (user.mahasiswa) {
    await prisma.mahasiswa.update({ where: { id: user.mahasiswa.id }, data: { nama_lengkap: namaLengkap } });
  }

  revalidatePath("/profil");
}

export async function changePassword(formData: FormData) {
  const user = await getAuthUser();
  const oldPassword = formData.get("old_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new Error("ERR_VAL_REQUIRED_FIELD: Semua field password wajib diisi");
  }
  if (newPassword.length < 8) {
    throw new Error("ERR_VAL_MIN_LENGTH: Password minimal 8 karakter");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("ERR_VAL_MISMATCH: Konfirmasi password tidak cocok");
  }

  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw new Error("ERR_AUTH_INVALID_CREDENTIALS: Password lama tidak benar");

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password_hash: newHash } });

  revalidatePath("/profil");
}

export async function uploadTtdScan(formData: FormData) {
  const user = await getAuthUser();
  const file = formData.get("ttd_scan") as File | null;

  if (!file || file.size === 0) throw new Error("ERR_VAL_REQUIRED_FIELD: File TTD wajib diupload");

  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("ERR_VAL_INVALID_FORMAT: Format harus JPG atau PNG");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("ERR_VAL_MAX_SIZE: Ukuran file maksimal 2MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : "jpg";
  const destPath = `ttd_scan/${user.id}/ttd.${ext}`;

  // Use storage directly since no dokumenPersyaratan linked
  const { storage } = await import("@/lib/storage/local");
  const filePath = await storage.upload(destPath, buffer, file.type);

  await prisma.ttdScan.upsert({
    where: { user_id: user.id },
    update: { file_path: filePath, updated_at: new Date() },
    create: { user_id: user.id, file_path: filePath },
  });

  revalidatePath("/profil");
}
