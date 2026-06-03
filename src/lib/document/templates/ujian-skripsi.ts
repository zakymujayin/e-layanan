import type { DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderUjianSkripsi(ctx: DocumentContext): string {
  const isPreview = ctx.mode === "preview";

  const nomorSurat = isPreview
    ? reserved(ctx.nomor_surat, "NOMOR SURAT")
    : (ctx.nomor_surat ?? "");

  const qrHtml = isPreview ? placeholder(ctx.qrcode, "QR") : (ctx.qrcode ?? "");

  const dekanNama = placeholder(ctx.dekan?.nama ?? null, "NAMA DEKAN");
  const dekanNip = placeholder(ctx.dekan?.nip ?? null, "NIP DEKAN");

  const ttdHtml = isPreview
    ? placeholder(ctx.ttd, `TTD ${ctx.dekan?.nama ?? "DEKAN"}`)
    : (ctx.ttd ?? "");

  const namaMhs = placeholder(ctx.nama_mahasiswa, "NAMA MAHASISWA");
  const nim = placeholder(ctx.nim, "NIM");
  const kodeProdi = placeholder(ctx.kode_prodi, "KODE PRODI");
  const judul = placeholder(ctx.judul_disetujui, "JUDUL DISETUJUI");
  const hari = placeholder(ctx.hari_sidang, "HARI");
  const tanggal = placeholder(ctx.tanggal_sidang, "TANGGAL");
  const ruang = placeholder(ctx.ruang_sidang, "RUANG");
  const waktu = placeholder(ctx.waktu_sidang, "WAKTU");
  const ketua = placeholder(ctx.ketua_sidang, "KETUA SIDANG");
  const sekretaris = placeholder(ctx.sekretaris_sidang, "SEKRETARIS SIDANG");
  const pembimbing1 = placeholder(ctx.pembimbing_1, "PEMBIMBING 1");
  const pembimbing2 = placeholder(ctx.pembimbing_2, "PEMBIMBING 2");
  const penguji1 = placeholder(ctx.penguji_1, "PENGUJI 1");
  const penguji2 = placeholder(ctx.penguji_2, "PENGUJI 2");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Tugas Ujian Skripsi</title>
<style>
  ${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}
  .page-first .page { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; }

  .center { text-align: center; }
  .justify { text-align: justify; }
  .bold { font-weight: bold; }
  .underline { text-decoration: underline; }

  .tabel-tugas {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .tabel-tugas th,
  .tabel-tugas td {
    border: 1px solid #000;
    padding: 5px;
    vertical-align: top;
    font-size: 10pt;
    text-align: center;
  }

  .tabel-tugas th {
    background: #f0f0f0;
    font-weight: bold;
  }

  .tabel-tugas td {
    text-align: left;
  }

  .tabel-tugas td:first-child,
  .tabel-tugas td:last-child {
    text-align: center;
  }
</style>
</head>
<body>
<div class="page-first">
<div class="page">
${renderKopSurat(ctx.logo_src)}

<div class="center" style="margin-bottom: 12px;">
  <div style="font-size: 14pt; font-weight: bold; letter-spacing: 2px;">
    <span class="underline">SURAT TUGAS</span>
  </div>
  <div style="margin-top: 4px;">Nomor: ${nomorSurat}</div>
</div>

<p class="justify" style="margin-bottom: 10px; text-indent: 40px;">
  Dekan Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten menugaskan
  dosen-dosen sebagaimana tersebut pada daftar Majelis Penguji untuk menjadi penguji
  pada Ujian Skripsi (Munaqasyah) pada:
</p>

<div style="margin-left: 60px; margin-bottom: 10px; line-height: 1.6;">
  Hari&#xa0;&#xa0;&#xa0;&#xa0; : <b>${hari}</b><br>
  Tanggal : <b>${tanggal}</b><br>
  Ruang&#xa0;&#xa0; : <b>${ruang}</b>
</div>

<p class="justify" style="margin-bottom: 10px; text-indent: 40px;">
  Untuk menguji
</p>

<table class="tabel-tugas">
  <thead>
    <tr>
      <th style="width: 5%;">NO</th>
      <th style="width: 30%;">NAMA/NIM/JUR/JUDUL SKRIPSI</th>
      <th style="width: 40%;">MAJELIS PENGUJI</th>
      <th style="width: 25%;">WAKTU</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1.</td>
      <td>
        <b>${namaMhs}<br>${nim} / ${kodeProdi}</b><br><br>
        ${judul}
      </td>
      <td>
        Ketua Penguji&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${ketua}<br>
        Sekretaris Penguji&#xa0;&#xa0;&#xa0;&#xa0; : ${sekretaris}<br>
        Pembimbing I&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${pembimbing1}<br>
        Pembimbing II&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${pembimbing2}<br>
        Penguji I&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${penguji1}<br>
        Penguji II&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0;&#xa0; : ${penguji2}
      </td>
      <td>${waktu}</td>
    </tr>
  </tbody>
</table>

<div style="display: flex; justify-content: flex-end; margin-top: 10px;">
  <div style="text-align: left; width: 280px; line-height: 1.5;">
    Serang, ${isPreview ? reserved(ctx.tanggal_surat, "TANGGAL") : (ctx.tanggal_surat ?? "")}<br>
    Dekan,<br>
    Fakultas Ushuluddin dan Adab
    <div style="min-height: 70px; margin-top: 10px;">${ttdHtml}</div>
    <div class="bold" style="text-decoration: underline;">${dekanNama}</div>
    NIP. ${dekanNip}
  </div>
</div>

<div class="clear" style="margin-bottom: 20px;"></div>

<div style="margin-top: 20px;">
  <b><i>Tembusan:</i></b><br>
  <ol style="margin: 4px 0;">
    <li>Dekan FUDA (sebagai laporan)</li>
    <li>Wakil Dekan I, II, III</li>
    <li>Ketua Jurusan ${kodeProdi}</li>
    <li>Mahasiswa yang bersangkutan</li>
  </ol>
</div>

<div style="margin-top: 5px;">
  Catatan:<br>
  <ol style="margin: 4px 0;">
    <li>Mahasiswa diwajibkan berpakaian:</li>
    <ol type="a">
      <li>Kemeja putih, berdasi, berjas almamater (laki-laki)</li>
      <li>Muslimah dan blazer hitam (perempuan)</li>
    </ol>
    <li>Penguji yang tidak hadir akan diganti oleh penguji lain</li>
    <li>Mahasiswa wajib hadir 30 menit sebelum pelaksanaan sidang</li>
    <li>Mahasiswa wajib mengikuti penutupan sidang</li>
  </ol>
</div>

${renderFooter(qrHtml)}
</div>
</div>
</body>
</html>`;
}
