import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderSuratPernahKuliah(ctx: DocumentContext): string {
  const isPreview = ctx.mode === "preview";

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SURAT")
    : (ctx.nomor_surat ?? "");

  const tanggalSurat = isPreview
    ? reserved(ctx.tanggal_surat, "TANGGAL")
    : (ctx.tanggal_surat ?? "");

  const dekanNama = placeholder(ctx.dekan?.nama ?? null, "NAMA DEKAN");
  const dekanNip = placeholder(ctx.dekan?.nip ?? null, "NIP DEKAN");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, `TTD ${ctx.dekan?.nama ?? "DEKAN"}`)
    : (ctx.ttd ?? "");

  const qrHtml = isPreview ? placeholder(ctx.qrcode, "QR") : (ctx.qrcode ?? "");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Keterangan Pernah Kuliah</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .title-section { text-align: center; margin-bottom: 20px; line-height: 1.2; }
  .title { font-size: 12pt; font-weight: bold; margin: 0; }
  .nomor { font-size: 11pt; margin: 0; }
  .main-paragraph { text-align: justify; margin-top: 15px; margin-bottom: 15px; line-height: 1.5; }
  .form-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; margin-left: 40px; }
  .form-table td { border: none; padding: 3px 0; vertical-align: top; }
  .form-label { width: 150px; }
  .form-sep { width: 15px; text-align: center; }
</style>
</head>
<body>
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="title-section">
  <p class="title">SURAT KETERANGAN PERNAH KULIAH</p>
  <p class="nomor">NOMOR: ${nomorSurat}</p>
</div>

<p class="main-paragraph" style="margin-bottom: 5px;">Yang bertanda tangan di bawah ini,</p>

<table class="form-table">
  <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>${dekanNama}</td></tr>
  <tr><td>NIP</td><td>:</td><td>${dekanNip}</td></tr>
  <tr><td>Pangkat/golongan</td><td>:</td><td>${ctx.dekan?.pangkat_golongan ?? "Pembina Utama Muda / IVc"}</td></tr>
  <tr><td>Jabatan</td><td>:</td><td>Dekan</td></tr>
</table>

<p class="main-paragraph" style="margin-bottom: 5px; margin-top: 5px;">Dengan ini menerangkan dengan sesungguhnya bahwa :</p>

<table class="form-table">
  <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td>NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td>Program Studi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
  <tr><td>Fakultas</td><td>:</td><td>Fakultas Ushuluddin dan Adab</td></tr>
  <tr><td>Universitas</td><td>:</td><td>UIN Sultan Maulana Hasanuddin Banten</td></tr>
</table>

<p class="main-paragraph">
  adalah benar telah terdaftar sebagai Mahasiswa Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten.
</p>

<p class="main-paragraph">
  Surat keterangan ini dibuat untuk ${placeholder(ctx.peruntukan, "PERUNTUKAN")}.
</p>

<p class="main-paragraph">
  Demikianlah surat keterangan ini dibuat dengan sebenarnya, untuk dipergunakan dengan sebaiknya.
</p>

<div class="signature-section">
  <p class="signature-text" style="padding-left: 25px;">Serang, ${tanggalSurat}</p>
  <p class="signature-text">Dekan,</p>
  <div class="signature-space" style="padding-left: 25px;">${ttdHtml}</div>
  <p class="signature-text" style="font-weight: bold; text-decoration: underline; padding-left: 25px;">${dekanNama}</p>
  <p class="signature-text" style="padding-left: 25px;">NIP. ${dekanNip}</p>
</div>
<div class="clear"></div>
${renderFooter(qrHtml)}
</div>
</body>
</html>`;
}
