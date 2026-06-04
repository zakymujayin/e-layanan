# Security & Feature Gap Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all 16 security vulnerabilities and dead-process gaps in SILA e-layanan across 3 phases.

**Architecture:** Phase A (Security) adds authorization guards at every data-access boundary — canAccessPengajuan helper, actor verification in workflow engine, rate limiter, Zod schemas, AK whitelist. Phase B (Dead Processes) completes broken workflow loops — nilai notifications, universal resubmit, reject_to_step dropdown, password reset. Phase C (UX/Hardening) finalizes missing UX and system hardening — eligibility UI, version history, idle logout, atomic kode, SMTP encryption.

**Tech Stack:** Next.js 16 App Router, Prisma 7, Auth.js v5, Zod, Node.js `crypto`, TypeScript strict

---

## File Map

### Phase A — Modified / Created
| File | Change |
|---|---|
| `src/lib/auth/check.ts` | Add `canAccessPengajuan`, `verifyActorForStep`, `requireRole` |
| `src/lib/rate-limit.ts` | **Create** in-memory rate limiter |
| `src/app/(dashboard)/pengajuan/[id]/page.tsx` | Add `canAccessPengajuan` gate |
| `src/app/api/pengajuan/[id]/pdf/route.ts` | Add `canAccessPengajuan` gate |
| `src/lib/upload.ts` | `linkDokumenToPengajuan` ownership check + `uploadedBy` param |
| `src/lib/workflow/execute-action.ts` | `verifyActorForStep` call + `reject_to_step` target validation |
| `src/actions/pengajuan.ts` | `requireRole` on helpers + AK whitelist + pass `userId` to link |
| `src/lib/auth.config.ts` | Login rate limit |
| `src/app/verifikasi/page.tsx` | Verifikasi rate limit |
| `src/actions/pengajuan.ts` | Zod on TA-01 |
| `src/actions/nilai.ts` | Zod + downstream notifications |

### Phase B — Modified / Created
| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `password_reset_token`, `password_reset_expires` to User |
| `src/actions/auth.ts` | `requestPasswordReset` + `resetPassword` |
| `src/app/(auth)/lupa-password/page.tsx` | Functional form |
| `src/app/(auth)/reset-password/page.tsx` | **Create** reset page |
| `src/actions/pengajuan.ts` | `resubmitPengajuan` generic action |
| `src/components/workflow/ResubmitForm.tsx` | Add `layananKode` prop, generic mode |
| `src/app/(dashboard)/pengajuan/[id]/page.tsx` | Show resubmit for all services |
| `src/components/workflow/ActionButtons.tsx` | `reject_to_step` target dropdown |
| `src/lib/workflow/execute-action.ts` | Accept user-selected `target_status` |

### Phase C — Modified / Created
| File | Change |
|---|---|
| `src/lib/eligibility.ts` | **Create** eligibility check per layanan |
| `src/app/(dashboard)/pengajuan/baru/page.tsx` | Show disabled cards with reason |
| `src/app/(dashboard)/pengajuan/[id]/page.tsx` | Version history toggle |
| `src/components/layout/IdleLogout.tsx` | **Create** idle timer component |
| `src/app/(dashboard)/layout.tsx` | Mount `IdleLogout` |
| `src/app/(auth)/login/page.tsx` | Show idle-reason banner |
| `src/actions/pengajuan.ts` | Atomic kode via pengajuan.id |
| `src/lib/crypto.ts` | **Create** AES-256-GCM encrypt/decrypt |
| `src/actions/admin.ts` | Encrypt smtp_pass on save |

---

## PHASE A: Security Hardening

### Task A1: `canAccessPengajuan` + IDOR Fix (Detail Page & PDF Route)

**Files:**
- Modify: `src/lib/auth/check.ts`
- Modify: `src/app/(dashboard)/pengajuan/[id]/page.tsx`
- Modify: `src/app/api/pengajuan/[id]/pdf/route.ts`

- [ ] **Step 1: Read `src/lib/auth/check.ts` to understand current content**

```bash
cat src/lib/auth/check.ts
```

- [ ] **Step 2: Add `canAccessPengajuan` to `src/lib/auth/check.ts`**

Add the following export (keep existing content, append):

```typescript
import { prisma } from "@/lib/prisma";

export async function canAccessPengajuan(
  userId: number,
  pengajuanId: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { system_role: true, mahasiswa_id: true, dosen_id: true },
  });
  if (!user) return false;
  if (user.system_role === "super_admin") return true;

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    select: {
      mahasiswa_id: true,
      scope_level: true,
      jenis_layanan: { select: { kode: true } },
    },
  });
  if (!pengajuan) return false;

  switch (user.system_role) {
    case "mahasiswa":
      return pengajuan.mahasiswa_id === user.mahasiswa_id;
    case "staff_prodi":
      return pengajuan.scope_level === "prodi";
    case "staff_akademik":
    case "kabag":
      return pengajuan.scope_level === "fakultas";
    case "wakil_dekan_1":
    case "dekan":
    case "kaprodi":
    case "sekprodi":
      return true;
    case "kepala_lab":
      return pengajuan.jenis_layanan.kode === "TA-06";
    case "dosen": {
      if (!user.dosen_id) return false;
      const positions = await prisma.structuralPosition.findMany({
        where: { dosen_id: user.dosen_id, is_active: true },
        select: { position_code: true },
      });
      const codes = positions.map(p => p.position_code as string);
      if (codes.some(c => ["wakil_dekan_1", "dekan", "kaprodi", "sekprodi"].includes(c))) return true;
      if (codes.includes("kepala_lab")) return pengajuan.jenis_layanan.kode === "TA-06";

      const data = await prisma.pengajuanData.findFirst({
        where: { pengajuan_id: pengajuanId },
        select: { field_values: true },
      });
      if (data?.field_values) {
        const fv = data.field_values as Record<string, unknown>;
        if (Number(fv.pa_dosen_id) === user.dosen_id) return true;
      }
      const count = await prisma.assignment.count({
        where: { pengajuan_id: pengajuanId, dosen_id: user.dosen_id, is_active: true },
      });
      return count > 0;
    }
    default:
      return false;
  }
}
```

- [ ] **Step 3: Add scope gate to detail page**

In `src/app/(dashboard)/pengajuan/[id]/page.tsx`, add import at top:

```typescript
import { canAccessPengajuan } from "@/lib/auth/check";
```

Immediately after `if (!pengajuan) notFound();`, add:

```typescript
const canAccess = await canAccessPengajuan(userId, pengajuan.id);
if (!canAccess) notFound(); // 404 to not leak pengajuan existence
```

- [ ] **Step 4: Add scope gate to PDF route**

In `src/app/api/pengajuan/[id]/pdf/route.ts`, add import:

```typescript
import { canAccessPengajuan } from "@/lib/auth/check";
```

Add after `if (!pengajuan)` check and before `buildDocumentContext`:

```typescript
const userId = Number(session.user.id);
const canAccess = await canAccessPengajuan(userId, pengajuanId);
if (!canAccess) {
  return new NextResponse("Forbidden", { status: 403 });
}
```

Note: `userId` is already declared earlier in the route — remove the duplicate declaration if needed.

- [ ] **Step 5: TypeScript check**

```bash
cd /home/zhev/myproject/e-layanan && tsc --noEmit 2>&1 | head -20
# Expected: no errors related to check.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth/check.ts src/app/(dashboard)/pengajuan/[id]/page.tsx src/app/api/pengajuan/[id]/pdf/route.ts
git commit -m "fix(security): add scope authorization to pengajuan detail and PDF endpoints — closes IDOR"
```

---

### Task A2: `linkDokumenToPengajuan` Ownership Check

**Files:**
- Modify: `src/lib/upload.ts`
- Modify: `src/actions/pengajuan.ts`

- [ ] **Step 1: Add `uploadedBy` parameter + ownership check to `linkDokumenToPengajuan`**

In `src/lib/upload.ts`, replace the existing `linkDokumenToPengajuan`:

```typescript
export async function linkDokumenToPengajuan(
  dokumenIds: number[],
  pengajuanId: number,
  uploadedBy: number
) {
  if (dokumenIds.length === 0) return;

  const owned = await prisma.pengajuanDokumen.findMany({
    where: { id: { in: dokumenIds } },
    select: { id: true, di_upload_oleh: true },
  });

  const unauthorized = owned.filter(d => d.di_upload_oleh !== uploadedBy);
  if (unauthorized.length > 0) {
    throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Satu atau lebih dokumen bukan milik Anda");
  }

  await prisma.$transaction(
    dokumenIds.map(id =>
      prisma.pengajuanDokumen.update({
        where: { id },
        data: { pengajuan_id: pengajuanId },
      })
    )
  );
}
```

- [ ] **Step 2: Update all callers in `src/actions/pengajuan.ts` to pass `userId`**

Find all 8 calls to `linkDokumenToPengajuan` (TA01, TA02, TA03, TA04, TA05, TA06, resubmitTA06, and the new resubmitPengajuan you'll add in B2). Each has the pattern:

```typescript
// BEFORE:
if (dokumenIds.length > 0) await linkDokumenToPengajuan(dokumenIds, pengajuan.id);

// AFTER (in each submit function):
if (dokumenIds.length > 0) await linkDokumenToPengajuan(dokumenIds, pengajuan.id, userId);
```

For `resubmitTA06`, the pengajuanId is the parameter, not `pengajuan.id`:
```typescript
// BEFORE:
if (dokumenIdsResubmit.length > 0) await linkDokumenToPengajuan(dokumenIdsResubmit, pengajuanId);

// AFTER:
if (dokumenIdsResubmit.length > 0) await linkDokumenToPengajuan(dokumenIdsResubmit, pengajuanId, userId);
```

- [ ] **Step 3: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep -E "upload.ts|pengajuan.ts" | head -10
# Expected: no errors
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/upload.ts src/actions/pengajuan.ts
git commit -m "fix(security): enforce document ownership in linkDokumenToPengajuan"
```

---

### Task A3: Actor Role Verification in `executeWorkflowAction`

**Files:**
- Modify: `src/lib/workflow/execute-action.ts`

- [ ] **Step 1: Add `verifyActorForStep` function before `executeWorkflowAction`**

In `src/lib/workflow/execute-action.ts`, add this function before the `executeWorkflowAction` export:

```typescript
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
```

- [ ] **Step 2: Call `verifyActorForStep` inside `executeWorkflowAction`**

After the line `const validation = await validateTransition(...)`, add:

```typescript
await verifyActorForStep(userId, validation.step.actor_type, input.pengajuanId);
```

- [ ] **Step 3: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep "execute-action" | head -10
# Expected: no errors
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/workflow/execute-action.ts
git commit -m "fix(security): verify caller is correct workflow actor before executing action"
```

---

### Task A4: Role Checks in Helper Mutations

**Files:**
- Modify: `src/actions/pengajuan.ts`

- [ ] **Step 1: Add `requireRole` helper at top of `src/actions/pengajuan.ts`**

Add after the imports, before `submitPengajuanTA01`:

```typescript
async function requireRole(userId: number, allowedRoles: string[]): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { system_role: true, dosen_id: true },
  });
  if (!user) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  if (user.system_role === "super_admin") return;

  for (const role of allowedRoles) {
    if (user.system_role === role) return;
    if (user.dosen_id) {
      const pos = await prisma.structuralPosition.count({
        where: { dosen_id: user.dosen_id, position_code: role as any, is_active: true },
      });
      if (pos > 0) return;
    }
  }
  throw new Error(`ERR_AUTH_INSUFFICIENT_ROLE: Hanya ${allowedRoles.join("/")} yang dapat melakukan ini`);
}
```

- [ ] **Step 2: Add role check to `setJadwalTA03`**

In `setJadwalTA03`, after `const session = await auth(); if (!session?.user?.id) throw ...`, add:

```typescript
const userId = Number(session.user.id);
await requireRole(userId, ["staff_prodi"]);
```

- [ ] **Step 3: Add role check to `setJadwalKomprehensif`**

Same pattern as Step 2 — add `userId` + `await requireRole(userId, ["staff_prodi"])`.

- [ ] **Step 4: Add role check to `setPengujiTA03`, `setPengujiKomprehensif`, `setPembimbingTA02`, `setMajelisTA05`**

In each function, after auth check:

```typescript
const userId = Number(session.user.id);
await requireRole(userId, ["sekprodi"]);
```

Note: `setPembimbingTA02` and `setMajelisTA05` already have `const user = await prisma.user.findUnique(...)`. Keep that but add `requireRole` before the DB operations.

- [ ] **Step 5: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep "pengajuan.ts" | head -10
# Expected: no errors
```

- [ ] **Step 6: Commit**

```bash
git add src/actions/pengajuan.ts
git commit -m "fix(security): add role checks to setJadwal/setPenguji/setPembimbing/setMajelis mutations"
```

---

### Task A5: Whitelist FormData in `submitPengajuanAK`

**Files:**
- Modify: `src/actions/pengajuan.ts`

- [ ] **Step 1: Add field whitelist constant before `submitPengajuanAK`**

```typescript
const AK_ALLOWED_FIELDS: Record<string, string[]> = {
  "AK-01": ["peruntukan", "tujuan_peruntukan"],
  "AK-02": [
    "peruntukan", "orang_tua_pns", "nama_orang_tua", "nip_orang_tua",
    "pangkat_golongan", "jabatan_orang_tua", "instansi_orang_tua", "hubungan_orang_tua",
  ],
  "AK-03": ["peruntukan"],
  "AK-04": [
    "mata_kuliah", "instansi_tujuan", "pejabat_tujuan", "alamat_instansi",
    "lokasi_observasi", "tanggal_mulai", "tanggal_selesai", "dosen_pembimbing_observasi_id",
  ],
  "AK-05": ["judul_penelitian", "lokasi_penelitian", "tujuan_penelitian", "tanggal_mulai", "tanggal_selesai"],
  "AK-06": [
    "bidang_magang", "instansi_tujuan", "alamat_instansi", "pejabat_tujuan",
    "tanggal_mulai", "tanggal_selesai", "dosen_pembimbing_magang_id",
  ],
  "AK-07": ["tipe_rekomendasi", "tujuan_rekomendasi", "pihak_penerima"],
};
```

- [ ] **Step 2: Replace mass-assignment loop with whitelist filter**

In `submitPengajuanAK`, replace the block:
```typescript
const fieldValues: Record<string, unknown> = {};
for (const [key, val] of formData.entries()) {
  if (val && typeof val === "string" && val.length > 0) {
    fieldValues[key] = val;
  }
}
```

With:
```typescript
const allowed = AK_ALLOWED_FIELDS[kode] ?? [];
const fieldValues: Record<string, unknown> = {};
for (const key of allowed) {
  const val = formData.get(key);
  if (val && typeof val === "string" && val.trim().length > 0) {
    fieldValues[key] = val.trim();
  }
}
```

- [ ] **Step 3: Build check**

```bash
tsc --noEmit 2>&1 | grep "pengajuan.ts" | head -5
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/pengajuan.ts
git commit -m "fix(security): replace mass FormData assignment with whitelist in submitPengajuanAK"
```

---

### Task A6: Rate Limiting

**Files:**
- Create: `src/lib/rate-limit.ts`
- Modify: `src/lib/auth.config.ts`
- Modify: `src/app/verifikasi/page.tsx`

- [ ] **Step 1: Create `src/lib/rate-limit.ts`**

```typescript
type RateRecord = { count: number; resetAt: number };
const store = new Map<string, RateRecord>();

/** Returns true if the key has exceeded the limit — caller should reject the request. */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= limit) return true;

  record.count++;
  return false;
}
```

- [ ] **Step 2: Read `src/lib/auth.config.ts` to find the credentials authorize function**

```bash
cat src/lib/auth.config.ts
```

- [ ] **Step 3: Add login rate limit inside the credentials `authorize` function**

Add import at top of `src/lib/auth.config.ts`:
```typescript
import { isRateLimited } from "@/lib/rate-limit";
```

Inside the `authorize` callback, as the very first lines (before the DB query):
```typescript
// authorize(credentials, req) — Auth.js v5 signature
const ip =
  req?.headers?.get("x-forwarded-for") ??
  req?.headers?.get("x-real-ip") ??
  "unknown";

if (isRateLimited(`login:${ip}`, 5, 60_000)) {
  throw new Error("ERR_AUTH_RATE_LIMIT: Terlalu banyak percobaan login. Coba lagi dalam 1 menit.");
}
```

- [ ] **Step 4: Add verifikasi rate limit in `src/app/verifikasi/page.tsx`**

Add import at top:
```typescript
import { isRateLimited } from "@/lib/rate-limit";
```

In `VerifikasiPage`, the `ip` is already extracted via `headers()`. Move its extraction before the token block, then wrap the `verifyToken` call:

```typescript
// Move ip extraction before the `if (token)` block:
const headersList = await headers();
const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";

if (token) {
  try {
    if (isRateLimited(`verifikasi:${ip}`, 10, 60_000)) {
      error = "Terlalu banyak percobaan. Coba lagi dalam 1 menit.";
    } else {
      verificationResult = await verifyToken(token, ip);
      if (!verificationResult) error = "Token tidak ditemukan atau tidak valid.";
    }
  } catch {
    error = "Terjadi kesalahan saat memverifikasi dokumen.";
  }
}
```

- [ ] **Step 5: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/auth.config.ts src/app/verifikasi/page.tsx
git commit -m "fix(security): add rate limiting — login 5/min, verifikasi publik 10/min"
```

---

### Task A7: Zod Validation on Key Actions

**Files:**
- Modify: `src/actions/pengajuan.ts`
- Modify: `src/actions/nilai.ts`

- [ ] **Step 1: Check if Zod is installed**

```bash
grep '"zod"' /home/zhev/myproject/e-layanan/package.json
# If not found: npm install zod
```

- [ ] **Step 2: Add Zod schema + validation for `submitPengajuanTA01`**

Add at top of `src/actions/pengajuan.ts`:
```typescript
import { z } from "zod";
```

Add schema before `submitPengajuanTA01`:
```typescript
const TA01Schema = z.object({
  judul_1: z.string().min(5, "Judul 1 minimal 5 karakter"),
  judul_2: z.string().min(5, "Judul 2 minimal 5 karakter"),
  judul_3: z.string().min(5, "Judul 3 minimal 5 karakter"),
  judul_4: z.string().min(1).nullish(),
  judul_5: z.string().min(1).nullish(),
  pa_dosen_id: z.coerce.number().int().positive("Pilih Pembimbing Akademik"),
});
```

Replace the raw extraction block in `submitPengajuanTA01` with:
```typescript
const parsed = TA01Schema.safeParse({
  judul_1: formData.get("judul_1"),
  judul_2: formData.get("judul_2"),
  judul_3: formData.get("judul_3"),
  judul_4: formData.get("judul_4") || null,
  judul_5: formData.get("judul_5") || null,
  pa_dosen_id: formData.get("pa_dosen_id"),
});
if (!parsed.success) {
  throw new Error(`ERR_VAL_INVALID_FORMAT: ${parsed.error.errors[0].message}`);
}
const { judul_1, judul_2, judul_3, judul_4, judul_5, pa_dosen_id: paDosenId } = parsed.data;
// Remove the old: if (!judul1 || !judul2 || ...) checks — Zod handles them
```

- [ ] **Step 3: Add Zod validation to `inputNilaiSempro`**

Add at top of `src/actions/nilai.ts`:
```typescript
import { z } from "zod";
```

Add schemas:
```typescript
const NilaiSemproSchema = z.object({
  nilai: z.number().min(0).max(100),
  catatan: z.string().max(500).default(""),
  keputusan: z.enum(["layak", "tidak_layak"]),
});

const NilaiKomprehensifSchema = z.object({
  nilai: z.number().min(0).max(100),
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
```

In `inputNilaiSempro`, add after the assignment check:
```typescript
const validated = NilaiSemproSchema.safeParse(data);
if (!validated.success) throw new Error(`ERR_VAL_INVALID_FORMAT: ${validated.error.errors[0].message}`);
// Use validated.data instead of raw data below
const { nilai: validNilai, catatan: validCatatan, keputusan: validKeputusan } = validated.data;
```

Remove the old manual range checks (`if (data.nilai < 0 || data.nilai > 100)`) — Zod handles them.

Apply same pattern to `inputNilaiKomprehensif` and `inputNilaiMunaqasyah`.

- [ ] **Step 4: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 5: Commit**

```bash
git add src/actions/pengajuan.ts src/actions/nilai.ts
git commit -m "fix: add Zod schema validation to TA-01 submit and all nilai input actions"
```

---

## PHASE B: Dead Process Fixes

### Task B1: Nilai Downstream Notifications

**Files:**
- Modify: `src/actions/nilai.ts`

- [ ] **Step 1: Add `createNotification` import to `src/actions/nilai.ts`**

```typescript
import { createNotification } from "@/lib/notification";
```

- [ ] **Step 2: Notify mahasiswa in `inputNilaiSempro` when both nilai are in**

Replace the `if (allNilai.length >= 2)` block:

```typescript
if (allNilai.length >= 2) {
  const keduaLayak = allNilai.every(n => n.keputusan === "layak");
  const avgNilai = allNilai.reduce((sum, n) => sum + (n.nilai ?? 0), 0) / allNilai.length;

  await prisma.nilaiSidang.updateMany({
    where: { pengajuan_id: pengajuanId },
    data: { nilai_akhir: avgNilai },
  });

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    select: { mahasiswa_id: true },
  });
  if (pengajuan) {
    createNotification({
      user_id: pengajuan.mahasiswa_id,
      title: "Hasil Seminar Proposal",
      message: `Kedua penguji telah memberikan penilaian. Hasil: ${keduaLayak ? "LAYAK" : "TIDAK LAYAK"}.`,
      severity: keduaLayak ? "success" : "warning",
      entity_type: "pengajuan",
      entity_id: pengajuanId,
    }).catch(() => {});
  }
}
```

- [ ] **Step 3: Notify mahasiswa in `inputNilaiKomprehensif` when both nilai are in**

After the existing `updateMany` inside `if (allNilai.length >= 2)`, add:

```typescript
const pengajuan = await prisma.pengajuanLayanan.findUnique({
  where: { id: pengajuanId },
  select: { mahasiswa_id: true },
});
if (pengajuan) {
  createNotification({
    user_id: pengajuan.mahasiswa_id,
    title: "Hasil Ujian Komprehensif",
    message: `Penguji telah memberikan penilaian. Hasil: ${finalKeputusan === "lulus" ? "LULUS" : "TIDAK LULUS"}.`,
    severity: finalKeputusan === "lulus" ? "success" : "warning",
    entity_type: "pengajuan",
    entity_id: pengajuanId,
  }).catch(() => {});
}
```

Note: `finalKeputusan` is the variable set by the existing logic in that block.

- [ ] **Step 4: Notify mahasiswa in `inputNilaiMunaqasyah` after create**

At the end of `inputNilaiMunaqasyah`, after `prisma.nilaiSidang.create`:

```typescript
const pengajuan = await prisma.pengajuanLayanan.findUnique({
  where: { id: pengajuanId },
  select: { mahasiswa_id: true },
});
if (pengajuan) {
  createNotification({
    user_id: pengajuan.mahasiswa_id,
    title: "Hasil Ujian Munaqasyah",
    message: `Nilai telah diinput. Hasil: ${data.keputusan === "lulus" ? "LULUS" : "TIDAK LULUS"}${yudisium ? ` — ${yudisium.replace(/_/g, " ")}` : ""}.`,
    severity: data.keputusan === "lulus" ? "success" : "warning",
    entity_type: "pengajuan",
    entity_id: pengajuanId,
  }).catch(() => {});
}
```

- [ ] **Step 5: TypeScript check**

```bash
tsc --noEmit 2>&1 | grep "nilai.ts" | head -10
# Expected: no errors
```

- [ ] **Step 6: Commit**

```bash
git add src/actions/nilai.ts
git commit -m "feat: add mahasiswa notifications when nilai sidang is complete (B1)"
```

---

### Task B2: Generic Resubmit for All Services

**Files:**
- Modify: `src/actions/pengajuan.ts`
- Modify: `src/components/workflow/ResubmitForm.tsx`
- Modify: `src/app/(dashboard)/pengajuan/[id]/page.tsx`

- [ ] **Step 1: Add `resubmitPengajuan` to `src/actions/pengajuan.ts`**

Add after the existing `resubmitTA06` function:

```typescript
export async function resubmitPengajuan(pengajuanId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: true },
  });
  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya mahasiswa");

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true, jenis_layanan: true },
  });
  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND: Pengajuan tidak ditemukan");
  if (pengajuan.mahasiswa_id !== user.mahasiswa.id) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Bukan pengajuan Anda");
  if (pengajuan.status !== "revision_required") throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Pengajuan tidak dalam status revisi");

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: pengajuan.workflow_definition_id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const versiCount = await prisma.pengajuanVersi.count({ where: { pengajuan_id: pengajuanId } });
  const currentValues = (pengajuan.pengajuan_data?.field_values as Record<string, unknown>) ?? {};

  const updatedFields: Record<string, unknown> = {};
  for (const [key, val] of formData.entries()) {
    if (key !== "dokumen_ids" && val && typeof val === "string" && val.trim()) {
      updatedFields[key] = val.trim();
    }
  }
  const newFieldValues = { ...currentValues, ...updatedFields };

  await prisma.$transaction([
    prisma.pengajuanData.upsert({
      where: { pengajuan_id: pengajuanId },
      update: { field_values: newFieldValues },
      create: { pengajuan_id: pengajuanId, field_values: newFieldValues },
    }),
    prisma.pengajuanVersi.create({
      data: {
        pengajuan_id: pengajuanId,
        versi_ke: versiCount + 1,
        data_snapshot: newFieldValues,
        dokumen_snapshot: {},
        dibuat_oleh: userId,
      },
    }),
    prisma.pengajuanLayanan.update({
      where: { id: pengajuanId },
      data: {
        status: firstStep.status_code as any,
        current_step_code: firstStep.step_code,
        revisi_ke: (pengajuan.revisi_ke ?? 0) + 1,
      },
    }),
    prisma.pengajuanLog.create({
      data: {
        pengajuan_id: pengajuanId,
        action_code: "resubmit",
        performed_by: userId,
        from_status: "revision_required",
        to_status: firstStep.status_code,
        metadata: { versi: versiCount + 1 },
      },
    }),
  ]);

  const dokumenIds = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIds.length > 0) await linkDokumenToPengajuan(dokumenIds, pengajuanId, userId);

  notifyFirstApprover(pengajuanId, pengajuan.jenis_layanan.nama, user.mahasiswa.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuanId}`);
}
```

- [ ] **Step 2: Read `src/components/workflow/ResubmitForm.tsx` to understand current structure**

```bash
cat src/components/workflow/ResubmitForm.tsx
```

- [ ] **Step 3: Update `ResubmitForm.tsx` to handle both TA-06 and generic resubmit**

Replace the entire content of `src/components/workflow/ResubmitForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resubmitTA06, resubmitPengajuan } from "@/actions/pengajuan";

interface ResubmitFormProps {
  pengajuanId: number;
  layananKode: string;
}

export function ResubmitForm({ pengajuanId, layananKode }: ResubmitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isTA06 = layananKode === "TA-06";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      if (isTA06) {
        await resubmitTA06(pengajuanId, fd);
      } else {
        await resubmitPengajuan(pengajuanId, fd);
      }
      toast.success("Pengajuan berhasil diajukan ulang");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Gagal mengajukan ulang");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
      <h3 className="mb-2 font-semibold text-amber-800 dark:text-amber-200">Ajukan Ulang</h3>
      <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
        Perbaiki sesuai catatan di timeline aktivitas di atas, lalu submit ulang.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {isTA06 && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Submission ID Turnitin</label>
              <input
                name="submission_id_turnitin"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Turnitin</label>
              <input
                name="url_turnitin"
                type="url"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Persentase Similarity (%)</label>
              <input
                name="similarity_percentage"
                type="number"
                min="0"
                max="100"
                defaultValue="0"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                required
              />
            </div>
          </>
        )}
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Memproses..." : "Ajukan Ulang"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Update detail page to show ResubmitForm for all services**

In `src/app/(dashboard)/pengajuan/[id]/page.tsx`, add import:
```typescript
// Already imported: import { ResubmitForm } from "@/components/workflow/ResubmitForm";
```

Replace the existing TA-06-only resubmit block:
```typescript
// REMOVE:
{kode === "TA-06" && pengajuan.status === "revision_required" && (
  <ResubmitForm pengajuanId={pengajuan.id} />
)}

// REPLACE WITH:
{pengajuan.status === "revision_required" && (
  <ResubmitForm pengajuanId={pengajuan.id} layananKode={kode} />
)}
```

- [ ] **Step 5: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 6: Commit**

```bash
git add src/actions/pengajuan.ts src/components/workflow/ResubmitForm.tsx src/app/(dashboard)/pengajuan/[id]/page.tsx
git commit -m "feat: add generic resubmit for all services in revision_required status (FR-WF-05)"
```

---

### Task B3: `reject_to_step` Target Role UI

**Files:**
- Modify: `src/lib/workflow/execute-action.ts`
- Modify: `src/components/workflow/ActionButtons.tsx`

- [ ] **Step 1: Add user-selected `target_status` support in `executeWorkflowAction`**

In `src/lib/workflow/execute-action.ts`, after the line `let targetStatus = validation.targetStatus;`:

```typescript
// For reject_to_step: WD1/Dekan selects which step to return to
if (input.action === "reject_to_step" && input.data?.target_status) {
  const actionConfig = validation.actionDef.action_config as { allow_target?: string[] } | null;
  const allowTarget = actionConfig?.allow_target ?? [];
  const requestedTarget = input.data.target_status as string;
  if (allowTarget.length > 0 && !allowTarget.includes(requestedTarget)) {
    throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Target step pengembalian tidak diizinkan");
  }
  targetStatus = requestedTarget;
}
```

- [ ] **Step 2: Update `ActionButtons.tsx` to show target dropdown and pass `target_status`**

Read `src/components/workflow/ActionButtons.tsx`. Replace the entire file content with:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";
import type { WorkflowStepAction } from "@/generated/prisma/client";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Mahasiswa (awal)",
  pending_staff_prodi: "Staff Prodi",
  pending_staff_akademik: "Staff Akademik",
  pending_pa: "Pembimbing Akademik",
  pending_kaprodi: "Kepala Prodi",
  pending_sekprodi: "Sekretaris Prodi",
  pending_kabag: "Kepala Bagian",
  pending_wd1: "Wakil Dekan 1",
  pending_dekan: "Dekan",
  pending_kepala_lab: "Kepala Lab",
};

interface ActionButtonsProps {
  pengajuanId: number;
  actions: WorkflowStepAction[];
  isPA: boolean;
  judulCount: number;
}

export function ActionButtons({ pengajuanId, actions, isPA, judulCount }: ActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedJudul, setSelectedJudul] = useState<number | null>(null);
  const [alasan, setAlasan] = useState("");
  const [targetStatus, setTargetStatus] = useState<string>("");

  async function execute(action: string) {
    setLoading(action);
    try {
      await executeWorkflowAction({
        pengajuanId,
        action,
        data: {
          ...(alasan ? { alasan } : {}),
          ...(selectedJudul !== null ? { selected_judul_index: selectedJudul } : {}),
          ...(action === "reject_to_step" && targetStatus ? { target_status: targetStatus } : {}),
        },
      });
      toast.success("Aksi berhasil");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengeksekusi aksi");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Aksi</h3>

      {isPA && actions.some(a => a.action_code === "select_judul") && (
        <div className="space-y-2">
          <Label>Pilih 1 Judul:</Label>
          {Array.from({ length: judulCount }, (_, i) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="selected_judul"
                value={i + 1}
                checked={selectedJudul === i + 1}
                onChange={() => setSelectedJudul(i + 1)}
              />
              Judul {i + 1}
            </label>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {actions.map(a => {
          const isDestructive = ["reject_to_submitter", "reject_to_step"].includes(a.action_code);
          const needsReason = a.requires_reason || isDestructive;
          const actionConfig = a.action_config as { allow_target?: string[] } | null;
          const allowTarget = actionConfig?.allow_target ?? [];
          const needsTarget = a.action_code === "reject_to_step" && allowTarget.length > 0;

          return (
            <div key={a.id} className="flex flex-col gap-2">
              {needsTarget && (
                <div>
                  <Label className="text-xs mb-1 block">Kembalikan ke:</Label>
                  <select
                    value={targetStatus}
                    onChange={e => setTargetStatus(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm"
                  >
                    <option value="">Pilih tujuan pengembalian...</option>
                    {allowTarget.map(t => (
                      <option key={t} value={t}>{STATUS_LABELS[t] ?? t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                {needsReason && (
                  <input
                    type="text"
                    placeholder="Alasan penolakan (wajib)..."
                    value={alasan}
                    onChange={e => setAlasan(e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm min-w-[220px]"
                  />
                )}
                <Button
                  variant={isDestructive ? "destructive" : "default"}
                  disabled={
                    loading !== null ||
                    (needsReason && !alasan.trim()) ||
                    (needsTarget && !targetStatus)
                  }
                  onClick={() => execute(a.action_code)}
                >
                  {loading === a.action_code ? "Memproses..." : a.label}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/workflow/execute-action.ts src/components/workflow/ActionButtons.tsx
git commit -m "feat: add target role dropdown for reject_to_step action (FR-WF-04)"
```

---

### Task B4: Lupa Password Flow

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/actions/auth.ts`
- Modify: `src/app/(auth)/lupa-password/page.tsx`
- Create: `src/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Read schema.prisma to find the User model**

```bash
grep -n "model User" prisma/schema.prisma
# Note the line number, then read ~20 lines around it
```

- [ ] **Step 2: Add reset token fields to User model**

In `prisma/schema.prisma`, inside the `User` model, add after existing fields:

```prisma
  password_reset_token   String?   @unique @map("password_reset_token")
  password_reset_expires DateTime? @map("password_reset_expires")
```

- [ ] **Step 3: Push schema to DB and regenerate client**

```bash
npx prisma db push
npx prisma generate
# Expected: "Your database is now in sync with your Prisma schema."
```

- [ ] **Step 4: Read `src/actions/auth.ts` to understand current structure**

```bash
cat src/actions/auth.ts
```

- [ ] **Step 5: Add `requestPasswordReset` and `resetPassword` to `src/actions/auth.ts`**

Add these two exports at the bottom of the file. Add imports at the top if not already there:
```typescript
import crypto from "crypto";
import bcrypt from "bcryptjs";
```

Then append:

```typescript
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  // Silently return if not found — do not reveal user existence
  if (!user || !user.is_active) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  await prisma.user.update({
    where: { id: user.id },
    data: { password_reset_token: token, password_reset_expires: expires },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${base}/reset-password?token=${token}`;
  // Console log for admin to relay manually. Replace with SMTP call once configured.
  console.log(`[SILA RESET] Reset link untuk ${normalized}: ${resetUrl}`);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  if (!token) throw new Error("ERR_VAL_REQUIRED_FIELD: Token wajib");
  if (!newPassword || newPassword.length < 8) {
    throw new Error("ERR_VAL_MIN_LENGTH: Password baru minimal 8 karakter");
  }

  const user = await prisma.user.findFirst({
    where: {
      password_reset_token: token,
      password_reset_expires: { gt: new Date() },
    },
  });
  if (!user) throw new Error("ERR_AUTH_TOKEN_INVALID: Token tidak valid atau sudah kedaluwarsa");

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password_hash: hash, password_reset_token: null, password_reset_expires: null },
  });
}
```

- [ ] **Step 6: Read then replace `src/app/(auth)/lupa-password/page.tsx`**

```bash
cat src/app/(auth)/lupa-password/page.tsx
```

Replace with:

```typescript
"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Permintaan Diterima</h2>
        <p className="text-sm text-muted-foreground">
          Jika email Anda terdaftar, link reset password telah dikirim. Bila tidak menerima email
          dalam beberapa menit, hubungi administrator sistem.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          ← Kembali ke login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Lupa Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Masukkan email akun Anda. Link reset akan dikirim jika email terdaftar.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="email@uinbanten.ac.id"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Memproses..." : "Kirim Link Reset"}
        </Button>
        <p className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">← Kembali ke login</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/app/(auth)/reset-password/page.tsx`**

```typescript
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-destructive text-sm">Token tidak ditemukan atau tidak valid.</p>
        <Link href="/lupa-password" className="text-sm text-primary hover:underline">
          Minta link reset baru
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== konfirmasi) { setError("Password tidak cocok"); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, password);
      router.push("/login?reset=success");
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-1">Masukkan password baru Anda.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="password">Password Baru</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="konfirmasi">Konfirmasi Password</Label>
          <Input
            id="konfirmasi"
            type="password"
            value={konfirmasi}
            onChange={e => setKonfirmasi(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

- [ ] **Step 8: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 9: Commit**

```bash
git add prisma/schema.prisma src/actions/auth.ts src/app/(auth)/lupa-password/page.tsx src/app/(auth)/reset-password/page.tsx
git commit -m "feat: implement password reset flow with token — lupa password + reset page (FR-AUTH-03)"
```

---

## PHASE C: UX & Hardening

### Task C1: Eligibility Check UI

**Files:**
- Create: `src/lib/eligibility.ts`
- Modify: `src/app/(dashboard)/pengajuan/baru/page.tsx`

- [ ] **Step 1: Create `src/lib/eligibility.ts`**

```typescript
import { prisma } from "@/lib/prisma";

export type EligibilityResult = {
  eligible: boolean;
  reason?: string;
};

export async function checkLayananEligibility(
  mahasiswaId: number,
  statusMahasiswa: string,
  kode: string
): Promise<EligibilityResult> {
  switch (kode) {
    case "TA-01": {
      if (statusMahasiswa !== "aktif") return { eligible: false, reason: "Status mahasiswa harus aktif" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-01" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-01 aktif" };
      return { eligible: true };
    }
    case "TA-02": {
      const done = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-01" }, status: "selesai" },
      });
      if (!done) return { eligible: false, reason: "Pengajuan Judul Skripsi (TA-01) harus selesai terlebih dahulu" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-02" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-02 aktif" };
      return { eligible: true };
    }
    case "TA-03": {
      const done = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-02" }, status: "selesai" },
      });
      if (!done) return { eligible: false, reason: "SK Pembimbing (TA-02) harus selesai terlebih dahulu" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-03" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-03 aktif" };
      return { eligible: true };
    }
    case "TA-04": {
      const ta03 = await prisma.pengajuanLayanan.findFirst({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-03" }, status: "selesai" },
      });
      if (!ta03) return { eligible: false, reason: "Seminar Proposal (TA-03) harus selesai terlebih dahulu" };
      const hasil = await prisma.nilaiSidang.findFirst({
        where: { pengajuan_id: ta03.id },
        orderBy: { input_at: "desc" },
      });
      if (!hasil || hasil.keputusan !== "layak") {
        return { eligible: false, reason: "Hasil Seminar Proposal harus LAYAK" };
      }
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-04" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-04 aktif" };
      return { eligible: true };
    }
    case "TA-05": {
      const ta04 = await prisma.pengajuanLayanan.findFirst({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-04" }, status: "selesai" },
      });
      if (!ta04) return { eligible: false, reason: "Ujian Komprehensif (TA-04) harus selesai terlebih dahulu" };
      const hasilKomp = await prisma.nilaiSidang.findFirst({
        where: { pengajuan_id: ta04.id },
        orderBy: { input_at: "desc" },
      });
      if (!hasilKomp || hasilKomp.keputusan !== "lulus") {
        return { eligible: false, reason: "Ujian Komprehensif harus LULUS" };
      }
      const ta06Done = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-06" }, status: "selesai" },
      });
      if (!ta06Done) return { eligible: false, reason: "Cek Turnitin (TA-06) harus selesai terlebih dahulu" };
      const active = await prisma.pengajuanLayanan.count({
        where: { mahasiswa_id: mahasiswaId, jenis_layanan: { kode: "TA-05" }, status: { notIn: ["selesai", "terminated"] } },
      });
      if (active > 0) return { eligible: false, reason: "Sudah ada pengajuan TA-05 aktif" };
      return { eligible: true };
    }
    case "TA-06":
      if (statusMahasiswa !== "aktif") return { eligible: false, reason: "Status mahasiswa harus aktif" };
      return { eligible: true };
    case "AK-03":
      if (!["alumni", "keluar", "do"].includes(statusMahasiswa)) {
        return { eligible: false, reason: "Hanya untuk alumni atau mahasiswa berstatus keluar/DO" };
      }
      return { eligible: true };
    case "AK-01":
    case "AK-02":
    case "AK-04":
    case "AK-05":
    case "AK-06":
      if (statusMahasiswa !== "aktif") return { eligible: false, reason: "Status mahasiswa harus aktif" };
      return { eligible: true };
    case "AK-07":
      if (!["aktif", "alumni"].includes(statusMahasiswa)) {
        return { eligible: false, reason: "Status mahasiswa harus aktif atau alumni" };
      }
      return { eligible: true };
    default:
      return { eligible: true };
  }
}
```

- [ ] **Step 2: Read `/pengajuan/baru/page.tsx` to understand current card structure**

```bash
cat src/app/(dashboard)/pengajuan/baru/page.tsx
```

- [ ] **Step 3: Add eligibility check and disabled card UI to `/pengajuan/baru/page.tsx`**

Add import at top:
```typescript
import { checkLayananEligibility } from "@/lib/eligibility";
```

After fetching `user` and determining it's mahasiswa, add eligibility map:
```typescript
// Build eligibility map — only for mahasiswa role
const eligibilityMap: Record<string, { eligible: boolean; reason?: string }> = {};
if (user?.mahasiswa) {
  const results = await Promise.all(
    layananList.map(l =>
      checkLayananEligibility(user.mahasiswa!.id, user.mahasiswa!.status_mahasiswa, l.kode)
        .then(r => ({ kode: l.kode, ...r }))
    )
  );
  for (const r of results) eligibilityMap[r.kode] = { eligible: r.eligible, reason: r.reason };
}
```

In the card render loop, wrap each card based on eligibility:
```typescript
// For each layanan l in the render:
const elig = user?.mahasiswa ? (eligibilityMap[l.kode] ?? { eligible: true }) : { eligible: true };

// If not eligible, show disabled card:
{!elig.eligible ? (
  <div
    key={l.kode}
    className="rounded-lg border border-dashed p-4 opacity-50 cursor-not-allowed select-none"
    title={elig.reason}
  >
    <p className="font-semibold text-sm">{l.kode} — {l.nama}</p>
    <p className="text-xs text-muted-foreground mt-1">{elig.reason}</p>
  </div>
) : (
  // existing Link + Card component
  <Link key={l.kode} href={`/pengajuan/baru/${l.kode}`}>
    {/* existing card content */}
  </Link>
)}
```

Note: The exact card structure depends on what you find when reading the file. Preserve all existing markup for the enabled state.

- [ ] **Step 4: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/eligibility.ts src/app/(dashboard)/pengajuan/baru/page.tsx
git commit -m "feat: show eligibility status on pengajuan baru cards (FR-WF-02)"
```

---

### Task C2: Version History Toggle

**Files:**
- Modify: `src/app/(dashboard)/pengajuan/[id]/page.tsx`

- [ ] **Step 1: Add `searchParams` to page props and fetch version history**

In the page component signature, add `searchParams`:
```typescript
export default async function PengajuanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ versi?: string }>;
})
```

After fetching `pengajuan`, add:
```typescript
// Fetch version history
const versions = await prisma.pengajuanVersi.findMany({
  where: { pengajuan_id: pengajuan.id },
  orderBy: { versi_ke: "asc" },
  select: { versi_ke: true, data_snapshot: true, dibuat_pada: true },
});

const sp = searchParams ? await searchParams : {};
const selectedVersi = sp.versi ? Number(sp.versi) : null;
const activeSnapshot = selectedVersi
  ? (versions.find(v => v.versi_ke === selectedVersi)?.data_snapshot as Record<string, unknown> | null)
  : null;
```

- [ ] **Step 2: Add version selector UI after the header div**

Add this block after the `<div className="flex items-start justify-between">` section:
```typescript
{versions.length > 1 && (
  <div className="flex items-center gap-2 text-sm flex-wrap">
    <span className="text-muted-foreground text-xs">Versi:</span>
    {versions.map(v => (
      <Link
        key={v.versi_ke}
        href={`/pengajuan/${pengajuan.id}?versi=${v.versi_ke}`}
        className={`px-2 py-0.5 rounded text-xs border transition-colors ${
          selectedVersi === v.versi_ke
            ? "bg-primary text-primary-foreground border-primary"
            : "hover:bg-muted border-border"
        }`}
      >
        v{v.versi_ke}
      </Link>
    ))}
    {selectedVersi && (
      <Link
        href={`/pengajuan/${pengajuan.id}`}
        className="text-xs text-muted-foreground hover:underline"
      >
        (lihat terkini)
      </Link>
    )}
  </div>
)}
```

- [ ] **Step 3: Show snapshot data when older version is selected**

Inside the "Data Pengajuan" section, add above the current data display:
```typescript
{activeSnapshot && (
  <div className="rounded-lg border border-dashed bg-muted/30 p-4 mb-4">
    <p className="text-xs font-medium text-muted-foreground mb-2">
      Data Versi {selectedVersi} (baca saja)
    </p>
    <div className="space-y-1 text-sm">
      {Object.entries(activeSnapshot)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => (
          <p key={k} className="text-muted-foreground">
            <span className="font-medium">{k.replace(/_/g, " ")}:</span> {String(v)}
          </p>
        ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/pengajuan/[id]/page.tsx
git commit -m "feat: add version history toggle to pengajuan detail (FR-WF-08, FR-TRACK-04)"
```

---

### Task C3: Auto Logout on Idle

**Files:**
- Create: `src/components/layout/IdleLogout.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create `src/components/layout/IdleLogout.tsx`**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

/** Logs out the user after `timeoutMs` of no keyboard/mouse/touch activity. */
export function IdleLogout({ timeoutMs = 2 * 60 * 60 * 1000 }: { timeoutMs?: number }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => signOut({ callbackUrl: "/login?reason=idle" }),
      timeoutMs
    );
  }

  useEffect(() => {
    reset();
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"] as const;
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
```

- [ ] **Step 2: Read `src/app/(dashboard)/layout.tsx` to find where to insert**

```bash
cat src/app/(dashboard)/layout.tsx
```

- [ ] **Step 3: Add `IdleLogout` to dashboard layout**

Add import:
```typescript
import { IdleLogout } from "@/components/layout/IdleLogout";
```

Inside the layout JSX, add as a sibling of the first child inside the authenticated wrapper:
```typescript
<IdleLogout />
```

- [ ] **Step 4: Read login page and add idle-reason banner**

```bash
cat src/app/(auth)/login/page.tsx
```

If the page is a Server Component, convert the "reason" display to a small client sub-component, or check searchParams server-side. Add at the top of the form/card:

```typescript
// If login page is a Server Component:
import { Suspense } from "react";

// Add a tiny client component for the banner:
// src/components/auth/IdleBanner.tsx (create inline or as separate file)
```

Simplest: create `src/components/auth/IdleBanner.tsx`:
```typescript
"use client";
import { useSearchParams } from "next/navigation";

export function IdleBanner() {
  const sp = useSearchParams();
  if (sp.get("reason") !== "idle") return null;
  return (
    <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
      Sesi Anda berakhir karena tidak ada aktivitas. Silakan login kembali.
    </p>
  );
}
```

In login page, add:
```typescript
import { Suspense } from "react";
import { IdleBanner } from "@/components/auth/IdleBanner";

// In JSX, before the form:
<Suspense fallback={null}>
  <IdleBanner />
</Suspense>
```

- [ ] **Step 5: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/IdleLogout.tsx src/app/(dashboard)/layout.tsx src/components/auth/IdleBanner.tsx src/app/(auth)/login/page.tsx
git commit -m "feat: auto logout after 2 hours idle with session-expired banner (FR-AUTH-04)"
```

---

### Task C4: Atomic Kode Pengajuan

**Files:**
- Modify: `src/actions/pengajuan.ts`

- [ ] **Step 1: Identify all 7 submit functions that generate `kodePengajuan`**

Run:
```bash
grep -n "kodePengajuan\|count + 1" src/actions/pengajuan.ts
# Note line numbers for all 7 occurrences
```

Functions affected: `submitPengajuanTA01`, `submitPengajuanTA02`, `submitPengajuanTA03`, `submitPengajuanTA04`, `submitPengajuanTA05`, `submitPengajuanTA06`, `submitPengajuanAK`.

- [ ] **Step 2: For each submit function, replace count-based kode with ID-based generation**

**Pattern to apply in each function:**

REMOVE these two lines (vary slightly per function):
```typescript
const count = await prisma.pengajuanLayanan.count({ where: { ... } });
const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
```

CHANGE the `prisma.pengajuanLayanan.create` to use a placeholder kode:
```typescript
const pengajuan = await prisma.pengajuanLayanan.create({
  data: {
    kode_pengajuan: "PENDING",
    // ... rest of data unchanged
  },
});
```

ADD after the create call:
```typescript
const tahun = new Date().getFullYear();
const prefix = pengajuan.scope_level === "fakultas" ? "AK" : "TA";
const kodePengajuan = `${prefix}-${tahun}-${String(pengajuan.id).padStart(5, "0")}`;
await prisma.pengajuanLayanan.update({
  where: { id: pengajuan.id },
  data: { kode_pengajuan: kodePengajuan },
});
```

For `submitPengajuanAK`, use `"AK"` explicitly (it always uses `akPrefix = "AK"`).

- [ ] **Step 3: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/pengajuan.ts
git commit -m "fix: use auto-increment ID for kode pengajuan to eliminate race condition under concurrent load"
```

---

### Task C5: SMTP Password Encryption

**Files:**
- Create: `src/lib/crypto.ts`
- Modify: `src/actions/admin.ts`
- Modify: `.env` / `.env.local`

- [ ] **Step 1: Generate ENCRYPTION_KEY and add to `.env`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the 64-character hex output
```

Add to `.env` (and `.env.local` if exists):
```
ENCRYPTION_KEY=<paste 64-char hex here>
```

Verify `.env` is in `.gitignore`:
```bash
grep "\.env" .gitignore
# Expected: .env or .env* should be listed
```

- [ ] **Step 2: Create `src/lib/crypto.ts`**

```typescript
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm" as const;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string. Set it in .env.");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(":");
  // If not in encrypted format, return as-is (handles legacy plaintext)
  if (parts.length !== 3) return ciphertext;
  const [ivHex, authTagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
```

- [ ] **Step 3: Encrypt smtp_pass on save in `src/actions/admin.ts`**

Add import:
```typescript
import { encrypt } from "@/lib/crypto";
```

In `updateConfig`, change the `smtp_pass` entry:
```typescript
// BEFORE:
{ key: "smtp_pass", value: formData.get("smtp_pass") as string },

// AFTER:
{
  key: "smtp_pass",
  value: (() => {
    const pass = formData.get("smtp_pass") as string;
    return pass && pass.length > 0 ? encrypt(pass) : pass;
  })(),
},
```

- [ ] **Step 4: TypeScript check + build**

```bash
tsc --noEmit 2>&1 | head -20
npm run build 2>&1 | tail -5
# Expected: no errors
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/crypto.ts src/actions/admin.ts
git commit -m "feat: encrypt SMTP password in app_config using AES-256-GCM"
```

---

## Final Verification

- [ ] **Full TypeScript check**

```bash
cd /home/zhev/myproject/e-layanan && tsc --noEmit 2>&1
# Expected: 0 errors
```

- [ ] **Full build**

```bash
npm run build 2>&1
# Expected: ✓ Compiled successfully, 0 errors, 0 warnings
```

- [ ] **Lint**

```bash
npm run lint 2>&1
# Expected: no ESLint errors or warnings
```

- [ ] **Manual smoke test checklist**

```
Login: aini@student.uinbanten.ac.id / password123
[ ] /pengajuan/1 → visible (own pengajuan)
[ ] /pengajuan/999 → 404 (not own)
[ ] /api/pengajuan/999/pdf → 403 Forbidden
[ ] Login as staff (budi@) → see pengajuan list, click into TA pengajuan → visible
[ ] /pengajuan/baru → TA-02 card disabled if TA-01 not selesai
[ ] /lupa-password → form submits without error, console shows reset URL
[ ] /reset-password?token=invalid → "Token tidak valid"
[ ] Login 6x wrong password from same IP → "Terlalu banyak percobaan"
```

- [ ] **Final commit**

```bash
git add -A
git commit -m "chore: final verification — all security and feature gaps closed (Phase A+B+C)"
```
