# Remaining Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 remaining features: email notifikasi, SLA timer + bypass PA, bulk import user, dan semester selector di dashboard.

**Architecture:** Email (`src/lib/email.ts`) diimplementasi duluan karena dipakai SLA checker. SLA checker (`src/lib/sla-checker.ts`) + cron endpoint (`/api/cron`) + schedule creation di `execute-action.ts`. Bulk import sebagai server action baru di `admin.ts` + halaman `/admin/users/import`. Semester selector via cookie `selected_semester_id` dibaca di layout + 2 halaman data.

**Tech Stack:** Next.js 16 App Router, Prisma 7, Nodemailer, TypeScript strict

---

## File Map

| File | Action |
|------|--------|
| `src/lib/email.ts` | **Create** — sendEmail via Nodemailer |
| `src/lib/notification.ts` | Modify — fire-and-forget email setelah createNotification |
| `src/lib/sla-checker.ts` | **Create** — runSlaCheck logic |
| `src/app/api/cron/route.ts` | **Create** — POST endpoint protected by CRON_SECRET |
| `src/lib/workflow/execute-action.ts` | Modify — create SlaSchedule setelah step advance |
| `src/actions/admin.ts` | Modify — tambah importUsersFromCsv + setActiveSemester |
| `src/app/(dashboard)/admin/users/import/page.tsx` | **Create** — halaman import CSV |
| `public/templates/import-users-template.csv` | **Create** — template CSV download |
| `src/components/layout/SemesterSelector.tsx` | **Create** — client dropdown |
| `src/app/(dashboard)/layout.tsx` | Modify — tambah SemesterSelector + archive banner |
| `src/app/(dashboard)/pengajuan/page.tsx` | Modify — default semester dari cookie |
| `src/app/(dashboard)/admin/monitoring/page.tsx` | Modify — filter counts by semester |

---

## Task 1: Email Notifikasi — `src/lib/email.ts`

**Files:**
- Create: `src/lib/email.ts`
- Modify: `src/lib/notification.ts`

- [ ] **Step 1: Install nodemailer**

```bash
cd /home/zhev/myproject/e-layanan && npm install nodemailer && npm install --save-dev @types/nodemailer
```

Expected: package.json updated, no errors.

- [ ] **Step 2: Create `src/lib/email.ts`**

```typescript
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3003";

async function getSmtpConfig() {
  const keys = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from"];
  const rows = await prisma.appConfig.findMany({ where: { key: { in: keys } } });
  const cfg = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) return null;
  return {
    host: cfg.smtp_host,
    port: Number(cfg.smtp_port ?? "587"),
    secure: cfg.smtp_port === "465",
    auth: { user: cfg.smtp_user, pass: decrypt(cfg.smtp_pass) },
    from: cfg.smtp_from ?? cfg.smtp_user,
  };
}

export function buildEmailHtml(opts: {
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: number | null;
}): string {
  const linkHtml =
    opts.entityType === "pengajuan" && opts.entityId
      ? `<p style="margin-top:16px"><a href="${BASE_URL}/pengajuan/${opts.entityId}" style="background:#1d4ed8;color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;font-size:14px">Lihat Pengajuan →</a></p>`
      : "";
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">
<h2 style="margin:0 0 8px;font-size:18px">${opts.title}</h2>
<p style="margin:0 0 12px;font-size:14px;color:#374151">${opts.message}</p>
${linkHtml}
<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb"/>
<p style="font-size:12px;color:#9ca3af">SILA — Sistem Layanan Akademik</p>
</body></html>`;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const cfg = await getSmtpConfig();
    if (!cfg) return; // SMTP belum dikonfigurasi
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
    });
    await transporter.sendMail({ from: cfg.from, to, subject, html });
  } catch (err) {
    console.error("[Email] gagal kirim ke", to, err);
  }
}
```

- [ ] **Step 3: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep "email.ts" | head -10
```

Expected: no errors.

- [ ] **Step 4: Modify `src/lib/notification.ts` — tambah fire-and-forget email**

Tambah import di baris paling atas (setelah `"use server"`):

```typescript
import { sendEmail, buildEmailHtml } from "@/lib/email";
```

Ganti fungsi `createNotification` menjadi:

```typescript
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

  // Fire-and-forget email — tidak boleh crash workflow
  prisma.user
    .findUnique({ where: { id: input.user_id }, select: { email: true } })
    .then((user) => {
      if (!user?.email) return;
      return sendEmail(
        user.email,
        input.title,
        buildEmailHtml({
          title: input.title,
          message: input.message,
          entityType: input.entity_type,
          entityId: input.entity_id,
        })
      );
    })
    .catch(() => {});
}
```

- [ ] **Step 5: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep -E "notification.ts|email.ts" | head -10
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/email.ts src/lib/notification.ts package.json package-lock.json
git commit -m "feat: add email notifications via Nodemailer — fire-and-forget on createNotification (FR-NOTIF-03)"
```

---

## Task 2: SLA Schedule Creation di execute-action.ts

**Files:**
- Modify: `src/lib/workflow/execute-action.ts`

- [ ] **Step 1: Tambah SLA schedule creation setelah step advance**

Di `src/lib/workflow/execute-action.ts`, setelah blok `const result = await prisma.$transaction(...)` (sekitar baris 149–178), tambahkan blok berikut tepat setelah `const result = await prisma.$transaction(...)`:

```typescript
  // Buat SlaSchedule untuk step berikutnya jika ada sla_days
  if (nextStepCode && targetStatus && !["selesai", "terminated", "revision_required"].includes(targetStatus)) {
    const nextStepSla = await prisma.workflowStep.findFirst({
      where: { step_code: nextStepCode },
      select: { sla_days: true, sla_consequence: true },
    });
    if (nextStepSla?.sla_days) {
      // Hapus schedule lama yang belum triggered untuk pengajuan + step ini
      await prisma.slaSchedule.deleteMany({
        where: { pengajuan_id: pengajuan.id, step_code: nextStepCode, is_triggered: false },
      });
      const deadline = new Date(Date.now() + nextStepSla.sla_days * 24 * 60 * 60 * 1000);
      await prisma.slaSchedule.create({
        data: {
          pengajuan_id: pengajuan.id,
          step_code: nextStepCode,
          deadline,
          consequence: nextStepSla.sla_consequence ?? "reminder",
          is_triggered: false,
        },
      });
    }
  }
```

- [ ] **Step 2: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep "execute-action" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/workflow/execute-action.ts
git commit -m "feat: create SlaSchedule record on step advance (FR-WF-06)"
```

---

## Task 3: SLA Checker + Cron Endpoint

**Files:**
- Create: `src/lib/sla-checker.ts`
- Create: `src/app/api/cron/route.ts`

- [ ] **Step 1: Tambah CRON_SECRET ke .env**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Salin output (64 karakter hex), tambahkan ke `.env`:

```
CRON_SECRET=<paste hasil di sini>
```

- [ ] **Step 2: Create `src/lib/sla-checker.ts`**

```typescript
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";

export async function runSlaCheck(): Promise<{ triggered: number; errors: number }> {
  let triggered = 0;
  let errors = 0;

  const overdue = await prisma.slaSchedule.findMany({
    where: { deadline: { lt: new Date() }, is_triggered: false },
    include: {
      pengajuan: {
        include: {
          jenis_layanan: true,
          mahasiswa: true,
          pengajuan_data: true,
        },
      },
    },
  });

  for (const schedule of overdue) {
    try {
      if (schedule.consequence === "reminder") {
        await handleReminder(schedule);
      } else if (schedule.consequence === "bypass") {
        await handleBypass(schedule);
      }
      await prisma.slaSchedule.update({
        where: { id: schedule.id },
        data: { is_triggered: true, triggered_at: new Date() },
      });
      triggered++;
    } catch (err) {
      console.error(`[SLA] Error on schedule ${schedule.id}:`, err);
      errors++;
    }
  }

  return { triggered, errors };
}

async function resolveActorUsers(stepCode: string, pengajuanId: number): Promise<number[]> {
  const step = await prisma.workflowStep.findFirst({
    where: { step_code: stepCode },
    select: { actor_type: true },
  });
  if (!step) return [];

  const actorType = step.actor_type;

  // Roles langsung di system_role
  if (["staff_prodi", "staff_akademik", "kabag"].includes(actorType)) {
    const users = await prisma.user.findMany({
      where: { system_role: actorType as any, is_active: true },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  // Structural positions
  if (["kaprodi", "sekprodi", "wakil_dekan_1", "dekan", "kepala_lab"].includes(actorType)) {
    const positions = await prisma.structuralPosition.findMany({
      where: { position_code: actorType as any, is_active: true },
      include: { dosen: { include: { user: true } } },
    });
    return positions.map((p) => p.dosen.user?.id).filter((id): id is number => id !== undefined);
  }

  // Dosen PA
  if (actorType === "dosen_pa") {
    const data = await prisma.pengajuanData.findFirst({
      where: { pengajuan_id: pengajuanId },
      select: { field_values: true },
    });
    const fv = (data?.field_values as Record<string, unknown>) ?? {};
    const paDosenId = Number(fv.pa_dosen_id);
    if (!paDosenId) return [];
    const dosen = await prisma.dosen.findUnique({
      where: { id: paDosenId },
      include: { user: true },
    });
    return dosen?.user ? [dosen.user.id] : [];
  }

  return [];
}

async function handleReminder(schedule: Awaited<ReturnType<typeof prisma.slaSchedule.findMany>>[number]) {
  const p = schedule.pengajuan;
  const layananNama = p.jenis_layanan.nama;
  const mhsNama = p.mahasiswa?.nama_lengkap ?? "Mahasiswa";

  const userIds = await resolveActorUsers(schedule.step_code, schedule.pengajuan_id);
  for (const userId of userIds) {
    await createNotification({
      user_id: userId,
      title: `Pengingat SLA: ${layananNama}`,
      message: `Pengajuan ${layananNama} dari ${mhsNama} sudah melewati batas waktu penanganan. Mohon segera ditindaklanjuti.`,
      severity: "warning",
      entity_type: "pengajuan",
      entity_id: schedule.pengajuan_id,
    });
  }
}

async function handleBypass(schedule: Awaited<ReturnType<typeof prisma.slaSchedule.findMany>>[number]) {
  const p = schedule.pengajuan;

  // Cari step berikutnya setelah step_code yang di-bypass
  const currentStep = await prisma.workflowStep.findFirst({
    where: { step_code: schedule.step_code },
    select: { step_order: true, workflow_definition_id: true },
  });
  if (!currentStep) throw new Error(`Step ${schedule.step_code} not found`);

  const nextStep = await prisma.workflowStep.findFirst({
    where: {
      workflow_definition_id: currentStep.workflow_definition_id,
      step_order: { gt: currentStep.step_order },
    },
    orderBy: { step_order: "asc" },
  });
  if (!nextStep) throw new Error(`No next step after ${schedule.step_code}`);

  await prisma.$transaction([
    prisma.pengajuanLayanan.update({
      where: { id: schedule.pengajuan_id },
      data: {
        status: nextStep.status_code as any,
        current_step_code: nextStep.step_code,
        updated_at: new Date(),
      },
    }),
    prisma.pengajuanLog.create({
      data: {
        pengajuan_id: schedule.pengajuan_id,
        action_code: "bypass",
        performed_by: 0, // 0 = sistem
        from_status: p.status,
        to_status: nextStep.status_code,
        metadata: { reason: "SLA bypass — PA tidak merespons dalam batas waktu" },
      },
    }),
  ]);

  // Notifikasi mahasiswa
  if (p.mahasiswa_id) {
    await createNotification({
      user_id: p.mahasiswa_id,
      title: "Pengajuan Dilanjutkan Otomatis",
      message: `PA tidak merespons dalam batas waktu ${p.jenis_layanan.nama}. Pengajuan Anda dilanjutkan ke tahap berikutnya secara otomatis.`,
      severity: "info",
      entity_type: "pengajuan",
      entity_id: schedule.pengajuan_id,
    });
  }

  // Notifikasi actor berikutnya
  const nextActorUserIds = await resolveActorUsers(nextStep.step_code, schedule.pengajuan_id);
  for (const userId of nextActorUserIds) {
    await createNotification({
      user_id: userId,
      title: `Pengajuan Baru: ${p.jenis_layanan.nama}`,
      message: `Pengajuan ${p.jenis_layanan.nama} dari ${p.mahasiswa?.nama_lengkap ?? "mahasiswa"} menunggu tindakan Anda.`,
      severity: "info",
      entity_type: "pengajuan",
      entity_id: schedule.pengajuan_id,
    });
  }
}
```

- [ ] **Step 3: Create `src/app/api/cron/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { runSlaCheck } from "@/lib/sla-checker";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSlaCheck();
    return NextResponse.json({ ok: true, ...result, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("[Cron] SLA check failed:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 4: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep -E "sla-checker|cron" | head -10
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sla-checker.ts src/app/api/cron/route.ts src/lib/workflow/execute-action.ts
git commit -m "feat: SLA checker + cron endpoint — reminder + bypass PA auto-advance (FR-WF-06, FR-WF-07)"
```

- [ ] **Step 6: Dokumentasi setup crontab (di commit message / README)**

Tambahkan instruksi ke `README.md` atau catatan deploy:

```
# Setup crontab di server (crontab -e):
*/30 * * * * curl -s -o /dev/null -H "X-Cron-Secret: YOUR_CRON_SECRET" http://localhost:3003/api/cron
```

---

## Task 4: Bulk Import User

**Files:**
- Modify: `src/actions/admin.ts`
- Create: `src/app/(dashboard)/admin/users/import/page.tsx`
- Create: `public/templates/import-users-template.csv`

- [ ] **Step 1: Create template CSV**

Buat file `public/templates/import-users-template.csv`:

```
email,password,system_role,nama_lengkap,identifier,prodi_kode
aini@student.uinbanten.ac.id,password123,mahasiswa,Aini Nurul Hidayah,20210101001,TI
budi@uinbanten.ac.id,password123,dosen,Dr. Budi Santoso M.Kom,0012345678,TI
sari@uinbanten.ac.id,password123,staff_prodi,Sari Dewi S.Sos,,
```

Catatan kolom:
- `system_role`: `mahasiswa` | `dosen` | `staff_prodi` | `staff_akademik` | `kabag` | `super_admin` | `wakil_dekan_1` | `dekan` | `kepala_lab`
- `identifier`: NIM untuk mahasiswa, NIDN untuk dosen, NIP untuk staff/pegawai — kosong untuk super_admin
- `prodi_kode`: kode prodi (wajib untuk mahasiswa), contoh `TI`, `SI` — kosong untuk role lain

- [ ] **Step 2: Add `importUsersFromCsv` to `src/actions/admin.ts`**

Tambahkan import di atas (jika belum ada):
```typescript
import { revalidatePath } from "next/cache";
```

Tambahkan fungsi baru di akhir file `src/actions/admin.ts`:

```typescript
export interface ImportResult {
  success: number;
  failed: Array<{ row: number; email: string; error: string }>;
}

export async function importUsersFromCsv(formData: FormData): Promise<ImportResult> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("ERR_VAL_REQUIRED_FIELD: File CSV wajib diunggah");

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error("ERR_VAL_INVALID_FORMAT: File CSV kosong atau hanya berisi header");

  // Skip header row
  const dataLines = lines.slice(1);

  const prodiList = await prisma.prodi.findMany({ select: { id: true, kode: true } });
  const prodiByKode = Object.fromEntries(prodiList.map((p) => [p.kode.toLowerCase(), p.id]));

  const result: ImportResult = { success: 0, failed: [] };

  for (let i = 0; i < dataLines.length; i++) {
    const rowNum = i + 2; // 1-indexed + header
    const raw = dataLines[i].split(",").map((v) => v.trim());
    const [email, password, systemRole, namaLengkap, identifier, prodiKode] = raw;

    if (!email || !password || !systemRole || !namaLengkap) {
      result.failed.push({ row: rowNum, email: email ?? "", error: "Kolom email/password/system_role/nama_lengkap wajib diisi" });
      continue;
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        result.failed.push({ row: rowNum, email, error: "Email sudah terdaftar" });
        continue;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const isDosen = ["dosen", "kaprodi", "sekprodi", "wakil_dekan_1", "dekan", "kepala_lab"].includes(systemRole);
      const isPegawai = ["staff_prodi", "staff_akademik", "kabag"].includes(systemRole);
      const isMahasiswa = systemRole === "mahasiswa";

      if (isDosen) {
        if (!identifier) { result.failed.push({ row: rowNum, email, error: "NIDN wajib untuk dosen" }); continue; }
        const dosen = await prisma.dosen.create({ data: { nidn: identifier, nama_lengkap: namaLengkap, is_active: true } });
        await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: systemRole as any, dosen_id: dosen.id, is_active: true } });
      } else if (isPegawai) {
        if (!identifier) { result.failed.push({ row: rowNum, email, error: "NIP wajib untuk staff/pegawai" }); continue; }
        const pegawai = await prisma.pegawai.create({ data: { nip: identifier, nama_lengkap: namaLengkap, is_active: true } });
        await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: systemRole as any, pegawai_id: pegawai.id, is_active: true } });
      } else if (isMahasiswa) {
        if (!identifier) { result.failed.push({ row: rowNum, email, error: "NIM wajib untuk mahasiswa" }); continue; }
        if (!prodiKode) { result.failed.push({ row: rowNum, email, error: "prodi_kode wajib untuk mahasiswa" }); continue; }
        const prodiId = prodiByKode[prodiKode.toLowerCase()];
        if (!prodiId) { result.failed.push({ row: rowNum, email, error: `Prodi '${prodiKode}' tidak ditemukan` }); continue; }
        const mhs = await prisma.mahasiswa.create({ data: { nim: identifier, nama_lengkap: namaLengkap, prodi_id: prodiId, angkatan: new Date().getFullYear(), semester_aktif: 1, status_mahasiswa: "aktif" } });
        await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: "mahasiswa", mahasiswa_id: mhs.id, is_active: true } });
      } else {
        await prisma.user.create({ data: { email, password_hash: passwordHash, system_role: systemRole as any, is_active: true } });
      }

      result.success++;
    } catch (err: any) {
      result.failed.push({ row: rowNum, email, error: err.message ?? "Gagal membuat user" });
    }
  }

  revalidatePath("/admin/users");
  return result;
}
```

- [ ] **Step 3: Create `src/app/(dashboard)/admin/users/import/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { importUsersFromCsv, type ImportResult } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ImportUsersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await importUsersFromCsv(fd);
      setResult(res);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Import User dari CSV</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload file CSV untuk membuat banyak akun sekaligus.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Format CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Kolom: <code className="bg-muted px-1 rounded text-xs">email, password, system_role, nama_lengkap, identifier, prodi_kode</code>
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>identifier</strong>: NIM (mahasiswa), NIDN (dosen), NIP (staff/pegawai)<br />
            <strong>prodi_kode</strong>: wajib untuk mahasiswa, kosong untuk role lain
          </p>
          <Link
            href="/templates/import-users-template.csv"
            download
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Download className="h-4 w-4" />
            Download template CSV
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="file"
              name="file"
              accept=".csv"
              required
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground hover:file:opacity-90"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="gap-1.5">
              <Upload className="h-4 w-4" />
              {loading ? "Memproses..." : "Import"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Hasil Import
              <Badge variant="secondary">{result.success + result.failed.length} baris diproses</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" /> {result.success} berhasil
              </span>
              {result.failed.length > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-4 w-4" /> {result.failed.length} gagal
                </span>
              )}
            </div>
            {result.failed.length > 0 && (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Baris</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failed.map((f) => (
                      <tr key={f.row} className="border-t">
                        <td className="px-3 py-2 font-mono">{f.row}</td>
                        <td className="px-3 py-2">{f.email}</td>
                        <td className="px-3 py-2 text-destructive">{f.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep -E "import|admin.ts" | head -10
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/actions/admin.ts src/app/\(dashboard\)/admin/users/import/page.tsx public/templates/import-users-template.csv
git commit -m "feat: bulk import users from CSV with per-row error reporting (FR-USER-04)"
```

---

## Task 5: Semester Selector

**Files:**
- Modify: `src/actions/admin.ts`
- Create: `src/components/layout/SemesterSelector.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/(dashboard)/pengajuan/page.tsx`
- Modify: `src/app/(dashboard)/admin/monitoring/page.tsx`

- [ ] **Step 1: Tambah `setActiveSemester` ke `src/actions/admin.ts`**

Tambah import di atas `src/actions/admin.ts` (jika belum ada):
```typescript
import { cookies } from "next/headers";
```

Tambah fungsi baru:
```typescript
export async function setActiveSemester(semesterId: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("selected_semester_id", String(semesterId), {
    path: "/",
    httpOnly: false, // perlu dibaca client untuk highlight aktif
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    sameSite: "lax",
  });
  revalidatePath("/(dashboard)", "layout");
}
```

- [ ] **Step 2: Create `src/components/layout/SemesterSelector.tsx`**

```typescript
"use client";

import { useTransition } from "react";
import { setActiveSemester } from "@/actions/admin";

interface Semester {
  id: number;
  nama_semester: string;
  tahun_akademik: string;
  status: string;
}

interface SemesterSelectorProps {
  semesters: Semester[];
  selectedId: number;
}

export function SemesterSelector({ semesters, selectedId }: SemesterSelectorProps) {
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    startTransition(() => {
      setActiveSemester(id);
    });
  }

  return (
    <select
      value={selectedId}
      onChange={handleChange}
      disabled={pending}
      className="rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      {semesters.map((s) => (
        <option key={s.id} value={s.id}>
          {s.nama_semester} {s.tahun_akademik}
          {s.status === "active" ? " (Aktif)" : ""}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 3: Modify `src/app/(dashboard)/layout.tsx`**

Tambah import:
```typescript
import { cookies } from "next/headers";
import { SemesterSelector } from "@/components/layout/SemesterSelector";
```

Di dalam `DashboardLayout`, setelah `if (!user) redirect("/login");`, tambahkan:
```typescript
  // Semester selector
  const cookieStore = await cookies();
  const semesterCookieVal = cookieStore.get("selected_semester_id")?.value;

  const semesters = await prisma.academicPeriod.findMany({
    orderBy: { tanggal_mulai: "desc" },
    take: 8,
    select: { id: true, nama_semester: true, tahun_akademik: true, status: true },
  });

  const activeSemester = semesters.find((s) => s.status === "active");
  const selectedSemesterId = semesterCookieVal
    ? Number(semesterCookieVal)
    : (activeSemester?.id ?? semesters[0]?.id ?? 0);
  const isArchiveMode = activeSemester && selectedSemesterId !== activeSemester.id;
  const selectedSemesterLabel = semesters.find((s) => s.id === selectedSemesterId);
```

Ganti fungsi `Header` menjadi menerima `semesterProps`. Ubah return JSX:

```typescript
  return (
    <SidebarProvider>
      <IdleLogout />
      <AppSidebar systemRole={user.system_role} />
      <main className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-6">
          <div className="flex-1" />
          {semesters.length > 0 && (
            <SemesterSelector semesters={semesters} selectedId={selectedSemesterId} />
          )}
          <ThemeToggle />
          <NotificationSheet />
          <SignOutButton />
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>
        {isArchiveMode && selectedSemesterLabel && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
            Mode Arsip — {selectedSemesterLabel.nama_semester} {selectedSemesterLabel.tahun_akademik}. Data read-only.
          </div>
        )}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
```

Tambah missing imports ke layout.tsx (yang sudah dipakai Header sebelumnya):
```typescript
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationSheet } from "@/components/layout/NotificationSheet";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
```

Dan hapus import `Header` yang tidak lagi dipakai.

- [ ] **Step 4: Update `pengajuan/page.tsx` — default semester dari cookie**

Di `src/app/(dashboard)/pengajuan/page.tsx`, pada bagian page props tambahkan `cookies` dan default semester:

Tambah import:
```typescript
import { cookies } from "next/headers";
```

Sebelum membaca `searchParams`, tambahkan:
```typescript
  const cookieStore = await cookies();
  const cookieSemesterId = cookieStore.get("selected_semester_id")?.value;
```

Pada bagian filter `period`, ganti:
```typescript
// SEBELUM:
if (filters.period) filterWhere.academic_period_id = Number(filters.period);

// SESUDAH:
const effectivePeriod = filters.period || cookieSemesterId;
if (effectivePeriod) filterWhere.academic_period_id = Number(effectivePeriod);
```

- [ ] **Step 5: Update `admin/monitoring/page.tsx` — filter by semester**

Tambah import di atas:
```typescript
import { cookies } from "next/headers";
```

Ubah signature fungsi:
```typescript
export default async function AdminMonitoringPage() {
  const cookieStore = await cookies();
  const semesterCookieVal = cookieStore.get("selected_semester_id")?.value;
  const activePeriod = semesterCookieVal
    ? await prisma.academicPeriod.findUnique({ where: { id: Number(semesterCookieVal) } })
    : await prisma.academicPeriod.findFirst({ where: { status: "active" } });

  const periodFilter = activePeriod ? { academic_period_id: activePeriod.id } : {};
```

Ganti `totalPengajuan`, `selesaiMonth`, `activeCount` agar pakai `periodFilter`:
```typescript
    prisma.pengajuanLayanan.count({ where: { ...periodFilter } }),
    prisma.pengajuanLayanan.count({ where: { status: "selesai", completed_at: { gte: startOfMonth }, ...periodFilter } }),
    // ...
    prisma.pengajuanLayanan.count({ where: { status: { notIn: ["selesai", "terminated"] }, ...periodFilter } }),
```

Tambahkan label semester di heading halaman:
```typescript
<h1 className="text-2xl font-bold">
  Monitoring{activePeriod ? ` — ${activePeriod.nama_semester} ${activePeriod.tahun_akademik}` : ""}
</h1>
```

- [ ] **Step 6: TypeScript check**

```bash
tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/actions/admin.ts src/components/layout/SemesterSelector.tsx src/app/\(dashboard\)/layout.tsx src/app/\(dashboard\)/pengajuan/page.tsx src/app/\(dashboard\)/admin/monitoring/page.tsx
git commit -m "feat: semester selector in dashboard header with archive mode banner (FR-ADMIN-06)"
```

---

## Task 6: Final Build Check

- [ ] **Step 1: Full TypeScript check**

```bash
cd /home/zhev/myproject/e-layanan && tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 2: Lint**

```bash
npm run lint 2>&1 | tail -10
```

Expected: no errors.

- [ ] **Step 3: Production build**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`, zero errors, zero warnings.

- [ ] **Step 4: Commit jika ada lint/type fixes**

```bash
git add -A
git commit -m "fix: lint and type fixes from final build check"
```
