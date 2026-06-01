# Fase 4: PDF Generation — Design Spec

**Tanggal**: 29 Mei 2026
**Status**: Approved
**Cakupan**: 4 Blade template untuk 3 layanan aktif (TA-01, TA-02, TA-03)

---

## 1. Arsitektur PDF Pipeline

```
Pengajuan Detail Page
  → Tombol "Pratinjau PDF" atau "Unduh PDF"
  → GET /api/pengajuan/[id]/pdf?mode=preview|final
    → buildDocumentContext(pengajuanId)
    → selectTemplate(jenisLayananKode)
    → templateFn(context) → HTML string
    → generatePdf(html, { mode }) → Buffer
    → Response PDF (inline untuk preview, attachment untuk final)
```

### File Structure

```
src/lib/document/
  partials/
    kop-surat.ts           # renderKopSurat(logoSrc) — shared header
    footer.ts              # renderFooter(qrcodeHtml) — shared footer
    styles.ts              # shared CSS (kop, footer, page setup, body)
    placeholder.ts         # placeholder(), reserved() helpers
  templates/
    bypass-judul.ts        # TA-01 bypass (form offline, tidak bernomor)
    persetujuan-judul.ts   # TA-01 final (TTD WD1)
    sk-pembimbing.ts       # TA-02 (TTD Dekan, font Bookman Old Style)
    seminar-proposal.ts    # TA-03 (3 halaman dalam 1 PDF, TTD WD1)
  fonts.ts                 # Bookman Old Style base64 embed + fallback
  context-builder.ts       # buildDocumentContext(pengajuanId) → DocumentContext
  numbering.ts             # reserveNomorSurat(), activateNomorSurat(), voidNomorSurat()
  generate-pdf.ts          # generatePdf(html, mode) → Buffer (browser pool singleton)
```

---

## 2. Placeholder & Highlight System (3-Level)

Tiga level tampilan data di template:

| Level | Kondisi | Tampilan | Contoh |
|---|---|---|---|
| 1 — Placeholder | Data belum ada (null) | Teks `[LABEL]` background kuning penuh | `[NOMOR SURAT]` |
| 2 — Reserved | Data ada tapi belum final | Nilai asli dengan background kuning | `0001/Un.17/...` highlight kuning |
| 3 — Final | Data sudah final / activated | Normal, tanpa highlight | `0001/Un.17/...` |

```typescript
// placeholder.ts
function placeholder(value: string | null | undefined, label: string): string {
  if (value) return value;
  return `<span style="background:#FFD700;padding:0 4px;">[${label}]</span>`;
}

function reserved(value: string | null | undefined, label: string): string {
  if (!value) return `<span style="background:#FFD700;padding:0 4px;">[${label}]</span>`;
  return `<span style="background:#FFD700;padding:0 2px;" title="Nomor surat sudah di-reserve, menunggu finalisasi">${value}</span>`;
}
```

### Data yang pakai placeholder di preview mode:

| Field | Level | Alasan |
|---|---|---|
| nomor_surat | Reserved | Di-reserve saat submit, di-activate saat sign |
| tanggal_surat | Reserved | Diisi saat sign (tanggal TTD) |
| ttd | Placeholder | Belum ada TTD scan pejabat |
| qrcode | Placeholder | QR belum di-generate (Fase 6) |
| pembimbing_1/2 | Placeholder | Belum dipilih oleh sekprodi |
| penguji_1/2 | Placeholder | Belum dipilih oleh sekprodi |

Data seperti nama_mahasiswa, nim, prodi SELALU tersedia → tidak perlu placeholder.

---

## 3. Context Builder

Fungsi: fetch semua data yang dibutuhkan template dari database dalam 1 call.

```typescript
// context-builder.ts
export async function buildDocumentContext(pengajuanId: number): Promise<DocumentContext> {
  // 1 query utama dengan deep include
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

  // Parallel queries
  const [wd1, dekan, penomoran, judul] = await Promise.all([
    getPejabat('wakil_dekan_1'),
    getPejabat('dekan'),
    getNomorSurat(pengajuanId),
    getJudulAktif(pengajuan.mahasiswa_id),
  ]);

  return { /* semua field */ };
}
```

### Sumber data per field:

| Field | Sumber |
|---|---|
| nama, nim, semester, prodi | `mahasiswa` + `prodi` |
| tempat/tanggal lahir, jenis_kelamin | `mahasiswa` |
| semester_teks, tahun_akademik | `academic_periods` |
| judul_disetujui | `judul_skripsi` WHERE status='aktif' |
| judul_list | `pengajuan_data.field_values` |
| pembimbing 1/2 | `assignments` WHERE type LIKE 'pembimbing%' |
| penguji 1/2 | `assignments` WHERE type='penguji_proposal' |
| jadwal sidang | `pengajuan_data.field_values` |
| nomor_surat (FUDA) | `penomoran_counter` |
| pejabat (WD1, Dekan) | `structural_positions` + `dosen` |
| ttd | `ttd_scans` |
| logo | `/public/images/logo-uin.png` (placeholder SVG saat ini) |

---

## 4. Penomoran Surat FUDA

Format: `[NO_URUT]/Un.17/F.III/[KODE_KLASIFIKASI]/[BULAN_ROMAWI]/[TAHUN]`

Contoh: `0001/Un.17/F.III/PP.00.9/VI/2026`

### Lifecycle:

```
Submit → reserveNomorSurat() → status='reserved'
         ↓
      (lanjut workflow)
         ↓
Sign   → activateNomorSurat() → status='active' (highlight kuning hilang)
         ↓
      (atau jika ditolak/terminate)
         ↓
Terminate → voidNomorSurat() → status='void' (nomor tidak dipakai ulang)
```

### Logic:

- Nomor di-reserve saat submit, di-activate saat pejabat sign
- Jika pengajuan direvisi (dalam pengajuan_id sama): nomor tetap, tidak berubah
- Jika pengajuan diterminate: nomor menjadi void (sesuai standar persuratan — nomor void tetap tercatat, tidak dipakai ulang)
- Pengajuan baru (pengajuan_id berbeda): nomor baru, counter +1

### Atomic Counter:

Menggunakan `prisma.$transaction` untuk memastikan nomor urut tidak collision. Nomor urut dihitung dari COUNT penomoran di academic_period + kode_klasifikasi yang sama.

---

## 5. PDF Generator (Puppeteer + Browser Pool)

```typescript
// generate-pdf.ts
let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

export async function generatePdf(
  html: string,
  options?: { mode?: 'preview' | 'final' }
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  await page.close();
  return Buffer.from(pdf);
}
```

Single browser instance, reuse across requests. Latency dari ~2s jadi ~100ms.

---

## 6. Font Handling

Font **Bookman Old Style** dibutuhkan oleh `sk-pembimbing` (TA-02) untuk seluruh dokumen. Font ini tidak tersedia di Linux.

### Solusi: Base64 Embed

```typescript
// fonts.ts
export function getBookmanFontFace(): string {
  const fontBuffer = fs.readFileSync(BOOKMAN_FONT_PATH);
  const fontBase64 = fontBuffer.toString('base64');
  return `
    @font-face {
      font-family: 'Bookman Old Style';
      src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
      font-weight: normal; font-style: normal;
    }
  `;
}
```

### Fallback CSS:

```css
font-family: 'Bookman Old Style', 'Bookman', 'URW Bookman L', 'Georgia', serif;
```

Font file diletakkan di `public/fonts/bookman-old-style.ttf`. Jika file belum tersedia, fallback ke Georgia (paling mirip).

---

## 7. Template yang Dikonversi

| File Source (Blade) | File Target (TS) | Layanan | Halaman | Font |
|---|---|---|---|---|
| `bypass-seleksi-judul.blade.php` | `bypass-judul.ts` | TA-01 bypass | 1 | Times New Roman |
| `template_persetujuan_judul.blade.php` | `persetujuan-judul.ts` | TA-01 final | 1 | Times New Roman |
| `template_sk_pembimbing.blade.php` | `sk-pembimbing.ts` | TA-02 | 1 | Bookman Old Style |
| `template_seminar_proposal.blade.php` | `seminar-proposal.ts` | TA-03 | 3 (page-break) | Times New Roman |

TA-03 menghasilkan 3 halaman dalam 1 PDF menggunakan `page-break-after: always`.

### CSS fixes saat konversi:

- Missing closing bracket `}` di `.header-logo` dan `.header-logo img` (semua template kecuali bypass + persetujuan-judul)
- Gunakan CSS dari shared partials `styles.ts` untuk konsistensi

---

## 8. PDF API Route

```
GET /api/pengajuan/[id]/pdf?mode=preview|final

Response:
  Content-Type: application/pdf
  Content-Disposition: inline (preview) | attachment; filename="...pdf" (final)
```

### Logic:

1. Auth: cek session valid, user punya scope ke pengajuan ini
2. Context: `buildDocumentContext(pengajuanId)`
3. Template: select berdasarkan `jenis_layanan.kode`
4. Render: template function return HTML string
5. Generate: `generatePdf(html, { mode })` → Buffer
6. Response: return PDF

### URL di detail page:

- Status != `selesai`: `<a href="/api/pengajuan/[id]/pdf?mode=preview" target="_blank">Pratinjau PDF</a>`
- Status = `selesai`: `<a href="/api/pengajuan/[id]/pdf?mode=final" download>Unduh PDF</a>`

---

## 9. Task Breakdown

| # | Task | Files | Output |
|---|---|---|---|
| 4.1 | Install Puppeteer + browser pool | `generate-pdf.ts` | npm install, singleton browser |
| 4.2 | Shared partials | `kop-surat.ts`, `footer.ts`, `styles.ts`, `placeholder.ts` | 4 file helpers |
| 4.3 | Font embedding | `public/fonts/`, `fonts.ts` | Bookman base64 embed |
| 4.4 | Context builder | `context-builder.ts` | buildDocumentContext() |
| 4.5 | Reserved numbering | `numbering.ts` | reserve/activate/void |
| 4.6 | Konversi 4 Blade templates | `templates/*.ts` | 4 template TypeScript |
| 4.7 | PDF API route + UI button | `api/.../pdf/route.ts`, detail page update | GET handler + button |
| 4.8 | Build verification | — | `npm run build` clean |

---

## 10. Dependensi & Pre-requisites

- **npm**: `npm install puppeteer` (belum terinstall)
- **Puppeteer**: Download Chromium otomatis via `puppeteer` npm package
- **Font file**: `public/fonts/bookman-old-style.ttf` — jika belum ada, gunakan font file yang bisa di-download atau fallback Georgia
- **Logo**: `public/images/logo-uin.png` — placeholder SVG untuk saat ini
- **DB**: Prisma schema sudah lengkap — `PenomoranCounter`, `DokumenOutput`, `DokumenVerifikasi`, `TtdScan` semua sudah ada, TIDAK perlu migration
