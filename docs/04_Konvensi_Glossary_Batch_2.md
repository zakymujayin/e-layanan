# Dokumen Konvensi & Glossary SILA — Batch 2

**Sistem**: SILA — Fakultas Ushuluddin dan Adab, UIN SMH Banten
**Cakupan Batch 2**: Bagian 4 (Error Handling), Bagian 5 (API Response), Bagian 6 (Date/Time/Number), Bagian 7 (File Storage)
**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## ⚠️ Status Dokumen

- ✅ **Batch 1**: Bagian 1-3 — Fondasi Terminologi (selesai)
- ✅ **Batch 2** (dokumen ini): Bagian 4-7 — Konvensi Teknis
- ⏳ **Batch 3**: Bagian 8-10 — UI & Acceptance
- ⏳ **Batch 4**: Bagian 11-15 — Tata Kelola Agent

**Dokumen ini adalah AUTHORITATIVE SOURCE untuk error handling, API format, date/time/number, dan file storage**. Semua dokumen lain dan code wajib mengacu ke dokumen ini.

---

# Bagian 4: Error Handling Convention

## 4.1 Prinsip Dasar Error Handling

1. **Never expose internal errors** ke user — translate ke pesan yang user-friendly
2. **Always log full error** di server (dengan stack trace) untuk debugging
3. **Konsisten format** — semua error punya struktur yang sama
4. **Actionable** — error message harus memberi tahu user apa yang harus dilakukan
5. **Bilingual** — user-facing dalam Bahasa Indonesia, log dalam Bahasa Inggris

## 4.2 Error Categories

Sistem SILA punya 4 kategori error utama:

| Kategori | Kode Prefix | Deskripsi | HTTP Status |
|---|---|---|---|
| **Validation Error** | `ERR_VAL_` | Input dari user tidak valid | 422 |
| **Authorization Error** | `ERR_AUTH_` | Akses ditolak (login/permission) | 401, 403 |
| **Business Logic Error** | `ERR_BUS_` | Aturan bisnis dilanggar | 400 |
| **System Error** | `ERR_SYS_` | Bug, DB error, network, dll | 500 |

## 4.3 Error Code Format

**Pattern**: `ERR_[CATEGORY]_[SPECIFIC]`

**Aturan**:
- Format: `UPPER_SNAKE_CASE`
- Prefix `ERR_` wajib
- Maksimal 4 segmen (dipisah `_`)
- Bahasa Inggris untuk kode

### 4.3.1 Daftar Error Code Lengkap

#### Validation Errors (ERR_VAL_*)

| Kode | Deskripsi | User Message (ID) |
|---|---|---|
| `ERR_VAL_REQUIRED_FIELD` | Field wajib tidak diisi | "Field [nama_field] wajib diisi" |
| `ERR_VAL_INVALID_FORMAT` | Format input salah | "Format [nama_field] tidak valid" |
| `ERR_VAL_MIN_LENGTH` | Input terlalu pendek | "[nama_field] minimal [n] karakter" |
| `ERR_VAL_MAX_LENGTH` | Input terlalu panjang | "[nama_field] maksimal [n] karakter" |
| `ERR_VAL_MIN_VALUE` | Nilai terlalu kecil | "[nama_field] minimal [n]" |
| `ERR_VAL_MAX_VALUE` | Nilai terlalu besar | "[nama_field] maksimal [n]" |
| `ERR_VAL_INVALID_EMAIL` | Format email salah | "Format email tidak valid" |
| `ERR_VAL_INVALID_NIM` | Format NIM salah | "Format NIM tidak valid (harus 9-10 digit)" |
| `ERR_VAL_INVALID_NIP` | Format NIP salah | "Format NIP tidak valid (harus 18 digit)" |
| `ERR_VAL_INVALID_DATE` | Format tanggal salah | "Format tanggal tidak valid" |
| `ERR_VAL_FILE_TOO_LARGE` | File terlalu besar | "Ukuran file melebihi [n] MB" |
| `ERR_VAL_FILE_TYPE_NOT_ALLOWED` | Tipe file tidak diizinkan | "Tipe file tidak diizinkan. Diizinkan: [list]" |
| `ERR_VAL_MIN_ITEMS` | Item repeater kurang | "Minimal [n] [item]" (mis. "Minimal 3 judul") |
| `ERR_VAL_MAX_ITEMS` | Item repeater terlalu banyak | "Maksimal [n] [item]" |
| `ERR_VAL_DUPLICATE` | Data sudah ada | "[nama_field] '[value]' sudah terdaftar" |
| `ERR_VAL_INVALID_ENUM` | Value bukan dari enum valid | "Nilai [nama_field] tidak valid" |

#### Authorization Errors (ERR_AUTH_*)

| Kode | Deskripsi | User Message (ID) | HTTP |
|---|---|---|---|
| `ERR_AUTH_NOT_AUTHENTICATED` | User belum login | "Anda harus login terlebih dahulu" | 401 |
| `ERR_AUTH_SESSION_EXPIRED` | Session habis | "Sesi Anda telah berakhir, silakan login ulang" | 401 |
| `ERR_AUTH_INVALID_CREDENTIALS` | Email/password salah | "Email atau password salah" | 401 |
| `ERR_AUTH_ACCOUNT_INACTIVE` | Akun nonaktif | "Akun Anda tidak aktif. Hubungi admin" | 403 |
| `ERR_AUTH_INSUFFICIENT_ROLE` | Role tidak punya akses | "Anda tidak memiliki akses untuk tindakan ini" | 403 |
| `ERR_AUTH_OUTSIDE_SCOPE` | Resource di luar scope user | "Data ini di luar kewenangan Anda" | 403 |
| `ERR_AUTH_NOT_ASSIGNED` | User tidak punya assignment yang dibutuhkan | "Anda bukan [role] untuk pengajuan ini" | 403 |
| `ERR_AUTH_RATE_LIMIT` | Terlalu banyak request | "Terlalu banyak percobaan, coba lagi nanti" | 429 |

#### Business Logic Errors (ERR_BUS_*)

| Kode | Deskripsi | User Message (ID) |
|---|---|---|
| `ERR_BUS_INVALID_STATE_TRANSITION` | Transisi status tidak valid | "Tindakan ini tidak bisa dilakukan pada status saat ini" |
| `ERR_BUS_PREREQUISITE_NOT_MET` | Prasyarat layanan tidak terpenuhi | "Anda harus menyelesaikan [layanan] terlebih dahulu" |
| `ERR_BUS_DUPLICATE_PENGAJUAN` | Sudah ada pengajuan aktif | "Anda sudah memiliki pengajuan [layanan] yang aktif" |
| `ERR_BUS_SLA_EXPIRED` | SLA habis (untuk action tertentu) | "Batas waktu untuk tindakan ini telah habis" |
| `ERR_BUS_MAX_RETRY_EXCEEDED` | Maksimal retry terlampaui | "Anda sudah mencapai batas maksimal [n] kali revisi" |
| `ERR_BUS_RESOURCE_LOCKED` | Resource sedang dikunci proses lain | "Data sedang diproses oleh sistem, coba lagi sebentar" |
| `ERR_BUS_INVALID_ASSIGNMENT` | User tidak punya assignment yang valid | "Anda tidak memiliki penugasan untuk tindakan ini" |
| `ERR_BUS_PROFILE_NOT_FOUND` | Profile (dosen/pegawai/mahasiswa) tidak ditemukan | "Profil pengguna tidak ditemukan" |
| `ERR_BUS_SEMESTER_NOT_ACTIVE` | Tidak ada semester aktif | "Tidak ada semester aktif. Hubungi admin" |
| `ERR_BUS_COUNTER_EXHAUSTED` | Counter penomoran habis | "Counter penomoran perlu di-reset" |
| `ERR_BUS_TTD_NOT_UPLOADED` | Pejabat belum upload TTD scan | "Anda harus upload tanda tangan scan terlebih dahulu" |
| `ERR_BUS_TURNITIN_NOT_PASSED` | Turnitin di atas batas | "Hasil Turnitin di atas batas yang diizinkan ([n]%)" |

#### System Errors (ERR_SYS_*)

| Kode | Deskripsi | User Message (ID) |
|---|---|---|
| `ERR_SYS_INTERNAL` | Internal server error | "Terjadi kesalahan sistem. Tim teknis sudah diberitahu" |
| `ERR_SYS_DATABASE` | Database error | "Terjadi kesalahan database. Coba lagi nanti" |
| `ERR_SYS_NETWORK` | Network/timeout error | "Koneksi terputus. Coba lagi" |
| `ERR_SYS_FILE_UPLOAD_FAILED` | Upload file gagal | "Upload file gagal. Coba lagi" |
| `ERR_SYS_PDF_GENERATION_FAILED` | Generate PDF gagal | "Pembuatan dokumen gagal. Tim teknis sudah diberitahu" |
| `ERR_SYS_EMAIL_SEND_FAILED` | Kirim email gagal | "Notifikasi email gagal dikirim" |
| `ERR_SYS_EXTERNAL_SERVICE` | External service error | "Layanan eksternal sedang bermasalah" |

## 4.4 Error Object Structure

### 4.4.1 Format Error Response (API)

```typescript
{
  "success": false,
  "error": {
    "code": "ERR_VAL_REQUIRED_FIELD",
    "message": "Field nama wajib diisi",
    "field": "nama",       // optional, untuk validation error
    "details": null        // optional, untuk debugging (jangan expose di production)
  },
  "timestamp": "2026-05-28T14:30:00Z",
  "request_id": "req_abc123xyz"
}
```

### 4.4.2 Format Multiple Errors (Validation)

Untuk validation error yang punya banyak field bermasalah:

```typescript
{
  "success": false,
  "error": {
    "code": "ERR_VAL_MULTIPLE",
    "message": "Beberapa field tidak valid",
    "fields": {
      "nama": "Field nama wajib diisi",
      "email": "Format email tidak valid",
      "judul": "Minimal 3 judul"
    }
  },
  "timestamp": "2026-05-28T14:30:00Z",
  "request_id": "req_abc123xyz"
}
```

## 4.5 Error Severity & Logging

| Severity | Kapan Dipakai | Action |
|---|---|---|
| `info` | Event normal (login, submit) | Log saja |
| `warning` | Validation, business logic violation | Log + tampilkan ke user |
| `error` | System error, DB error | Log + notif admin + tampilkan ke user (sanitized) |
| `critical` | Service down, security breach | Log + alert immediate (SMS/Slack) + halaman error |

### 4.5.1 Log Format

```typescript
{
  "level": "error",
  "timestamp": "2026-05-28T14:30:00.123Z",
  "request_id": "req_abc123xyz",
  "user_id": 123,
  "code": "ERR_SYS_DATABASE",
  "message": "Database connection timeout",
  "stack_trace": "...",
  "context": {
    "endpoint": "/api/pengajuan",
    "method": "POST",
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

## 4.6 Error Handling Pattern

### 4.6.1 di Server Action (Next.js)

```typescript
"use server";

export async function submitPengajuan(data: SubmitPengajuanInput) {
  try {
    // Validasi input
    const validated = validateInput(data);
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: "ERR_VAL_MULTIPLE",
          message: "Validasi gagal",
          fields: validated.errors
        }
      };
    }

    // Business logic
    const result = await createPengajuan(validated.data);

    return { success: true, data: result };
  } catch (error) {
    // Log full error untuk debugging
    logger.error({
      code: "ERR_SYS_INTERNAL",
      error,
      context: { action: "submitPengajuan", data }
    });

    // Return sanitized error ke user
    return {
      success: false,
      error: {
        code: "ERR_SYS_INTERNAL",
        message: "Terjadi kesalahan sistem. Tim teknis sudah diberitahu"
      }
    };
  }
}
```

### 4.6.2 di Client Component

```typescript
async function handleSubmit() {
  const result = await submitPengajuan(formData);

  if (!result.success) {
    // Tampilkan error sesuai jenis
    if (result.error.code.startsWith("ERR_VAL_")) {
      // Validation error: highlight field
      showFieldErrors(result.error.fields);
    } else {
      // Other errors: toast notification
      toast.error(result.error.message);
    }
    return;
  }

  // Success
  toast.success("Pengajuan berhasil disubmit");
  router.push("/pengajuan");
}
```

## 4.7 User-Facing Error Display

### 4.7.1 Validation Error

**Inline di Form Field**:
```
[Input Field]
↓
"Field nama wajib diisi" (red text di bawah field)
```

### 4.7.2 Action Error

**Toast Notification**:
```
┌──────────────────────────────────────┐
│ ⚠ Tidak dapat menyimpan              │
│ Anda sudah memiliki pengajuan aktif  │
└──────────────────────────────────────┘
```

### 4.7.3 Critical Error

**Modal Dialog**:
```
┌──────────────────────────────────────┐
│ ✕ Terjadi Kesalahan                  │
│                                      │
│ Sistem mengalami gangguan. Tim       │
│ teknis sudah diberitahu.             │
│                                      │
│ Request ID: req_abc123xyz            │
│                                      │
│         [Tutup]    [Coba Lagi]       │
└──────────────────────────────────────┘
```

### 4.7.4 Page-Level Error

**Halaman Error** (untuk 404, 500, akses ditolak):
- Layout konsisten dengan halaman lain
- Tampilkan request_id untuk reference
- Tombol untuk kembali ke dashboard

## 4.8 AI Agent Rules untuk Error Handling

1. **WAJIB** pakai kode error dari daftar di Section 4.3
2. **JANGAN** invent kode error baru — kalau ada kasus baru, dokumentasikan di sini dulu
3. **WAJIB** translate error message ke Bahasa Indonesia untuk user
4. **JANGAN** expose stack trace atau internal error ke user
5. **WAJIB** log dengan format standar di Section 4.5.1

---

# Bagian 5: API Response Format

## 5.1 Prinsip Dasar API Response

1. **Konsisten** — semua endpoint return format yang sama
2. **Self-describing** — response berisi semua info yang dibutuhkan client
3. **Versionable** — siap untuk versi API ke depan
4. **Predictable** — Agent/developer tahu apa yang diharapkan

## 5.2 Success Response Shape

### 5.2.1 Single Resource

```typescript
{
  "success": true,
  "data": {
    "id": 123,
    "nama": "Ahmad",
    // ... fields
  }
}
```

### 5.2.2 List/Collection

```typescript
{
  "success": true,
  "data": [
    { "id": 1, "nama": "Ahmad" },
    { "id": 2, "nama": "Budi" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

### 5.2.3 Action Result (Mutation)

```typescript
{
  "success": true,
  "data": {
    "id": 123,
    "status": "pending_pa"
    // ... updated fields
  },
  "message": "Pengajuan berhasil disubmit"
}
```

## 5.3 Error Response Shape

Sudah dibahas di Bagian 4.4. Recap:

```typescript
{
  "success": false,
  "error": {
    "code": "ERR_XXX",
    "message": "...",
    "field": "..."     // optional
  },
  "timestamp": "...",
  "request_id": "..."
}
```

## 5.4 Pagination Strategy

### 5.4.1 Pilihan: Offset-Based atau Cursor-Based

**Untuk SILA Phase 1**: **Offset-Based** (lebih sederhana, sesuai use case).

**Alasan**:
- Use case utama: list pengajuan dengan filter & sort. Offset-based cukup
- Cursor-based lebih cocok untuk real-time feed (Twitter-style)
- User butuh "jump to page X" — hanya bisa dengan offset

**Phase 2-3**: bisa upgrade ke cursor-based jika ada use case yang butuh.

### 5.4.2 Query Parameters

```
GET /api/pengajuan?page=2&per_page=20&sort=created_at:desc&filter[status]=pending_pa
```

| Parameter | Tipe | Default | Deskripsi |
|---|---|---|---|
| `page` | number | 1 | Halaman ke berapa (1-indexed) |
| `per_page` | number | 20 | Item per halaman (max 100) |
| `sort` | string | `created_at:desc` | Format: `field:direction` |
| `filter[xxx]` | string | - | Filter dinamis per field |
| `search` | string | - | Pencarian global |

### 5.4.3 Meta Response

```typescript
{
  "meta": {
    "total": 250,           // total record (after filter)
    "page": 2,              // current page
    "per_page": 20,         // items per page
    "total_pages": 13,      // total pages
    "has_next": true,
    "has_previous": true
  }
}
```

## 5.5 HTTP Status Code Usage

Pakai HTTP status code sesuai standar REST:

| Code | Nama | Kapan Dipakai |
|---|---|---|
| `200` | OK | GET sukses, PUT/PATCH sukses |
| `201` | Created | POST sukses (resource baru) |
| `204` | No Content | DELETE sukses (no body) |
| `400` | Bad Request | Business logic error |
| `401` | Unauthorized | Belum login / session expired |
| `403` | Forbidden | Sudah login tapi tidak ada akses |
| `404` | Not Found | Resource tidak ditemukan |
| `409` | Conflict | Konflik (mis. duplicate) |
| `422` | Unprocessable Entity | Validation error |
| `429` | Too Many Requests | Rate limit |
| `500` | Internal Server Error | Server crash, DB error |
| `503` | Service Unavailable | Maintenance, external service down |

**Anti-pattern yang harus dihindari**:
- ❌ Return `200` untuk error (selalu pakai status code yang benar)
- ❌ Return `500` untuk validation error (pakai `422`)
- ❌ Return `404` untuk akses ditolak (pakai `403`)

## 5.6 Request Format

### 5.6.1 Body Format

- **POST/PUT/PATCH**: JSON
- **File upload**: multipart/form-data

```typescript
// POST /api/pengajuan (JSON)
{
  "jenis_layanan_id": 1,
  "data": {
    "judul_1": "...",
    "judul_2": "...",
    "judul_3": "..."
  }
}

// POST /api/pengajuan/upload (multipart)
FormData {
  pengajuan_id: 123,
  dokumen_persyaratan_id: 5,
  file: <File>
}
```

### 5.6.2 Headers

| Header | Wajib | Deskripsi |
|---|---|---|
| `Content-Type` | Ya | `application/json` atau `multipart/form-data` |
| `Authorization` | Ya (kecuali public endpoint) | `Bearer <token>` |
| `Accept-Language` | Tidak | `id` atau `en` (default: `id`) |

## 5.7 Endpoint Naming Convention

### 5.7.1 Pattern

```
[VERB] /api/[resource-plural]/[id?]/[sub-resource?]
```

### 5.7.2 Aturan

- **Resource**: plural, kebab-case
- **Verb**: HTTP method standar (GET/POST/PUT/PATCH/DELETE)
- **Tidak pakai verb di URL** (RESTful style)

### 5.7.3 Contoh

| Aksi | Method | Endpoint |
|---|---|---|
| List pengajuan | GET | `/api/pengajuan` |
| Detail pengajuan | GET | `/api/pengajuan/123` |
| Create pengajuan | POST | `/api/pengajuan` |
| Update pengajuan | PATCH | `/api/pengajuan/123` |
| Delete pengajuan | DELETE | `/api/pengajuan/123` |
| Approve pengajuan | POST | `/api/pengajuan/123/approve` (action endpoint) |
| Reject pengajuan | POST | `/api/pengajuan/123/reject` (action endpoint) |
| Upload dokumen | POST | `/api/pengajuan/123/dokumen` |
| Download PDF | GET | `/api/pengajuan/123/pdf` |
| Verifikasi token | POST | `/api/verifikasi` (public) |

**Catatan**: Untuk action yang bukan pure CRUD (mis. approve, reject), gunakan **sub-resource action** dengan POST. Lebih jelas daripada PATCH dengan body action.

## 5.8 API Versioning

### 5.8.1 Strategy

**Phase 1**: **Tidak ada versioning** (semua endpoint di `/api/...`)

**Phase 2+**: Jika ada breaking change, pakai URL-based versioning: `/api/v2/...`

**Alasan**:
- SILA internal app, tidak ada public consumer
- Frontend & backend deployed bersamaan
- Versioning overhead tidak worth it untuk Phase 1

## 5.9 Rate Limiting

### 5.9.1 Limits

| Endpoint Type | Limit |
|---|---|
| Authenticated API | 100 request/minute per user |
| Login endpoint | 5 attempts/minute per IP |
| Verifikasi publik | 10 attempts/minute per IP |
| File upload | 20 upload/hour per user |

### 5.9.2 Response saat Rate Limit

```typescript
HTTP 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "ERR_AUTH_RATE_LIMIT",
    "message": "Terlalu banyak percobaan, coba lagi nanti"
  },
  "retry_after": 60  // seconds
}
```

## 5.10 AI Agent Rules untuk API

1. **WAJIB** pakai format response sesuai Section 5.2-5.3
2. **WAJIB** pakai HTTP status code yang tepat (Section 5.5)
3. **WAJIB** validate input sebelum proses
4. **JANGAN** mix-up status code (mis. 200 untuk error)
5. **WAJIB** include `request_id` untuk traceability di error response
6. **WAJIB** dokumentasikan endpoint baru di OpenAPI spec (jika ada)

---

# Bagian 6: Date, Time, Number, & Format Convention

## 6.1 Prinsip

1. **Database**: Format standar (ISO 8601, UTC) untuk konsistensi
2. **API**: ISO 8601 string untuk interoperability
3. **Display (UI)**: Bahasa Indonesia, timezone WIB

## 6.2 Date Format

### 6.2.1 Database

**Tipe kolom**: `TIMESTAMP WITH TIME ZONE` (Postgres) atau `DATETIME` (MySQL).

**Format**: ISO 8601 UTC

```
2026-05-28T07:30:00Z   (UTC)
```

### 6.2.2 API Request/Response

**Format**: ISO 8601 string

```typescript
// Request
{
  "tanggal_sidang": "2026-06-15T09:00:00+07:00"
}

// Response
{
  "tanggal_sidang": "2026-06-15T09:00:00+07:00",
  "created_at": "2026-05-28T14:30:00+07:00"
}
```

### 6.2.3 Display (UI)

#### Format Tanggal

| Konteks | Format | Contoh |
|---|---|---|
| **Display panjang** | `D MMMM YYYY` | "28 Mei 2026" |
| **Display singkat** | `DD/MM/YYYY` | "28/05/2026" |
| **Display dengan hari** | `dddd, D MMMM YYYY` | "Kamis, 28 Mei 2026" |
| **Display relatif** | (tergantung jeda) | "Hari ini", "Kemarin", "3 hari lalu" |
| **Pada dokumen formal** | `D MMMM YYYY` | "28 Mei 2026" |

#### Format Waktu

| Konteks | Format | Contoh |
|---|---|---|
| **Display jam** | `HH:mm WIB` | "14:30 WIB" |
| **Display jam dengan detik** | `HH:mm:ss WIB` | "14:30:15 WIB" |
| **Display tanggal + waktu** | `D MMMM YYYY HH:mm WIB` | "28 Mei 2026 14:30 WIB" |

### 6.2.4 Form Input

- **Date picker**: Native HTML5 `<input type="date">` atau library (mis. shadcn/ui DatePicker)
- **Time picker**: Native HTML5 `<input type="time">`
- **Datetime picker**: Library
- **Locale**: `id-ID` (Bahasa Indonesia)

### 6.2.5 Timezone

- **Database**: UTC (always)
- **API**: ISO 8601 dengan timezone offset (`+07:00` untuk WIB)
- **Display**: Konversi ke WIB (UTC+7) untuk user di Indonesia

**Implementasi**: Pakai library `date-fns` atau `dayjs` dengan locale `id`.

```typescript
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Display format
format(new Date(), "d MMMM yyyy", { locale: id }); // "28 Mei 2026"
```

## 6.3 Bulan Romawi (untuk Penomoran Surat)

Konversi bulan ke angka Romawi (dipakai di format nomor surat):

| Bulan | Romawi |
|---|---|
| Januari | I |
| Februari | II |
| Maret | III |
| April | IV |
| Mei | V |
| Juni | VI |
| Juli | VII |
| Agustus | VIII |
| September | IX |
| Oktober | X |
| November | XI |
| Desember | XII |

**Contoh penggunaan**:
```
Nomor: 040/Un.17/F.III/PP.00.9/V/2026
                                ^
                                Mei = V
```

## 6.4 Number Format

### 6.4.1 Bilangan Bulat

**Database**: Integer tanpa format

**Display**: Pakai thousand separator titik (Bahasa Indonesia)

```typescript
// Database: 1234567
// Display: "1.234.567"

new Intl.NumberFormat("id-ID").format(1234567);
// "1.234.567"
```

### 6.4.2 Bilangan Desimal

**Database**: Decimal atau Float

**Display**: Koma sebagai decimal separator (Bahasa Indonesia)

```typescript
// Database: 3.75
// Display: "3,75"

new Intl.NumberFormat("id-ID", { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
}).format(3.75);
// "3,75"
```

### 6.4.3 Persentase

**Database**: Decimal (0-100 atau 0-1, harus konsisten — pilih satu)

**Pilihan SILA**: Simpan sebagai **0-100** (mis. 25.5 untuk 25.5%)

**Display**: Tambah simbol `%`

```typescript
// Database: 25.5
// Display: "25,5%"

`${new Intl.NumberFormat("id-ID").format(25.5)}%`
// "25,5%"
```

### 6.4.4 IPK & Nilai Akademik

**Database**: Decimal dengan 2 digit di belakang koma

**Display**: Koma sebagai decimal separator

```typescript
// Database: 3.45
// Display: "3,45"
```

**Range yang valid**:
- IPK: 0.00 - 4.00
- Nilai per mata kuliah: 0.00 - 4.00

### 6.4.5 Uang/Rupiah (jika ada)

**Database**: Integer (dalam Rupiah, tidak ada sen)

**Display**: Format dengan "Rp" prefix dan thousand separator

```typescript
// Database: 250000
// Display: "Rp 250.000"

new Intl.NumberFormat("id-ID", { 
  style: "currency", 
  currency: "IDR",
  minimumFractionDigits: 0
}).format(250000);
// "Rp 250.000"
```

## 6.5 String Format

### 6.5.1 NIM (Nomor Induk Mahasiswa)

- **Format**: 9-10 digit angka
- **Validation regex**: `/^[0-9]{9,10}$/`
- **Tidak ada formatting display** (tampilkan apa adanya)

### 6.5.2 NIP (Nomor Induk Pegawai)

- **Format**: 18 digit angka
- **Validation regex**: `/^[0-9]{18}$/`
- **Display**: Pakai dot separator setiap 4-6-1-2-3-2 digit (opsional)
  - Database: `196801011990031001`
  - Display formal: `196801011990031001` (tanpa separator, sesuai SK)

### 6.5.3 NIDN (Nomor Induk Dosen Nasional)

- **Format**: 10 digit angka
- **Validation regex**: `/^[0-9]{10}$/`

### 6.5.4 Email

- **Format**: Standar RFC 5322
- **Validation**: Pakai library `zod` atau `validator.js`
- **Case**: Selalu lowercase saat disimpan

### 6.5.5 Phone Number (jika ada)

- **Format database**: International format tanpa +, mis. `628123456789`
- **Display**: `+62 812-3456-789`

### 6.5.6 Nomor Surat (SILA-specific)

Sudah dibahas di dokumen 01. Format:
```
[NO_URUT]/Un.17/F.III/[KODE_KLASIFIKASI]/[BULAN_ROMAWI]/[TAHUN]
```

**Contoh**: `040/Un.17/F.III/PP.00.9/V/2026`

**Format komponen**:
- `NO_URUT`: 3 digit dengan leading zero, mis. `040`
- `Un.17`: Statis
- `F.III`: Statis
- `KODE_KLASIFIKASI`: Lihat Section 1.4 dokumen Batch 1
- `BULAN_ROMAWI`: I, II, ..., XII
- `TAHUN`: 4 digit, mis. `2026`

### 6.5.7 Kode Pengajuan

Format:
```
[KATEGORI]-[TAHUN]-[NO_URUT]
```

**Contoh**: `TA-2026-0023`, `AK-2026-0156`

**Format komponen**:
- `KATEGORI`: `TA` atau `AK`
- `TAHUN`: 4 digit
- `NO_URUT`: 4 digit dengan leading zero

## 6.6 Locale & Internationalization

### 6.6.1 Default Locale

**SILA Phase 1**: `id-ID` (Bahasa Indonesia)

### 6.6.2 Future i18n

- Phase 1: tidak ada i18n
- Phase 2+: bisa pakai `next-intl` jika dibutuhkan multi-bahasa

## 6.7 AI Agent Rules untuk Date/Time/Number

1. **WAJIB** simpan datetime di database dalam UTC
2. **WAJIB** convert ke WIB saat display ke user
3. **WAJIB** pakai locale `id-ID` untuk format number/date
4. **WAJIB** pakai format Bahasa Indonesia untuk display ("28 Mei 2026", bukan "May 28, 2026")
5. **WAJIB** pakai library standard (`date-fns` atau `dayjs`) — jangan format manual
6. **JANGAN** mix format (mis. tanggal di satu tempat pakai DD/MM, di tempat lain MM/DD)

---

# Bagian 7: File Storage Convention

## 7.1 Prinsip Dasar Storage

1. **Organized**: Struktur folder yang jelas dan predictable
2. **Secure**: File sensitif tidak accessible langsung via URL
3. **Backed up**: Strategi backup yang reliable
4. **Scalable**: Mudah migrasi ke cloud storage di masa depan

## 7.2 Storage Strategy

### 7.2.1 Phase 1: Local Filesystem

**Lokasi**: `/storage/` di server Next.js

**Alasan**:
- Lebih murah (no cloud cost)
- Lebih mudah setup
- Cukup untuk skala fakultas

### 7.2.2 Phase 2+: Cloud Storage (S3-Compatible)

**Pilihan**:
- AWS S3
- Cloudflare R2 (lebih murah untuk egress)
- MinIO (self-hosted)
- Wasabi (cheap S3-compatible)

**Pilihan SILA untuk Phase 2**: **Cloudflare R2** (jika upgrade) — karena gratis egress dan kompatible S3.

### 7.2.3 Abstraction Layer

Implementasi storage di SILA pakai **abstraction layer** sehingga Phase 1 → Phase 2 migrasi mudah:

```typescript
// Storage interface
interface StorageProvider {
  upload(path: string, file: Buffer): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

// Phase 1 implementation
class LocalStorage implements StorageProvider { ... }

// Phase 2 implementation
class R2Storage implements StorageProvider { ... }
```

## 7.3 Folder Structure

```
/storage
  /pengajuan
    /{academic_period_id}
      /{pengajuan_id}
        /uploads
          /{dokumen_persyaratan_id}_{timestamp}_{original_name}
        /generated
          /preview_{timestamp}.pdf
          /final_{timestamp}.pdf
  /ttd_scan
    /{user_id}
      /ttd_{timestamp}.png
  /logo
    /header_logo.png
    /qr_logo.png
  /temp
    /{random_id}_{timestamp}
  /backups
    /database
      /{date}/dump.sql
    /storage
      /{date}/storage.tar.gz
```

### 7.3.1 Penjelasan Folder

| Folder | Isi | Akses |
|---|---|---|
| `/pengajuan/{period}/{id}/uploads/` | File yang di-upload mahasiswa | Authenticated (mahasiswa & approver) |
| `/pengajuan/{period}/{id}/generated/` | PDF generated (preview & final) | Authenticated |
| `/ttd_scan/{user_id}/` | TTD scan pejabat | Owner + super_admin only |
| `/logo/` | Logo institusi | Public read |
| `/temp/` | File temporary | Auto-delete > 24 jam |
| `/backups/` | Backup database & storage | Super admin only |

## 7.4 File Naming Pattern

### 7.4.1 Upload dari Mahasiswa

**Format**: `{dokumen_persyaratan_id}_{timestamp}_{sanitized_original_name}`

**Contoh**:
```
5_20260528-143000_transkrip-nilai.pdf
```

**Aturan**:
- `dokumen_persyaratan_id`: ID dari tabel `dokumen_persyaratan`
- `timestamp`: Format `YYYYMMDD-HHmmss`
- `sanitized_original_name`: Original filename, di-sanitize:
  - Lowercase
  - Replace spasi dengan dash
  - Hapus karakter spesial selain `.`, `_`, `-`
  - Max 100 karakter

**Sanitization function**:
```typescript
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 100);
}
```

### 7.4.2 Generated PDF

**Format**: `{pengajuan_kode}_{doc_type}_{timestamp}.pdf`

**Contoh**:
```
TA-2026-0023_persetujuan-judul_20260528-143000.pdf
TA-2026-0023_persetujuan-judul_final.pdf  (final version)
```

**doc_type**:
- `persetujuan-judul` (TA-01)
- `sk-pembimbing` (TA-02)
- `surat-tugas-proposal` (TA-03)
- `berita-acara-proposal` (TA-03)
- dst (sesuai jenis dokumen output)

### 7.4.3 TTD Scan

**Format**: `{user_id}_ttd.png`

**Contoh**:
```
123_ttd.png
```

**Aturan**:
- Hanya 1 file aktif per user (overwrite jika upload ulang)
- Format: PNG dengan transparent background (preferred)
- Ukuran rekomendasi: 400x150 pixel

## 7.5 File Size & Type Restrictions

### 7.5.1 Default Limits

| Konteks | Max Size | Allowed Types |
|---|---|---|
| Dokumen persyaratan umum | 2 MB | PDF, JPG, PNG |
| Draft skripsi | 15 MB | PDF |
| Proposal skripsi | 10 MB | PDF |
| TTD scan | 1 MB | PNG, JPG |
| Logo | 2 MB | PNG, JPG, SVG |

### 7.5.2 Configurable per Layanan

Limit di atas adalah **default**. Admin bisa override per dokumen persyaratan via tabel `dokumen_persyaratan.ukuran_max_mb`.

### 7.5.3 Validation Rules

```typescript
// Server-side validation
function validateFileUpload(file: File, rules: FileRules) {
  // Check size
  if (file.size > rules.maxSizeBytes) {
    throw new ValidationError("ERR_VAL_FILE_TOO_LARGE", {
      max: rules.maxSizeBytes
    });
  }

  // Check MIME type
  if (!rules.allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError("ERR_VAL_FILE_TYPE_NOT_ALLOWED", {
      allowed: rules.allowedMimeTypes
    });
  }

  // Check extension (defense in depth)
  const ext = path.extname(file.name).toLowerCase();
  if (!rules.allowedExtensions.includes(ext)) {
    throw new ValidationError("ERR_VAL_FILE_TYPE_NOT_ALLOWED");
  }
}
```

## 7.6 Security Considerations

### 7.6.1 File Access

**Aturan**: File **TIDAK accessible langsung via URL public**.

**Implementasi**:
- File disimpan **di luar folder public Next.js** (di `/storage/`, bukan `/public/`)
- Akses via API endpoint: `GET /api/files/{path}` yang cek authorization dulu

```typescript
// API route example
export async function GET(request: Request, { params }: { params: { path: string } }) {
  // 1. Cek user authenticated
  const user = await getUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Cek user berhak akses file ini
  const file = await getFileMetadata(params.path);
  if (!canAccessFile(user, file)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Stream file
  return streamFile(params.path);
}
```

### 7.6.2 Anti Malware

**Phase 1**: Hanya validasi MIME type + extension (basic)

**Phase 2+**: Integrasi dengan antivirus scanner (ClamAV) jika dibutuhkan

### 7.6.3 Path Traversal Prevention

```typescript
// WAJIB sanitize path untuk prevent ../../../etc/passwd attack
function safePath(userInput: string): string {
  const sanitized = userInput.replace(/\.\./g, "").replace(/[^\w./-]/g, "");
  return path.normalize(sanitized);
}
```

## 7.7 Backup Strategy

### 7.7.1 Phase 1 (Local Storage)

**Daily backup**:
- Database dump: `/storage/backups/database/{date}/dump.sql`
- Storage tarball: `/storage/backups/storage/{date}/storage.tar.gz`
- Retention: 30 hari

**Weekly backup**:
- Full database + storage ke external storage (cloud atau external drive)
- Retention: 1 tahun

**Implementasi**: Cron job + shell script

### 7.7.2 Phase 2+ (Cloud Storage)

- Cloud provider biasanya punya built-in versioning
- Tambah snapshot harian
- Retention 90 hari

## 7.8 Cleanup Strategy

### 7.8.1 Temporary Files

`/storage/temp/` di-cleanup tiap hari (cron job):
- Hapus file > 24 jam

### 7.8.2 Soft-Deleted Pengajuan

Jika pengajuan dihapus (soft delete), file-nya **tetap disimpan** sampai 90 hari (untuk recovery), baru hard-delete via cron.

### 7.8.3 Versi Lama Dokumen

Untuk preview PDF, versi lama auto-delete saat ada generate baru. Hanya versi final yang disimpan permanent.

## 7.9 AI Agent Rules untuk File Storage

1. **WAJIB** pakai storage abstraction layer, jangan langsung `fs.writeFile`
2. **WAJIB** sanitize filename sebelum simpan
3. **WAJIB** validate file size & type sebelum simpan
4. **JANGAN** simpan file di folder `public/` Next.js
5. **WAJIB** generate file path sesuai struktur di Section 7.3
6. **WAJIB** cek authorization sebelum serve file
7. **JANGAN** expose internal file path ke user

---

## Action Items untuk Anda (Batch 2)

| No | Action | Catatan |
|---|---|---|
| 1 | Validasi daftar error code (Section 4.3) | Mungkin ada kasus spesifik yang belum tercakup |
| 2 | Konfirmasi pagination strategy (Offset-Based untuk Phase 1) | Saya pilih offset, mudah-mudahan sesuai |
| 3 | Konfirmasi pilihan cloud storage Phase 2 (Cloudflare R2) | Saya rekomendasi R2 karena gratis egress |
| 4 | Konfirmasi format penomoran surat (Section 6.5.6) | Pastikan format sesuai standar fakultas |
| 5 | Konfirmasi kebijakan retention backup (30 hari + 1 tahun) | Cek dengan tim IT |
| 6 | Validasi maksimal file size per dokumen (Section 7.5.1) | Diskusikan dengan staff |

---

## Lanjut ke Batch 3

Setelah Anda review Batch 2, saya lanjut ke **Batch 3**:
- **Bagian 8**: UI Component & Behavior Convention
- **Bagian 9**: Authentication & Authorization Convention
- **Bagian 10**: Acceptance Criteria Template

---

*Dokumen ini adalah AUTHORITATIVE SOURCE untuk error handling, API format, date/time/number, dan file storage SILA. Semua dokumen lain dan code wajib mengacu ke sini.*
