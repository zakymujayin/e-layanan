# Use Case Diagram & Specification
# Sistem Informasi Layanan Akademik (SILA)

**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## Use Case Overview (Diagram Tekstual)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SISTEM SILA                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AUTH                                                               │   │
│  │  UC-01 Login                                                        │   │
│  │  UC-02 Logout                                                       │   │
│  │  UC-03 Lupa Password                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYANAN TA (Mahasiswa)                                             │   │
│  │  UC-10 Submit TA-01  UC-11 Submit TA-02  UC-12 Submit TA-03        │   │
│  │  UC-13 Submit TA-04  UC-14 Submit TA-05  UC-15 Submit TA-06        │   │
│  │  UC-16 Revisi & Resubmit Pengajuan                                 │   │
│  │  UC-17 Download Formulir Bypass (TA-01)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYANAN AK (Mahasiswa)                                             │   │
│  │  UC-20 Submit AK-01  UC-21 Submit AK-02  UC-22 Submit AK-03       │   │
│  │  UC-23 Submit AK-04  UC-24 Submit AK-05  UC-25 Submit AK-06       │   │
│  │  UC-26 Submit AK-07                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  WORKFLOW APPROVAL                                                  │   │
│  │  UC-30 Verifikasi Berkas (Staff Prodi/Akademik)                    │   │
│  │  UC-31 Pilih Judul (PA)                                            │   │
│  │  UC-32 Tetapkan Pembimbing (Sekprodi - TA-02)                      │   │
│  │  UC-33 Jadwalkan & Tetapkan Penguji (Staff+Sekprodi - TA-03/04)   │   │
│  │  UC-34 Jadwalkan & Tetapkan Majelis (Sekprodi - TA-05)            │   │
│  │  UC-35 Approval Kaprodi                                            │   │
│  │  UC-36 Approval Kabag                                              │   │
│  │  UC-37 TTD WD1                                                     │   │
│  │  UC-38 TTD Dekan                                                   │   │
│  │  UC-39 Review Turnitin (Kepala Lab)                                │   │
│  │  UC-40 Input Nilai Sidang (Penguji/Sekretaris)                     │   │
│  │  UC-41 Reject Bertingkat (WD1/Dekan)                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ARSIP & TRACKING                                                   │   │
│  │  UC-50 Lihat Status Pengajuan                                      │   │
│  │  UC-51 Download Dokumen Final                                      │   │
│  │  UC-52 Lihat Riwayat Versi                                         │   │
│  │  UC-53 Download SK/Surat Tugas Sendiri (Dosen)                     │   │
│  │  UC-54 Cari & Filter Pengajuan                                     │   │
│  │  UC-55 Verifikasi Dokumen Publik (tanpa login)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ADMIN PANEL                                                        │   │
│  │  UC-60 Kelola User    UC-61 Kelola Master Data                     │   │
│  │  UC-62 Kelola Layanan (Form+Workflow+Dokumen Persyaratan)          │   │
│  │  UC-63 Kelola Academic Period    UC-64 Konfigurasi Sistem          │   │
│  │  UC-65 Import Bulk Data    UC-66 Monitoring Dashboard              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
     ↑           ↑          ↑          ↑          ↑         ↑
 Mahasiswa    Dosen    Staff Prodi  Staff Akad  Kabag   Super Admin
                        /Sekprodi
                        /Kaprodi
```

---

## Aktor & Peran

| Aktor | Peran Utama | Use Case Utama |
|---|---|---|
| **Mahasiswa** | Pemohon layanan | UC-10 s.d. UC-26, UC-16, UC-17, UC-50, UC-51, UC-52, UC-54 |
| **Dosen (PA)** | Pilih judul TA-01 | UC-31 |
| **Dosen (Penguji/Majelis)** | Input nilai sidang | UC-40, UC-53 |
| **Dosen (WD1/Dekan)** | TTD final | UC-37, UC-38, UC-41 |
| **Dosen (Kaprodi)** | Approval TA-01 | UC-35 |
| **Dosen (Sekprodi)** | Tetapkan penguji/majelis | UC-32, UC-33, UC-34 |
| **Staff Prodi** | Verifikasi + jadwalkan TA | UC-30, UC-33 |
| **Staff Akademik** | Verifikasi AK | UC-30 |
| **Kabag** | Approval AK | UC-36, UC-41 |
| **Kepala Lab** | Review Turnitin | UC-39 |
| **Super Admin** | Kelola sistem | UC-60 s.d. UC-66 |
| **Publik** | Verifikasi dokumen | UC-55 |

---

## Spesifikasi Use Case Detail

### UC-10: Submit Pengajuan TA-01 (Judul Skripsi)

| Atribut | Detail |
|---|---|
| **ID** | UC-10 |
| **Nama** | Submit Pengajuan Judul Skripsi |
| **Aktor Utama** | Mahasiswa |
| **Aktor Pendukung** | Sistem |
| **Trigger** | Mahasiswa klik "Ajukan TA-01" |
| **Preconditions** | 1. Mahasiswa login, 2. Status aktif, 3. Tidak ada TA-01 aktif, 4. Semester aktif tersedia |
| **Postconditions** | Pengajuan tercipta status `pending_staff_prodi`, nomor di-reserve, notifikasi terkirim |

**Main Flow**:
1. Sistem tampilkan form TA-01
2. Mahasiswa isi 3-5 judul skripsi
3. Mahasiswa pilih Dosen PA dari dropdown
4. Mahasiswa upload 3 dokumen wajib
5. Mahasiswa klik Submit
6. Sistem validasi semua field & dokumen
7. Sistem create pengajuan + reserve nomor surat
8. Sistem create assignment `dosen_pa`
9. Sistem kirim notifikasi ke Staff Prodi
10. Mahasiswa redirect ke halaman detail pengajuan

**Alternative Flows**:
- AF-1: Mahasiswa hanya isi 2 judul → Step 6 gagal, error "Minimal 3 judul"
- AF-2: Dokumen wajib belum semua di-upload → Step 6 gagal, error per dokumen
- AF-3: Sudah ada pengajuan TA-01 aktif → Step 7 gagal, error "Sudah ada pengajuan aktif"

---

### UC-31: Pilih Judul (PA)

| Atribut | Detail |
|---|---|
| **ID** | UC-31 |
| **Nama** | PA Pilih 1 Judul Skripsi |
| **Aktor Utama** | Dosen (Pembimbing Akademik) |
| **Trigger** | PA melihat notifikasi + klik pengajuan di dashboard |
| **Preconditions** | 1. Status pengajuan `pending_pa`, 2. User adalah PA mahasiswa ini |
| **Postconditions** | Status `pending_kaprodi`, `judul_skripsi` tercipta, notifikasi ke Kaprodi |

**Main Flow**:
1. PA buka halaman detail pengajuan
2. Sistem tampilkan 3-5 judul dengan radio button
3. PA pilih 1 judul
4. PA isi catatan (opsional)
5. PA klik "Pilih & Lanjutkan"
6. Sistem create record `judul_skripsi` (living entity)
7. Sistem update status ke `pending_kaprodi`
8. Sistem kirim notifikasi ke Kaprodi + Mahasiswa

**Alternative Flows**:
- AF-1: PA tidak puas dengan semua judul → pilih "Tolak Semua" → isi alasan wajib → mahasiswa revisi

---

### UC-33: Staff Prodi Jadwalkan + Sekprodi Tetapkan Penguji (TA-03/04)

| Atribut | Detail |
|---|---|
| **ID** | UC-33 |
| **Nama** | Verifikasi, Penjadwalan, dan Penetapan Penguji (TA-03/04) |
| **Aktor Utama** | Staff Prodi (penjadwalan), Sekprodi (penguji) |
| **Trigger** | Pengajuan masuk ke step yang relevan |

**Staff Prodi Main Flow**:
1. Buka pengajuan status `pending_staff_prodi`
2. Review dokumen + field input
3. Input tanggal/waktu/ruang sidang
4. Klik Approve
5. Status → `pending_sekprodi`

**Sekprodi Main Flow**:
1. Buka pengajuan status `pending_sekprodi`
2. Pilih Penguji 1 dari dosen_picker (filter: dosen aktif fakultas)
3. Pilih Penguji 2 (berbeda dari Penguji 1)
4. Klik Tetapkan
5. Sistem create assignments `penguji_proposal` / `penguji_komprehensif_*`
6. Status → `pending_wd1`

---

### UC-34: Sekprodi Jadwalkan + Tetapkan Majelis (TA-05)

| Atribut | Detail |
|---|---|
| **ID** | UC-34 |
| **Nama** | Penjadwalan dan Penetapan Majelis Sidang Munaqasyah |
| **Aktor Utama** | Sekprodi |
| **Trigger** | Pengajuan TA-05 status `pending_sekprodi` |
| **Preconditions** | 1. Status `pending_sekprodi`, 2. TA-02 selesai (untuk auto-fill P1/P2) |

**Main Flow**:
1. Sekprodi buka pengajuan TA-05
2. Sistem auto-fill: Pembimbing 1 & 2 dari TA-02 (read-only)
3. Sekprodi input tanggal/waktu/ruang
4. Sekprodi pilih Ketua Sidang
5. Sekprodi pilih Sekretaris Sidang
6. Sekprodi pilih Penguji 1 & 2
7. Sistem validasi: semua 6 dosen berbeda
8. Sekprodi submit
9. Sistem create 4 assignment baru (ketua, sek, p1, p2)
10. Status → `pending_wd1`
11. Notifikasi ke 6 dosen majelis + WD1 + mahasiswa

**Error Scenarios**:
- Ada 2 dosen yang sama → error "Semua anggota majelis harus berbeda"
- Tanggal kurang dari 3 hari → error "Jadwal minimal 3 hari dari sekarang"

---

### UC-40: Input Nilai Sidang

| Atribut | Detail |
|---|---|
| **ID** | UC-40 |
| **Nama** | Input Nilai Sidang (Post-Sidang) |
| **Aktor Utama** | Penguji 1 & 2 (TA-03/04) atau Sekretaris Sidang (TA-05) |
| **Trigger** | Setelah sidang fisik selesai, aktor login dan buka pengajuan |

**Main Flow (TA-03/04 — Penguji)**:
1. Penguji buka pengajuan di menu "Tugas Saya"
2. Input nilai + keputusan (LAYAK/TIDAK LAYAK atau LULUS/TIDAK LULUS)
3. Isi catatan/saran (opsional)
4. Submit
5. Jika kedua penguji sudah input → sistem auto-generate Berita Acara final

**Main Flow (TA-05 — Sekretaris Sidang)**:
1. Sekretaris buka pengajuan di menu "Tugas Saya"
2. Input nilai dari ke-4 penilai (P1, P2, Penguji 1, Penguji 2)
3. Input keputusan (LULUS/TIDAK LULUS)
4. Submit
5. Sistem auto-calculate yudisium
6. Sistem regenerate 4 dokumen dengan nilai + yudisium
7. Notifikasi ke mahasiswa

---

### UC-41: Reject Bertingkat

| Atribut | Detail |
|---|---|
| **ID** | UC-41 |
| **Nama** | Reject Pengajuan Bertingkat (WD1/Dekan atau Kabag) |
| **Aktor Utama** | Wakil Dekan 1, Dekan, atau Kabag |
| **Trigger** | Pejabat menemukan kesalahan di pengajuan yang sudah lolos approver di bawah |

**Main Flow**:
1. Pejabat buka pengajuan di step yang aktif
2. Klik "Kembalikan"
3. Sistem tampilkan Alert Dialog dengan dropdown: pilih role target
4. Pejabat pilih target (mis. Sekprodi, Staff Prodi)
5. Pejabat isi alasan (wajib)
6. Klik konfirmasi
7. Status pengajuan berubah ke step target
8. Pengajuan ditandai `returned_from: [pejabat]`
9. Notifikasi ke role target dengan alasan
10. Saat target perbaiki → workflow re-approval lengkap ke atas

---

### UC-55: Verifikasi Dokumen Publik

| Atribut | Detail |
|---|---|
| **ID** | UC-55 |
| **Nama** | Verifikasi Keaslian Dokumen via QR Code |
| **Aktor Utama** | Publik (siapapun, tanpa login) |
| **Trigger** | Scan QR Code pada dokumen yang diterbitkan SILA |

**Main Flow**:
1. Publik scan QR Code → browser buka `/verifikasi?doc=[doc_id]`
2. Sistem tampilkan form input token
3. Publik input token dari dokumen
4. Sistem cek token di database
5. Jika valid: tampilkan "✅ Dokumen Valid" + info (nomor, nama, jenis, tanggal, penandatangan)
6. Jika tidak valid: tampilkan "❌ Token tidak valid atau dokumen tidak ditemukan"

**Error Scenarios**:
- Rate limit: > 10 percobaan/menit per IP → error + blokir sementara
- Token expired/void: tampilkan status void dengan keterangan

---

### UC-62: Kelola Layanan (Admin Panel)

| Atribut | Detail |
|---|---|
| **ID** | UC-62 |
| **Nama** | Kelola Konfigurasi Layanan |
| **Aktor Utama** | Super Admin |
| **Sub-use cases** | UC-62a Kelola Field Input, UC-62b Kelola Dokumen Persyaratan, UC-62c Kelola Workflow |

**UC-62a: Kelola Field Input**:
1. Admin buka halaman "Kelola Layanan" → pilih layanan
2. Tab "Field Input"
3. Drag-drop untuk urutkan
4. Tambah field: pilih tipe, isi label, atur validasi
5. Edit field: klik edit di field existing
6. Hapus field: klik hapus (konfirmasi)
7. Simpan

**UC-62b: Kelola Dokumen Persyaratan**:
1. Tab "Dokumen Persyaratan"
2. Tambah/edit/hapus dokumen persyaratan
3. Atur format, ukuran max, wajib/opsional, keterangan

**UC-62c: Kelola Workflow**:
1. Tab "Workflow"
2. Lihat daftar step dalam urutan
3. Edit SLA per step
4. Tambah/hapus action per step

---

## Matriks Aktor-Use Case

| Use Case | Mahasiswa | Dosen | Staff Prodi | Staff Akad | Kabag | Kepala Lab | Super Admin | Publik |
|---|---|---|---|---|---|---|---|---|
| UC-01 Login | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| UC-10 sd 15 (Submit TA) | ✓ | - | - | - | - | - | - | - |
| UC-16 Revisi | ✓ | - | - | - | - | - | - | - |
| UC-20 sd 26 (Submit AK) | ✓ | - | - | - | - | - | - | - |
| UC-30 Verifikasi | - | - | ✓ | ✓ | - | - | - | - |
| UC-31 Pilih Judul | - | ✓(PA) | - | - | - | - | - | - |
| UC-32 Tetapkan Pembimbing | - | ✓(Sek) | - | - | - | - | - | - |
| UC-33 Jadwal+Penguji TA03/04 | - | ✓(Sek) | ✓ | - | - | - | - | - |
| UC-34 Jadwal+Majelis TA05 | - | ✓(Sek) | - | - | - | - | - | - |
| UC-35 Approval Kaprodi | - | ✓(Kap) | - | - | - | - | - | - |
| UC-36 Approval Kabag | - | - | - | - | ✓ | - | - | - |
| UC-37 TTD WD1 | - | ✓(WD1) | - | - | - | - | - | - |
| UC-38 TTD Dekan | - | ✓(Dek) | - | - | - | - | - | - |
| UC-39 Review Turnitin | - | - | - | - | - | ✓ | - | - |
| UC-40 Input Nilai | - | ✓(Penguji/Sek) | - | - | - | - | - | - |
| UC-41 Reject Bertingkat | - | ✓(WD1/Dek) | - | - | ✓ | - | - | - |
| UC-50 Lihat Status | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| UC-51 Download Dokumen | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| UC-53 SK/Surat Tugas Dosen | - | ✓ | - | - | - | - | - | - |
| UC-55 Verifikasi Publik | - | - | - | - | - | - | - | ✓ |
| UC-60 sd 66 Admin | - | - | - | - | - | - | ✓ | - |
