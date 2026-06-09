import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderPengantarObservasi(ctx: DocumentContext): string {
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
    ? placeholder(ctx.ttd, `TTD ${ctx.wakil_dekan_1?.nama ?? "WAKIL DEKAN"}`)
    : (ctx.ttd ?? "");

  const qrHtml = isPreview
    ? placeholder(ctx.qrcode, "QR")
    : (ctx.qrcode ?? "");

  const mk = placeholder(ctx.mata_kuliah, "MATA KULIAH");
  const lokasi = placeholder(ctx.lokasi_observasi, "LOKASI OBSERVASI");
  const dosen = placeholder(ctx.dosen_pembimbing, "DOSEN PEMBIMBING");
  const pejabat = placeholder(ctx.pejabat_tujuan, "PEJABAT TUJUAN");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Pengantar Observasi</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
  .info-table td { border: none; padding: 2px 0; vertical-align: top; }
  .info-label { width: 80px; }
  .info-sep { width: 10px; text-align: center; }
  .kepada-section { margin-left: 80px; margin-bottom: 25px; line-height: 1.3; }
  .body-paragraph { text-align: justify; margin-bottom: 15px; line-height: 1.5; text-indent: 30px; }
  .student-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-left: 60px; }
  .student-table th,
  .student-table td { border: 1px solid #000; padding: 5px 8px; font-size: 11pt; text-align: left; }
  .student-table th { text-align: center; background: #f5f5f5; }
  .student-table td.center { text-align: center; }
  .alamat-section { text-align: right; margin-bottom: 20px; margin-left: 50%; line-height: 1.3; }
  .tembusan-section { margin-top: 20px; margin-left: 30px; font-size: 10pt; }
</style>
</head>
<body>
<div class="page">
${renderKopSurat(ctx.logo_src)}

<table class="info-table">
  <tr>
    <td class="info-label">Nomor</td>
    <td class="info-sep">:</td>
    <td>${nomorSurat}</td>
  </tr>
  <tr>
    <td class="info-label">Lampiran</td>
    <td class="info-sep">:</td>
    <td>-</td>
  </tr>
  <tr>
    <td class="info-label">Hal</td>
    <td class="info-sep">:</td>
    <td><strong>Surat Pengantar Observasi</strong></td>
  </tr>
</table>

<div class="kepada-section">
  <p style="margin:0;">Kepada Yth.</p>
  <p style="margin:0;font-weight:bold;">${pejabat}</p>
  <p style="margin:0;">${placeholder(ctx.instansi_tujuan, "INSTANSI TUJUAN")}</p>
  <p style="margin:0;">di</p>
  <p style="margin:0;">Tempat</p>
</div>

<p class="body-paragraph" style="text-indent:0;">
  <em>Assalamu&rsquo;alaikum Warahmatullahi Wabarakatuh</em>
</p>

<p class="body-paragraph">
  Dengan hormat, sehubungan dengan pelaksanaan kegiatan akademik pada mata kuliah
  <strong>${mk}</strong> Program Studi <strong>${ctx.nama_prodi}</strong> Fakultas
  Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten, dengan ini kami
  mengajukan permohonan izin untuk melakukan observasi di tempat/instansi yang
  Bapak/Ibu pimpin.
</p>

<p class="body-paragraph">
  Adapun mahasiswa yang akan melakukan observasi adalah sebagai berikut:
</p>

<table class="student-table">
  <thead>
    <tr>
      <th>No</th>
      <th>Nama</th>
      <th>NIM</th>
      <th>Prodi</th>
      <th>Semester</th>
      <th>Dosen Pembimbing</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="center">1.</td>
      <td>${ctx.nama_mahasiswa}</td>
      <td>${ctx.nim}</td>
      <td>${ctx.nama_prodi}</td>
      <td class="center">${ctx.semester_teks}</td>
      <td>${dosen}</td>
    </tr>
  </tbody>
</table>

<p class="body-paragraph">
  Kegiatan observasi akan dilaksanakan di <strong>${lokasi}</strong>.
  Besar harapan kami agar Bapak/Ibu dapat memberikan izin dan bantuan seperlunya.
</p>

<p class="body-paragraph">
  Demikian surat pengantar ini kami sampaikan. Atas perhatian dan kerjasamanya
  kami ucapkan terima kasih.
</p>

<p class="body-paragraph">
  <em>Wassalamu&rsquo;alaikum Warahmatullahi Wabarakatuh</em>
</p>

<div class="signature-section">
  <p class="signature-text" style="padding-left: 25px;">Serang, ${tanggalSurat}</p>
  <p class="signature-text">a.n. Dekan</p>
  <p class="signature-text" style="padding-left: 25px;">Wakil Dekan Bidang Akademik dan</p>
  <p class="signature-text" style="padding-left: 25px;">Kelembagaan</p>
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
