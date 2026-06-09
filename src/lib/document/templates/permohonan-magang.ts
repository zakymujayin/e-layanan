import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderPermohonanMagang(ctx: DocumentContext): string {
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

  const pejabatTujuan = placeholder(ctx.pejabat_tujuan, "PEJABAT TUJUAN");
  const instansiTujuan = placeholder(ctx.instansi_tujuan, "INSTANSI TUJUAN");
  const alamatInstansi = placeholder(ctx.alamat_instansi, "ALAMAT INSTANSI");
  const bidangMagang = placeholder(ctx.bidang_magang, "BIDANG MAGANG");
  const tanggalMulai = placeholder(ctx.tanggal_mulai, "TANGGAL MULAI");
  const tanggalSelesai = placeholder(ctx.tanggal_selesai, "TANGGAL SELESAI");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Permohonan Magang</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .info-surat { text-align: left; margin: 10px 0 15px 0; font-size: 11pt; }
  .info-surat table { border-collapse: collapse; }
  .info-surat td { padding: 2px 4px; vertical-align: top; font-size: 11pt; }
  .info-surat td:first-child { width: 70px; }
  .kepada { text-align: left; margin: 15px 0; font-size: 11pt; line-height: 1.4; }
  .body-text { text-align: justify; margin: 15px 0; line-height: 1.5; }
  .alamat-section { text-align: left; margin: 10px 0 15px 40px; font-size: 11pt; line-height: 1.4; }
</style>
</head>
<body>
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="info-surat">
<table>
  <tr><td>Nomor</td><td>: ${nomorSurat}</td></tr>
  <tr><td>Lampiran</td><td>: -</td></tr>
  <tr><td>Hal</td><td>: <strong>Permohonan Magang</strong></td></tr>
</table>
</div>

<div class="kepada">
  Kepada Yth.<br>
  ${pejabatTujuan}<br>
  ${instansiTujuan}<br>
  ${alamatInstansi}
</div>

<p class="body-text" style="text-indent: 1cm;">
  <em>Assalamu'alaikum Wr. Wb.</em>
</p>

<p class="body-text" style="text-indent: 1cm;">
  Sehubungan dengan program magang di bidang <strong>${bidangMagang}</strong>,
  bersama ini kami mengajukan permohonan izin magang bagi mahasiswa
  Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten
  dengan data sebagai berikut:
</p>

<div class="alamat-section">
  <table>
    <tr><td>Nama</td><td>: ${ctx.nama_mahasiswa}</td></tr>
    <tr><td>NIM</td><td>: ${ctx.nim}</td></tr>
    <tr><td>Program Studi</td><td>: ${ctx.nama_prodi}</td></tr>
    <tr><td>Semester</td><td>: ${ctx.semester_teks}</td></tr>
    <tr><td>Periode Magang</td><td>: ${tanggalMulai} s.d. ${tanggalSelesai}</td></tr>
  </table>
</div>

<p class="body-text" style="text-indent: 1cm;">
  Program magang ini merupakan bagian dari kurikulum akademik yang
  bertujuan untuk memberikan pengalaman praktis kepada mahasiswa
  dalam menerapkan ilmu yang telah diperoleh di perkuliahan.
</p>

<p class="body-text" style="text-indent: 1cm;">
  Besar harapan kami agar Bapak/Ibu dapat memberikan kesempatan
  kepada mahasiswa kami untuk melaksanakan magang di instansi yang
  Bapak/Ibu pimpin.
</p>

<p class="body-text" style="text-indent: 1cm;">
  Demikian surat permohonan ini kami sampaikan, atas perhatian
  dan kerjasamanya kami ucapkan terima kasih.
</p>

<p class="body-text" style="text-indent: 1cm;">
  <em>Wassalamu'alaikum Wr. Wb.</em>
</p>

<div class="signature-section">
  <p class="signature-text" style="padding-left: 25px;">Serang, ${tanggalSurat}</p>
  <p class="signature-text">Dekan,</p>
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
