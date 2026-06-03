"use server";

import { prisma } from "@/lib/prisma";

interface CreateNotificationInput {
  user_id: number;
  title: string;
  message: string;
  severity?: "info" | "success" | "warning" | "urgent";
  entity_type?: string;
  entity_id?: number;
}

export async function createNotification(input: CreateNotificationInput) {
  await prisma.notification.create({
    data: {
      user_id: input.user_id,
      title: input.title,
      message: input.message,
      severity: input.severity ?? "info",
      entity_type: input.entity_type ?? null,
      entity_id: input.entity_id ?? null,
    },
  });
}

export async function markNotificationRead(notificationId: number) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true, read_at: new Date() },
  });
}

export async function notifyFirstApprover(
  pengajuanId: number,
  layananNama: string,
  mhsNama: string,
  firstStepActorType: string
) {
  const excludeUserId = await prisma.pengajuanLayanan
    .findUnique({ where: { id: pengajuanId }, select: { mahasiswa_id: true } })
    .then(p => p?.mahasiswa_id ?? 0);

  const users = await prisma.user.findMany({
    where: {
      is_active: true,
      id: { not: excludeUserId },
      ...(firstStepActorType === "staff_prodi"
        ? { system_role: "staff_prodi" }
        : firstStepActorType === "staff_akademik"
        ? { system_role: "staff_akademik" }
        : firstStepActorType === "kepala_lab"
        ? { structural_positions: { some: { position_code: "kepala_lab", is_active: true } } }
        : firstStepActorType === "kabag"
        ? { system_role: "kabag" }
        : firstStepActorType === "dosen_pa"
        ? { dosen: { assignments: { some: { pengajuan_id: pengajuanId, assignment_type: "dosen_pa" } } } }
        : {}),
    },
    select: { id: true },
  });

  for (const u of users) {
    await createNotification({
      user_id: u.id,
      title: `Pengajuan Baru: ${layananNama}`,
      message: `Pengajuan ${layananNama} baru dari ${mhsNama} menunggu tindakan Anda.`,
      severity: "info",
      entity_type: "pengajuan",
      entity_id: pengajuanId,
    }).catch(() => {});
  }
}
