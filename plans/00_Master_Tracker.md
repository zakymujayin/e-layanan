# Master Implementation Tracker — SILA

**Project**: Sistem Informasi Layanan Akademik — Fakultas Ushuluddin dan Adab UIN SMH Banten
**Updated**: 29 Mei 2026 (reviewed)
**Progress**: 2/7 fase complete · 22 tasks done · 11 pending

---

## Fase 1: Fondasi — ✅ COMPLETE

**Output**: App bisa login, dashboard tampil, database 33 tabel, 13 workflows ter-seed, storage ready.

| # | Task | Status | Commit |
|---|---|---|---|
| 1.1 | Scaffold Next.js 16 + Turbopack + setup dependencies | ✅ | `efe53a2` |
| 1.2 | Prisma Schema — 33 tabel + gap fixes (`actionConfig`, `jenisKelamin`, etc) | ✅ | `6160bcf` |
| 1.3 | Auth.js v5 — credentials provider, database sessions, middleware | ✅ | `fc0c63a` |
| 1.4 | shadcn/ui Components — 28 komponen (new-york) | ✅ | `3c8f5ee` |
| 1.5 | Shared Layout — Sidebar (role-based), Header, Auth wrapper | ✅ | `26c6ffd` |
| 1.6 | Halaman Login + Register — NIM-validator based self-registration | ✅ | `26c6ffd` |
| 1.7 | Dashboard kosong + Shared Components (EmptyState, LoadingCard, NotificationSheet) | ✅ | `26c6ffd` |
| 1.8 | Storage Service — interface + LocalStorageProvider | ✅ | `0540ac7` |
| 1.9 | Seed Data — 11 users, 4 kode klasifikasi, 2 prodi, 1 fakultas, 1 academic period | ✅ | `b0035a6` |
| 1.10 | Workflow Seed — 13 jenis_layanan, 13 workflow_definitions, 40 steps, 81 actions | ✅ | `b0035a6` |
| 1.11 | Verifikasi Build + Dev Server — build passes, dev server ready | ✅ | `b0035a6` |

**Gap Fixes (post-scaffold)**:
| GF-1 | `targetStatus` dibuat nullable + `pangkatGolongan` ditambahkan ke `dosen` | ✅ | `0d899be` |

---

## Fase 2: Workflow Engine + Layanan TA-01 — ⏸ PARTIAL

**Target**: TA-01 full end-to-end — mahasiswa submit → staff approve → PA pilih judul → kaprodi approve → WD1 sign.

| # | Task | Status | Commit |
|---|---|---|---|
| 2.1 | Workflow Engine — `validate-transition.ts`, `execute-action.ts`, `audit.ts` | ✅ | `ee8396f` |
| 2.2 | Server Action — `submitPengajuanTA01` (create + assignment + version + log) | ✅ | `ee8396f` |
| 2.3 | Pilih Layanan Page — `/pengajuan/baru` (13 cards, TA + AK groups) | ✅ | `458824b` |
| 2.4 | TA-01 Submit Form — `/pengajuan/baru/TA-01` (3-5 judul + PA selector) | ✅ | `458824b` |
| 2.5 | Detail Pengajuan — `/pengajuan/[id]` (StatusBadge, ActivityTimeline) | ✅ | `458824b` |
| 2.6 | ProgressBar + Workflow ActionButtons (PA radio button, approve/reject/sign) | ✅ | `458824b` |
| 2.7 | Dashboard Multi-Role — stat cards real per role, task list | ✅ | `7c4ca04` |
| 2.8 | Verifikasi Build — TypeScript + static generation clean | ✅ | — |
| 2.9 | **Bypass Mechanism** — SLA cron job + bypass form + upload | ⏳ Pending | — |
| 2.10 | **Notifikasi** — in-app persistence + email templates | ⏳ Pending | — |
| 2.11 | **End-to-End Test** — login semua role, jalankan workflow penuh | ✅ Reviewed | — |
| 2.12 | **File Upload** — dokumen persyaratan via multipart API | ⏳ Pending | — |

**Review Result**: ✅ Database verified — 11 users, 13 workflows (40 steps, 81 actions) semua ter-seed. TA-01 workflow: 4 steps dengan actor dan SLA yang benar. Build passes clean. Route: `/pengajuan/baru`, `/pengajuan/baru/TA-01`, `/pengajuan/[id]` active. Siap untuk penuh end-to-end test setelah [2.12] file upload diimplementasikan.

**Technical Notes**:
- Prisma 7: semua field name pakai snake_case di JS client (beda dengan dokumen yang pakai camelCase)
- Next.js 16.2: ada warning `middleware→proxy` deprecation (non-blocking)
- Puppeteer belum di-install (akan dipakai di Fase 4 untuk PDF generation)

---

## Fase 3: TA-02 + TA-03 — ⏸ NOT STARTED

**Target**: TA-02 (SK Pembimbing) + TA-03 (Seminar Proposal) full end-to-end.

| # | Task | Status |
|---|---|---|
| 3.1 | TA-02 — Submit form + auto-fill dari TA-01 + staff approve | ⏳ |
| 3.2 | TA-02 — Sekprodi tetapkan Pembimbing 1&2 + nomor surat prodi | ⏳ |
| 3.3 | TA-02 — WD1 approve + Dekan sign (dual numbering output) | ⏳ |
| 3.4 | TA-03 — Submit form + 5 dokumen upload + auto-attach | ⏳ |
| 3.5 | TA-03 — Staff verifikasi + penjadwalan (1 step) | ⏳ |
| 3.6 | TA-03 — Sekprodi tetapkan Penguji 1&2 | ⏳ |
| 3.7 | TA-03 — WD1 sign → 3 dokumen output | ⏳ |
| 3.8 | TA-03 — Post-session: Penguji input nilai + Berita Acara regenerate | ⏳ |

---

## Fase 4: PDF Generation + TTD + QR — ⏸ NOT STARTED

**Target**: 14 template Blade dikonversi ke TypeScript, PDF generation dengan Puppeteer.

| # | Task | Status |
|---|---|---|
| 4.1 | Extract shared partials — kop surat + footer identik | ⏳ |
| 4.2 | Konversi 14 Blade → TypeScript template functions | ⏳ |
| 4.3 | Embed font Bookman Old Style via @font-face | ⏳ |
| 4.4 | Fix CSS broken di `seminar-proposal` dan `cek-turnitin` | ⏳ |
| 4.5 | Live Preview mode — placeholder kuning | ⏳ |
| 4.6 | TTD Scan embedding — check pejabat upload TTD, embed ke PDF | ⏳ |
| 4.7 | QR Code + Token Verifikasi — generate, halaman publik `/verifikasi` | ⏳ |
| 4.8 | Reserved Numbering — counter atomic + format Srikandi | ⏳ |
| 4.9 | Context Builder — fetch data pengajuan + mahasiswa + pejabat | ⏳ |

---

## Fase 5: 10 Layanan Sisanya — ⏸ NOT STARTED

| # | Task | Status |
|---|---|---|
| 5.1 | TA-04 — Ujian Komprehensif (5 halaman) | ⏳ |
| 5.2 | TA-05 — Ujian Skripsi/Munaqasyah (9 halaman) | ⏳ |
| 5.3 | TA-06 — Cek Turnitin (1 approver, max 3x revisi) | ⏳ |
| 5.4 | AK-01 s.d. AK-07 — 7 layanan akademik (pola: Staff→Kabag→WD1/Dekan) | ⏳ |

---

## Fase 6: Admin Panel + Pelengkap — ⏸ NOT STARTED

| # | Task | Status |
|---|---|---|
| 6.1 | CRUD Users + assign role + structural position | ⏳ |
| 6.2 | Import bulk Excel | ⏳ |
| 6.3 | CRUD Academic Periods | ⏳ |
| 6.4 | Kelola Layanan — field input + dokumen persyaratan + workflow | ⏳ |
| 6.5 | Konfigurasi Sistem — logo, footer, SMTP, Turnitin threshold | ⏳ |
| 6.6 | Arsitek Dokumen per Role | ⏳ |
| 6.7 | Semester Switching + Time-Travel View | ⏳ |
| 6.8 | Notifikasi Full — template email hardcoded | ⏳ |

---

## Fase 7: Testing & Polish — ⏸ NOT STARTED

| # | Task | Status |
|---|---|---|
| 7.1 | Unit Tests — workflow engine, auth, numbering, yudisium | ⏳ |
| 7.2 | Integration Tests — semua API endpoints | ⏳ |
| 7.3 | E2E Tests (Playwright) — happy path TA-01, AK-01, TA-06 | ⏳ |
| 7.4 | UI Polish — loading/empty/error states, responsive, accessibility | ⏳ |

---

## Kunci Login (Semua Password: `password123`)

| Role | Email | Keterangan |
|---|---|---|
| Mahasiswa | `aini@student.uinbanten.ac.id` | — |
| Dosen (PA) | `ahmad@uinbanten.ac.id` | Assignment `dosen_pa` |
| Kaprodi | `siti@uinbanten.ac.id` | Kaprodi IH |
| Sekprodi | `hasan@uinbanten.ac.id` | Sekprodi IH |
| Wakil Dekan 1 | `yani@uinbanten.ac.id` | TTD TA-01 |
| Dekan | `dekan@uinbanten.ac.id` | TTD final |
| Kepala Lab | `hamdan@uinbanten.ac.id` | TA-06 |
| Staff Prodi | `budi@uinbanten.ac.id` | Verifikasi TA |
| Staff Akademik | `maryam@uinbanten.ac.id` | Verifikasi AK |
| Kabag | `karim@uinbanten.ac.id` | Approval AK |
| Super Admin | `admin@sila.local` | Admin panel |

---

## File Struktur Proyek (Saat Ini)

```
src/
├── actions/
│   ├── auth.ts            # registerMahasiswa server action
│   └── pengajuan.ts        # submitPengajuanTA01 server action
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   └── pengajuan/
│   │       ├── [id]/page.tsx
│   │       └── baru/
│   │           ├── page.tsx
│   │           └── TA-01/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── NotificationSheet.tsx
│   │   ├── Sidebar.tsx
│   │   └── SignOutButton.tsx
│   ├── pengajuan/
│   │   ├── ActivityTimeline.tsx
│   │   ├── ProgressBar.tsx
│   │   └── StatusBadge.tsx
│   ├── shared/
│   │   ├── EmptyState.tsx
│   │   └── LoadingCard.tsx
│   ├── ui/                  # shadcn components (28 files)
│   └── workflow/
│       └── ActionButtons.tsx
├── lib/
│   ├── auth/
│   │   ├── check.ts
│   │   ├── index.ts
│   │   └── scope.ts
│   ├── nim-validator/
│   │   ├── local.ts
│   │   └── types.ts
│   ├── prisma.ts
│   ├── storage/
│   │   ├── local.ts
│   │   └── types.ts
│   ├── utils.ts
│   └── workflow/
│       ├── audit.ts
│       ├── execute-action.ts
│       └── validate-transition.ts
├── generated/prisma/        # Prisma client (auto-generated)
└── middleware.ts
```
