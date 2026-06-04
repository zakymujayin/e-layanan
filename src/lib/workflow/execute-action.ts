"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateTransition } from "./validate-transition";
import { createPengajuanLog } from "./audit";
import { createNotification } from "@/lib/notification";

async function verifyActorForStep(
  userId: number,
  actorType: string,
  pengajuanId: number
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { system_role: true, dosen_id: true },
  });
  if (!user) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  if (user.system_role === "super_admin") return;

  switch (actorType) {
    case "staff_prodi":
      if (user.system_role !== "staff_prodi") throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya staff prodi");
      return;
    case "staff_akademik":
      if (user.system_role !== "staff_akademik") throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya staff akademik");
      return;
    case "kabag":
      if (user.system_role !== "kabag") throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya kabag");
      return;
    case "dosen_pa": {
      if (!user.dosen_id) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya dosen PA");
      const data = await prisma.pengajuanData.findFirst({
        where: { pengajuan_id: pengajuanId },
        select: { field_values: true },
      });
      const fv = (data?.field_values as Record<string, unknown>) ?? {};
      if (Number(fv.pa_dosen_id) !== user.dosen_id) {
        throw new Error("ERR_AUTH_NOT_ASSIGNED: Anda bukan PA pengajuan ini");
      }
      return;
    }
    case "kaprodi":
    case "sekprodi":
    case "wakil_dekan_1":
    case "dekan":
    case "kepala_lab": {
      if (user.system_role === actorType) return;
      if (user.dosen_id) {
        const pos = await prisma.structuralPosition.count({
          where: { dosen_id: user.dosen_id, position_code: actorType as any, is_active: true },
        });
        if (pos > 0) return;
      }
      throw new Error(`ERR_AUTH_INSUFFICIENT_ROLE: Hanya ${actorType.replace(/_/g, " ")}`);
    }
    default:
      return; // unknown actor type — allow (forward compatibility)
  }
}

async function resolveRecipients(actorType: string, pengajuanId: number, excludeUserId: number): Promise<number[]> {
  const users = await prisma.user.findMany({
    where: {
      is_active: true,
      id: { not: excludeUserId },
      ...(actorType === "staff_prodi"
        ? { system_role: "staff_prodi" }
        : actorType === "staff_akademik"
        ? { system_role: "staff_akademik" }
        : actorType === "kabag"
        ? { system_role: "kabag" }
        : actorType === "dosen_pa"
        ? { dosen: { assignments: { some: { pengajuan_id: pengajuanId, assignment_type: "dosen_pa" } } } }
        : actorType === "kepala_lab"
        ? { structural_positions: { some: { position_code: "kepala_lab", is_active: true } } }
        : actorType === "sekprodi"
        ? { structural_positions: { some: { position_code: "sekprodi", is_active: true } } }
        : actorType === "wakil_dekan_1"
        ? { structural_positions: { some: { position_code: "wakil_dekan_1", is_active: true } } }
        : actorType === "dekan"
        ? { structural_positions: { some: { position_code: "dekan", is_active: true } } }
        : actorType === "kaprodi"
        ? { structural_positions: { some: { position_code: "kaprodi", is_active: true } } }
        : {}),
    },
    select: { id: true },
  });
  return users.map(u => u.id);
}

export async function executeWorkflowAction(input: {
  pengajuanId: number;
  action: string;
  data?: Record<string, unknown>;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const userId = Number(session.user.id);

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: input.pengajuanId },
    include: { jenis_layanan: true, mahasiswa: true },
  });
  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND: Pengajuan tidak ditemukan");

  const workflow = await prisma.workflowDefinition.findFirst({
    where: { jenis_layanan_id: pengajuan.jenis_layanan_id, is_active: true },
  });
  if (!workflow) throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Workflow tidak ditemukan");

  const validation = await validateTransition(workflow.id, pengajuan.current_step_code, input.action);

  await verifyActorForStep(userId, validation.step.actor_type, input.pengajuanId);

  const fromStatus = pengajuan.status;
  let targetStatus = validation.targetStatus;

  // For reject_to_step: WD1/Dekan selects target step from action_config.allow_target
  if (input.action === "reject_to_step" && input.data?.target_status) {
    const actionConfig = validation.actionDef.actionConfig as { allow_target?: string[] } | null;
    const allowTarget = actionConfig?.allow_target ?? [];
    const requestedTarget = input.data.target_status as string;
    if (allowTarget.length > 0 && !allowTarget.includes(requestedTarget)) {
      throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Target step pengembalian tidak diizinkan");
    }
    targetStatus = requestedTarget;
  }

  // TA-06: auto-terminate setelah revisi ke-3 ditolak (mahasiswa tidak bisa resubmit lagi)
  if (
    input.action === "reject_to_submitter" &&
    pengajuan.jenis_layanan.kode === "TA-06" &&
    pengajuan.revisi_ke >= 3
  ) {
    targetStatus = "terminated";
  }

  let nextStepCode: string | null = null;
  if (targetStatus) {
    const nextStep = await prisma.workflowStep.findFirst({
      where: { workflow_definition_id: workflow.id, status_code: targetStatus },
      orderBy: { step_order: "asc" },
    });
    nextStepCode = nextStep?.step_code ?? null;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateData: any = {
      status: (targetStatus ?? pengajuan.status) as typeof pengajuan.status,
      current_step_code: nextStepCode,
      updated_at: new Date(),
    };

    if (targetStatus === "selesai") updateData.completed_at = new Date();
    if (targetStatus === "terminated") updateData.terminated_at = new Date();

    const updated = await tx.pengajuanLayanan.update({
      where: { id: pengajuan.id },
      data: updateData,
    });

    await createPengajuanLog(tx, {
      pengajuanId: pengajuan.id,
      actionCode: input.action,
      performedBy: userId,
      fromStatus,
      toStatus: targetStatus,
      alasan: input.data?.alasan as string | undefined,
      metadata: input.data,
    });

    return updated;
  });

  // Fire notifications after transaction (fire-and-forget)
  const layananNama = pengajuan.jenis_layanan.nama;
  const mhsNama = pengajuan.mahasiswa.nama_lengkap;
  const mhsId = pengajuan.mahasiswa_id;

  if (targetStatus === "terminated") {
    createNotification({
      user_id: mhsId,
      title: `Pengajuan ${layananNama} Ditutup`,
      message: `Pengajuan telah ditutup karena melebihi batas maksimal revisi. Hubungi kepala laboratorium untuk informasi lebih lanjut.`,
      severity: "urgent",
      entity_type: "pengajuan",
      entity_id: pengajuan.id,
    }).catch(() => {});
  } else if (input.action === "reject_to_submitter") {
    const alasan = input.data?.alasan as string | undefined;
    createNotification({
      user_id: mhsId,
      title: `Pengajuan ${layananNama} Dikembalikan`,
      message: `Pengajuan perlu direvisi.${alasan ? ` Alasan: ${alasan}` : ""}`,
      severity: "warning",
      entity_type: "pengajuan",
      entity_id: pengajuan.id,
    }).catch(() => {});
  }

  if (input.action === "reject_to_step" && targetStatus) {
    const alasan = input.data?.alasan as string | undefined;
    const targetStepInfo = await prisma.workflowStep.findFirst({
      where: { workflow_definition_id: workflow.id, status_code: targetStatus },
      select: { actor_type: true },
    });
    if (targetStepInfo?.actor_type) {
      const recipients = await resolveRecipients(targetStepInfo.actor_type, pengajuan.id, userId);
      for (const uid of recipients) {
        createNotification({
          user_id: uid,
          title: `Pengajuan ${layananNama} Dikembalikan`,
          message: `Pengajuan dari ${mhsNama} dikembalikan ke Anda.${alasan ? ` Alasan: ${alasan}` : ""}`,
          severity: "warning",
          entity_type: "pengajuan",
          entity_id: pengajuan.id,
        }).catch(() => {});
      }
    }
  }

  if (input.action === "sign" && targetStatus === "selesai") {
    createNotification({
      user_id: mhsId,
      title: `Pengajuan Selesai`,
      message: `${layananNama} telah disetujui. Dokumen final siap didownload.`,
      severity: "success",
      entity_type: "pengajuan",
      entity_id: pengajuan.id,
    }).catch(() => {});
  }

  if ((input.action === "approve" || input.action === "select_judul") && nextStepCode) {
    const nextStepInfo = await prisma.workflowStep.findFirst({
      where: { step_code: nextStepCode },
      select: { actor_type: true },
    });
    if (nextStepInfo?.actor_type) {
      const recipients = await resolveRecipients(nextStepInfo.actor_type, pengajuan.id, userId);
      for (const uid of recipients) {
        createNotification({
          user_id: uid,
          title: `Pengajuan ${layananNama}`,
          message: `Pengajuan dari ${mhsNama} menunggu tindakan Anda.`,
          severity: "info",
          entity_type: "pengajuan",
          entity_id: pengajuan.id,
        }).catch(() => {});
      }
    }
  }

  return result;

}
