# Spesifikasi Template Dokumen PDF
# Sistem Informasi Layanan Akademik (SILA)

**Versi**: 1.1 (Updated 29 Mei 2026 — fix dari gap analysis AI Agent)
**Tanggal**: 28 Mei 2026
**Sumber**: Analisis 14 template Blade PHP existing

### Changelog v1.1
- Tambah Bagian 7: Variabel yang Missing dari v1.0 (ditemukan saat review template Blade)
- Tambah Bagian 8: Shared Partials (kop surat & footer)
- Tambah Bagian 9: Font Handling (Bookman Old Style di Linux)
- Tambah Bagian 10: CSS Fixes (broken CSS di beberapa template)
- Tambah Bagian 11: Konversi Blade → TypeScript (cheatsheet)

---

## Pendahuluan

### Pendekatan Implementasi

Template Blade PHP (existing) dikonversi ke **HTML string yang di-render menjadi PDF** menggunakan **Puppeteer** di Next.js. Alasannya:

1. Template sudah berupa HTML/CSS — tidak perlu re-design layout
2. Puppeteer bisa render HTML persis seperti browser, termasuk CSS kompleks
3. Lebih mudah di-maintain daripada library PDF khusus (pdfkit, @react-pdf/renderer)

### Cara Kerja

```typescript
// lib/document/generate-pdf.ts
import puppeteer from 'puppeteer';

export async function generatePdf(templateFn: (data: any) => string, data: any): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const html = templateFn(data);
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return buffer;
}
```

### Struktur Template di Next.js

```
lib/document/templates/
  bypass-judul.ts        → (TA-01, bypass)
  persetujuan-judul.ts   → (TA-01, output final)
  sk-pembimbing.ts       → (TA-02)
  surat-tugas-proposal.ts  → (TA-03, dokumen 1)
  berita-acara-proposal.ts → (TA-03, dokumen 2)
  daftar-hadir-proposal.ts → (TA-03, dokumen 3)
  surat-tugas-komprehensif.ts → (TA-04, dokumen 1: halaman 1 Surat Tugas)
  form-i-k.ts            → (TA-04, dokumen 2: Form I K)
  form-ii-k.ts           → (TA-04, dokumen 3: Form II K)
  form-iii-k.ts          → (TA-04, dokumen 4: Form III K)
  form-iv-k.ts           → (TA-04, dokumen 5: Form IV K)
  surat-tugas-munaqasyah.ts    → (TA-05, dokumen 1)
  berita-acara-munaqasyah.ts   → (TA-05, dokumen 2)
  yudisium-munaqasyah.ts       → (TA-05, dokumen 3)
  rekapitulasi-nilai.ts        → (TA-05, dokumen 4)
  nilai-ujian-skripsi.ts       → (TA-05, dokumen 5 — digenerate 4x per penilai)
  cek-turnitin.ts        → (TA-06)
  aktif-kuliah.ts        → (AK-01)
  masih-kuliah.ts        → (AK-02)
  pernah-kuliah.ts       → (AK-03)
  pengantar-observasi.ts → (AK-04)
  pengantar-penelitian.ts → (AK-05)
  permohonan-magang.ts   → (AK-06)
  rekomendasi.ts         → (AK-07)
```

### Placeholder Mode (Live Preview)

Saat mode preview (sebelum TTD final), placeholder wajib ditampilkan dengan **background kuning**:

```typescript
// Fungsi helper placeholder
function placeholder(value: string | null | undefined, label: string): string {
  if (value) return value;  // nilai sudah ada → tampil normal
  // Nilai belum ada → tampil placeholder kuning
  return `<span style="background:#FFD700;padding:0 4px;">[${label}]</span>`;
}

// Contoh penggunaan
const nomorSurat = placeholder(data.nomor_surat, 'NOMOR SURAT');
const ttdHtml = data.ttd_path
  ? `<img src="${data.ttd_path}" style="height:70px;">`
  : `<span style="background:#FFD700;display:block;width:200px;height:70px;line-height:70px;text-align:center;">[TTD ${data.nama_pejabat}]</span>`;
const qrCodeHtml = data.qr_code_url
  ? `<img src="${data.qr_code_url}" style="width:50px;height:50px;">`
  : `<span style="background:#FFD700;display:inline-block;width:50px;height:50px;line-height:50px;text-align:center;font-size:8pt;">QR</span>`;
```

---

## Spesifikasi Per Template

### 1. Template: Formulir Bypass Seleksi Judul (TA-01 Bypass)

**File**: `bypass-judul.ts`
**Layanan**: TA-01 (mode bypass)
**Penandatangan**: TIDAK ADA (form untuk TTD basah PA)

#### Variabel Input

| Variabel | Tipe | Sumber | Contoh |
|---|---|---|---|
| `logo_src` | string (URL) | AppSetting | URL logo UIN |
| `prodi` | string | mahasiswa.prodi.nama | "Ilmu Hadis" |
| `nama_mahasiswa` | string | mahasiswa.nama_lengkap | "Aini Fitri Utami" |
| `nim` | string | mahasiswa.nim | "221360001" |
| `semester_aktif` | string | mahasiswa.semester_aktif | "VII (Tujuh)" |
| `judul_list` | string[] | pengajuan_data.field_values.judul_* | ["Judul 1", "Judul 2", "Judul 3"] |
| `dosen` | string | dosen PA nama_lengkap | "Dr. Ahmad Fauzi, M.Pd" |
| `nip_dosen` | string | dosen PA nip/nidn | "0115098501" |
| `qrcode` | HTML string | TIDAK ADA di bypass (form untuk offline) | "" |

#### Catatan Implementasi

- Dokumen ini TIDAK punya nomor surat (bukan dokumen resmi, hanya form bypass)
- Ada checkbox "Setujui" untuk tiap judul (manual, dicentang offline oleh PA)
- Footer berisi BYPASS SYSTEM NOTICE
- Tidak ada TTD embed (TTD dilakukan manual/offline)

---

### 2. Template: Surat Persetujuan Judul Skripsi (TA-01 Output Final)

**File**: `persetujuan-judul.ts`
**Layanan**: TA-01
**Penandatangan**: Wakil Dekan 1

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter.nomor_formatted |
| `nama_mahasiswa` | string | mahasiswa.nama_lengkap |
| `nim` | string | mahasiswa.nim |
| `kode_prodi` | string | prodi.kode |
| `semester_aktif` | string | mahasiswa.semester_aktif (teks: "VII (Tujuh)") |
| `tahun_akademik` | string | academic_period.tahun_akademik |
| `judul_disetujui` | string | judul_skripsi.judul_aktif |
| `tanggal_surat` | string | Tanggal saat sign (format: "28 Mei 2026") |
| `nama_wakil_dekan` | string | dosen WD1.nama_lengkap + gelar |
| `nip_wakil_dekan` | string | dosen WD1.nidn atau nip |
| `ttd` | HTML string | `<img src="[path]" style="height:70px;">` |
| `qrcode` | HTML string | `<img src="[qr_url]" style="width:50px;height:50px;">` |

---

### 3. Template: SK Pembimbing Skripsi (TA-02)

**File**: `sk-pembimbing.ts`
**Layanan**: TA-02
**Penandatangan**: Dekan

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter (nomor SK fakultas) |
| `nomor_srt_jurusan` | string | pengajuan_data.field_values.nomor_surat_prodi |
| `tgl_srt_jurusan` | string | pengajuan_data.field_values.tanggal_surat_prodi |
| `kode_prodi` | string | prodi.kode |
| `nama_mahasiswa` | string | mahasiswa.nama_lengkap |
| `nim` | string | mahasiswa.nim |
| `nama_prodi` | string | prodi.nama |
| `tahun_akademik` | string | academic_period.tahun_akademik |
| `pembimbing_1` | string | dosen P1.nama_lengkap + gelar |
| `pembimbing_2` | string | dosen P2.nama_lengkap + gelar |
| `judul_disetujui` | string | judul_skripsi.judul_aktif |
| `tgl_sk` | string | Tanggal saat sign |
| `dekan` | object | `{ nama: string, nip: string }` (dosen Dekan) |
| `ttd` | HTML string | TTD Dekan |
| `qrcode` | HTML string | QR Code |

---

### 4. Template: Surat Tugas Seminar Proposal (TA-03, Dokumen 1)

**File**: `surat-tugas-proposal.ts`
**Layanan**: TA-03
**Penandatangan**: Wakil Dekan 1

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `nomor_surat` | string | penomoran_counter |
| `nama_mahasiswa` | string | mahasiswa.nama_lengkap |
| `nim` | string | mahasiswa.nim |
| `kode_prodi` | string | prodi.kode |
| `semester_aktif` | string | mahasiswa.semester_aktif |
| `judul_disetujui` | string | judul_skripsi.judul_aktif |
| `hari_sidang` | string | Dari tanggal_sidang (Senin, Selasa, dll) |
| `tanggal_sidang` | string | pengajuan_data.tanggal_sidang (format display) |
| `waktu_sidang` | string | pengajuan_data.waktu_mulai + "-" + waktu_selesai |
| `ruang_sidang` | string | pengajuan_data.ruang_sidang |
| `penguji_1` | string | dosen Penguji 1 nama_lengkap + gelar |
| `penguji_2` | string | dosen Penguji 2 nama_lengkap + gelar |
| `tanggal_surat` | string | Tanggal saat sign |
| `nama_wakil_dekan` | string | dosen WD1 nama_lengkap + gelar |
| `nip_wakil_dekan` | string | dosen WD1 nip/nidn |
| `ttd` | HTML string | TTD WD1 |
| `qrcode` | HTML string | QR Code |

---

### 5. Template: Berita Acara Seminar Proposal (TA-03, Dokumen 2)

**File**: `berita-acara-proposal.ts`
**Layanan**: TA-03

#### Variabel Input (sama dengan Surat Tugas, tambahan)

| Variabel | Tipe | Sumber |
|---|---|---|
| ...semua dari Surat Tugas... | | |
| `tempat_lahir_mahasiswa` | string | mahasiswa.tempat_lahir |
| `tanggal_lahir_mahasiswa` | string | mahasiswa.tanggal_lahir (format display) |
| `tahun_akademik` | string | academic_period.tahun_akademik |

**Catatan**: Pada mode template (sebelum nilai input), teks "LAYAK/TIDAK LAYAK" tetap muncul apa adanya (tidak bisa dipilih sistem sebelum nilai masuk). Setelah nilai diinput, sistem regenerate dokumen ini dengan keputusan final.

---

### 6. Template: Daftar Hadir Dewan Penguji Proposal (TA-03, Dokumen 3)

**File**: `daftar-hadir-proposal.ts`
**Variabel**: Sama dengan Berita Acara Proposal.

---

### 7. Template: Surat Tugas Ujian Komprehensif (TA-04, Dokumen 1)

**File**: `surat-tugas-komprehensif.ts`
**Layanan**: TA-04
**Penandatangan**: Wakil Dekan 1

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `nomor_surat` | string | penomoran_counter |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `kode_prodi` | string | prodi |
| `semester_aktif` | string | mahasiswa |
| `hari_sidang` | string | derived dari tanggal_sidang |
| `tanggal_sidang` | string | pengajuan_data |
| `waktu_sidang` | string | pengajuan_data |
| `ruang_sidang` | string | pengajuan_data |
| `penguji_1` | string | dosen Penguji Keahlian Prodi, nama + gelar |
| `penguji_2` | string | dosen Penguji Keislaman, nama + gelar |
| `tanggal_surat` | string | tanggal sign |
| `nama_wakil_dekan` | string | WD1 |
| `nip_wakil_dekan` | string | WD1 |
| `ttd` | HTML string | TTD WD1 |
| `qrcode` | HTML string | QR Code |

**Catatan label Komprehensif**:
- `penguji_1` = Penguji **Materi Keahlian Prodi**
- `penguji_2` = Penguji **Materi Keislaman**

---

### 8. Template: Form I K — Berita Acara Komprehensif (TA-04, Dokumen 2)

**File**: `form-i-k.ts`
**Variabel**: Sama dengan Surat Tugas Komprehensif + `tahun_akademik`.

---

### 9. Template: Form II K — Rekapitulasi Nilai Komprehensif (TA-04, Dokumen 3)

**File**: `form-ii-k.ts`
**Variabel**: Sama + penguji info.

---

### 10. Template: Form III K — Nilai Keahlian Prodi (TA-04, Dokumen 4)

**File**: `form-iii-k.ts`
**Variabel**: Sama. TTD Penguji 1 (Keahlian Prodi).

---

### 11. Template: Form IV K — Nilai Keislaman (TA-04, Dokumen 5)

**File**: `form-iv-k.ts`
**Variabel**: Sama. TTD Penguji 2 (Keislaman).

---

### 12. Template: Surat Tugas Munaqasyah (TA-05, Dokumen 1)

**File**: `surat-tugas-munaqasyah.ts`
**Layanan**: TA-05
**Penandatangan**: Dekan

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `nomor_surat` | string | penomoran_counter |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `kode_prodi` | string | prodi |
| `judul_disetujui` | string | judul_skripsi.judul_aktif |
| `hari_sidang` | string | derived |
| `tanggal_sidang` | string | pengajuan_data |
| `waktu_sidang` | string | pengajuan_data |
| `ruang_sidang` | string | pengajuan_data |
| `ketua_sidang` | string | dosen Ketua, nama + gelar |
| `sekretaris_sidang` | string | dosen Sekretaris, nama + gelar |
| `pembimbing_1` | string | dosen P1 (auto-fill dari TA-02) |
| `pembimbing_2` | string | dosen P2 (auto-fill dari TA-02) |
| `penguji_1` | string | dosen Penguji 1 |
| `penguji_2` | string | dosen Penguji 2 |
| `tanggal_surat` | string | tanggal sign |
| `nama_dekan` | string | Dekan nama + gelar |
| `nip_dekan` | string | Dekan nip/nidn |
| `ttd` | HTML string | TTD Dekan |
| `qrcode` | HTML string | QR Code |

---

### 13. Template: Berita Acara Munaqasyah (TA-05, Dokumen 2)

**File**: `berita-acara-munaqasyah.ts`

#### Variabel Input Tambahan (dari Surat Tugas)

| Variabel | Tipe | Sumber |
|---|---|---|
| `tempat_lahir_mahasiswa` | string | mahasiswa |
| `tanggal_lahir_mahasiswa` | string | mahasiswa |
| `tahun_akademik` | string | academic_period |
| `jk` | string | mahasiswa.jenis_kelamin ("L" / "P") |

---

### 14. Template: Data Penentuan Yudisium (TA-05, Dokumen 3)

**File**: `yudisium-munaqasyah.ts`

#### Variabel Tambahan

| Variabel | Tipe | Sumber |
|---|---|---|
| `sekretaris_sidang` | string | dosen Sekretaris, nama + gelar |
| `nip_sekretaris_sidang` | string | dosen Sekretaris |

---

### 15. Template: Rekapitulasi Nilai Ujian Skripsi (TA-05, Dokumen 4)

**File**: `rekapitulasi-nilai.ts`

#### Variabel Tambahan

| Variabel | Tipe | Sumber |
|---|---|---|
| `ketua_sidang` | string | dosen Ketua |
| `nip_ketua_sidang` | string | dosen Ketua |

---

### 16. Template: Nilai Ujian Skripsi (TA-05, Dokumen 5)

**File**: `nilai-ujian-skripsi.ts`
**Catatan**: Dokumen ini di-generate **4 kali** (satu per penilai: P1, P2, Penguji1, Penguji2).

#### Variabel Input

```typescript
// Data yang dikirim ke template
interface NilaiUjianSkripsiData {
  // Data mahasiswa
  nama_mahasiswa: string;
  nim: string;
  kode_prodi: string;
  tahun_akademik: string;
  semester_aktif: string;
  judul_disetujui: string;
  jk: 'L' | 'P';
  tempat_lahir_mahasiswa: string;
  tanggal_lahir_mahasiswa: string;

  // Data penilai yang sedang di-generate dokumennya
  penilai_role: 'Pembimbing I' | 'Pembimbing II' | 'Penguji I' | 'Penguji II';
  penilai_nama: string;
  penilai_nip: string;

  // Tanggal
  tanggal_sidang: string;
}
```

---

### 17. Template: Surat Keterangan Hasil Uji Plagiarisme (TA-06)

**File**: `cek-turnitin.ts`
**Penandatangan**: Kepala Lab

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `nama_prodi` | string | prodi |
| `judul_skripsi` | string | judul_skripsi.judul_aktif |
| `tautan_hasil` | string | pengajuan_data.url_turnitin |
| `submission_id` | string | pengajuan_data.submission_id_turnitin |
| `hasil_turnitin` | string | pengajuan_data.similarity_percentage + "%" |
| `tanggal_surat` | string | tanggal sign |
| `nama_kalab` | string | dosen Kepala Lab nama + gelar |
| `ttd` | HTML string | TTD Kepala Lab |
| `qrcode` | HTML string | QR Code |

---

### 18. Template: Surat Keterangan Masih Kuliah / Aktif Kuliah (AK-01)

**File**: `aktif-kuliah.ts`
**Penandatangan**: Wakil Dekan 1

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter |
| `nama_wakil_dekan` | string | WD1 nama + gelar |
| `nip_wakil_dekan` | string | WD1 nip/nidn |
| `pangkat_pejabat` | string | WD1 pangkat/golongan |
| `nama_mahasiswa` | string | mahasiswa |
| `tempat_lahir_mahasiswa` | string | mahasiswa.tempat_lahir |
| `tanggal_lahir_mahasiswa` | string | mahasiswa.tanggal_lahir (display) |
| `nim` | string | mahasiswa |
| `nama_prodi` | string | prodi.nama |
| `semester_teks` | string | "VII (Tujuh)" |
| `jenis_semester` | string | "ganjil" / "genap" |
| `tahun_akademik` | string | academic_period |
| `peruntukan_surat` | string | pengajuan_data.peruntukan |
| `tanggal_surat` | string | tanggal sign |
| `ttd` | HTML string | TTD WD1 |
| `qrcode` | HTML string | QR Code |

---

### 19. Template: Surat Keterangan Masih Kuliah — PNS (AK-02)

**File**: `masih-kuliah.ts`
**Penandatangan**: Wakil Dekan 1

#### Variabel Input Tambahan (dari AK-01)

| Variabel | Tipe | Sumber |
|---|---|---|
| `is_ortu_pns` | boolean | pengajuan_data.orang_tua_pns == 'ya' |
| `nama_ortu` | string | pengajuan_data.nama_orang_tua |
| `nip_ortu` | string | pengajuan_data.nip_orang_tua |
| `pangkat_ortu` | string | pengajuan_data.pangkat_golongan |
| `instansi_ortu` | string | pengajuan_data.instansi_orang_tua |
| `keperluan` | string | pengajuan_data.peruntukan |

---

### 20. Template: Surat Keterangan Pernah Kuliah (AK-03)

**File**: `pernah-kuliah.ts`
**Penandatangan**: Dekan

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `nama_prodi` | string | prodi |
| `periode_kuliah` | string | "tahun_masuk s.d. tahun_keluar" |
| `tanggal_surat` | string | tanggal sign |
| `nama_dekan` | string | Dekan nama + gelar |
| `nip_dekan` | string | Dekan nip |
| `ttd` | HTML string | TTD Dekan |
| `qrcode` | HTML string | QR Code |

---

### 21. Template: Surat Pengantar Observasi (AK-04)

**File**: `pengantar-observasi.ts`
**Penandatangan**: Wakil Dekan 1

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter |
| `nama_prodi` | string | prodi |
| `kode_prodi` | string | prodi |
| `pejabat_tujuan` | string | pengajuan_data.pejabat_tujuan |
| `instansi_tujuan` | string | pengajuan_data.instansi_tujuan |
| `mata_kuliah` | string | pengajuan_data.mata_kuliah |
| `lokasi_observasi` | Array: `{lokasi: string}[]` | pengajuan_data.lokasi_observasi (repeater) |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `semester_teks` | string | "VII (Tujuh)" |
| `dosen_pembimbing` | string | dosen pembimbing observasi nama + gelar |
| `tanggal_surat` | string | tanggal sign |
| `nama_wakil_dekan` | string | WD1 |
| `nip_wakil_dekan` | string | WD1 |
| `ttd` | HTML string | TTD WD1 |
| `qrcode` | HTML string | QR Code |

---

### 22. Template: Surat Pengantar Penelitian (AK-05)

**File**: `pengantar-penelitian.ts`
**Penandatangan**: Wakil Dekan 1

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter |
| `pejabat_tujuan` | HTML string | Bisa multi-pejabat (`<strong>1. ...<br>2. ...</strong>`) |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `tempat_lahir` | string | mahasiswa.tempat_lahir |
| `tanggal_lahir` | string | mahasiswa.tanggal_lahir (display) |
| `fakultas` | string | "Ushuluddin dan Adab" (statis) |
| `nama_prodi` | string | prodi |
| `semester_teks` | string | "VII (Tujuh)" |
| `judul_skripsi` | string | judul_skripsi.judul_aktif |
| `tempat_penelitian` | HTML string | Bisa multi (`<strong>1. ...<br>2. ...</strong>`) |
| `tanggal_surat` | string | tanggal sign |
| `nama_wakil_dekan` | string | WD1 |
| `nip_wakil_dekan` | string | WD1 |
| `ttd` | HTML string | TTD WD1 |
| `qrcode` | HTML string | QR Code |

---

### 23. Template: Surat Permohonan Magang (AK-06)

**File**: `permohonan-magang.ts`
**Penandatangan**: Dekan

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter |
| `tanggal_surat` | string | tanggal sign |
| `pejabat_tujuan` | string | pengajuan_data.pejabat_tujuan |
| `nama_prodi` | string | prodi |
| `kode_prodi` | string | prodi |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `semester_aktif` | string | mahasiswa.semester_aktif (angka) |
| `dosen_pembimbing` | string | dosen pembimbing magang nama + gelar |
| `waktu_pelaksanaan` | string | "tanggal_mulai s.d tanggal_selesai" |
| `nama_dekan` | string | Dekan nama + gelar |
| `ttd` | HTML string | TTD Dekan |
| `qrcode` | HTML string | QR Code |

---

### 24. Template: Surat Rekomendasi (AK-07)

**File**: `rekomendasi.ts`
**Penandatangan**: Dekan

#### Variabel Input

| Variabel | Tipe | Sumber |
|---|---|---|
| `logo_src` | string | AppSetting |
| `nomor_surat` | string | penomoran_counter |
| `nama_mahasiswa` | string | mahasiswa |
| `nim` | string | mahasiswa |
| `nama_prodi` | string | prodi |
| `semester` | string | mahasiswa.semester_aktif (teks) |
| `tahun_akademik` | string | academic_period |
| `tujuan_rekomendasi` | string | pengajuan_data.tujuan_rekomendasi |
| `tanggal_surat` | string | tanggal sign |
| `nama_dekan` | string | Dekan nama + gelar |
| `nip_dekan` | string | Dekan nip |
| `ttd` | HTML string | TTD Dekan |
| `qrcode` | HTML string | QR Code |

---

## Mapping Template per Layanan (Ringkasan)

| Layanan | Jumlah Dokumen | Template File(s) | Penandatangan |
|---|---|---|---|
| TA-01 (bypass) | 1 | `bypass-judul.ts` | - (form offline) |
| TA-01 (final) | 1 | `persetujuan-judul.ts` | WD1 |
| TA-02 | 1 | `sk-pembimbing.ts` | Dekan |
| TA-03 | 3 | `surat-tugas-proposal.ts`, `berita-acara-proposal.ts`, `daftar-hadir-proposal.ts` | WD1 |
| TA-04 | 5 | `surat-tugas-komprehensif.ts`, `form-i-k.ts`, `form-ii-k.ts`, `form-iii-k.ts`, `form-iv-k.ts` | WD1 |
| TA-05 | 5+ | `surat-tugas-munaqasyah.ts`, `berita-acara-munaqasyah.ts`, `yudisium-munaqasyah.ts`, `rekapitulasi-nilai.ts`, `nilai-ujian-skripsi.ts` (×4) | Dekan |
| TA-06 | 1 | `cek-turnitin.ts` | Kepala Lab |
| AK-01 | 1 | `aktif-kuliah.ts` | WD1 |
| AK-02 | 1 | `masih-kuliah.ts` | WD1 |
| AK-03 | 1 | `pernah-kuliah.ts` | Dekan |
| AK-04 | 1 | `pengantar-observasi.ts` | WD1 |
| AK-05 | 1 | `pengantar-penelitian.ts` | WD1 |
| AK-06 | 1 | `permohonan-magang.ts` | Dekan |
| AK-07 | 1 | `rekomendasi.ts` | Dekan |

---

## Data Context Builder

Setiap template membutuhkan data yang harus di-fetch dari database sebelum generate PDF. Helper function:

```typescript
// lib/document/context-builder.ts

export async function buildDocumentContext(pengajuanId: number, jenisLayananKode: string) {
  const pengajuan = await getPengajuanWithRelations(pengajuanId);
  const mahasiswa = pengajuan.mahasiswa;
  const prodi = mahasiswa.prodi;
  const semester = await getActiveSemester();

  // Pejabat tanda tangan
  const wd1 = await getActiveStructuralPosition('wakil_dekan_1');
  const dekan = await getActiveStructuralPosition('dekan');
  const kepalaLab = await getActiveStructuralPosition('kepala_lab');

  // Logo
  const logoSrc = await getAppSetting('header_logo');

  // Helper format
  const formatTanggal = (d: Date) => format(d, 'd MMMM yyyy', { locale: id });
  const formatHari = (d: Date) => format(d, 'EEEE', { locale: id });
  const teksRomawi = (semester: AcademicPeriod) => toRomawi(new Date(semester.tanggal_mulai).getMonth() + 1);
  const semesterTeks = (mhs: Mahasiswa) => `${mhs.semester_aktif} (${angkaKeRomawi(mhs.semester_aktif)})`;

  // Build base context (berlaku semua template)
  const baseContext = {
    logo_src: logoSrc,
    nama_mahasiswa: mahasiswa.nama_lengkap,
    nim: mahasiswa.nim,
    kode_prodi: prodi.kode,
    nama_prodi: prodi.nama,
    semester_aktif: mahasiswa.semester_aktif?.toString(),
    semester_teks: semesterTeks(mahasiswa),
    tahun_akademik: semester.tahun_akademik,
    jenis_semester: semester.tipe,
    tempat_lahir_mahasiswa: mahasiswa.tempat_lahir ?? '',
    tanggal_lahir_mahasiswa: mahasiswa.tanggal_lahir ? formatTanggal(mahasiswa.tanggal_lahir) : '',
  };

  // Specific context per layanan
  // (dikembangkan per template)
  return baseContext;
}
```

---

## Catatan Penting untuk AI Agent (Bagian 6)

1. **WAJIB** konversi template Blade `{{ $var }}` ke template literal TypeScript `${var}`
2. **WAJIB** gunakan `placeholder()` helper untuk field yang belum terisi di mode preview
3. **WAJIB** test PDF output dengan data nyata, bukan mock — layout bisa berbeda dari ekspektasi
4. **JANGAN** ubah layout atau design template — hanya konversi sintaks Blade → TypeScript
5. **PERHATIKAN** template TA-05 (`nilai-ujian-skripsi`) digenerate 4x untuk 4 penilai — implementasikan dengan loop TypeScript, hasilnya digabung jadi 1 PDF
6. **PERHATIKAN** TA-05 total = 1 PDF dengan 9 halaman (5 jenis halaman + 4 halaman nilai per penilai via loop)
7. **PERHATIKAN** TA-03, TA-04 = masing-masing 1 PDF multi-halaman (bukan file terpisah)
8. **QR Code** dan **TTD scan** dikirim sebagai HTML string ke template

---

## Bagian 7: Variabel Missing (Ditemukan dari Review Template Blade)

Variabel berikut ada di template Blade tapi **tidak tercantum di spesifikasi v1.0**. Sekarang sudah diperbaiki:

### 7.1 Field Mahasiswa yang Dibutuhkan Template

Kolom ini sekarang sudah ditambahkan ke tabel `mahasiswa` di ERD v1.1:

| Variabel Template | Kolom DB | Tipe | Template yang Butuh |
|---|---|---|---|
| `$jk` | `mahasiswa.jenis_kelamin` | `JenisKelamin` enum (`L`/`P`) | ujian-skripsi (halaman 2-5) |
| `$tempat_lahir_mahasiswa` | `mahasiswa.tempat_lahir` | `String?` | aktif-kuliah, masih-kuliah, seminar-proposal, ujian-skripsi |
| `$tanggal_lahir_mahasiswa` | `mahasiswa.tanggal_lahir` | `DateTime?` | aktif-kuliah, masih-kuliah, pernah-kuliah, seminar-proposal, ujian-skripsi |

### 7.2 Field Dosen yang Dibutuhkan Template

Kolom ini sekarang sudah ditambahkan ke tabel `dosen` di ERD v1.1:

| Variabel Template | Kolom DB | Tipe | Template yang Butuh | Sumber |
|---|---|---|---|---|
| `$pangkat_pejabat` | `dosen.pangkat_golongan` | `String?` | aktif-kuliah, masih-kuliah | Pangkat/golongan WD1 sebagai PNS, mis. "Pembina Utama Muda / IVc" |
| `$jabatan_pejabat` | `structural_positions.position_code` (display name) | derived | aktif-kuliah, masih-kuliah | "Wakil Dekan I" — di-derive dari position_code |

### 7.3 NIP Anggota Majelis di TA-05

Template ujian-skripsi membutuhkan NIP/NIDN tiap anggota majelis untuk halaman tanda tangan:

| Variabel Template | Sumber |
|---|---|
| `$nip_pembimbing_1`, `$nip_pembimbing_2` | `dosen.nidn` dari assignment `pembimbing_skripsi_1/2` |
| `$nip_penguji_1`, `$nip_penguji_2` | `dosen.nidn` dari assignment `penguji_skripsi` |
| `$nip_ketua_sidang` | `dosen.nidn` dari assignment `ketua_sidang` |
| `$nip_sekretaris_sidang` | `dosen.nidn` dari assignment `sekretaris_sidang` |

> **Catatan**: Template menggunakan kolom `nidn` dari tabel `dosen` untuk semua "NIP" pejabat dosen. Field ini sudah ada di ERD. Untuk pegawai (jika ada), gunakan `pegawai.nip`.

---

## Bagian 8: Shared Partials

Semua 14 template mempunyai kop surat dan footer yang **100% identik**. Ekstrak ke shared partial untuk menghindari duplikasi.

### 8.1 Kop Surat (Header)

```typescript
// lib/document/partials/kop-surat.ts

export function renderKopSurat(logoSrc: string): string {
  return `
    <table class="header-table double-line">
      <tr>
        <td class="header-logo">
          <img src="${logoSrc}" alt="Logo UIN" onerror="this.style.display='none'">
        </td>
        <td class="header-text">
          <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
          <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
          <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
          <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
          <p class="kop-4">
            Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten 42171<br>
            Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
            Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u>
          </p>
        </td>
      </tr>
    </table>`;
}
```

### 8.2 CSS Kop Surat (Shared)

```typescript
// lib/document/partials/kop-css.ts

export const KOP_CSS = `
  .header-table {
    width: 100%; border-collapse: collapse;
    margin-bottom: 10px; position: relative; border-bottom: 3px solid #000;
  }
  .header-table.double-line::after {
    content: ""; position: absolute; left: 0; right: 0; bottom: -4px;
    border-bottom: 1px solid #000;
  }
  .header-table td { border: none; padding: 0; vertical-align: middle; }
  .header-logo { width: 100px; }
  .header-logo img { width: 100px; height: auto; max-width: 100%; display: block; }
  .header-text { text-align: center; }
  .kop-1 { font-size: 13pt; font-weight: bold; margin: 0; }
  .kop-2 { font-size: 12pt; font-weight: bold; margin: 0; }
  .kop-3 { font-size: 14pt; font-weight: bold; margin: 0; }
  .kop-4 { font-size: 9pt; margin: 0; margin-bottom: 5px; }
`;
```

### 8.3 Footer QR Code (Shared)

```typescript
// lib/document/partials/footer.ts

export function renderFooter(qrcode: string): string {
  return `
    <div class="footer">
      <table class="footer-table">
        <tr>
          <td class="qrcode-cell">${qrcode}</td>
          <td class="footer-text">
            Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Layanan Akademik <br>
            Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten.
          </td>
        </tr>
      </table>
    </div>`;
}

export const FOOTER_CSS = `
  .footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 10px 25mm; border-top: 1px solid #ddd; background: white;
  }
  table.footer-table { width: 100%; border-collapse: collapse; background: white; }
  table.footer-table td {
    border: none; padding: 5px; vertical-align: middle;
    font-size: 9pt; color: #555; background: white;
  }
  .qrcode-cell { width: 15mm; text-align: center; }
  .qrcode-cell img { width: 15mm; height: 15mm; display: block; }
  .footer-text { text-align: left; line-height: 1.3; }
`;
```

---

## Bagian 9: Font Handling (Bookman Old Style di Linux)

### 9.1 Masalah

Font **Bookman Old Style** dipakai oleh 3 template:
- `sk-pembimbing` (seluruh dokumen)
- `ujian-komprehensif` (seluruh dokumen kecuali halaman 1 yang pakai Arial)
- `ujian-skripsi` (seluruh dokumen kecuali halaman 1 yang pakai Arial)

Font ini **tidak tersedia di Linux** (server environment), sehingga Puppeteer akan fallback ke font default — yang menyebabkan layout berubah.

### 9.2 Solusi: Embed Font sebagai Base64

```typescript
// lib/document/fonts.ts
import fs from 'fs';
import path from 'path';

// Letakkan file font di: public/fonts/bookman-old-style.ttf
// Download dari: fonts.google.com atau lisensi yang sesuai
const BOOKMAN_FONT_PATH = path.join(process.cwd(), 'public/fonts/bookman-old-style.ttf');

export function getBookmanFontFace(): string {
  // Embed font sebagai base64 agar tersedia di Puppeteer
  const fontBuffer = fs.readFileSync(BOOKMAN_FONT_PATH);
  const fontBase64 = fontBuffer.toString('base64');
  return `
    @font-face {
      font-family: 'Bookman Old Style';
      src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `;
}
```

### 9.3 Fallback Strategy

Jika font Bookman Old Style tidak tersedia atau tidak bisa di-embed:

```css
/* Fallback yang paling mendekati */
font-family: 'Bookman Old Style', 'Bookman', 'URW Bookman L', 'Georgia', serif;
```

**Urutan prioritas fallback**: Bookman Old Style → Bookman → URW Bookman L (tersedia di Linux via `fonts-urw-base35`) → Georgia (sangat mirip) → serif default.

**Rekomendasi**: Install `fonts-urw-base35` di server Linux:
```bash
apt-get install -y fonts-urw-base35
```

---

## Bagian 10: CSS Fixes

### 10.1 Template dengan CSS Broken

Template berikut punya **CSS yang tidak well-formed** (missing closing bracket `}`) — ditemukan saat review Blade:

| Template | Lokasi CSS Rusak |
|---|---|
| `template_cek_turnitin_blade.php` | `.header-logo {` dan `.header-logo img {` tidak punya closing bracket |
| `template_seminar_proposal_blade.php` | `.header-logo {` dan `.header-logo img {` tidak punya closing bracket |
| `template_sk_pembimbing_blade.php` | `.header-logo {` menggunakan selector berbeda (logo centered, bukan dalam table) |
| Semua template selain bypass & persetujuan-judul | `.header-logo` tidak punya closing bracket `}` |

### 10.2 Pattern CSS yang Rusak (di Blade)

```css
/* RUSAK di template Blade: */
.header-logo {
    width: clamp(80px, 10vw, 150px);
    /* ← tidak ada } sebelum selector berikutnya */

.header-logo img {
    width: clamp(80px, 10vw, 150px);
    height: auto;
    max-width: 100%;
    /* ← tidak ada } sebelum selector berikutnya */

.header-text {   /* ← ini harusnya selector baru, tapi dibaca sebagai lanjutan blok sebelumnya */
```

### 10.3 Versi yang Sudah Diperbaiki (untuk TypeScript Template)

```typescript
// Gunakan versi CSS ini di semua TypeScript template
export const HEADER_LOGO_CSS = `
  .header-logo {
    width: 100px;
    text-align: left;
    vertical-align: middle;
  }
  .header-logo img {
    width: 100px;
    height: auto;
    max-width: 100%;
    display: block;
  }
  .header-text {
    text-align: center;
    vertical-align: middle;
  }
`;
```

> **Catatan untuk AI Agent**: Puppeteer/Chrome cukup toleran terhadap CSS tidak valid — browser akan mencoba parse dan hasilnya tidak bisa diprediksi. **WAJIB** perbaiki CSS saat konversi ke TypeScript.

---

## Bagian 11: Konversi Blade → TypeScript (Cheatsheet)

Referensi cepat untuk konversi semua sintaks Blade PHP ke TypeScript:

| Blade PHP | TypeScript Equivalent | Catatan |
|---|---|---|
| `{{ $variable }}` | `${variable}` | HTML-escaped (aman) |
| `{!! $html !!}` | `${html}` | Raw HTML — sudah raw di template literal TS |
| `{{ $var ?? 'fallback' }}` | `${variable ?? 'fallback'}` | Null coalescing identik |
| `@if(condition)` | `${condition ? '...' : ''}` | Ternary atau conditional string |
| `@if(isset($var) && $var)` | `${variable ? '...' : ''}` | Truthy check |
| `@foreach($list as $item)` | `${list.map(item => '...').join('')}` | Array map |
| `@php ... @endphp` | Pindahkan ke function TS sebelum render | Pre-compute di luar template string |
| `\Carbon\Carbon::now()->translatedFormat('d/m/Y')` | `format(new Date(), 'd MMMM yyyy', { locale: id })` | date-fns + locale id |
| `\Carbon\Carbon::parse($tgl)->translatedFormat('d F Y')` | `format(new Date(tgl), 'd MMMM yyyy', { locale: id })` | |
| `\App\Models\AppSetting::get('header_logo')` | `await getAppSetting('header_logo')` | Query Prisma |
| `Storage::disk('public')->url($path)` | `storageProvider.getServeUrl(path)` | Storage abstraction (Batch 2 §7) |
| `asset('images/logo-uin.png')` | `'/images/logo-uin.png'` | File di `/public/images/` |
| `strtoupper($str)` | `str.toUpperCase()` | |
| `implode(', ', array_column($arr, 'key'))` | `arr.map(i => i.key).join(', ')` | |
| `is_array($var)` | `Array.isArray(variable)` | |
| `nl2br(e($text))` | `text.replace(/\n/g, '<br>')` | Perhatikan XSS jika text dari user |
| `onerror="this.style.display='none'"` | Tetap pakai (valid inline JS di Puppeteer) | |

### 11.1 Contoh Konversi Lengkap

**Blade (sebelum)**:
```blade
<p>Mahasiswa {{ strtoupper($nama ?? 'NAMA') }}</p>
@if(isset($is_ortu_pns) && $is_ortu_pns)
  <p>NIP Ortu: {{ $nip_ortu ?? '-' }}</p>
@endif
@foreach($judul_list as $i => $judul)
  <tr><td>{{ $i + 1 }}</td><td>{{ $judul }}</td></tr>
@endforeach
```

**TypeScript (sesudah)**:
```typescript
function renderMahasiswaSection(data: TemplateData): string {
  const nama = data.nama_mahasiswa?.toUpperCase() ?? 'NAMA';
  const pnsSection = data.is_ortu_pns
    ? `<p>NIP Ortu: ${data.nip_ortu ?? '-'}</p>`
    : '';
  const judulRows = data.judul_list
    .map((judul, i) => `<tr><td>${i + 1}</td><td>${judul}</td></tr>`)
    .join('');

  return `
    <p>Mahasiswa ${nama}</p>
    ${pnsSection}
    <table>${judulRows}</table>
  `;
}
```
