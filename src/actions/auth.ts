"use server";

import { prisma } from "@/lib/prisma";
import { nimValidator } from "@/lib/nim-validator/local";
import bcrypt from "bcryptjs";

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
