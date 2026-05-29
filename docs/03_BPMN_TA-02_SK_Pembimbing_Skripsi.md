# BPMN TA-02: SK Pembimbing Skripsi

**Kode**: TA-02
**Kategori**: Tugas Akhir
**Scope**: Prodi
**Output**: SK Pembimbing Skripsi (1 dokumen, dual numbering)
**Prasyarat**: TA-01 harus berstatus `selesai`

---

## Workflow Summary

```
Mahasiswa → Staff Prodi (verifikasi) → Sekprodi (tetapkan Pembimbing 1 & 2 + nomor prodi) → WD1 → Dekan (TTD)
```

---

## Aktor

| ID | Aktor | Kondisi |
|---|---|---|
| A1 | Mahasiswa | `mahasiswa.status_mahasiswa = 'aktif'` |
| A2 | Staff Prodi | `system_role = 'staff_prodi'` AND prodi sama |
| A3 | Sekprodi | `structural_positions.position_code = 'sekprodi'` AND prodi sama AND aktif |
| A4 | Wakil Dekan 1 | `structural_positions.position_code = 'wakil_dekan_1'` AND aktif |
| A5 | Dekan | `structural_positions.position_code = 'dekan'` AND aktif |

---

## Step-by-Step Detail

### STEP TA02-01: Mahasiswa Submit

**Step ID**: `TA02-01`
**Status**: (baru) → `pending_staff_prodi`
**Aktor**: A1

#### Prasyarat

```
P1: mahasiswa.status_mahasiswa = 'aktif'
P2: pengajuan TA-01 mahasiswa ini berstatus 'selesai'
P3: TIDAK ADA pengajuan TA-02 aktif untuk mahasiswa ini
P4: semester aktif tersedia
```

#### Input Mahasiswa

Minimal — sebagian besar data auto-fill dari TA-01:

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `judul_skripsi` | text (auto-fill, read-only) | Auto | Dari `judul_skripsi.judul_aktif` |
| `catatan` | textarea | Tidak | Catatan tambahan jika ada |

#### Dokumen Upload

| Dok ID | Nama | Format | Max Size | Wajib |
|---|---|---|---|---|
| `DOK-TA02-01` | Surat Persetujuan Judul (dari TA-01) | Auto-attach | - | Auto |
| `DOK-TA02-02` | KRS Semester Berjalan | PDF | 2 MB | Ya |

#### Process Logic

```
FUNCTION submitTA02(input, files, user):
  // Validate preconditions
  ta01 = QUERY pengajuan_layanan
    WHERE mahasiswa_id = user.mahasiswaId
    AND jenis_layanan_kode = 'TA-01'
    AND status = 'selesai'
  ASSERT ta01 != NULL
    ELSE THROW ERR_BUS_PREREQUISITE_NOT_MET("Pengajuan Judul Skripsi harus selesai terlebih dahulu")

  existingTA02 = QUERY WHERE kode = 'TA-02' AND mahasiswa AND status NOT IN ('selesai','terminated')
  ASSERT existingTA02 == NULL
    ELSE THROW ERR_BUS_DUPLICATE_PENGAJUAN

  // Create pengajuan
  pengajuan = INSERT pengajuan_layanan {
    kode_pengajuan: generateKodePengajuan('TA', semester.tahun),
    status: 'pending_staff_prodi',
    current_step: 'TA02-02'
    // ... standard fields
  }

  // Reserve DUAL numbering
  nomorSkFakultas = reserveNomorSurat(semester.id, 'KP.01.2', 'fakultas', fakultasId)
  // Nomor prodi akan di-input Sekprodi nanti

  // Auto-attach dokumen TA-01
  autoAttachDokumen(pengajuan.id, ta01.finalPdfPath, 'DOK-TA02-01')

  // Standard: save data, files, version, log, notify staff prodi
  ...
```

---

### STEP TA02-02: Staff Prodi Verifikasi

**Step ID**: `TA02-02`
**Status**: `pending_staff_prodi` → `pending_sekprodi`
**Aktor**: A2
**SLA**: 2 hari kerja

#### Actions

| Action | Target Status | Alasan Wajib |
|---|---|---|
| `approve` | `pending_sekprodi` | Tidak |
| `reject_to_submitter` | `revision_required` | Ya |

#### Process Logic

```
Sama pattern dengan TA01-02, hanya target status berbeda: pending_sekprodi
NOTIFY sekprodi { "Pengajuan SK Pembimbing dari {mhs.nama} menunggu penetapan pembimbing" }
```

---

### STEP TA02-03: Sekprodi Tetapkan Pembimbing 1 & 2

**Step ID**: `TA02-03`
**Status**: `pending_sekprodi` → `pending_wd1`
**Aktor**: A3 (Sekprodi)
**SLA**: 3 hari kerja

#### Yang Diinput Sekprodi

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `pembimbing_1_dosen_id` | dosen_picker | Ya | Dosen aktif di fakultas yang sama |
| `pembimbing_2_dosen_id` | dosen_picker | Ya | Dosen aktif, berbeda dari pembimbing 1 |
| `nomor_surat_prodi` | text | Ya | Nomor surat permohonan dari prodi |
| `tanggal_surat_prodi` | date | Ya | Tanggal surat permohonan prodi |

#### Process Logic

```
FUNCTION sekprodiTetapkanPembimbingTA02(pengajuanId, data, user):
  pengajuan = GET WHERE id = pengajuanId AND status = 'pending_sekprodi'
  requireStructuralPosition(user, 'sekprodi', pengajuan.prodi_id)

  // Validate pembimbing
  pembimbing1 = GET dosen WHERE id = data.pembimbing_1_dosen_id AND is_active = true
  pembimbing2 = GET dosen WHERE id = data.pembimbing_2_dosen_id AND is_active = true
  ASSERT pembimbing1 != NULL AND pembimbing2 != NULL
    ELSE THROW ERR_VAL_INVALID_FORMAT("Dosen pembimbing tidak ditemukan")
  ASSERT pembimbing1.id != pembimbing2.id
    ELSE THROW ERR_VAL_DUPLICATE("Pembimbing 1 dan 2 harus berbeda")

  // Create assignments
  INSERT assignments { dosen_id: pembimbing1.id, assignment_type: 'pembimbing_skripsi_1', pengajuan_id }
  INSERT assignments { dosen_id: pembimbing2.id, assignment_type: 'pembimbing_skripsi_2', pengajuan_id }

  // Save nomor prodi (dual numbering — bagian nomor prodi)
  UPDATE pengajuan_data SET field_values.nomor_surat_prodi = data.nomor_surat_prodi
  UPDATE pengajuan_data SET field_values.tanggal_surat_prodi = data.tanggal_surat_prodi

  // Update status
  UPDATE pengajuan SET status = 'pending_wd1', current_step = 'TA02-04'
  logAudit('pengajuan.pembimbing_assigned', metadata: { p1: pembimbing1.nama, p2: pembimbing2.nama })
  NOTIFY wd1 { "SK Pembimbing {mhs.nama} siap untuk approval" }
```

#### Acceptance Criteria

```
AC-TA02-03-01: Sekprodi tetapkan pembimbing berhasil
GIVEN pengajuan TA-02 status "pending_sekprodi"
WHEN Sekprodi pilih Pembimbing 1 = Dr. Ahmad, Pembimbing 2 = Dr. Budi, input nomor+tanggal surat prodi
THEN status berubah "pending_wd1"
  AND assignment pembimbing_skripsi_1 tercipta untuk Dr. Ahmad
  AND assignment pembimbing_skripsi_2 tercipta untuk Dr. Budi
  AND nomor surat prodi tersimpan di pengajuan_data

AC-TA02-03-02: Pembimbing 1 dan 2 sama
WHEN Sekprodi pilih Pembimbing 1 = Dr. Ahmad, Pembimbing 2 = Dr. Ahmad
THEN error ERR_VAL_DUPLICATE "Pembimbing 1 dan 2 harus berbeda"
```

---

### STEP TA02-04: WD1 Approve

**Step ID**: `TA02-04`
**Status**: `pending_wd1` → `pending_dekan`
**Aktor**: A4
**SLA**: 3 hari kerja

#### Actions

| Action | Target Status | Alasan Wajib |
|---|---|---|
| `approve` | `pending_dekan` | Tidak |
| `reject_to_step` (pilih: staff/sekprodi) | sesuai pilihan | Ya |

---

### STEP TA02-05: Dekan TTD Final

**Step ID**: `TA02-05`
**Status**: `pending_dekan` → `selesai`
**Aktor**: A5
**SLA**: 3 hari kerja

#### Process Logic

```
Sama pattern dengan TA01-05 (WD1 sign), hanya:
- Penandatangan = Dekan (bukan WD1)
- Dokumen = SK Pembimbing dengan DUAL NUMBERING:
  - Nomor SK Fakultas (dari reserved number, kode KP.01.2)
  - Nomor Surat Prodi (dari input Sekprodi di step TA02-03)
- Setelah selesai, SK bisa didownload oleh:
  - Mahasiswa (arsip)
  - Pembimbing 1 & 2 (menu "Surat & SK Saya")
  - Staff Prodi (arsip prodi)
```

---

## Penomoran Dual

| Nomor | Scope | Counter | Di-generate Saat | Contoh |
|---|---|---|---|---|
| Nomor SK Fakultas | Fakultas | Per semester per kode KP.01.2 | Mahasiswa submit (reserved) | `023/Un.17/F.III/KP.01.2/V/2026` |
| Nomor Surat Prodi | Prodi | Per semester per prodi | Sekprodi input manual | `IH/PP.00.9/045/V/2026` (format prodi) |
