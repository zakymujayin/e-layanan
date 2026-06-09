import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderUjianSkripsiSuratTugas(ctx: DocumentContext): string {
  const isPreview = ctx.mode === "preview";

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SURAT")
    : (ctx.nomor_surat ?? "");

  const qrHtml = isPreview ? placeholder(ctx.qrcode, "QR") : (ctx.qrcode ?? "");

  const dekanNama = placeholder(ctx.dekan?.nama ?? null, "NAMA DEKAN");
  const dekanNip = placeholder(ctx.dekan?.nip ?? null, "NIP DEKAN");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, `TTD ${ctx.dekan?.nama ?? "DEKAN"}`)
    : (ctx.ttd ?? "");

  const namaMhs = placeholder(ctx.nama_mahasiswa, "NAMA MAHASISWA");
  const nim = placeholder(ctx.nim, "NIM");
  const kodeProdi = placeholder(ctx.kode_prodi, "KODE PRODI");
  const judul = placeholder(ctx.judul_disetujui, "JUDUL DISETUJUI");
  const hari = placeholder(ctx.hari_sidang, "HARI");
  const tanggal = placeholder(ctx.tanggal_sidang, "TANGGAL");
  const ruang = placeholder(ctx.ruang_sidang, "RUANG");
  const waktu = placeholder(ctx.waktu_sidang, "WAKTU");
  const ketua = placeholder(ctx.ketua_sidang, "KETUA SIDANG");
  const sekretaris = placeholder(ctx.sekretaris_sidang, "SEKRETARIS SIDANG");
  const pembimbing1 = placeholder(ctx.pembimbing_1, "PEMBIMBING 1");
  const pembimbing2 = placeholder(ctx.pembimbing_2, "PEMBIMBING 2");
  const penguji1 = placeholder(ctx.penguji_1, "PENGUJI 1");
  const penguji2 = placeholder(ctx.penguji_2, "PENGUJI 2");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Tugas Ujian Skripsi</title>
<style>
  ${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}
  .page-first .page { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; }

  .center { text-align: center; }
  .justify { text-align: justify; }
  .bold { font-weight: bold; }
  .underline { text-decoration: underline; }

  .tabel-tugas {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .tabel-tugas th,
  .tabel-tugas td {
    border: 1px solid #000;
    padding: 5px;
    vertical-align: top;
    font-size: 10pt;
    text-align: center;
  }

  .tabel-tugas th {
    background: #f0f0f0;
    font-weight: bold;
  }

  .tabel-tugas td {
    text-align: left;
  }

  .tabel-tugas td:first-child,
  .tabel-tugas td:last-child {
    text-align: center;
  }
</style>
</head>
<body>
<div class="page-first">
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="center" style="margin-bottom: 12px;">
  <div style="font-size: 14pt; font-weight: bold; letter-spacing: 2px;">
    <span class="underline">SURAT TUGAS</span>
  </div>
  <div style="margin-top: 4px;">Nomor: ${nomorSurat}</div>
</div>

<p class="justify" style="margin-bottom: 10px; text-indent: 40px;">
  Dekan Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten menugaskan
  dosen-dosen sebagaimana tersebut pada daftar Majelis Penguji untuk menjadi penguji
  pada Ujian Skripsi (Munaqasyah) pada:
</p>

<div style="margin-left: 60px; margin-bottom: 10px; line-height: 1.6;">
  Hari&#xa0;&#xa0;&#xa0;&#xa0; : <b>${hari}</b><br>
  Tanggal : <b>${tanggal}</b><br>
  Ruang&#xa0;&#xa0; : <b>${ruang}</b>
</div>

<p class="justify" style="margin-bottom: 10px; text-indent: 40px;">
  Untuk menguji
</p>

<table class="tabel-tugas">
  <thead>
    <tr>
      <th style="width: 5%;">NO</th>
      <th style="width: 30%;">NAMA/NIM/JUR/JUDUL SKRIPSI</th>
      <th style="width: 40%;">MAJELIS PENGUJI</th>
      <th style="width: 25%;">WAKTU</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1.</td>
      <td>
        <b>${namaMhs}<br>${nim} / ${kodeProdi}</b><br><br>
        ${judul}
      </td>
      <td>
        Ketua Penguji&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${ketua}<br>
        Sekretaris Penguji&#xa0;&#xa0;&#xa0;&#xa0; : ${sekretaris}<br>
        Pembimbing I&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${pembimbing1}<br>
        Pembimbing II&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${pembimbing2}<br>
        Penguji I&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${penguji1}<br>
        Penguji II&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${penguji2}
      </td>
      <td>${waktu}</td>
    </tr>
  </tbody>
</table>

<div style="display: flex; justify-content: flex-end; margin-top: 10px;">
  <div style="text-align: left; width: 280px; line-height: 1.5;">
    Serang, ${isPreview ? reserved(ctx.tanggal_surat, "TANGGAL") : (ctx.tanggal_surat ?? "")}<br>
    Dekan,<br>
    Fakultas Ushuluddin dan Adab
    <div style="min-height: 70px; margin-top: 10px;">${ttdHtml}</div>
    <div class="bold" style="text-decoration: underline;">${dekanNama}</div>
    NIP. ${dekanNip}
  </div>
</div>

<div class="clear" style="margin-bottom: 20px;"></div>

<div style="margin-top: 20px;">
  <b><i>Tembusan:</i></b><br>
  <ol style="margin: 4px 0;">
    <li>Dekan FUDA (sebagai laporan)</li>
    <li>Wakil Dekan I, II, III</li>
    <li>Ketua Jurusan ${kodeProdi}</li>
    <li>Mahasiswa yang bersangkutan</li>
  </ol>
</div>

<div style="margin-top: 5px;">
  Catatan:<br>
  <ol style="margin: 4px 0;">
    <li>Mahasiswa diwajibkan berpakaian:</li>
    <ol type="a">
      <li>Kemeja putih, berdasi, berjas almamater (laki-laki)</li>
      <li>Muslimah dan blazer hitam (perempuan)</li>
    </ol>
    <li>Penguji yang tidak hadir akan diganti oleh penguji lain</li>
    <li>Mahasiswa wajib hadir 30 menit sebelum pelaksanaan sidang</li>
    <li>Mahasiswa wajib mengikuti penutupan sidang</li>
  </ol>
</div>

${renderFooter(qrHtml)}
</div>
</div>
</body>
</html>`;
}

export function renderUjianSkripsiBeritaAcara(ctx: DocumentContext): string {
  const isPreview = ctx.mode === "preview";
  const qrHtml = isPreview ? placeholder(ctx.qrcode, "QR") : (ctx.qrcode ?? "");

  const namaMhs = placeholder(ctx.nama_mahasiswa, "NAMA MAHASISWA");
  const nim = placeholder(ctx.nim, "NIM");
  const namaProdi = placeholder(ctx.nama_prodi, "NAMA PRODI");
  const judul = placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI");
  const hari = placeholder(ctx.hari_sidang, "HARI");
  const tanggal = placeholder(ctx.tanggal_sidang, "TANGGAL");
  const waktu = placeholder(ctx.waktu_sidang, "WAKTU");
  const ruang = placeholder(ctx.ruang_sidang, "RUANG");
  const ketua = placeholder(ctx.ketua_sidang, "KETUA SIDANG");
  const sekretaris = placeholder(ctx.sekretaris_sidang, "SEKRETARIS SIDANG");
  const pembimbing1 = placeholder(ctx.pembimbing_1, "PEMBIMBING 1");
  const pembimbing2 = placeholder(ctx.pembimbing_2, "PEMBIMBING 2");
  const penguji1 = placeholder(ctx.penguji_1, "PENGUJI 1");
  const penguji2 = placeholder(ctx.penguji_2, "PENGUJI 2");

  const keputusanText = ctx.keputusan_sidang === "lulus" ? "LULUS"
    : ctx.keputusan_sidang === "tidak_lulus" ? "TIDAK LULUS"
    : placeholder(null, "KEPUTUSAN");

  const nilaiPembimbing1 = ctx.nilai_per_penilai?.pembimbing_1 != null
    ? String(ctx.nilai_per_penilai.pembimbing_1)
    : placeholder(null, "NILAI");
  const nilaiPembimbing2 = ctx.nilai_per_penilai?.pembimbing_2 != null
    ? String(ctx.nilai_per_penilai.pembimbing_2)
    : placeholder(null, "NILAI");
  const nilaiPenguji1 = ctx.nilai_per_penilai?.penguji_1 != null
    ? String(ctx.nilai_per_penilai.penguji_1)
    : placeholder(null, "NILAI");
  const nilaiPenguji2 = ctx.nilai_per_penilai?.penguji_2 != null
    ? String(ctx.nilai_per_penilai.penguji_2)
    : placeholder(null, "NILAI");
  const nilaiAkhir = ctx.nilai_akhir != null ? String(ctx.nilai_akhir) : placeholder(null, "RATA-RATA");
  const ipkDisplay = ctx.ipk_equivalent != null ? String(ctx.ipk_equivalent) : placeholder(null, "IPK");

  const yudisiumLabel = ctx.yudisium === "pujian" ? "PUJIAN"
    : ctx.yudisium === "sangat_memuaskan" ? "SANGAT MEMUASKAN"
    : ctx.yudisium === "memuaskan" ? "MEMUASKAN"
    : placeholder(null, "YUDISIUM");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Berita Acara Munaqasyah</title>
<style>
  ${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}

  .center { text-align: center; }
  .justify { text-align: justify; }
  .bold { font-weight: bold; }
  .underline { text-decoration: underline; }

  .ba-title {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    text-decoration: underline;
    margin: 10px 0 4px 0;
  }

  .ba-subtitle {
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    margin: 0 0 15px 0;
  }

  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }

  .info-table td {
    padding: 3px 6px;
    vertical-align: top;
    font-size: 11pt;
  }

  .info-table td:first-child {
    width: 190px;
  }

  .info-table td:nth-child(2) {
    width: 10px;
    text-align: center;
  }

  .majelis-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }

  .majelis-table th,
  .majelis-table td {
    border: 1px solid #000;
    padding: 5px 8px;
    font-size: 10pt;
    vertical-align: top;
  }

  .majelis-table th {
    background: #f0f0f0;
    text-align: center;
    font-weight: bold;
  }

  .nilai-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }

  .nilai-table th,
  .nilai-table td {
    border: 1px solid #000;
    padding: 5px 8px;
    font-size: 11pt;
    vertical-align: middle;
  }

  .nilai-table th {
    background: #f0f0f0;
    text-align: center;
    font-weight: bold;
  }

  .nilai-table td:last-child {
    text-align: center;
  }

  .keputusan-box {
    border: 2px solid #000;
    padding: 10px 20px;
    display: inline-block;
    font-size: 14pt;
    font-weight: bold;
    margin: 10px 0;
  }

  .sig-row {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }

  .sig-block {
    text-align: center;
    width: 45%;
  }

  .sig-space {
    min-height: 70px;
    margin: 8px 0 4px 0;
  }

  .sig-name {
    font-weight: bold;
    text-decoration: underline;
  }
</style>
</head>
<body>

<!-- ==================== PAGE 1: BERITA ACARA MUNAQASYAH ==================== -->
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="ba-title">BERITA ACARA MUNAQASYAH</div>
<div class="ba-subtitle">FAKULTAS USHULUDDIN DAN ADAB</div>

<table class="info-table">
  <tr><td>Nama Mahasiswa</td><td>:</td><td>${namaMhs}</td></tr>
  <tr><td>NIM</td><td>:</td><td>${nim}</td></tr>
  <tr><td>Program Studi</td><td>:</td><td>${namaProdi}</td></tr>
  <tr><td>Judul Skripsi</td><td>:</td><td><em>${judul}</em></td></tr>
</table>

<table class="info-table" style="margin-top:12px;">
  <tr><td>Hari / Tanggal</td><td>:</td><td>${hari}, ${tanggal}</td></tr>
  <tr><td>Waktu</td><td>:</td><td>${waktu}</td></tr>
  <tr><td>Ruang</td><td>:</td><td>${ruang}</td></tr>
</table>

<p style="margin:12px 0 6px 0; font-size:11pt; font-weight:bold;">Susunan Majelis Penguji:</p>

<table class="majelis-table">
  <thead>
    <tr>
      <th style="width:25px;">No</th>
      <th>Nama</th>
      <th style="width:180px;">Jabatan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center;">1</td>
      <td>${ketua}</td>
      <td>Ketua Sidang</td>
    </tr>
    <tr>
      <td style="text-align:center;">2</td>
      <td>${sekretaris}</td>
      <td>Sekretaris Sidang</td>
    </tr>
    <tr>
      <td style="text-align:center;">3</td>
      <td>${pembimbing1}</td>
      <td>Pembimbing I</td>
    </tr>
    <tr>
      <td style="text-align:center;">4</td>
      <td>${pembimbing2}</td>
      <td>Pembimbing II</td>
    </tr>
    <tr>
      <td style="text-align:center;">5</td>
      <td>${penguji1}</td>
      <td>Penguji I</td>
    </tr>
    <tr>
      <td style="text-align:center;">6</td>
      <td>${penguji2}</td>
      <td>Penguji II</td>
    </tr>
  </tbody>
</table>

<p style="margin:15px 0 6px 0; font-size:11pt; font-weight:bold;">Keputusan Sidang Munaqasyah:</p>

<div style="text-align:center; margin: 10px 0;">
  <span class="keputusan-box">${keputusanText}</span>
</div>

<p style="font-size:10pt; margin:15px 0; text-align:justify;">
  Demikian berita acara ini dibuat dengan sebenar-benarnya untuk digunakan sebagaimana mestinya.
</p>

<div class="sig-row">
  <div class="sig-block">
    <p style="margin:0;">Ketua Sidang,</p>
    <div class="sig-space"></div>
    <p class="sig-name">${ketua}</p>
  </div>
  <div class="sig-block">
    <p style="margin:0;">Sekretaris Sidang,</p>
    <div class="sig-space"></div>
    <p class="sig-name">${sekretaris}</p>
  </div>
</div>

<div class="clear"></div>
${renderFooter(qrHtml)}
</div>

<!-- ==================== PAGE 2: REKAPITULASI NILAI MUNAQASYAH ==================== -->
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="ba-title">REKAPITULASI NILAI UJIAN MUNAQASYAH</div>
<div class="ba-subtitle">FAKULTAS USHULUDDIN DAN ADAB</div>

<table class="info-table">
  <tr><td>Nama Mahasiswa</td><td>:</td><td>${namaMhs}</td></tr>
  <tr><td>NIM</td><td>:</td><td>${nim}</td></tr>
  <tr><td>Program Studi</td><td>:</td><td>${namaProdi}</td></tr>
  <tr><td>Judul Skripsi</td><td>:</td><td><em>${judul}</em></td></tr>
</table>

<p style="margin:15px 0 6px 0; font-size:11pt; font-weight:bold;">Nilai Per Penilai:</p>

<table class="nilai-table">
  <thead>
    <tr>
      <th style="width:25px;">No</th>
      <th>Nama Penilai</th>
      <th style="width:150px;">Jabatan</th>
      <th style="width:80px;">Nilai</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center;">1</td>
      <td>${pembimbing1}</td>
      <td>Pembimbing I</td>
      <td>${nilaiPembimbing1}</td>
    </tr>
    <tr>
      <td style="text-align:center;">2</td>
      <td>${pembimbing2}</td>
      <td>Pembimbing II</td>
      <td>${nilaiPembimbing2}</td>
    </tr>
    <tr>
      <td style="text-align:center;">3</td>
      <td>${penguji1}</td>
      <td>Penguji I</td>
      <td>${nilaiPenguji1}</td>
    </tr>
    <tr>
      <td style="text-align:center;">4</td>
      <td>${penguji2}</td>
      <td>Penguji II</td>
      <td>${nilaiPenguji2}</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align:center; font-weight:bold;">Nilai Rata-Rata</td>
      <td style="font-weight:bold;">${nilaiAkhir}</td>
    </tr>
  </tbody>
</table>

<table class="info-table" style="margin-top:15px;">
  <tr>
    <td>IPK</td>
    <td>:</td>
    <td>${ipkDisplay}</td>
  </tr>
  <tr>
    <td>Yudisium</td>
    <td>:</td>
    <td><strong>${yudisiumLabel}</strong></td>
  </tr>
</table>

<div style="text-align:right; margin-top:20px;">
  <div style="display:inline-block; text-align:center; width:260px;">
    <p style="margin:0;">Serang, ${tanggal}</p>
    <p style="margin:0;">Sekretaris Sidang,</p>
    <div class="sig-space"></div>
    <p class="sig-name">${sekretaris}</p>
  </div>
</div>

<div class="clear"></div>
${renderFooter(qrHtml)}
</div>

</body>
</html>`;
}

// Keep original for backward compat
export function renderUjianSkripsi(ctx: DocumentContext): string {
  return renderUjianSkripsiSuratTugas(ctx);
}
