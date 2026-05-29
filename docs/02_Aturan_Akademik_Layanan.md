# Dokumen Persyaratan & Aturan per Layanan (Simplified)

**Sistem**: Sistem Informasi Layanan Akademik (SILA)
**Institusi**: Fakultas Ushuluddin dan Adab — UIN Sultan Maulana Hasanuddin Banten
**Versi**: 2.0 (Simplified)
**Tanggal Update**: 28 Mei 2026
**Status**: Draft awal — perlu validasi internal

---

## ⚠️ DISCLAIMER

**Pendekatan baru di v2.0**:
- Dokumen sebelumnya (v1.0) terlalu rumit dengan daftar persyaratan akademik panjang (IPK, SKS, dll)
- v2.0 disederhanakan: sistem **hanya cek "dokumen wajib ada/tidak"**
- Validasi konten dokumen dilakukan **manual oleh staff verifikator**
- Sistem **tidak** validasi IPK, SKS, nilai mata kuliah, dll
- Future-proof untuk integrasi SIAKAD di Phase 2-3

**Yang Anda perlu validasi dengan stakeholder**:
1. Daftar dokumen wajib per layanan (apakah sesuai kebutuhan)
2. Format file & ukuran maksimal
3. Field input yang dibutuhkan per layanan
4. Data tambahan yang harus diinput verifikator per step

---

## Daftar Isi

1. Konsep Verifikasi di Phase 1
2. Persyaratan Umum (untuk Semua Layanan)
3. Layanan Tugas Akhir (TA-01 s.d. TA-06)
4. Layanan Akademik (AK-01 s.d. AK-07)
5. Data yang Diinput Verifikator per Step
6. Action Items untuk Anda

---

## 1. Konsep Verifikasi di Phase 1

### 1.1 Sistem Hanya Cek "Dokumen Ada/Tidak"

Sistem akan **block** pengajuan jika dokumen wajib belum di-upload mahasiswa. Tapi sistem **tidak menilai isi** dokumen tersebut.

### 1.2 Staff yang Nilai Konten

Setelah mahasiswa upload, staff verifikator:
- Buka satu per satu dokumen yang di-upload
- Baca isinya secara manual
- Nilai apakah memenuhi syarat berdasarkan **pengetahuan aturan akademik** (tidak ada di sistem)
- Approve jika lolos, atau Reject dengan alasan jika tidak

### 1.3 Mengapa Pendekatan Ini Dipilih

- **Sistem belum integrasi SIAKAD** — tidak bisa auto-validate IPK/SKS
- **Aturan akademik formal** UIN SMH Banten belum dirumuskan jelas
- **Lebih realistis untuk Phase 1** — hindari over-engineering
- **Future-proof**: kolom `validation_rule` disiapkan di database, aktif saat SIAKAD ready

---

## 2. Persyaratan Umum (untuk Semua Layanan)

Sebelum mengakses layanan apa pun di sistem:

| No | Persyaratan | Validasi |
|---|---|---|
| 1 | Terdaftar sebagai mahasiswa aktif (atau alumni untuk AK-03) | Status di tabel mahasiswa |
| 2 | Memiliki akun aktif di sistem | `users.is_active = true` |
| 3 | Tidak dalam status DO atau diberhentikan | Status mahasiswa bukan `do` atau `keluar` |

---

## 3. Layanan Tugas Akhir

### TA-01: Pengajuan Judul Skripsi

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Judul 1 | Text area | Wajib | Minimal 3 judul |
| Judul 2 | Text area | Wajib | Minimal 3 judul |
| Judul 3 | Text area | Wajib | Minimal 3 judul |
| Judul 4 | Text area | Opsional | Tentatif/cadangan |
| Judul 5 | Text area | Opsional | Tentatif/cadangan |
| Pembimbing Akademik | Dropdown (data dosen) | Wajib | Mahasiswa pilih PA-nya |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Transkrip Nilai Sementara | PDF | 2 MB |
| 2 | KHS Semester Terakhir | PDF | 2 MB |
| 3 | Bukti Pembayaran UKT Semester Berjalan | PDF/JPG | 2 MB |

#### Yang Diinput PA (Pembimbing Akademik)

- **Pilih 1 judul** dari 3-5 yang diajukan mahasiswa (radio button)
- Catatan opsional untuk mahasiswa

#### Yang Diinput Kaprodi

- Approve/Reject saja
- Catatan opsional

---

### TA-02: SK Pembimbing Skripsi

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| - | - | - | Mahasiswa hanya mengajukan, data dari TA-01 |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Surat Persetujuan Judul (dari TA-01) | Auto-attach | - |
| 2 | KRS Semester Berjalan | PDF | 2 MB |

#### Yang Diinput Sekprodi

- **Pembimbing 1** (dropdown data dosen, dengan filter dosen prodi yang sama)
- **Pembimbing 2** (dropdown data dosen)
- **Nomor Surat Permohonan Prodi** (text, counter prodi)
- **Tanggal Surat Permohonan Prodi** (date)

---

### TA-03: Seminar Proposal Skripsi

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| - | - | - | Sebagian besar data dari TA-01, TA-02 |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Draft Proposal Skripsi (lengkap) | PDF | 10 MB |
| 2 | Lembar Persetujuan Pembimbing 1 dan 2 (sudah TTD) | PDF | 2 MB |
| 3 | Form Bimbingan Proposal | PDF | 2 MB |
| 4 | Bukti Pembayaran Seminar Proposal (jika berbayar) | PDF/JPG | 2 MB |
| 5 | KRS yang Memuat Skripsi | PDF | 2 MB |

#### Yang Diinput Staff Prodi (1 step: Verifikasi + Penjadwalan)

- **Hari & Tanggal Sidang** (datetime picker)
- **Waktu Mulai** (time)
- **Waktu Selesai** (time)
- **Ruang Sidang** (dropdown ruangan / text)
- Approve/Reject

#### Yang Diinput Sekprodi

- **Penguji 1** (dropdown dosen, filter dosen fakultas)
- **Penguji 2** (dropdown dosen, filter dosen fakultas)
- Approve/Reject

#### Yang Diinput Penguji 1 & 2 (Setelah Sidang)

- **Nilai** dari masing-masing penguji
- **Catatan/Saran** untuk mahasiswa
- **Keputusan**: LAYAK / TIDAK LAYAK

---

### TA-04: Ujian Komprehensif

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| - | - | - | Data dari layanan sebelumnya |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Transkrip Nilai Terbaru | PDF | 2 MB |
| 2 | Sertifikat Lulus Seminar Proposal (dari TA-03) | Auto-attach | - |
| 3 | Bukti Pembayaran Ujian Komprehensif | PDF/JPG | 2 MB |
| 4 | KRS Semester Berjalan | PDF | 2 MB |

#### Yang Diinput Staff Prodi (1 step: Verifikasi + Penjadwalan)

- Sama dengan TA-03: hari/tanggal/waktu/ruang sidang
- Approve/Reject

#### Yang Diinput Sekprodi

- **Penguji Keahlian Prodi** (dropdown dosen)
- **Penguji Keislaman** (dropdown dosen)
- Approve/Reject

#### Yang Diinput Penguji (Setelah Sidang)

- **Nilai** dari masing-masing penguji (X1 dan X2)
- Sistem auto-calculate: P = (X1 + X2) / 2
- **Keputusan**: LULUS / TIDAK LULUS

---

### TA-05: Ujian Skripsi (Munaqasyah)

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| - | - | - | Data dari layanan sebelumnya |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Skripsi Lengkap (Final Draft) | PDF | 15 MB |
| 2 | Lembar Persetujuan Pembimbing 1 dan 2 untuk Diujikan | PDF | 2 MB |
| 3 | Sertifikat Lulus Ujian Komprehensif (auto-attach dari TA-04) | Auto | - |
| 4 | Sertifikat Hasil Turnitin (auto-attach dari TA-06) | Auto | - |
| 5 | Transkrip Nilai Lengkap | PDF | 2 MB |
| 6 | KRS Semester Berjalan | PDF | 2 MB |
| 7 | Bukti Pembayaran Ujian Skripsi | PDF/JPG | 2 MB |

#### Yang Diinput Staff Prodi (Verifikasi)

- Approve/Reject saja
- Catatan opsional

#### Yang Diinput Sekprodi (Penjadwalan + Penetapan Majelis)

**Penjadwalan**:
- Hari/Tanggal/Waktu/Ruang Sidang

**Penetapan Majelis (6 dosen)**:
- **Ketua Sidang**
- **Sekretaris Sidang**
- **Pembimbing 1** (auto-fill dari TA-02)
- **Pembimbing 2** (auto-fill dari TA-02)
- **Penguji 1**
- **Penguji 2**

#### Yang Diinput Sekretaris Sidang (Setelah Sidang)

- **Nilai** dari Pembimbing 1, Pembimbing 2, Penguji 1, Penguji 2
- Sistem auto-calculate: IPK = ΣXY/ΣY
- Sistem auto-determine **Yudisium**:
  - MEMUASKAN (2.76-3.00)
  - SANGAT MEMUASKAN (3.01-3.50)
  - PUJIAN (>3.51, dengan syarat masa studi)
- **Keputusan**: LULUS / TIDAK LULUS

---

### TA-06: Cek Turnitin

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Judul Skripsi | Text (auto-fill dari TA-01) | - | Auto |
| Tautan Hasil Turnitin | URL | Wajib | Mahasiswa submit ke Turnitin sendiri |
| Submission ID | Text | Wajib | Dari Turnitin |
| Hasil Similarity | Number (%) | Wajib | Dari Turnitin |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Draft Skripsi yang Disubmit ke Turnitin | PDF | 15 MB |
| 2 | Screenshot Hasil Turnitin | PDF/JPG | 2 MB |

#### Yang Diinput Kepala Lab

- Verifikasi data Turnitin
- Approve jika similarity di bawah batas (default 25%)
- Reject jika di atas batas → mahasiswa upload ulang draft yang direvisi
- Maksimal 3x revisi

---

## 4. Layanan Akademik

### AK-01: Surat Aktif Kuliah

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Peruntukan Surat | Text area | Wajib | Untuk apa surat ini (mis. "Tunjangan keluarga") |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Bukti Pembayaran UKT Semester Berjalan | PDF/JPG | 2 MB |

---

### AK-02: Surat Masih Kuliah (PNS/Tunjangan)

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Peruntukan Surat | Text area | Wajib | - |
| Status Orang Tua PNS | Toggle | Wajib | Yes/No |
| Nama Orang Tua | Text | Conditional | Muncul jika PNS = Yes |
| NIP Orang Tua | Text | Conditional | Muncul jika PNS = Yes |
| Pangkat/Golongan Orang Tua | Text | Conditional | Muncul jika PNS = Yes |
| Instansi Orang Tua | Text area | Conditional | Muncul jika PNS = Yes |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Bukti Pembayaran UKT | PDF/JPG | 2 MB |
| 2 | SK CPNS/PNS Orang Tua (jika PNS) | PDF | 2 MB |
| 3 | KK (Kartu Keluarga) | PDF | 2 MB |

---

### AK-03: Surat Pernah Kuliah

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Periode Kuliah | Date range | Wajib | Tahun masuk - tahun lulus/keluar |
| Tujuan Surat | Text area | Wajib | Untuk apa |

#### Dokumen Wajib Upload

Tidak ada dokumen wajib (data diambil dari sistem).

---

### AK-04: Surat Pengantar Observasi

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Mata Kuliah | Text | Wajib | Yang membutuhkan observasi |
| Pejabat Tujuan | Text | Wajib | - |
| Instansi Tujuan | Text | Wajib | - |
| Lokasi Observasi | Repeater (text) | Wajib | Bisa multiple |
| Dosen Pembimbing Observasi | Dropdown dosen | Wajib | Auto-create assignment |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Tugas dari Dosen Pengampu | PDF | 2 MB |
| 2 | Surat Persetujuan Dosen Pembimbing | PDF | 2 MB |

---

### AK-05: Surat Pengantar Penelitian

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Pejabat Tujuan | Repeater (text) | Wajib | Bisa multiple |
| Tempat Penelitian | Repeater (text) | Wajib | Bisa multiple |
| Periode Penelitian | Date range | Wajib | - |
| Tujuan Penelitian | Text area | Wajib | - |
| Judul Skripsi | Auto-fill dari TA-01 | - | - |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Proposal Skripsi | PDF | 10 MB |
| 2 | SK Pembimbing (auto-attach dari TA-02) | Auto | - |

---

### AK-06: Surat Permohonan Magang

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Pejabat Tujuan | Text | Wajib | - |
| Instansi Tujuan | Text | Wajib | - |
| Tanggal Mulai Magang | Date | Wajib | - |
| Tanggal Selesai Magang | Date | Wajib | - |
| Dosen Pembimbing Magang | Dropdown dosen | Wajib | Auto-create assignment |
| Bidang Magang | Text area | Wajib | - |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Proposal Magang | PDF | 2 MB |
| 2 | CV Mahasiswa | PDF | 2 MB |
| 3 | Transkrip Nilai Sementara | PDF | 2 MB |
| 4 | Surat Persetujuan Dosen Pembimbing | PDF | 2 MB |

---

### AK-07: Surat Rekomendasi

#### Field Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| Tujuan Rekomendasi | Text area | Wajib | Untuk apa |
| Pihak Penerima | Text | Wajib | Instansi, kampus tujuan, dll |
| Tipe Rekomendasi | Dropdown | Wajib | Beasiswa / Lanjut Studi / Kerja / Lainnya |

#### Dokumen Wajib Upload

| No | Dokumen | Format | Ukuran Max |
|---|---|---|---|
| 1 | Surat Permohonan dari Mahasiswa | PDF | 2 MB |
| 2 | Dokumen Pendukung (CV, transkrip, dll) | PDF | 2 MB (opsional) |

---

## 5. Data yang Diinput Verifikator per Step

Ringkasan siapa input apa di setiap layanan:

| Layanan | Step | Role | Data Diinput |
|---|---|---|---|
| TA-01 | 2 | Staff Prodi | Approve/Reject |
| TA-01 | 3 | PA | **Pilih 1 judul** + catatan |
| TA-01 | 4 | Kaprodi | Approve/Reject |
| TA-01 | 5 | WD1 | TTD final |
| TA-02 | 2 | Staff Prodi | Approve/Reject |
| TA-02 | 3 | Sekprodi | Pembimbing 1, 2 + Nomor & tanggal surat prodi |
| TA-02 | 4 | WD1 | Approve |
| TA-02 | 5 | Dekan | TTD final |
| TA-03 | 2 | Staff Prodi | Tanggal/waktu/ruang sidang + Approve |
| TA-03 | 3 | Sekprodi | Penguji 1, 2 + Approve |
| TA-03 | 4 | WD1 | TTD final |
| TA-03 | (post) | Penguji 1, 2 | Nilai + keputusan |
| TA-04 | (sama dengan TA-03 polanya) | - | - |
| TA-05 | 2 | Staff Prodi | Approve/Reject |
| TA-05 | 3 | Sekprodi | Penjadwalan + 6 anggota majelis |
| TA-05 | 4 | WD1 | Approve |
| TA-05 | 5 | Dekan | TTD final |
| TA-05 | (post) | Sekretaris Sidang | Nilai dari 4 dosen + keputusan |
| TA-06 | 2 | Kepala Lab | Approve/Reject (max 3x revisi) |
| AK-01 s.d. AK-07 | 2 | Staff Akademik | Approve/Reject |
| AK-01 s.d. AK-07 | 3 | Kabag | Approve/Reject |
| AK-01 s.d. AK-07 | 4 | WD1 atau Dekan | TTD final |

---

## 6. Action Items untuk Anda

Hal yang perlu Anda konfirmasi dengan stakeholder internal:

| No | Action | Pihak Konsultasi |
|---|---|---|
| 1 | Daftar dokumen wajib upload per layanan (apakah sudah cukup?) | Staff Akademik & Staff Prodi |
| 2 | Format file & ukuran maksimal (apakah masuk akal?) | Tim IT |
| 3 | Konfirmasi batas Turnitin (25% atau angka lain) | Kepala Lab Multimedia |
| 4 | Maksimal sidang ulang (TA-04, TA-05) | Wakil Dekan 1 |
| 5 | SLA tiap step (berapa hari sebelum bypass aktif untuk TA-01) | Wakil Dekan 1 + Kaprodi |
| 6 | Standar Yudisium UIN SMH Banten (mungkin beda dengan yang umum) | Wakil Dekan 1 |
| 7 | Komposisi majelis ujian skripsi (default 6 dosen, apakah perlu adjust?) | Wakil Dekan 1 + Kaprodi |
| 8 | Aturan tentang siapa boleh jadi penguji (kriteria fungsional, dll) | Kaprodi & Sekprodi |
| 9 | Field input mahasiswa per layanan (apakah ada yang kurang/lebih?) | Staff & Kaprodi |
| 10 | Apakah ada layanan AK yang dokumen wajibnya berbeda dari draft ini | Staff Akademik |

---

*Dokumen ini menjadi acuan untuk:*
1. *Konfigurasi `field_layanan` dan `dokumen_persyaratan` di sistem (Phase 1)*
2. *Form input mahasiswa per layanan*
3. *Standardisasi data yang diinput verifikator per step*
4. *Future: validation rules engine (Phase 3) saat SIAKAD ready*
