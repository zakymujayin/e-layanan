# Fase 6/7 Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyelesaikan sisa Fase 6 (security/validation hardening + admin polish) dan Fase 7 (unit tests, E2E tests, UI polish) tanpa fitur optional Arsitek Dokumen per Role dan Time-Travel View.

**Architecture:** Mulai dari hardening boundary (auth, validation, upload ownership), lalu bangun unit tests untuk core engine (workflow, numbering, auth), jalankan & perbaiki E2E, terakhir UI polish loading/error/responsive states.

**Tech Stack:** Next.js 16 App Router, Prisma 7, Auth.js v5, TypeScript strict, Zod, Vitest, Playwright.

---

## File Map

### Fase 1 — Security & Validation Hardening
| File | Change |
|---|---|
| `src/lib/auth.config.ts` | Tambah rate limit di `authorize` callback |
| `src/app/verifikasi/page.tsx` | Tambah rate limit di verifikasi token |
| `src/actions/pengajuan.ts` | Zod schemas untuk TA-02 s.d. TA-06 + AK generic; refactor manual validation |
| `src/lib/upload.ts` | Perketat `linkDokumenToPengajuan` ownership + pengajuan ownership |
| `src/actions/pengajuan.ts` | `requireRole` guard pada `setJadwalTA03`, `setJadwalKomprehensif`, `setPengujiTA03`, `setPengujiKomprehensif` |

### Fase 2 — Unit Tests (Vitest)
| File | Change |
|---|---|
| `vitest.config.ts` | Create config |
| `src/lib/workflow/__tests__/validate-transition.test.ts` | Test workflow transition logic |
| `src/lib/workflow/__tests__/execute-action.test.ts` | Mock test execute action core paths |
| `src/lib/document/__tests__/numbering.test.ts` | Test nomor surat reservation/activation/void |
| `src/lib/auth/__tests__/check.test.ts` | Test `canAccessPengajuan` scenarios |
| `src/lib/document/__tests__/yudisium.test.ts` | Test yudisium calculation helper |

### Fase 3 — E2E Tests
| File | Change |
|---|---|
| Run existing `e2e/*.spec.ts` | Fix failures |
| `e2e/03-tugas-akhir.spec.ts` | Lengkapi happy path TA-01 |
| `e2e/02-layanan-akademik.spec.ts` | Lengkapi happy path AK-01 |
| `e2e/05-filter-monitoring.spec.ts` | Perbaiki jika gagal |

### Fase 4 — UI Polish
| File | Change |
|---|---|
| `src/components/workflow/ActionButtons.tsx` | Loading state saat action |
| `src/components/pengajuan/StatusBadge.tsx` | Tambah `aria-label` |
| `src/app/(dashboard)/pengajuan/page.tsx` | Loading skeleton untuk list |
| `src/app/(dashboard)/pengajuan/[id]/page.tsx` | Error boundary / not found handling |
| Global form components | Consistent disabled + loading states |

---

## Fase 1: Security & Validation Hardening

### Task 1.1: Rate limiter di login

**Files:**
- Modify: `src/lib/auth.config.ts`

- [ ] **Step 1: Import rate limiter**

```typescript
import { isRateLimited } from "@/lib/rate-limit";
```

- [ ] **Step 2: Tambah rate limit di authorize callback**

Di dalam `authorize` callback, sebelum validasi credential:

```typescript
const identifier = credentials?.identifier as string | undefined;
const ipKey = `login:${identifier ?? "anon"}`;
if (isRateLimited(ipKey, 5, 15 * 60 * 1000)) {
  throw new Error("ERR_RATE_LIMIT: Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
}
```

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.config.ts
git commit -m "feat: add login rate limiting"
```

### Task 1.2: Rate limiter di verifikasi dokumen

**Files:**
- Modify: `src/app/verifikasi/page.tsx`

- [ ] **Step 1: Tambah rate limit di server-side handler**

Cari bagian pengecekan token (server component / form action), tambahkan:

```typescript
import { isRateLimited } from "@/lib/rate-limit";

const token = searchParams.token as string;
if (isRateLimited(`verify:${token ?? "anon"}`, 10, 60 * 1000)) {
  return <p className="text-destructive">Terlalu banyak percobaan verifikasi.</p>;
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/verifikasi/page.tsx
git commit -m "feat: add verification rate limiting"
```

### Task 1.3: Zod validation untuk TA-02 s.d. TA-06 dan AK generic

**Files:**
- Modify: `src/actions/pengajuan.ts`

- [ ] **Step 1: Definisikan schemas**

```typescript
const TA02Schema = z.object({
  dokumen_ids: z.string().optional(),
});

const TA03Schema = z.object({
  dokumen_ids: z.string().optional(),
});

const TA04Schema = z.object({
  dokumen_ids: z.string().optional(),
});

const TA05Schema = z.object({
  dokumen_ids: z.string().optional(),
});

const TA06Schema = z.object({
  submission_id_turnitin: z.string().min(3, "Submission ID wajib diisi"),
  url_turnitin: z.string().url("URL Turnitin tidak valid"),
  similarity_percentage: z.coerce.number().min(0).max(100, "Similarity harus 0-100"),
  dokumen_ids: z.string().optional(),
});
```

- [ ] **Step 2: Pasang Zod pada masing-masing submit function**

Contoh untuk `submitPengajuanTA02`:

```typescript
const parsed = TA02Schema.safeParse(Object.fromEntries(formData));
if (!parsed.success) {
  throw new Error(`ERR_VAL_INVALID_FORMAT: ${parsed.error.issues[0].message}`);
}
```

Lakukan hal yang sama untuk TA-03, TA-04, TA-05, TA-06, dan AK generic.

- [ ] **Step 3: Hapus manual validation yang redundant**

Untuk TA-06, hapus blok manual `submissionId`, `urlTurnitin`, `similarityPercentage` karena sudah ditangani Zod.
Untuk AK-02, pertahankan conditional PNS validation karena bergantung pada value lain.

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/actions/pengajuan.ts
git commit -m "feat: add Zod validation for TA-02 to TA-06 and AK submissions"
```

### Task 1.4: Perketat upload ownership check

**Files:**
- Modify: `src/lib/upload.ts`

- [ ] **Step 1: Tambah pengajuan ownership check di `linkDokumenToPengajuan`**

```typescript
export async function linkDokumenToPengajuan(
  dokumenIds: number[],
  pengajuanId: number,
  uploadedBy: number
) {
  if (dokumenIds.length === 0) return;

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    select: { mahasiswa_id: true },
  });
  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND: Pengajuan tidak ditemukan");

  const uploader = await prisma.user.findUnique({
    where: { id: uploadedBy },
    select: { mahasiswa_id: true, system_role: true },
  });
  if (!uploader) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  if (uploader.system_role !== "super_admin" && uploader.mahasiswa_id !== pengajuan.mahasiswa_id) {
    throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Bukan pemilik pengajuan");
  }

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

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/upload.ts
git commit -m "feat: tighten upload ownership checks"
```

### Task 1.5: Role guard pada helper set jadwal/penguji

**Files:**
- Modify: `src/actions/pengajuan.ts`

- [ ] **Step 1: Tambah `requireRole` call di helper-helper berikut**

Pastikan setiap helper berikut memanggil `await requireRole(userId, ["staff_prodi"])` atau role yang sesuai:
- `setJadwalTA03` → staff_prodi
- `setJadwalKomprehensif` → staff_prodi
- `setPengujiTA03` → sekprodi
- `setPengujiKomprehensif` → sekprodi
- `setPembimbingTA02` → sekprodi
- `setMajelisTA05` → sekprodi

- [ ] **Step 2: Type check & build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero errors, build success.

- [ ] **Step 3: Commit**

```bash
git add src/actions/pengajuan.ts
git commit -m "feat: add role guards to schedule and examiner helpers"
```

---

## Fase 2: Unit Tests (Vitest)

### Task 2.1: Setup Vitest config

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest config**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

- [ ] **Step 2: Install missing dev deps**

Run: `npm install --save-dev @vitejs/plugin-react vite-tsconfig-paths jsdom`

- [ ] **Step 3: Create test setup**

Create: `src/test/setup.ts`

```typescript
import { vi } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));
```

- [ ] **Step 4: Add test script**

Modify `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json
git commit -m "chore: setup vitest for unit testing"
```

### Task 2.2: Unit test validate-transition

**Files:**
- Create: `src/lib/workflow/__tests__/validate-transition.test.ts`

- [ ] **Step 1: Write tests**

Test cases minimal:
- Valid transition returns target status.
- Invalid action throws ERR_BUS_INVALID_ACTION.
- Invalid state throws ERR_BUS_INVALID_STATE_TRANSITION.
- Actor type returned correctly.

- [ ] **Step 2: Run test**

Run: `npx vitest run src/lib/workflow/__tests__/validate-transition.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/workflow/__tests__/validate-transition.test.ts
git commit -m "test: add validate-transition unit tests"
```

### Task 2.3: Unit test numbering

**Files:**
- Create: `src/lib/document/__tests__/numbering.test.ts`

- [ ] **Step 1: Write tests**

Test cases:
- `reserveNomorSurat` generates formatted number.
- `activateNomorSurat` updates status to active.
- `voidNomorSurat` updates status to void.
- Reserved number format matches FUDA pattern.

- [ ] **Step 2: Run test**

Run: `npx vitest run src/lib/document/__tests__/numbering.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/document/__tests__/numbering.test.ts
git commit -m "test: add document numbering unit tests"
```

### Task 2.4: Unit test auth check

**Files:**
- Create: `src/lib/auth/__tests__/check.test.ts`

- [ ] **Step 1: Write tests**

Test cases:
- Mahasiswa can access own pengajuan.
- Mahasiswa cannot access others.
- Staff prodi can access prodi-scoped pengajuan.
- Super admin can access all.
- Dosen PA / pembimbing / penguji can access assigned pengajuan.

- [ ] **Step 2: Run test**

Run: `npx vitest run src/lib/auth/__tests__/check.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth/__tests__/check.test.ts
git commit -m "test: add auth check unit tests"
```

### Task 2.5: Unit test yudisium calculation

**Files:**
- Create: `src/lib/document/__tests__/yudisium.test.ts`
- Create/modify: `src/lib/document/yudisium.ts` if helper belum ada

- [ ] **Step 1: Extract yudisium logic ke helper**

Jika perhitungan yudisium masih inline di template/context-builder, ekstrak ke:

```typescript
export function hitungYudisium(ipk: number): string {
  if (ipk >= 3.51) return "Pujian";
  if (ipk >= 3.01) return "Sangat Memuaskan";
  if (ipk >= 2.76) return "Memuaskan";
  return "Tidak Memuaskan";
}
```

- [ ] **Step 2: Write tests**

Test cases untuk setiap range IPK.

- [ ] **Step 3: Run test**

Run: `npx vitest run src/lib/document/__tests__/yudisium.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/document/yudisium.ts src/lib/document/__tests__/yudisium.test.ts
git commit -m "test: add yudisium calculation unit tests"
```

---

## Fase 3: E2E Tests

### Task 3.1: Jalankan existing E2E tests

- [ ] **Step 1: Start dev server**

Pastikan server berjalan di port 3003:

```bash
npm run dev
```

Di terminal terpisah:

```bash
npm run test:e2e
```

- [ ] **Step 2: Catat failures**

Simpan daftar test yang gagal beserta error message.

### Task 3.2: Fix failing E2E tests

**Files:**
- Modify: file-file `e2e/*.spec.ts` yang gagal
- Modify: kode sumber jika failure disebabkan bug

- [ ] **Step 1: Perbaiki selector / timing**

Tambahkan `await page.waitForLoadState("networkidle")` atau tunggu elemen spesifik sebelum assertion.

- [ ] **Step 2: Perbaiki bug yang ditemukan E2E**

Jika ada bug fungsional, perbaiki kode sumber.

- [ ] **Step 3: Re-run E2E**

Run: `npm run test:e2e`
Expected: existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add e2e/
git commit -m "test: fix existing E2E tests"
```

### Task 3.3: Tambah happy path TA-01 E2E

**Files:**
- Modify: `e2e/03-tugas-akhir.spec.ts`

- [ ] **Step 1: Write test login mahasiswa → submit TA-01 → logout → login staff prodi approve → login WD1 sign**

Gunakan helper `login` dan `workflow` yang sudah ada.

- [ ] **Step 2: Run test**

Run: `npx playwright test e2e/03-tugas-akhir.spec.ts --project=chromium`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/03-tugas-akhir.spec.ts
git commit -m "test: add TA-01 happy path E2E"
```

### Task 3.4: Tambah happy path AK-01 E2E

**Files:**
- Modify: `e2e/02-layanan-akademik.spec.ts`

- [ ] **Step 1: Write test login mahasiswa → submit AK-01 → logout → login staff akademik approve → login kabag sign**

- [ ] **Step 2: Run test**

Run: `npx playwright test e2e/02-layanan-akademik.spec.ts --project=chromium`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/02-layanan-akademik.spec.ts
git commit -m "test: add AK-01 happy path E2E"
```

---

## Fase 4: UI Polish

### Task 4.1: Loading states di ActionButtons

**Files:**
- Modify: `src/components/workflow/ActionButtons.tsx`

- [ ] **Step 1: Tambah pending state pada setiap action**

Gunakan `useTransition` atau `useState` untuk set tombol menjadi `disabled` dan tampilkan spinner saat action diproses.

```tsx
const [isPending, startTransition] = useTransition();

<Button disabled={isPending} onClick={() => startTransition(() => handleAction("approve"))}>
  {isPending ? "Memproses..." : "Setujui"}
</Button>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/workflow/ActionButtons.tsx
git commit -m "ui: add loading state to workflow action buttons"
```

### Task 4.2: Accessibility di StatusBadge

**Files:**
- Modify: `src/components/pengajuan/StatusBadge.tsx`

- [ ] **Step 1: Tambah aria-label dan semantic role**

```tsx
<span aria-label={`Status: ${label}`} role="status">{label}</span>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/pengajuan/StatusBadge.tsx
git commit -m "a11y: improve StatusBadge accessibility"
```

### Task 4.3: Loading skeleton untuk list pengajuan

**Files:**
- Create: `src/components/pengajuan/PengajuanListSkeleton.tsx`
- Modify: `src/app/(dashboard)/pengajuan/loading.tsx`

- [ ] **Step 1: Buat skeleton component**

```tsx
export function PengajuanListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Gunakan di loading.tsx**

```tsx
import { PengajuanListSkeleton } from "@/components/pengajuan/PengajuanListSkeleton";

export default function Loading() {
  return <PengajuanListSkeleton />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/pengajuan/PengajuanListSkeleton.tsx src/app/(dashboard)/pengajuan/loading.tsx
git commit -m "ui: add loading skeleton for pengajuan list"
```

### Task 4.4: Consistent form loading states

**Files:**
- Modify: semua form submit pages di `src/app/(dashboard)/pengajuan/baru/**/page.tsx`

- [ ] **Step 1: Tambah `disabled={isPending}` dan loading text pada tombol submit**

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/pengajuan/baru/
git commit -m "ui: consistent loading states on submission forms"
```

### Task 4.5: Error handling konsisten

**Files:**
- Modify: `src/actions/pengajuan.ts`, form pages

- [ ] **Step 1: Pastikan semua server action melempar error dengan prefix yang jelas**

Contoh: `ERR_VAL_...`, `ERR_AUTH_...`, `ERR_BUS_...`.

- [ ] **Step 2: Pastikan client menangkap dan tampilkan error via toast atau inline**

- [ ] **Step 3: Commit**

```bash
git add src/actions/pengajuan.ts src/app/(dashboard)/pengajuan/baru/
git commit -m "fix: consistent error handling on submission forms"
```

---

## Final Verification

- [ ] Run unit tests: `npm run test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run build: `npm run build`
- [ ] Run lint: `npm run lint`

Expected: all green.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-22-fase-6-7-completion.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
