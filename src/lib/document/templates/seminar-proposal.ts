import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

function sharedVars(ctx: DocumentContext) {
  const isPreview = ctx.mode === "preview";

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SURAT")
    : (ctx.nomor_surat ?? "");

  const tanggalSurat = isPreview
    ? reserved(ctx.tanggal_surat, "TANGGAL SURAT")
    : (ctx.tanggal_surat ?? "");

  const wd1Nama = placeholder(ctx.wakil_dekan_1?.nama ?? null, "NAMA WAKIL DEKAN");
  const wd1Nip = placeholder(ctx.wakil_dekan_1?.nip ?? null, "NIP WAKIL DEKAN");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, `TTD ${ctx.wakil_dekan_1?.nama ?? "WD1"}`)
    : (ctx.ttd ?? "");

  const qrHtml = isPreview
    ? placeholder(ctx.qrcode, "QR")
    : (ctx.qrcode ?? "");

  const penguji1 = placeholder(ctx.penguji_1, "PENGUJI 1");
  const penguji2 = placeholder(ctx.penguji_2, "PENGUJI 2");
  const hari = placeholder(ctx.hari_sidang, "HARI");
  const tgl = placeholder(ctx.tanggal_sidang, "TANGGAL SIDANG");
  const waktu = placeholder(ctx.waktu_sidang, "WAKTU");
  const ruang = placeholder(ctx.ruang_sidang, "RUANG");

  const pembimbing1 = placeholder(ctx.pembimbing_1, "PEMBIMBING 1");
  const pembimbing2 = placeholder(ctx.pembimbing_2, "PEMBIMBING 2");

  return {
    isPreview, nomorSurat, tanggalSurat,
    wd1Nama, wd1Nip, ttdHtml, qrHtml,
    penguji1, penguji2, hari, tgl, waktu, ruang,
    pembimbing1, pembimbing2,
  };
}

function commonStyles(): string {
  return `${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .judul-surat { text-align:center; font-size:12pt; font-weight:bold; text-decoration:underline; margin:10px 0 5px 0; }
  .nomor-surat { text-align:center; margin-bottom:20px; }
  .tabel-info { width:100%; border-collapse:collapse; margin:15px 0; }
  .tabel-info td { padding:3px 8px; font-size:12pt; vertical-align:top; }
  .tabel-info td:first-child { width:200px; }
  .tabel-info td:nth-child(2) { width:5px; text-align:center; }
  .paragraf { text-align:justify; margin:15px 0; font-size:12pt; line-height:1.5; text-indent:1cm; }
  .section-title { text-align:center; font-weight:bold; font-size:12pt; margin:10px 0; }
  .tabel-kehadiran { width:100%; border-collapse:collapse; margin:15px 0; }
  .tabel-kehadiran th { border:1px solid #000; padding:6px; font-size:11pt; background:#f0f0f0; }
  .tabel-kehadiran td { border:1px solid #000; padding:6px; font-size:11pt; }
  .checklist { text-align:center; }`;
}

export function renderSeminarProposalSuratTugas(ctx: DocumentContext): string {
  const v = sharedVars(ctx);

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Tugas Seminar Proposal</title>
<style>${commonStyles()}
</style>
</head>
<body>

<div class="page">
${renderKopSurat(ctx.logo_src)}
<div class="judul-surat">SURAT TUGAS</div>
<div class="nomor-surat">Nomor: ${v.nomorSurat}</div>

<p class="paragraf">
  Wakil Dekan Bidang Akademik Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin
  Banten, dengan ini menugaskan kepada:
</p>

<table class="tabel-info">
  <tr>
    <td style="padding-left:40px;">1. Nama / NIP</td>
    <td>:</td>
    <td><strong>${v.penguji1}</strong></td>
  </tr>
  <tr>
    <td style="padding-left:40px;">2. Nama / NIP</td>
    <td>:</td>
    <td><strong>${v.penguji2}</strong></td>
  </tr>
</table>

<p style="text-indent:1cm;font-size:12pt;">
  Untuk bertindak sebagai <strong>Dewan Penguji</strong> pada:
</p>

<table class="tabel-info">
  <tr>
    <td style="padding-left:40px;">Hari / Tanggal</td>
    <td>:</td><td><strong>${v.hari}, ${v.tgl}</strong></td>
  </tr>
  <tr>
    <td style="padding-left:40px;">Waktu</td>
    <td>:</td><td>${v.waktu}</td>
  </tr>
  <tr>
    <td style="padding-left:40px;">Tempat</td>
    <td>:</td><td>${v.ruang}</td>
  </tr>
  <tr>
    <td style="padding-left:40px;">Acara</td>
    <td>:</td><td>Seminar Proposal Skripsi</td>
  </tr>
</table>

<table class="tabel-info">
  <tr><td colspan="3">Mahasiswa yang diuji:</td></tr>
  <tr><td style="padding-left:40px;">Nama</td><td>:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td style="padding-left:40px;">NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td style="padding-left:40px;">Prodi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
  <tr><td style="padding-left:40px;">Judul</td><td>:</td><td><em>${placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI")}</em></td></tr>
</table>

<div class="signature-section">
  <p class="signature-text" style="padding-left:25px;">Serang, ${v.tanggalSurat}</p>
  <p class="signature-text">a.n. Dekan</p>
  <p class="signature-text" style="padding-left:25px;">Wakil Dekan Bidang Akademik</p>
  <div class="signature-space">${v.ttdHtml}</div>
  <p class="signature-text" style="font-weight:bold;text-decoration:underline;padding-left:25px;">${v.wd1Nama}</p>
  <p class="signature-text" style="padding-left:25px;">NIP. ${v.wd1Nip}</p>
</div>
<div class="clear"></div>
${renderFooter(v.qrHtml)}
</div>

<div class="page">
${renderKopSurat(ctx.logo_src)}
<div class="section-title">DAFTAR HADIR DEWAN PENGUJI</div>
<div class="section-title">SEMINAR PROPOSAL SKRIPSI</div>

<table class="tabel-info">
  <tr><td style="padding-left:40px;">Hari / Tanggal</td><td>:</td><td>${v.hari}, ${v.tgl}</td></tr>
  <tr><td style="padding-left:40px;">Nama Mahasiswa</td><td>:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td style="padding-left:40px;">NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td style="padding-left:40px;">Prodi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
</table>

<table class="tabel-kehadiran">
  <thead>
    <tr>
      <th>No</th><th>Nama</th><th>Jabatan</th><th>Tanda Tangan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="checklist">1</td>
      <td>${v.penguji1}</td>
      <td>Penguji I</td>
      <td></td>
    </tr>
    <tr>
      <td class="checklist">2</td>
      <td>${v.penguji2}</td>
      <td>Penguji II</td>
      <td></td>
    </tr>
    <tr>
      <td class="checklist">3</td>
      <td>${v.pembimbing1}</td>
      <td>Pembimbing I</td>
      <td></td>
    </tr>
    <tr>
      <td class="checklist">4</td>
      <td>${v.pembimbing2}</td>
      <td>Pembimbing II</td>
      <td></td>
    </tr>
  </tbody>
</table>

<p style="text-align:right;margin-top:30px;font-size:12pt;">
  Serang, ${v.tanggalSurat}<br>
  Wakil Dekan Bidang Akademik
</p>
<div class="signature-section" style="margin-top:50px;">
  <div class="signature-space">${v.ttdHtml}</div>
  <p class="signature-text" style="font-weight:bold;text-decoration:underline;padding-left:25px;">${v.wd1Nama}</p>
  <p class="signature-text" style="padding-left:25px;">NIP. ${v.wd1Nip}</p>
</div>
<div class="clear"></div>
${renderFooter(v.qrHtml)}
</div>

</body>
</html>`;
}

export function renderSeminarProposalBeritaAcara(ctx: DocumentContext): string {
  const v = sharedVars(ctx);

  const keputusanText = ctx.keputusan_sidang === "layak" ? "LAYAK"
    : ctx.keputusan_sidang === "tidak_layak" ? "TIDAK LAYAK"
    : placeholder(null, "KEPUTUSAN");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Berita Acara Seminar Proposal</title>
<style>${commonStyles()}
</style>
</head>
<body>

<div class="page">
${renderKopSurat(ctx.logo_src)}
<div class="section-title">BERITA ACARA DAN KEPUTUSAN</div>
<div class="section-title">SEMINAR PROPOSAL SKRIPSI</div>

<p class="paragraf">
  Pada hari ${v.hari}, tanggal ${v.tgl}, telah dilaksanakan Seminar
  Proposal Skripsi mahasiswa:
</p>

<table class="tabel-info">
  <tr><td style="padding-left:40px;">Nama</td><td>:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td style="padding-left:40px;">NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td style="padding-left:40px;">Prodi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
  <tr><td style="padding-left:40px;">Tempat / Tgl Lahir</td><td>:</td><td>${placeholder(ctx.tempat_lahir_mahasiswa, "TEMPAT LAHIR")}, ${placeholder(ctx.tanggal_lahir_mahasiswa, "TGL LAHIR")}</td></tr>
  <tr><td style="padding-left:40px;">Semester</td><td>:</td><td>${ctx.semester_teks} T.A. ${ctx.tahun_akademik}</td></tr>
</table>

<p class="paragraf">
  Dengan Dewan Penguji:
</p>

<table class="tabel-info">
  <tr><td style="padding-left:40px;">1.</td><td></td><td>${v.penguji1} (Penguji I)</td></tr>
  <tr><td style="padding-left:40px;">2.</td><td></td><td>${v.penguji2} (Penguji II)</td></tr>
</table>

<p class="paragraf">
  Judul Proposal Skripsi:
  <strong><em>${placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI")}</em></strong>
</p>

<p class="paragraf">
  <strong>Keputusan Seminar Proposal:</strong> <span style="font-size:13pt;font-weight:bold;">${keputusanText}</span>
</p>

<p class="paragraf">
  Demikian berita acara ini dibuat dengan sebenar-benarnya.
</p>

<div class="signature-section" style="float:left;width:40%">
  <p class="signature-text" style="text-align:center;">Penguji I,</p>
  <div class="signature-space"></div>
  <p class="signature-text" style="font-weight:bold;text-decoration:underline;text-align:center;">${v.penguji1}</p>
  <p class="signature-text" style="text-align:center;">NIP.</p>
</div>
<div class="signature-section">
  <p class="signature-text" style="text-align:center;">Penguji II,</p>
  <div class="signature-space"></div>
  <p class="signature-text" style="font-weight:bold;text-decoration:underline;text-align:center;">${v.penguji2}</p>
  <p class="signature-text" style="text-align:center;">NIP.</p>
</div>
<div class="clear"></div>
${renderFooter(v.qrHtml)}
</div>

</body>
</html>`;
}

// Keep original for backward compat
export function renderSeminarProposal(ctx: DocumentContext): string {
  return renderSeminarProposalSuratTugas(ctx);
}
