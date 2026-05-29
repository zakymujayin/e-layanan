# Software Requirements Specification (SRS)
# Sistem Informasi Layanan Akademik (SILA)

**Institusi**: Fakultas Ushuluddin dan Adab — UIN Sultan Maulana Hasanuddin Banten
**Versi**: 1.0
**Tanggal**: 28 Mei 2026
**Status**: Draft Final

---

## Dokumen Referensi

Dokumen ini mengacu ke:

| Ref | Dokumen | Untuk |
|---|---|---|
| [INV] | `01_Inventarisasi_Layanan.md` v4.0 | Keputusan arsitektur, fitur, roadmap |
| [AK] | `02_Aturan_Akademik_Layanan.md` v2.0 | Field input & dokumen per layanan |
| [BPMN-TA01] | `03_BPMN_TA-01_*.md` | Workflow detail TA-01 |
| [BPMN-TA02] | `03_BPMN_TA-02_*.md` | Workflow detail TA-02 |
| [BPMN-TA03] | `03_BPMN_TA-03_*.md` | Workflow detail TA-03 |
| [BPMN-TA04] | `03_BPMN_TA-04_*.md` | Workflow detail TA-04 |
| [BPMN-TA05] | `03_BPMN_TA-05_*.md` | Workflow detail TA-05 |
| [BPMN-TA06] | `03_BPMN_TA-06_*.md` | Workflow detail TA-06 |
| [BPMN-AK] | `03_BPMN_AK-01_sd_AK-07_*.md` | Workflow detail AK-01 s.d. AK-07 |
| [KON-1] | `04_Konvensi_Glossary_Batch_1.md` | Glossary, naming, enum |
| [KON-2] | `04_Konvensi_Glossary_Batch_2.md` | Error, API, date/time, storage |
| [KON-3] | `04_Konvensi_Glossary_Batch_3.md` | UI, auth, acceptance criteria |
| [KON-4] | `04_Konvensi_Glossary_Batch_4.md` | AI agent guidelines, workflow, audit |

---

## Daftar Isi

1. Pendahuluan
2. Deskripsi Umum Sistem
3. Kebutuhan Fungsional — Modul Autentikasi & User
4. Kebutuhan Fungsional — Modul Workflow Pengajuan
5. Kebutuhan Fungsional — 13 Layanan
6. Kebutuhan Fungsional — Document Generation
7. Kebutuhan Fungsional — Notifikasi
8. Kebutuhan Fungsional — Arsip & Tracking
9. Kebutuhan Fungsional — Admin Panel
10. Kebutuhan Non-Fungsional
11. Batasan & Asumsi

---

# Bagian 1: Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen ini mendefinisikan **kebutuhan fungsional dan non-fungsional** Sistem Informasi Layanan Akademik (SILA). Dokumen ini menjadi acuan utama bagi AI Agent (Claude Code, DeepSeek Pro) dalam mengimplementasikan sistem, dan dapat digunakan untuk verifikasi bahwa implementasi sesuai requirement.

## 1.2 Lingkup Sistem

SILA adalah sistem berbasis web yang mendigitalisasi 13 layanan akademik di Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten, menggantikan proses existing berbasis Google Form + pengetikan manual + TTD basah.

**Yang dicakup SILA**:
- 6 Layanan Tugas Akhir (TA-01 s.d. TA-06), scope Prodi
- 7 Layanan Akademik (AK-01 s.d. AK-07), scope Fakultas
- Workflow approval multi-level
- Document generation otomatis (PDF dengan TTD scan + QR Code)
- Notifikasi in-app + email
- Arsip dokumen digital per role
- Admin panel konfigurasi (workflow, form, dokumen persyaratan)

**Yang TIDAK dicakup SILA (Phase 1)**:
- Manajemen KRS/KHS mahasiswa (milik SIAKAD)
- Validasi IPK/SKS otomatis (belum integrasi SIAKAD)
- Bimbingan skripsi online (modul terpisah, Phase 2+)
- Integrasi BSrE/TTE tersertifikasi (Phase 2+)
- Aplikasi mobile native (cukup responsive web)

## 1.3 Definisi & Akronim

Lihat [KON-1] Bagian 1 (Glossary) untuk definisi lengkap. Akronim utama:

| Akronim | Kepanjangan |
|---|---|
| SILA | Sistem Informasi Layanan Akademik |
| TA | Tugas Akhir |
| AK | Akademik |
| PA | Pembimbing Akademik |
| WD1 | Wakil Dekan 1 |
| SLA | Service Level Agreement (batas waktu per step) |
| TTD | Tanda Tangan |
| QR | Quick Response (Code) |
| PDF | Portable Document Format |

---

# Bagian 2: Deskripsi Umum Sistem

## 2.1 Perspektif Sistem

SILA adalah **aplikasi web mandiri** (standalone) yang berjalan di server kampus. Pada Phase 1, SILA tidak terintegrasi dengan sistem lain. Data mahasiswa, dosen, dan pegawai di-input manual oleh super admin.

```
[Browser User]  ←→  [SILA Web App (Next.js)]  ←→  [Database PostgreSQL]
                                                ↓
                                        [File Storage (lokal)]
                                                ↓
                                        [Email Server (SMTP)]
```

## 2.2 Fungsi Utama Sistem

| ID | Fungsi | Deskripsi |
|---|---|---|
| F-01 | Manajemen User & Role | CRUD user, assign role, structural position |
| F-02 | Workflow Engine | Eksekusi alur pengajuan configurable |
| F-03 | Form Builder | Konfigurasi field input & dokumen per layanan |
| F-04 | Document Generation | Generate PDF otomatis dari template + data |
| F-05 | Live Preview | Preview dokumen sejak pengajuan dibuat |
| F-06 | Reserved Numbering | Penomoran surat otomatis (style Srikandi) |
| F-07 | TTD Scan Embedding | Embed gambar TTD scan ke dokumen |
| F-08 | QR Code Verifikasi | QR Code + token untuk verifikasi publik |
| F-09 | Notifikasi | In-app + email notifikasi per event |
| F-10 | Tracking | Progress bar + activity timeline per pengajuan |
| F-11 | Arsip Dokumen | Akses arsip per role setelah selesai |
| F-12 | Admin Panel | Konfigurasi layanan, workflow, template |
| F-13 | SLA Management | Timer SLA, reminder, bypass (khusus TA-01) |

## 2.3 Kelas Pengguna (User Classes)

| Kelas | System Role | Karakteristik | Frekuensi |
|---|---|---|---|
| Mahasiswa | `mahasiswa` | Tech-savvy rendah-menengah, akses via HP | Per pengajuan |
| Dosen | `dosen` | Tech-savvy menengah, akses via desktop/HP | Beberapa kali per minggu |
| Staff Prodi | `staff_prodi` | Tech-savvy menengah, kerja di kantor | Harian |
| Staff Akademik | `staff_akademik` | Tech-savvy menengah, kerja di kantor | Harian |
| Kabag | `kabag` | Tech-savvy menengah-rendah | Beberapa kali per hari |
| Super Admin | `super_admin` | Tech-savvy tinggi | Kadang-kadang |

## 2.4 Lingkungan Operasi

| Komponen | Spesifikasi |
|---|---|
| Framework | Next.js 16.2.x (App Router) |
| Runtime | Node.js 20+ LTS |
| Database | PostgreSQL 16+ |
| OS Server | Linux (Ubuntu 22.04+) |
| Browser Client | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Min RAM Server | 4 GB (dev), 8 GB (production) |
| Storage | 50 GB awal (lokal), scalable |

---

# Bagian 3: Kebutuhan Fungsional — Modul Autentikasi & User

## 3.1 Login

### FR-AUTH-01: Login dengan Kredensial

**Deskripsi**: User dapat login menggunakan identifier (email, NIM, NIP, atau NIDN) dan password.

**Detail**:
- Input identifier dan password
- Sistem cek identifier di tabel `users`
- Sistem verifikasi password hash (bcrypt/argon2)
- Jika valid: create session di database, redirect ke dashboard
- Jika tidak valid: tampilkan error `ERR_AUTH_INVALID_CREDENTIALS`
- Identifiers yang diterima:
  - Mahasiswa: email atau NIM
  - Dosen: email atau NIDN
  - Pegawai: email atau NIP

**Acceptance Criteria**:

```
AC-AUTH-01-01: Login berhasil
GIVEN user "aini@student.ac.id" dengan password benar
WHEN Aini submit form login
THEN session database ter-create
  AND user redirect ke /dashboard
  AND audit log "auth.login_success" tercatat

AC-AUTH-01-02: Login gagal — password salah
GIVEN user "aini@student.ac.id" dengan password salah
WHEN Aini submit form login
THEN error ERR_AUTH_INVALID_CREDENTIALS "Email atau password salah"
  AND session TIDAK dibuat
  AND audit log "auth.login_failed" tercatat

AC-AUTH-01-03: Login dengan NIM
GIVEN mahasiswa NIM "221360001" dengan password benar
WHEN submit login dengan NIM
THEN login berhasil (sama seperti AC-AUTH-01-01)

AC-AUTH-01-04: Rate limit login
GIVEN IP "192.168.1.1" sudah 5x gagal login dalam 1 menit
WHEN attempt ke-6
THEN error ERR_AUTH_RATE_LIMIT "Terlalu banyak percobaan"
  AND blokir 60 detik
```

### FR-AUTH-02: Logout

User dapat logout. Session di database di-hapus. Redirect ke /login.

### FR-AUTH-03: Lupa Password

**Deskripsi**: User request reset password via email.

**Detail**:
- User input email
- Sistem kirim email berisi link reset (expire 1 jam)
- User klik link → input password baru
- Password baru di-hash dan di-update

### FR-AUTH-04: Auto Logout (Idle Timeout)

Session otomatis expire setelah **2 jam idle** (tidak ada aktivitas). User redirect ke /login dengan pesan "Sesi Anda telah berakhir."

## 3.2 Manajemen User (Super Admin)

### FR-USER-01: CRUD User

Super admin dapat:
- Tambah user baru (input data + assign role + buat password awal)
- Edit data user (nama, email, kontak)
- Nonaktifkan user (`is_active = false`)
- Reset password user

### FR-USER-02: Assign System Role

Super admin dapat assign/ubah `system_role` user.

**Constraint**: Setiap user hanya punya 1 system role pada satu waktu.

### FR-USER-03: Assign Structural Position

Super admin dapat assign/akhiri structural position untuk dosen/pegawai.

**Detail**:
- Pilih dosen/pegawai + pilih position_code + input tanggal mulai + tanggal selesai (optional)
- Saat tanggal selesai tercapai: position otomatis `is_active = false` (cron job)
- Hanya 1 orang yang boleh pegang position yang sama pada satu waktu (kecuali Plt)

### FR-USER-04: Import Bulk Data

Super admin dapat import data mahasiswa/dosen/pegawai dari file Excel (.xlsx).

**Format template Excel**: disediakan sistem (download template dari admin panel).

**Validasi**:
- Duplicate NIM/NIP/NIDN: skip + log error
- Format tidak sesuai: tampilkan baris yang error

### FR-USER-05: Profil User

Setiap user dapat:
- Lihat dan edit profil sendiri (nama, email, foto profil, nomor HP)
- Ubah password (input password lama + baru + konfirmasi)
- Upload TTD scan (hanya untuk dosen & pegawai pejabat)
- Atur preferensi notifikasi (email: On/Off)

**Acceptance Criteria TTD Scan**:

```
AC-USER-05-01: Upload TTD scan berhasil
GIVEN user adalah dosen dengan structural position aktif
WHEN upload file PNG/JPG max 1MB
THEN file tersimpan di /storage/ttd_scan/{user_id}/ttd.png
  AND preview TTD muncul di profil
  AND audit log "file.uploaded" (tipe: ttd_scan) tercatat

AC-USER-05-02: TTD scan terlalu besar
WHEN upload file 2MB (> max 1MB)
THEN error ERR_VAL_FILE_TOO_LARGE
```

---

# Bagian 4: Kebutuhan Fungsional — Modul Workflow Pengajuan

## 4.1 Submit Pengajuan

### FR-WF-01: Mahasiswa Submit Pengajuan Baru

**Deskripsi**: Mahasiswa mengajukan layanan via form digital.

**Detail**:
- Mahasiswa pilih layanan dari menu (hanya layanan yang eligible yang ditampilkan)
- Sistem tampilkan form sesuai konfigurasi `field_layanan` untuk layanan tersebut
- Mahasiswa isi field + upload dokumen wajib
- Sistem validasi:
  1. Semua field wajib terisi
  2. Semua dokumen wajib ter-upload
  3. Prasyarat layanan terpenuhi (mis. TA-02 butuh TA-01 selesai)
  4. Tidak ada pengajuan aktif untuk layanan yang sama
- Jika valid: pengajuan ter-create, nomor di-reserve, notifikasi ke approver pertama
- Jika tidak valid: tampilkan error spesifik per field

Lihat process logic detail di masing-masing BPMN layanan.

### FR-WF-02: Validasi Eligibility per Layanan

Sistem menampilkan dan mem-blok pengajuan berdasarkan eligibility:

| Layanan | Kondisi Eligibility |
|---|---|
| TA-01 | Mahasiswa aktif, tidak ada TA-01 aktif |
| TA-02 | TA-01 selesai |
| TA-03 | TA-02 selesai |
| TA-04 | TA-03 selesai + hasil LAYAK |
| TA-05 | TA-04 selesai + LULUS + TA-06 selesai |
| TA-06 | Mahasiswa aktif (bisa kapan saja) |
| AK-01,02,04,05,06 | Mahasiswa aktif |
| AK-03 | Status alumni, keluar, atau DO |
| AK-07 | Mahasiswa aktif atau alumni |

## 4.2 Eksekusi Action Workflow

### FR-WF-03: Approver Melakukan Action

**Deskripsi**: Approver di tiap step bisa approve, reject, atau sign.

**Detail**:
- Dashboard menampilkan task yang menunggu tindakan user (sesuai role + assignment)
- User buka detail pengajuan → lihat data lengkap + dokumen
- User pilih action (tombol yang tersedia sesuai konfigurasi step)
- Untuk reject: wajib isi alasan
- Untuk destructive action (reject, terminate): tampilkan Alert Dialog konfirmasi
- Sistem eksekusi action:
  1. Validasi state transition
  2. Simpan action data
  3. Update status pengajuan
  4. Create audit log
  5. Kirim notifikasi ke pihak relevan
  6. Schedule SLA timer untuk step berikutnya

### FR-WF-04: Reject Bertingkat (WD1/Dekan)

**Deskripsi**: WD1 dan Dekan tidak boleh reject langsung ke mahasiswa. Harus pilih role target.

**Detail**:
- WD1/Dekan klik "Kembalikan"
- Dropdown muncul: daftar role yang valid sesuai layanan
  - TA-01: Staff Prodi, PA, Kaprodi
  - TA-02: Staff Prodi, Sekprodi
  - TA-03/04: Staff Prodi, Sekprodi
  - TA-05: Staff Prodi, Sekprodi
  - AK: Staff Akademik, Kabag
- WD1/Dekan pilih target + isi alasan (wajib)
- Pengajuan kembali ke step target + diberi marker `returned_from`
- Approver yang mendapat pengajuan balik melihat badge "Dikembalikan dari WD1/Dekan"

### FR-WF-05: Resubmit setelah Revisi

**Deskripsi**: Mahasiswa yang pengajuannya ditolak dapat memperbaiki dan submit ulang.

**Detail**:
- Mahasiswa buka pengajuan dengan status `revision_required`
- Lihat alasan penolakan di activity timeline
- Edit field yang perlu diperbaiki + upload dokumen baru jika perlu
- Submit ulang → versi baru tercipta (snapshot)
- Workflow mulai dari awal (Step 1: verifikasi staff)

## 4.3 SLA Management

### FR-WF-06: SLA Timer

Setiap step punya SLA (hari kerja). Sistem:
- Hitung deadline = tanggal masuk step + SLA hari kerja
- Cron job harian cek apakah ada step yang lewat SLA
- Jika lewat: kirim reminder notifikasi ke approver
- Khusus TA-01 step PA: jika lewat 7 hari → trigger bypass

### FR-WF-07: Bypass Mechanism (TA-01)

Lihat detail di [BPMN-TA01] Step TA01-03B.

**Ringkasan**:
- PA tidak respon dalam 7 hari kerja → status `bypass_active`
- Generate Formulir Bypass PDF
- Mahasiswa offline ke PA → TTD basah → upload scan
- Workflow lanjut ke Kaprodi (skip step PA)

## 4.4 Versioning

### FR-WF-08: Snapshot Versi

Setiap kali mahasiswa resubmit (setelah revision_required), sistem membuat snapshot baru di `pengajuan_versi`. Versi lama tetap accessible (read-only) melalui toggle di UI.

---

# Bagian 5: Kebutuhan Fungsional — 13 Layanan

## 5.1 Layanan Tugas Akhir

### FR-TA01: Pengajuan Judul Skripsi

Lihat workflow detail di [BPMN-TA01]. Requirements utama:

- **FR-TA01-01**: Mahasiswa submit 3-5 judul + pilih PA dari daftar dosen aktif
- **FR-TA01-02**: PA punya UI khusus dengan radio button untuk pilih 1 judul
- **FR-TA01-03**: Saat PA pilih judul → sistem auto-create record `judul_skripsi` (living entity)
- **FR-TA01-04**: Bypass otomatis jika PA tidak respon dalam 7 hari kerja
- **FR-TA01-05**: Dokumen output: Surat Persetujuan Judul Skripsi (TTD WD1)

### FR-TA02: SK Pembimbing Skripsi

Lihat [BPMN-TA02]. Requirements utama:

- **FR-TA02-01**: Sekprodi tetapkan Pembimbing 1 & 2 dari dosen aktif fakultas
- **FR-TA02-02**: Pembimbing 1 dan 2 harus berbeda
- **FR-TA02-03**: Sekprodi input Nomor & Tanggal Surat Permohonan Prodi (dual numbering)
- **FR-TA02-04**: Dokumen output punya 2 nomor: SK Fakultas + Nomor Prodi
- **FR-TA02-05**: Dokumen output: SK Pembimbing Skripsi (TTD Dekan)

### FR-TA03: Seminar Proposal

Lihat [BPMN-TA03]. Requirements utama:

- **FR-TA03-01**: Staff Prodi verifikasi + jadwalkan (1 step: tanggal/waktu/ruang)
- **FR-TA03-02**: Sekprodi tetapkan Penguji 1 & 2 dari dosen aktif fakultas
- **FR-TA03-03**: Penguji 1 & 2 berbeda satu sama lain
- **FR-TA03-04**: Setelah sidang: masing-masing Penguji input nilai + keputusan (LAYAK/TIDAK LAYAK)
- **FR-TA03-05**: Sistem auto-generate Berita Acara setelah kedua penguji input nilai
- **FR-TA03-06**: Dokumen output: 3 dokumen (Surat Tugas, Berita Acara, Daftar Hadir), TTD WD1

### FR-TA04: Ujian Komprehensif

Lihat [BPMN-TA04]. Requirements utama:

- **FR-TA04-01**: Prasyarat: TA-03 selesai dengan hasil LAYAK
- **FR-TA04-02**: Dua jenis penguji: Penguji Keahlian Prodi + Penguji Keislaman
- **FR-TA04-03**: Formula nilai: P = (X1 + X2) / 2 (auto-calculate)
- **FR-TA04-04**: Dokumen output: 5 dokumen (Form I-IV K + Surat Tugas), TTD WD1
- **FR-TA04-05**: Jika TIDAK LULUS: mahasiswa bisa submit TA-04 baru untuk ujian ulang

### FR-TA05: Ujian Skripsi (Munaqasyah)

Lihat [BPMN-TA05]. Requirements utama:

- **FR-TA05-01**: Prasyarat: TA-04 LULUS dan TA-06 selesai
- **FR-TA05-02**: Sekprodi tetapkan penjadwalan + majelis 6 dosen dalam 1 step
- **FR-TA05-03**: Pembimbing 1 & 2 auto-fill dari TA-02 (read-only, tidak bisa diubah)
- **FR-TA05-04**: Validasi: semua 6 dosen majelis harus berbeda ID
- **FR-TA05-05**: Hanya Sekretaris Sidang yang input nilai (bukan masing-masing penguji)
- **FR-TA05-06**: Sistem auto-calculate yudisium (MEMUASKAN/SANGAT MEMUASKAN/PUJIAN)
- **FR-TA05-07**: Dokumen output: 5 dokumen, TTD Dekan
- **FR-TA05-08**: Jika TIDAK LULUS: pengajuan selesai (keputusan tidak lulus), mahasiswa submit baru

### FR-TA06: Cek Turnitin

Lihat [BPMN-TA06]. Requirements utama:

- **FR-TA06-01**: Mahasiswa input Submission ID + URL + persentase similarity dari Turnitin
- **FR-TA06-02**: Kepala Lab verifikasi dan approve/reject
- **FR-TA06-03**: Batas similarity default 25% (configurable)
- **FR-TA06-04**: Maksimal 3x revisi; lewat dari itu → terminated
- **FR-TA06-05**: Setiap revisi: mahasiswa upload ulang draft yang sudah diperbaiki
- **FR-TA06-06**: Dokumen output: Sertifikat Turnitin (TTD Kepala Lab)

## 5.2 Layanan Akademik

Lihat [BPMN-AK] untuk detail per layanan. Requirements umum:

- **FR-AK-01**: Semua layanan AK mengikuti workflow: Mhs → Staff Akademik → Kabag → WD1/Dekan
- **FR-AK-02**: Kabag selalu ada di semua layanan AK (tidak bisa skip)
- **FR-AK-03**: AK-02 punya conditional field (data PNS muncul jika toggle orang tua PNS = ya)
- **FR-AK-03-ALT**: AK-03 hanya untuk mahasiswa berstatus alumni, keluar, atau DO
- **FR-AK-04**: AK-04 dan AK-06 auto-create assignment dosen pembimbing saat submit
- **FR-AK-05**: AK-05 auto-fill judul dari `judul_skripsi.judul_aktif` jika ada
- **FR-AK-06**: AK-07 conditional dokumen (transkrip wajib jika tipe = beasiswa/lanjut studi)

---

# Bagian 6: Kebutuhan Fungsional — Document Generation

## 6.1 Live Preview Document

### FR-DOC-01: Preview Sejak Submit

Sistem generate PDF preview segera setelah mahasiswa submit pengajuan.

**Detail**:
- Data yang sudah ada di-render normal
- Field yang belum final ditandai **background kuning**:
  - Nomor surat (placeholder: "[NOMOR SURAT]" dengan background kuning)
  - TTD area (placeholder: "Menunggu TTD [Nama Pejabat]" dengan background kuning)
  - QR Code (placeholder kotak kuning dengan text "QR Code akan aktif setelah TTD final")
- Preview dapat didownload oleh mahasiswa dan semua approver kapan saja

## 6.2 Reserved Numbering

### FR-DOC-02: Reserve Nomor Surat Saat Submit

Nomor surat di-reserve saat pengajuan dibuat (bukan saat TTD final), sesuai pattern Srikandi.

**Format**: `[NO_URUT]/Un.17/F.III/[KODE_KLASIFIKASI]/[BULAN_ROMAWI]/[TAHUN]`

**Detail**:
- Counter di-increment atomically (pakai database locking untuk hindari race condition)
- Nomor ter-reserve masuk tabel `penomoran_counter` dengan status `reserved`
- Jika pengajuan dibatalkan (terminated): nomor ditandai `void` — counter tidak di-rollback
- Saat TTD final: nomor status berubah `active` + tanggal final tersimpan

**Khusus TA-02 (Dual Numbering)**:
- Nomor SK Fakultas: di-reserve saat submit (kode KP.01.2, scope fakultas)
- Nomor Surat Prodi: di-input manual oleh Sekprodi (bukan dari counter sistem)

## 6.3 Multi-Document Generation

### FR-DOC-03: Generate Multiple Dokumen

Beberapa layanan menghasilkan lebih dari 1 dokumen:
- TA-03: 3 dokumen
- TA-04: 5 dokumen
- TA-05: 5 dokumen

Sistem generate semua dokumen dalam satu batch saat TTD final. Semua dokumen tersedia untuk didownload setelah pengajuan selesai.

## 6.4 TTD Scan Embedding

### FR-DOC-04: Embed TTD Scan ke Dokumen

Saat pejabat klik "Tanda Tangan":
1. Sistem cek pejabat sudah upload TTD scan (jika belum → error ERR_BUS_TTD_NOT_UPLOADED)
2. Sistem generate PDF final dengan TTD scan di-embed pada posisi yang tepat sesuai template
3. Nama pejabat + NIP + jabatan tercetak di bawah TTD
4. Tanggal TTD = tanggal saat sign

## 6.5 QR Code Verifikasi

### FR-DOC-05: Generate QR Code & Token

Saat dokumen final ter-generate:
- Sistem generate token verifikasi (12-16 karakter alfanumerik unik, mis. `A7K9-PQRZ-2BX8`)
- Sistem generate QR Code berisi URL: `https://[domain]/verifikasi?doc=[doc_id]`
- QR Code dan token dicetak di footer dokumen
- Record `dokumen_verifikasi` dibuat di database

### FR-DOC-06: Halaman Verifikasi Publik

URL `/verifikasi` dapat diakses **tanpa login**:
1. User scan QR Code → halaman terbuka
2. Input token dari dokumen → klik Verifikasi
3. Sistem cek token di database
4. Tampilkan: ✅ Dokumen Valid + info (nomor surat, nama, jenis, tanggal, penandatangan)
   ATAU ❌ Token tidak valid

**Rate limit**: 10 percobaan per IP per menit.

---

# Bagian 7: Kebutuhan Fungsional — Notifikasi

## 7.1 In-App Notification

### FR-NOTIF-01: Drawer Notifikasi

- Ikon lonceng 🔔 di header dengan badge jumlah unread
- Klik → buka Sheet/Drawer dari kanan
- Tampilkan list notifikasi (terbaru di atas)
- Fitur: Mark all as read, Clear all, Filter (semua/belum dibaca)
- In-app notification selalu aktif, tidak bisa dimatikan user

### FR-NOTIF-02: Persistence Notifikasi

Notifikasi tersimpan di database (`notifications` table). Tidak hilang saat user logout/login ulang.

## 7.2 Email Notification

### FR-NOTIF-03: Pengiriman Email

- User bisa toggle email On/Off dari pengaturan profil
- Default: On
- Email dikirim via SMTP yang dikonfigurasi admin
- Template email: hardcoded (konsisten), tidak bisa diubah admin

### FR-NOTIF-04: Event yang Trigger Notifikasi

Lihat [INV] Section 10.5 dan [KON-4] Bagian 13.2.2 untuk daftar lengkap.

Ringkasan event utama:

| Event | Penerima | Channel |
|---|---|---|
| Pengajuan disubmit | Approver pertama | In-app + Email |
| Pengajuan disetujui (tiap step) | Mahasiswa | In-app |
| Pengajuan ditolak | Mahasiswa | In-app + Email |
| Dokumen final selesai | Mahasiswa | In-app + Email |
| Pengajuan baru menunggu | Approver | In-app + Email |
| Reminder SLA | Approver | In-app + Email |
| Bypass TA-01 aktif | Mahasiswa + PA + Staff | In-app + Email |
| Majelis sidang ditunjuk | Dosen majelis | In-app + Email |

---

# Bagian 8: Kebutuhan Fungsional — Arsip & Tracking

## 8.1 Tracking Pengajuan

### FR-TRACK-01: Halaman Detail Pengajuan

Setiap pengajuan punya halaman detail yang menampilkan:
- Info dasar (kode, jenis, tanggal, status saat ini)
- Progress bar visual (tiap step jadi satu bulatan, warna sesuai status)
- Activity timeline (kronologi semua aktivitas — siapa, kapan, action apa, alasan)
- Data & dokumen yang di-upload mahasiswa
- Tombol aksi (sesuai role & step yang aktif)

### FR-TRACK-02: Progress Bar

Indikator visual tahap workflow:
- ✅ Hijau: step sudah selesai
- ⏰ Amber/Orange: step sedang berjalan (aktif sekarang)
- ⬜ Abu-abu: step belum dimulai

### FR-TRACK-03: Activity Timeline

Setiap entry timeline berisi:
- Timestamp (DD MMMM YYYY HH:mm WIB)
- Aktor (nama + role)
- Aksi (diajukan, disetujui, ditolak, dll)
- Alasan (jika reject)
- Catatan (jika ada)

### FR-TRACK-04: Versi Pengajuan

Jika pengajuan pernah direvisi, tampilkan toggle "Lihat versi sebelumnya":
- Daftar versi (v1, v2, v3, ...)
- User bisa lihat data snapshot versi lama (read-only)

### FR-TRACK-05: List Pengajuan dengan Filter

Halaman daftar pengajuan (per role, per scope) dengan filter:
- Status (semua / aktif / selesai / terminated)
- Jenis layanan
- Rentang tanggal pengajuan
- Semester (default: aktif)
- Search by kode pengajuan atau nama mahasiswa

## 8.2 Arsip Dokumen

### FR-ARSIP-01: Akses Arsip per Role

Pengajuan berstatus `selesai` otomatis masuk arsip. Akses per role:

| Role | Akses Arsip |
|---|---|
| Mahasiswa | Pengajuan miliknya sendiri |
| Dosen (PA/Pembimbing/Penguji/Majelis) | Pengajuan dimana dia terlibat (assignment aktif) |
| Staff Prodi | Semua pengajuan TA prodinya |
| Staff Akademik | Semua pengajuan AK fakultas |
| Kaprodi/Sekprodi | Semua pengajuan TA prodinya |
| Kabag | Semua pengajuan AK fakultas |
| WD1/Dekan | Semua pengajuan yang dia TTD + arsip umum fakultas |

### FR-ARSIP-02: Dosen — Menu "Surat & SK Saya"

Dosen punya menu khusus untuk melihat dokumen yang melibatkan dirinya:
- Tab "Sebagai Pembimbing Skripsi" → daftar SK Pembimbing dimana dia tercantum
- Tab "Sebagai Penguji" → daftar Surat Tugas Penguji
- Tab "Sebagai Majelis Sidang" → daftar Surat Tugas Sidang
- Setiap item tampilkan: nama mahasiswa, judul skripsi, jadwal, tombol download

### FR-ARSIP-03: Download Ulang Dokumen

Semua dokumen final dapat didownload ulang kapan saja dari arsip. Tidak ada expiry.

---

# Bagian 9: Kebutuhan Fungsional — Admin Panel

## 9.1 Manajemen Layanan

### FR-ADMIN-01: Kelola Field Input per Layanan

Super admin dapat menambah, mengedit, menghapus, dan mengurutkan field input mahasiswa per layanan via UI admin panel (drag-and-drop urutan).

Konfigurasi per field:
- Nama field, label tampilan
- Tipe (text, textarea, number, date, select, radio, checkbox, file, repeater, dosen_picker)
- Wajib/opsional
- Validation rules
- Conditional display
- Urutan

### FR-ADMIN-02: Kelola Dokumen Persyaratan per Layanan

Super admin dapat menambah, mengedit, menghapus dokumen persyaratan per layanan.

Konfigurasi per dokumen:
- Nama dokumen
- Format file yang diterima
- Ukuran maksimal
- Wajib/opsional
- Keterangan untuk mahasiswa

### FR-ADMIN-03: Kelola Workflow per Layanan

Super admin dapat mengkonfigurasi workflow steps per layanan:
- Urutan step
- Actor per step
- Actions tersedia per step
- SLA (hari kerja) per step
- Konsekuensi SLA terlewat

### FR-ADMIN-04: Kelola Template Dokumen Output

Super admin dapat upload/update template PDF per layanan. Template menggunakan placeholder variable yang di-replace dengan data pengajuan.

## 9.2 Manajemen Academic Period

### FR-ADMIN-05: CRUD Semester

Super admin dapat:
- Buat semester baru (nama, tahun akademik, tipe, tanggal mulai, tanggal selesai)
- Aktifkan semester (otomatis non-aktifkan yang lama)
- Override manual jika perlu

### FR-ADMIN-06: Semester Selector di Dashboard

Semua halaman dashboard punya selector semester (default: aktif). Switch ke semester lain → data otomatis filter + mode read-only.

## 9.3 Konfigurasi Sistem

### FR-ADMIN-07: Pengaturan Umum

- Upload logo fakultas
- Konfigurasi footer dokumen (nama institusi, alamat, dll)
- Konfigurasi SMTP (host, port, email, password)
- Konfigurasi batas similarity Turnitin (default 25%)

## 9.4 Monitoring

### FR-ADMIN-08: Dashboard Monitoring

Super admin melihat:
- Statistik pengajuan per layanan per semester
- Pengajuan yang stuck (tidak ada aktivitas > N hari)
- Status SLA (berapa yang tepat waktu vs terlambat)
- Log aktivitas sistem

---

# Bagian 10: Kebutuhan Non-Fungsional

## 10.1 Performa

### NFR-PERF-01: Response Time API

- API endpoint list/detail pengajuan: ≤ 500ms (95th percentile)
- Upload file: tergantung koneksi + ukuran file
- Generate PDF: ≤ 3 detik per dokumen
- Halaman verifikasi publik: ≤ 300ms

### NFR-PERF-02: Concurrent Users

- Sistem harus support minimal 50 concurrent users tanpa degradasi signifikan
- Database connection pool: minimum 20 koneksi

### NFR-PERF-03: File Upload

- File upload menggunakan chunked upload untuk file besar (> 5MB)
- Progress indicator selama upload

## 10.2 Keamanan

### NFR-SEC-01: Authorization

- Setiap API endpoint cek authorization di server-side (tidak hanya client-side)
- Scope filtering diterapkan di semua query data pengajuan
- File storage tidak accessible via URL public

### NFR-SEC-02: Input Validation

- Semua input user divalidasi dengan Zod schema di server-side
- File type validation: cek MIME type + extension (defense in depth)
- Path traversal prevention pada file paths

### NFR-SEC-03: Password Security

- Hash password dengan bcrypt (cost factor 12) atau argon2
- Password minimum 8 karakter

### NFR-SEC-04: Rate Limiting

| Endpoint | Limit |
|---|---|
| Login | 5 attempts/menit per IP |
| Verifikasi publik | 10 attempts/menit per IP |
| API authenticated | 100 requests/menit per user |
| File upload | 20 uploads/jam per user |

### NFR-SEC-05: HTTPS

Seluruh traffic wajib HTTPS. HTTP redirect ke HTTPS.

### NFR-SEC-06: Session Security

- Session token disimpan di HttpOnly cookie (tidak accessible via JavaScript)
- Session di-revoke saat logout
- Session expire setelah 7 hari (rolling), atau 2 jam idle

## 10.3 Ketersediaan

### NFR-AVAIL-01: Uptime Target

- Target uptime: 99% (downtime max ~87 jam/tahun)
- Maintenance window: Sabtu malam 23:00 - 02:00 WIB

### NFR-AVAIL-02: Backup

- Backup database: harian otomatis, retention 30 hari
- Backup file storage: mingguan, retention 1 tahun
- Recovery Time Objective (RTO): ≤ 4 jam
- Recovery Point Objective (RPO): ≤ 24 jam

## 10.4 Maintainability

### NFR-MAIN-01: Kode

- TypeScript strict mode
- Semua function public terdokumentasi (JSDoc)
- Test coverage ≥ 80% untuk business logic
- Tidak ada `any` type kecuali alasan yang terdokumentasi

### NFR-MAIN-02: Database

- Semua perubahan skema via migration file (Prisma migrate)
- Tidak ada query langsung tanpa ORM kecuali untuk performance-critical query yang terdokumentasi
- Seed data tersedia untuk development/staging

## 10.5 Usability

### NFR-USE-01: Bahasa

Seluruh UI dalam **Bahasa Indonesia**. Error message dalam Bahasa Indonesia (user-facing).

### NFR-USE-02: Responsive

Aplikasi harus dapat digunakan di:
- Desktop (1280px+): full feature
- Tablet (768px-1279px): full feature, layout adjusted
- Mobile (< 768px): functional, beberapa tabel scroll horizontal

### NFR-USE-03: Aksesibilitas

- Semua form field punya label yang jelas
- Tombol punya teks yang deskriptif (bukan hanya ikon)
- Error message spesifik (bukan hanya "terjadi kesalahan")
- Feedback loading state untuk semua async operation

## 10.6 Portability

### NFR-PORT-01: Browser Support

- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

---

# Bagian 11: Batasan & Asumsi

## 11.1 Batasan Teknis Phase 1

| No | Batasan | Keterangan |
|---|---|---|
| 1 | Tidak ada integrasi SIAKAD | Validasi IPK/SKS dilakukan manual oleh staff |
| 2 | Tidak ada TTE tersertifikasi BSrE | TTD scan + QR Code (cukup untuk dokumen layanan mahasiswa) |
| 3 | Storage lokal (bukan cloud) | Siap di-upgrade ke Cloudflare R2 di Phase 2 |
| 4 | Notifikasi WhatsApp belum aktif | Infrastruktur disiapkan, aktifkan saat API WhatsApp Business dibeli |
| 5 | Tidak ada modul bimbingan skripsi online | Bimbingan tetap di luar sistem |
| 6 | Tidak ada mobile app native | Responsive web saja |
| 7 | Tidak ada bulk approval | Setiap pengajuan harus di-approve satu per satu |
| 8 | Data mahasiswa/dosen/pegawai import manual | Belum ada sinkronisasi otomatis dari SIAKAD/SIMPEG |

## 11.2 Asumsi

| No | Asumsi |
|---|---|
| 1 | Setiap pejabat yang perlu TTD sudah upload gambar TTD scan sebelum sistem digunakan |
| 2 | Data awal (dosen, pegawai, mahasiswa) sudah di-import via bulk import sebelum go-live |
| 3 | Kampus memiliki SMTP server yang bisa dipakai untuk kirim email |
| 4 | Koneksi internet server stabil untuk pengiriman email |
| 5 | Template dokumen output (14 template existing) sudah dikonversi ke format template SILA |
| 6 | Aturan akademik formal akan dirumuskan paralel oleh stakeholder kampus |
| 7 | Pilot deployment di 1 prodi sebelum rollout ke semua prodi |

## 11.3 Dependensi

| Dependensi | Keterangan |
|---|---|
| Template PDF | 14 template harus dikonversi ke format sistem |
| TTD scan pejabat | Semua pejabat harus upload TTD scan sebelum go-live |
| Data master | Mahasiswa, dosen, pegawai, prodi harus di-seed sebelum go-live |
| Email SMTP | Konfigurasi email server dibutuhkan untuk notifikasi |
| Domain & SSL | Domain + sertifikat SSL dibutuhkan sebelum deploy production |
