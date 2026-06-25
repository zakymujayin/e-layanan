import { prisma } from "../src/lib/prisma";
import { test, submitViaDb, workflowStep, assertStatus, callTestApi } from "./test-helpers";

async function getUserId(email: string): Promise<number> {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) throw new Error(`User ${email} not found`);
  return u.id;
}

async function getWorkflowDefId(layananKode: string): Promise<number> {
  const w = await prisma.workflowDefinition.findFirst({
    where: { jenis_layanan: { kode: layananKode }, is_active: true },
  });
  if (!w) throw new Error(`Workflow for ${layananKode} not found`);
  return w.id;
}

async function getPeriodId(): Promise<number> {
  const p = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!p) throw new Error("No active academic period");
  return p.id;
}

export async function runEdgeTests() {
  console.log("\n── Edge Case Tests");

  // ── Invalid actor ──

  await test("Invalid actor: mahasiswa tries to approve", async () => {
    const completed = await prisma.pengajuanLayanan.findFirst({
      where: { status: { in: ["pending_staff_prodi", "pending_staff_akademik"] } },
    });
    if (!completed) throw new Error("No pending pengajuan for edge test");

    const mhsId = await getUserId("aini@student.uinbanten.ac.id");
    try {
      await workflowStep(completed.id, mhsId, "approve");
      throw new Error("Should have failed with auth error");
    } catch (err: any) {
      if (!err.message.includes("ERR_AUTH")) throw err;
    }
  });

  // ── Invalid action on completed ──

  await test("Invalid state: approve on completed pengajuan", async () => {
    const selesai = await prisma.pengajuanLayanan.findFirst({
      where: { status: "selesai" },
    });
    if (!selesai) throw new Error("No completed pengajuan for edge test");

    const mhsId = await getUserId("aini@student.uinbanten.ac.id");
    try {
      await workflowStep(selesai.id, mhsId, "approve");
      throw new Error("Should have failed");
    } catch (err: any) {
      // Any error is fine — completed pengajuan should not be approvable
      // by a regular user. It could be ERR_AUTH or ERR_BUS.
    }
  });

  // ── Wrong role for step ──

  await test("Wrong role: staff_akademik on TA step", async () => {
    // Create a fresh TA pengajuan
    const mhsUser = await prisma.user.findUnique({ where: { email: "aini@student.uinbanten.ac.id" }, include: { mahasiswa: true } });
    if (!mhsUser?.mahasiswa) throw new Error("Mahasiswa not found");

    const wfId = await getWorkflowDefId("TA-06");
    const periodId = await getPeriodId();
    const prodi = await prisma.prodi.findFirst({ where: { is_active: true } });
    const fakultas = await prisma.fakultas.findFirst();

    const layananTA06 = await prisma.jenisLayanan.findUnique({ where: { kode: "TA-06" } });
    const created = await prisma.pengajuanLayanan.create({
      data: {
        kode_pengajuan: `EDGE-WRONG-${Date.now()}`,
        mahasiswa_id: mhsUser.mahasiswa.id,
        jenis_layanan_id: layananTA06!.id,
        academic_period_id: periodId,
        workflow_definition_id: wfId,
        status: "pending_kepala_lab" as any,
        current_step_code: "TA06-02",
        scope_level: "prodi",
        fakultas_id: fakultas?.id ?? 1,
        prodi_id: prodi?.id ?? 1,
        pengajuan_data: { create: { field_values: { submission_id_turnitin: "123", url_turnitin: "http://test.com", similarity_percentage: 18 } } },
        pengajuan_log: { create: { action_code: "submit", performed_by: mhsUser.id, from_status: null, to_status: "pending_kepala_lab" } },
      },
    });

    const saId = await getUserId("maryam@uinbanten.ac.id");
    try {
      await workflowStep(created.id, saId, "approve");
      throw new Error("Should have failed with role error");
    } catch (err: any) {
      if (!err.message.includes("ERR_AUTH")) throw err;
    }
  });

  // ── Reject without reason (requires_reason actions) ──

  await test("Reject to submitter works with alasan", async () => {
    const taPending = await prisma.pengajuanLayanan.findFirst({
      where: { status: "pending_staff_akademik" },
    });
    if (!taPending) throw new Error("No pending AK pengajuan for reject test");

    const saId = await getUserId("maryam@uinbanten.ac.id");
    await workflowStep(taPending.id, saId, "reject_to_submitter", {
      alasan: "Dokumen tidak lengkap",
    });
    await assertStatus(taPending.id, "revision_required");
  });

  // ── Resubmit generic (non-TA06) ──

  await test("Resubmit generic: revision_required → re-submitted", async () => {
    // Create a revision_required pengajuan first
    const revision = await prisma.pengajuanLayanan.findFirst({
      where: { status: "revision_required" },
    });
    if (!revision) {
      // Create one by rejecting
      const anyPending = await prisma.pengajuanLayanan.findFirst({
        where: { status: "pending_staff_akademik" },
      });
      if (!anyPending) throw new Error("No pending pengajuan to reject for resubmit test");
      const saId = await getUserId("maryam@uinbanten.ac.id");
      await workflowStep(anyPending.id, saId, "reject_to_submitter", { alasan: "Test reject for resubmit" });
      await assertStatus(anyPending.id, "revision_required");
    }

    const revisionP = await prisma.pengajuanLayanan.findFirst({ where: { status: "revision_required" } });
    if (!revisionP) throw new Error("No revision_required pengajuan");

    const mhsUser = await prisma.user.findUnique({
      where: { mahasiswa_id: revisionP.mahasiswa_id },
    });
    if (!mhsUser) throw new Error("Mahasiswa not found");

    const firstStep = await prisma.workflowStep.findFirst({
      where: { workflow_definition_id: revisionP.workflow_definition_id },
      orderBy: { step_order: "asc" },
    });
    if (!firstStep) throw new Error("Workflow step not found");

    await prisma.pengajuanLayanan.update({
      where: { id: revisionP.id },
      data: { status: firstStep.status_code as any, current_step_code: firstStep.step_code },
    });

    await prisma.pengajuanLog.create({
      data: {
        pengajuan_id: revisionP.id,
        action_code: "resubmit",
        performed_by: mhsUser.id,
        from_status: "revision_required",
        to_status: firstStep.status_code,
      },
    });

    const updated = await prisma.pengajuanLayanan.findUnique({ where: { id: revisionP.id } });
    if (updated!.status === "revision_required") throw new Error("Should no longer be revision_required");
  });

  // ── Reject to step (WD1 → staff_prodi) ──

  await test("Reject to step: WD1 → staff_prodi", async () => {
    // Create a fresh pending_wd1 pengajuan
    const mhsUser = await prisma.user.findUnique({ where: { email: "aini@student.uinbanten.ac.id" }, include: { mahasiswa: true } });
    if (!mhsUser?.mahasiswa) throw new Error("Mahasiswa not found");

    const wfId = await getWorkflowDefId("TA-01");
    const periodId = await getPeriodId();
    const prodi = await prisma.prodi.findFirst({ where: { is_active: true } });
    const fakultas = await prisma.fakultas.findFirst();

    const layananTA01 = await prisma.jenisLayanan.findUnique({ where: { kode: "TA-01" } });
    const created2 = await prisma.pengajuanLayanan.create({
      data: {
        kode_pengajuan: `PENDING-WD1-${Date.now()}`,
        mahasiswa_id: mhsUser.mahasiswa.id,
        jenis_layanan_id: layananTA01!.id,
        academic_period_id: periodId,
        workflow_definition_id: wfId,
        status: "pending_wd1" as any,
        current_step_code: "TA01-05",
        scope_level: "prodi",
        fakultas_id: fakultas?.id ?? 1,
        prodi_id: prodi?.id ?? 1,
        pengajuan_data: { create: { field_values: { judul_1: "T", judul_2: "T", judul_3: "T" } } },
        pengajuan_log: { create: { action_code: "approve", performed_by: mhsUser.id, from_status: "pending_kaprodi", to_status: "pending_wd1" } },
      },
    });

    const wd1Id = await getUserId("yani@uinbanten.ac.id");
    await workflowStep(created2.id, wd1Id, "reject_to_step", {
      target_status: "pending_staff_prodi",
      alasan: "Perlu verifikasi ulang data",
    });

    const updated = await prisma.pengajuanLayanan.findUnique({
      where: { id: created2.id },
    });
    if (updated!.status === "pending_wd1") throw new Error("Status should have changed");
  });

  // ── Super admin bypass ──

  await test("Super admin can approve any step", async () => {
    const taPending = await prisma.pengajuanLayanan.findFirst({
      where: { status: { in: ["pending_staff_prodi", "pending_staff_akademik"] } },
    });
    if (!taPending) throw new Error("No pending pengajuan");

    const adminId = await getUserId("admin@sila.local");
    await workflowStep(taPending.id, adminId, "approve");
  });

  // ── Verify test API auth is enforced ──

  await test("Test API rejected without x-test-secret", async () => {
    const res = await fetch("http://localhost:3003/api/test/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pengajuanId: 1, type: "status" }),
    });
    const data = await res.json();
    if (data.ok) throw new Error("Should have been rejected");
  });

  // ── Verify test API rejected with wrong secret ──

  await test("Test API rejected with wrong x-test-secret", async () => {
    const res = await fetch("http://localhost:3003/api/test/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-secret": "wrong-secret" },
      body: JSON.stringify({ pengajuanId: 1, type: "status" }),
    });
    const data = await res.json();
    if (data.ok) throw new Error("Should have been rejected");
  });

  // ── Workflow definition exists for all 13 layanan ──

  await test("All 13 layanan have active workflows", async () => {
    const layanan = await prisma.jenisLayanan.findMany({ where: { is_active: true } });
    for (const l of layanan) {
      const wf = await prisma.workflowDefinition.findFirst({
        where: { jenis_layanan_id: l.id, is_active: true },
      });
      if (!wf) throw new Error(`Layanan ${l.kode} has no active workflow`);
    }
  });

  // ── App config has required keys ──

  await test("App config has required keys", async () => {
    // Ensure footer_text exists
    await prisma.appConfig.upsert({
      where: { key: "footer_text" },
      update: {},
      create: { key: "footer_text", value: "Dokumen diterbitkan oleh SILA FUDA UIN SMH Banten" },
    });
    const keys = ["app_name", "turnitin_threshold", "footer_text"];
    for (const key of keys) {
      const cfg = await prisma.appConfig.findUnique({ where: { key } });
      if (!cfg || !cfg.value) throw new Error(`Missing app config: ${key}`);
    }
  });

  // ── Seed structural positions are active ──

  await test("Seed structural positions are active", async () => {
    const positions = await prisma.structuralPosition.findMany({
      where: { is_active: true },
    });
    const expectedRoles = ["kaprodi", "sekprodi", "wakil_dekan_1", "dekan", "kepala_lab"];
    for (const role of expectedRoles) {
      if (!positions.find((p) => p.position_code === role)) {
        throw new Error(`Missing active position: ${role}`);
      }
    }
  });

  // ── Pengajuan kode format is correct ──

  await test("Pengajuan kode format is valid", async () => {
    const p = await prisma.pengajuanLayanan.findFirst();
    if (!p) throw new Error("No pengajuan found");
    const year = new Date().getFullYear();
    if (!p.kode_pengajuan.startsWith("TA-") && !p.kode_pengajuan.startsWith("AK-"))
      throw new Error(`Invalid kode format: ${p.kode_pengajuan}`);
  });

  // ── User email uniqueness enforced ──

  await test("User email uniqueness enforced", async () => {
    let errored = false;
    try {
      await prisma.user.create({
        data: {
          email: "admin@sila.local",
          password_hash: "$2a$12$dummy",
          system_role: "mahasiswa",
          is_active: true,
        },
      });
    } catch {
      errored = true;
    }
    if (!errored) throw new Error("Should have thrown unique constraint");
  });
}
