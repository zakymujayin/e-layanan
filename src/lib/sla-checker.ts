import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";
import { createPengajuanLog } from "@/lib/workflow/audit";
import { Prisma } from "@/generated/prisma/client";

type OverdueSchedule = Prisma.SlaScheduleGetPayload<{
  include: {
    pengajuan: { include: { jenis_layanan: true; mahasiswa: true } };
  };
}>;

export async function runSlaCheck(): Promise<{ triggered: number; errors: number }> {
  const now = new Date();
  let triggered = 0;
  let errors = 0;

  const overdue = await prisma.slaSchedule.findMany({
    where: { deadline: { lt: now }, is_triggered: false },
    include: {
      pengajuan: {
        include: { jenis_layanan: true, mahasiswa: true },
      },
    },
  });

  for (const schedule of overdue) {
    try {
      if (schedule.consequence === "bypass") {
        await handleBypass(schedule);
      } else {
        await handleReminder(schedule);
      }
      await prisma.slaSchedule.update({
        where: { id: schedule.id },
        data: { is_triggered: true, triggered_at: now },
      });
      triggered++;
    } catch (err) {
      console.error(`[SlaCheck] schedule ${schedule.id}:`, err);
      errors++;
    }
  }

  return { triggered, errors };
}

async function handleReminder(schedule: OverdueSchedule): Promise<void> {
  const step = await prisma.workflowStep.findFirst({
    where: { step_code: schedule.step_code },
    select: { actor_type: true },
  });
  if (!step) return;

  const userIds = await resolveActorUsers(step.actor_type, schedule.pengajuan_id);
  const layananNama = schedule.pengajuan.jenis_layanan.nama;
  const mhsNama = schedule.pengajuan.mahasiswa.nama_lengkap;

  for (const uid of userIds) {
    await createNotification({
      user_id: uid,
      title: `Pengajuan ${layananNama} Menunggu Tindakan`,
      message: `Pengajuan dari ${mhsNama} telah melewati batas waktu SLA. Segera proses.`,
      severity: "urgent",
      entity_type: "pengajuan",
      entity_id: schedule.pengajuan_id,
    });
  }
}

async function handleBypass(schedule: OverdueSchedule): Promise<void> {
  const pengajuan = schedule.pengajuan;

  const workflow = await prisma.workflowDefinition.findFirst({
    where: { jenis_layanan_id: pengajuan.jenis_layanan_id, is_active: true },
  });
  if (!workflow) return;

  const currentStep = await prisma.workflowStep.findFirst({
    where: { step_code: schedule.step_code, workflow_definition_id: workflow.id },
    select: { step_order: true, status_code: true },
  });
  if (!currentStep) return;

  const nextStep = await prisma.workflowStep.findFirst({
    where: {
      workflow_definition_id: workflow.id,
      step_order: { gt: currentStep.step_order },
    },
    orderBy: { step_order: "asc" },
    select: { step_code: true, status_code: true },
  });
  if (!nextStep) return;

  const fromStatus = pengajuan.status;
  const toStatus = nextStep.status_code;

  await prisma.$transaction(async (tx) => {
    await tx.pengajuanLayanan.update({
      where: { id: pengajuan.id },
      data: {
        status: toStatus as any,
        current_step_code: nextStep.step_code,
        updated_at: new Date(),
      },
    });

    await createPengajuanLog(tx, {
      pengajuanId: pengajuan.id,
      actionCode: "bypass",
      performedBy: 0,
      fromStatus,
      toStatus,
      alasan: "PA tidak merespons dalam batas waktu SLA",
    });
  });

  await createNotification({
    user_id: pengajuan.mahasiswa_id,
    title: `Pengajuan ${pengajuan.jenis_layanan.nama} Dilanjutkan Otomatis`,
    message: `PA tidak merespons dalam batas waktu — pengajuan dilanjutkan otomatis ke tahap berikutnya.`,
    severity: "info",
    entity_type: "pengajuan",
    entity_id: pengajuan.id,
  });
}

async function resolveActorUsers(actorType: string, pengajuanId: number): Promise<number[]> {
  if (["staff_prodi", "staff_akademik", "kabag"].includes(actorType)) {
    const users = await prisma.user.findMany({
      where: { system_role: actorType as any, is_active: true },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  if (actorType === "dosen_pa") {
    const data = await prisma.pengajuanData.findFirst({
      where: { pengajuan_id: pengajuanId },
      select: { field_values: true },
    });
    const fv = (data?.field_values as Record<string, unknown>) ?? {};
    const dosenId = Number(fv.pa_dosen_id);
    if (!dosenId) return [];
    const user = await prisma.user.findFirst({
      where: { dosen_id: dosenId, is_active: true },
      select: { id: true },
    });
    return user ? [user.id] : [];
  }

  // kaprodi, sekprodi, wakil_dekan_1, dekan, kepala_lab
  const positions = await prisma.structuralPosition.findMany({
    where: { position_code: actorType as any, is_active: true },
    include: {
      dosen: {
        include: {
          user: { where: { is_active: true }, select: { id: true } },
        },
      },
    },
  });
  return positions.flatMap((p) => (p.dosen?.user ? [p.dosen.user.id] : []));
}
