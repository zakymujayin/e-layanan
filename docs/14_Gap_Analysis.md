# Gap Analysis — SILA
# Hal yang Perlu Diklarifikasi & Disediakan Sebelum/Selama Development

**Tanggal**: 29 Mei 2026
**Versi**: 2.0 (updated setelah review template Blade)

---

## Kategori 1: Asset yang Belum Tersedia

| No | Asset | Dampak | Rekomendasi | Status |
|---|---|---|---|---|
| 1 | ~~**14 template Blade PHP existing**~~ | ~~Tanpa ini, 24 template PDF harus dibuat dari nol~~ | ~~Minta file Blade PHP ke pihak fakultas~~ | ✅ **RESOLVED** — Tersedia di `docs/templates-blade/templates/` |
| 2 | **Kode proyek belum ada sama sekali** — ini greenfield project (belum ada `package.json`, `prisma/schema.prisma`, scaffold Next.js, dll) | Semua harus dibangun dari nol | Mulai dengan scaffold Next.js + shadcn/ui + Prisma | ⏳ |
| 3 | **Brand guideline warna UIN SMH Banten** — dok Batch 3 §8.3.1 hanya memberi placeholder OKLCH | Warna tema primary/secondary akan menggunakan nilai placeholder sampai brand guideline asli diperoleh | Gunakan warna netral professional (biru tua) sebagai fallback. Minta brand guideline ke pihak humas/kampus | ⏳ |
| 4 | **Data master awal (dosen, mahasiswa, pegawai, prodi)** — disebut perlu di-seed sebelum go-live tapi tidak ada file data konkret | Tidak bisa testing dengan data realistis sampai data master di-import | Tanyakan: apakah data akan diexport dari SIAKAD existing? Atau dibuatkan data dummy dulu untuk development? | ⏳ |

---

## Kategori 2: Inkonsistensi Antar Dokumen

| No | Isu | Dokumen A | Dokumen B | Rekomendasi | Status |
|---|---|---|---|---|---|
| 1 | Kolom **`extra_config`** di seed data workflow (dok 12) menyimpan `{ allow_target: [...] }` untuk reject bertingkat, tapi **tidak ada kolom ini di Prisma Schema** (dok 07) | [12_Seed_Data_Workflow.md] | [07_ERD_Database_Design.md] | **Tambahkan kolom `action_config` (JSON, nullable) ke tabel `workflow_step_actions`** di schema Prisma | ⏳ |
| 2 | **Jumlah output TA-05**: dok 01 & BPMN menyebut 5 dokumen, dok 11 menyebut 5+. **Setelah review template Blade**, terkonfirmasi: template `ujian_skripsi` menghasilkan **9 halaman dalam 1 file** (5 halaman jenis + 4 halaman nilai per penilai via `@foreach`). Jadi secara konseptual 5 jenis dokumen, secara teknis **1 file PDF dengan 9 halaman** | [01_Inventarisasi_Layanan.md] §2.3 | [template_ujian_skripsi.blade.php] | ✅ **RESOLVED** — 1 file PDF dengan 9 halaman. BPMN menyebut 5 jenis dokumen = benar secara konseptual. Template blade = 9 halaman gabungan |
| 3 | **Multi-page vs multi-file**: Template `seminar_proposal` = 3 halaman dalam 1 file, `ujian_komprehensif` = 5 halaman dalam 1 file, `ujian_skripsi` = 9 halaman dalam 1 file. Tapi dok 11 menyebut "file terpisah" | [11_Spesifikasi_Template_PDF.md] | [template blade actual] | ✅ **RESOLVED** — Template actual = 1 file gabungan (multi-page). Tidak perlu dipisah per file. Lebih praktis untuk download. |

---

## Kategori 3: Keputusan Stakeholder yang Perlu Dikonfirmasi

Keputusan ini TIDAK bisa ditentukan oleh developer/agent — harus dari stakeholder kampus.

| No | Isu | Dokumen Rujukan | Pihak yang Harus Konfirmasi |
|---|---|---|---|
| 1 | **Kode klasifikasi surat** (PP.00.9, KP.01.2, TL.00, KS.01) — sudah sesuai standar penomoran UIN SMH Banten? | [04_Konvensi_Glossary_Batch_1.md] §1.4 | Tim TU / Bagian Persuratan |
| 2 | **Range IPK Yudisium** (2.76-3.00 = Memuaskan, 3.01-3.50 = Sangat Memuaskan, >3.51 = Pujian) — sesuai kebijakan UIN SMH Banten? | [04_Konvensi_Glossary_Batch_1.md] §3.11.3 | Wakil Dekan 1 (Akademik) |
| 3 | **SLA PA di TA-01 = 7 hari kerja** sebelum bypass — cukup atau perlu diubah? | [03_BPMN_TA-01_Pengajuan_Judul_Skripsi.md] | Wakil Dekan 1 + Kaprodi |
| 4 | **Batas similarity Turnitin = 25%** — sudah sesuai kebijakan? | [03_BPMN_TA-06_Cek_Turnitin.md] | Kepala Lab Multimedia |
| 5 | **Jumlah maksimal ujian ulang** (TA-04, TA-05) — disebut "sesuai kebijakan kampus" tapi tidak ada angka spesifik | [03_BPMN_TA-04_Ujian_Komprehensif.md], [03_BPMN_TA-05_Ujian_Skripsi_Munaqasyah.md] | Wakil Dekan 1 |
| 6 | **Format nomor surat permohonan prodi** di TA-02 — seperti apa format pastinya? Disebut "setiap prodi punya buku register sendiri" | [03_BPMN_TA-02_SK_Pembimbing_Skripsi.md] | Sekprodi masing-masing prodi |

---

## Kategori 4: Keputusan Teknis yang Perlu Diklarifikasi

| No | Isu | Rekomendasi | Butuh Konfirmasi? |
|---|---|---|---|
| 1 | **Auth library**: Auth.js v5 vs Lucia Auth | **Pakai Auth.js v5** (rekomendasi dokumen) | Tidak perlu |
| 2 | **PDF generation**: Puppeteer (headless Chrome) vs `@react-pdf/renderer` — template Blade sudah full HTML/CSS, Puppeteer adalah pilihan paling natural untuk konversi | **Pakai Puppeteer** (rekomendasi dokumen). Pastikan server dev/prod punya Chromium terinstall | Tidak perlu |
| 3 | **Environment staging/dev/prod** | Dev (localhost) → Production. Untuk skala fakultas, staging mungkin tidak perlu | Tergantung tim |
| 4 | **API versioning**: Phase 1 tidak ada versioning | **Tidak pakai versioning** (rekomendasi dokumen) | Tidak perlu |
| 5 | **Bahasa URL slug**: Bahasa Indonesia (`/pengajuan`, `/pengajuan-baru`) | **Pakai Bahasa Indonesia** (rekomendasi dokumen) | Tidak perlu |

---

## Kategori 5: Area yang Sengaja Didefer ke Phase 2+

Ini BUKAN gap — hanya reminder:

| No | Fitur | Target Phase |
|---|---|---|
| 1 | Validasi IPK/SKS otomatis (integrasi SIAKAD) | Phase 2 |
| 2 | TTE tersertifikasi BSrE | Phase 2 |
| 3 | Notifikasi WhatsApp | Phase 2 |
| 4 | Modul Bimbingan Skripsi | Phase 3 |
| 5 | Workflow visual editor | Phase 3 |
| 6 | Mobile app native | Phase 3 |
| 7 | Public API | Phase 3 |

---

## Kategori 6: Temuan dari Review Template Blade (⚠️ Baru)

Setelah semua 14 template Blade PHP direview, berikut temuan yang perlu diperhatikan saat konversi:

### 6.1 Font yang Digunakan

| Font | Template | Ketersediaan |
|---|---|---|
| **Times New Roman** | bypass-judul, persetujuan-judul, seminar-proposal, cek-turnitin, aktif-kuliah, masih-kuliah (Arial juga), pernah-kuliah, pengantar-observasi, permohonan-magang, rekomendasi | Umum tersedia di semua OS |
| **Bookman Old Style** | sk-pembimbing, ujian-komprehensif, ujian-skripsi | ⚠️ **TIDAK** tersedia di Linux secara default. Perlu di-embed via `@font-face` atau gunakan fallback Times New Roman |
| **Arial** | masih-kuliah, ujian-komprehensif (halaman pertama), ujian-skripsi (halaman pertama) | Umum tersedia |

**Rekomendasi**: Di Puppeteer, embed font Bookman Old Style sebagai base64 di CSS, atau fallback ke Times New Roman.

### 6.2 Dependency Laravel di Template (Perlu Diganti)

Semua template Blade memakai kode Laravel yang harus dikonversi ke TypeScript:

| Blade Code | Fungsi | Pengganti TypeScript |
|---|---|---|
| `\App\Models\AppSetting::get('header_logo')` | Ambil setting logo dari DB | Query Prisma ke tabel AppSetting |
| `\Illuminate\Support\Facades\Storage::disk('public')->url($path)` | Generate URL file | `storageProvider.getServeUrl(path)` |
| `asset('images/logo-uin.png')` | Fallback logo | Path ke `/public/images/logo-uin.png` |
| `\Carbon\Carbon::now()->translatedFormat('d/m/Y')` | Format tanggal | `format(date, 'd MMMM yyyy', { locale: id })` |
| `\Carbon\Carbon::parse($tgl)->translatedFormat('d F Y')` | Parse + format tanggal | `format(new Date(tgl), 'd MMMM yyyy', { locale: id })` |
| `{{ $var ?? 'fallback' }}` | Null coalescing | Tetap pakai `??` di TypeScript |
| `@foreach($list as $item)` | Loop | `for (const item of list)` atau `.map()` |
| `@php ... @endphp` | PHP code block | Pindahkan ke function TypeScript sebelum render |
| `{!! $html !!}` | Raw HTML output | Langsung inject ke template literal (sudah raw di TS) |
| `onerror="this.style.display='none'"` | Hide broken image | Tetap pakai inline JS (valid di Puppeteer) |

### 6.3 Pola Kop Surat yang Identik

**Semua 14 template** punya kop surat (header) yang identik — hanya berbeda variasi CSS. Ini harus di-ekstrak jadi **shared partial**:

```typescript
// lib/document/partials/header.ts
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
          <p class="kop-4">Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten 42171<br>
            Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
            Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
        </td>
      </tr>
    </table>`;
}
```

### 6.4 Pola Footer yang Identik

Semua template punya footer QR Code yang identik — juga bisa di-shared:

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
```

### 6.5 Variabel Baru yang Tidak Ada di Dokumen Spesifikasi

Template Blade menggunakan beberapa variabel yang **tidak tercantum** di dokumen [11_Spesifikasi_Template_PDF.md]:

| Variabel | Template | Fungsi |
|---|---|---|
| `$jk` (jenis kelamin) | ujian-skripsi (halaman 2-5) | Untuk checkbox L/P di Berita Acara & Yudisium |
| `$tempat_lahir_mahasiswa`, `$tanggal_lahir_mahasiswa` | aktif-kuliah, masih-kuliah, pernah-kuliah, seminar-proposal, ujian-skripsi | Data pribadi mahasiswa — perlu ditambahkan ke tabel `mahasiswa` |
| `$pangkat_pejabat`, `$jabatan_pejabat` | aktif-kuliah | Data pejabat — perlu dari `structural_positions` atau `dosen` |
| `$nip_pembimbing_1`, `$nip_pembimbing_2`, `$nip_penguji_1`, `$nip_penguji_2` | ujian-skripsi (halaman 5 per penilai) | NIP/NIDN masing-masing dosen majelis |
| `$nip_ketua_sidang`, `$nip_sekretaris_sidang` | ujian-skripsi (halaman 3-4) | NIP/NIDN ketua & sekretaris |
| `$nip_penguji_1`, `$nip_penguji_2` | seminar-proposal (berita acara) | Sudah di-comment-out di template, mungkin tidak dipakai |

**Rekomendasi**: Tambahkan field `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir` ke tabel `mahasiswa` jika belum ada. Untuk NIP/NIDN dosen, ambil dari tabel `dosen.nidn`.

### 6.6 CSS yang Rusak/Broken di Beberapa Template

Template `seminar-proposal` dan `cek-turnitin` punya CSS yang **tidak well-formed** (missing closing bracket):

```css
/* DI TEMPLATE: */
.header-logo {
    width: clamp(80px, 10vw, 150px);
    /* ↑ TIDAK ADA closing bracket } sebelum selector berikutnya */

.header-logo img {
    width: clamp(80px, 10vw, 150px);
```

**Rekomendasi**: Perbaiki CSS saat konversi ke TypeScript template. Tambahkan closing bracket yang hilang.

---

## Ringkasan Action Items untuk AI Agent (Updated)

Saat memulai development, agent perlu melakukan:

1. **[Wajib]** Scaffold Next.js 16 + shadcn/ui (new-york) + Prisma + PostgreSQL
2. **[Wajib]** Tambahkan kolom `action_config JSON` ke tabel `workflow_step_actions` di Prisma schema
3. **[Wajib]** Tambahkan kolom `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir` ke tabel `mahasiswa` di Prisma schema
4. **[Wajib]** Ekstrak kop surat + footer jadi shared partial (`lib/document/partials/`)
5. **[Wajib]** Embed font Bookman Old Style untuk template SK Pembimbing, Ujian Komprehensif, Ujian Skripsi
6. **[Wajib]** Perbaiki CSS broken di template seminar-proposal dan cek-turnitin saat konversi
7. **[Wajib]** Konversi semua Blade syntax (`{{ }}`, `@foreach`, `@php`, dll) ke TypeScript template literal
8. **[Tanya user jika belum jelas]** Brand guideline warna kampus
9. **[Tanya user jika belum jelas]** Data master awal (dosen, mahasiswa, pegawai, prodi)
10. **[Gunakan nilai default]** TA-05 output = 1 PDF dengan 9 halaman (sesuai template blade)
11. **[Gunakan nilai default]** Multi-page template (seminar-proposal, ujian-komprehensif) = 1 file gabungan
12. **[Gunakan nilai default]** Auth.js v5, Puppeteer, Bahasa Indonesia untuk slug, `action_config` sebagai nama kolom
