import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderCekTurnitin(ctx: DocumentContext): string {
  const isPreview = ctx.mode === "preview";

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SURAT")
    : (ctx.nomor_surat ?? "");

  const tanggalSurat = isPreview
    ? reserved(ctx.tanggal_surat, "TANGGAL")
    : (ctx.tanggal_surat ?? "");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, "TTD KEPALA LAB")
    : (ctx.ttd ?? "");

  const qrHtml = isPreview ? placeholder(ctx.qrcode, "QR") : (ctx.qrcode ?? "");

  const submissionId = isPreview
    ? reserved(ctx.submission_id_turnitin, "SUBMISSION ID")
    : (ctx.submission_id_turnitin ?? "");

  const urlTurnitin = isPreview
    ? reserved(ctx.url_turnitin, "URL TURNITIN")
    : (ctx.url_turnitin ?? "");

  const similarityDisplay = isPreview
    ? reserved(ctx.similarity_percentage, "PERSENTASE")
    : (ctx.similarity_percentage ?? "");

  const similarity = ctx.similarity_percentage != null
    ? parseFloat(ctx.similarity_percentage)
    : null;

  let statusHtml: string;
  if (similarity === null) {
    statusHtml = placeholder(null, "STATUS");
  } else if (similarity <= 25) {
    statusHtml = '<span style="font-weight: bold; color: green;">LOLOS</span>';
  } else {
    statusHtml = "TIDAK LOLOS";
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Keterangan Hasil Uji Plagiarisme</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .title-section { text-align: center; margin-bottom: 20px; line-height: 1.2; }
  .title { font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 0; }
  .nomor { font-size: 11pt; margin: 0; }
  .main-paragraph { text-align: justify; margin-top: 15px; margin-bottom: 15px; line-height: 1.5; }
  .form-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; margin-left: 40px; }
  .form-table td { border: none; padding: 3px 0; vertical-align: top; }
  .form-label { width: 150px; }
  .form-sep { width: 15px; text-align: center; }
  .judul { font-style: italic; font-weight: bold; margin: 10px 0 10px 40px; line-height: 1.5; text-align: justify; }
  .status { margin: 10px 0 10px 40px; line-height: 1.5; }
</style>
</head>
<body>
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="title-section">
  <p class="title">SURAT KETERANGAN HASIL UJI PLAGIARISME</p>
  <p class="nomor">NOMOR: ${nomorSurat}</p>
</div>

<p class="main-paragraph">
  Yang bertanda tangan di bawah ini Kepala Laboratorium Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten, menerangkan dengan sesungguhnya bahwa:
</p>

<table class="form-table">
  <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td>NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td>Program Studi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
  <tr><td>Fakultas</td><td>:</td><td>Ushuluddin dan Adab</td></tr>
</table>

<p class="main-paragraph" style="margin-bottom: 5px;">
  Telah dilakukan pengecekan plagiarisme terhadap karya tulis ilmiah (skripsi) yang berjudul:
</p>

<p class="judul">
  ${placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI")}
</p>

<p class="main-paragraph" style="margin-bottom: 5px;">
  Dengan hasil sebagai berikut:
</p>

<table class="form-table">
  <tr><td class="form-label">Submission ID</td><td class="form-sep">:</td><td>${submissionId}</td></tr>
  <tr><td>URL</td><td>:</td><td style="word-break: break-all;">${urlTurnitin}</td></tr>
  <tr><td>Similarity</td><td>:</td><td>${similarityDisplay}%</td></tr>
  <tr><td>Batas Maksimal</td><td>:</td><td>25%</td></tr>
</table>

<p class="status">
  Status: ${statusHtml}
</p>

<p class="main-paragraph">
  Demikian surat keterangan ini dibuat dengan sebenarnya, untuk dipergunakan sebagaimana mestinya.
</p>

<div class="signature-section">
  <p class="signature-text" style="padding-left: 25px;">Serang, ${tanggalSurat}</p>
  <p class="signature-text">Kepala Laboratorium</p>
  <div class="signature-space">${ttdHtml}</div>
  <p class="signature-text" style="font-weight: bold; padding-left: 25px;">${placeholder(null, "NAMA KEPALA LAB")}</p>
  <p class="signature-text" style="padding-left: 25px;">NIP. .....................</p>
</div>
<div class="clear"></div>
${renderFooter(qrHtml)}
</div>
</body>
</html>`;
}
