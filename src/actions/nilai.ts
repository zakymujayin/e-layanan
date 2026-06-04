"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notification";

const NilaiSemproSchema = z.object({
  nilai: z.number().min(0).max(100, "Nilai harus 0-100"),
  catatan: z.string().max(500).default(""),
  keputusan: z.enum(["layak", "tidak_layak"]),
});

const NilaiKomprehensifSchema = z.object({
  nilai: z.number().min(0).max(100, "Nilai harus 0-100"),
  catatan: z.string().max(500).default(""),
  keputusan: z.enum(["lulus", "tidak_lulus"]),
});

const NilaiMunaqasyahSchema = z.object({
  nilaiP1: z.number().min(0).max(100),
  nilaiP2: z.number().min(0).max(100),
  nilaiPenguji1: z.number().min(0).max(100),
  nilaiPenguji2: z.number().min(0).max(100),
  keputusan: z.enum(["lulus", "tidak_lulus"]),
  catatan: z.string().max(500).default(""),
});

// ============================================================
// TA-03: Seminar Proposal — 2 Penguji input nilai
// ============================================================

export async function inputNilaiSempro(
  pengajuanId: number,
  data: { nilai: number; catatan: string; keputusan: "layak" | "tidak_layak" }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { dosen: true } });
  if (!user?.dosen) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya dosen penguji");

  const assignment = await prisma.assignment.findFirst({
    where: { pengajuan_id: pengajuanId, dosen_id: user.dosen.id, assignment_type: "penguji_proposal", is_active: true },
  });
  if (!assignment) throw new Error("ERR_AUTH_NOT_ASSIGNED: Anda bukan penguji proposal ini");

  const validated = NilaiSemproSchema.safeParse(data);
  if (!validated.success) throw new Error(`ERR_VAL_INVALID_FORMAT: ${validated.error.issues[0].message}`);

  await prisma.nilaiSidang.create({
    data: {
      pengajuan_id: pengajuanId,
      dosen_id: user.dosen.id,
      assignment_type: "penguji_proposal",
      nilai: validated.data.nilai,
      catatan: validated.data.catatan || null,
      keputusan: validated.data.keputusan,
    },
  });

  const allNilai = await prisma.nilaiSidang.findMany({ where: { pengajuan_id: pengajuanId } });
  if (allNilai.length >= 2) {
    const keduaLayak = allNilai.every(n => n.keputusan === "layak");
    const finalKeputusan = keduaLayak ? "layak" : "tidak_layak";
    const avgNilai = allNilai.reduce((sum, n) => sum + (n.nilai ?? 0), 0) / allNilai.length;

    await prisma.nilaiSidang.updateMany({
      where: { pengajuan_id: pengajuanId },
      data: { nilai_akhir: avgNilai },
    });

    const pengajuanForNotif = await prisma.pengajuanLayanan.findUnique({
      where: { id: pengajuanId },
      select: { mahasiswa_id: true },
    });
    if (pengajuanForNotif) {
      createNotification({
        user_id: pengajuanForNotif.mahasiswa_id,
        title: "Hasil Seminar Proposal",
        message: `Kedua penguji telah memberikan penilaian. Hasil: ${keduaLayak ? "LAYAK" : "TIDAK LAYAK"}.`,
        severity: keduaLayak ? "success" : "warning",
        entity_type: "pengajuan",
        entity_id: pengajuanId,
      }).catch(() => {});
    }
  }

  revalidatePath(`/pengajuan/${pengajuanId}`);
}

// ============================================================
// TA-04: Komprehensif — 2 Penguji input nilai + auto-calculate
// ============================================================

function calculateGrade(nilaiAkhir: number): string {
  if (nilaiAkhir >= 3.51) return "A";
  if (nilaiAkhir >= 3.01) return "B+";
  if (nilaiAkhir >= 2.76) return "B";
  if (nilaiAkhir >= 2.51) return "C+";
  if (nilaiAkhir >= 2.50) return "C";
  return "D";
}

export async function inputNilaiKomprehensif(
  pengajuanId: number,
  data: { nilai: number; catatan: string; keputusan: "lulus" | "tidak_lulus" }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { dosen: true } });
  if (!user?.dosen) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE");

  const assignment = await prisma.assignment.findFirst({
    where: {
      pengajuan_id: pengajuanId,
      dosen_id: user.dosen.id,
      assignment_type: { in: ["penguji_komprehensif_prodi", "penguji_komprehensif_keislaman"] },
      is_active: true,
    },
  });
  if (!assignment) throw new Error("ERR_AUTH_NOT_ASSIGNED: Anda bukan penguji komprehensif");

  const validated = NilaiKomprehensifSchema.safeParse(data);
  if (!validated.success) throw new Error(`ERR_VAL_INVALID_FORMAT: ${validated.error.issues[0].message}`);

  await prisma.nilaiSidang.create({
    data: {
      pengajuan_id: pengajuanId,
      dosen_id: user.dosen.id,
      assignment_type: assignment.assignment_type,
      nilai: validated.data.nilai,
      catatan: validated.data.catatan || null,
      keputusan: validated.data.keputusan,
    },
  });

  const allNilai = await prisma.nilaiSidang.findMany({ where: { pengajuan_id: pengajuanId } });
  if (allNilai.length >= 2) {
    const sum = allNilai.reduce((s, n) => s + (n.nilai ?? 0), 0);
    const p = sum / 2;
    const huruf = calculateGrade(p);
    const keduaLulus = allNilai.every(n => n.keputusan === "lulus");
    const finalKeputusan = keduaLulus && p >= 2.50 ? "lulus" : "tidak_lulus";

    await prisma.nilaiSidang.updateMany({
      where: { pengajuan_id: pengajuanId },
      data: { nilai_akhir: p, yudisium: huruf, keputusan: finalKeputusan },
    });

    const pengajuanForNotif = await prisma.pengajuanLayanan.findUnique({
      where: { id: pengajuanId },
      select: { mahasiswa_id: true },
    });
    if (pengajuanForNotif) {
      createNotification({
        user_id: pengajuanForNotif.mahasiswa_id,
        title: "Hasil Ujian Komprehensif",
        message: `Penguji telah memberikan penilaian. Hasil: ${keduaLulus ? "LULUS" : "TIDAK LULUS"}.`,
        severity: keduaLulus ? "success" : "warning",
        entity_type: "pengajuan",
        entity_id: pengajuanId,
      }).catch(() => {});
    }
  }

  revalidatePath(`/pengajuan/${pengajuanId}`);
}

// ============================================================
// TA-05: Munaqasyah — Sekretaris input semua nilai + yudisium
// ============================================================

function calculateYudisium(nilaiFinal: number): string {
  if (nilaiFinal >= 3.51) return "pujian";
  if (nilaiFinal >= 3.01) return "sangat_memuaskan";
  if (nilaiFinal >= 2.76) return "memuaskan";
  return "";
}

function convertToIpk(nilai: number): number {
  if (nilai >= 85) return 4.00;
  if (nilai >= 80) return 3.75;
  if (nilai >= 75) return 3.50;
  if (nilai >= 70) return 3.00;
  if (nilai >= 65) return 2.75;
  if (nilai >= 60) return 2.50;
  return 0;
}

export async function inputNilaiMunaqasyah(
  pengajuanId: number,
  data: {
    nilaiP1: number;
    nilaiP2: number;
    nilaiPenguji1: number;
    nilaiPenguji2: number;
    keputusan: "lulus" | "tidak_lulus";
    catatan: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { dosen: true } });
  if (!user?.dosen) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE");

  const assignment = await prisma.assignment.findFirst({
    where: { pengajuan_id: pengajuanId, dosen_id: user.dosen.id, assignment_type: "sekretaris_sidang", is_active: true },
  });
  if (!assignment) throw new Error("ERR_AUTH_NOT_ASSIGNED: Anda bukan sekretaris sidang");

  const validated = NilaiMunaqasyahSchema.safeParse(data);
  if (!validated.success) throw new Error(`ERR_VAL_INVALID_FORMAT: ${validated.error.issues[0].message}`);

  const { nilaiP1, nilaiP2, nilaiPenguji1, nilaiPenguji2, keputusan, catatan } = validated.data;
  const nilaiList = [nilaiP1, nilaiP2, nilaiPenguji1, nilaiPenguji2];
  const nilaiAkhir = nilaiList.reduce((s, n) => s + n, 0) / 4;
  const ipk = convertToIpk(nilaiAkhir);
  const yudisium = keputusan === "lulus" ? calculateYudisium(ipk) : "";

  await prisma.nilaiSidang.create({
    data: {
      pengajuan_id: pengajuanId,
      dosen_id: user.dosen.id,
      assignment_type: "sekretaris_sidang",
      nilai_per_penilai: {
        pembimbing_1: nilaiP1,
        pembimbing_2: nilaiP2,
        penguji_1: nilaiPenguji1,
        penguji_2: nilaiPenguji2,
      },
      nilai_akhir: nilaiAkhir,
      ipk_equivalent: ipk,
      yudisium,
      keputusan,
      catatan: catatan || null,
    },
  });

  revalidatePath(`/pengajuan/${pengajuanId}`);

  const pengajuanForNotif = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    select: { mahasiswa_id: true },
  });
  if (pengajuanForNotif) {
    createNotification({
      user_id: pengajuanForNotif.mahasiswa_id,
      title: "Hasil Ujian Munaqasyah",
      message: `Nilai telah diinput. Hasil: ${keputusan === "lulus" ? "LULUS" : "TIDAK LULUS"}${yudisium ? ` — ${yudisium.replace(/_/g, " ")}` : ""}.`,
      severity: keputusan === "lulus" ? "success" : "warning",
      entity_type: "pengajuan",
      entity_id: pengajuanId,
    }).catch(() => {});
  }
}
