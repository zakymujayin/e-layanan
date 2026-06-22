import { prisma } from "../src/lib/prisma";

const BASE = "http://localhost:3003";
const TEST_SECRET = process.env.TEST_SECRET ?? "test-secret-change-me";

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export const results: TestResult[] = [];

// ── Lookup helpers (query existing records, don't hardcode IDs) ──

export async function getFirstFakultas() {
  const f = await prisma.fakultas.findFirst({ orderBy: { id: "asc" } });
  if (!f) throw new Error("No fakultas found in DB");
  return f;
}

export async function getFirstProdi() {
  const p = await prisma.prodi.findFirst({ where: { is_active: true }, orderBy: { id: "asc" } });
  if (!p) throw new Error("No prodi found in DB");
  return p;
}

export async function getActivePeriod() {
  const p = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!p) throw new Error("No active academic period");
  return p;
}

export async function getWorkflowDef(kode: string) {
  const l = await prisma.jenisLayanan.findUnique({
    where: { kode },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!l?.workflow_definitions[0]) throw new Error(`No workflow for ${kode}`);
  return l.workflow_definitions[0];
}

export async function getFirstDosen() {
  const d = await prisma.dosen.findFirst({ where: { is_active: true }, orderBy: { id: "asc" } });
  if (!d) throw new Error("No dosen found");
  return d;
}

// Get a dosen that is NOT already holding a specific position
export async function getFreeDosen(positionCode: string) {
  const d = await prisma.dosen.findFirst({
    where: {
      is_active: true,
      structural_positions: { none: { position_code: positionCode as any, is_active: true } },
    },
    orderBy: { id: "asc" },
  });
  if (!d) throw new Error(`No free dosen for position ${positionCode}`);
  return d;
}

// ── Core test functions ──

export async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    process.stdout.write(`  ✓ ${name.padEnd(55)} ${Date.now() - start}ms\n`);
  } catch (err: any) {
    results.push({ name, passed: false, duration: Date.now() - start, error: err.message });
    process.stdout.write(`  ✗ ${name.padEnd(55)} ${err.message}\n`);
  }
}

export async function callTestApi(body: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${BASE}/api/test/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-test-secret": TEST_SECRET },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function assertStatus(pengajuanId: number, expected: string): Promise<void> {
  const data = await callTestApi({ pengajuanId, type: "status" });
  if (!data.ok) throw new Error(`Status check failed: ${data.error}`);
  if (data.data.status !== expected) {
    throw new Error(`Expected status "${expected}" but got "${data.data.status}"`);
  }
}

export async function workflowStep(
  pengajuanId: number,
  userId: number,
  action: string,
  data?: Record<string, unknown>
) {
  const res = await callTestApi({ pengajuanId, userId, action, data, type: "workflow" });
  if (!res.ok) throw new Error(res.error);
  return res.data;
}

export async function submitViaDb(input: {
  kode: string;
  mahasiswaId: number;
  prodiId: number;
  fakultasId: number;
  scopeLevel: string;
  fieldValues: Record<string, unknown>;
  userId: number;
  workflowDefId: number;
  academicPeriodId: number;
}): Promise<number> {
  const layanan = await prisma.jenisLayanan.findUnique({ where: { kode: input.kode } });
  if (!layanan) throw new Error(`Layanan ${input.kode} not found`);

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: input.workflowDefId },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow has no steps");

  // Generate the kode_pengajuan format BEFORE insert (avoid UNIQUE constraint on "PENDING")
  const tahun = new Date().getFullYear();
  const prefix = input.kode.startsWith("AK-") ? "AK" : "TA";

  // Get the next ID by checking current max
  const maxP = await prisma.pengajuanLayanan.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
  const nextId = (maxP?.id ?? 0) + 1;
  const kode = `${prefix}-${tahun}-${String(nextId).padStart(5, "0")}`;

  const created = await prisma.pengajuanLayanan.create({
    data: {
      kode_pengajuan: kode,
      mahasiswa_id: input.mahasiswaId,
      jenis_layanan_id: layanan.id,
      academic_period_id: input.academicPeriodId,
      workflow_definition_id: input.workflowDefId,
      status: firstStep.status_code as any,
      current_step_code: firstStep.step_code,
      scope_level: input.scopeLevel,
      fakultas_id: input.fakultasId,
      prodi_id: input.prodiId,
      pengajuan_data: { create: { field_values: input.fieldValues as any } },
      pengajuan_versi: {
        create: {
          versi_ke: 1,
          data_snapshot: input.fieldValues as any,
          dokumen_snapshot: {},
          dibuat_oleh: input.userId,
        },
      },
      pengajuan_log: {
        create: {
          action_code: "submit",
          performed_by: input.userId,
          from_status: null,
          to_status: firstStep.status_code,
        },
      },
    },
  });

  // Reserve nomor surat (like server action does)
  try {
    const { reserveNomorSurat } = await import("../src/lib/document/numbering");
    await reserveNomorSurat(created.id);
  } catch { /* numbering might fail if kode klasifikasi missing — not fatal */ }

  return created.id;
}

export function summary() {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;
  const duration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${total} tests: ${passed} passed | ${failed} failed`);
  console.log(`  Duration: ${(duration / 1000).toFixed(1)}s`);
  console.log(`${"═".repeat(60)}`);

  if (failed > 0) {
    console.log(`\nFailed tests:`);
    for (const r of results) {
      if (!r.passed) console.log(`  ✗ ${r.name}\n    → ${r.error}`);
    }
  }

  console.log(
    failed === 0 ? `\n  ✓ SILA FULLY OPERATIONAL\n` : `\n  ⚠ ${failed} TEST(S) FAILED\n`
  );
  process.exit(failed > 0 ? 1 : 0);
}
