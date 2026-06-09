import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderSuratAktifKuliah(ctx: DocumentContext): string {
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

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Keterangan Aktif Kuliah</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .title-section { text-align: center; margin-bottom: 20px; line-height: 1.2; }
  .title { font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 0; }
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
  <p class="title">SURAT KETERANGAN MASIH KULIAH</p>
  <p class="nomor">NOMOR: ${nomorSurat}</p>
</div>

<p class="main-paragraph" style="margin-bottom: 5px;">Yang bertanda tangan di bawah ini,</p>

<table class="form-table">
  <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>${wd1Nama}</td></tr>
  <tr><td>NIP</td><td>:</td><td>${wd1Nip}</td></tr>
  <tr><td>Pangkat/golongan</td><td>:</td><td>${ctx.wakil_dekan_1?.pangkat_golongan ?? "Pembina Utama Muda / IVc"}</td></tr>
  <tr><td>Jabatan</td><td>:</td><td>Wakil Dekan I</td></tr>
</table>

<p class="main-paragraph" style="margin-bottom: 5px; margin-top: 5px;">Dengan ini menerangkan dengan sesungguhnya bahwa nama dibawah :</p>

<table class="form-table">
  <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td>Tempat/Tgl. Lahir</td><td>:</td><td>${placeholder(ctx.tempat_lahir_mahasiswa, "TEMPAT LAHIR")}, ${placeholder(ctx.tanggal_lahir_mahasiswa, "TGL LAHIR")}</td></tr>
  <tr><td>NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td>Fakultas</td><td>:</td><td>Ushuluddin dan Adab</td></tr>
  <tr><td>Prodi/Semester</td><td>:</td><td>${ctx.nama_prodi} / ${ctx.semester_teks}</td></tr>
</table>

<p class="main-paragraph">
  Adalah Mahasiswa Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten yang masih <strong>aktif kuliah</strong> pada <strong>semester ${ctx.semester_teks} tahun akademik ${ctx.tahun_akademik}.</strong>
</p>

<p class="main-paragraph">
  Surat keterangan ini dibuat untuk Persyaratan ${placeholder(ctx.peruntukan, "PERUNTUKAN")}.
</p>

<p class="main-paragraph">
  Demikianlah surat keterangan ini dibuat dengan sebenarnya, untuk dipergunakan dengan sebaiknya.
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
