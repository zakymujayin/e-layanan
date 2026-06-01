import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderPersetujuanJudul(ctx: DocumentContext): string {
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

  const qrHtml = isPreview
    ? placeholder(ctx.qrcode, "QR")
    : (ctx.qrcode ?? "");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Persetujuan Judul Skripsi</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .judul-surat {
    text-align:center; font-size:12pt; font-weight:bold;
    text-decoration:underline; margin:10px 0 1px 0;
  }
  .nomor-surat { text-align:center; margin-bottom:30px; }
  .tabel-biodata { width:100%; border-collapse:collapse; margin-bottom:30px; }
  .tabel-biodata td { vertical-align:top; padding:4px 8px; font-size:12pt; }
  .tabel-biodata td:nth-child(1) { width:180px; }
  .tabel-biodata td:nth-child(2) { width:5px; text-align:center; padding:4px 2px; }
  .tabel-biodata td:nth-child(3) { width:auto; }
  .paragraf-isi {
    text-align:justify; margin-bottom:30px; font-size:12pt;
    line-height:1.5; text-indent:1cm;
  }
  .judul-skripsi {
    margin:40px 0 60px 0; text-align:center; font-weight:bold;
    font-size:12pt; font-style:italic;
  }
</style>
</head>
<body>
<div class="page">
${renderKopSurat(ctx.logo_src)}
<div class="judul-surat">SURAT PERSETUJUAN JUDUL SKRIPSI</div>
<div class="nomor-surat">Nomor: ${nomorSurat}</div>

<table class="tabel-biodata">
  <tr><td colspan="3">Mahasiswa tersebut di bawah ini</td></tr>
  <tr>
    <td style="padding-left:40px;">Nama Mahasiswa</td>
    <td>:</td><td>${ctx.nama_mahasiswa}</td>
  </tr>
  <tr>
    <td style="padding-left:40px;">NIM</td>
    <td>:</td><td>${ctx.nim}</td>
  </tr>
  <tr>
    <td style="padding-left:40px;">Program Studi</td>
    <td>:</td><td>${ctx.kode_prodi}</td>
  </tr>
</table>

<div class="paragraf-isi">
  Telah memenuhi persyaratan untuk menyusun Skripsi dalam semester
  ${ctx.semester_teks} tahun akademik ${ctx.tahun_akademik} dengan judul sebagai berikut:
</div>

<div class="judul-skripsi">
  "${placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI")}"
</div>

<div class="paragraf-isi">
  Demikian surat persetujuan judul skripsi ini dibuat untuk dipergunakan sebagaimana mestinya.
</div>

<div class="signature-section">
  <p class="signature-text" style="padding-left:25px;">Serang, ${tanggalSurat}</p>
  <p class="signature-text">a.n. Dekan</p>
  <p class="signature-text" style="padding-left:25px;">Wakil Dekan Bidang Akademik</p>
  <div class="signature-space">${ttdHtml}</div>
  <p class="signature-text" style="font-weight:bold;text-decoration:underline;padding-left:25px;">${wd1Nama}</p>
  <p class="signature-text" style="padding-left:25px;">NIP. ${wd1Nip}</p>
</div>
<div class="clear"></div>
${renderFooter(qrHtml)}
</div>
</body>
</html>`;
}
