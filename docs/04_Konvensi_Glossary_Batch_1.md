# Dokumen Konvensi & Glossary SILA — Batch 1

**Sistem**: SILA — Fakultas Ushuluddin dan Adab, UIN SMH Banten
**Cakupan Batch 1**: Bagian 1 (Glossary), Bagian 2 (Naming Convention), Bagian 3 (Enum & Status)
**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## ⚠️ Status Dokumen

Dokumen ini adalah **Batch 1 dari 4 batch** total Konvensi & Glossary SILA.

- ✅ **Batch 1** (dokumen ini): Bagian 1-3 — Fondasi Terminologi
- ⏳ **Batch 2**: Bagian 4-7 — Konvensi Teknis
- ⏳ **Batch 3**: Bagian 8-10 — UI & Acceptance
- ⏳ **Batch 4**: Bagian 11-15 — Tata Kelola Agent

**Dokumen ini adalah AUTHORITATIVE SOURCE untuk istilah, naming, dan enum**. Semua dokumen lain (BPMN, SRS, ERD, code) **wajib mengacu** ke dokumen ini.

---

# Bagian 1: Glossary (Kamus Istilah)

## 1.1 Glossary Istilah Akademik

Istilah yang berasal dari domain akademik UIN SMH Banten. Diurutkan alfabetis.

### Akun Mahasiswa
Identitas digital mahasiswa di SILA yang terkait dengan record di tabel `mahasiswa`. Mahasiswa login dengan email/NIM dan password.

### Alumni
Mahasiswa yang telah menyelesaikan studi (lulus). Di SILA, mahasiswa dengan `mahasiswa.status_mahasiswa = 'alumni'`. Alumni tetap bisa login untuk mengajukan layanan AK-03 (Pernah Kuliah).

### Berita Acara
Dokumen formal yang dibuat setelah pelaksanaan kegiatan (mis. sidang, ujian). Berisi catatan kronologis, hasil keputusan, dan tanda tangan pihak terlibat. Di SILA, dihasilkan otomatis untuk TA-03, TA-04, TA-05 setelah nilai diinput.

### Dekan
Pimpinan tertinggi Fakultas Ushuluddin dan Adab. Di SILA, dosen dengan `structural_positions.position_code = 'dekan'` yang aktif. Memiliki kewenangan TTD final untuk: TA-02, TA-05, AK-03, AK-06, AK-07.

### Dosen Pembimbing Akademik (PA)
Dosen yang ditugaskan membimbing mahasiswa **dalam hal akademik umum** (bukan skripsi). Ditetapkan **di luar SILA**, mahasiswa hanya memilih dari daftar dosen saat pertama kali mengajukan TA-01. Di SILA, dosen dengan assignment `dosen_pa` untuk mahasiswa tertentu.

**Catatan penting**: PA berbeda dengan Pembimbing Skripsi.

### Dosen Pembimbing Skripsi (Pembimbing 1 & 2)
Dosen yang ditugaskan membimbing **penyusunan skripsi mahasiswa**. Pembimbing 1 = Pembimbing Utama, Pembimbing 2 = Pembimbing Pembantu. Ditetapkan oleh Sekprodi di TA-02. Di SILA, dosen dengan assignment `pembimbing_skripsi_1` atau `pembimbing_skripsi_2`.

**Penting**: Pembimbing Skripsi **TIDAK** masuk workflow approval SILA. Tugas bimbingan dilakukan di luar sistem.

### Dosen Penguji
Dosen yang ditugaskan menguji mahasiswa di sidang. Ada 3 jenis penguji di SILA:

- **Penguji Proposal** (TA-03): 2 dosen
- **Penguji Komprehensif** (TA-04): 2 dosen — Penguji Keahlian Prodi + Penguji Keislaman
- **Penguji Skripsi** (TA-05): 2 dosen (bagian dari majelis 6 dosen)

### IPK (Indeks Prestasi Kumulatif)
Rata-rata bobot nilai seluruh mata kuliah yang sudah ditempuh. Skala 0.00 - 4.00. Phase 1 SILA **tidak** validasi IPK secara otomatis (manual oleh staff).

### Judul Skripsi
**Entitas independen** di SILA (living entity), tercatat di tabel `judul_skripsi`. Lahir saat TA-01 (PA pilih 1 dari 3-5 judul). Bisa berubah lintas layanan dengan riwayat tersimpan di `judul_skripsi_history`.

### Kabag (Kepala Bagian Tata Usaha)
Pegawai pimpinan administrasi fakultas. Di SILA, pegawai dengan `structural_positions.position_code = 'kabag_tu'` yang aktif. **Atasan dari staff_prodi dan staff_akademik**. Verifikator approval untuk semua layanan akademik (AK).

### Kaprodi (Ketua Program Studi)
Dosen pimpinan program studi. Di SILA, dosen dengan `structural_positions.position_code = 'kaprodi'` yang aktif. Memiliki kewenangan approval di TA-01.

### Kepala Lab (Kepala Laboratorium Multimedia)
Dosen pengelola lab. Di SILA, dosen dengan `structural_positions.position_code = 'kepala_lab'` yang aktif. Penandatangan untuk TA-06 Cek Turnitin.

### KHS (Kartu Hasil Studi)
Dokumen yang berisi nilai mahasiswa untuk satu semester. Dokumen wajib upload di beberapa layanan TA.

### KRS (Kartu Rencana Studi)
Dokumen yang berisi mata kuliah yang diambil mahasiswa di satu semester. Dokumen wajib upload di beberapa layanan TA.

### Majelis Sidang
Komposisi dosen yang menjalankan sidang ujian skripsi (TA-05). Terdiri dari **6 dosen**:

1. **Ketua Sidang** (1 dosen)
2. **Sekretaris Sidang** (1 dosen)
3. **Pembimbing 1** (1 dosen)
4. **Pembimbing 2** (1 dosen)
5. **Penguji 1** (1 dosen)
6. **Penguji 2** (1 dosen)

Ditetapkan oleh Sekprodi di TA-05.

### Munaqasyah
Istilah untuk Ujian Skripsi (sidang skripsi) di PTKIN. Setara dengan "sidang skripsi" di kampus umum. Di SILA: TA-05.

### Pegawai (Tenaga Kependidikan / Tendik)
Karyawan non-dosen yang bekerja di administrasi fakultas. Di SILA, profile type `pegawai`. Termasuk: Staff Prodi, Staff Akademik, Kabag.

### Pengajuan Layanan
Permohonan layanan yang diajukan mahasiswa. Tercatat di tabel `pengajuan_layanan` dengan kode unik (mis. `TA-2026-0023`). Setiap pengajuan punya status, history, dan workflow.

### Pejabat Struktural
Dosen atau pegawai yang menjabat posisi struktural di fakultas. Di SILA, tercatat di tabel `structural_positions` dengan masa berlaku (`start_date`, `end_date`). Pejabat struktural: Sekprodi, Kaprodi, WD1, Dekan, Kabag TU, Kepala Lab.

### PTKIN (Perguruan Tinggi Keagamaan Islam Negeri)
Kategori perguruan tinggi yang dikelola Kementerian Agama. UIN, IAIN, STAIN termasuk PTKIN. UIN SMH Banten adalah PTKIN.

### Semester
Periode akademik di SILA. Punya tipe `ganjil` atau `genap`, tahun akademik (mis. 2025/2026). Tercatat di tabel `academic_periods`. Hanya 1 yang berstatus `active` pada satu waktu.

### Sempro (Seminar Proposal)
Sidang awal sebelum penyusunan skripsi penuh. Mahasiswa mempresentasikan proposal skripsi ke penguji. Di SILA: TA-03.

### Sekprodi (Sekretaris Program Studi)
Dosen pendamping Kaprodi. Di SILA, dosen dengan `structural_positions.position_code = 'sekprodi'` yang aktif. **Kewenangan utama**:
- TA-02: Penetapan Pembimbing 1 & 2
- TA-03 & TA-04: Penetapan Penguji 1 & 2
- TA-05: Penjadwalan + Penetapan Majelis (6 dosen)

### SK (Surat Keputusan)
Dokumen resmi yang menetapkan sesuatu (mis. SK Pembimbing Skripsi di TA-02). Punya format penomoran khusus dengan kode klasifikasi.

### SKS (Satuan Kredit Semester)
Beban studi mata kuliah. Phase 1 SILA **tidak** validasi SKS secara otomatis (manual oleh staff).

### Skripsi
Karya tulis ilmiah tugas akhir untuk meraih gelar Sarjana (S1).

### Staff Akademik
Pegawai administrasi tingkat fakultas. Di SILA, user dengan `system_role = 'staff_akademik'`. Verifikator awal untuk semua layanan akademik (AK).

### Staff Prodi
Pegawai administrasi tingkat program studi. Di SILA, user dengan `system_role = 'staff_prodi'` dan atribut `prodi_id`. Verifikator awal untuk semua layanan TA. **Hanya melayani mahasiswa dari prodinya saja**.

### Tahun Akademik
Periode 1 tahun akademik (Juli/Agustus - Juni/Juli). Format: `2025/2026`. Berisi 2 semester (Ganjil + Genap).

### Tugas Akhir (TA)
Kategori layanan terkait skripsi. Di SILA: TA-01 sampai TA-06. Scope: Prodi.

### Turnitin
Software cek plagiarisme. Di SILA: TA-06 Cek Turnitin. Mahasiswa submit skripsi ke Turnitin sendiri, lalu input hasil similarity ke SILA.

### Verifikator
Role yang melakukan **review & validasi** terhadap pengajuan, bukan hanya approve/reject. Di SILA, verifikator termasuk: Staff Prodi, Staff Akademik, Kabag, dan beberapa role lain saat melakukan validasi konten.

### Wakil Dekan 1 (WD1)
Wakil Dekan Bidang Akademik dan Kelembagaan. Di SILA, dosen dengan `structural_positions.position_code = 'wakil_dekan_1'` yang aktif. Penandatangan untuk: TA-01, TA-03, TA-04, AK-01, AK-02, AK-04, AK-05.

**Penting**: Hanya WD1 (akademik) yang relevan untuk SILA. WD2 (administrasi) dan WD3 (kemahasiswaan) tidak terlibat.

### Yudisium
Penentuan kelulusan dengan predikat. Di SILA, dihasilkan setelah TA-05 (Ujian Skripsi). Predikat: MEMUASKAN / SANGAT MEMUASKAN / PUJIAN.

---

## 1.2 Glossary Istilah Sistem SILA

Istilah teknis yang spesifik untuk sistem SILA.

### Academic Period
Lihat: Semester.

### Action (Workflow Action)
Tindakan yang bisa dilakukan approver di suatu step workflow. Daftar action: `approve`, `reject_to_step`, `terminate`, `select_judul`, `submit`, `resubmit`, `sign`. Detail di Bagian 3.5.

### Approver
User yang punya kewenangan untuk approve/reject di suatu step workflow. Approver bisa: Staff Prodi, Staff Akademik, Kabag, PA, Kaprodi, Sekprodi, WD1, Dekan, Kepala Lab (tergantung layanan & step).

### Arsip Dokumen
Dokumen pengajuan yang sudah berstatus `selesai`. Tidak ada tabel terpisah, hanya filter status. Per role bisa akses arsip sesuai kewenangan (lihat dokumen 01 Section 12).

### Assignment
Penugasan dinamis untuk konteks spesifik. Tercatat di tabel `assignments`. Dipakai untuk: Dosen PA, Pembimbing Skripsi, Penguji, Ketua/Sekretaris Sidang, Pembimbing Observasi/Magang. Detail di Bagian 3.3.

### Bypass (Bypass Mode)
Mekanisme khusus TA-01 ketika PA tidak respon dalam SLA. Sistem auto-generate formulir bypass, mahasiswa offline ke PA untuk TTD basah, lalu upload. Workflow lanjut ke Kaprodi (skip step PA di sistem). Detail di dokumen BPMN TA-01.

### Counter Penomoran
Sistem penghitung nomor surat. Reset per semester. Bisa per fakultas atau per prodi (tergantung jenis surat). Lihat dokumen 01 Section 8.

### Dual Numbering
Khusus TA-02 SK Pembimbing: dokumen menampilkan 2 nomor — Nomor SK Fakultas + Nomor Surat Permohonan Prodi.

### Form Builder
Fitur admin panel untuk mengatur field input mahasiswa per layanan (database-driven). Bisa atur: tipe field, validasi, kondisional, urutan.

### Klasifikasi Arsip (Kode Klasifikasi Surat)
Kode standar dalam format penomoran surat. Bervariasi per jenis layanan. Contoh: `PP.00.9` (Pendidikan & Pengajaran), `KP.01.2` (Kepegawaian).

### Layanan
Jenis pelayanan yang disediakan SILA. Total 13 layanan: 6 TA + 7 AK. Tercatat di tabel `jenis_layanan`.

### Live Preview Document
Fitur PDF preview yang tersedia sejak awal pengajuan, dengan placeholder bertanda kuning untuk field yang belum final. Inspired by Srikandi.

### Living Entity
Entitas yang bisa berubah lintas waktu dengan riwayat tersimpan. Di SILA: Judul Skripsi adalah living entity.

### Multi-Hat (Multi-Role)
Karakteristik user (terutama dosen) yang punya banyak peran sekaligus (mis. Kaprodi + PA + Pembimbing Skripsi). UX SILA menggunakan Contextual UI untuk akomodir ini.

### Pengajuan Versi
Snapshot data pengajuan saat tertentu, untuk versioning. Tercatat di tabel `pengajuan_versi`. Versi baru tercipta saat mahasiswa resubmit setelah rejection.

### Penomoran Reserved
Strategi penomoran ala Srikandi: nomor surat di-reserve sejak pengajuan dibuat (bukan saat TTD final). Jika dibatalkan, ditandai VOID.

### Profile
Identitas asli user (Dosen/Pegawai/Mahasiswa). Tercatat di tabel terpisah (`dosen`, `pegawai`, `mahasiswa`). Berbeda dengan `users` (auth saja).

### Profile Separation
Pola desain database SILA: tabel `users` untuk auth saja, terpisah dari tabel profil (`dosen`, `pegawai`, `mahasiswa`). Relasi pakai Nullable FK.

### Reject Bertingkat
Mekanisme reject di SILA untuk pejabat atas (Dekan/WD1): tidak boleh kembalikan langsung ke mahasiswa. Harus pilih role di bawah (Staff Prodi/Sekprodi/Kaprodi/PA). Detail di dokumen 01 Section 5.3.

### Scope (Scope Filtering)
Pembatasan akses data berdasarkan kewenangan user. SILA pakai 2 scope level: `fakultas` dan `prodi`. Detail di dokumen 01 Section 3.8.

### SLA (Service Level Agreement)
Batas waktu untuk approver bertindak di suatu step. Jika terlewat, sistem trigger notifikasi reminder atau bypass (khusus TA-01).

### State (Status Pengajuan)
Posisi pengajuan dalam workflow. Daftar state lengkap di Bagian 3.4.

### Step (Workflow Step)
Tahap dalam workflow layanan. Tiap step ada actor, action, dan transisi yang valid.

### Structural Position
Jabatan struktural yang dipegang dosen atau pegawai. Punya masa berlaku. Daftar di Bagian 3.2.

### System Role
Role utama user yang menentukan akses fitur. Total 6 system role. Daftar di Bagian 3.1.

### Token Verifikasi
Kode 12-16 karakter yang tercetak di dokumen, untuk verifikasi keaslian via halaman publik (scan QR Code → input token).

### TTD Scan
Gambar tanda tangan scan pejabat yang di-upload ke sistem, lalu di-embed otomatis ke dokumen saat pejabat klik "Tanda Tangan". Bukan TTE tersertifikasi BSrE.

### Workflow Engine
Komponen sistem yang mengatur transisi pengajuan antar step. Configurable per layanan via admin panel.

---

## 1.3 Glossary Istilah Teknis (Stack-Specific)

Istilah teknis yang relevan dengan stack Next.js + TypeScript + Prisma/Drizzle.

### App Router
Sistem routing Next.js (versi 13+) yang berbasis folder. SILA menggunakan App Router.

### Drizzle (Drizzle ORM)
TypeScript ORM alternatif Prisma. Lebih lightweight, SQL-first.

### Eloquent
ORM bawaan Laravel. **TIDAK** dipakai di SILA (untuk referensi saja jika ada migration dari sistem lama).

### Migration
File SQL/code yang mendefinisikan perubahan skema database (create table, alter column, dll). Di Prisma: `prisma/migrations/`.

### ORM (Object-Relational Mapping)
Library yang abstraksi query database jadi object/function. SILA pakai Prisma atau Drizzle.

### Prisma
TypeScript ORM populer untuk Next.js. Type-safe, mature ecosystem. Salah satu kandidat ORM untuk SILA.

### RBAC (Role-Based Access Control)
Sistem otorisasi berbasis role user. SILA pakai RBAC untuk akses fitur.

### ReBAC (Relationship-Based Access Control)
Sistem otorisasi berbasis relasi (mis. "user A bisa akses resource X karena dia jadi pembimbing"). SILA pakai ReBAC untuk konteks Assignment.

### RLS (Row-Level Security)
Filter data otomatis di level database row, berdasarkan user. Di PostgreSQL bisa di-enable native. Di SILA, RLS bisa diimplementasi via Prisma middleware atau di application layer.

### Seed Data
Data awal yang di-insert ke database saat setup (mis. admin user, kode klasifikasi, dll). File: `prisma/seed.ts`.

### Server Action (Next.js)
Function yang dijalankan di server, bisa di-trigger dari client component. Di SILA dipakai untuk submit form, action workflow, dll.

### Server Component (Next.js)
React component yang di-render di server. Default di App Router. Untuk fetch data tanpa expose API key.

### Webhook
HTTP endpoint yang dipanggil sistem lain. Di SILA Phase 1 tidak ada webhook publik.

---

## 1.4 Glossary Kode Klasifikasi Surat

Kode standar di nomenklatur surat resmi Kementerian Agama. Yang relevan untuk SILA:

| Kode | Nama | Untuk Layanan |
|---|---|---|
| `PP.00.9` | Pendidikan dan Pengajaran - Akademik | TA-01, TA-03, TA-04, AK-01 s.d. AK-07 (umum) |
| `KP.01.2` | Kepegawaian - SK Pengangkatan | TA-02 (SK Pembimbing) |
| `TL.00` | Penelitian | AK-05 (Pengantar Penelitian) |
| `KS.01` | Kerjasama | AK-06 (Permohonan Magang) |

> **Catatan**: Kode klasifikasi ini perlu **divalidasi** dengan Tim TU UIN SMH Banten. Beberapa kampus punya konvensi sendiri.

---

# Bagian 2: Naming Convention

## 2.1 Database Naming

### Tabel

**Aturan**:
- Format: `snake_case`
- Jumlah: **plural** (lebih dari satu)
- Bahasa: Indonesia jika domain bisnis, Inggris untuk teknis
- Tidak boleh prefix `tbl_` atau `t_`

**Contoh BENAR**:
- `pengajuan_layanan`
- `judul_skripsi`
- `dosen`
- `mahasiswa`
- `academic_periods`
- `structural_positions`
- `notifications`

**Contoh SALAH**:
- `Pengajuan` (PascalCase) ❌
- `pengajuanLayanan` (camelCase) ❌
- `tbl_pengajuan` (prefix) ❌
- `pengajuan` (singular) ❌

### Kolom

**Aturan**:
- Format: `snake_case`
- Bahasa: Indonesia jika domain bisnis, Inggris untuk teknis
- Boolean: prefix `is_`, `has_`, `can_`
- Timestamp: `created_at`, `updated_at`, `deleted_at` (soft delete)

**Contoh BENAR**:
- `nama_lengkap`
- `tanggal_lahir`
- `status_mahasiswa`
- `is_active`
- `has_completed`
- `created_at`

**Contoh SALAH**:
- `namaLengkap` ❌
- `NAMA_LENGKAP` ❌
- `tgl_lahir` (singkatan tidak konsisten) ❌
- `aktif` (boolean tanpa prefix) ❌

### Primary Key

**Aturan**: Selalu `id`, tipe `Int` atau `BigInt` (auto-increment).

```typescript
// Prisma example
model Mahasiswa {
  id Int @id @default(autoincrement())
  // ...
}
```

### Foreign Key

**Aturan**: `[table_singular]_id`

**Contoh**:
- FK ke `dosen` → `dosen_id`
- FK ke `mahasiswa` → `mahasiswa_id`
- FK ke `academic_periods` → `academic_period_id` (singular dari nama tabel)
- FK ke `pengajuan_layanan` → `pengajuan_layanan_id`

### Junction/Pivot Table

**Aturan**: Gabungan dua tabel terkait, urut alfabetis.

**Contoh**:
- `dosen_assignments` (gabungan dosen + assignments)
- `mahasiswa_layanan_terdaftar`

### Enum Column

**Aturan**: Definisikan enum di Prisma/Drizzle schema, value berupa snake_case string.

```typescript
// Prisma example
enum StatusMahasiswa {
  aktif
  cuti
  alumni
  do
  keluar
}
```

### Index

**Aturan**: `idx_[table]_[column1]_[column2]`

**Contoh**:
- `idx_pengajuan_layanan_status`
- `idx_users_email`

---

## 2.2 TypeScript Naming

### Variable & Function

**Aturan**: `camelCase`

```typescript
// BENAR
const namaLengkap = "Ahmad";
function generateNomorSurat() { ... }

// SALAH
const nama_lengkap = "Ahmad"; // ❌ (snake_case di TS)
const NamaLengkap = "Ahmad"; // ❌ (PascalCase untuk variable)
```

### Class & React Component

**Aturan**: `PascalCase`

```typescript
// BENAR
class PengajuanService { ... }
function PengajuanCard() { return <div /> }

// SALAH
class pengajuanService { ... } // ❌
function pengajuan_card() { ... } // ❌
```

### Constant

**Aturan**: `UPPER_SNAKE_CASE` untuk konstanta yang truly constant (tidak akan berubah).

```typescript
// BENAR
const MAX_UPLOAD_SIZE_MB = 10;
const DEFAULT_SLA_DAYS = 7;

// Untuk objek yang sifatnya configuration tapi tidak benar-benar konstan
const config = { ... }; // tetap camelCase
```

### Type & Interface

**Aturan**: `PascalCase`. Pilih satu konvensi:

**Opsi A**: Interface prefix `I` (Java/.NET style)
```typescript
interface IMahasiswa { ... }
```

**Opsi B**: Tanpa prefix, suffix `Type` jika perlu beda dengan class (rekomendasi)
```typescript
interface Mahasiswa { ... } // primary
type StatusMahasiswaType = "aktif" | "cuti" | ...; // untuk union types
```

**Pilihan SILA**: **Opsi B** (tanpa prefix `I`, modern TypeScript convention)

### Enum

**Aturan**: Nama enum `PascalCase`, value `snake_case` string (konsisten dengan database).

```typescript
// BENAR
enum StatusPengajuan {
  draft = "draft",
  pending_staff_prodi = "pending_staff_prodi",
  selesai = "selesai"
}

// Atau pakai const assertion (more modern)
const StatusPengajuan = {
  DRAFT: "draft",
  PENDING_STAFF_PRODI: "pending_staff_prodi",
  SELESAI: "selesai"
} as const;
```

### Boolean Variable

**Aturan**: prefix `is`, `has`, `can`, `should`.

```typescript
const isActive = true;
const hasCompleted = false;
const canApprove = checkPermission();
const shouldNotify = true;
```

### Event Handler

**Aturan**: prefix `handle` atau `on`.

```typescript
// Component prop
<Button onClick={handleSubmit} />

// Internal function
function handleSubmit() { ... }

// Prop name
type Props = {
  onSelect: (id: number) => void;
};
```

---

## 2.3 File & Folder Naming

### Folder

**Aturan**:
- Format: `kebab-case`
- Plural jika berisi multiple file sejenis

**Contoh**:
- `components/`
- `pengajuan-layanan/`
- `api/`
- `lib/utils/`

### Component File

**Aturan**: `PascalCase.tsx`

```
PengajuanCard.tsx
PengajuanList.tsx
MahasiswaProfileCard.tsx
```

### Utility / Service File

**Aturan**: `kebab-case.ts`

```
format-tanggal.ts
generate-nomor-surat.ts
calculate-yudisium.ts
```

### Hook File

**Aturan**: `use-[name].ts`

```
use-pengajuan.ts
use-current-user.ts
```

### Page Route (Next.js App Router)

**Aturan**:
- Folder: `kebab-case`
- File: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

```
app/
  dashboard/
    page.tsx
  pengajuan/
    [id]/
      page.tsx
  pengajuan-baru/
    page.tsx
```

### API Route

**Aturan**:
- Folder: `kebab-case`
- File: `route.ts`

```
app/
  api/
    pengajuan/
      route.ts
      [id]/
        route.ts
    auth/
      login/
        route.ts
```

### Test File

**Aturan**: `[same-as-source].test.ts` atau `[same-as-source].spec.ts`

```
generate-nomor-surat.ts
generate-nomor-surat.test.ts
```

---

## 2.4 Bahasa Penamaan

**Aturan**:

| Konteks | Bahasa | Alasan |
|---|---|---|
| Tabel & kolom database (domain bisnis) | Indonesia | Sesuai domain |
| Tabel & kolom database (teknis) | Inggris | Sesuai standar dev |
| Variable & function TypeScript | Inggris | Sesuai standar dev |
| Component name | Inggris (jika generic) atau Indonesia (jika domain) | Mixed sesuai konteks |
| Komentar di code | Indonesia atau Inggris (konsisten per file) | Tim friendly |
| Commit message | Inggris | Standar |
| User-facing UI text | Indonesia | Untuk user kampus |
| Error message (untuk user) | Indonesia | Untuk user kampus |
| Error message (untuk log) | Inggris | Untuk debugging |
| API endpoint | Inggris | Standar REST |
| URL slug | Indonesia atau Inggris (pilih satu konsisten) | UX consideration |

**Pilihan SILA untuk URL slug**: **Indonesia** (lebih natural untuk user kampus).

Contoh:
- ✅ `/dashboard`
- ✅ `/pengajuan/123`
- ✅ `/pengajuan-baru`
- ✅ `/profil-saya`

---

# Bagian 3: Enum & Status Standardization

> **PENTING untuk AI Agent**: Semua enum di bagian ini adalah **AUTHORITATIVE**. AI Agent **TIDAK BOLEH** invent value baru. Jika butuh value baru, harus dibahas dulu dan dokumen ini di-update.

## 3.1 System Roles

Total: 6 role.

| Kode (string value) | Display Name | Profile Type | Scope |
|---|---|---|---|
| `mahasiswa` | Mahasiswa | mahasiswa | Individual |
| `dosen` | Dosen | dosen | Individual |
| `staff_prodi` | Staff Program Studi | pegawai | Per Prodi (atribut `prodi_id`) |
| `staff_akademik` | Staff Akademik | pegawai | Fakultas |
| `kabag` | Kepala Bagian | pegawai | Fakultas |
| `super_admin` | Super Admin | pegawai/dosen | Sistem |

**TypeScript Definition**:

```typescript
const SystemRole = {
  MAHASISWA: "mahasiswa",
  DOSEN: "dosen",
  STAFF_PRODI: "staff_prodi",
  STAFF_AKADEMIK: "staff_akademik",
  KABAG: "kabag",
  SUPER_ADMIN: "super_admin"
} as const;

type SystemRoleType = typeof SystemRole[keyof typeof SystemRole];
```

**Database Enum** (Prisma):

```typescript
enum SystemRole {
  mahasiswa
  dosen
  staff_prodi
  staff_akademik
  kabag
  super_admin
}
```

---

## 3.2 Structural Positions

Total: 6 position.

| Kode (string value) | Display Name | Holder Type | Scope |
|---|---|---|---|
| `sekprodi` | Sekretaris Program Studi | dosen | Per Prodi |
| `kaprodi` | Ketua Program Studi | dosen | Per Prodi |
| `wakil_dekan_1` | Wakil Dekan 1 | dosen | Fakultas |
| `dekan` | Dekan | dosen | Fakultas |
| `kabag_tu` | Kepala Bagian Tata Usaha | pegawai | Fakultas |
| `kepala_lab` | Kepala Laboratorium | dosen | Fakultas (Lab) |

**TypeScript Definition**:

```typescript
const StructuralPosition = {
  SEKPRODI: "sekprodi",
  KAPRODI: "kaprodi",
  WAKIL_DEKAN_1: "wakil_dekan_1",
  DEKAN: "dekan",
  KABAG_TU: "kabag_tu",
  KEPALA_LAB: "kepala_lab"
} as const;

type StructuralPositionType = typeof StructuralPosition[keyof typeof StructuralPosition];
```

---

## 3.3 Assignment Types

Total: 11 assignment type.

| Kode (string value) | Display Name | Context Type |
|---|---|---|
| `dosen_pa` | Dosen Pembimbing Akademik | mahasiswa |
| `pembimbing_skripsi_1` | Pembimbing Skripsi 1 (Utama) | pengajuan_ta |
| `pembimbing_skripsi_2` | Pembimbing Skripsi 2 (Pembantu) | pengajuan_ta |
| `penguji_proposal` | Penguji Seminar Proposal | sidang_proposal |
| `penguji_komprehensif_prodi` | Penguji Keahlian Prodi (Komprehensif) | sidang_komprehensif |
| `penguji_komprehensif_keislaman` | Penguji Keislaman (Komprehensif) | sidang_komprehensif |
| `penguji_skripsi` | Penguji Ujian Skripsi | sidang_munaqasyah |
| `ketua_sidang` | Ketua Sidang Munaqasyah | sidang_munaqasyah |
| `sekretaris_sidang` | Sekretaris Sidang Munaqasyah | sidang_munaqasyah |
| `dosen_pembimbing_observasi` | Dosen Pembimbing Observasi | pengajuan_observasi |
| `dosen_pembimbing_magang` | Dosen Pembimbing Magang | pengajuan_magang |

---

## 3.4 Status Pengajuan

Total: 15 status (komprehensif untuk semua layanan).

### 3.4.1 Daftar Status

| Kode | Display Name | Deskripsi | Kategori |
|---|---|---|---|
| `draft` | Draft | Mahasiswa belum submit (form masih bisa diedit) | Belum aktif |
| `submitted` | Diajukan | Baru submit, sebelum masuk antrian approval | Aktif |
| `pending_staff_prodi` | Menunggu Staff Prodi | Antri di Staff Prodi | Aktif |
| `pending_staff_akademik` | Menunggu Staff Akademik | Antri di Staff Akademik | Aktif |
| `pending_pa` | Menunggu PA | Antri di Dosen Pembimbing Akademik | Aktif |
| `pending_kaprodi` | Menunggu Kaprodi | Antri di Kaprodi | Aktif |
| `pending_sekprodi` | Menunggu Sekprodi | Antri di Sekprodi | Aktif |
| `pending_kabag` | Menunggu Kabag | Antri di Kabag | Aktif |
| `pending_wd1` | Menunggu Wakil Dekan 1 | Antri di WD1 | Aktif |
| `pending_dekan` | Menunggu Dekan | Antri di Dekan | Aktif |
| `pending_kepala_lab` | Menunggu Kepala Lab | Antri di Kepala Lab (khusus TA-06) | Aktif |
| `bypass_active` | Mode Bypass | PA tidak respon, bypass aktif (khusus TA-01) | Aktif |
| `revision_required` | Perlu Revisi | Dikembalikan ke mahasiswa untuk revisi | Aktif |
| `selesai` | Selesai | Dokumen final terbit, masuk arsip | Final |
| `terminated` | Dibatalkan | Pengajuan dibatalkan permanen | Final |

**Catatan untuk pending_pa**: Ini adalah state ketika menunggu **PA** (Pembimbing Akademik) selesai dengan judul, BUKAN saat menunggu pembimbing skripsi (pembimbing skripsi tidak masuk workflow).

### 3.4.2 TypeScript Definition

```typescript
const StatusPengajuan = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  PENDING_STAFF_PRODI: "pending_staff_prodi",
  PENDING_STAFF_AKADEMIK: "pending_staff_akademik",
  PENDING_PA: "pending_pa",
  PENDING_KAPRODI: "pending_kaprodi",
  PENDING_SEKPRODI: "pending_sekprodi",
  PENDING_KABAG: "pending_kabag",
  PENDING_WD1: "pending_wd1",
  PENDING_DEKAN: "pending_dekan",
  PENDING_KEPALA_LAB: "pending_kepala_lab",
  BYPASS_ACTIVE: "bypass_active",
  REVISION_REQUIRED: "revision_required",
  SELESAI: "selesai",
  TERMINATED: "terminated"
} as const;

type StatusPengajuanType = typeof StatusPengajuan[keyof typeof StatusPengajuan];
```

### 3.4.3 State Machine (Transisi Valid)

Ini hanya **contoh untuk TA-01**. Setiap layanan punya state machine sendiri (detail di dokumen BPMN masing-masing).

```
draft → submitted → pending_staff_prodi
pending_staff_prodi → pending_pa (approve)
pending_staff_prodi → revision_required (reject)
pending_pa → pending_kaprodi (PA pilih judul)
pending_pa → bypass_active (SLA terlewat)
pending_pa → revision_required (PA reject)
bypass_active → pending_kaprodi (mahasiswa upload form bypass)
pending_kaprodi → pending_wd1 (approve)
pending_kaprodi → pending_pa (reject ke previous)
pending_kaprodi → revision_required (reject ke mahasiswa)
pending_wd1 → selesai (sign)
pending_wd1 → pending_kaprodi atau pending_pa atau pending_staff_prodi (reject pilih role)
revision_required → submitted (mahasiswa resubmit)
(any) → terminated (admin force)
```

---

## 3.5 Workflow Actions

Daftar action yang bisa dilakukan approver di workflow step.

| Kode | Display Name | Parameter Wajib | Contoh Penggunaan |
|---|---|---|---|
| `submit` | Submit Pengajuan | data input + dokumen | Mahasiswa first submit |
| `resubmit` | Submit Ulang | data update | Mahasiswa setelah revisi |
| `approve` | Setujui | catatan (opsional) | Staff/Kaprodi/Kabag approve |
| `select_judul` | Pilih Judul | `selected_judul_id` + catatan | PA di TA-01 |
| `reject_to_step` | Tolak ke Step | `target_step` + alasan (wajib) | Dekan/WD1 reject bertingkat |
| `sign` | Tanda Tangan | PIN/konfirmasi | WD1/Dekan TTD final |
| `terminate` | Batalkan | alasan (wajib) | Admin force terminate |

**TypeScript Definition**:

```typescript
const WorkflowAction = {
  SUBMIT: "submit",
  RESUBMIT: "resubmit",
  APPROVE: "approve",
  SELECT_JUDUL: "select_judul",
  REJECT_TO_STEP: "reject_to_step",
  SIGN: "sign",
  TERMINATE: "terminate"
} as const;
```

---

## 3.6 Status Mahasiswa

| Kode | Display Name | Deskripsi |
|---|---|---|
| `aktif` | Aktif | Mahasiswa terdaftar dan aktif kuliah |
| `cuti` | Cuti Akademik | Mahasiswa cuti akademik resmi |
| `alumni` | Alumni | Mahasiswa sudah lulus |
| `do` | Drop Out | Mahasiswa dikeluarkan karena tidak memenuhi syarat akademik |
| `keluar` | Mengundurkan Diri | Mahasiswa mengundurkan diri |

```typescript
const StatusMahasiswa = {
  AKTIF: "aktif",
  CUTI: "cuti",
  ALUMNI: "alumni",
  DO: "do",
  KELUAR: "keluar"
} as const;
```

---

## 3.7 Status Academic Period

| Kode | Display Name | Deskripsi |
|---|---|---|
| `upcoming` | Akan Datang | Semester belum dimulai |
| `active` | Aktif | Semester sedang berlangsung (hanya 1 yang `active` pada satu waktu) |
| `completed` | Selesai | Semester sudah berakhir (arsip) |

---

## 3.8 Tipe Semester

| Kode | Display Name |
|---|---|
| `ganjil` | Ganjil |
| `genap` | Genap |

---

## 3.9 Notification Channel

| Kode | Display Name | Status di Phase 1 |
|---|---|---|
| `in_app` | In-App Notification | Active (selalu) |
| `email` | Email | Active (user toggle) |
| `whatsapp` | WhatsApp | Future (optional) |

---

## 3.10 Notification Severity

| Kode | Display Name | Behavior |
|---|---|---|
| `info` | Informasi | Notifikasi biasa, low priority |
| `success` | Sukses | Konfirmasi action sukses |
| `warning` | Peringatan | Reminder, mendekati SLA |
| `urgent` | Mendesak | Lewat SLA, butuh action segera |

---

## 3.11 Hasil Sidang

### 3.11.1 Hasil Seminar Proposal (TA-03)

| Kode | Display Name |
|---|---|
| `layak` | LAYAK |
| `tidak_layak` | TIDAK LAYAK |

### 3.11.2 Hasil Ujian Komprehensif (TA-04)

| Kode | Display Name |
|---|---|
| `lulus` | LULUS |
| `tidak_lulus` | TIDAK LULUS |

### 3.11.3 Hasil Ujian Skripsi (TA-05) — Yudisium

| Kode | Display Name | Range IPK |
|---|---|---|
| `memuaskan` | MEMUASKAN | 2.76 - 3.00 |
| `sangat_memuaskan` | SANGAT MEMUASKAN | 3.01 - 3.50 |
| `pujian` | PUJIAN (Cumlaude) | > 3.51 |
| `tidak_lulus` | TIDAK LULUS | - |

> **Catatan**: Range IPK perlu validasi dengan kebijakan UIN SMH Banten. Bisa berbeda dengan range umum di atas.

---

## 3.12 Kategori Layanan

| Kode | Display Name | Scope |
|---|---|---|
| `tugas_akhir` | Tugas Akhir (TA) | Prodi |
| `akademik` | Akademik (AK) | Fakultas |

---

## 3.13 Tipe Field (Form Builder)

Daftar tipe field yang didukung Form Builder admin.

| Kode | Display Name | Komponen UI |
|---|---|---|
| `text` | Text Singkat | `<input type="text" />` |
| `textarea` | Text Panjang | `<textarea />` |
| `number` | Angka | `<input type="number" />` |
| `date` | Tanggal | Date picker |
| `datetime` | Tanggal & Waktu | Datetime picker |
| `time` | Waktu | Time picker |
| `select` | Dropdown Pilihan | `<select />` |
| `multi_select` | Dropdown Multi-Pilih | Multi-select |
| `radio` | Radio Group | Radio buttons |
| `checkbox` | Checkbox | `<input type="checkbox" />` |
| `file` | Upload File | File input |
| `repeater` | Repeater (Multi-value) | Dynamic add/remove |
| `dosen_picker` | Pilih Dosen | Custom: searchable dropdown dari data dosen |
| `mahasiswa_picker` | Pilih Mahasiswa | Custom: searchable dropdown dari data mahasiswa |

---

## 3.14 Tipe Dokumen Persyaratan

Format file yang diterima untuk upload.

| Kode | MIME Type | Extension |
|---|---|---|
| `pdf` | `application/pdf` | `.pdf` |
| `jpg` | `image/jpeg` | `.jpg`, `.jpeg` |
| `png` | `image/png` | `.png` |
| `docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |

> **Catatan Phase 1**: Default hanya `pdf`, `jpg`, `png`. `docx` dipertimbangkan untuk Phase 2.

---

## Action Items untuk Anda

Hal yang perlu Anda validasi sebelum lanjut ke Batch 2:

| No | Action | Catatan |
|---|---|---|
| 1 | Konfirmasi kode klasifikasi surat (Section 1.4) | Cek dengan Tim TU UIN SMH Banten |
| 2 | Konfirmasi range IPK untuk Yudisium (Section 3.11.3) | Cek dengan WD1 |
| 3 | Konfirmasi bahasa untuk URL slug (Indonesia atau Inggris) | Saya pilih Indonesia, bisa diubah |
| 4 | Konfirmasi pilihan TypeScript Type/Interface (prefix `I` atau tanpa) | Saya pilih tanpa prefix |
| 5 | Apakah ada status pengajuan yang missing | Cek daftar di Section 3.4 |
| 6 | Apakah ada assignment type yang missing | Cek daftar di Section 3.3 |

---

## Lanjut ke Batch 2

Setelah Anda review Batch 1, saya akan lanjut ke **Batch 2** yang mencakup:
- **Bagian 4**: Error Handling Convention
- **Bagian 5**: API Response Format
- **Bagian 6**: Date, Time, Number Format
- **Bagian 7**: File Storage Convention

---

*Dokumen ini adalah AUTHORITATIVE SOURCE untuk terminologi, naming, dan enum SILA. Semua dokumen lain wajib mengacu ke sini.*
