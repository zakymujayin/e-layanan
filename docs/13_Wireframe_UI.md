# Wireframe UI — Halaman Utama SILA

**Versi**: 1.0
**Tanggal**: 28 Mei 2026
**Tech Stack**: Next.js + shadcn/ui (new-york style) + Tailwind CSS v4

> **Catatan untuk AI Agent**: Dokumen ini mendefinisikan struktur & konten tiap halaman utama. Ini adalah SPESIFIKASI KONTEN, bukan desain piksel-perfect. Agent harus implementasikan menggunakan komponen shadcn/ui sesuai konvensi di Batch 3 Bagian 8. Warna pakai semantic token (tidak hardcode hex).

---

## Daftar Halaman

| No | Halaman | Route | Aktor |
|---|---|---|---|
| 1 | Login | `/login` | Semua (public) |
| 2 | Dashboard | `/dashboard` | Semua |
| 3 | Pilih Layanan | `/pengajuan/baru` | Mahasiswa |
| 4 | Form Pengajuan | `/pengajuan/baru/[kode]` | Mahasiswa |
| 5 | Daftar Pengajuan | `/pengajuan` | Semua |
| 6 | Detail Pengajuan | `/pengajuan/[id]` | Semua |
| 7 | Arsip Dokumen | `/arsip` | Semua |
| 8 | Surat & SK Saya | `/surat-saya` | Dosen |
| 9 | Profil | `/profil` | Semua |
| 10 | Verifikasi Publik | `/verifikasi` | Publik |
| 11 | Admin Panel | `/admin` | Super Admin |

---

## 1. Halaman Login

**Route**: `/login`
**Layout**: Centered card, no sidebar

```
┌─────────────────────────────────────────────────┐
│                                                 │
│       [Logo UIN SMH Banten]                     │
│                                                 │
│   Sistem Informasi Layanan Akademik (SILA)      │
│   Fakultas Ushuluddin dan Adab                  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │  Label: Email / NIM / NIDN / NIP          │  │
│  │  [                  Input                ]│  │
│  │                                           │  │
│  │  Label: Password                          │  │
│  │  [                  Input 🔒             ]│  │
│  │  [Tampilkan Password] toggle              │  │
│  │                                           │  │
│  │  [        Masuk        ] Button primary   │  │
│  │                                           │  │
│  │  [Lupa Password?] Link                    │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  SILA v1.0 © 2026 Fakultas Ushuluddin dan Adab  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Komponen**: Card, Input, Button, Label, Link
**Validation**: Real-time on submit. Error inline di bawah field.

---

## 2. Halaman Dashboard

**Route**: `/dashboard`
**Layout**: Sidebar kiri + main content

### 2a. Dashboard Mahasiswa

```
┌──────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR  │ HEADER: [Logo] [Search] [🔔 3] [Avatar ▾]           │
│          ├──────────────────────────────────────────────────────┤
│ Dashboard│                                                      │
│ Pengajuan│  Halo, Aini Fitri Utami 👋                          │
│ Arsip    │  Kamis, 28 Mei 2026 · Semester Ganjil 2025/2026     │
│ Profil   │                                                      │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│          │  │ 2        │ │ 1        │ │ 5        │ │ Sempr  │ │
│          │  │ Aktif    │ │ Perlu    │ │ Selesai  │ │ Proposal│ │
│          │  │ pengajuan│ │ Tindakan │ │ semester │ │ ✅ Layak│ │
│          │  │          │ │ ⚠️       │ │ ini      │ │        │ │
│          │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│          │                                                      │
│          │  ─── PERLU TINDAKAN ANDA ───                        │
│          │                                                      │
│          │  ┌──────────────────────────────────────────────┐   │
│          │  │ ⚠️ Pengajuan TA-01 #TA-2026-0023             │   │
│          │  │ Ditolak Staff Prodi • 2 jam lalu             │   │
│          │  │ "Transkrip tidak terbaca, mohon upload ulang"│   │
│          │  │                  [Lihat & Revisi] Button →   │   │
│          │  └──────────────────────────────────────────────┘   │
│          │                                                      │
│          │  ─── PENGAJUAN AKTIF ───                            │
│          │                                                      │
│          │  ┌──────────────────────────────────────────────┐   │
│          │  │ TA-02 SK Pembimbing Skripsi                  │   │
│          │  │ #TA-2026-0025 · ⏳ Menunggu Sekprodi         │   │
│          │  │ Diajukan 26 Mei 2026                         │   │
│          │  │ ○──●───○───○  (progress bar, step 2 aktif)  │   │
│          │  │                                [Lihat] Link  │   │
│          │  └──────────────────────────────────────────────┘   │
│          │                                                      │
│          │  [+ Ajukan Layanan Baru] Button primary (full width)│
│          │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

### 2b. Dashboard Dosen (Multi-Hat)

```
│  Dr. Ahmad Fauzi, M.Pd                                          │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │ KAPRODI IH     │ │ PA · 24 mhs    │ │ Penguji · 2   │       │
│  │ (badge ungu)   │ │ (badge teal)   │ │ (badge pink)  │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 5        │ │ 3        │ │ 24       │ │ 2 sidang │           │
│  │ Task     │ │ Mendekati│ │ Mahasiswa│ │ minggu   │           │
│  │ menunggu │ │ SLA ⚠️   │ │ bimbingan│ │ ini      │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ─── TUGAS MENUNGGU TINDAKAN ANDA ───                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ SEBAGAI KAPRODI  (badge ungu)    SLA: 1 hari              │ │
│  │ Approval TA-01 — Aini Fitri Utami                         │ │
│  │ #TA-2026-0023 · Masuk 5 hari lalu           [Buka →]     │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ SEBAGAI PA       (badge teal)                              │ │
│  │ Pilih Judul — Mila Syahroza                                │ │
│  │ #TA-2026-0031 · Masuk kemarin                [Buka →]     │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ SEBAGAI PENGUJI  (badge pink)                              │ │
│  │ Sidang Proposal — 14 Juni 2026, 09:00 WIB                  │ │
│  │ Ruang Sidang 1 · Aisyah Purwati               [Buka →]    │ │
│  └────────────────────────────────────────────────────────────┘ │
```

### 2c. Dashboard Staff Prodi / Sekprodi / Kaprodi

```
│  ─── STATISTIK PRODI IH ───                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 8        │ │ 45       │ │ 3        │ │ 12       │           │
│  │ Menunggu │ │ Selesai  │ │ Ter-     │ │ Seminar  │           │
│  │ saya     │ │ semester │ │ bypass   │ │ bulan ini│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ─── MENUNGGU VERIFIKASI ANDA ───                               │
│  [Tabel/list dengan filter: jenis layanan, tanggal]             │
```

### 2d. Dashboard WD1 / Dekan

```
│  ─── MENUNGGU TANDA TANGAN ─── (urgent)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TA-01 — Persetujuan Judul     Aini Fitri Utami    [TTD→]  │ │
│  │ AK-01 — Surat Aktif Kuliah    Budi Santoso         [TTD→]  │ │
│  │ ... dst ...                                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─── STATISTIK FAKULTAS ───                                     │
│  [Distribusi pengajuan per prodi, per jenis layanan]            │
```

---

## 3. Halaman Pilih Layanan

**Route**: `/pengajuan/baru`
**Aktor**: Mahasiswa

```
┌──────────┬───────────────────────────────────────────────┐
│ SIDEBAR  │ Ajukan Layanan Baru                           │
│          │                                               │
│          │  ─── TUGAS AKHIR ───                         │
│          │                                               │
│          │  ┌────────────────────────┐ ┌──────────────┐ │
│          │  │ TA-01                  │ │ TA-02        │ │
│          │  │ Pengajuan Judul        │ │ SK Pembimbing│ │
│          │  │ Skripsi                │ │ Skripsi      │ │
│          │  │                        │ │              │ │
│          │  │ [Ajukan] Button        │ │ 🔒 Perlu    │ │
│          │  │                        │ │ selesaikan   │ │
│          │  │                        │ │ TA-01 dulu   │ │
│          │  └────────────────────────┘ └──────────────┘ │
│          │  ┌────────────────────────┐ ...dst           │
│          │  │ TA-06                  │                   │
│          │  │ Cek Turnitin           │                   │
│          │  │ [Ajukan] Button        │                   │
│          │  └────────────────────────┘                   │
│          │                                               │
│          │  ─── LAYANAN AKADEMIK ───                    │
│          │                                               │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│          │  │ AK-01   │ │ AK-02   │ │ AK-03   │        │
│          │  │ Aktif   │ │ Masih   │ │ Pernah  │        │
│          │  │ Kuliah  │ │ Kuliah  │ │ Kuliah  │        │
│          │  │ [Ajukan]│ │ [Ajukan]│ │ 🔒 N/A │        │
│          │  └─────────┘ └─────────┘ └─────────┘        │
│          │   ...dst (AK-04 s.d. AK-07)                  │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

**UX Notes**:
- Layanan yang tidak eligible → tampil dengan ikon 🔒 dan tooltip penjelasan
- Layanan yang sudah ada pengajuan aktif → badge "Sedang Diproses"
- Layanan TA ditampilkan urut TA-01 s.d. TA-06

---

## 4. Halaman Form Pengajuan

**Route**: `/pengajuan/baru/[kode]` (mis. `/pengajuan/baru/TA-01`)

```
┌──────────┬───────────────────────────────────────────────────────┐
│ SIDEBAR  │ Pengajuan Judul Skripsi (TA-01)         [Breadcrumb]  │
│          │                                                        │
│          │  ─── PETUNJUK ───                                     │
│          │  Alert info: "Ajukan minimal 3 judul. PA akan memilih│
│          │  1 dari judul yang Anda ajukan."                       │
│          │                                                        │
│          │  ─── FORM INPUT ───                                   │
│          │                                                        │
│          │  Judul Skripsi 1 *                                    │
│          │  [                                                   ] │
│          │                                                        │
│          │  Judul Skripsi 2 *                                    │
│          │  [                                                   ] │
│          │                                                        │
│          │  Judul Skripsi 3 *                                    │
│          │  [                                                   ] │
│          │                                                        │
│          │  Judul Skripsi 4 (opsional)                           │
│          │  [                                                   ] │
│          │                                                        │
│          │  Judul Skripsi 5 (opsional)                           │
│          │  [                                                   ] │
│          │                                                        │
│          │  Pembimbing Akademik (PA) *                           │
│          │  [Search dosen...          ▾] Dropdown searchable     │
│          │                                                        │
│          │  ─── DOKUMEN PERSYARATAN ───                         │
│          │                                                        │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │ 📄 Transkrip Nilai Sementara *                 │  │
│          │  │ Format: PDF · Max: 2MB                         │  │
│          │  │ [                 Upload File               ]  │  │
│          │  └────────────────────────────────────────────────┘  │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │ 📄 KHS Semester Terakhir *                     │  │
│          │  │ [                 Upload File               ]  │  │
│          │  └────────────────────────────────────────────────┘  │
│          │  ┌────────────────────────────────────────────────┐  │
│          │  │ 📄 Bukti Pembayaran UKT *                      │  │
│          │  │ [                 Upload File               ]  │  │
│          │  └────────────────────────────────────────────────┘  │
│          │                                                        │
│          │  [Batal]              [Submit Pengajuan] Button primary│
│          │                                                        │
└──────────┴───────────────────────────────────────────────────────┘
```

**UX Notes**:
- File upload: drag-and-drop area, tampilkan progress upload
- Setelah file di-upload, tampilkan nama file + size + tombol hapus
- Field `*` ditandai required
- Tombol Submit disabled jika validasi belum terpenuhi

---

## 5. Halaman Daftar Pengajuan

**Route**: `/pengajuan`

```
│  Daftar Pengajuan                     [+ Ajukan Baru] Button    │
│                                                                   │
│  Filter: [Semua Status ▾] [Semua Layanan ▾] [Semester: Aktif ▾] │
│  Search: [Cari kode atau nama...                              ]  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ #TA-2026-0023  ·  Pengajuan Judul Skripsi                  │  │
│  │ ⏳ Menunggu PA  ·  Diajukan 28 Mei 2026                    │  │
│  │ ○──●───○───○   (progress 2/4)                              │  │
│  │                                                    [Lihat →] │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ #TA-2026-0025  ·  SK Pembimbing Skripsi                    │  │
│  │ ✅ Selesai  ·  Selesai 20 Mei 2026                         │  │
│  │                                        [Lihat] [Download] │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ #AK-2026-0156  ·  Surat Aktif Kuliah                       │  │
│  │ 🔴 Perlu Revisi  ·  "Transkrip tidak terbaca"              │  │
│  │                                          [Lihat & Revisi→] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Menampilkan 3 dari 8 pengajuan     [1] [2] [3] Pagination      │
```

---

## 6. Halaman Detail Pengajuan

**Route**: `/pengajuan/[id]`

```
│  [← Kembali]                                                      │
│  Pengajuan Judul Skripsi                                          │
│  #TA-2026-0023  ·  Diajukan 28 Mei 2026                          │
│                                                                    │
│  Status: [⏳ Menunggu PA] Badge amber                             │
│                                                                    │
│  ─── PROGRESS ───                                                 │
│  [○ Diajukan] ──[○ Verifikasi Staff]──[● PA Pilih Judul]──[○ Kaprodi]──[○ WD1]
│               ✅ 26 Mei              Sedang ini           belum    belum  │
│                                                                    │
│  ─── DOKUMEN PREVIEW ───                                          │
│  [🔍 Lihat Preview Dokumen] Button (buka PDF preview dengan placeholder kuning)│
│                                                                    │
│  ─── DETAIL PENGAJUAN ───                                         │
│  Judul 1: Analisis Hadis tentang...                               │
│  Judul 2: Kajian Tafsir Al-Quran...                               │
│  Judul 3: Studi Komparatif...                                     │
│  PA: Dr. Ahmad Fauzi, M.Pd                                        │
│                                                                    │
│  ─── DOKUMEN UPLOAD ───                                           │
│  📄 Transkrip Nilai Sementara   [Download]                        │
│  📄 KHS Semester Terakhir       [Download]                        │
│  📄 Bukti Pembayaran UKT        [Download]                        │
│                                                                    │
│  ─── RIWAYAT AKTIVITAS ───                                        │
│                                                                    │
│  ●  28 Mei 2026, 14:30 WIB                                        │
│     Menunggu PA (Dr. Ahmad Fauzi)                                 │
│                                                                    │
│  ●  28 Mei 2026, 09:15 WIB                                        │
│     Disetujui Staff Prodi (Budi Santoso)                          │
│     "Berkas lengkap, silakan dilanjutkan"                         │
│                                                                    │
│  ●  27 Mei 2026, 16:00 WIB                                        │
│     Pengajuan diajukan oleh Aini Fitri Utami                      │
│     3 judul, 3 dokumen                                            │
│                                                                    │
│  ─── AKSI ───  (tampil sesuai role & step aktif)                  │
│                                                                    │
│  [Untuk Mahasiswa yang sedang revision_required:]                  │
│  [Revisi & Submit Ulang] Button primary                           │
│                                                                    │
│  [Untuk PA yang sedang pending_pa:]                               │
│  [Pilih Judul & Lanjutkan] Button primary                         │
│  [Tolak Semua Judul] Button destructive                           │
│                                                                    │
│  [Untuk WD1 yang sedang pending_wd1:]                             │
│  [Tanda Tangan & Terbitkan] Button primary                        │
│  [Kembalikan ke...] Button outline                                │
```

---

## 7. Halaman Arsip Dokumen

**Route**: `/arsip`

```
│  Arsip Dokumen Saya                                               │
│                                                                    │
│  Filter: [Semua Layanan ▾] [Semester: Aktif ▾] [Cari...]         │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Surat Persetujuan Judul Skripsi                             │   │
│  │ #TA-2026-0023 · Diterbitkan 5 Mei 2026                     │   │
│  │ 040/Un.17/F.III/PP.00.9/V/2026                              │   │
│  │                                  [📥 Download] [🔍 Lihat]  │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ SK Pembimbing Skripsi                                       │   │
│  │ #TA-2026-0025 · Diterbitkan 20 Mei 2026                    │   │
│  │ 023/Un.17/F.III/KP.01.2/V/2026                             │   │
│  │                                  [📥 Download] [🔍 Lihat]  │   │
│  └────────────────────────────────────────────────────────────┘   │
```

---

## 8. Halaman Surat & SK Saya (Dosen)

**Route**: `/surat-saya`

```
│  Surat & SK Saya                                                  │
│                                                                    │
│  Tab: [Sebagai Pembimbing] [Sebagai Penguji] [Sebagai Majelis]   │
│                                                                    │
│  ─── SEBAGAI PEMBIMBING SKRIPSI ───                               │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ SK Pembimbing Skripsi 1                                    │   │
│  │ Mahasiswa: Aini Fitri Utami (221360001)                    │   │
│  │ Judul: "Analisis Hadis tentang..."                         │   │
│  │ Diterbitkan: 20 Mei 2026                                   │   │
│  │                                          [📥 Download SK]  │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ SK Pembimbing Skripsi 2                                    │   │
│  │ Mahasiswa: Budi Santoso (221360045)                        │   │
│  │ Judul: "Kajian Tafsir..."                                  │   │
│  │ Diterbitkan: 15 April 2026                                 │   │
│  │                                          [📥 Download SK]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ─── SEBAGAI PENGUJI ─── (Tab)                                    │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Surat Tugas Penguji Seminar Proposal                       │   │
│  │ Mahasiswa: Mila Syahroza (221360078)                       │   │
│  │ Judul: "Studi Komparatif..."                               │   │
│  │ Jadwal: 14 Juni 2026, 09:00 WIB · Ruang Sidang 1          │   │
│  │                                      [📥 Download Surat]  │   │
│  └────────────────────────────────────────────────────────────┘   │
```

---

## 9. Halaman Profil

**Route**: `/profil`

```
│  Profil Saya                                                       │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  [Avatar/Foto]  Dr. Ahmad Fauzi, M.Pd                        │ │
│  │                 Dosen · Prodi Ilmu Hadis                      │ │
│  │                 NIDN: 0115098501                               │ │
│  │                                  [Ganti Foto] Button outline  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ─── Informasi Akun ───                                           │
│  Nama Lengkap: [Dr. Ahmad Fauzi, M.Pd              ]             │
│  Email:        [ahmad.fauzi@uinbanten.ac.id         ]             │
│  No. HP:       [+62 812-3456-789                    ]             │
│                                              [Simpan Perubahan]   │
│                                                                    │
│  ─── Keamanan ───                                                 │
│  [Ganti Password] Button outline                                  │
│                                                                    │
│  ─── Tanda Tangan Scan ─── (khusus pejabat)                      │
│  [Preview TTD saat ini]                                           │
│  [Upload TTD Baru] Button outline                                 │
│  Format: PNG/JPG · Max: 1MB · Rekomendasi: 400×150px             │
│                                                                    │
│  ─── Preferensi Notifikasi ───                                    │
│  Notifikasi Email: [Toggle ON/OFF]                                │
│                                                                    │
```

---

## 10. Halaman Verifikasi Publik

**Route**: `/verifikasi`
**Layout**: Centered, no sidebar, no login required

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Logo UIN]                                     │
│                                                 │
│  VERIFIKASI DOKUMEN                             │
│  Sistem Informasi Layanan Akademik              │
│  Fakultas Ushuluddin dan Adab                   │
│  UIN Sultan Maulana Hasanuddin Banten           │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Masukkan kode verifikasi dari dokumen:         │
│                                                 │
│  [        A7K9-PQRZ-2BX8         ] Input       │
│                                                 │
│  [      Verifikasi Dokumen       ] Button       │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  [Hasil → tampil di sini setelah klik verif]   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ✅ DOKUMEN VALID DAN TERVERIFIKASI       │   │
│  │                                         │   │
│  │ Nomor Surat  : 040/Un.17/F.III/PP.00.9…│   │
│  │ Jenis        : Surat Persetujuan Judul  │   │
│  │ Pemilik      : Aini Fitri Utami         │   │
│  │ Tanggal Terbit: 28 Mei 2026             │   │
│  │ Penandatangan: Dr. Ahmad Yani, MA       │   │
│  │               (Wakil Dekan I)           │   │
│  │ Status       : Aktif                    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 11. Admin Panel (Overview)

**Route**: `/admin`
**Aktor**: Super Admin saja

```
│  ADMIN PANEL                                                      │
│                                                                    │
│  Tab Navigasi:                                                     │
│  [User] [Master Data] [Layanan] [Academic Period] [Sistem] [Log]  │
│                                                                    │
│  ─── TAB: KELOLA LAYANAN ───                                      │
│                                                                    │
│  [Pilih Layanan: TA-01 Pengajuan Judul Skripsi ▾]                │
│                                                                    │
│  Sub-tab: [Field Input] [Dokumen Persyaratan] [Workflow]          │
│                                                                    │
│  ─── Sub-tab: Field Input ───                                     │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ≡ Judul Skripsi 1  ·  textarea · Wajib    [Edit] [Hapus]   │ │
│  │ ≡ Judul Skripsi 2  ·  textarea · Wajib    [Edit] [Hapus]   │ │
│  │ ≡ Judul Skripsi 3  ·  textarea · Wajib    [Edit] [Hapus]   │ │
│  │ ≡ PA Dosen         ·  dosen_picker · Wajib[Edit] [Hapus]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  [+ Tambah Field] Button outline                                  │
│                                                                    │
│  ─── Sub-tab: Dokumen Persyaratan ───                             │
│  [list dokumen persyaratan, drag-drop urutan, edit/hapus]         │
│                                                                    │
│  ─── Sub-tab: Workflow ───                                        │
│  [Tabel step, SLA per step, actions tersedia]                     │
│                                                                    │
│  [Simpan Perubahan] Button primary                                │
```

---

## Komponen Shared yang Dibutuhkan

| Komponen | File | Deskripsi |
|---|---|---|
| `SidebarNav` | `components/layout/Sidebar.tsx` | Navigasi sidebar dengan role-based menu |
| `TopHeader` | `components/layout/Header.tsx` | Logo, search, notification bell, avatar |
| `NotificationSheet` | `components/layout/NotificationSheet.tsx` | Drawer notifikasi dari kanan |
| `StatusBadge` | `components/pengajuan/StatusBadge.tsx` | Badge status dengan warna semantik |
| `ProgressBar` | `components/pengajuan/ProgressBar.tsx` | Progress bar step workflow |
| `ActivityTimeline` | `components/pengajuan/ActivityTimeline.tsx` | Timeline riwayat aktivitas |
| `PengajuanCard` | `components/pengajuan/PengajuanCard.tsx` | Card item daftar pengajuan |
| `MultiHatBadges` | `components/pengajuan/MultiHatBadges.tsx` | Badge multi-role dosen |
| `FileUpload` | `components/shared/FileUpload.tsx` | Drag-drop file upload |
| `EmptyState` | `components/shared/EmptyState.tsx` | Tampilan list kosong |
| `ContextBanner` | `components/workflow/ContextBanner.tsx` | "Anda merespons sebagai [role]" |
| `ActionButtons` | `components/workflow/ActionButtons.tsx` | Tombol aksi sesuai step |
| `RejectDialog` | `components/workflow/RejectDialog.tsx` | Dialog reject dengan alasan + target |
| `SignConfirmDialog` | `components/workflow/SignConfirmDialog.tsx` | Dialog konfirmasi TTD |
| `DosenPicker` | `components/shared/DosenPicker.tsx` | Searchable dosen dropdown |
