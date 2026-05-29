# Phase 3: TA-02 + TA-03 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** TA-02 (SK Pembimbing) + TA-03 (Seminar Proposal) full end-to-end. After this phase, 3 layanan TA berjalan lengkap, workflow engine teruji dengan 3 pola berbeda.

**Architecture:** TA-02 = 4-step (staff→sekprodi→wd1→dekan) dengan dual numbering. TA-03 = 3-step (staff→sekprodi→wd1) dengan combined penjadwalan + multi-document output.

---

## Task 3.1: TA-02 — Submit + Staff Verifikasi

**Files:**
- Create: `src/app/(dashboard)/pengajuan/baru/TA-02/page.tsx`
- Modify: `src/actions/pengajuan.ts` (add submitPengajuanTA02)

TA-02 form minimal: judul auto-fill dari TA-01 (read-only), upload KRS, auto-attach Surat Persetujuan Judul. Validasi: TA-01 harus `selesai`, tidak ada TA-02 aktif.

- [ ] Implement and commit

---

## Task 3.2: TA-02 — Sekprodi Tetapkan Pembimbing

**Files:**
- Modify: `src/app/(dashboard)/pengajuan/[id]/page.tsx` (add TA-02 specific fields)
- Create: `src/components/workflow/PembimbingPicker.tsx`

Sekprodi input: Pembimbing 1 & 2 (dosen_picker), nomor surat prodi, tanggal surat prodi. Validasi: 2 dosen berbeda, dosen aktif.

- [ ] Implement and commit

---

## Task 3.3: TA-02 — WD1 + Dekan Approval

**Files:** (existing detail page handles this via workflow engine)

WD1 approve → status `pending_dekan`. Dekan sign → status `selesai`. Existing ActionButtons component handles this. Just need to verify dual numbering data is stored.

- [ ] Verify and commit

---

## Task 3.4: TA-03 — Submit + 5 Dokumen Upload + Auto-Attach

**Files:**
- Create: `src/app/(dashboard)/pengajuan/baru/TA-03/page.tsx`
- Modify: `src/actions/pengajuan.ts` (add submitPengajuanTA03)

TA-03 form: 5 dokumen upload (Draft Proposal, Lembar Persetujuan, Form Bimbingan, Bukti Bayar, KRS). Auto-attach: SK Pembimbing dari TA-02. Auto-fill: judul + pembimbing.

- [ ] Implement and commit

---

## Task 3.5: TA-03 — Staff Verifikasi + Penjadwalan (Combined Step)

**Files:**
- Create: `src/components/workflow/JadwalSidangInput.tsx`

Staff input: tanggal/waktu/ruang sidang + approve. Validasi: tanggal >= hari ini + 3 hari, waktu mulai < selesai. Combined dalam 1 step.

- [ ] Implement and commit

---

## Task 3.6: TA-03 — Sekprodi Tetapkan Penguji + WD1 Sign + Post-Session Nilai

**Files:**
- Create: `src/components/workflow/PengujiPicker.tsx`
- Create: `src/components/workflow/NilaiSidangInput.tsx`

Sekprodi: pilih Penguji 1&2 dari dosen aktif fakultas. WD1: sign. Post-session: Penguji input nilai + keputusan (LAYAK/TIDAK LAYAK). Semua penguji input → Berita Acara regenerate placeholder.

- [ ] Implement and commit

---

## Task 3.7: Verifikasi End-to-End

Verify: TA-01 + TA-02 + TA-03 sequential flow works. Build passes.

- [ ] Verify and commit
