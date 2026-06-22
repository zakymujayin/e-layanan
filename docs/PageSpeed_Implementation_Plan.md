# PageSpeed Insights — Implementation Plan

**URL:** https://in-pasyandu.lebak.dss.dkru.org/  
**Tanggal Analisis:** 2 Juni 2026  
**Tujuan:** Meningkatkan skor Performance mobile dari 78 ke 93+

---

## 1. Current State

| Metrik | Mobile | Desktop | Target Mobile |
|--------|--------|---------|---------------|
| Performance | 78 | 96 | 93+ |
| Accessibility | 94 | 94 | 98+ |
| Best Practices | 100 | 100 | 100 |
| SEO | 92 | 92 | 98+ |

### Core Web Vitals

| Metrik | Mobile | Desktop | Target | Status Mobile |
|--------|--------|---------|--------|---------------|
| FCP | 2.3s | 0.5s | < 1.8s | NEEDS WORK |
| LCP | 4.8s | 1.3s | < 2.5s | FAIL |
| TBT | 40ms | 10ms | < 200ms | PASS |
| Speed Index | 4.4s | 1.1s | < 3.4s | FAIL |
| CLS | 0 | 0 | < 0.1 | PASS |

### Kenapa Mobile Jauh Lebih Lambat dari Desktop

- Simulasi jaringan 4G (bukan WiFi)
- CPU throttling 4x pada mobile simulation
- LCP mobile 4.8s vs desktop 1.3s — selisih 3.5 detik
- Gambar dan JS tidak dioptimasi untuk koneksi terbatas

---

## 2. Issues & Prioritas

| Priority | Issue | Impact | Effort | Kategori |
|----------|-------|--------|--------|----------|
| P1 | LCP terlalu lambat (4.8s mobile) | Tinggi | Sedang | Performance |
| P1 | Unused JavaScript (213 KB mobile) | Tinggi | Sedang | Performance |
| P1 | Render-blocking resources | Tinggi | Rendah | Performance |
| P2 | Compress images (~74 KB) | Sedang | Rendah | Performance |
| P2 | Reduce JavaScript (~74 KB) | Sedang | Sedang | Performance |
| P2 | Excessive DOM size | Sedang | Tinggi | Performance |
| P2 | Improve Heap Delivery (~12 KB desktop) | Rendah | Rendah | Performance |
| P3 | Background/foreground color contrast | Sedang | Rendah | Accessibility |
| P3 | Heading order tidak berurutan | Rendah | Rendah | Accessibility |
| P3 | robots.txt not found | Sedang | Rendah | SEO |

---

## 3. Sprint Plan (6 Minggu)

### Sprint 1 — Minggu 1-2: Quick Wins
**Target:** Mobile 85+ | Desktop 97+

- Aktifkan gzip/brotli compression di server
- Konversi semua gambar JPG/PNG ke WebP
- Tambahkan browser caching headers
- Buat file robots.txt
- Perbaiki color contrast yang gagal

### Sprint 2 — Minggu 3-4: JS & Resource Optimization
**Target:** Mobile 90+ | Desktop 98+

- Defer/async semua non-critical JS
- Hapus render-blocking CSS (preload trick)
- Code splitting & tree shaking
- Preload resource LCP (hero image)
- Lazy loading semua gambar below-the-fold

### Sprint 3 — Minggu 5-6: Deep Fixes
**Target:** Mobile 93+ | Desktop 99+

- Kurangi DOM size ke bawah 1.500 nodes
- Implementasi Critical CSS (inline above-the-fold)
- Audit dan hapus unused CSS
- Perbaiki heading structure (H1 > H2 > H3)
- Tambahkan sitemap.xml

---

## 4. Implementasi Teknis

### 4.1 Perbaikan LCP (Prioritas Tertinggi)

**Preload hero image:**
```html
<link rel="preload" as="image" href="/images/hero.webp" fetchpriority="high">
<img src="/images/hero.webp" fetchpriority="high" loading="eager" decoding="async">
```

**Konversi gambar ke WebP dengan fallback:**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="description">
</picture>
```

**Konversi via CLI:**
```bash
cwebp -q 80 image.jpg -o image.webp
# atau via Sharp (Node.js)
sharp('input.jpg').webp({ quality: 80 }).toFile('output.webp')
```

### 4.2 Eliminasi Render-Blocking Resources

**CSS non-kritis (async load):**
```html
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

**JavaScript (defer/async):**
```html
<script src="app.js" defer></script>
<script src="analytics.js" async></script>
```

**Critical CSS — inline di `<head>` untuk above-the-fold:**
```html
<style>
  /* hanya CSS yang dibutuhkan untuk render pertama */
  body { margin: 0; font-family: Arial, sans-serif; }
  .hero { ... }
</style>
```

### 4.3 Optimasi JavaScript (Hemat 213 KB)

Langkah audit unused JS:
1. Buka Chrome DevTools > tekan `Ctrl+Shift+P`
2. Ketik `Coverage` dan klik Start
3. Reload halaman
4. File dengan unused > 50% → hapus atau lazy-load

Teknik optimasi:
- **Code splitting** — pisahkan bundle per route (React: `React.lazy`, Next.js: dynamic import)
- **Tree shaking** — pastikan `sideEffects: false` di package.json
- **Lazy load routes:**
```js
// React
const Dashboard = React.lazy(() => import('./Dashboard'));

// Next.js
const Chart = dynamic(() => import('./Chart'), { ssr: false });
```
- Hapus semua `console.log` di production build
- Jalankan `webpack-bundle-analyzer` untuk visualisasi bundle

### 4.4 Kompresi Gambar (Hemat ~74 KB)

| Teknik | Tool | Estimasi Hemat |
|--------|------|----------------|
| Konversi ke WebP | cwebp, Sharp, Squoosh | 25-35% |
| Responsive images (srcset) | HTML attribute | 30-60% |
| Lazy loading | `loading="lazy"` | Mengurangi initial load |
| CDN + Caching | Cloudflare / CDN | 50-80% latency |

**Responsive images:**
```html
<img
  src="image-800.webp"
  srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
  loading="lazy"
  alt="description"
>
```

### 4.5 Browser Caching & Server Compression

**Nginx:**
```nginx
# Gzip
gzip on;
gzip_types text/css application/javascript image/svg+xml;
gzip_comp_level 6;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|webp|ico|css|js)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

**Apache (.htaccess):**
```apache
# Compression
AddOutputFilterByType DEFLATE text/html text/css application/javascript

# Cache headers
<filesMatch "\.(jpg|jpeg|png|gif|webp|ico|css|js)$">
  Header set Cache-Control "max-age=31536000, public"
</filesMatch>
```

### 4.6 Kurangi DOM Size

Target: di bawah 1.500 nodes.

```js
// Audit jumlah DOM nodes
console.log(document.querySelectorAll('*').length);
```

Langkah:
- Gunakan virtual scrolling untuk list/tabel panjang (react-window, react-virtual)
- Hapus elemen hidden yang tidak perlu di DOM
- Pecah komponen besar menjadi lazy-loaded components
- Hindari nested wrapper yang tidak perlu

---

## 5. Perbaikan Accessibility (94 → 98+)

### Color Contrast
- WCAG 2.1 AA: contrast ratio minimal **4.5:1** untuk teks normal, **3:1** untuk teks besar
- Audit: [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker)
- Pasang Chrome Extension **axe DevTools** untuk audit otomatis

### Heading Structure
```html
<!-- BENAR -->
<h1>Judul Halaman</h1>
  <h2>Sub Bagian</h2>
    <h3>Detail</h3>

<!-- SALAH — jangan lompat level -->
<h1>Judul</h1>
  <h3>Langsung ke H3</h3>
```

### Checklist Accessibility

- Semua `<img>` punya `alt` text yang deskriptif
- Setiap `<input>` punya `<label>` yang terhubung
- Focus indicator visible untuk keyboard navigation
- ARIA labels pada elemen interaktif yang tidak punya teks
- Skip navigation link di awal halaman

---

## 6. Perbaikan SEO (92 → 98+)

### robots.txt (Wajib Dibuat)

Buat file di: `https://in-pasyandu.lebak.dss.dkru.org/robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://in-pasyandu.lebak.dss.dkru.org/sitemap.xml
```

### Checklist SEO

- Buat `robots.txt` di root domain
- Buat `sitemap.xml` dan daftarkan di Google Search Console
- Setiap halaman punya `<meta name="description">` unik (150-160 karakter)
- Canonical URL benar (tidak ada duplicate content)
- Open Graph tags untuk social sharing:
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
```

---

## 7. Target Setelah Implementasi

| Metrik | Sekarang Mobile | Target Mobile | Sekarang Desktop | Target Desktop |
|--------|----------------|---------------|-----------------|----------------|
| Performance | 78 | 93+ | 96 | 99+ |
| Accessibility | 94 | 98+ | 94 | 98+ |
| Best Practices | 100 | 100 | 100 | 100 |
| SEO | 92 | 98+ | 92 | 98+ |
| LCP | 4.8s | < 2.5s | 1.3s | < 1.0s |
| FCP | 2.3s | < 1.5s | 0.5s | < 0.5s |
| Speed Index | 4.4s | < 2.5s | 1.1s | < 1.0s |

---

## 8. Tools Rekomendasi

| Tool | Kegunaan | Akses |
|------|----------|-------|
| Google PageSpeed Insights | Cek skor & rekomendasi | pagespeed.web.dev |
| Chrome DevTools Coverage | Audit unused JS/CSS | F12 > Ctrl+Shift+P > Coverage |
| webpack-bundle-analyzer | Visualisasi bundle JS | `npm i webpack-bundle-analyzer` |
| Squoosh | Kompresi & konversi gambar | squoosh.app |
| WebAIM Contrast Checker | Cek contrast ratio | webaim.org/resources/contrastchecker |
| axe DevTools | Audit aksesibilitas otomatis | Chrome Extension |
| Lighthouse CI | Automated testing di CI/CD | github.com/GoogleChrome/lighthouse-ci |
| GTmetrix | Analisis performa detail | gtmetrix.com |

---

> **Catatan:** Lakukan pengukuran ulang PageSpeed Insights setelah setiap sprint selesai untuk memverifikasi peningkatan skor. Disarankan mengintegrasikan Lighthouse CI ke pipeline CI/CD untuk monitoring berkelanjutan.
