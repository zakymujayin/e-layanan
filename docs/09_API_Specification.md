# API Specification
# Sistem Informasi Layanan Akademik (SILA)

**Versi**: 1.0
**Tanggal**: 28 Mei 2026

> **Catatan untuk AI Agent**: Semua endpoint mengikuti konvensi [KON-2] Bagian 5. Response format, error format, dan HTTP status code WAJIB mengikuti standar yang telah ditetapkan.

---

## Base URL

```
Production : https://layanan.fuda.uinbanten.ac.id/api
Development: http://localhost:3000/api
```

## Autentikasi

Semua endpoint (kecuali yang ditandai `PUBLIC`) membutuhkan session cookie yang valid.

---

## 1. Auth Endpoints

### POST /api/auth/login

**Auth**: Public
**Deskripsi**: Login dengan kredensial

**Request Body**:
```json
{
  "identifier": "221360001",
  "password": "password123"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nama_lengkap": "Aini Fitri Utami",
      "email": "aini@student.ac.id",
      "system_role": "mahasiswa"
    }
  }
}
```

**Response 401**:
```json
{
  "success": false,
  "error": { "code": "ERR_AUTH_INVALID_CREDENTIALS", "message": "Email atau password salah" }
}
```

### POST /api/auth/logout

**Auth**: Required
**Deskripsi**: Logout, hapus session

### POST /api/auth/lupa-password

**Auth**: Public
**Request Body**: `{ "email": "user@email.com" }`

### POST /api/auth/reset-password

**Auth**: Public (via token)
**Request Body**: `{ "token": "...", "password": "...", "confirm_password": "..." }`

---

## 2. Pengajuan Endpoints

### GET /api/pengajuan

**Auth**: Required (scope filtering berlaku)
**Deskripsi**: List pengajuan sesuai scope user

**Query Params**:
| Param | Type | Default | Keterangan |
|---|---|---|---|
| `page` | number | 1 | Halaman |
| `per_page` | number | 20 | Item per halaman (max 100) |
| `status` | string | - | Filter status |
| `jenis_layanan_kode` | string | - | "TA-01", "AK-01", dll |
| `academic_period_id` | number | aktif | Filter semester |
| `search` | string | - | Cari kode atau nama mahasiswa |
| `sort` | string | `created_at:desc` | Sort field:direction |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "kode_pengajuan": "TA-2026-0023",
      "jenis_layanan": { "kode": "TA-01", "nama": "Pengajuan Judul Skripsi" },
      "mahasiswa": { "nim": "221360001", "nama_lengkap": "Aini Fitri Utami" },
      "status": "pending_pa",
      "created_at": "2026-05-28T14:30:00+07:00",
      "updated_at": "2026-05-29T09:00:00+07:00"
    }
  ],
  "meta": { "total": 50, "page": 1, "per_page": 20, "total_pages": 3 }
}
```

### POST /api/pengajuan

**Auth**: Required (mahasiswa only)
**Deskripsi**: Submit pengajuan baru

**Request Body**:
```json
{
  "jenis_layanan_kode": "TA-01",
  "field_values": {
    "judul_1": "Analisis Hadis tentang...",
    "judul_2": "Kajian Tafsir Al-Quran...",
    "judul_3": "Studi Komparatif...",
    "pa_dosen_id": 45
  }
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 124,
    "kode_pengajuan": "TA-2026-0024",
    "status": "pending_staff_prodi",
    "nomor_surat_reserved": "041/Un.17/F.III/PP.00.9/V/2026"
  },
  "message": "Pengajuan berhasil disubmit"
}
```

### GET /api/pengajuan/:id

**Auth**: Required (scope filtering berlaku)
**Deskripsi**: Detail pengajuan lengkap

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "kode_pengajuan": "TA-2026-0023",
    "status": "pending_pa",
    "jenis_layanan": { "kode": "TA-01", "nama": "..." },
    "mahasiswa": { "nim": "...", "nama_lengkap": "..." },
    "field_values": { "judul_1": "...", "judul_2": "...", ... },
    "dokumen": [...],
    "pengajuan_log": [...],
    "current_step": { "step_code": "TA01-03", "actor_type": "pa", "sla_days": 7 },
    "available_actions": ["select_judul", "reject_to_submitter"],
    "nomor_surat_reserved": "040/Un.17/F.III/PP.00.9/V/2026"
  }
}
```

### POST /api/pengajuan/:id/action

**Auth**: Required (approver sesuai step)
**Deskripsi**: Eksekusi workflow action

**Request Body**:
```json
{
  "action": "approve",
  "data": {
    "catatan": "Berkas lengkap, lanjut ke PA"
  }
}
```

```json
{
  "action": "select_judul",
  "data": {
    "selected_judul_index": 3,
    "catatan": "Judul ketiga lebih relevan"
  }
}
```

```json
{
  "action": "reject_to_step",
  "data": {
    "target_status": "pending_sekprodi",
    "alasan": "Penguji 2 sedang cuti, mohon ganti"
  }
}
```

**Response 200**:
```json
{
  "success": true,
  "data": { "id": 123, "status": "pending_kaprodi", ... },
  "message": "Berhasil disetujui"
}
```

### POST /api/pengajuan/:id/resubmit

**Auth**: Required (mahasiswa — owner)
**Deskripsi**: Submit ulang setelah revision_required

**Request Body**: `{ "field_values": {...} }`

---

## 3. File Upload Endpoints

### POST /api/pengajuan/:id/dokumen

**Auth**: Required (mahasiswa — owner atau approver yang berhak)
**Content-Type**: `multipart/form-data`

**Form Data**:
| Field | Type | Required |
|---|---|---|
| `dokumen_persyaratan_id` | number | Ya |
| `file` | File | Ya |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": 55,
    "file_name": "transkrip.pdf",
    "file_size_bytes": 524288,
    "mime_type": "application/pdf"
  }
}
```

### GET /api/pengajuan/:id/dokumen/:dokumenId

**Auth**: Required (scope filtering berlaku)
**Deskripsi**: Download file dokumen
**Response**: File stream (binary)

### GET /api/pengajuan/:id/pdf

**Auth**: Required
**Query Params**: `?mode=preview` atau `?mode=final`
**Response**: PDF file stream

---

## 4. Nilai Sidang Endpoints

### POST /api/pengajuan/:id/nilai

**Auth**: Required (penguji atau sekretaris sidang untuk pengajuan ini)
**Deskripsi**: Input nilai sidang (post-sidang)

**Request Body (TA-03/04 — Penguji)**:
```json
{
  "nilai": 85,
  "catatan": "Proposal sudah baik, perlu perbaikan metodologi",
  "keputusan": "layak"
}
```

**Request Body (TA-05 — Sekretaris Sidang)**:
```json
{
  "nilai_pembimbing_1": 88,
  "nilai_pembimbing_2": 85,
  "nilai_penguji_1": 80,
  "nilai_penguji_2": 82,
  "keputusan": "lulus",
  "catatan_majelis": "Mahasiswa mempertahankan skripsi dengan baik"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "nilai_akhir": 83.75,
    "ipk_equivalent": 3.75,
    "yudisium": "sangat_memuaskan",
    "keputusan": "lulus"
  },
  "message": "Nilai berhasil diinput"
}
```

---

## 5. Verifikasi Publik Endpoints

### POST /api/verifikasi

**Auth**: Public (rate-limited: 10/menit per IP)
**Deskripsi**: Verifikasi keaslian dokumen via token

**Request Body**:
```json
{
  "doc_id": "abc123",
  "token": "A7K9-PQRZ-2BX8"
}
```

**Response 200 (valid)**:
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "dokumen": {
      "nomor_surat": "040/Un.17/F.III/PP.00.9/V/2026",
      "jenis_dokumen": "Surat Persetujuan Judul Skripsi",
      "nama_pemilik": "Aini Fitri Utami",
      "tanggal_terbit": "28 Mei 2026",
      "penandatangan": "Dr. H. Nama Pejabat, M.Ag. (Wakil Dekan I)"
    }
  }
}
```

**Response 200 (tidak valid)**:
```json
{
  "success": true,
  "data": {
    "is_valid": false,
    "message": "Token tidak valid atau dokumen tidak ditemukan"
  }
}
```

---

## 6. User & Profil Endpoints

### GET /api/profil

**Auth**: Required
**Deskripsi**: Get profil user yang sedang login

### PATCH /api/profil

**Auth**: Required
**Request Body**: `{ "nama_lengkap", "email", "nomor_hp", "email_notif_aktif" }`

### POST /api/profil/ttd-scan

**Auth**: Required (dosen/pegawai pejabat)
**Content-Type**: `multipart/form-data`
**Form Data**: `{ "file": File }` (PNG/JPG, max 1MB)

### PATCH /api/profil/password

**Auth**: Required
**Request Body**: `{ "password_lama", "password_baru", "konfirmasi_password" }`

---

## 7. Notifikasi Endpoints

### GET /api/notifikasi

**Auth**: Required
**Query Params**: `?is_read=false&page=1&per_page=20`

### PATCH /api/notifikasi/mark-all-read

**Auth**: Required

### DELETE /api/notifikasi

**Auth**: Required
**Deskripsi**: Clear all notifikasi

---

## 8. Admin Endpoints

Semua endpoint `/api/admin/*` membutuhkan `system_role = 'super_admin'`.

### GET /api/admin/users

### POST /api/admin/users

### PATCH /api/admin/users/:id

### POST /api/admin/users/import

**Content-Type**: `multipart/form-data`
**Form Data**: `{ "file": Excel file }`

### GET /api/admin/layanan

### PATCH /api/admin/layanan/:id/fields

### PATCH /api/admin/layanan/:id/dokumen-persyaratan

### PATCH /api/admin/layanan/:id/workflow

### GET /api/admin/academic-periods

### POST /api/admin/academic-periods

### PATCH /api/admin/academic-periods/:id/activate

---

## 9. Server Actions (Non-API)

Beberapa mutation menggunakan **Next.js Server Actions** (bukan API route) untuk form submission yang lebih native:

| Action | File | Keterangan |
|---|---|---|
| `submitPengajuan` | `actions/pengajuan.ts` | Submit pengajuan baru |
| `resubmitPengajuan` | `actions/pengajuan.ts` | Resubmit setelah revisi |
| `executeWorkflowAction` | `actions/workflow.ts` | Approve/reject/sign |
| `inputNilaiSidang` | `actions/workflow.ts` | Input nilai post-sidang |
| `updateProfil` | `actions/profil.ts` | Update profil user |
| `uploadTtdScan` | `actions/profil.ts` | Upload TTD scan |

File upload (dokumen pengajuan) menggunakan **API Route** (bukan Server Action) karena butuh `multipart/form-data`.
