import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { PAGE_CSS, HEADER_CSS } from "../partials/styles";
import { placeholder } from "../partials/placeholder";

export function renderBypassJudul(ctx: DocumentContext): string {
  const logoHtml = renderKopSurat(ctx.logo_src);
  const judulRows = ctx.judul_list
    .map((j, i) => {
      const nomor = i + 1;
      return `
        <tr>
          <td style="width:40px;text-align:center;vertical-align:top;">${nomor}.</td>
          <td style="vertical-align:top;">${j}</td>
          <td style="width:100px;text-align:center;vertical-align:top;">
            <input type="checkbox" style="width:14px;height:14px;">
          </td>
        </tr>`;
    })
    .join("");

  const dosenPa = placeholder(ctx.pembimbing_1, "NAMA DOSEN PA");
  const nipPa = placeholder(null, "NIP DOSEN PA");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Formulir Bypass Seleksi Judul</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; }
  ${PAGE_CSS}${HEADER_CSS}
  .judul-surat { text-align:center; font-size:12pt; font-weight:bold; margin:10px 0; }
  .judul-surat.underline { text-decoration:underline; }
  .paragraf { text-align:justify; margin:15px 0; font-size:12pt; line-height:1.5; text-indent:1cm; }
  .tabel-judul { width:100%; border-collapse:collapse; margin:15px 0; }
  .tabel-judul td { padding:6px; border:none; font-size:12pt; }
  .tabel-judul tr.border-bottom td { border-bottom:1px solid #000; }
  .signature-table { width:100%; margin-top:30px; }
  .signature-table td { width:50%; vertical-align:top; text-align:center; padding:20px 30px; }
  .signature-name { font-weight:bold; text-decoration:underline; }
  .footer-notice { text-align:center; font-size:8pt; color:#666; margin-top:20px; border-top:1px solid #ccc; padding-top:10px; }
</style>
</head>
<body>
<div class="page">
${logoHtml}
<div class="judul-surat underline">FORMULIR KELENGKAPAN PENGAJUAN JUDUL SKRIPSI</div>
<p class="paragraf">
  Yang bertanda tangan di bawah ini, Dosen Pembimbing Akademik (PA) dari mahasiswa Program
  Studi <strong>${ctx.nama_prodi}</strong> Fakultas Ushuluddin dan Adab UIN Sultan
  Maulana Hasanuddin Banten, menerangkan bahwa mahasiswa:
</p>
<p class="paragraf">
  Nama &nbsp;&nbsp;: ${ctx.nama_mahasiswa}<br>
  NIM &nbsp;&nbsp;&nbsp;: ${ctx.nim}<br>
  Prodi &nbsp;&nbsp;: ${ctx.nama_prodi}<br>
  Sem. &nbsp;&nbsp;: ${ctx.semester_teks}
</p>
<p class="paragraf">
  Telah mengajukan judul skripsi untuk mendapatkan persetujuan sebagai berikut:
</p>
<table class="tabel-judul">
  <tr><td style="width:40px;text-align:center;">No</td><td>Judul Skripsi</td><td style="width:100px;text-align:center;">Setujui</td></tr>
  <tr class="border-bottom"><td colspan="3"></td></tr>
  ${judulRows}
</table>
<table class="signature-table">
<tr>
  <td>
    <p style="margin:0;">Mengetahui,</p>
    <p style="margin:5px 0;">Dosen Pembimbing Akademik</p>
    <div style="height:70px;"></div>
    <p class="signature-name">${dosenPa}</p>
    <p>NIP. ${nipPa}</p>
  </td>
  <td>
    <p style="margin:0;">Serang, ${placeholder(ctx.tanggal_surat, "TANGGAL")}</p>
    <p style="margin:5px 0;">Mahasiswa yang Mengajukan</p>
    <div style="height:70px;"></div>
    <p class="signature-name">${ctx.nama_mahasiswa}</p>
    <p>NIM. ${ctx.nim}</p>
  </td>
</tr>
</table>
<div class="footer-notice">
  BYPASS SYSTEM — Formulir ini diisi dan ditandatangani secara manual oleh Dosen PA
  setelah melewati batas waktu SLA (7 hari kerja). Scan formulir yang sudah ditandatangani
  dan upload melalui sistem.
</div>
</div>
</body>
</html>`;
}
