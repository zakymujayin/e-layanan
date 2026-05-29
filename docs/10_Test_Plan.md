# Test Plan & Test Case
# Sistem Informasi Layanan Akademik (SILA)

**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## 1. Strategi Testing

| Level | Tool | Coverage Target | Kapan Dijalankan |
|---|---|---|---|
| Unit Test | Vitest | 80% business logic | Setiap push (CI) |
| Integration Test | Vitest + Supertest | Semua API endpoint | Setiap push (CI) |
| E2E Test | Playwright | Happy path per layanan | Sebelum merge ke main |

---

## 2. Prioritas Test

### Priority 1 (WAJIB sebelum go-live)

- Workflow engine (state transitions)
- Authorization & scope filtering
- Submit pengajuan (semua 13 layanan, minimal happy path)
- Document generation (PDF + nomor + TTD embed)
- Bypass mechanism TA-01
- Nilai sidang + auto-calculate yudisium

### Priority 2 (Dijalankan sebelum setiap release)

- Rejection bertingkat
- Versioning pengajuan
- SLA timer
- Notifikasi
- Verifikasi dokumen publik

### Priority 3 (Best effort)

- Edge cases
- Bulk import
- Admin panel
- Arsip & search

---

## 3. Test Cases per Domain

### 3.1 Authentication

| ID | Test Case | Input | Expected |
|---|---|---|---|
| TC-AUTH-01 | Login dengan email valid | email + password benar | 200, session created |
| TC-AUTH-02 | Login dengan NIM valid | NIM + password benar | 200, session created |
| TC-AUTH-03 | Login password salah | email + wrong password | 401, ERR_AUTH_INVALID_CREDENTIALS |
| TC-AUTH-04 | Login user nonaktif | email user is_active=false | 403, ERR_AUTH_ACCOUNT_INACTIVE |
| TC-AUTH-05 | Rate limit login | 6 attempts dalam 1 menit | 429, ERR_AUTH_RATE_LIMIT |
| TC-AUTH-06 | Logout | valid session | 200, session dihapus |
| TC-AUTH-07 | Akses tanpa session | GET /api/pengajuan tanpa cookie | 401, ERR_AUTH_NOT_AUTHENTICATED |

### 3.2 Workflow Engine — State Transitions

| ID | Test Case | Input | Expected |
|---|---|---|---|
| TC-WF-01 | Transisi valid: pending_staff_prodi → pending_pa | Staff approve TA-01 | Status berubah, notif ke PA |
| TC-WF-02 | Transisi tidak valid: skip step | Staff langsung ke WD1 | ERR_BUS_INVALID_STATE_TRANSITION |
| TC-WF-03 | PA select judul | PA pilih judul_3 | judul_skripsi tercipta, status → pending_kaprodi |
| TC-WF-04 | Reject wajib alasan | Reject tanpa alasan | ERR_VAL_REQUIRED_FIELD |
| TC-WF-05 | Reject bertingkat | WD1 kembalikan ke Sekprodi | status → pending_sekprodi, marker returned_from=wd1 |
| TC-WF-06 | Resubmit setelah revisi | Mahasiswa resubmit | versi baru tercipta, status → pending_staff_prodi |

### 3.3 Authorization & Scope Filtering

| ID | Test Case | Input | Expected |
|---|---|---|---|
| TC-AUTH-SCO-01 | Staff Prodi akses prodinya | GET pengajuan prodinya | 200, data visible |
| TC-AUTH-SCO-02 | Staff Prodi akses prodi lain | GET pengajuan prodi lain | 403, ERR_AUTH_OUTSIDE_SCOPE |
| TC-AUTH-SCO-03 | PA akses pengajuannya | GET pengajuan milik mahasiswanya | 200 |
| TC-AUTH-SCO-04 | PA akses pengajuan bukan miliknya | GET pengajuan PA lain | 403 |
| TC-AUTH-SCO-05 | Mahasiswa akses pengajuan sendiri | GET pengajuannya | 200 |
| TC-AUTH-SCO-06 | Mahasiswa akses pengajuan orang lain | GET pengajuan mahasiswa lain | 403 |

### 3.4 Pengajuan TA-01 — Full Workflow

| ID | Test Case | Expected |
|---|---|---|
| TC-TA01-01 | Submit TA-01 valid (3 judul + 3 dokumen) | 201, status pending_staff_prodi |
| TC-TA01-02 | Submit TA-01 — kurang judul (2) | 422, ERR_VAL_MIN_ITEMS |
| TC-TA01-03 | Submit TA-01 — dokumen kurang | 422, ERR_VAL_REQUIRED_FIELD |
| TC-TA01-04 | Submit TA-01 — sudah ada aktif | 400, ERR_BUS_DUPLICATE_PENGAJUAN |
| TC-TA01-05 | Staff approve | Status → pending_pa, notif PA |
| TC-TA01-06 | PA pilih judul | judul_skripsi created, status → pending_kaprodi |
| TC-TA01-07 | Kaprodi approve | Status → pending_wd1 |
| TC-TA01-08 | WD1 sign | Status selesai, PDF final, QR aktif |
| TC-TA01-09 | Bypass trigger (SLA PA) | Status → bypass_active, bypass PDF generated |
| TC-TA01-10 | Mahasiswa upload bypass | Status → pending_kaprodi, judul tercipta |

### 3.5 Document Generation

| ID | Test Case | Expected |
|---|---|---|
| TC-DOC-01 | Preview PDF setelah submit | PDF tergenerate dengan placeholder kuning |
| TC-DOC-02 | Final PDF setelah sign | TTD scan ter-embed, QR Code aktif |
| TC-DOC-03 | Nomor surat reserved | Format benar, counter increment |
| TC-DOC-04 | Generate 3 dokumen TA-03 | 3 PDF tergenerate setelah WD1 sign |
| TC-DOC-05 | Generate 5 dokumen TA-05 | 5 PDF tergenerate setelah Dekan sign |
| TC-DOC-06 | Dual numbering TA-02 | Nomor SK Fakultas + Nomor Prodi muncul |

### 3.6 Verifikasi Dokumen Publik

| ID | Test Case | Expected |
|---|---|---|
| TC-VER-01 | Token valid | is_valid: true, info dokumen muncul |
| TC-VER-02 | Token tidak valid | is_valid: false |
| TC-VER-03 | Rate limit verifikasi | 11 percobaan dalam 1 menit → 429 |

### 3.7 Nilai Sidang

| ID | Test Case | Expected |
|---|---|---|
| TC-NILAI-01 | Penguji input nilai TA-03 | nilai_sidang tersimpan |
| TC-NILAI-02 | Kedua penguji sudah input TA-03 | Berita Acara ter-regenerate |
| TC-NILAI-03 | Sekretaris input nilai TA-05 | yudisium ter-calculate, dokumen ter-regenerate |
| TC-NILAI-04 | Formula yudisium benar | nilai_akhir = rata-rata 4 penilai |
| TC-NILAI-05 | Bukan penguji yang ditunjuk coba input | 403, ERR_AUTH_NOT_ASSIGNED |

### 3.8 TA-06 Turnitin

| ID | Test Case | Expected |
|---|---|---|
| TC-TA06-01 | Submit dengan similarity 18% (< 25%) | pending_kepala_lab |
| TC-TA06-02 | Kepala Lab approve similarity 18% | Status selesai, sertifikat terbit |
| TC-TA06-03 | Kepala Lab reject similarity 35% | revision_required, revisi_ke=1 |
| TC-TA06-04 | Mahasiswa resubmit (revisi ke-2) | revisi_ke=2, pending_kepala_lab |
| TC-TA06-05 | Reject revisi ke-3 | terminated, notif mahasiswa |
| TC-TA06-06 | Coba resubmit setelah 3x | ERR_BUS_MAX_RETRY_EXCEEDED |

---

## 4. E2E Test Scenarios (Playwright)

### E2E-01: Happy Path TA-01

```typescript
test('TA-01: Full workflow happy path', async ({ page, context }) => {
  // 1. Login mahasiswa
  // 2. Submit TA-01 (3 judul, pilih PA, upload 3 dokumen)
  // 3. Verify status: pending_staff_prodi

  // 4. Login staff prodi
  // 5. Approve
  // 6. Verify status: pending_pa

  // 7. Login PA
  // 8. Pilih judul ke-2
  // 9. Verify status: pending_kaprodi
  // 10. Verify judul_skripsi tercipta

  // 11. Login Kaprodi
  // 12. Approve
  // 13. Verify status: pending_wd1

  // 14. Login WD1
  // 15. TTD (input PIN)
  // 16. Verify status: selesai
  // 17. Verify PDF downloadable
});
```

### E2E-02: Happy Path AK-01

```typescript
test('AK-01: Surat Aktif Kuliah happy path', async ({ page }) => {
  // 1. Login mahasiswa
  // 2. Submit AK-01 (peruntukan + upload UKT)
  // 3. Login staff akademik → approve
  // 4. Login Kabag → approve
  // 5. Login WD1 → TTD
  // 6. Verify dokumen downloadable
});
```

---

## 5. Test Fixtures

```typescript
// tests/fixtures/index.ts

export const fixtures = {
  mahasiswaAktif: {
    nim: '221360001',
    nama_lengkap: 'Aini Fitri Utami',
    status_mahasiswa: 'aktif',
    prodi_kode: 'IH'
  },
  dosenPA: {
    nidn: '0115098501',
    nama_lengkap: 'Dr. Ahmad Fauzi, M.Pd',
    jabatan: 'Lektor'
  },
  staffProdi: {
    nip: '198001012010011001',
    nama_lengkap: 'Budi Santoso, S.Kom',
    prodi_kode: 'IH'
  },
  kaprodi: {
    nidn: '0220077301',
    nama_lengkap: 'Prof. Dr. Siti Aminah, M.Ag',
    structural_position: 'kaprodi'
  },
  sekprodi: {
    nidn: '0315088402',
    nama_lengkap: 'Dr. Hasan Basri, M.Si',
    structural_position: 'sekprodi'
  },
  wd1: {
    nidn: '0410067501',
    nama_lengkap: 'Dr. H. Ahmad Yani, MA',
    structural_position: 'wakil_dekan_1'
  },
  dekan: {
    nidn: '0505066001',
    nama_lengkap: 'Prof. Dr. H. Masrukhin Muhsin, Lc., MA',
    structural_position: 'dekan'
  }
};
```

---

## 6. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml (atau GitLab CI)

test:
  steps:
    - checkout
    - setup Node.js 20
    - npm install
    - npx prisma generate
    - npx prisma migrate deploy (test database)
    - npx prisma db seed
    - npx vitest run          # Unit + Integration tests
    - npx playwright test     # E2E tests (jika butuh browser)

deploy:
  needs: test
  steps:
    - SSH ke server
    - git pull
    - npm install
    - npx prisma migrate deploy
    - npm run build
    - pm2 restart sila
```

---

## 7. Definition of Done (Testing)

Sebuah fitur dianggap **siap untuk production** jika:

- [ ] Unit test untuk semua business logic function (coverage ≥ 80%)
- [ ] Integration test untuk semua API endpoint
- [ ] Happy path E2E test berjalan tanpa error
- [ ] Minimal 1 error scenario test per fitur
- [ ] Authorization test (valid + unauthorized)
- [ ] Semua acceptance criteria di dokumen BPMN terpenuhi
- [ ] Tidak ada test yang di-skip tanpa alasan yang terdokumentasi
