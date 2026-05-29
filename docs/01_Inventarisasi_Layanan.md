# Dokumen Inventarisasi & Spesifikasi Sistem

**Sistem**: Sistem Informasi Layanan Akademik (SILA)
**Institusi**: Fakultas Ushuluddin dan Adab — UIN Sultan Maulana Hasanuddin Banten
**Versi**: 4.0
**Tanggal Update**: 28 Mei 2026
**Status**: Final untuk inventarisasi, model identitas, workflow, dan keputusan arsitektural utama
**Tech Stack**: Next.js (TypeScript) dengan ORM Prisma atau Drizzle

---

## Daftar Isi

1. Ringkasan Eksekutif
2. Inventarisasi Layanan & Workflow Per Layanan
3. Model Otorisasi & Struktur Identitas User
4. Konsep Semester sebagai Tenancy Temporal
5. Workflow Engine — Mekanisme Detail
6. Living Entity (Judul Skripsi)
7. Form Builder & Document Requirements (Database Driven)
8. Document Generation, Live Preview & Penomoran Otomatis
9. Tanda Tangan Elektronik & Verifikasi QR Code
10. Notifikasi
11. Tracking & History Pengajuan
12. Arsip Dokumen per Role
13. Dashboard & UX Multi-Hat
14. Input Nilai Sidang (Hybrid)
15. Roadmap & Migration Strategy
16. Daftar Fitur Berdasarkan Prioritas
17. Status & Tahap Berikutnya

---

## 1. Ringkasan Eksekutif

### 1.1 Latar Belakang

Saat ini Fakultas Ushuluddin dan Adab UIN SMH Banten menggunakan **Google Form + pengetikan manual oleh staff** untuk mengelola layanan akademik mahasiswa:

```
Mahasiswa isi Google Form → Staff baca form & dokumen di Drive
→ Staff ketik manual ke template Word → Staff print dokumen
→ Staff bawa fisik ke pejabat untuk TTD basah → Dokumen selesai
```

**Masalah**: manual entry rentan typo, tidak ada tracking, TTD fisik butuh kehadiran, tidak ada audit trail, workflow tidak terstandarisasi.

### 1.2 Visi Sistem Baru

```
Mahasiswa isi form digital → Sistem cek dokumen wajib
→ Staff review di dashboard → Sekprodi tetapkan penguji/pembimbing
→ Approver TTD elektronik via sistem
→ Dokumen final auto-generate dengan QR Code → Mahasiswa download
```

**Manfaat utama**: zero manual typing, real-time tracking, remote signing, audit trail lengkap, standardisasi workflow.

### 1.3 Cakupan Sistem

| Kategori | Jumlah Layanan | Scope |
|---|---|---|
| Tugas Akhir (TA) | 6 layanan | Prodi |
| Akademik (AK) | 7 layanan | Fakultas |
| **Total** | **13 layanan** | — |

---

## 2. Inventarisasi Layanan & Workflow Per Layanan

### 2.1 Layanan Tugas Akhir (Scope: Prodi)

#### TA-01: Pengajuan Judul Skripsi

**Workflow**:
```
Mahasiswa (upload 3-5 judul + dokumen)
  → Staff Prodi (verifikasi berkas)
  → Pembimbing Akademik (PILIH 1 judul dari yang diajukan)
  → Kaprodi (approval)
  → Wakil Dekan 1 (TTD final)
```

**Output Dokumen**: Surat Persetujuan Judul Skripsi (1 dokumen) — atau Formulir Bypass jika SLA terlewat

**Karakteristik khusus**:
- PA punya UI khusus dengan radio button untuk pilih 1 dari 3-5 judul
- Memiliki **mekanisme bypass** jika PA tidak respon dalam SLA (lihat Section 5.4)

---

#### TA-02: SK Pembimbing Skripsi

**Workflow**:
```
Mahasiswa
  → Staff Prodi (verifikasi berkas)
  → Sekprodi (penetapan Pembimbing 1 & 2)
  → Wakil Dekan 1 (approval)
  → Dekan (TTD final)
```

**Output Dokumen**: SK Pembimbing Skripsi (1 dokumen)

**Karakteristik khusus**:
- Sekprodi yang menetapkan pembimbing 1 dan 2 (bukan Kaprodi)
- Memiliki **dual numbering**:
  - Nomor SK Fakultas (untuk header dokumen)
  - Nomor Surat Permohonan Prodi (di body dokumen, di-input Sekprodi)

---

#### TA-03: Seminar Proposal Skripsi

**Workflow**:
```
Mahasiswa
  → Staff Prodi (verifikasi berkas + PENJADWALAN: tanggal, waktu, ruang)
  → Sekprodi (PENETAPAN Penguji 1 & 2)
  → Wakil Dekan 1 (TTD final)
```

**Output Dokumen**: 3 dokumen sekaligus
- Surat Tugas Penguji Proposal
- Berita Acara & Keputusan Diskusi Proposal
- Daftar Hadir Dewan Penguji

**Karakteristik khusus**:
- Verifikasi + Penjadwalan dilakukan dalam **1 step** oleh Staff Prodi
- Penguji dipilih dari **dosen fakultas yang sama** (boleh lintas prodi, tidak ada eksternal)
- **Penguji 1 & 2 input nilai langsung di sistem** (hybrid: ada form print sebagai cadangan)

**Hasil Sidang**: LAYAK / TIDAK LAYAK untuk diteruskan ke penyusunan skripsi

---

#### TA-04: Ujian Komprehensif

**Workflow**:
```
Mahasiswa
  → Staff Prodi (verifikasi berkas + PENJADWALAN: tanggal, waktu, ruang)
  → Sekprodi (PENETAPAN Penguji 1 & 2)
  → Wakil Dekan 1 (TTD final)
```

**Output Dokumen**: 5 dokumen sekaligus
- Surat Tugas Penguji
- Form I K - Berita Acara Keputusan Sidang
- Form II K - Rekapitulasi Nilai
- Form III K - Nilai Komponen Dasar (Keahlian Prodi)
- Form IV K - Nilai Komponen Pendukung (Keislaman)

**Karakteristik khusus**:
- Dua jenis penguji khas PTKIN: **Penguji Keahlian Prodi** & **Penguji Keislaman**
- Verifikasi + Penjadwalan **1 step** (sama dengan TA-03)
- **Penguji 1 & 2 input nilai langsung di sistem**
- Formula nilai: P = (X1 + X2) / 2

**Hasil Sidang**: LULUS / TIDAK LULUS (maksimal sidang ulang sesuai kebijakan kampus)

---

#### TA-05: Ujian Skripsi (Munaqasyah)

**Workflow**:
```
Mahasiswa
  → Staff Prodi (verifikasi berkas)
  → Sekprodi (PENJADWALAN + PENETAPAN MAJELIS SIDANG - 6 dosen)
  → Wakil Dekan 1 (approval)
  → Dekan (TTD final)
```

**Output Dokumen**: 5 dokumen sekaligus
- Surat Tugas
- Berita Acara & Keputusan Sidang Munaqasyah
- Data Penentuan Yudicium
- Rekapitulasi Nilai Ujian Skripsi
- Nilai Ujian Skripsi

**Karakteristik khusus**:
- Sekprodi handle **penjadwalan + penetapan majelis** dalam 1 step
- Komposisi majelis: **6 dosen** (Ketua Sidang, Sekretaris Sidang, Pembimbing 1, Pembimbing 2, Penguji 1, Penguji 2)
- Pembimbing skripsi **TIDAK** masuk workflow approval, tapi tetap muncul sebagai bagian majelis
- **Sekretaris Sidang input nilai** (bukan masing-masing penguji, beda dengan TA-03/04)
- Yudisium: MEMUASKAN / SANGAT MEMUASKAN / PUJIAN

**Jika TIDAK LULUS**: harus ajukan **pengajuan baru** (sidang ulang), bukan revisi.

---

#### TA-06: Cek Turnitin

**Workflow**:
```
Mahasiswa (upload draft skripsi + data Turnitin)
  → Kepala Laboratorium
    [Jika tidak lolos] → Mahasiswa upload ulang draft revisi → Kepala Lab (max 3x revisi)
    [Jika lolos] → Sertifikat terbit
```

**Output Dokumen**: Surat Keterangan Hasil Uji Plagiarisme (1 dokumen)

**Karakteristik khusus**:
- Workflow paling sederhana — hanya 1 approver
- **Maksimal 3x revisi** — jika masih gagal, butuh proses khusus (akan didetailkan di Tahap 2)
- "Revisi" = mahasiswa upload ulang draft yang sudah diperbaiki

---

### 2.2 Layanan Akademik (Scope: Fakultas)

**Workflow umum untuk semua AK-01 s.d. AK-07**:

```
Mahasiswa (upload form + dokumen)
  → Staff Akademik (verifikasi berkas)
  → Kabag (approval)
  → Wakil Dekan 1 / Dekan (TTD final sesuai layanan)
```

| Kode | Nama Layanan | TTD Final |
|---|---|---|
| AK-01 | Surat Aktif Kuliah | Wakil Dekan 1 |
| AK-02 | Surat Masih Kuliah (PNS) | Wakil Dekan 1 |
| AK-03 | Surat Pernah Kuliah | Dekan |
| AK-04 | Surat Pengantar Observasi | Wakil Dekan 1 |
| AK-05 | Surat Pengantar Penelitian | Wakil Dekan 1 |
| AK-06 | Surat Permohonan Magang | Dekan |
| AK-07 | Surat Rekomendasi | Dekan |

### 2.3 Karakteristik Multi-Document Output

| Layanan | Jumlah Dokumen |
|---|---|
| TA-01, TA-02, TA-06 | 1 dokumen |
| TA-03 | 3 dokumen |
| TA-04, TA-05 | 5 dokumen |
| AK-01 s.d. AK-07 | 1 dokumen |

### 2.4 Cross-Layanan Dependency

Layanan TA harus berurutan:
```
TA-01 → TA-02 → TA-03 → TA-04 → TA-05
```

Layanan AK-05 (Pengantar Penelitian) mensyaratkan judul skripsi sudah disetujui (TA-01).

### 2.5 Catatan Penting tentang Pembimbing Skripsi

**Pembimbing Skripsi TIDAK masuk workflow sistem**. Tugas mereka (bimbingan, review draft, dll) dilakukan **di luar sistem**. Mereka:
- Muncul di dokumen output sebagai TTD (di Berita Acara sidang)
- Bisa akses sistem untuk **download SK Pembimbing & Surat Tugas mereka** (lihat Section 12)
- Tidak ada fitur upload/review draft dari mahasiswa di sistem ini

---

## 3. Model Otorisasi & Struktur Identitas User

### 3.1 Pendekatan: Hybrid RBAC + ReBAC + Class Table Inheritance

Sistem menggunakan pendekatan hybrid:
- **RBAC** (Role-Based Access Control) untuk akses fitur sistem
- **ReBAC** (Relationship-Based Access Control) untuk konteks kepemilikan/penugasan
- **Class Table Inheritance** untuk pemisahan tabel profil user

### 3.2 Empat Lapis Identitas User

| Lapis | Tujuan | Sifat |
|---|---|---|
| **Profile** | Data identitas asli (NIM/NIP/NIDN, nama, dll) | Statis |
| **System Role** | Akses login & menu fitur | Relatif stabil |
| **Structural Position** | Jabatan struktural dengan masa berlaku | Berubah saat pergantian jabatan |
| **Assignment** | Penugasan untuk konteks spesifik | Sangat dinamis |

### 3.3 Profile Separation: 4 Tabel Terpisah dengan Nullable FK

```
users (autentikasi)
  - id, email, password, system_role
  - dosen_id (nullable, FK)
  - pegawai_id (nullable, FK)
  - mahasiswa_id (nullable, FK)
  - CHECK: exactly one of three FKs not null

dosen (profil dosen)
  - id, NIDN, nama_lengkap, jabatan_fungsional, dll

pegawai (profil tendik)
  - id, NIP, nama_lengkap, golongan, unit_kerja_id

mahasiswa (profil mahasiswa)
  - id, NIM, nama_lengkap, prodi_id, semester_aktif, status_mahasiswa
```

**Justifikasi Nullable FK (bukan Polymorphic)**:
- TypeScript ORM tidak support polymorphic native
- Integritas data lebih kuat (FK constraint di DB level)
- Tipe user tertutup (3 tipe saja)
- Type safety lebih baik di TypeScript

### 3.4 System Roles

| Kode | Role | Profile Type | Keterangan |
|---|---|---|---|
| SR-01 | `mahasiswa` | mahasiswa | Pemohon layanan |
| SR-02 | `dosen` | dosen | Base role untuk semua dosen |
| SR-03 | `staff_prodi` | pegawai | Atribut `prodi_id`, hanya melayani layanan TA prodinya |
| SR-04 | `staff_akademik` | pegawai | Melayani layanan akademik scope fakultas |
| SR-05 | `kabag` | pegawai | Atasan staff, verifikator sebelum WD1/Dekan |
| SR-06 | `super_admin` | pegawai/dosen | Pengelola sistem |

### 3.5 Structural Positions

| Kode | Position | Holder Type | Scope |
|---|---|---|---|
| SP-01 | `sekprodi` | dosen | Per Prodi |
| SP-02 | `kaprodi` | dosen | Per Prodi |
| SP-03 | `wakil_dekan_1` | dosen | Fakultas |
| SP-04 | `dekan` | dosen | Fakultas |
| SP-05 | `kabag_tu` | pegawai | Fakultas |
| SP-06 | `kepala_lab` | dosen | Fakultas (Lab) |

### 3.6 Assignment Types

| Kode | Assignment Type | Konteks |
|---|---|---|
| AS-01 | `dosen_pa` | Per mahasiswa |
| AS-02 | `pembimbing_skripsi_1` | Per pengajuan TA |
| AS-03 | `pembimbing_skripsi_2` | Per pengajuan TA |
| AS-04 | `penguji_proposal` | Per sidang proposal |
| AS-05 | `penguji_komprehensif_prodi` | Per sidang komprehensif |
| AS-06 | `penguji_komprehensif_keislaman` | Per sidang komprehensif |
| AS-07 | `penguji_skripsi` | Per sidang munaqasyah |
| AS-08 | `ketua_sidang` | Per sidang munaqasyah |
| AS-09 | `sekretaris_sidang` | Per sidang munaqasyah |
| AS-10 | `dosen_pembimbing_observasi` | Per pengajuan observasi |
| AS-11 | `dosen_pembimbing_magang` | Per pengajuan magang |

### 3.7 Penanganan Alumni

Alumni **tetap di tabel `mahasiswa`** dengan kolom `status_mahasiswa`:
- `aktif`, `cuti`, `alumni`, `do`, `keluar`

Saat alumni mengajukan AK-03 (Pernah Kuliah), login dengan akun yang sama, sistem deteksi status alumni.

### 3.8 Scope Filtering (Row-Level Security)

Setiap entitas pengajuan punya:
```
scope_level: "fakultas" | "prodi"
fakultas_id: (always)
prodi_id: (nullable, only for prodi-level)
```

**Logika akses**:

| User | Akses |
|---|---|
| Mahasiswa | Pengajuan miliknya |
| Staff Prodi X | Pengajuan TA dengan `prodi_id = X` |
| Kaprodi X | Pengajuan TA prodinya |
| Sekprodi X | Pengajuan TA prodinya |
| Staff Akademik | Pengajuan AK fakultas |
| Kabag | Pengajuan yang sudah lolos staff |
| WD1/Dekan | Pengajuan yang sudah di approve Kabag/Kaprodi |
| Dosen | Pengajuan dimana dia punya assignment aktif |

---

## 4. Konsep Semester sebagai Tenancy Temporal

### 4.1 Struktur Tabel `academic_periods`

```
- id, nama_semester, tahun_akademik
- tipe (ganjil | genap)
- tanggal_mulai, tanggal_berakhir
- status (upcoming | active | completed)

Constraint: hanya 1 record dengan status='active'
```

### 4.2 Aturan Sistem

1. **Auto-tagging**: Pengajuan baru otomatis terikat ke semester aktif. Permanen.
2. **Switching Hybrid**: Otomatis berdasarkan tanggal (cron job), admin bisa override.
3. **In-progress saat pergantian**: Tetap diproses, tidak dipindah. Tampil sebagai "Carried-over".
4. **Counter penomoran reset per semester**.
5. **Time-Travel View**: Semester selector untuk lihat data historis (read-only).

---

## 5. Workflow Engine — Mekanisme Detail

### 5.1 Configurable per Layanan

Setiap layanan punya workflow yang bisa dikonfigurasi admin:
- Urutan step approver
- Action tersedia di setiap step
- SLA per step
- Field yang diisi/diapprove per step

### 5.2 Action di Setiap Step

| Action | Effect |
|---|---|
| `approve` | Lanjut ke step berikutnya |
| `reject_to_step` | Kembalikan ke step tertentu (pilih dari dropdown) |
| `terminate` | Pengajuan dibatalkan permanen |

### 5.3 Mekanisme Reject Bertingkat (Untuk Pejabat Atas)

**Untuk Dekan / WD1**:
- **Tidak boleh** kembalikan langsung ke mahasiswa
- Klik "Kembalikan" → muncul **dropdown role** yang bisa dipilih:
  - Staff Prodi (jika kesalahan verifikasi/penjadwalan)
  - Sekprodi (jika kesalahan penetapan penguji/majelis)
  - Kaprodi (jika kesalahan persetujuan)
  - Pembimbing Akademik (jika kesalahan pemilihan judul)
- **Alasan wajib** ditulis di textarea

**Setelah role di bawah perbaiki**:
- **Re-approval lengkap** (lewat semua step approver lagi)
- Sistem **tandai khusus**: "Returned from Dekan/WD1" sehingga approver di tengah tahu ini bukan submission baru
- Approver di tengah bisa cepat re-approve jika bagiannya tidak terdampak

### 5.4 Sistem Bypass (SLA-Based Escalation) — Khusus TA-01

Jika PA tidak respon dalam X hari kerja (configurable, default 7 hari):
1. Sistem auto-trigger mode bypass
2. Mahasiswa download **Formulir Pengajuan Judul** untuk TTD basah
3. Mahasiswa offline ke PA → upload form yang sudah di-TTD
4. Workflow lanjut ke Kaprodi → WD1

### 5.5 Versioning Riwayat

```
pengajuan_layanan (current state)
pengajuan_versi (snapshot setiap revisi)
pengajuan_log (event log: siapa, kapan, action, alasan)
```

**Submit pertama** → versi 1. **Rejection** → tidak overwrite. **Revisi & submit ulang** → versi 2 (snapshot baru), versi 1 tetap ada.

### 5.6 Khusus Sidang TIDAK LULUS (TA-05)

- Status: `terminated_failed`
- Mahasiswa **tidak bisa revisi**, harus ajukan **pengajuan baru** (sidang ulang)
- Data dasar bisa di-copy dari pengajuan lama

---

## 6. Living Entity (Judul Skripsi)

### 6.1 Konsep

Judul Skripsi adalah **entitas independen** yang hidup lintas layanan.

### 6.2 Lifecycle

1. **Lahir** di TA-01 (PA pilih 1 dari 3-5 judul mahasiswa)
2. **Disetujui** dan jadi judul aktif
3. **Direferensi** di TA-02, TA-03, TA-04, TA-05, AK-05
4. **Bisa direvisi** berdasarkan masukan verifikator atau hasil ujian

### 6.3 Struktur Database

```
judul_skripsi (current state)
  - id, mahasiswa_id, judul_aktif, status, current_version

judul_skripsi_history (semua versi)
  - id, judul_skripsi_id, versi_ke, judul_text,
    diubah_oleh, diubah_pada, konteks_perubahan,
    alasan_perubahan, referensi_pengajuan_id
```

### 6.4 Snapshot vs Live Reference

Dokumen output **menyimpan snapshot** judul saat diterbitkan, bukan live reference. Dokumen lama dengan judul lama tetap valid.

---

## 7. Form Builder & Document Requirements (Database Driven)

### 7.1 Konsep

Field input, dokumen persyaratan, dan workflow tiap layanan **diatur admin via admin panel**, bukan hardcode.

### 7.2 Yang Bisa Diatur Admin

**Untuk Field Input**:
- Nama field, tipe (text/number/date/dropdown/repeater/file)
- Wajib/opsional
- Validation rule
- Conditional field
- Urutan tampilan

**Untuk Dokumen Persyaratan**:
- Nama dokumen, format file, ukuran max
- Wajib/opsional
- Keterangan untuk mahasiswa

**Untuk Workflow**:
- Step approval
- Action di tiap step
- SLA per step

### 7.3 Struktur Database

```
jenis_layanan
  - id, kode, nama, kategori, scope_level

field_layanan
  - id, jenis_layanan_id, nama_field, tipe, wajib,
    validation_rule (JSON), urutan, kondisi_tampil

dokumen_persyaratan
  - id, jenis_layanan_id, nama_dokumen, format_diizinkan,
    ukuran_max_mb, wajib, urutan, keterangan,
    validation_rule (JSON, future), sumber_validasi (future)

pengajuan_dokumen
  - id, pengajuan_id, dokumen_persyaratan_id,
    file_path, file_name, di_upload_oleh, di_upload_pada, versi
```

### 7.4 Verifikator Tidak Upload Dokumen

Verifikator (Staff/Sekprodi/PA) **hanya input data tambahan**:
- Staff Prodi di TA-02: nomor surat permohonan prodi
- Staff Prodi di TA-03/04: tanggal/waktu/ruang sidang
- Sekprodi: data penguji/pembimbing/majelis
- PA di TA-01: pilihan 1 judul dari yang diajukan
- Penguji/Sekretaris Sidang: nilai sidang

### 7.5 Verifikasi Syarat Akademik

**Phase 1 (Sekarang)**:
- Sistem cek "dokumen wajib ada/tidak" saja
- Validasi konten manual oleh staff (sistem tidak validasi IPK/SKS)

**Phase 2-3 (Future)**:
- Future-proof dengan kolom `validation_rule` dan `sumber_validasi`
- Akan aktif saat SIAKAD ready untuk integrasi

---

## 8. Document Generation, Live Preview & Penomoran Otomatis

### 8.1 Template-Based Generation

Sistem punya template untuk tiap output dokumen. Saat workflow jalan, sistem auto-generate PDF dengan data dari pengajuan.

### 8.2 Multi-Document Output

Satu pengajuan bisa generate 1, 3, atau 5 dokumen sekaligus (TA-03, TA-04, TA-05).

### 8.3 Live Preview Document (Inspired by Srikandi)

**Konsep**: PDF preview tersedia **sejak awal pengajuan**, bukan hanya saat selesai.

**Cara kerja**:
1. Saat mahasiswa submit pengajuan, sistem **langsung generate preview PDF**
2. Field yang belum final ditandai **background kuning** (placeholder):
   - **Nomor surat**: muncul tapi marker kuning
   - **QR Code**: placeholder kuning + text "QR Code akan aktif setelah TTD final"
   - **TTD area**: placeholder kuning + text "Menunggu TTD [Nama Pejabat]"
3. Data yang sudah ada di-render normal
4. **Mahasiswa & approver bisa download preview** kapan saja untuk cek layout
5. Setelah TTD final → placeholder berubah jadi final state:
   - Nomor surat: final, no marker
   - QR Code: aktif dengan link verifikasi
   - TTD scan: ter-embed

**Tujuan**:
- Mengurangi kebingungan user (tidak ada placeholder text aneh)
- Memvalidasi layout sejak awal
- Memvalidasi data sebelum di-finalize

### 8.4 Format Penomoran

```
[NO_URUT]/Un.17/F.III/[KODE_KLASIFIKASI]/[BULAN_ROMAWI]/[TAHUN]
Contoh: 040/Un.17/F.III/PP.00.9/01/2026
```

### 8.5 Strategi Reserved Numbering (Style Srikandi)

**Mengapa Reserved Numbering, bukan Generate at Final**:
- Nomor di-reserve **saat pengajuan dibuat**, bukan saat TTD final
- Nomor langsung tampil di preview (dengan marker kuning sampai final)
- Jika pengajuan dibatalkan → nomor ditandai **VOID** di register
- Konsisten dengan Srikandi (standar nasional)
- UX lebih baik: user lihat nomor konsisten dari awal

### 8.6 Counter Reset per Semester

Counter reset di awal setiap semester. Sistem track counter per kombinasi:
```
counter = (academic_period_id, kode_klasifikasi, scope, scope_id)
```

### 8.7 Dual Numbering (Khusus TA-02 SK Pembimbing)

Dokumen SK Pembimbing punya **2 nomor**:

1. **Nomor SK Fakultas** (di header dokumen)
   - Format: `[NO]/Un.17/F.III/KP.01.2/[BULAN]/[TAHUN]`
   - Counter tingkat fakultas
   - Reserved saat pengajuan dibuat

2. **Nomor Surat Permohonan Prodi** (di body dokumen)
   - Counter tingkat prodi (terpisah per prodi)
   - Diinput Sekprodi saat penetapan pembimbing
   - Sesuai praktik existing: setiap prodi punya buku register sendiri

### 8.8 Tabel Pendukung

```
kode_klasifikasi
  - id, kode (PP.00.9, KP.01.2, dll), nama, deskripsi

penomoran_counter
  - id, academic_period_id, kode_klasifikasi_id,
    scope_level (fakultas/prodi), scope_id,
    current_value, last_updated
```

---

## 9. Tanda Tangan Elektronik & Verifikasi QR Code

### 9.1 Phase 1: TTD Scan + QR Code

**Cara kerja**:
1. Setiap pejabat upload **gambar TTD scan** sekali ke profil sistem
2. Saat pejabat klik "Setujui & Tanda Tangan":
   - Sistem auto-embed TTD scan ke posisi yang tepat di dokumen
   - Tambahkan QR Code verifikasi di footer
3. Dokumen final tersedia untuk download

**Audit log lengkap**:
- Siapa pejabat, kapan, dari IP mana
- Untuk dokumen apa
- Token unik per penggunaan

### 9.2 Verifikasi QR Code + Token

**Setiap dokumen memiliki**:
- QR Code yang link ke halaman verifikasi publik
- **Token verifikasi** (12-16 karakter, mis. `A7K9-PQRZ-2BX8`) yang tercetak di dokumen

**Alur verifikasi oleh pihak ketiga**:
1. Scan QR Code → halaman verifikasi publik terbuka
2. Input token dari dokumen → klik Verifikasi
3. Sistem cek token → tampilkan info dokumen (nomor, nama, jenis, tanggal, penandatangan)

**Mengapa pakai token**:
- QR Code bisa di-screenshot dan di-share
- Token tercetak di dokumen, hanya pemegang dokumen yang tahu
- Privacy pemilik dokumen terjaga

### 9.3 Rate Limiting & Audit

- Maks 10 percobaan verifikasi per IP per menit
- Semua percobaan di-log untuk audit

### 9.4 Roadmap Upgrade (Future)

Phase 2-3: jika dibutuhkan, daftar BSrE BSSN untuk TTE tersertifikasi. Untuk Phase 1, TTD scan + QR Code sudah cukup untuk kebutuhan dokumen layanan mahasiswa.

---

## 10. Notifikasi

### 10.1 Channel Phase 1

- **In-app**: selalu aktif, tidak bisa dimatikan
- **Email**: user bisa pilih On/Off
- **WhatsApp**: future, optional (jika pimpinan setuju beli API)

### 10.2 Template

Template notifikasi **hardcoded** oleh developer (konsistensi).

### 10.3 UI

- Style: **Slider/drawer** dari sisi layar
- Fitur: Mark all as read, Clear all, filter (read/unread)
- Indikator badge di ikon lonceng

### 10.4 Preferensi User

- In-app: selalu on
- Email: On/Off toggle
- WhatsApp: On/Off toggle (jika aktif)

### 10.5 Event Pemicu

**Untuk Mahasiswa**:
- Pengajuan disetujui di tiap step (info)
- Pengajuan ditolak (urgent)
- Dokumen final sudah jadi
- Reminder pengajuan stagnant

**Untuk Approver**:
- Pengajuan baru menunggu tindakan
- Reminder mendekati SLA
- Pengajuan lewat SLA (untuk bypass mechanism)

**Untuk Admin**:
- Sistem error
- Counter mendekati habis

### 10.6 Anti-Spam

- Digest mode
- Quiet hours
- De-duplication

---

## 11. Tracking & History Pengajuan

### 11.1 Halaman Detail Pengajuan

Komponen:
- Info dasar (kode, jenis, tanggal, status)
- **Progress bar visual** (indikator tahap workflow)
- **Activity timeline** (kronologi lengkap)
- Data & dokumen yang di-upload
- Tombol aksi (sesuai role)

### 11.2 Tampilan per Role

- **Mahasiswa**: pengajuan miliknya
- **Approver**: pengajuan dimana dia terlibat
- **Staff**: pengajuan dalam scope-nya

### 11.3 Versioning Display

Toggle untuk lihat versi sebelumnya jika pernah direvisi.

### 11.4 Daftar Pengajuan dengan Filter

- Filter status, jenis layanan, rentang tanggal, semester
- Pencarian by kode pengajuan / nama mahasiswa

### 11.5 Kode Pengajuan

Format: `TA-2026-0023` atau `AK-2026-0156`

### 11.6 Tidak Ada Akses Publik Tracking

Tracking pengajuan **wajib login**. Akses publik hanya untuk verifikasi dokumen via QR Code + token.

---

## 12. Arsip Dokumen per Role

### 12.1 Konsep

Pengajuan dengan status `selesai` **otomatis menjadi arsip** — tidak ada pemisahan terpisah. Setiap role bisa akses arsip dokumen sesuai kewenangannya.

### 12.2 Akses per Role

**Mahasiswa**:
- Menu "Dokumen Saya"
- Daftar semua dokumen yang pernah diterbitkan untuk dia
- Search & filter, download kapan saja

**Dosen** (sebagai PA/Pembimbing/Penguji):
- Menu "Surat & SK Saya"
- Filter berdasarkan peran:
  - Sebagai Pembimbing Skripsi: semua SK Pembimbing dimana dia tercantum
  - Sebagai Penguji: semua Surat Tugas Penguji
  - Sebagai Ketua/Sekretaris Sidang: semua Surat Tugas terkait
- **Tampilkan**: dokumen + info mahasiswa yang relevan (nama, judul skripsi, jadwal sidang)
- Berguna untuk laporan BKD/SKP dosen

**Staff Prodi**:
- Menu "Arsip Dokumen Prodi"
- Akses dokumen prodinya
- Filter by jenis layanan, periode, mahasiswa

**Staff Akademik**:
- Menu "Arsip Dokumen Akademik"
- Akses dokumen layanan AK fakultas

**Kaprodi/Sekprodi**:
- Akses arsip prodinya (lebih lengkap)

**Kabag**:
- Akses arsip layanan AK fakultas

**WD1/Dekan**:
- Akses semua dokumen yang dia TTD + arsip umum fakultas

### 12.3 Implementasi Teknis

Tidak perlu tabel terpisah. Cukup query `pengajuan_layanan` dengan filter `status = 'selesai'` + scope filter berdasarkan role user.

---

## 13. Dashboard & UX Multi-Hat

### 13.1 Challenge

Seorang dosen bisa punya banyak peran: Kaprodi + PA + Pembimbing + Penguji. UX harus tidak membingungkan.

### 13.2 Solusi: Contextual UI (Hybrid)

**Header user dengan multi-role indicator**:
- Avatar + nama
- Badge berwarna untuk setiap role aktif
- Ungu = jabatan struktural, Teal = role akademik, Pink = role situasional

**Unified Inbox dengan Context Badge**:
- Semua task dari semua role dalam satu list
- Setiap task punya badge KAPITAL berwarna ("SEBAGAI KAPRODI", "SEBAGAI PA")
- User tidak perlu switching mode

**Detail Task dengan Context Banner**:
- Saat klik task, banner di atas: "Anda merespons sebagai [Kaprodi Prodi IH]"
- Action buttons hanya yang relevan

**Audit trail otomatis**: Sistem catat "Dr. Ahmad approve sebagai Kaprodi" otomatis.

### 13.3 Stat Cards per Role

**Prinsip**: Max 4 cards, actionable, color-code by urgency, clickable.

**Mahasiswa**:
- Pengajuan aktif
- Pengajuan menunggu tindakan saya
- Pengajuan selesai bulan ini
- Status TA terkini

**Dosen (multi-hat aware)**:
- Task menunggu tindakan saya
- Pengajuan mendekati SLA-deadline
- Mahasiswa bimbingan saya (PA + Pembimbing)
- Sidang minggu ini

**Staff Prodi/Akademik**:
- Pengajuan baru menunggu verifikasi
- Pengajuan dalam proses
- Pengajuan selesai semester ini
- Pengajuan yang ter-bypass

**Kabag**:
- Pengajuan menunggu approval saya
- Throughput harian
- Pengajuan stagnant

**Kaprodi/Sekprodi**:
- Pengajuan TA aktif di prodi saya
- Mahasiswa per tahap TA
- Distribusi beban dosen pembimbing/penguji
- Sidang dijadwalkan minggu ini

**WD1/Dekan**:
- Pengajuan menunggu tanda tangan
- Statistik penerbitan dokumen
- Distribusi pengajuan per prodi

---

## 14. Input Nilai Sidang (Hybrid)

### 14.1 Konsep Hybrid

**Sistem generate form nilai sebagai PDF** untuk print sebagai cadangan, tapi input utama via sistem.

### 14.2 Siapa Input Nilai

| Sidang | Input Nilai |
|---|---|
| TA-03 Seminar Proposal | **Penguji 1 & 2** input nilai langsung |
| TA-04 Ujian Komprehensif | **Penguji 1 & 2** input nilai langsung |
| TA-05 Ujian Skripsi | **Sekretaris Sidang** input nilai |

### 14.3 Cara Kerja

1. Sebelum sidang: Sistem generate form nilai PDF (sebagai cadangan)
2. Saat sidang: Penguji/Sekretaris input nilai via sistem (HP/tablet/laptop)
3. Jika ada kendala teknis: pakai form fisik sebagai fallback
4. Setelah sidang: nilai final tersimpan, dokumen Berita Acara auto-generate dengan nilai

### 14.4 Auto-Calculate Yudisium

Sistem otomatis hitung yudisium dari nilai yang diinput:
- Untuk TA-04: P = (X1 + X2) / 2
- Untuk TA-05: IPK = ΣXY/ΣY → Yudisium (MEMUASKAN/SANGAT MEMUASKAN/PUJIAN)

### 14.5 Fallback Manual

Jika penguji tidak input via sistem (kendala teknis atau preferensi):
- Sekretaris/Staff Prodi bisa input nilai dari form fisik setelah sidang
- Form print harus disinkronkan dengan input sistem
- Audit log mencatat siapa yang input

---

## 15. Roadmap & Migration Strategy

### 15.1 Strangler Pattern (Migrasi Bertahap)

1. **Bulan 1-3 (Build Phase 1)**: Bangun MVP, belum rollout
2. **Bulan 4-5 (Pilot)**: Pilot di 1 prodi, Google Form tetap untuk yang lain
3. **Bulan 6 (Rollout)**: Ekspansi ke seluruh fakultas
4. **Bulan 7-12 (Phase 2 Build)**: Integrasi SIAKAD parsial
5. **Tahun 2+**: Phase 3 sesuai prioritas

### 15.2 Phase 2 (6-12 Bulan)

- Integrasi parsial SIAKAD (status, semester, IPK, SKS)
- Daftar BSrE BSSN (jika butuh legalitas hukum lebih kuat)
- Mobile-responsive UI (PWA)
- Reporting & analytics dasar
- WhatsApp notification (optional)

### 15.3 Phase 3 (1+ Tahun)

- Validation rules engine
- Override mechanism
- TTE BSrE penuh
- Workflow visual editor
- API publik
- **Modul Bimbingan Skripsi** (jika dibutuhkan)

---

## 16. Daftar Fitur Berdasarkan Prioritas

### 16.1 Kategori A: Wajib Phase 1

**A1. Manajemen User & Role**
- CRUD user, assign role, structural position
- Reset password, lupa password

**A2. Manajemen Master Data**
- CRUD Prodi, Dosen, Pegawai, Mahasiswa
- Import bulk dari Excel/CSV
- CRUD jenis layanan & workflow
- CRUD template dokumen
- CRUD academic period

**A3. Pengaturan Sistem**
- Logo, footer dokumen
- SMTP, storage, backup

**A4. Login & Keamanan**
- Login email/NIM/NIP + password
- Session, captcha, auto logout

**A5. Profil User**
- Edit profil, history, preferensi notifikasi

**A6. Search & Filter Global**

**A7. Layanan Inti (13 layanan)**
- TA-01 s.d. TA-06, AK-01 s.d. AK-07
- Workflow engine configurable
- Form builder & document requirements

**A8. Document Generation**
- Template-based PDF dengan **Live Preview**
- Multi-document support
- TTD scan + QR Code
- **Reserved numbering** (style Srikandi)
- Dual numbering untuk TA-02
- Verifikasi publik via QR Code + token

**A9. Input Nilai Sidang Hybrid**

**A10. Notifikasi In-App + Email**

**A11. Tracking & History**

**A12. Arsip Dokumen per Role**
- Dosen: download SK/Surat Tugas sendiri
- Staff/Pejabat: akses arsip sesuai scope

### 16.2 Kategori B: Phase 2

- Reporting & Analytics
- Bulk Action
- Mobile-Responsive (PWA)
- Sistem Bantuan (FAQ, panduan)
- Integrasi SIAKAD parsial
- TTE BSrE (jika dibutuhkan)
- WhatsApp Notification

### 16.3 Kategori C: Future

- Integrasi penuh (SIAKAD/PDDIKTI/SIMPEG/BSrE)
- Workflow visual editor
- Mobile app native
- API publik
- **Modul Bimbingan Skripsi** (jika kebutuhan muncul)
- Predictive alerts

---

## 17. Status & Tahap Berikutnya

### 17.1 Status Tahap 1

✅ **SELESAI**:
- 13 layanan teridentifikasi dengan workflow detail
- Model identitas user (4 lapis, profile separation, nullable FK)
- System roles, structural positions, assignments
- Konsep semester sebagai tenancy temporal
- Workflow engine: rejection bertingkat, versioning, bypass
- Living entity (judul skripsi)
- Database driven form & document
- Live preview document (style Srikandi)
- Reserved numbering & dual numbering
- TTD scan + QR Code verifikasi
- Notifikasi (in-app + email, slider UI)
- Tracking & history
- Arsip dokumen per role
- UX multi-hat (contextual UI)
- Input nilai sidang hybrid
- Pembimbing skripsi tidak masuk workflow (tetap di luar sistem)
- Roadmap 3 fase

### 17.2 Tahap Berikutnya

| Tahap | Deliverable | Status |
|---|---|---|
| Tahap 1 | Inventarisasi & Spesifikasi Sistem | ✅ Selesai (dokumen ini) |
| Tahap 1.5 | Dokumen Aturan Akademik (disederhanakan) | ⏳ Akan dibuat |
| Tahap 2 | Business Process Mapping (BPMN per layanan) | ⏸ Setelah validasi internal |
| Tahap 3 | Software Requirements Specification (SRS) | ⏸ Setelah Tahap 2 |
| Tahap 4 | Use Case Diagram & Specification | ⏸ Setelah Tahap 3 |
| Tahap 5 | ERD & Database Design (Prisma/Drizzle schema) | ⏸ Setelah Tahap 4 |
| Tahap 6 | Software Architecture Document | ⏸ Setelah Tahap 5 |
| Tahap 7 | UI/UX Wireframe & Prototype | ⏸ Setelah Tahap 6 |
| Tahap 8 | API Specification | ⏸ Setelah Tahap 7 |
| Tahap 9 | Test Plan & Test Case | ⏸ Setelah Tahap 8 |

---

*Dokumen ini adalah single source of truth untuk semua keputusan arsitektural & fitur sistem SILA. Setiap perubahan keputusan harus direfleksikan kembali ke dokumen ini dengan increment versi.*
