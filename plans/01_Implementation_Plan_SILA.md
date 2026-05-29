# Implementation Plan — SILA (E-Layanan)

**Sistem**: Sistem Informasi Layanan Akademik
**Versi Plan**: 1.0
**Tanggal**: 29 Mei 2026
**Status**: Approved

---

## Referensi Dokumen

| Ref | Dokumen |
|---|---|
| [INV] | `docs/01_Inventarisasi_Layanan.md` |
| [AK] | `docs/02_Aturan_Akademik_Layanan.md` |
| [BPMN-*] | `docs/03_BPMN_*.md` (6 TA + 1 AK) |
| [KON-1] | `docs/04_Konvensi_Glossary_Batch_1.md` |
| [KON-2] | `docs/04_Konvensi_Glossary_Batch_2.md` |
| [KON-3] | `docs/04_Konvensi_Glossary_Batch_3.md` |
| [KON-4] | `docs/04_Konvensi_Glossary_Batch_4.md` |
| [SRS] | `docs/05_SRS_Software_Requirements_Specification.md` |
| [UC] | `docs/06_Use_Case_Diagram_Specification.md` |
| [ERD] | `docs/07_ERD_Database_Design.md` |
| [ARCH] | `docs/08_Software_Architecture.md` |
| [API] | `docs/09_API_Specification.md` |
| [TEST] | `docs/10_Test_Plan.md` |
| [TPL] | `docs/11_Spesifikasi_Template_PDF.md` |
| [SEED] | `docs/12_Seed_Data_Workflow.md` |
| [WIRE] | `docs/13_Wireframe_UI.md` |
| [GAP] | `docs/14_Gap_Analysis.md` |
| [TPL-SRC] | `docs/templates-blade/templates/` (14 file Blade PHP) |

---

## Tech Stack Final

| Komponen | Versi / Library |
|---|---|
| Framework | Next.js 16.2.x (App Router) |
| Runtime | Node.js 20+ LTS |
| Language | TypeScript strict mode |
| UI | shadcn/ui (new-york) + Tailwind CSS v4 + lucide-react |
| ORM | Prisma |
| Database | PostgreSQL 16+ |
| Auth | Auth.js v5 (Credentials Provider) |
| Validation | Zod v4 |
| Date | date-fns v4 |
| PDF | Puppeteer (headless Chrome) |
| Test | Vitest (unit/integration) + Playwright (E2E) |

---

## Fase 1: Fondasi — Scaffolding & Infrastruktur

**Tujuan**: App bisa login, dashboard tampil, semua data master siap.

### 1.1 Scaffold Project

```bash
npx create-next-app@latest sila --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"
```

- Install shadcn/ui (style **new-york**)
- Install dependencies: `prisma @prisma/client @auth/prisma-adapter next-auth@beta zod date-fns bcryptjs`
- Install dev dependencies: `@types/bcryptjs vitest @playwright/test`
- Folder structure sesuai [ARCH] §1.3

### 1.2 Database & Prisma Schema

- Setup PostgreSQL database `sila_dev`
- Tulis `prisma/schema.prisma` dari [ERD] — 32 tabel
- Tambahan dari [GAP]:
  - Kolom `action_config JSON` di `workflow_step_actions`
  - Kolom `jenis_kelamin String?` di `mahasiswa`
  - Kolom `tempat_lahir String?` di `mahasiswa`
  - Kolom `tanggal_lahir DateTime?` di `mahasiswa`
- Add indexes dari [ERD]
- `npx prisma migrate dev --name init`

### 1.3 Autentikasi (Auth.js v5)

**Middleware** (`src/middleware.ts`):
- Protect semua route kecuali `/login`, `/register`, `/verifikasi`, `/api/register`

**Login endpoint**: `/api/auth/[...nextauth]/route.ts`

**Login methods**:
- Mahasiswa: NIM atau email + password
- Dosen: NIDN atau email + password
- Pegawai: NIP atau email + password

**Session**: database session, expiry 7 hari rolling, idle timeout 2 jam.

**Halaman**:
- `/login` — form login + lupa password
- `/register` — self-registration mahasiswa

### 1.4 NIM Validator (Abstraction)

Interface di `src/lib/nim-validator/`:
- `types.ts` — `NimValidator` interface: `validate(nim: string): Promise<{ valid: boolean; nama: string; prodi: string; angkatan: number }>`
- `local.ts` — Phase 1 implementation (seed dari data)
- `external.ts` — Phase 2 stub (ganti nanti)

Alur registrasi:
1. Mahasiswa input NIM di `/register`
2. Sistem panggil `nimValidator.validate(nim)`
3. Jika valid → lanjut isi email + password + data dari validator (nama, prodi, angkatan)
4. Akun ter-create dengan `is_active = true` (langsung aktif)

### 1.5 Layout & Komponen Shared

**File**:
- `src/components/layout/Sidebar.tsx` — role-based navigation
- `src/components/layout/Header.tsx` — logo, search, notification bell, avatar
- `src/components/layout/NotificationSheet.tsx` — sheet dari kanan
- `src/components/shared/EmptyState.tsx`
- `src/components/shared/LoadingCard.tsx`
- `src/components/ui/*` — shadcn components (via CLI)

**Komponen shadcn yang dibutuhkan**:
`button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `label`, `form`, `card`, `badge`, `sheet`, `sonner`, `alert-dialog`, `dialog`, `progress`, `skeleton`, `avatar`, `tooltip`, `separator`, `tabs`, `accordion`, `table`, `calendar`

### 1.6 Storage Service

Interface di `src/lib/storage/`:
- `types.ts` — `StorageProvider` interface
- `local.ts` — `LocalStorageProvider` (Phase 1, path `/storage/`)
- Folder structure sesuai [KON-2] §7.3

### 1.7 Seed Data

`prisma/seed.ts`:
- 4 kode klasifikasi ([KON-1] §1.4)
- 1 fakultas (FUDA)
- Dummy prodi (min 2)
- 13 jenis_layanan ([INV] §2)
- Field layanan per service ([AK])
- Dokumen persyaratan per service ([AK])
- 13 workflow definitions + steps + actions ([SEED])
- Dummy users: 1 mahasiswa, 1 staff_prodi, 1 staff_akademik, 1 dosen PA, 1 kaprodi, 1 sekprodi, 1 wd1, 1 dekan, 1 kabag, 1 kepala_lab, 1 super_admin
- Academic period: 1 semester aktif
- Structural positions: isi sesuai dummy users

---

## Fase 2: Workflow Engine + Layanan TA-01

**Tujuan**: TA-01 full end-to-end — mahasiswa submit sampai WD1 sign.

### 2.1 Workflow Execution Engine

`src/lib/workflow/`:

| File | Fungsi | Rujukan |
|---|---|---|
| `execute-action.ts` | Main executor: validasi state + eksekusi + side effects | [BPMN-TA01] |
| `validate-transition.ts` | Validasi state transition per workflow definition | [KON-1] §3.4 |
| `sla-checker.ts` | Cron job — check SLA expired, trigger reminder/bypass | [BPMN-TA01] §TA01-03B |
| `bypass-handler.ts` | Generate bypass form, handle upload | [BPMN-TA01] |

**Flow executeWorkflowAction**:
1. Load pengajuan + current step dari database
2. Validasi action valid untuk step saat ini
3. Validasi actor adalah orang yang tepat
4. Execute dalam database transaction
5. Save action data + update status + create log
6. Trigger side effects (notifikasi, SLA timer, create record)

### 2.2 Authorization

`src/lib/auth/`:

| File | Fungsi |
|---|---|
| `check.ts` | `requireAuth()`, `requireRole(user, ...roles)`, `requireScope(user, resource)`, `requireAssignment(user, pengajuanId, type)` |
| `scope.ts` | `getAccessibleScope(user)` — return scope filter per system role |

### 2.3 Audit Logger

`src/lib/audit/log.ts`:
- `logAudit({ userId?, action, entityType?, entityId?, severity?, metadata?, ipAddress?, userAgent?, requestId? })`
- Action format: `[entity].[action]` (e.g. `pengajuan.submitted`)

### 2.4 Server Actions & API

`src/actions/`:

| File | Actions |
|---|---|
| `auth.ts` | `login`, `logout`, `register`, `resetPassword` |
| `pengajuan.ts` | `submitPengajuan`, `resubmitPengajuan` |
| `workflow.ts` | `executeWorkflowAction` |

`src/app/api/`:

| Endpoint | Fungsi |
|---|---|
| `POST /api/auth/[...nextauth]` | Auth.js handler |
| `POST /api/pengajuan/[id]/dokumen` | Upload file (multipart) |
| `GET /api/pengajuan/[id]/pdf` | Download PDF preview/final |
| `GET /api/files/[...path]` | Serve protected files |

### 2.5 Form Submit TA-01

**Halaman**: `/pengajuan/baru/TA-01`

**Komponen**:
- `PengajuanForm.tsx` — form builder berdasarkan `field_layanan`
- `FileUpload.tsx` — drag-drop upload dengan progress
- Validasi: Zod schema + file size/type check

**Logic submit** ([BPMN-TA01] §TA01-01):
1. Validate eligibility: mahasiswa aktif, tidak ada TA-01 aktif, semester aktif
2. Save input data ke `pengajuan_data`
3. Save uploaded files ke `/storage/pengajuan/{period_id}/{id}/uploads/`
4. Reserve nomor surat (Srikandi pattern)
5. Create `dosen_pa` assignment
6. Create `pengajuan_versi` v1
7. Status → `pending_staff_prodi`
8. Notifikasi ke Staff Prodi prodi terkait

### 2.6 Halaman Detail Pengajuan

**Halaman**: `/pengajuan/[id]`

**Komponen**:
- `ProgressBar.tsx` — step indikator (✅/⏰/⬜)
- `ActivityTimeline.tsx` — kronologi dari `pengajuan_log`
- `StatusBadge.tsx` — badge warna semantik
- `ActionButtons.tsx` — tombol action sesuai role + step

### 2.7 Dashboard Multi-Role

**Halaman**: `/dashboard`

**Komponen per role** ([WIRE] §2):
- Stat cards (max 4, clickable, color-coded)
- Unified inbox dengan context badge untuk dosen multi-hat
- "Tugas menunggu" + "Pengajuan aktif" lists
- Filter: status, jenis layanan, semester, search

### 2.8 UI Workflow Actions (TA-01)

| Step | Actor | Actions | Alasan Wajib |
|---|---|---|---|
| `pending_staff_prodi` | Staff Prodi | approve / reject_to_submitter | Reject: Ya |
| `pending_pa` | PA | select_judul (radio button) / reject_to_submitter | Reject: Ya |
| `pending_kaprodi` | Kaprodi | approve / reject_to_step (PA) / reject_to_submitter | Reject: Ya |
| `pending_wd1` | WD1 | sign / reject_to_step (pilih: staff/PA/kaprodi) | Reject: Ya |

**Komponen**:
- `RejectDialog.tsx` — dengan textarea alasan + dropdown target (untuk reject bertingkat)
- `SignConfirmDialog.tsx` — konfirmasi PIN sebelum TTD

### 2.9 Bypass Mechanism

**Cron job** `sla-checker.ts`:
1. Setiap hari 07:00 WIB — cek `sla_schedules` yang deadline < now
2. Jika consequence = `bypass` → `triggerBypass(pengajuanId)`
3. Generate bypass form PDF → save ke storage
4. Status → `bypass_active`
5. Notifikasi ke mahasiswa + PA + staff prodi

**Mahasiswa upload bypass**:
1. Download bypass form → offline ke PA → TTD basah → scan
2. Upload scan + pilih judul yang dipilih PA
3. Status → `pending_kaprodi` (skip PA step)

### 2.10 Notifikasi

`src/lib/notification/send.ts`:

```typescript
sendNotification({ userId, title, message, severity, channels, entityType?, entityId? })
```

- Always save to `notifications` table (in-app)
- If `email` in channels AND user preference on → send email via SMTP
- Template email: hardcoded ([INV] §10)

---

## Fase 3: Layanan TA-02 + TA-03

**Tujuan**: TA-02 dan TA-03 full end-to-end.

### 3.1 TA-02 — SK Pembimbing

**Prasyarat**: TA-01 status `selesai`.

**Submit** ([BPMN-TA02] §TA02-01):
- Auto-fill: judul_skripsi.judul_aktif (read-only)
- Auto-attach: Surat Persetujuan Judul dari TA-01
- Upload: KRS Semester Berjalan
- Reserve nomor SK fakultas (kode KP.01.2, scope fakultas)

**Sekprodi step** ([BPMN-TA02] §TA02-03):
- Pilih Pembimbing 1 & 2 (dosen_picker, validasi: berbeda)
- Input nomor surat permohonan prodi (text)
- Input tanggal surat permohonan prodi (date)
- Create assignments: `pembimbing_skripsi_1`, `pembimbing_skripsi_2`

**Output**: SK Pembimbing dengan dual numbering — nomor SK fakultas + nomor surat prodi. TTD Dekan.

### 3.2 TA-03 — Seminar Proposal

**Prasyarat**: TA-02 status `selesai`.

**Submit** ([BPMN-TA03] §TA03-01):
- Auto-fill: data dari TA-01 (judul) + TA-02 (pembimbing)
- Upload 5 dokumen

**Staff Prodi step** ([BPMN-TA03] §TA03-02):
- Verifikasi + penjadwalan dalam **1 step** (combined)
- Input: tanggal_sidang, waktu_mulai, waktu_selesai, ruang_sidang

**Sekprodi step** ([BPMN-TA03] §TA03-03):
- Pilih Penguji 1 & 2 (dosen fakultas, berbeda)
- Create assignments: `penguji_proposal`

**Output**: 3 dokumen dalam 1 file:
1. Surat Tugas Penguji Proposal
2. Berita Acara & Keputusan (template → re-generate setelah nilai input)
3. Daftar Hadir Dewan Penguji

**Post-session** ([BPMN-TA03] §TA03-05):
- Penguji 1 & 2 input nilai + keputusan (LAYAK/TIDAK LAYAK)
- Setelah keduanya input → Berita Acara ter-regenerate

---

## Fase 4: PDF Generation + TTD + QR

### 4.1 Template Konversi (Blade → TypeScript)

`src/lib/document/templates/`:

**Shared partials**:
- `partials/header.ts` — `renderKopSurat(logoSrc)`
- `partials/footer.ts` — `renderFooter(qrcode)`
- `partials/styles.ts` — shared CSS (kop surat, footer, signature)

**Template per layanan** (24 total):

| File | Sumber Blade | Layanan |
|---|---|---|
| `bypass-judul.ts` | `bypass-seleksi-judul.blade.php` | TA-01 bypass |
| `persetujuan-judul.ts` | `template_persetujuan_judul.blade.php` | TA-01 final |
| `sk-pembimbing.ts` | `template_sk_pembimbing.blade.php` | TA-02 |
| `seminar-proposal.ts` | `template_seminar_proposal.blade.php` | TA-03 (3 hal) |
| `ujian-komprehensif.ts` | `template_ujian_komprehensif.blade.php` | TA-04 (5 hal) |
| `ujian-skripsi.ts` | `template_ujian_skripsi.blade.php` | TA-05 (9 hal) |
| `cek-turnitin.ts` | `template_cek_turnitin.blade.php` | TA-06 |
| `aktif-kuliah.ts` | `template_keterangan_aktif_kuliah.blade.php` | AK-01 |
| `masih-kuliah.ts` | `template_keterangan_masih_kuliah.blade.php` | AK-02 |
| `pernah-kuliah.ts` | `template_keterangan_pernah_kuliah.blade.php` | AK-03 |
| `pengantar-observasi.ts` | `template_pengantar_observasi.blade.php` | AK-04 |
| `pengantar-penelitian.ts` | `template_pengantar_penelitian.blade.php` | AK-05 |
| `permohonan-magang.ts` | `template_permohonan_magang.blade.php` | AK-06 |
| `rekomendasi.ts` | `template_rekomendasi.blade.php` | AK-07 |

**Konversi checklist per template**:
- [ ] Ganti `{{ $var ?? 'fallback' }}` → template literal dengan `??`
- [ ] Ganti `@foreach` → `for...of` / `.map()`
- [ ] Ganti `@php @endphp` → function di luar template
- [ ] Ganti `\App\Models\AppSetting::get()` → query Prisma / parameter
- [ ] Ganti `\Carbon\Carbon::parse()->translatedFormat()` → `format()` from date-fns
- [ ] Ganti `\Illuminate\Support\Facades\Storage::disk('public')->url()` → `storageProvider.getServeUrl()`
- [ ] Perbaiki CSS broken di `seminar-proposal` dan `cek-turnitin` ([GAP] §6.6)
- [ ] Tambahkan `@font-face` Bookman Old Style untuk 3 template ([GAP] §6.1)
- [ ] Tambahkan variabel `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir` ([GAP] §6.5)
- [ ] Ekstrak kop surat + footer + CSS ke shared partials

### 4.2 PDF Generator

`src/lib/document/generate-pdf.ts`:

```typescript
export async function generatePdf(html: string, options?: { mode: 'preview' | 'final' }): Promise<Buffer>
```

- Puppeteer launch headless
- Set content HTML → wait network idle
- Print to PDF buffer (A4, printBackground)
- Mode preview: placeholder kuning via `placeholder()` helper
- Mode final: TTD ter-embed, QR code aktif

### 4.3 Context Builder

`src/lib/document/context-builder.ts`:

```typescript
export async function buildDocumentContext(pengajuanId: number, jenisLayananKode: string): Promise<DocumentContext>
```

- Fetch pengajuan + mahasiswa + prodi + semester
- Fetch pejabat aktif (WD1/Dekan/Kepala Lab)
- Fetch logo dari app settings
- Format date, bulan romawi, semester teks

### 4.4 TTD Scan

- Pejabat upload TTD scan via profil → simpan di `/storage/ttd_scan/{user_id}/`
- Saat sign: embed `<img>` TTD scan ke posisi di template
- Konfirmasi PIN sebelum sign

### 4.5 QR Code & Verifikasi

- Generate token 12-16 karakter (`generateVerificationToken()`)
- Generate QR Code URL → embed di footer
- Create record `dokumen_verifikasi` + token
- Halaman publik `/verifikasi` — input token → cek validitas
- Rate limit: 10/menit per IP

### 4.6 Reserved Numbering

- `lib/document/numbering.ts`
- Atomic counter increment dengan `prisma.$transaction`
- Format: `[NO_URUT]/Un.17/F.III/[KODE_KLASIFIKASI]/[BULAN_ROMAWI]/[TAHUN]`
- Status: `reserved` (saat submit) → `active` (saat TTD) → `void` (jika terminated)

---

## Fase 5: Sisa Layanan (TA-04, TA-05, TA-06 + AK-01 s.d. AK-07)

### 5.1 TA-04 — Ujian Komprehensif

- Pola mirip TA-03, perbedaan:
  - Penguji: Keahlian Prodi + Keislaman (bukan Penguji 1&2 biasa)
  - Formula: P = (X1 + X2) / 2
  - Output: 5 halaman dalam 1 file
  - Prasyarat: TA-03 selesai + LAYAK

### 5.2 TA-05 — Ujian Skripsi (Munaqasyah)

- Sekprodi: penjadwalan + 6 dosen majelis dalam 1 step
- Validasi: semua 6 dosen berbeda
- Pembimbing 1&2 auto-fill dari TA-02 (read-only)
- **Sekretaris Sidang** input nilai (bukan penguji masing-masing)
- Auto-calculate yudisium
- Output: 9 halaman dalam 1 file
- TTD final: Dekan
- Prasyarat: TA-04 LULUS + TA-06 selesai

### 5.3 TA-06 — Cek Turnitin

- 1 approver: Kepala Lab
- Maks 3x revisi, similarity default 25% (configurable)
- Jika revisi ke-3 masih gagal → terminated

### 5.4 AK-01 s.d. AK-07

Semua pakai pola: Staff Akademik → Kabag → WD1 atau Dekan.

**Perbedaan per layanan** [BPMN-AK]:
- AK-01: aktif, TTD WD1
- AK-02: aktif, TTD WD1, conditional field PNS
- AK-03: alumni/keluar/DO, TTD Dekan
- AK-04: aktif, TTD WD1, auto-create assignment observasi
- AK-05: aktif, TTD WD1, auto-fill judul
- AK-06: aktif, TTD Dekan, auto-create assignment magang
- AK-07: aktif/alumni, TTD Dekan, conditional dokumen

---

## Fase 6: Admin Panel + Pelengkap

### 6.1 Admin Panel (`/admin/*`)

**Super admin only**.

| Tab | Fitur |
|---|---|
| **User** | CRUD user, assign system role, assign structural position, import bulk Excel |
| **Master Data** | CRUD prodi, dosen, pegawai, mahasiswa (manual) |
| **Layanan** | Kelola field input (drag-drop), dokumen persyaratan, workflow per layanan |
| **Academic Period** | CRUD semester, activate/deactivate |
| **Sistem** | Logo, footer, SMTP config, batas Turnitin |

### 6.2 Arsitektur Dokumen per Role

| Role | Menu | Akses |
|---|---|---|
| Mahasiswa | "Dokumen Saya" | Semua dokumen yang diterbitkan untuk dia |
| Dosen | "Surat & SK Saya" | SK Pembimbing + Surat Tugas + terkait assignment |
| Staff Prodi | "Arsip Prodi" | Semua dokumen TA prodinya |
| Staff Akademik | "Arsip Akademik" | Semua dokumen AK fakultas |
| Kaprodi/Sekprodi | Akses arsip prodi (lengkap) | |
| Kabag | Akses arsip AK fakultas | |
| WD1/Dekan | Akses arsip umum fakultas + yang dia TTD | |

### 6.3 Notifikasi Full

- Template email hardcoded (14 template)
- In-app: Sheet/drawer dari kanan ([WIRE] §1)
- Preferensi user: email On/Off
- Anti-spam: digest mode, quiet hours

### 6.4 Semester Switching

- Auto-switch by date (cron job harian)
- Admin override manual
- Time-travel view (read-only untuk semester lama)

---

## Fase 7: Testing & Polish

### 7.1 Unit Tests (Vitest)

- `src/lib/workflow/validate-transition.test.ts` — semua transisi valid + invalid
- `src/lib/auth/scope.test.ts` — scope filtering per role
- `src/lib/document/numbering.test.ts` — reserved numbering
- `src/lib/workflow/yudisium.test.ts` — kalkulasi yudisium TA-05

### 7.2 Integration Tests

- Setiap API endpoint di `src/app/api/**/*.test.ts`
- Happy path + minimal 1 error scenario per endpoint

### 7.3 E2E Tests (Playwright)

- `tests/e2e/ta-01-full-flow.spec.ts` — happy path TA-01 (5 user login berbeda)
- `tests/e2e/ak-01-full-flow.spec.ts` — happy path AK-01
- `tests/e2e/ta-06-turnitin.spec.ts` — reject → revisi → selesai

### 7.4 Polish Checklist

- [ ] Semua komponen punya loading state (Skeleton)
- [ ] Semua list/tabel punya empty state
- [ ] Semua destructive action punya Alert Dialog konfirmasi
- [ ] Semua form punya inline validation error
- [ ] Responsive: desktop > tablet > mobile
- [ ] Accessibility: label, ARIA, keyboard navigation
- [ ] Warna semantik status sesuai [KON-3] §8.3.3

---

## Timeline Visual

```
Fase 1 ████████░░░░░░░░░░░░░  [Fondasi — scaffold, DB, auth, seed]
Fase 2 ░░░░░░░░████████░░░░░░  [TA-01 — workflow engine + full flow]
Fase 3 ░░░░░░░░░░░░░░████░░░░  [TA-02 + TA-03 — multi-step, multi-doc]
Fase 4 ░░░░░░░░░░░░░░░░░░████  [PDF Gen — template konversi + TTD + QR]
Fase 5 ░░░░░░░░░░░░░░░░░░░░░░  [10 layanan — konfigurasi]
Fase 6 ░░░░░░░░░░░░░░░░░░░░░░  [Admin panel + pelengkap]
Fase 7 ░░░░░░░░░░░░░░░░░░░░░░  [Testing + polish]
```

**Fase 1 → 2 → 3 HARUS sequential** (dependensi). **Fase 4** bisa paralel dengan Fase 3.

---

## Konvensi yang WAJIB Diikuti

Semua code wajib mengacu ke [KON-1] s.d. [KON-4]:

| Konteks | Konvensi |
|---|---|
| Tabel & kolom DB | `snake_case`, plural, bahasa Indonesia untuk domain bisnis |
| Variable & function TS | `camelCase` |
| Komponen React | `PascalCase` |
| File kebab-case | `kebab-case.ts`, `use-name.ts` |
| Enum value | `snake_case` string |
| Boolean | prefix `is`, `has`, `can` |
| Error code | `ERR_[CATEGORY]_[SPECIFIC]` |
| API response | `{ success, data, error, meta }` |
| HTTP status | 200, 201, 400, 401, 403, 404, 409, 422, 429, 500 |
| Date display | `d MMMM yyyy` (Bahasa Indonesia) |
| Timezone | Database: UTC, Display: WIB |
| Audit log | `logAudit()` untuk setiap action sensitif |
| UI text | Bahasa Indonesia |

---

## Action Items untuk Agent

1. [ ] Scaffold Next.js 16 + shadcn/ui (new-york)
2. [ ] Tulis Prisma schema (32 tabel + tambahan dari GAP)
3. [ ] `npx prisma migrate dev`
4. [ ] Setup Auth.js v5
5. [ ] Implement NIM validator abstraction + self-registration
6. [ ] Build layout (sidebar, header, notification sheet)
7. [ ] Tulis seed data (13 workflows, dummy users)
8. [ ] Implement workflow engine (`lib/workflow/`)
9. [ ] Implement auth helpers (`lib/auth/check.ts`, `scope.ts`)
10. [ ] Implement audit logger (`lib/audit/log.ts`)
11. [ ] Build halaman TA-01 (form submit, detail, dashboard, action buttons)
12. [ ] Build bypass mechanism (cron + upload flow)
13. [ ] Lanjut Fase 3-7 sesuai plan
14. [ ] Konversi 14 template Blade → TypeScript
15. [ ] Tulis unit + integration + E2E tests
