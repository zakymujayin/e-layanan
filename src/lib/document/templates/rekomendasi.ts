import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderSuratRekomendasi(ctx: DocumentContext): string {
  const isPreview = ctx.mode === "preview";

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SURAT")
    : (ctx.nomor_surat ?? "");

  const tanggalSurat = isPreview
    ? reserved(ctx.tanggal_surat, "TANGGAL SURAT")
    : (ctx.tanggal_surat ?? "");

  const dekanNama = placeholder(ctx.dekan?.nama ?? null, "NAMA DEKAN");
  const dekanNip = placeholder(ctx.dekan?.nip ?? null, "NIP DEKAN");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, `TTD ${ctx.dekan?.nama ?? "DEKAN"}`)
    : (ctx.ttd ?? "");

  const qrHtml = isPreview
    ? placeholder(ctx.qrcode, "QR")
    : (ctx.qrcode ?? "");

  const tujuan = placeholder(ctx.tujuan_rekomendasi, "TUJUAN REKOMENDASI");
  const pihak = placeholder(ctx.pihak_penerima, "PIHAK PENERIMA");
  const tipe = placeholder(ctx.tipe_rekomendasi, "TIPE REKOMENDASI");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Rekomendasi</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .title { text-align: center; font-size: 13pt; font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
  .nomor { text-align: center; font-size: 11pt; margin-bottom: 25px; }
  .body-paragraph { text-align: justify; margin-bottom: 15px; line-height: 1.5; text-indent: 30px; }
</style>
</head>
<body>
<div class="page">
${renderKopSurat(ctx.logo_src)}

<p class="title">SURAT REKOMENDASI</p>
<p class="nomor">Nomor: ${nomorSurat}</p>

<p class="body-paragraph" style="text-indent: 0;">
  Yang bertanda tangan di bawah ini, Dekan Fakultas Ushuluddin dan Adab
  UIN Sultan Maulana Hasanuddin Banten, dengan ini memberikan rekomendasi kepada:
</p>

<table class="form-table" style="width: 100%; border-collapse: collapse; margin-left: 40px; margin-bottom: 15px;">
  <tr>
    <td style="padding: 3px 0; vertical-align: top; width: 150px;">Nama</td>
    <td style="padding: 3px 0; vertical-align: top; width: 15px; text-align: center;">:</td>
    <td style="padding: 3px 0; vertical-align: top;"><strong>${ctx.nama_mahasiswa}</strong></td>
  </tr>
  <tr>
    <td style="padding: 3px 0; vertical-align: top;">NIM</td>
    <td style="padding: 3px 0; vertical-align: top; text-align: center;">:</td>
    <td style="padding: 3px 0; vertical-align: top;">${ctx.nim}</td>
  </tr>
  <tr>
    <td style="padding: 3px 0; vertical-align: top;">Prodi</td>
    <td style="padding: 3px 0; vertical-align: top; text-align: center;">:</td>
    <td style="padding: 3px 0; vertical-align: top;">${ctx.nama_prodi}</td>
  </tr>
  <tr>
    <td style="padding: 3px 0; vertical-align: top;">Jenis Rekomendasi</td>
    <td style="padding: 3px 0; vertical-align: top; text-align: center;">:</td>
    <td style="padding: 3px 0; vertical-align: top;"><strong>${tipe}</strong></td>
  </tr>
</table>

<p class="body-paragraph">
  Untuk keperluan <strong>${tujuan}</strong> yang ditujukan kepada
  <strong>${pihak}</strong>.
</p>

<p class="body-paragraph">
  Mahasiswa tersebut adalah mahasiswa Fakultas Ushuluddin dan Adab
  UIN Sultan Maulana Hasanuddin Banten yang tercatat aktif dan memiliki
  integritas serta kemampuan akademik yang baik, sehingga layak untuk diberikan
  rekomendasi.
</p>

<p class="body-paragraph">
  Demikian surat rekomendasi ini dibuat dengan sebenarnya untuk dapat
  dipergunakan sebagaimana mestinya.
</p>

<div class="signature-section">
  <p class="signature-text" style="padding-left: 25px;">Serang, ${tanggalSurat}</p>
  <p class="signature-text" style="padding-left: 25px;">Dekan</p>
  <div class="signature-space">${ttdHtml}</div>
  <p class="signature-text" style="font-weight: bold; text-decoration: underline; padding-left: 25px;">${dekanNama}</p>
  <p class="signature-text" style="padding-left: 25px;">NIP. ${dekanNip}</p>
</div>
<div class="clear"></div>
${renderFooter(qrHtml)}
</div>
</body>
</html>`;
}
