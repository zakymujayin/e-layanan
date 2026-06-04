"use server";

import { prisma } from "@/lib/prisma";
import { nimValidator } from "@/lib/nim-validator/local";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function registerMahasiswa(data: {
  nim: string;
  email: string;
  password: string;
}) {
  const validation = await nimValidator.validate(data.nim);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: "ERR_VAL_INVALID_NIM",
        message: "NIM tidak valid atau tidak terdaftar",
      },
    };
  }

  const existingMhs = await prisma.mahasiswa.findUnique({
    where: { nim: data.nim },
  });
  if (existingMhs) {
    const existingUser = await prisma.user.findFirst({
      where: { mahasiswa_id: existingMhs.id },
    });
    if (existingUser) {
      return {
        success: false,
        error: {
          code: "ERR_VAL_DUPLICATE",
          message: "NIM sudah terdaftar",
        },
      };
    }
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingEmail) {
    return {
      success: false,
      error: {
        code: "ERR_VAL_DUPLICATE",
        message: "Email sudah terdaftar",
      },
    };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const mahasiswa = await tx.mahasiswa.upsert({
      where: { nim: data.nim },
      update: { nama_lengkap: validation.nama },
      create: {
        nim: data.nim,
        nama_lengkap: validation.nama,
        prodi_id: 1,
        angkatan: validation.angkatan,
        status_mahasiswa: "aktif",
      },
    });

    const user = await tx.user.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        system_role: "mahasiswa",
        mahasiswa_id: mahasiswa.id,
        is_active: true,
      },
    });

    return { mahasiswa, user };
  });

  return { success: true, data: { id: result.user.id } };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user || !user.is_active) return; // Silent — don't reveal user existence

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { password_reset_token: token, password_reset_expires: expires },
  });

  if (process.env.NODE_ENV !== "production") {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${token}`;
    console.log(`[SILA RESET DEV] Reset link untuk ${normalized}: ${resetUrl}`);
  }
  // Production: send via SMTP once configured in app_config
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  if (!token) throw new Error("ERR_VAL_REQUIRED_FIELD: Token wajib");
  if (!newPassword || newPassword.length < 8) {
    throw new Error("ERR_VAL_MIN_LENGTH: Password baru minimal 8 karakter");
  }

  const user = await prisma.user.findFirst({
    where: {
      password_reset_token: token,
      password_reset_expires: { gt: new Date() },
    },
  });
  if (!user) throw new Error("ERR_AUTH_TOKEN_INVALID: Token tidak valid atau sudah kedaluwarsa");

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password_hash: hash, password_reset_token: null, password_reset_expires: null },
  });
}
