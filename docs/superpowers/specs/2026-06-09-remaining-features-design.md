# Remaining Features Design Spec
**Date:** 2026-06-09
**Features:** SLA Timer + Bypass PA, Email Notifikasi, Bulk Import User, Semester Selector

---

## 1. SLA Timer + Bypass PA (FR-WF-06 + FR-WF-07)

### Architecture

Two-part implementation:

**a) Schedule creation** (`src/lib/workflow/execute-action.ts`)

When `executeWorkflowAction` advances a pengajuan to a new step, check if that step has `sla_days`. If yes, create a `SlaSchedule` record:
- `deadline = now + sla_days * 24 hours` (calendar days, not working days — simpler and sufficient)
- `consequence = step.sla_consequence` (`"reminder"` or `"bypass"`)
- `is_triggered = false`

Delete any existing untriggered `SlaSchedule` for the same `pengajuan_id` + `step_code` before creating (prevents duplicates on re-entry).

**b) Cron checker** (`src/lib/sla-checker.ts` + `src/app/api/cron/route.ts`)

`sla-checker.ts` exports `runSlaCheck(): Promise<{ triggered: number; errors: number }>`:
1. Query all `SlaSchedule` where `deadline < now` and `is_triggered = false`, include `pengajuan.jenis_layanan`, `pengajuan.mahasiswa`
2. For each record:
   - `"reminder"`: find actor's user(s) for the step, call `createNotification` + `sendEmail` (fire-and-forget), mark `is_triggered = true`, `triggered_at = now`
   - `"bypass"` (TA-01 step PA only): call internal bypass logic — advance pengajuan to next step, create `PengajuanLog` with `action_code = "bypass"`, generate bypass PDF via `generateAndStoreDokumen` with `jenis = "surat_tugas"`, mark triggered
3. Return counts

`POST /api/cron/route.ts`:
- Validate `X-Cron-Secret` header against `process.env.CRON_SECRET`
- Return 401 if missing/wrong
- Call `runSlaCheck()`
- Return JSON: `{ triggered, errors, timestamp }`

### Env

```
CRON_SECRET=<random 32-char hex>
```

Add to `.env`.

### Actor Resolution for Reminder

For `"reminder"`, find user to notify based on step `actor_type`:
- `staff_prodi` / `staff_akademik` / `kabag`: query all users with that `system_role`
- `kaprodi` / `sekprodi` / `wakil_dekan_1` / `dekan` / `kepala_lab`: query `StructuralPosition` with `position_code = actor_type, is_active = true` → get dosen → get user
- `dosen_pa`: query `PengajuanData.field_values.pa_dosen_id` → get user

### Bypass Logic (TA-01 only)

When `consequence = "bypass"` triggers:
1. Find next step after current `step_code`
2. Update `pengajuan.status` and `pengajuan.current_step_code` to next step
3. Create `PengajuanLog` (`action_code = "bypass"`, `performed_by = 0` as system)
4. Create in-app notification to mahasiswa: "PA tidak merespons dalam 7 hari — pengajuan dilanjutkan otomatis"

Note: No PDF is generated at bypass time. The final surat_tugas for TA-01 is generated at `sign → selesai` as normal. `bypass-judul.ts` template is for on-demand draft preview only, not stored output.

### Crontab Setup

```bash
# Edit crontab: crontab -e
*/30 * * * * curl -s -o /dev/null -H "X-Cron-Secret: YOUR_CRON_SECRET" http://localhost:3003/api/cron
```

---

## 2. Email Notifikasi (FR-NOTIF-03)

### Dependencies

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### `src/lib/email.ts`

```typescript
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export async function sendEmail(to: string, subject: string, html: string): Promise<void>
```

Implementation:
1. Fetch SMTP config from `app_config` table (keys: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_from`)
2. If any required key is missing/empty → silent return (SMTP not configured)
3. Decrypt `smtp_pass` using `decrypt()` from `crypto.ts`
4. Create Nodemailer transporter with `{ host, port: Number(port), secure: port === "465", auth: { user, pass } }`
5. Send via `transporter.sendMail({ from, to, subject, html })`
6. On error: `console.error("[Email]", err)` — never throw (email must not crash workflow)

### Integration Point

In `src/lib/notification.ts`, after the existing `prisma.notification.create`, add fire-and-forget:

```typescript
// After creating notification:
if (notifData.user_id) {
  getUserEmail(notifData.user_id)
    .then(email => {
      if (email) return sendEmail(email, notifData.title, buildEmailHtml(notifData));
    })
    .catch(() => {});
}
```

`getUserEmail(userId)` → simple Prisma query for `user.email`.

`buildEmailHtml(notif)` → minimal HTML template with: title, message, optional link button to `/pengajuan/{entity_id}` if `entity_type === "pengajuan"`.

### Email HTML Template

Simple, no external CSS framework:
```
[Logo/App Name]
---
{title}
{message}
[Lihat Pengajuan →] (button, only if entity_type = "pengajuan")
---
SILA — Sistem Layanan Akademik
```

---

## 3. Bulk Import User (FR-USER-04)

### New Page

`src/app/(dashboard)/admin/users/import/page.tsx` (Server Component with Client upload form)

### CSV Format

```
email,password,system_role,nama_lengkap,identifier,prodi_kode
aini@student.uinbanten.ac.id,password123,mahasiswa,Aini Nurul,20210101001,TI
budi@dosen.uinbanten.ac.id,password123,dosen,Dr. Budi Santoso,0012345678,TI
```

- `identifier` = NIM for mahasiswa, NIDN for dosen, NIP for pegawai
- `prodi_kode` = required for mahasiswa/dosen, optional for pegawai/admin roles
- `password` = plain text in CSV → hashed with bcrypt on import

### Server Action: `importUsersFromCsv`

`src/actions/admin.ts` — add `importUsersFromCsv(formData: FormData)`:
1. Auth check: only `super_admin`
2. Read CSV file from `formData.get("file")`
3. Parse lines: skip header, split by comma, trim
4. For each row: validate required fields, check email uniqueness
5. Upsert: create `User` + corresponding profile record (`Mahasiswa`, `Dosen`, or `Pegawai`) in a `$transaction`
6. Collect results: `{ success: number, failed: Array<{ row: number, email: string, error: string }> }`
7. Return result object (not redirect — show report on same page)

### Template CSV Download

Static file at `public/templates/import-users-template.csv` with header + 2 example rows.

### UI

- Card with description + download template link
- File input (accept `.csv`) + upload button
- After submit: show result table — green rows (success) + red rows (failed with reason)

---

## 4. Semester Selector (FR-ADMIN-06)

### State Storage

Cookie `selected_semester_id` (string, numeric ID). Set via Server Action `setActiveSemester(id: number)`. Readable server-side via `cookies()`.

### Dashboard Layout Changes

`src/app/(dashboard)/layout.tsx`:
1. Read `selected_semester_id` cookie — if none, use active semester from DB
2. Fetch all semesters (last 8, ordered by `tanggal_mulai desc`)
3. Render `SemesterSelector` client component in header/topbar area
4. If selected ≠ active semester → pass `isArchiveMode = true` to layout context

### `SemesterSelector` Component

`src/components/layout/SemesterSelector.tsx` (Client Component):
- Dropdown showing `nama_semester tahun_akademik`
- Active semester tagged "(Aktif)"
- On change: call `setActiveSemester(id)` server action → `revalidatePath("/(dashboard)")`

### Archive Mode Banner

When `isArchiveMode = true`, show banner below topbar:
```
⚠ Mode Arsip — Semester Genap 2024/2025. Data read-only.
```
Amber background, full width.

### Semester-Aware Pages

Two pages need to filter by semester:
1. `pengajuan/page.tsx` — already has semester filter via `searchParams`. Change default from "all" to `selected_semester_id` cookie value.
2. `admin/monitoring/page.tsx` — add semester filter to counts query.

Other pages (arsip, surat-saya, detail) are not semester-scoped — they show data regardless.

### Read-Only Enforcement

Banner only — no server-side mutation blocking. Rationale: mutations already have their own workflow validation; blocking based on semester cookie would add complexity without real benefit (staff can always switch back to active semester).

---

## File Map

| File | Action |
|------|--------|
| `src/lib/sla-checker.ts` | **Create** |
| `src/app/api/cron/route.ts` | **Create** |
| `src/lib/workflow/execute-action.ts` | Modify — add SLA schedule creation |
| `src/lib/email.ts` | **Create** |
| `src/lib/notification.ts` | Modify — fire-and-forget email after create |
| `src/actions/admin.ts` | Modify — add `importUsersFromCsv`, `setActiveSemester` |
| `src/app/(dashboard)/admin/users/import/page.tsx` | **Create** |
| `public/templates/import-users-template.csv` | **Create** |
| `src/components/layout/SemesterSelector.tsx` | **Create** |
| `src/app/(dashboard)/layout.tsx` | Modify — add SemesterSelector + archive banner |
| `src/app/(dashboard)/pengajuan/page.tsx` | Modify — default semester from cookie |
| `src/app/(dashboard)/admin/monitoring/page.tsx` | Modify — semester-aware counts |

---

## Non-Goals

- Working-day calculation for SLA (calendar days are sufficient)
- Email queue / retry mechanism (fire-and-forget with silent fail)
- XLSX support for bulk import
- Read-only enforcement via server-side mutation blocking (banner only)
- Email unsubscribe / preference settings
