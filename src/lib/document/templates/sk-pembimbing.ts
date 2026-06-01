import type { DocumentContext } from "../context-builder";
import { HEADER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { renderFooter } from "../partials/footer";
import { placeholder, reserved } from "../partials/placeholder";
import { getBookmanFontFace } from "../fonts";

export function renderSkPembimbing(ctx: DocumentContext): string {
  const isPreview = ctx.mode === "preview";

  const fontFace = getBookmanFontFace();

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SK")
    : (ctx.nomor_surat ?? "");

  const tanggalSk = isPreview
    ? reserved(ctx.tanggal_surat, "TANGGAL SK")
    : (ctx.tanggal_surat ?? "");

  const pembimbing1 = placeholder(ctx.pembimbing_1, "PEMBIMBING 1");
  const pembimbing2 = placeholder(ctx.pembimbing_2, "PEMBIMBING 2");
  const dekanNama = placeholder(ctx.dekan?.nama ?? null, "NAMA DEKAN");
  const dekanNip = placeholder(ctx.dekan?.nip ?? null, "NIP DEKAN");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, `TTD ${ctx.dekan?.nama ?? "DEKAN"}`)
    : (ctx.ttd ?? "");

  const qrHtml = isPreview
    ? placeholder(ctx.qrcode, "QR")
    : (ctx.qrcode ?? "");

  const nomorSrtJurusan = ctx.nomor_srt_jurusan ?? "";
  const tglSrtJurusan = ctx.tgl_srt_jurusan ?? "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>SK Pembimbing Skripsi</title>
<style>
${fontFace}
@page { size: A4; margin: 5mm 15mm 15mm 20mm; }
body {
  font-family: 'Bookman Old Style', 'Bookman', 'URW Bookman L', 'Georgia', serif;
  font-size: 10pt; line-height: 1.2; color: #000; margin: 0; padding: 0;
}
@media screen {
  body { background-color: #525252; padding: 20px; }
  .page { background:white; width:210mm; min-height:297mm; margin:0 auto; padding:15mm 15mm 15mm 20mm; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
}
@media print {
  body { background:none; padding:0; }
  .page { background:white; width:210mm; height:297mm; margin:0; padding:0; box-shadow:none; }
}
.header-logo-center { text-align:center; margin-bottom:10px; }
.header-logo-center img { width:80px; height:auto; }
.header-table { width:100%; border-collapse:collapse; margin-bottom:0; position:relative; border-bottom:3px solid #000; }
.header-table.double-line::after { content:""; position:absolute; left:0; right:0; bottom:-4px; border-bottom:1px solid #000; }
.header-table td { border:none; padding:0; vertical-align:middle; }
.header-logo { width:100%; text-align:center; }
.header-logo img { width:100px; height:auto; max-width:100%; display:block; margin:0 auto; }
.header-text { text-align:center; }
.kop-1 { font-size:13pt; font-weight:bold; margin:0; }
.kop-2 { font-size:12pt; font-weight:bold; margin:0; }
.kop-3 { font-size:14pt; font-weight:bold; margin:0; }
.kop-4 { font-size:9pt; margin:0; margin-bottom:5px; }
.letterhead-text { text-align:center; font-size:10pt; margin:5px 0; }
.letterhead-text strong { font-size:11pt; }
.title-section { text-align:center; margin:20px 0; }
.title-section h3 { margin:0; font-size:11pt; }
.title-section h4 { margin:5px 0; font-size:10pt; }
.content-section { margin:15px 0; text-align:justify; }
.content-section p { margin:8px 0; text-indent:1cm; }
.content-table { width:100%; border-collapse:collapse; margin:15px 0; }
.content-table td { padding:4px 8px; vertical-align:top; font-size:10pt; }
.content-table td:first-child { width:50px; text-align:center; }
${SIGNATURE_CSS}
.footer { position:absolute; bottom:0; left:0; right:0; padding:10px 20mm; border-top:1px solid #ddd; background:white; }
table.footer-table { width:100%; border-collapse:collapse; background:white; }
table.footer-table td { border:none; padding:5px; vertical-align:middle; font-size:9pt; color:#555; background:white; }
.qrcode-cell { width:15mm; text-align:center; }
.qrcode-cell img { width:15mm; height:15mm; display:block; }
.footer-text { text-align:left; line-height:1.3; }
</style>
</head>
<body>
<div class="page">
  <table class="header-table double-line">
    <tr>
      <td style="text-align:center;padding:0;">
        <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
        <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
        <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
        <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
        <p class="kop-4">
          Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten 42171<br>
          Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
          Website: www.fuda.uinbanten.ac.id
        </p>
      </td>
    </tr>
  </table>

  <div class="title-section">
    <h3>SURAT KEPUTUSAN DEKAN</h3>
    <h3>FAKULTAS USHULUDDIN DAN ADAB</h3>
    <h4>Nomor: ${nomorSurat}</h4>
    <h4 style="font-weight:normal;">Tentang</h4>
    <h4>PENETAPAN DOSEN PEMBIMBING SKRIPSI</h4>
  </div>

  <div style="text-align:center;margin:10px 0;">
    <strong>DEKAN FAKULTAS USHULUDDIN DAN ADAB</strong><br>
    <strong>UIN SULTAN MAULANA HASANUDDIN BANTEN</strong>
  </div>

  <div class="content-section">
    <p>Menimbang: a. Bahwa untuk kelancaran penulisan skripsi mahasiswa perlu ditetapkan Dosen Pembimbing Skripsi;</p>
    <p style="text-indent:1.5cm;">b. Bahwa nama-nama yang tercantum dalam Surat Keputusan ini dipandang cakap dan memenuhi syarat;</p>
  </div>

  <div class="content-section">
    <p>Mengingat: 1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;</p>
    <p style="text-indent:1.5cm;">2. Peraturan terkait lainnya;</p>
  </div>

  <div class="content-section">
    <p style="font-weight:bold;text-align:center;">MEMUTUSKAN</p>
    <p>Menetapkan:</p>
    <table class="content-table">
      <tr>
        <td>Pertama</td>
        <td>:</td>
        <td>Menunjuk saudara:</td>
      </tr>
      <tr>
        <td></td><td></td>
        <td>1. <strong>${pembimbing1}</strong> sebagai Pembimbing I</td>
      </tr>
      <tr>
        <td></td><td></td>
        <td>2. <strong>${pembimbing2}</strong> sebagai Pembimbing II</td>
      </tr>
      <tr>
        <td></td><td></td>
        <td>Untuk membimbing skripsi mahasiswa:</td>
      </tr>
      <tr>
        <td></td><td></td>
        <td>Nama: <strong>${ctx.nama_mahasiswa}</strong></td>
      </tr>
      <tr>
        <td></td><td></td>
        <td>NIM: ${ctx.nim}</td>
      </tr>
      <tr>
        <td></td><td></td>
        <td>Prodi: ${ctx.nama_prodi}</td>
      </tr>
      <tr>
        <td></td><td></td>
        <td>Judul: <em>${placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI")}</em></td>
      </tr>
      <tr>
        <td>Kedua</td><td>:</td>
        <td>Keputusan ini berlaku sejak tanggal ditetapkan.</td>
      </tr>
    </table>
  </div>

  <div class="content-section">
    <p style="text-align:center;">Ditetapkan di Serang</p>
    <p style="text-align:center;">Pada Tanggal ${tanggalSk}</p>
  </div>

  <div class="signature-section" style="text-align:center;">
    <p class="signature-text">Dekan,</p>
    <div class="signature-space">${ttdHtml}</div>
    <p class="signature-text" style="font-weight:bold;text-decoration:underline;">${dekanNama}</p>
    <p class="signature-text">NIP. ${dekanNip}</p>
  </div>
  <div class="clear"></div>

  <div class="content-section" style="margin-top:10px;">
    <p>Tembusan:</p>
    <p>1. Rektor UIN SMH Banten (sebagai laporan)</p>
    <p>2. Wakil Dekan I FUDA</p>
    <p>3. Kaprodi ${ctx.nama_prodi}</p>
    <p>4. Yang bersangkutan</p>
  </div>
${renderFooter(qrHtml)}
</div>
</body>
</html>`;
}
