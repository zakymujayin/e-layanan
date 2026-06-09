import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { placeholder, reserved } from "../partials/placeholder";

function sharedVars(ctx: DocumentContext) {
  const isPreview = ctx.mode === "preview";

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SURAT")
    : (ctx.nomor_surat ?? "");

  const tanggalSurat = isPreview
    ? reserved(ctx.tanggal_surat, "TANGGAL")
    : (ctx.tanggal_surat ?? "");

  const wd1Nama = placeholder(ctx.wakil_dekan_1?.nama ?? null, "NAMA WAKIL DEKAN");
  const wd1Nip = placeholder(ctx.wakil_dekan_1?.nip ?? null, "NIP WAKIL DEKAN");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, `TTD ${ctx.wakil_dekan_1?.nama ?? "WAKIL DEKAN"}`)
    : (ctx.ttd ?? "");

  const qrHtml = isPreview ? placeholder(ctx.qrcode, "QR") : (ctx.qrcode ?? "");

  const penguji1Nama = placeholder(ctx.penguji_1 ?? null, "PENGUJI KEAHLIAN PRODI");
  const penguji2Nama = placeholder(ctx.penguji_2 ?? null, "PENGUJI KEISLAMAN");

  const hariSidang = placeholder(ctx.hari_sidang ?? null, "HARI SIDANG");
  const tanggalSidang = placeholder(ctx.tanggal_sidang ?? null, "TANGGAL SIDANG");
  const waktuSidang = placeholder(ctx.waktu_sidang ?? null, "WAKTU SIDANG");
  const ruangSidang = placeholder(ctx.ruang_sidang ?? null, "RUANG SIDANG");

  const namaMhs = placeholder(ctx.nama_mahasiswa ?? null, "NAMA MAHASISWA");
  const nimMhs = placeholder(ctx.nim ?? null, "NIM MAHASISWA");
  const namaProdi = placeholder(ctx.nama_prodi ?? null, "NAMA PRODI");
  const kodeProdi = placeholder(ctx.kode_prodi ?? null, "KODE PRODI");
  const semesterAktif = placeholder(ctx.semester_aktif ?? null, "SEMESTER");
  const tahunAkademik = placeholder(ctx.tahun_akademik ?? null, "TAHUN AKADEMIK");

  return {
    isPreview, nomorSurat, tanggalSurat,
    wd1Nama, wd1Nip, ttdHtml, qrHtml,
    penguji1Nama, penguji2Nama,
    hariSidang, tanggalSidang, waktuSidang, ruangSidang,
    namaMhs, nimMhs, namaProdi, kodeProdi, semesterAktif, tahunAkademik,
  };
}

const PAGE_STYLES = `
@page {
  size: A4 portrait;
  margin: 0;
}

* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

body {
  font-size: 10pt;
  line-height: 1.15;
  color: #000;
  margin: 0;
  padding: 0;
  background-color: #525252;
}

.page {
  background: white;
  width: 210mm;
  min-height: 297mm;
  padding: 10mm 20mm 15mm 20mm;
  margin: 10mm auto;
  box-sizing: border-box;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  position: relative;
  page-break-after: always;
  display: block;
  font-family: 'Bookman Old Style', "Times New Roman", Times, serif;
}

.page:first-of-type {
  font-family: Arial, Helvetica, sans-serif !important;
  font-size: 10pt !important;
}

.page:last-of-type {
  page-break-after: auto;
}

@media print {
  body {
    background: none;
    padding: 0;
  }
  .page {
    margin: 0;
    box-shadow: none !important;
    width: 210mm;
    height: 297mm;
  }
}

/* === HEADER / KOP SURAT STYLES === */
.header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  position: relative;
  border-bottom: 3px solid #000;
}

.header-table.double-line::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  border-bottom: 1px solid #000;
}

.header-table td {
  border: none;
  padding: 0;
  vertical-align: middle;
}

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
}

.kop-1 { font-size: 13pt; font-weight: bold; margin: 0; }
.kop-2 { font-size: 12pt; font-weight: bold; margin: 0; }
.kop-3 { font-size: 14pt; font-weight: bold; margin: 0; }
.kop-4 { font-size: 9pt; margin: 0; margin-bottom: 5px; }

/* === FOOTER STYLES === */
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20mm;
  border-top: 1px solid #ddd;
  background: white;
}

table.footer-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

table.footer-table td {
  border: none;
  padding: 5px;
  vertical-align: middle;
  font-size: 9pt;
  color: #555;
  background: white;
}

.qrcode-cell {
  width: 15mm;
  text-align: center;
}

.qrcode-cell img {
  width: 15mm;
  height: 15mm;
  display: block;
}

.footer-text {
  text-align: left;
  line-height: 1.3;
}

/* === SIGNATURE STYLES === */
.signature-section {
  float: right;
  width: 50%;
  text-align: left;
  position: relative;
}

.signature-text {
  margin: 0;
  line-height: 1.3;
}

.signature-space {
  min-height: 70px;
  position: relative;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 80%;
  background: white;
  margin-left: 20%;
}

.clear {
  clear: both;
}

/* === DOCUMENT-SPECIFIC STYLES === */
.title-section {
  text-align: center;
  margin-bottom: 10px;
}

.title-underline {
  font-size: 11pt;
  font-weight: bold;
  text-decoration: underline;
  margin: 0 0 5px 0;
}

.nomor-surat {
  font-size: 10pt;
  margin: 0;
}

.body-text {
  text-align: justify;
  line-height: 1.4;
  margin: 10px 0;
}

.body-text-indent {
  text-align: justify;
  line-height: 1.4;
  margin: 10px 0;
  text-indent: 30px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

.data-table td {
  padding: 3px 5px;
  vertical-align: top;
}

.data-table .label-col {
  width: 160px;
}

.data-table .sep-col {
  width: 15px;
  text-align: center;
}

.bordered-table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

.bordered-table th,
.bordered-table td {
  border: 1px solid #000;
  padding: 4px 6px;
  vertical-align: top;
  font-size: 9pt;
  line-height: 1.2;
}

.bordered-table th {
  text-align: center;
  font-weight: bold;
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-bold { font-weight: bold; }
.text-italic { font-style: italic; }

.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.mb-5 { margin-bottom: 5px; }
.mb-10 { margin-bottom: 10px; }

.page-form-no {
  position: absolute;
  top: 10mm;
  right: 20mm;
  font-weight: bold;
  font-style: italic;
  font-size: 10pt;
}

.sig-table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.sig-table td {
  padding: 8px 5px;
  vertical-align: top;
  font-size: 9pt;
}

.sig-table .sig-line {
  margin-top: 40px;
  padding-top: 5px;
}

.section-title {
  font-weight: bold;
  text-align: center;
  margin: 12px 0 6px 0;
  font-size: 10pt;
}

.keterangan-table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

.keterangan-table th,
.keterangan-table td {
  border: 1px solid #000;
  padding: 3px 6px;
  font-size: 9pt;
  text-align: center;
}

.catatan-section {
  font-size: 9pt;
  line-height: 1.3;
}

.catatan-section ol,
.catatan-section ul {
  margin: 5px 0;
  padding-left: 20px;
}

.catatan-section li {
  margin-bottom: 3px;
}

.checkbox-cell {
  width: 25px;
  text-align: center;
}

.bordered-cell {
  border: 1px solid #000;
  padding: 4px 6px;
  min-width: 50px;
  text-align: center;
}

.form-value-line {
  display: inline-block;
  min-width: 150px;
  border-bottom: 1px solid #000;
  text-align: center;
  margin: 0 5px;
}
`;

const KETERANGAN_NILAI_TABLE = `
<div class="section-title" style="margin-top:15px; border-top:1px solid #ddd; padding-top:8px;">KETERANGAN NILAI</div>

<table class="keterangan-table">
  <thead>
    <tr>
      <th>NILAI</th>
      <th>RENTANG</th>
      <th>NILAI</th>
      <th>RENTANG</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A</td><td>95 &ndash; 100</td>
      <td>B&minus;</td><td>75 &ndash; 79</td>
    </tr>
    <tr>
      <td>A&minus;</td><td>90 &ndash; 94</td>
      <td>C+</td><td>70 &ndash; 74</td>
    </tr>
    <tr>
      <td>B+</td><td>85 &ndash; 89</td>
      <td>C</td><td>65 &ndash; 69</td>
    </tr>
    <tr>
      <td>B</td><td>80 &ndash; 84</td>
      <td>D</td><td>60 &ndash; 64</td>
    </tr>
    <tr>
      <td></td><td></td>
      <td>E</td><td>&lt; 60</td>
    </tr>
  </tbody>
</table>`;

export function renderUjianKomprehensifSuratTugas(ctx: DocumentContext): string {
  const v = sharedVars(ctx);

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Ujian Komprehensif - Surat Tugas</title>
<style>${PAGE_STYLES}</style>
</head>
<body>

<!-- ==================== PAGE 1: SURAT TUGAS ==================== -->
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="title-section">
  <p class="title-underline">SURAT TUGAS</p>
  <p class="nomor-surat">NOMOR: ${v.nomorSurat}</p>
</div>

<p class="body-text-indent">
  Dekan Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten menugaskan kepada
  dosen-dosen Fakultas Ushuluddin dan Adab sebagai berikut:
</p>

<table class="bordered-table">
  <thead>
    <tr>
      <th style="width:25px;">NO</th>
      <th>NAMA / NIM / JURUSAN</th>
      <th>DEWAN PENGUJI</th>
      <th style="width:120px;">WAKTU / RUANG</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-center">1</td>
      <td style="font-size:9pt;">
        ${v.namaMhs}<br>
        NIM. ${v.nimMhs}<br>
        ${v.namaProdi}
      </td>
      <td style="font-size:9pt;">
        <strong>Materi Keahlian Prodi:</strong><br>
        ${v.penguji1Nama}<br><br>
        <strong>Materi Keislaman:</strong><br>
        ${v.penguji2Nama}
      </td>
      <td style="font-size:8pt;">
        Hari/tgl : ${v.hariSidang}, ${v.tanggalSidang}<br>
        Waktu &emsp;: ${v.waktuSidang}<br>
        Ruang &ensp;: ${v.ruangSidang}
      </td>
    </tr>
  </tbody>
</table>

<p class="body-text-indent">
  Untuk melaksanakan Ujian Komprehensif TA. ${v.tahunAkademik} pada:
</p>

<table class="data-table" style="margin-left:30px;">
  <tr>
    <td class="label-col">Hari / Tanggal</td>
    <td class="sep-col">:</td>
    <td>${v.hariSidang}, ${v.tanggalSidang}</td>
  </tr>
  <tr>
    <td>Waktu</td>
    <td>:</td>
    <td>${v.waktuSidang}</td>
  </tr>
  <tr>
    <td>Tempat / Ruang</td>
    <td>:</td>
    <td>${v.ruangSidang}</td>
  </tr>
</table>

<p class="body-text-indent">
  Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan sebaik-baiknya dan penuh
  tanggung jawab. Setelah selesai, dimohon agar melaporkan hasilnya kepada Dekan.
</p>

<div class="signature-section mt-20">
  <p class="signature-text">Dikeluarkan di Serang</p>
  <p class="signature-text">Pada Tanggal: ${v.tanggalSurat}</p>
  <p class="signature-text">a.n. Dekan</p>
  <p class="signature-text">Wakil Dekan Bidang Akademik dan Kelembagaan</p>
  <div class="signature-space">${v.ttdHtml}</div>
  <p class="signature-text text-bold" style="text-decoration:underline;">${v.wd1Nama}</p>
  <p class="signature-text">NIP. ${v.wd1Nip}</p>
</div>
<div class="clear"></div>

<div class="catatan-section" style="margin-top:15px; border-top:1px solid #ddd; padding-top:8px;">
  <p><strong>Catatan:</strong></p>
  <p><strong>Untuk Dewan Penguji:</strong></p>
  <ol>
    <li>Dewan penguji diharapkan hadir 15 menit sebelum ujian dimulai.</li>
    <li>Berita Acara dan Form penilaian harap diisi sesuai komponen yang diujikan.</li>
    <li>Hasil ujian diserahkan kepada panitia setelah ujian selesai.</li>
  </ol>
  <p><strong>Untuk Mahasiswa:</strong></p>
  <ol>
    <li>Mahasiswa diharapkan hadir 30 menit sebelum ujian dimulai.</li>
    <li>Mahasiswa wajib berpakaian rapi dan sopan (kemeja putih, celana/rok hitam, almamater).</li>
    <li>Mahasiswa wajib membawa perlengkapan ujian (alat tulis, dll).</li>
    <li>Mahasiswa wajib menyiapkan materi sesuai komponen yang diujikan.</li>
  </ol>
</div>

${renderFooter(v.qrHtml)}
</div>

</body>
</html>`;
}

export function renderUjianKomprehensifBeritaAcara(ctx: DocumentContext): string {
  const v = sharedVars(ctx);

  const keputusanLulus = ctx.keputusan_sidang === "lulus" || ctx.keputusan_sidang === "layak";
  const keputusanTidakLulus = ctx.keputusan_sidang === "tidak_lulus" || ctx.keputusan_sidang === "tidak_layak";
  const lulusCheckbox = keputusanLulus ? "[&#x2713;]" : "[&emsp;&emsp;]";
  const tidakLulusCheckbox = keputusanTidakLulus ? "[&#x2713;]" : "[&emsp;&emsp;]";

  const x1Display = ctx.x1_komprehensif != null ? String(ctx.x1_komprehensif) : placeholder(null, "X1");
  const x2Display = ctx.x2_komprehensif != null ? String(ctx.x2_komprehensif) : placeholder(null, "X2");
  const nilaiAkhirDisplay = ctx.nilai_akhir != null ? String(ctx.nilai_akhir) : placeholder(null, "P");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Ujian Komprehensif - Berita Acara</title>
<style>${PAGE_STYLES}</style>
</head>
<body>

<!-- ==================== PAGE 2: BERITA ACARA KEPUTUSAN SIDANG ==================== -->
<div class="page" style="position:relative;">
${renderKopSurat(ctx.logo_src)}

<div class="page-form-no">Form I K</div>

<div class="title-section">
  <p class="title-underline">Berita Acara Keputusan Sidang &mdash;<br>UJIAN KOMPREHENSIP</p>
</div>

<table class="data-table" style="margin-left:30px;">
  <tr>
    <td class="label-col">Nama Mahasiswa</td>
    <td class="sep-col">:</td>
    <td>${v.namaMhs}</td>
  </tr>
  <tr>
    <td>NIM</td>
    <td>:</td>
    <td>${v.nimMhs}</td>
  </tr>
  <tr>
    <td>Semester</td>
    <td>:</td>
    <td>${v.semesterAktif}</td>
  </tr>
  <tr>
    <td>Jurusan</td>
    <td>:</td>
    <td>${v.namaProdi}</td>
  </tr>
  <tr>
    <td>Fakultas</td>
    <td>:</td>
    <td>Ushuluddin dan Adab</td>
  </tr>
  <tr>
    <td>Tahun Akademik</td>
    <td>:</td>
    <td>${v.tahunAkademik}</td>
  </tr>
  <tr>
    <td>Nilai</td>
    <td>:</td>
    <td>
      <span class="bordered-cell">&nbsp;${nilaiAkhirDisplay}&nbsp;</span>
    </td>
  </tr>
</table>

<div class="section-title">KEPUTUSAN DEWAN PENGUJI</div>

<table class="data-table" style="margin-left:20px;">
  <tr>
    <td class="checkbox-cell">
      ${lulusCheckbox}
    </td>
    <td><strong>LULUS</strong></td>
    <td style="width:30px;"></td>
    <td class="checkbox-cell">
      ${tidakLulusCheckbox}
    </td>
    <td><strong>TIDAK LULUS</strong></td>
  </tr>
</table>

<table class="data-table" style="margin-left:20px; margin-top:15px;">
  <tr>
    <td>Serang,</td>
    <td>${v.tanggalSidang}</td>
  </tr>
</table>

<table class="sig-table" style="margin-top:5px;">
  <tr>
    <th class="text-center" style="width:50%;">DEWAN PENGUJI</th>
    <th class="text-center" style="width:50%;"></th>
  </tr>
  <tr style="height:90px;">
    <td class="text-center" style="vertical-align:bottom;">
      <div class="sig-line">
        <strong>1. Penguji Keahlian Prodi</strong><br>
        <span style="text-decoration:underline;display:inline-block;min-width:180px;">&nbsp;</span><br>
        ${v.penguji1Nama}
      </div>
    </td>
    <td class="text-center" style="vertical-align:bottom;">
      <div class="sig-line">
        <strong>2. Penguji Keislaman</strong><br>
        <span style="text-decoration:underline;display:inline-block;min-width:180px;">&nbsp;</span><br>
        ${v.penguji2Nama}
      </div>
    </td>
  </tr>
</table>

${KETERANGAN_NILAI_TABLE}
</div>

<!-- ==================== PAGE 3: REKAPITULASI NILAI KOMPREHENSIP ==================== -->
<div class="page" style="position:relative;">
${renderKopSurat(ctx.logo_src)}

<div class="page-form-no">Form II K</div>

<div class="title-section">
  <p class="title-underline">REKAPITULASI NILAI KOMPREHENSIP</p>
</div>

<table class="data-table" style="margin-left:20px;">
  <tr>
    <td colspan="3"><strong>A. IDENTITAS MAHASISWA</strong></td>
  </tr>
  <tr>
    <td class="label-col">Nama</td>
    <td class="sep-col">:</td>
    <td>${v.namaMhs}</td>
  </tr>
  <tr>
    <td>NIM</td>
    <td>:</td>
    <td>${v.nimMhs}</td>
  </tr>
  <tr>
    <td>Semester</td>
    <td>:</td>
    <td>${v.semesterAktif}</td>
  </tr>
  <tr>
    <td>Jurusan</td>
    <td>:</td>
    <td>${v.namaProdi}</td>
  </tr>
  <tr>
    <td>Fakultas</td>
    <td>:</td>
    <td>Ushuluddin dan Adab</td>
  </tr>
  <tr>
    <td>Tahun Akademik</td>
    <td>:</td>
    <td>${v.tahunAkademik}</td>
  </tr>
</table>

<table class="data-table" style="margin-left:20px; margin-top:10px;">
  <tr>
    <td colspan="3"><strong>B. IDENTITAS PENGUJI</strong></td>
  </tr>
  <tr>
    <td class="label-col">Penguji I (Keahlian Prodi)</td>
    <td class="sep-col">:</td>
    <td>${v.penguji1Nama}</td>
  </tr>
  <tr>
    <td>Penguji II (Keislaman)</td>
    <td>:</td>
    <td>${v.penguji2Nama}</td>
  </tr>
</table>

<div class="section-title">C. NILAI AKHIR UJIAN KOMPREHENSIP</div>

<table class="bordered-table" style="margin-top:5px;">
  <thead>
    <tr>
      <th style="width:25px;">NO</th>
      <th>KOMPONEN</th>
      <th style="width:100px;">NILAI</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-center">1</td>
      <td>Penguasaan Komponen Dasar Keilmuan Prodi (X1)</td>
      <td class="text-center">${x1Display}</td>
    </tr>
    <tr>
      <td class="text-center">2</td>
      <td>Penguasaan Komponen Pendukung (Keislaman) (X2)</td>
      <td class="text-center">${x2Display}</td>
    </tr>
    <tr>
      <td colspan="2" class="text-center text-bold"><strong>NILAI AKHIR KOMPREHENSIP (P)</strong></td>
      <td class="text-center text-bold"><strong>${nilaiAkhirDisplay}</strong></td>
    </tr>
  </tbody>
</table>

<p class="text-center" style="margin:8px 0;">
  <strong>P = (X1 + X2) / 2</strong>
</p>

<table class="sig-table">
  <tr>
    <th class="text-center" style="width:50%;">Penguji I (Keahlian Prodi)</th>
    <th class="text-center" style="width:50%;">Penguji II (Keislaman)</th>
  </tr>
  <tr style="height:90px;">
    <td class="text-center" style="vertical-align:bottom;">
      <div class="sig-line">
        <span style="text-decoration:underline;display:inline-block;min-width:180px;">&nbsp;</span><br>
        ${v.penguji1Nama}
      </div>
    </td>
    <td class="text-center" style="vertical-align:bottom;">
      <div class="sig-line">
        <span style="text-decoration:underline;display:inline-block;min-width:180px;">&nbsp;</span><br>
        ${v.penguji2Nama}
      </div>
    </td>
  </tr>
</table>

<div style="margin-top:10px;">
  <table class="data-table" style="margin-left:20px;">
    <tr>
      <td>Serang,</td>
      <td>${v.tanggalSidang}</td>
    </tr>
    <tr>
      <td colspan="2">Mengetahui,</td>
    </tr>
    <tr>
      <td colspan="2">a.n. Dekan</td>
    </tr>
    <tr>
      <td colspan="2">Wakil Dekan Bidang Akademik dan Kelembagaan</td>
    </tr>
  </table>

  <div class="signature-section" style="margin-top:10px;">
    <div class="signature-space">${v.ttdHtml}</div>
    <p class="signature-text text-bold" style="text-decoration:underline;">${v.wd1Nama}</p>
    <p class="signature-text">NIP. ${v.wd1Nip}</p>
  </div>
  <div class="clear"></div>
</div>

${KETERANGAN_NILAI_TABLE}
</div>

<!-- ==================== PAGE 4: NILAI UJIAN KOMPREHENSIP (Komponen Dasar) ==================== -->
<div class="page" style="position:relative;">
${renderKopSurat(ctx.logo_src)}

<div class="page-form-no">Form III K</div>

<div class="title-section">
  <p class="title-underline">NILAI UJIAN KOMPREHENSIP</p>
  <p style="margin:3px 0; font-size:10pt;"><strong>MATA KULIAH KOMPONEN DASAR</strong></p>
</div>

<table class="data-table" style="margin-left:20px;">
  <tr>
    <td class="label-col">Nama Mahasiswa</td>
    <td class="sep-col">:</td>
    <td>${v.namaMhs}</td>
  </tr>
  <tr>
    <td>NIM</td>
    <td>:</td>
    <td>${v.nimMhs}</td>
  </tr>
  <tr>
    <td>Semester</td>
    <td>:</td>
    <td>${v.semesterAktif}</td>
  </tr>
  <tr>
    <td>Jurusan</td>
    <td>:</td>
    <td>${v.namaProdi} (${v.kodeProdi})</td>
  </tr>
  <tr>
    <td>Fakultas</td>
    <td>:</td>
    <td>Ushuluddin dan Adab</td>
  </tr>
  <tr>
    <td>Tahun Akademik</td>
    <td>:</td>
    <td>${v.tahunAkademik}</td>
  </tr>
  <tr>
    <td>Hari / Tanggal</td>
    <td>:</td>
    <td>${v.hariSidang}, ${v.tanggalSidang}</td>
  </tr>
  <tr>
    <td>Waktu</td>
    <td>:</td>
    <td>${v.waktuSidang}</td>
  </tr>
  <tr>
    <td>Ruang</td>
    <td>:</td>
    <td>${v.ruangSidang}</td>
  </tr>
</table>

<div class="section-title">NILAI UJIAN KOMPONEN DASAR</div>

<table class="bordered-table" style="margin-top:5px;">
  <thead>
    <tr>
      <th style="width:25px;">NO</th>
      <th>KOMPONEN PENILAIAN</th>
      <th style="width:80px;">NILAI</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-center">1</td>
      <td>Penguasaan Materi Keilmuan Prodi</td>
      <td class="text-center">${placeholder(null, "N1")}</td>
    </tr>
    <tr>
      <td class="text-center">2</td>
      <td>Kemampuan Analisis</td>
      <td class="text-center">${placeholder(null, "N2")}</td>
    </tr>
    <tr>
      <td class="text-center">3</td>
      <td>Kemampuan Argumentasi</td>
      <td class="text-center">${placeholder(null, "N3")}</td>
    </tr>
    <tr>
      <td class="text-center">4</td>
      <td>Sistematika Penyampaian</td>
      <td class="text-center">${placeholder(null, "N4")}</td>
    </tr>
    <tr>
      <td colspan="2" class="text-center text-bold"><strong>RATA-RATA KOMPONEN DASAR (X1)</strong></td>
      <td class="text-center text-bold"><strong>${placeholder(null, "X1")}</strong></td>
    </tr>
  </tbody>
</table>

<p class="body-text" style="margin-top:15px; font-size:9pt;">
  Catatan / Komentar Penguji:<br>
  <span style="display:block;border-bottom:1px solid #000;min-height:40px;width:100%;margin-top:5px;">&nbsp;</span>
  <span style="display:block;border-bottom:1px solid #000;min-height:40px;width:100%;">二</span>
  <span style="display:block;border-bottom:1px solid #000;min-height:40px;width:100%;">三</span>
</p>

<table class="sig-table" style="margin-top:15px;">
  <tr>
    <td style="width:60%;">
      <table class="data-table">
        <tr><td>Serang,</td><td>${v.tanggalSidang}</td></tr>
      </table>
    </td>
    <td style="width:40%; text-align:center;">
    </td>
  </tr>
  <tr style="height:100px;">
    <td style="vertical-align:top;"></td>
    <td class="text-center" style="vertical-align:bottom;">
      <strong>Penguji Materi Keahlian Prodi</strong><br>
      <span style="text-decoration:underline;display:inline-block;min-width:180px;">&nbsp;</span><br>
      ${v.penguji1Nama}
    </td>
  </tr>
</table>
</div>

<!-- ==================== PAGE 5: NILAI UJIAN KOMPREHENSIP (Komponen Pendukung) ==================== -->
<div class="page" style="page-break-after: avoid !important; position: relative;">
${renderKopSurat(ctx.logo_src)}

<div class="page-form-no">Form IV K</div>

<div class="title-section">
  <p class="title-underline">NILAI UJIAN KOMPREHENSIP</p>
  <p style="margin:3px 0; font-size:10pt;"><strong>MATA KULIAH KOMPONEN PENDUKUNG</strong></p>
</div>

<table class="data-table" style="margin-left:20px;">
  <tr>
    <td class="label-col">Nama Mahasiswa</td>
    <td class="sep-col">:</td>
    <td>${v.namaMhs}</td>
  </tr>
  <tr>
    <td>NIM</td>
    <td>:</td>
    <td>${v.nimMhs}</td>
  </tr>
  <tr>
    <td>Semester</td>
    <td>:</td>
    <td>${v.semesterAktif}</td>
  </tr>
  <tr>
    <td>Jurusan</td>
    <td>:</td>
    <td>${v.namaProdi} (${v.kodeProdi})</td>
  </tr>
  <tr>
    <td>Fakultas</td>
    <td>:</td>
    <td>Ushuluddin dan Adab</td>
  </tr>
  <tr>
    <td>Tahun Akademik</td>
    <td>:</td>
    <td>${v.tahunAkademik}</td>
  </tr>
  <tr>
    <td>Hari / Tanggal</td>
    <td>:</td>
    <td>${v.hariSidang}, ${v.tanggalSidang}</td>
  </tr>
  <tr>
    <td>Waktu</td>
    <td>:</td>
    <td>${v.waktuSidang}</td>
  </tr>
  <tr>
    <td>Ruang</td>
    <td>:</td>
    <td>${v.ruangSidang}</td>
  </tr>
</table>

<div class="section-title">NILAI UJIAN KOMPONEN PENDUKUNG</div>

<table class="bordered-table" style="margin-top:5px;">
  <thead>
    <tr>
      <th style="width:25px;">NO</th>
      <th>KOMPONEN PENILAIAN</th>
      <th style="width:80px;">NILAI</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-center">1</td>
      <td>Penguasaan Materi Keislaman</td>
      <td class="text-center">${placeholder(null, "N1")}</td>
    </tr>
    <tr>
      <td class="text-center">2</td>
      <td>Kemampuan Membaca Al-Qur'an</td>
      <td class="text-center">${placeholder(null, "N2")}</td>
    </tr>
    <tr>
      <td class="text-center">3</td>
      <td>Pemahaman Aqidah dan Akhlak</td>
      <td class="text-center">${placeholder(null, "N3")}</td>
    </tr>
    <tr>
      <td class="text-center">4</td>
      <td>Sistematika Penyampaian</td>
      <td class="text-center">${placeholder(null, "N4")}</td>
    </tr>
    <tr>
      <td colspan="2" class="text-center text-bold"><strong>RATA-RATA KOMPONEN PENDUKUNG (X2)</strong></td>
      <td class="text-center text-bold"><strong>${placeholder(null, "X2")}</strong></td>
    </tr>
  </tbody>
</table>

<p class="body-text" style="margin-top:15px; font-size:9pt;">
  Catatan / Komentar Penguji:<br>
  <span style="display:block;border-bottom:1px solid #000;min-height:40px;width:100%;margin-top:5px;">&nbsp;</span>
  <span style="display:block;border-bottom:1px solid #000;min-height:40px;width:100%;">二</span>
  <span style="display:block;border-bottom:1px solid #000;min-height:40px;width:100%;">三</span>
</p>

<table class="sig-table" style="margin-top:15px;">
  <tr>
    <td style="width:60%;">
      <table class="data-table">
        <tr><td>Serang,</td><td>${v.tanggalSidang}</td></tr>
      </table>
    </td>
    <td style="width:40%; text-align:center;">
    </td>
  </tr>
  <tr style="height:100px;">
    <td style="vertical-align:top;"></td>
    <td class="text-center" style="vertical-align:bottom;">
      <strong>Penguji Materi Keislaman</strong><br>
      <span style="text-decoration:underline;display:inline-block;min-width:180px;">&nbsp;</span><br>
      ${v.penguji2Nama}
    </td>
  </tr>
</table>
</div>

</body>
</html>`;
}

// Keep original for backward compat
export function renderUjianKomprehensif(ctx: DocumentContext): string {
  return renderUjianKomprehensifSuratTugas(ctx);
}
