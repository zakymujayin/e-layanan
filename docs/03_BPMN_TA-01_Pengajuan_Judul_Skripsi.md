# BPMN TA-01: Pengajuan Judul Skripsi

**Kode**: TA-01
**Kategori**: Tugas Akhir
**Scope**: Prodi
**Output**: Surat Persetujuan Judul Skripsi (1 dokumen) — atau Formulir Bypass jika SLA terlewat
**Referensi Konvensi**: Batch 1 Bagian 3.4 (Status), Bagian 3.5 (Actions)

---

## Workflow Summary

```
Mahasiswa → Staff Prodi (verifikasi) → PA (pilih 1 judul) → Kaprodi (approve) → WD1 (TTD)
```

**Bypass Path** (jika PA tidak respon dalam SLA):
```
[SLA expired] → Mahasiswa offline ke PA → Upload form bypass → Kaprodi → WD1
```

---

## Aktor

| ID | Aktor | Kondisi |
|---|---|---|
| A1 | Mahasiswa | `users.system_role = 'mahasiswa'` AND `mahasiswa.status_mahasiswa = 'aktif'` |
| A2 | Staff Prodi | `users.system_role = 'staff_prodi'` AND `users.prodi_id = pengajuan.prodi_id` |
| A3 | Pembimbing Akademik (PA) | `users.system_role = 'dosen'` AND `assignments.type = 'dosen_pa'` AND `assignments.mahasiswa_id = pengajuan.mahasiswa_id` |
| A4 | Kaprodi | `users.system_role = 'dosen'` AND `structural_positions.position_code = 'kaprodi'` AND `structural_positions.prodi_id = pengajuan.prodi_id` AND `structural_positions.is_active = true` |
| A5 | Wakil Dekan 1 | `users.system_role = 'dosen'` AND `structural_positions.position_code = 'wakil_dekan_1'` AND `structural_positions.is_active = true` |
| A6 | Sistem (cron) | Scheduled job harian |

---

## Step-by-Step Detail

### STEP TA01-01: Mahasiswa Submit Pengajuan

**Step ID**: `TA01-01`
**Status Pengajuan**: (baru) → `submitted` → `pending_staff_prodi`
**Aktor**: A1 (Mahasiswa)
**SLA**: Tidak ada (mahasiswa submit kapan saja)

#### Prasyarat (Preconditions)

```
P1: mahasiswa.status_mahasiswa = 'aktif'
P2: TIDAK ADA pengajuan TA-01 dengan mahasiswa_id ini yang status-nya BUKAN ('selesai', 'terminated')
P3: academic_periods dengan status = 'active' HARUS ADA tepat 1
```

#### Input dari Mahasiswa

| Field ID | Nama Field | Tipe | Wajib | Validasi |
|---|---|---|---|---|
| `judul_1` | Judul Skripsi 1 | textarea | Ya | min 10 karakter, max 500 |
| `judul_2` | Judul Skripsi 2 | textarea | Ya | min 10 karakter, max 500 |
| `judul_3` | Judul Skripsi 3 | textarea | Ya | min 10 karakter, max 500 |
| `judul_4` | Judul Skripsi 4 | textarea | Tidak | min 10 karakter jika diisi, max 500 |
| `judul_5` | Judul Skripsi 5 | textarea | Tidak | min 10 karakter jika diisi, max 500 |
| `pa_dosen_id` | Pembimbing Akademik | dosen_picker | Ya | Harus valid dosen aktif di fakultas yang sama |

#### Dokumen Upload

| Dok ID | Nama | Format | Max Size | Wajib |
|---|---|---|---|---|
| `DOK-TA01-01` | Transkrip Nilai Sementara | PDF | 2 MB | Ya |
| `DOK-TA01-02` | KHS Semester Terakhir | PDF | 2 MB | Ya |
| `DOK-TA01-03` | Bukti Pembayaran UKT | PDF, JPG, PNG | 2 MB | Ya |

#### Process Logic (Pseudocode)

```
FUNCTION submitTA01(input, files, user):
  // 1. Validate preconditions
  ASSERT user.mahasiswa.statusMahasiswa == 'aktif'
    ELSE THROW ERR_BUS_PREREQUISITE_NOT_MET("Status mahasiswa harus aktif")

  existingPengajuan = QUERY pengajuan_layanan
    WHERE mahasiswa_id = user.mahasiswaId
    AND jenis_layanan_kode = 'TA-01'
    AND status NOT IN ('selesai', 'terminated')
  ASSERT existingPengajuan == NULL
    ELSE THROW ERR_BUS_DUPLICATE_PENGAJUAN("Anda sudah memiliki pengajuan TA-01 yang aktif")

  activeSemester = QUERY academic_periods WHERE status = 'active' LIMIT 1
  ASSERT activeSemester != NULL
    ELSE THROW ERR_BUS_SEMESTER_NOT_ACTIVE

  // 2. Validate input
  VALIDATE input WITH Zod schema (judul_1..3 required, judul_4..5 optional, pa_dosen_id required)
  VALIDATE files: semua DOK wajib ter-upload, format & size sesuai

  // 3. Validate PA exists
  pa = QUERY dosen WHERE id = input.pa_dosen_id AND is_active = true
  ASSERT pa != NULL
    ELSE THROW ERR_VAL_INVALID_FORMAT("Dosen PA tidak ditemukan atau tidak aktif")

  // 4. Create pengajuan
  pengajuan = INSERT pengajuan_layanan {
    kode_pengajuan: generateKodePengajuan('TA', activeSemester.tahun),  // "TA-2026-0001"
    mahasiswa_id: user.mahasiswaId,
    jenis_layanan_id: getLayananId('TA-01'),
    academic_period_id: activeSemester.id,
    scope_level: 'prodi',
    fakultas_id: user.mahasiswa.prodi.fakultasId,
    prodi_id: user.mahasiswa.prodiId,
    status: 'pending_staff_prodi',
    current_step: 'TA01-02',
    created_at: NOW()
  }

  // 5. Reserve nomor surat (Srikandi pattern)
  nomorSurat = reserveNomorSurat(activeSemester.id, 'PP.00.9', 'prodi', pengajuan.prodi_id)

  // 6. Save input data
  INSERT pengajuan_data { pengajuan_id, field_values: JSON(input) }

  // 7. Save uploaded files
  FOR EACH file IN files:
    SAVE file TO /storage/pengajuan/{activeSemester.id}/{pengajuan.id}/uploads/
    INSERT pengajuan_dokumen { pengajuan_id, dokumen_persyaratan_id, file_path, versi: 1 }

  // 8. Create assignment (PA)
  INSERT assignments {
    dosen_id: input.pa_dosen_id,
    mahasiswa_id: user.mahasiswaId,
    assignment_type: 'dosen_pa',
    pengajuan_id: pengajuan.id,
    is_active: true
  }

  // 9. Create version snapshot
  INSERT pengajuan_versi {
    pengajuan_id, versi_ke: 1,
    data_snapshot: JSON(input + fileRefs),
    dibuat_oleh: user.id
  }

  // 10. Audit log
  logAudit(action: 'pengajuan.submitted', entityType: 'pengajuan_layanan', entityId: pengajuan.id)

  // 11. Notify Staff Prodi
  NOTIFY staffProdi(pengajuan.prodi_id) {
    channel: [in_app, email],
    severity: info,
    message: "Pengajuan judul skripsi baru dari {mahasiswa.namaLengkap}"
  }

  RETURN pengajuan
```

#### Acceptance Criteria

```
AC-TA01-01-01: Submit berhasil (happy path)
GIVEN mahasiswa "Aini" status aktif, tidak punya pengajuan TA-01 aktif, semester aktif ada
WHEN Aini submit dengan 3 judul valid + pilih PA "Dr. Ahmad" + upload 3 dokumen wajib
THEN pengajuan tercipta status "pending_staff_prodi"
  AND kode "TA-2026-XXXX" ter-generate
  AND nomor surat di-reserve
  AND assignment dosen_pa tercipta untuk Dr. Ahmad
  AND pengajuan_versi v1 tercipta
  AND pengajuan_log "submitted" tercatat
  AND notifikasi terkirim ke Staff Prodi (in_app + email)

AC-TA01-01-02: Submit gagal — judul kurang dari 3
GIVEN mahasiswa "Aini" status aktif
WHEN Aini submit dengan hanya 2 judul
THEN error ERR_VAL_MIN_ITEMS "Minimal 3 judul"
  AND pengajuan TIDAK tercipta

AC-TA01-01-03: Submit gagal — sudah ada pengajuan aktif
GIVEN mahasiswa "Aini" sudah punya pengajuan TA-01 status "pending_pa"
WHEN Aini submit pengajuan TA-01 baru
THEN error ERR_BUS_DUPLICATE_PENGAJUAN
  AND pengajuan baru TIDAK tercipta

AC-TA01-01-04: Submit gagal — mahasiswa status cuti
GIVEN mahasiswa "Budi" status "cuti"
WHEN Budi submit pengajuan TA-01
THEN error ERR_BUS_PREREQUISITE_NOT_MET "Status mahasiswa harus aktif"
```

---

### STEP TA01-02: Staff Prodi Verifikasi Berkas

**Step ID**: `TA01-02`
**Status Pengajuan**: `pending_staff_prodi`
**Aktor**: A2 (Staff Prodi)
**SLA**: 2 hari kerja

#### Actions Tersedia

| Action | Target Status | Alasan Wajib | Konfirmasi |
|---|---|---|---|
| `approve` | `pending_pa` | Tidak | Tidak |
| `reject_to_submitter` | `revision_required` | Ya | Ya (Alert Dialog) |

#### Data yang Dilihat Staff

- Seluruh field input mahasiswa (judul 1-5, PA yang dipilih)
- Dokumen yang di-upload (bisa buka/download)
- Data mahasiswa (NIM, nama, prodi, semester)
- Live preview dokumen (dengan placeholder kuning)

#### Yang Diinput Staff

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `catatan` | textarea | Tidak (wajib jika reject) | Catatan untuk mahasiswa atau approver selanjutnya |

#### Process Logic

```
FUNCTION staffVerifikasiTA01(pengajuanId, action, data, user):
  pengajuan = GET pengajuan_layanan WHERE id = pengajuanId
  ASSERT pengajuan.status == 'pending_staff_prodi'
    ELSE THROW ERR_BUS_INVALID_STATE_TRANSITION

  requireRole(user, 'staff_prodi')
  requireScope(user, pengajuan)  // staff prodi hanya akses prodinya

  IF action == 'approve':
    UPDATE pengajuan SET status = 'pending_pa', current_step = 'TA01-03'
    scheduleSla(pengajuan, stepId: 'TA01-03', days: 7, consequence: 'bypass')
    logAudit('pengajuan.approved', ...)
    NOTIFY pa(pengajuan) { "Pengajuan judul dari {mhs.nama} menunggu Anda pilih 1 judul" }

  ELSE IF action == 'reject_to_submitter':
    ASSERT data.alasan IS NOT EMPTY
      ELSE THROW ERR_VAL_REQUIRED_FIELD("Alasan penolakan wajib diisi")
    UPDATE pengajuan SET status = 'revision_required'
    logAudit('pengajuan.rejected', metadata: { alasan: data.alasan, target: 'submitter' })
    NOTIFY mahasiswa { "Pengajuan Anda perlu revisi: {data.alasan}" }
```

#### Acceptance Criteria

```
AC-TA01-02-01: Staff approve berhasil
GIVEN pengajuan TA-01 status "pending_staff_prodi"
  AND user adalah staff_prodi dari prodi yang sama
WHEN staff klik approve
THEN status berubah "pending_pa"
  AND SLA timer 7 hari aktif untuk PA
  AND notifikasi ke PA (in_app + email)
  AND audit log "pengajuan.approved" tercatat

AC-TA01-02-02: Staff reject berhasil
GIVEN pengajuan status "pending_staff_prodi"
WHEN staff reject dengan alasan "Transkrip tidak terbaca"
THEN status berubah "revision_required"
  AND notifikasi ke mahasiswa dengan alasan
  AND audit log tercatat dengan alasan

AC-TA01-02-03: Staff reject tanpa alasan
WHEN staff reject tanpa mengisi alasan
THEN error ERR_VAL_REQUIRED_FIELD "Alasan penolakan wajib diisi"
  AND status TIDAK berubah

AC-TA01-02-04: Staff prodi lain mencoba akses
GIVEN staff_prodi dari prodi "IPII"
  AND pengajuan dari mahasiswa prodi "IH"
WHEN staff mencoba approve
THEN error ERR_AUTH_OUTSIDE_SCOPE
```

---

### STEP TA01-03: PA Pilih 1 Judul

**Step ID**: `TA01-03`
**Status Pengajuan**: `pending_pa`
**Aktor**: A3 (Pembimbing Akademik)
**SLA**: 7 hari kerja → **trigger bypass jika terlewat**

#### Actions Tersedia

| Action | Target Status | Alasan Wajib | Konfirmasi |
|---|---|---|---|
| `select_judul` | `pending_kaprodi` | Tidak | Tidak |
| `reject_to_submitter` | `revision_required` | Ya | Ya |

#### UI Khusus PA

PA melihat daftar 3-5 judul dengan **radio button** untuk pilih 1:

```
○ Judul 1: "Analisis Hadis tentang Pendidikan Karakter..."
○ Judul 2: "Kajian Tafsir Al-Quran Surat Al-Hujurat..."
● Judul 3: "Studi Komparatif Metode Tafsir Klasik dan Modern..."  ← dipilih
○ Judul 4: "Pemikiran Ibn Kathir tentang Konsep Jihad..."
```

#### Yang Diinput PA

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `selected_judul_index` | radio (1-5) | Ya (jika action = select_judul) | Index judul yang dipilih |
| `catatan` | textarea | Tidak | Catatan untuk mahasiswa |

#### Process Logic

```
FUNCTION paPilihJudulTA01(pengajuanId, action, data, user):
  pengajuan = GET pengajuan_layanan WHERE id = pengajuanId
  ASSERT pengajuan.status == 'pending_pa'
    ELSE THROW ERR_BUS_INVALID_STATE_TRANSITION

  // Cek PA adalah dosen yang ditunjuk
  assignment = QUERY assignments
    WHERE dosen_id = user.dosenId
    AND mahasiswa_id = pengajuan.mahasiswa_id
    AND assignment_type = 'dosen_pa'
    AND is_active = true
  ASSERT assignment != NULL
    ELSE THROW ERR_AUTH_NOT_ASSIGNED("Anda bukan PA untuk mahasiswa ini")

  IF action == 'select_judul':
    // Validate selected index
    judulList = GET pengajuan_data.field_values.judul_*
    ASSERT data.selected_judul_index >= 1 AND data.selected_judul_index <= judulList.length
      ELSE THROW ERR_VAL_INVALID_ENUM("Pilihan judul tidak valid")

    selectedJudul = judulList[data.selected_judul_index - 1]

    // Create living entity: judul_skripsi
    judulSkripsi = INSERT judul_skripsi {
      mahasiswa_id: pengajuan.mahasiswa_id,
      judul_aktif: selectedJudul,
      status: 'aktif',
      current_version: 1
    }

    INSERT judul_skripsi_history {
      judul_skripsi_id: judulSkripsi.id,
      versi_ke: 1,
      judul_text: selectedJudul,
      diubah_oleh: user.id,
      konteks_perubahan: 'Dipilih PA dari pengajuan TA-01',
      referensi_pengajuan_id: pengajuan.id
    }

    // Update pengajuan
    UPDATE pengajuan SET
      status = 'pending_kaprodi',
      current_step = 'TA01-04'
    cancelSla(pengajuan, stepId: 'TA01-03')  // cancel SLA timer PA
    logAudit('pengajuan.judul_selected', metadata: { judul: selectedJudul })
    NOTIFY kaprodi(pengajuan.prodi_id) { "PA sudah pilih judul untuk {mhs.nama}" }
    NOTIFY mahasiswa { "PA Anda memilih judul: '{selectedJudul}'" }

  ELSE IF action == 'reject_to_submitter':
    ASSERT data.alasan IS NOT EMPTY
    UPDATE pengajuan SET status = 'revision_required'
    cancelSla(pengajuan, stepId: 'TA01-03')
    logAudit('pengajuan.rejected', ...)
    NOTIFY mahasiswa { "PA menolak pengajuan: {data.alasan}" }
```

#### Acceptance Criteria

```
AC-TA01-03-01: PA pilih judul berhasil
GIVEN pengajuan status "pending_pa", PA = Dr. Ahmad
WHEN Dr. Ahmad pilih judul ke-3 dari 5 judul
THEN status berubah "pending_kaprodi"
  AND record judul_skripsi tercipta (judul_aktif = judul ke-3)
  AND record judul_skripsi_history v1 tercipta
  AND SLA timer PA di-cancel
  AND notifikasi ke Kaprodi + Mahasiswa

AC-TA01-03-02: PA yang bukan PA mahasiswa ini mencoba
GIVEN Dr. Budi BUKAN PA untuk Aini
WHEN Dr. Budi mencoba select_judul
THEN error ERR_AUTH_NOT_ASSIGNED
```

---

### STEP TA01-03B: Bypass (SLA PA Terlewat)

**Step ID**: `TA01-03B`
**Status Pengajuan**: `pending_pa` → `bypass_active` → `pending_kaprodi`
**Aktor**: A6 (Sistem cron) + A1 (Mahasiswa)
**Trigger**: SLA 7 hari kerja terlewat

#### Process Logic (System Trigger)

```
FUNCTION triggerBypassTA01(pengajuanId):
  // Dipanggil oleh cron job checkExpiredSla()
  pengajuan = GET pengajuan_layanan WHERE id = pengajuanId
  ASSERT pengajuan.status == 'pending_pa'

  // 1. Update status
  UPDATE pengajuan SET status = 'bypass_active'

  // 2. Generate Formulir Bypass PDF
  bypassForm = generateBypassFormPdf(pengajuan)
  SAVE bypassForm TO /storage/pengajuan/.../generated/bypass_form.pdf

  // 3. Log & notify
  logAudit('pengajuan.bypass_triggered')
  NOTIFY mahasiswa { "PA belum respon 7 hari. Mode bypass aktif, download formulir." }
  NOTIFY pa { "SLA terlewat untuk pengajuan {mhs.nama}." }
  NOTIFY staffProdi { "Bypass aktif untuk pengajuan {mhs.nama}." }
```

#### Process Logic (Mahasiswa Upload Form Bypass)

```
FUNCTION uploadBypassTA01(pengajuanId, data, files, user):
  pengajuan = GET pengajuan_layanan WHERE id = pengajuanId
  ASSERT pengajuan.status == 'bypass_active'
  ASSERT user.mahasiswaId == pengajuan.mahasiswa_id

  // 1. Validate upload
  ASSERT files.bypass_form EXISTS AND files.bypass_form.type IN ('application/pdf', 'image/jpeg', 'image/png')
    ELSE THROW ERR_VAL_FILE_TYPE_NOT_ALLOWED
  ASSERT data.selected_judul_index >= 1 AND data.selected_judul_index <= jumlahJudul

  // 2. Save bypass form
  SAVE files.bypass_form TO /storage/.../uploads/bypass_form_signed.pdf

  // 3. Create judul_skripsi (sama seperti PA pilih)
  selectedJudul = judulList[data.selected_judul_index - 1]
  INSERT judul_skripsi { mahasiswa_id, judul_aktif: selectedJudul, status: 'aktif' }
  INSERT judul_skripsi_history { versi_ke: 1, konteks_perubahan: 'Dipilih PA via bypass' }

  // 4. Update pengajuan — skip ke Kaprodi
  UPDATE pengajuan SET
    status = 'pending_kaprodi',
    current_step = 'TA01-04',
    metadata = { bypass: true, bypass_form_path: filePath }

  logAudit('pengajuan.bypass_completed')
  NOTIFY kaprodi { "Pengajuan bypass dari {mhs.nama}, judul dipilih via TTD basah PA" }
```

#### Acceptance Criteria

```
AC-TA01-03B-01: Bypass trigger otomatis
GIVEN pengajuan status "pending_pa" selama 7 hari kerja, PA tidak ada aksi
WHEN cron job harian berjalan
THEN status berubah "bypass_active"
  AND formulir bypass PDF ter-generate
  AND notifikasi ke mahasiswa + PA + staff prodi

AC-TA01-03B-02: Mahasiswa upload form bypass
GIVEN pengajuan status "bypass_active"
WHEN mahasiswa upload form bypass yang sudah di-TTD PA + pilih judul ke-2
THEN status berubah "pending_kaprodi"
  AND judul_skripsi tercipta (judul_aktif = judul ke-2)
  AND metadata pengajuan menandai bypass = true
```

---

### STEP TA01-04: Kaprodi Approve

**Step ID**: `TA01-04`
**Status Pengajuan**: `pending_kaprodi`
**Aktor**: A4 (Kaprodi)
**SLA**: 3 hari kerja

#### Actions Tersedia

| Action | Target Status | Alasan Wajib | Konfirmasi |
|---|---|---|---|
| `approve` | `pending_wd1` | Tidak | Tidak |
| `reject_to_step` (→ PA) | `pending_pa` | Ya | Ya |
| `reject_to_submitter` | `revision_required` | Ya | Ya |

#### Yang Dilihat Kaprodi

- Seluruh data pengajuan + judul yang dipilih PA
- Catatan PA (jika ada)
- Jika bypass: badge "Dipilih via bypass" + form bypass yang di-upload

#### Process Logic

```
FUNCTION kaprodiApproveTA01(pengajuanId, action, data, user):
  pengajuan = GET pengajuan_layanan WHERE id = pengajuanId
  ASSERT pengajuan.status == 'pending_kaprodi'

  requireStructuralPosition(user, 'kaprodi', pengajuan.prodi_id)

  IF action == 'approve':
    UPDATE pengajuan SET status = 'pending_wd1', current_step = 'TA01-05'
    logAudit('pengajuan.approved')
    NOTIFY wd1 { "Pengajuan judul {mhs.nama} siap untuk TTD" }

  ELSE IF action == 'reject_to_step' AND data.target == 'pending_pa':
    ASSERT data.alasan IS NOT EMPTY
    UPDATE pengajuan SET status = 'pending_pa'
    scheduleSla(pengajuan, stepId: 'TA01-03', days: 7, consequence: 'bypass')
    logAudit('pengajuan.rejected', metadata: { target: 'pa', alasan: data.alasan })
    NOTIFY pa { "Kaprodi mengembalikan pengajuan: {data.alasan}" }

  ELSE IF action == 'reject_to_submitter':
    ASSERT data.alasan IS NOT EMPTY
    UPDATE pengajuan SET status = 'revision_required'
    // Delete judul_skripsi yang sudah dibuat (karena harus pilih ulang)
    UPDATE judul_skripsi SET status = 'dibatalkan' WHERE mahasiswa_id AND pengajuan_ref
    logAudit('pengajuan.rejected', metadata: { target: 'submitter', alasan: data.alasan })
    NOTIFY mahasiswa { "Kaprodi menolak pengajuan: {data.alasan}" }
```

---

### STEP TA01-05: Wakil Dekan 1 TTD Final

**Step ID**: `TA01-05`
**Status Pengajuan**: `pending_wd1`
**Aktor**: A5 (Wakil Dekan 1)
**SLA**: 3 hari kerja

#### Actions Tersedia

| Action | Target Status | Alasan Wajib | Konfirmasi |
|---|---|---|---|
| `sign` | `selesai` | Tidak | Ya (konfirmasi PIN/password) |
| `reject_to_step` (pilih: staff/PA/kaprodi) | sesuai pilihan | Ya | Ya |

#### Process Logic

```
FUNCTION wd1SignTA01(pengajuanId, action, data, user):
  pengajuan = GET pengajuan_layanan WHERE id = pengajuanId
  ASSERT pengajuan.status == 'pending_wd1'
  requireStructuralPosition(user, 'wakil_dekan_1')

  IF action == 'sign':
    // Cek WD1 sudah upload TTD scan
    ttdScan = GET ttd_scan WHERE user_id = user.id
    ASSERT ttdScan != NULL
      ELSE THROW ERR_BUS_TTD_NOT_UPLOADED

    // 1. Finalisasi dokumen
    finalPdf = generateFinalPdf(pengajuan, {
      nomorSurat: pengajuan.reserved_nomor_surat,  // finalize reserved number
      ttdScan: ttdScan.file_path,
      qrCode: generateQrCode(pengajuan),
      token: generateVerificationToken()
    })
    SAVE finalPdf TO /storage/.../generated/{kode}_persetujuan-judul_final.pdf

    // 2. Activate QR Code & token
    INSERT dokumen_verifikasi {
      pengajuan_id, nomor_surat, token, qr_url,
      is_active: true, created_at: NOW()
    }

    // 3. Finalize nomor surat (dari reserved → active)
    UPDATE penomoran_counter SET status = 'active' WHERE pengajuan_id

    // 4. Update pengajuan
    UPDATE pengajuan SET status = 'selesai', signed_at = NOW(), signed_by = user.id

    // 5. Log & notify
    logAudit('pengajuan.signed')
    NOTIFY mahasiswa {
      channel: [in_app, email],
      severity: success,
      message: "Surat Persetujuan Judul Skripsi Anda sudah jadi! Silakan download."
    }

  ELSE IF action == 'reject_to_step':
    // Reject bertingkat: WD1 pilih target role
    ASSERT data.target_status IN ('pending_staff_prodi', 'pending_pa', 'pending_kaprodi')
    ASSERT data.alasan IS NOT EMPTY
    UPDATE pengajuan SET
      status = data.target_status,
      metadata.returned_from = 'wd1'
    logAudit('pengajuan.rejected', metadata: { returned_from: 'wd1', target: data.target_status })
    NOTIFY targetRole { "WD1 mengembalikan pengajuan: {data.alasan}" }
```

#### Acceptance Criteria

```
AC-TA01-05-01: WD1 TTD berhasil
GIVEN pengajuan status "pending_wd1", WD1 sudah upload TTD scan
WHEN WD1 klik "Tanda Tangan" dan konfirmasi
THEN status berubah "selesai"
  AND PDF final ter-generate dengan TTD scan, QR Code aktif, token verifikasi
  AND nomor surat final (dari reserved)
  AND notifikasi sukses ke mahasiswa

AC-TA01-05-02: WD1 belum upload TTD scan
GIVEN WD1 belum upload TTD scan ke profil
WHEN WD1 klik "Tanda Tangan"
THEN error ERR_BUS_TTD_NOT_UPLOADED

AC-TA01-05-03: WD1 reject ke Sekprodi (tidak valid untuk TA-01)
GIVEN pengajuan TA-01 (tidak ada step Sekprodi)
WHEN WD1 reject dengan target "pending_sekprodi"
THEN error ERR_BUS_INVALID_STATE_TRANSITION (target tidak valid untuk TA-01)
```

---

### STEP TA01-06: Mahasiswa Revisi & Resubmit

**Step ID**: `TA01-06`
**Status Pengajuan**: `revision_required` → `pending_staff_prodi`
**Aktor**: A1 (Mahasiswa)
**Trigger**: Pengajuan dikembalikan dari step manapun

#### Process Logic

```
FUNCTION resubmitTA01(pengajuanId, input, files, user):
  pengajuan = GET pengajuan_layanan WHERE id = pengajuanId
  ASSERT pengajuan.status == 'revision_required'
  ASSERT user.mahasiswaId == pengajuan.mahasiswa_id

  // 1. Update data pengajuan
  UPDATE pengajuan_data SET field_values = JSON(input)

  // 2. Update/add files (jika ada perubahan)
  FOR EACH file IN files:
    // Overwrite file lama atau add new
    UPSERT pengajuan_dokumen { ... versi: currentVersi + 1 }

  // 3. Create new version snapshot
  newVersi = currentVersi + 1
  INSERT pengajuan_versi {
    pengajuan_id, versi_ke: newVersi,
    data_snapshot: JSON(input + fileRefs),
    alasan_perubahan: "Revisi setelah penolakan"
  }

  // 4. Reset status — workflow ulang dari Staff Prodi
  UPDATE pengajuan SET
    status = 'pending_staff_prodi',
    current_step = 'TA01-02'

  logAudit('pengajuan.resubmitted', metadata: { versi: newVersi })
  NOTIFY staffProdi { "Pengajuan revisi dari {mhs.nama} (versi {newVersi})" }
```

---

## Status Transition Diagram

```
                    ┌──────────────────────────────────────────────┐
                    │                                              │
                    ▼                                              │
(baru) ──► pending_staff_prodi ──► pending_pa ──► pending_kaprodi ──► pending_wd1 ──► selesai
                    │                   │              │                  │
                    │                   │              │                  │
                    ▼                   ▼              ▼                  │
              revision_required ◄──────────────────────────────────────┘
                    │                   │
                    │            bypass_active
                    │                   │
                    ▼                   ▼
              (resubmit)        pending_kaprodi
                    │
                    ▼
           pending_staff_prodi (ulang)
```

---

## SLA Summary

| Step | Aktor | SLA | Konsekuensi |
|---|---|---|---|
| TA01-02 | Staff Prodi | 2 hari kerja | Reminder (hari ke-1) |
| TA01-03 | PA | 7 hari kerja | **Bypass** (auto-trigger) |
| TA01-04 | Kaprodi | 3 hari kerja | Reminder + escalation ke Sekprodi |
| TA01-05 | WD1 | 3 hari kerja | Reminder + escalation ke Dekan |

---

## Konfigurasi Admin

| Parameter | Default | Configurable |
|---|---|---|
| Min judul | 3 | Ya |
| Max judul | 5 | Ya |
| SLA Staff Prodi | 2 hari | Ya |
| SLA PA | 7 hari | Ya |
| SLA Kaprodi | 3 hari | Ya |
| SLA WD1 | 3 hari | Ya |
| Dokumen wajib | 3 dokumen (lihat DOK-TA01-*) | Ya (admin bisa add/remove) |
| Kode klasifikasi surat | PP.00.9 | Ya |
