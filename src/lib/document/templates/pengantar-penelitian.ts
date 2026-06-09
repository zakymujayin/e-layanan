import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderPengantarPenelitian(ctx: DocumentContext): string {
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

  const pejabatTujuan = placeholder(ctx.pejabat_tujuan, "PEJABAT TUJUAN");
  const judulPenelitian = placeholder(ctx.judul_penelitian, "JUDUL PENELITIAN");
  const lokasiPenelitian = placeholder(ctx.lokasi_penelitian, "LOKASI PENELITIAN");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Pengantar Penelitian</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .title-section { text-align: center; margin: 15px 0; }
  .title { font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 0; }
  .info-surat { text-align: left; margin: 10px 0 15px 0; font-size: 11pt; }
  .info-surat table { border-collapse: collapse; }
  .info-surat td { padding: 2px 4px; vertical-align: top; font-size: 11pt; }
  .info-surat td:first-child { width: 70px; }
  .kepada { text-align: left; margin: 15px 0; font-size: 11pt; line-height: 1.4; }
  .body-text { text-align: justify; margin: 15px 0; line-height: 1.5; }
  .form-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  .form-table td { border: none; padding: 3px 0; vertical-align: top; }
  .form-label { width: 160px; padding-left: 20px !important; }
  .form-sep { width: 15px; text-align: center; }
  .penutup { text-align: justify; margin: 20px 0; line-height: 1.5; }
</style>
</head>
<body>
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="info-surat">
<table>
  <tr><td>Nomor</td><td>: ${nomorSurat}</td></tr>
  <tr><td>Lampiran</td><td>: -</td></tr>
  <tr><td>Hal</td><td>: <strong>Izin Penelitian</strong></td></tr>
</table>
</div>

<div class="kepada">
  Kepada Yth.<br>
  ${pejabatTujuan}<br>
  di<br>
  Tempat
</div>

<p class="body-text" style="text-indent: 1cm;">
  <em>Assalamu'alaikum Wr. Wb.</em>
</p>

<p class="body-text" style="text-indent: 1cm;">
  Yang bertanda tangan di bawah ini Wakil Dekan Bidang Akademik Fakultas
  Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten, menerangkan
  dengan sesungguhnya bahwa mahasiswa tersebut di bawah ini:
</p>

<table class="form-table">
  <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td>NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td>Tempat/Tgl. Lahir</td><td>:</td><td>${placeholder(ctx.tempat_lahir_mahasiswa, "TEMPAT LAHIR")}, ${placeholder(ctx.tanggal_lahir_mahasiswa, "TGL LAHIR")}</td></tr>
  <tr><td>Fakultas</td><td>:</td><td>Ushuluddin dan Adab</td></tr>
  <tr><td>Jurusan/Semester</td><td>:</td><td>${ctx.nama_prodi} / ${ctx.semester_teks}</td></tr>
  <tr><td>Judul Skripsi</td><td>:</td><td><em>${judulPenelitian}</em></td></tr>
  <tr><td>Tempat Penelitian</td><td>:</td><td>${lokasiPenelitian}</td></tr>
</table>

<p class="body-text" style="text-indent: 1cm;">
  Akan melaksanakan wawancara, observasi, dan pengumpulan data dalam
  rangka penyusunan skripsi yang berjudul <strong><em>"${judulPenelitian}"</em></strong>.
</p>

<p class="body-text" style="text-indent: 1cm;">
  Sehubungan dengan hal tersebut, kami mohon kiranya Bapak/Ibu dapat
  memberikan izin kepada mahasiswa yang bersangkutan untuk melaksanakan
  penelitian pada instansi yang Bapak/Ibu pimpin.
</p>

<p class="body-text" style="text-indent: 1cm;">
  Demikian surat pengantar ini kami sampaikan, atas perhatian dan
  kerjasamanya kami ucapkan terima kasih.
</p>

<p class="body-text" style="text-indent: 1cm;">
  <em>Wassalamu'alaikum Wr. Wb.</em>
</p>

<div class="signature-section">
  <p class="signature-text" style="padding-left: 25px;">Serang, ${tanggalSurat}</p>
  <p class="signature-text">a.n. Dekan</p>
  <p class="signature-text" style="padding-left: 25px;">Wakil Dekan Bidang Akademik</p>
  <div class="signature-space">${ttdHtml}</div>
  <p class="signature-text" style="font-weight: bold; text-decoration: underline; padding-left: 25px;">${wd1Nama}</p>
  <p class="signature-text" style="padding-left: 25px;">NIP. ${wd1Nip}</p>
</div>
<div class="clear"></div>
${renderFooter(qrHtml)}
</div>
</body>
</html>`;
}
