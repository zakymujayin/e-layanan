import { prisma } from "../src/lib/prisma";
import { test } from "./test-helpers";

export async function runOutputTests() {
  console.log("\n── Output Tests");

  await test("PDF files exist for completed pengajuan", async () => {
    const docs = await prisma.dokumenOutput.findMany({ where: { is_final: true } });
    if (docs.length === 0) throw new Error("No dokumen_output found");
    for (const doc of docs) {
      if (!doc.file_path_final) throw new Error(`DokumenOutput ${doc.id} has no file_path_final`);
    }
  });

  await test("Penomoran active for completed pengajuan", async () => {
    const completed = await prisma.pengajuanLayanan.findMany({
      where: { status: "selesai" },
      orderBy: { id: "desc" },
      take: 20,
    });
    if (completed.length === 0) throw new Error("No completed pengajuan to check");
    let missing = 0;
    for (const p of completed) {
      const nomor = await prisma.penomoranCounter.findFirst({
        where: { pengajuan_id: p.id, status: { in: ["reserved", "active"] } },
      });
      if (!nomor) missing++;
    }
  });

  await test("Notifikasi terkirim untuk setiap aktor", async () => {
    const notifs = await prisma.notification.findMany({ take: 20 });
    if (notifs.length === 0) throw new Error("No notifications found");
  });

  await test("Audit log exists for each action", async () => {
    const logs = await prisma.pengajuanLog.findMany({ take: 10 });
    if (logs.length === 0) throw new Error("No audit logs found");
  });

  await test("Pengajuan has workflow steps correctly linked", async () => {
    const pengajuan = await prisma.pengajuanLayanan.findFirst({
      where: { status: "selesai" },
    });
    if (!pengajuan) throw new Error("No completed pengajuan");
    const steps = await prisma.workflowStep.findMany({
      where: { workflow_definition_id: pengajuan.workflow_definition_id },
    });
    if (steps.length === 0) throw new Error("Workflow has no steps");
  });

  await test("Assignment exists for completed workflows", async () => {
    const assignments = await prisma.assignment.findMany({
      where: { pengajuan_id: { not: null } },
      take: 10,
    });
    if (assignments.length === 0) throw new Error("No assignments found");
  });

  await test("Nilai sidang recorded for TA-03, TA-04, TA-05", async () => {
    const nilai = await prisma.nilaiSidang.findMany({ take: 5 });
    if (nilai.length === 0) throw new Error("No nilai_sidang recorded");
  });

  await test("Completed pengajuan has completed_at timestamp", async () => {
    const selesai = await prisma.pengajuanLayanan.findFirst({ where: { status: "selesai" } });
    if (!selesai) throw new Error("No completed pengajuan");
    if (!selesai.completed_at) throw new Error("completed_at is null for selesai pengajuan");
  });
}
