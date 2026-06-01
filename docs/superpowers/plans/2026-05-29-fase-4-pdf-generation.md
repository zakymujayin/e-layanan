# Fase 4: PDF Generation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Convert 4 active Blade templates to TypeScript, build PDF pipeline with Puppeteer, numbering, and preview/final modes for TA-01, TA-02, TA-03.

**Architecture:** Context builder fetches all data from DB → template function renders HTML string → Puppeteer browser pool converts to PDF buffer → API route streams to client. Preview mode shows reserved numbers with yellow highlight, final mode shows all data normally.

**Tech Stack:** Puppeteer (headless Chrome), Prisma, date-fns v4, TypeScript template literals.

---

### Task 4.1: Install Puppeteer + Browser Pool Generator

**Files:**
- Create: `src/lib/document/generate-pdf.ts`

- [ ] **Step 1: Install puppeteer**

```bash
npm install puppeteer
```

- [ ] **Step 2: Create browser pool PDF generator**

Write `src/lib/document/generate-pdf.ts`:

```typescript
import puppeteer, { type Browser } from "puppeteer";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

export async function generatePdf(
  html: string,
  _options?: { mode?: "preview" | "final" }
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
```

- [ ] **Step 3: Verify Puppeteer install**

```bash
npx tsx -e "import puppeteer from 'puppeteer'; console.log('Puppeteer OK:', typeof puppeteer.launch)"
```

Expected: `Puppeteer OK: function`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/document/generate-pdf.ts
git commit -m "feat: add Puppeteer browser pool PDF generator"
```

---

### Task 4.2: Shared Partials + Placeholder Helper

**Files:**
- Create: `src/lib/document/partials/kop-surat.ts`
- Create: `src/lib/document/partials/footer.ts`
- Create: `src/lib/document/partials/styles.ts`
- Create: `src/lib/document/partials/placeholder.ts`

- [ ] **Step 1: Create placeholder helper**

Write `src/lib/document/partials/placeholder.ts`:

```typescript
export function placeholder(
  value: string | null | undefined,
  label: string
): string {
  if (value) return value;
  return `<span style="background:#FFD700;padding:0 4px;">[${label}]</span>`;
}

export function reserved(
  value: string | null | undefined,
  label: string
): string {
  if (!value) {
    return `<span style="background:#FFD700;padding:0 4px;">[${label}]</span>`;
  }
  return `<span style="background:#FFD700;padding:0 2px;" title="Nomor sudah di-reserve, menunggu finalisasi">${value}</span>`;
}
```

- [ ] **Step 2: Create kop surat partial**

Write `src/lib/document/partials/kop-surat.ts`:

```typescript
export function renderKopSurat(logoSrc: string): string {
  return `
    <table class="header-table double-line">
      <tr>
        <td class="header-logo">
          <img src="${logoSrc}" alt="Logo UIN" onerror="this.style.display='none'">
        </td>
        <td class="header-text">
          <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
          <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
          <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
          <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
          <p class="kop-4">
            Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten 42171<br>
            Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
            Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u>
          </p>
        </td>
      </tr>
    </table>`;
}
```

- [ ] **Step 3: Create footer partial**

Write `src/lib/document/partials/footer.ts`:

```typescript
export function renderFooter(qrcodeHtml: string): string {
  return `
    <div class="footer">
      <table class="footer-table">
        <tr>
          <td class="qrcode-cell">${qrcodeHtml}</td>
          <td class="footer-text">
            Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Layanan Akademik <br>
            Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten.
          </td>
        </tr>
      </table>
    </div>`;
}
```

- [ ] **Step 4: Create shared CSS**

Write `src/lib/document/partials/styles.ts`:

```typescript
export const PAGE_CSS = `
@page {
  size: A4;
  margin: 0;
}

* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

body {
  font-family: "Times New Roman", Times, serif;
  font-size: 11pt;
  line-height: 1.15;
  color: #000;
  margin: 0;
  padding: 0;
  background-color: #525252;
}

.page {
  width: 210mm;
  height: 297mm;
  background: white;
  padding: 20mm 25mm 25mm 25mm;
  margin: 10mm auto;
  box-sizing: border-box;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
  position: relative;
  page-break-after: always;
  display: block;
}

@media print {
  body { background: none; }
  .page {
    margin: 0;
    box-shadow: none !important;
    padding: 25mm 25mm 25mm 25mm;
    width: 210mm;
    height: 297mm;
  }
}
`;

export const HEADER_CSS = `
.header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  position: relative;
  border-bottom: 3px solid #000;
}

.header-table.double-line::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  border-bottom: 1px solid #000;
}

.header-table td {
  border: none;
  padding: 0;
  vertical-align: middle;
}

.header-logo {
  width: 100px;
  text-align: left;
  vertical-align: middle;
}

.header-logo img {
  width: 100px;
  height: auto;
  max-width: 100%;
  display: block;
}

.header-text {
  text-align: center;
}

.kop-1 {
  font-size: 13pt;
  font-weight: bold;
  margin: 0;
}

.kop-2 {
  font-size: 12pt;
  font-weight: bold;
  margin: 0;
}

.kop-3 {
  font-size: 14pt;
  font-weight: bold;
  margin: 0;
}

.kop-4 {
  font-size: 9pt;
  margin: 0;
  margin-bottom: 5px;
}
`;

export const FOOTER_CSS = `
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 25mm;
  border-top: 1px solid #ddd;
  background: white;
}

table.footer-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

table.footer-table td {
  border: none;
  padding: 5px;
  vertical-align: middle;
  font-size: 9pt;
  color: #555;
  background: white;
}

.qrcode-cell {
  width: 15mm;
  text-align: center;
}

.qrcode-cell img {
  width: 15mm;
  height: 15mm;
  display: block;
}

.footer-text {
  text-align: left;
  line-height: 1.3;
}
`;

export const SIGNATURE_CSS = `
.signature-section {
  float: right;
  width: 50%;
  text-align: left;
  position: relative;
}

.signature-text {
  margin: 0;
  line-height: 1.3;
}

.signature-space {
  min-height: 70px;
  position: relative;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 80%;
  background: white;
  margin-left: 20%;
}

.clear {
  clear: both;
}
`;
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/document/partials/
git commit -m "feat: add shared PDF partials (kop surat, footer, styles, placeholder)"
```

---

### Task 4.3: Font Bookman Old Style Embedding

**Files:**
- Create: `public/fonts/.gitkeep`
- Create: `src/lib/document/fonts.ts`

- [ ] **Step 1: Create font embedding helper**

Write `src/lib/document/fonts.ts`:

```typescript
import fs from "fs";
import path from "path";

const BOOKMAN_FONT_PATH = path.join(
  process.cwd(),
  "public/fonts/bookman-old-style.ttf"
);

export function getBookmanFontFace(): string {
  if (fs.existsSync(BOOKMAN_FONT_PATH)) {
    const fontBuffer = fs.readFileSync(BOOKMAN_FONT_PATH);
    const fontBase64 = fontBuffer.toString("base64");
    return `
      @font-face {
        font-family: 'Bookman Old Style';
        src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    `;
  }
  return "";
}

export const BOOKMAN_FALLBACK_CSS = `
  body {
    font-family: 'Bookman Old Style', 'Bookman', 'URW Bookman L', 'Georgia', serif;
  }
`;
```

- [ ] **Step 2: Copy font file to public/fonts**

Search for Bookman Old Style `.ttf` on system or download. If not available, note that Georgia fallback will be used automatically.

```bash
# Check if font exists on system
fc-list | grep -i bookman || echo "Bookman Old Style not found — will use Georgia fallback"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/document/fonts.ts public/fonts/
git commit -m "feat: add Bookman Old Style font embedding with fallback"
```

---

### Task 4.4: Context Builder

**Files:**
- Create: `src/lib/document/context-builder.ts`

- [ ] **Step 1: Write context builder**

Write `src/lib/document/context-builder.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Pejabat {
  nama: string;
  nip: string;
  pangkat_golongan?: string;
  jabatan?: string;
  ttd_html?: string;
}

export interface DocumentContext {
  logo_src: string;
  nama_mahasiswa: string;
  nim: string;
  kode_prodi: string;
  nama_prodi: string;
  semester_aktif: string;
  semester_teks: string;
  tahun_akademik: string;
  jenis_semester: string;
  tempat_lahir_mahasiswa: string;
  tanggal_lahir_mahasiswa: string;

  nomor_surat: string | null;
  nomor_surat_status: string | null;
  tanggal_surat: string | null;

  wakil_dekan_1: Pejabat | null;
  dekan: Pejabat | null;

  judul_disetujui: string | null;
  judul_list: string[];

  pembimbing_1: string | null;
  pembimbing_2: string | null;
  nomor_srt_jurusan: string | null;
  tgl_srt_jurusan: string | null;

  hari_sidang: string | null;
  tanggal_sidang: string | null;
  waktu_sidang: string | null;
  ruang_sidang: string | null;
  penguji_1: string | null;
  penguji_2: string | null;

  ttd: string | null;
  qrcode: string | null;
  mode: "preview" | "final";
}

function angkaKeTeks(n: number): string {
  const map: Record<number, string> = {
    1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
    6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X",
    11: "XI", 12: "XII", 13: "XIII", 14: "XIV",
  };
  return map[n] ?? String(n);
}

async function getPejabat(
  positionCode: string
): Promise<Pejabat | null> {
  const pos = await prisma.structuralPosition.findFirst({
    where: { position_code: positionCode, is_active: true },
    include: { dosen: { include: { user: { include: { ttd_scan: true } } } } },
  });
  if (!pos?.dosen) return null;
  const dosen = pos.dosen;
  let ttdHtml: string | undefined;
  if (dosen.user?.ttd_scan?.file_path) {
    ttdHtml = `<img src="${dosen.user.ttd_scan.file_path}" style="height:70px;" alt="TTD">`;
  }
  return {
    nama: [dosen.gelar_depan, dosen.nama_lengkap, dosen.gelar_belakang]
      .filter(Boolean).join(" "),
    nip: dosen.nidn,
    pangkat_golongan: dosen.pangkat_golongan ?? undefined,
    ttd_html: ttdHtml,
  };
}

function toBulanRomawi(month: number): string {
  const map = [
    "I", "II", "III", "IV", "V", "VI",
    "VII", "VIII", "IX", "X", "XI", "XII",
  ];
  return map[month - 1] ?? String(month);
}

export async function buildDocumentContext(
  pengajuanId: number,
  mode: "preview" | "final" = "preview"
): Promise<DocumentContext> {
  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: {
      mahasiswa: { include: { prodi: true } },
      jenis_layanan: { include: { kode_klasifikasi: true } },
      academic_period: true,
      pengajuan_data: true,
      assignments: { include: { dosen: true } },
    },
  });

  if (!pengajuan) throw new Error("Pengajuan tidak ditemukan");

  const mhs = pengajuan.mahasiswa;
  const prodi = mhs.prodi;
  const period = pengajuan.academic_period;
  const fieldValues = (pengajuan.pengajuan_data?.field_values as Record<string, unknown>) ?? {};

  const [wd1, dekan, penomoran, judulSkripsi] = await Promise.all([
    getPejabat("wakil_dekan_1"),
    getPejabat("dekan"),
    prisma.penomoranCounter.findFirst({
      where: { pengajuan_id: pengajuanId },
      orderBy: { reserved_at: "desc" },
    }),
    prisma.judulSkripsi.findFirst({
      where: { mahasiswa_id: mhs.id, status: "aktif" },
    }),
  ]);

  const semesterAktif = mhs.semester_aktif ?? 1;

  const pembimbing1 = pengajuan.assignments.find(
    (a) => a.assignment_type === "pembimbing_skripsi_1" && a.is_active
  );
  const pembimbing2 = pengajuan.assignments.find(
    (a) => a.assignment_type === "pembimbing_skripsi_2" && a.is_active
  );

  const penguji1 = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_proposal" && a.is_active
  );
  const penguji2 = pengajuan.assignments.find(
    (a) => a.assignment_type === "penguji_proposal" && a.is_active
      && a.id !== penguji1?.id
  );

  const dosenPa = pengajuan.assignments.find(
    (a) => a.assignment_type === "dosen_pa" && a.is_active
  );

  const judulList: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const v = fieldValues[`judul_${i}`];
    if (typeof v === "string" && v.trim()) judulList.push(v);
  }

  const tanggalSidang = fieldValues["tanggal_sidang"] as string | undefined;
  let hariSidang: string | null = null;
  if (tanggalSidang) {
    try {
      hariSidang = format(new Date(tanggalSidang), "EEEE", { locale: id });
    } catch { /* ignore invalid date */ }
  }

  return {
    logo_src: "/images/logo-uin.png",
    nama_mahasiswa: mhs.nama_lengkap,
    nim: mhs.nim,
    kode_prodi: prodi.kode,
    nama_prodi: prodi.nama,
    semester_aktif: String(semesterAktif),
    semester_teks: `${semesterAktif} (${angkaKeTeks(semesterAktif)})`,
    tahun_akademik: period.tahun_akademik,
    jenis_semester: period.tipe,
    tempat_lahir_mahasiswa: mhs.tempatLahir ?? "",
    tanggal_lahir_mahasiswa: mhs.tanggalLahir
      ? format(new Date(mhs.tanggalLahir), "d MMMM yyyy", { locale: id })
      : "",

    nomor_surat: penomoran?.nomor_formatted ?? null,
    nomor_surat_status: penomoran?.status ?? null,
    tanggal_surat: mode === "final"
      ? format(new Date(), "d MMMM yyyy", { locale: id })
      : null,

    wakil_dekan_1: wd1,
    dekan,

    judul_disetujui: judulSkripsi?.judul_aktif ?? null,
    judul_list: judulList,

    pembimbing_1: pembimbing1?.dosen?.nama_lengkap ?? null,
    pembimbing_2: pembimbing2?.dosen?.nama_lengkap ?? null,
    nomor_srt_jurusan: (fieldValues["nomor_surat_prodi"] as string) ?? null,
    tgl_srt_jurusan: (fieldValues["tanggal_surat_prodi"] as string) ?? null,

    hari_sidang: hariSidang,
    tanggal_sidang: tanggalSidang ?? null,
    waktu_sidang: fieldValues["waktu_mulai"]
      ? `${fieldValues["waktu_mulai"]} - ${fieldValues["waktu_selesai"]} WIB`
      : null,
    ruang_sidang: (fieldValues["ruang_sidang"] as string) ?? null,
    penguji_1: penguji1?.dosen?.nama_lengkap ?? null,
    penguji_2: penguji2?.dosen?.nama_lengkap ?? null,

    ttd: mode === "final"
      ? (wd1?.ttd_html ?? dekan?.ttd_html ?? null)
      : null,
    qrcode: null,
    mode,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/document/context-builder.ts
git commit -m "feat: add document context builder"
```

---

### Task 4.5: Reserved Numbering

**Files:**
- Create: `src/lib/document/numbering.ts`

- [ ] **Step 1: Write numbering module**

Write `src/lib/document/numbering.ts`:

```typescript
import { prisma } from "@/lib/prisma";

function toBulanRomawi(month: number): string {
  const map = [
    "I", "II", "III", "IV", "V", "VI",
    "VII", "VIII", "IX", "X", "XI", "XII",
  ];
  return map[month - 1] ?? String(month);
}

function padNomor(urut: number): string {
  return String(urut).padStart(4, "0");
}

export async function reserveNomorSurat(
  pengajuanId: number
): Promise<string> {
  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: {
      jenis_layanan: { include: { kode_klasifikasi: true } },
      academic_period: true,
    },
  });

  if (!pengajuan) throw new Error("Pengajuan tidak ditemukan");

  const existing = await prisma.penomoranCounter.findFirst({
    where: { pengajuan_id: pengajuanId },
  });
  if (existing) return existing.nomor_formatted;

  const kode = pengajuan.jenis_layanan.kode_klasifikasi.kode;
  const bulan = toBulanRomawi(new Date().getMonth() + 1);
  const tahun = new Date().getFullYear();

  const [nomor] = await prisma.$transaction([
    prisma.penomoranCounter.create({
      data: {
        academic_period_id: pengajuan.academic_period_id,
        kode_klasifikasi_id: pengajuan.jenis_layanan.kode_klasifikasi_id,
        scope_level: pengajuan.scope_level,
        scope_id: pengajuan.prodi_id,
        pengajuan_id: pengajuan.id,
        nomor_urut: 0,
        nomor_formatted: "",
        status: "reserved",
      },
    }),
  ]);

  const count = await prisma.penomoranCounter.count({
    where: {
      academic_period_id: pengajuan.academic_period_id,
      kode_klasifikasi_id: pengajuan.jenis_layanan.kode_klasifikasi_id,
      id: { lte: nomor.id },
    },
  });

  const formatted = `${padNomor(count)}/Un.17/F.III/${kode}/${bulan}/${tahun}`;

  await prisma.penomoranCounter.update({
    where: { id: nomor.id },
    data: { nomor_urut: count, nomor_formatted: formatted },
  });

  return formatted;
}

export async function activateNomorSurat(
  pengajuanId: number
): Promise<void> {
  await prisma.penomoranCounter.updateMany({
    where: { pengajuan_id: pengajuanId, status: "reserved" },
    data: { status: "active", activated_at: new Date() },
  });
}

export async function voidNomorSurat(
  pengajuanId: number
): Promise<void> {
  await prisma.penomoranCounter.updateMany({
    where: { pengajuan_id: pengajuanId, status: "reserved" },
    data: { status: "void", voided_at: new Date() },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/document/numbering.ts
git commit -m "feat: add reserved numbering (reserve/activate/void)"
```

---

### Task 4.6: Konversi 4 Blade Templates → TypeScript

**Files:**
- Create: `src/lib/document/templates/bypass-judul.ts`
- Create: `src/lib/document/templates/persetujuan-judul.ts`
- Create: `src/lib/document/templates/sk-pembimbing.ts`
- Create: `src/lib/document/templates/seminar-proposal.ts`

**Blade source references:**
- `docs/templates-blade/templates/bypass-seleksi-judul.blade.php`
- `docs/templates-blade/templates/template_persetujuan_judul.blade.php`
- `docs/templates-blade/templates/template_sk_pembimbing.blade.php`
- `docs/templates-blade/templates/template_seminar_proposal.blade.php`

**Conversion rules (Blade → TypeScript):**

| Blade PHP | TypeScript |
|---|---|
| `{{ $var }}` | `${var}` |
| `{!! $html !!}` | `${html}` |
| `{{ $var ?? 'fallback' }}` | `${var ?? 'fallback'}` |
| `@if(condition)` ... `@endif` | `${condition ? '...' : ''}` |
| `@else` | `: ''}` |
| `@foreach($list as $item)` ... `@endforeach` | `${list.map(item => \`...\`).join('')}` |
| `@php` ... `@endphp` | Move to function body before return |
| `\Carbon\Carbon::parse($tgl)->translatedFormat('d F Y')` | `format(new Date(tgl), 'd MMMM yyyy', { locale: id })` |
| `\Carbon\Carbon::now()->translatedFormat('d/m/Y')` | `format(new Date(), 'd MMMM yyyy', { locale: id })` |
| `strtoupper($str)` | `str.toUpperCase()` |
| `implode(', ', array_column($arr, 'key'))` | `arr.map(i => i.key).join(', ')` |
| `onerror="this.style.display='none'"` | Keep as-is (valid inline JS in Puppeteer) |

- [ ] **Step 1: Convert bypass-judul.ts (TA-01 bypass)**

Write `src/lib/document/templates/bypass-judul.ts`:

This template has NO nomor surat, NO TTD, NO QR. It's a form for offline PA approval. The template body comes directly from `bypass-seleksi-judul.blade.php`.

```typescript
import { type DocumentContext } from "../context-builder";
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
<style>${PAGE_CSS}${HEADER_CSS}
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
```

- [ ] **Step 2: Convert persetujuan-judul.ts (TA-01 final)**

This template outputs a single-page official letter with TTD WD1. Convert from `template_persetujuan_judul.blade.php`.

Write `src/lib/document/templates/persetujuan-judul.ts`:

```typescript
import { type DocumentContext } from "../context-builder";
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
```

- [ ] **Step 3: Convert sk-pembimbing.ts (TA-02)**

This template uses Bookman Old Style font, has Dekan TTD, and dual numbering (nomor SK fakultas + nomor surat prodi).

Write `src/lib/document/templates/sk-pembimbing.ts`:

```typescript
import { type DocumentContext } from "../context-builder";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { renderFooter } from "../partials/footer";
import { placeholder, reserved } from "../partials/placeholder";
import { getBookmanFontFace, BOOKMAN_FALLBACK_CSS } from "../fonts";

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
${HEADER_CSS.replace('text-align: left', 'text-align: center')}
.header-logo { width:100%; text-align:center; }
.header-table.double-line { margin-bottom:0; }
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
</style>
</head>
<body>
<div class="page">
  <table class="header-table double-line" style="width:100%;">
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
```

- [ ] **Step 4: Convert seminar-proposal.ts (TA-03, 3 pages)**

This template is the largest — 3 pages in 1 PDF with page breaks. Convert from `template_seminar_proposal.blade.php`.

Write `src/lib/document/templates/seminar-proposal.ts`:

```typescript
import { type DocumentContext } from "../context-builder";
import { renderKopSurat } from "../partials/kop-surat";
import { renderFooter } from "../partials/footer";
import { PAGE_CSS, HEADER_CSS, FOOTER_CSS, SIGNATURE_CSS } from "../partials/styles";
import { placeholder, reserved } from "../partials/placeholder";

export function renderSeminarProposal(ctx: DocumentContext): string {
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
    ? placeholder(ctx.ttd, `TTD ${ctx.wakil_dekan_1?.nama ?? "WD1"}`)
    : (ctx.ttd ?? "");

  const qrHtml = isPreview
    ? placeholder(ctx.qrcode, "QR")
    : (ctx.qrcode ?? "");

  const penguji1 = placeholder(ctx.penguji_1, "PENGUJI 1");
  const penguji2 = placeholder(ctx.penguji_2, "PENGUJI 2");
  const hari = placeholder(ctx.hari_sidang, "HARI");
  const tgl = placeholder(ctx.tanggal_sidang, "TANGGAL SIDANG");
  const waktu = placeholder(ctx.waktu_sidang, "WAKTU");
  const ruang = placeholder(ctx.ruang_sidang, "RUANG");

  // Page 1: Surat Tugas
  // Page 2: Berita Acara
  // Page 3: Daftar Hadir

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Tugas Seminar Proposal</title>
<style>${PAGE_CSS}${HEADER_CSS}${FOOTER_CSS}${SIGNATURE_CSS}
  .judul-surat {
    text-align:center; font-size:12pt; font-weight:bold;
    text-decoration:underline; margin:10px 0 5px 0;
  }
  .nomor-surat { text-align:center; margin-bottom:20px; }
  .tabel-info { width:100%; border-collapse:collapse; margin:15px 0; }
  .tabel-info td { padding:3px 8px; font-size:12pt; vertical-align:top; }
  .tabel-info td:first-child { width:200px; }
  .tabel-info td:nth-child(2) { width:5px; text-align:center; }
  .paragraf { text-align:justify; margin:15px 0; font-size:12pt; line-height:1.5; text-indent:1cm; }
  .section-title { text-align:center; font-weight:bold; font-size:12pt; margin:10px 0; }
  .tabel-kehadiran { width:100%; border-collapse:collapse; margin:15px 0; }
  .tabel-kehadiran th { border:1px solid #000; padding:6px; font-size:11pt; background:#f0f0f0; }
  .tabel-kehadiran td { border:1px solid #000; padding:6px; font-size:11pt; }
  .checklist { text-align:center; }
</style>
</head>
<body>

<!-- ==================== PAGE 1: SURAT TUGAS ==================== -->
<div class="page">
${renderKopSurat(ctx.logo_src)}
<div class="judul-surat">SURAT TUGAS</div>
<div class="nomor-surat">Nomor: ${nomorSurat}</div>

<p class="paragraf">
  Wakil Dekan Bidang Akademik Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin
  Banten, dengan ini menugaskan kepada:
</p>

<table class="tabel-info">
  <tr>
    <td style="padding-left:40px;">1. Nama / NIP</td>
    <td>:</td>
    <td><strong>${penguji1}</strong></td>
  </tr>
  <tr>
    <td style="padding-left:40px;">2. Nama / NIP</td>
    <td>:</td>
    <td><strong>${penguji2}</strong></td>
  </tr>
</table>

<p style="text-indent:1cm;font-size:12pt;">
  Untuk bertindak sebagai <strong>Dewan Penguji</strong> pada:
</p>

<table class="tabel-info">
  <tr>
    <td style="padding-left:40px;">Hari / Tanggal</td>
    <td>:</td><td><strong>${hari}, ${tgl}</strong></td>
  </tr>
  <tr>
    <td style="padding-left:40px;">Waktu</td>
    <td>:</td><td>${waktu}</td>
  </tr>
  <tr>
    <td style="padding-left:40px;">Tempat</td>
    <td>:</td><td>${ruang}</td>
  </tr>
  <tr>
    <td style="padding-left:40px;">Acara</td>
    <td>:</td><td>Seminar Proposal Skripsi</td>
  </tr>
</table>

<table class="tabel-info">
  <tr><td colspan="3">Mahasiswa yang diuji:</td></tr>
  <tr><td style="padding-left:40px;">Nama</td><td>:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td style="padding-left:40px;">NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td style="padding-left:40px;">Prodi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
  <tr><td style="padding-left:40px;">Judul</td><td>:</td><td><em>${placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI")}</em></td></tr>
</table>

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

<!-- ==================== PAGE 2: BERITA ACARA ==================== -->
<div class="page">
${renderKopSurat(ctx.logo_src)}
<div class="section-title">BERITA ACARA DAN KEPUTUSAN</div>
<div class="section-title">SEMINAR PROPOSAL SKRIPSI</div>

<p class="paragraf">
  Pada hari ${hari}, tanggal ${tgl}, telah dilaksanakan Seminar
  Proposal Skripsi mahasiswa:
</p>

<table class="tabel-info">
  <tr><td style="padding-left:40px;">Nama</td><td>:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td style="padding-left:40px;">NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td style="padding-left:40px;">Prodi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
  <tr><td style="padding-left:40px;">Tempat / Tgl Lahir</td><td>:</td><td>${placeholder(ctx.tempat_lahir_mahasiswa, "TEMPAT LAHIR")}, ${placeholder(ctx.tanggal_lahir_mahasiswa, "TGL LAHIR")}</td></tr>
  <tr><td style="padding-left:40px;">Semester</td><td>:</td><td>${ctx.semester_teks} T.A. ${ctx.tahun_akademik}</td></tr>
</table>

<p class="paragraf">
  Dengan Dewan Penguji:
</p>

<table class="tabel-info">
  <tr><td style="padding-left:40px;">1.</td><td></td><td>${penguji1} (Penguji I)</td></tr>
  <tr><td style="padding-left:40px;">2.</td><td></td><td>${penguji2} (Penguji II)</td></tr>
</table>

<p class="paragraf">
  Judul Proposal Skripsi:
  <strong><em>${placeholder(ctx.judul_disetujui, "JUDUL SKRIPSI")}</em></strong>
</p>

<p class="paragraf">
  <strong>Keputusan Seminar Proposal:</strong> <span style="font-size:13pt;font-weight:bold;">LAYAK / TIDAK LAYAK *</span>
</p>

<p style="font-size:10pt;margin-left:1cm;">* Coret yang tidak perlu</p>

<p class="paragraf">
  Demikian berita acara ini dibuat dengan sebenar-benarnya.
</p>

<div class="signature-section" style="float:left;width:40%">
  <p class="signature-text" style="text-align:center;">Penguji I,</p>
  <div class="signature-space"></div>
  <p class="signature-text" style="font-weight:bold;text-decoration:underline;text-align:center;">${penguji1.split(' ').slice(0, -1).join(' ') || penguji1}</p>
  <p class="signature-text" style="text-align:center;">NIP.</p>
</div>
<div class="signature-section">
  <p class="signature-text" style="text-align:center;">Penguji II,</p>
  <div class="signature-space"></div>
  <p class="signature-text" style="font-weight:bold;text-decoration:underline;text-align:center;">${penguji2.split(' ').slice(0, -1).join(' ') || penguji2}</p>
  <p class="signature-text" style="text-align:center;">NIP.</p>
</div>
<div class="clear"></div>
${renderFooter(qrHtml)}
</div>

<!-- ==================== PAGE 3: DAFTAR HADIR ==================== -->
<div class="page">
${renderKopSurat(ctx.logo_src)}
<div class="section-title">DAFTAR HADIR DEWAN PENGUJI</div>
<div class="section-title">SEMINAR PROPOSAL SKRIPSI</div>

<table class="tabel-info">
  <tr><td style="padding-left:40px;">Hari / Tanggal</td><td>:</td><td>${hari}, ${tgl}</td></tr>
  <tr><td style="padding-left:40px;">Nama Mahasiswa</td><td>:</td><td>${ctx.nama_mahasiswa}</td></tr>
  <tr><td style="padding-left:40px;">NIM</td><td>:</td><td>${ctx.nim}</td></tr>
  <tr><td style="padding-left:40px;">Prodi</td><td>:</td><td>${ctx.nama_prodi}</td></tr>
</table>

<table class="tabel-kehadiran">
  <thead>
    <tr>
      <th>No</th><th>Nama</th><th>Jabatan</th><th>Tanda Tangan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="checklist">1</td>
      <td>${penguji1}</td>
      <td>Penguji I</td>
      <td></td>
    </tr>
    <tr>
      <td class="checklist">2</td>
      <td>${penguji2}</td>
      <td>Penguji II</td>
      <td></td>
    </tr>
    <tr>
      <td class="checklist">3</td>
      <td>${placeholder(ctx.pembimbing_1, "PEMBIMBING 1")}</td>
      <td>Pembimbing I</td>
      <td></td>
    </tr>
    <tr>
      <td class="checklist">4</td>
      <td>${placeholder(ctx.pembimbing_2, "PEMBIMBING 2")}</td>
      <td>Pembimbing II</td>
      <td></td>
    </tr>
  </tbody>
</table>

<p style="text-align:right;margin-top:30px;font-size:12pt;">
  Serang, ${tanggalSurat}<br>
  Wakil Dekan Bidang Akademik
</p>
<div class="signature-section" style="margin-top:50px;">
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
```

- [ ] **Step 5: Create template index**

Write `src/lib/document/templates/index.ts`:

```typescript
import { type DocumentContext } from "../context-builder";

export type TemplateFn = (ctx: DocumentContext) => string;

export function selectTemplate(layananKode: string, mode: "preview" | "final"): TemplateFn {
  // Dynamic import to avoid circular deps. In practice, import directly.
  if (layananKode === "TA-01") {
    if (mode === "final") {
      return (await import("./persetujuan-judul")).renderPersetujuanJudul;
    }
    return (await import("./bypass-judul")).renderBypassJudul;
  }
  if (layananKode === "TA-02") {
    return (await import("./sk-pembimbing")).renderSkPembimbing;
  }
  if (layananKode === "TA-03") {
    return (await import("./seminar-proposal")).renderSeminarProposal;
  }
  throw new Error(`No template for layanan: ${layananKode}`);
}
```

Actually, replace `selectTemplate` with a simpler sync version — dynamic import adds complexity:

```typescript
import { renderPersetujuanJudul } from "./persetujuan-judul";
import { renderBypassJudul } from "./bypass-judul";
import { renderSkPembimbing } from "./sk-pembimbing";
import { renderSeminarProposal } from "./seminar-proposal";
import { type DocumentContext } from "../context-builder";

export type TemplateFn = (ctx: DocumentContext) => string;

export function selectTemplate(layananKode: string, isFinal: boolean): TemplateFn {
  switch (layananKode) {
    case "TA-01": return isFinal ? renderPersetujuanJudul : renderBypassJudul;
    case "TA-02": return renderSkPembimbing;
    case "TA-03": return renderSeminarProposal;
    default: throw new Error(`No template for layanan: ${layananKode}`);
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/document/templates/
git commit -m "feat: convert 4 Blade templates to TypeScript (TA-01, TA-02, TA-03)"
```

---

### Task 4.7: PDF API Route + Detail Page UI Button

**Files:**
- Create: `src/app/api/pengajuan/[id]/pdf/route.ts`
- Modify: `src/app/(dashboard)/pengajuan/[id]/page.tsx`

- [ ] **Step 1: Create PDF API route**

Write `src/app/api/pengajuan/[id]/pdf/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildDocumentContext, type DocumentContext } from "@/lib/document/context-builder";
import { selectTemplate } from "@/lib/document/templates";
import { generatePdf } from "@/lib/document/generate-pdf";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const pengajuanId = Number(id);
  const modeParam = request.nextUrl.searchParams.get("mode") ?? "preview";
  const mode: "preview" | "final" = modeParam === "final" ? "final" : "preview";

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    select: { id: true, jenis_layanan: { select: { kode: true } } },
  });

  if (!pengajuan) {
    return new NextResponse("Pengajuan tidak ditemukan", { status: 404 });
  }

  const layananKode = pengajuan.jenis_layanan.kode;
  if (!["TA-01", "TA-02", "TA-03"].includes(layananKode)) {
    return new NextResponse("Template belum tersedia untuk layanan ini", { status: 501 });
  }

  const ctx = await buildDocumentContext(pengajuanId, mode);
  const templateFn = selectTemplate(layananKode, mode === "final");
  const html = templateFn(ctx);
  const pdfBuffer = await generatePdf(html, { mode });

  const filename = `${pengajuan.jenis_layanan.kode}_${String(pengajuanId).padStart(4, "0")}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        mode === "final"
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
```

- [ ] **Step 2: Add PDF button to detail page**

Read current file: `src/app/(dashboard)/pengajuan/[id]/page.tsx`

After the existing workspace sections (after `PengujiPicker` section), add a PDF button section. The PDF button should appear for all roles that can view the pengajuan.

Find the closing `</div>` before `</main>` or similar, and add:

```typescript
        {/* PDF Preview/Download */}
        <div className="flex gap-3 pt-4 border-t">
          {pengajuan.status !== "selesai" ? (
            <a
              href={`/api/pengajuan/${pengajuan.id}/pdf?mode=preview`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" type="button">
                Pratinjau PDF
              </Button>
            </a>
          ) : (
            <a
              href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final`}
              download
            >
              <Button type="button">Unduh PDF Final</Button>
            </a>
          )}
        </div>
```

The exact placement: after the last conditional section (TA-03 PengujiPicker), before the closing `</div>` of the main container.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/pengajuan/ src/app/(dashboard)/pengajuan/
git commit -m "feat: add PDF API route and preview/download button"
```

---

### Task 4.8: Build Verification

- [ ] **Step 1: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 2: Full build**

```bash
npm run build 2>&1
```

Expected: Build passes with no TypeScript errors.

- [ ] **Step 3: Fix any TypeScript errors**

For each error:
1. Read the file at the error line
2. Fix the issue
3. Re-run build

Common potential issues:
- `prisma.structuralPosition` — correct is `prisma.structuralPosition` (singular), but check the actual Prisma client name. If error, check generated client for correct model name path.
- Template functions import paths
- Missing `await` on async calls

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: build verification, fix TS errors"
```

---

## Implementation Order

1. Task 4.1: Puppeteer setup (no dependencies)
2. Task 4.2: Shared partials (no dependencies)
3. Task 4.3: Font embedding (no dependencies)
4. Task 4.4: Context builder (depends on 4.2 for types)
5. Task 4.5: Numbering (no dependencies)
6. Task 4.6: Template conversion (depends on 4.2, 4.3, 4.4)
7. Task 4.7: API route + UI (depends on 4.4, 4.5, 4.6)
8. Task 4.8: Build verification (depends on all)

Tasks 4.1, 4.2, 4.3, 4.5 are independent and can run in parallel. Tasks 4.4, 4.6, 4.7 are sequential.
