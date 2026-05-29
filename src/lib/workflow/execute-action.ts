"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateTransition } from "./validate-transition";
import { createPengajuanLog } from "./audit";

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
    include: { jenis_layanan: true },
  });
  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND: Pengajuan tidak ditemukan");

  const workflow = await prisma.workflowDefinition.findFirst({
    where: { jenis_layanan_id: pengajuan.jenis_layanan_id, is_active: true },
  });
  if (!workflow) throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Workflow tidak ditemukan");

  const validation = await validateTransition(workflow.id, pengajuan.current_step_code, input.action);

  const fromStatus = pengajuan.status;
  const targetStatus = validation.targetStatus;

  let nextStepCode: string | null = null;
  if (targetStatus) {
    const nextStep = await prisma.workflowStep.findFirst({
      where: { workflow_definition_id: workflow.id, status_code: targetStatus },
      orderBy: { step_order: "asc" },
    });
    nextStepCode = nextStep?.step_code ?? null;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.pengajuanLayanan.update({
      where: { id: pengajuan.id },
      data: {
        status: (targetStatus ?? pengajuan.status) as typeof pengajuan.status,
        current_step_code: nextStepCode,
        updated_at: new Date(),
      },
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
}
