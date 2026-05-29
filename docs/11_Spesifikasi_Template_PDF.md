# Spesifikasi Template Dokumen PDF
# Sistem Informasi Layanan Akademik (SILA)

**Versi**: 1.0
**Tanggal**: 28 Mei 2026
**Sumber**: Analisis 14 template Blade PHP existing

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

## Catatan Penting untuk AI Agent

1. **WAJIB** konversi template Blade `{{ $var }}` ke template literal TypeScript `${var}`
2. **WAJIB** gunakan `placeholder()` helper untuk field yang belum terisi di mode preview
3. **WAJIB** test PDF output dengan data nyata, bukan mock — layout bisa berbeda dari ekspektasi
4. **JANGAN** ubah layout atau design template — hanya konversi sintaks Blade → TypeScript
5. **PERHATIKAN** template TA-05 halaman 5 (`nilai-ujian-skripsi`) menggunakan `@foreach` Blade untuk 4 penilai — implementasikan dengan loop di TypeScript
6. **PERHATIKAN** template TA-02 (SK Pembimbing) menggunakan **font Bookman Old Style** — pastikan font tersedia atau di-embed
7. **QR Code** dan **TTD scan** dikirim sebagai HTML string (bukan path) ke template — sudah sesuai dengan implementasi Blade existing
