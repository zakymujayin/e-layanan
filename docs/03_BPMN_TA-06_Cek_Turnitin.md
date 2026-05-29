# BPMN TA-06: Cek Turnitin

**Kode**: TA-06
**Kategori**: Tugas Akhir
**Scope**: Prodi (via Kepala Laboratorium)
**Output**: Surat Keterangan Hasil Uji Plagiarisme (1 dokumen)
**Prasyarat**: Tidak ada prasyarat layanan TA lain (bisa diajukan kapan saja selama skripsi sudah ada)

---

## Workflow Summary

```
Mahasiswa → Kepala Lab
  ├─ [LOLOS ≤ batas%] → Sertifikat terbit
  └─ [TIDAK LOLOS > batas%] → Mahasiswa revisi draft → Upload ulang (max 3x)
```

---

## Aktor

| ID | Aktor | Kondisi |
|---|---|---|
| A1 | Mahasiswa | `status_mahasiswa = 'aktif'` |
| A2 | Kepala Lab | `structural_positions.position_code = 'kepala_lab'` AND aktif |

---

## Step-by-Step Detail

### STEP TA06-01: Mahasiswa Submit

**Step ID**: `TA06-01`
**Status**: (baru) → `pending_kepala_lab`

#### Prasyarat

```
P1: mahasiswa.status_mahasiswa = 'aktif'
P2: TIDAK ADA pengajuan TA-06 aktif yang masih pending atau revision_required
P3: Jika sudah ada pengajuan TA-06 sebelumnya yang selesai (lolos), tidak perlu submit lagi
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `judul_skripsi` | text (auto-fill) | Auto | Dari `judul_skripsi.judul_aktif` |
| `submission_id_turnitin` | text | Ya | ID submission dari akun Turnitin mahasiswa |
| `url_turnitin` | url | Ya | Link ke hasil Turnitin |
| `similarity_percentage` | number | Ya | 0-100 (% yang dilaporkan Turnitin) |

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-TA06-01` | Draft Skripsi yang Disubmit ke Turnitin | PDF | 15 MB | Ya |
| `DOK-TA06-02` | Screenshot Hasil Turnitin | PDF, JPG, PNG | 2 MB | Ya |

#### Process Logic

```
FUNCTION submitTA06(input, files, user):
  // Validate belum ada pengajuan aktif
  existing = QUERY WHERE kode='TA-06' AND mahasiswa_id AND status IN ('pending_kepala_lab','revision_required')
  ASSERT existing == NULL ELSE THROW ERR_BUS_DUPLICATE_PENGAJUAN

  // Auto-fill judul
  judulSkripsi = GET judul_skripsi WHERE mahasiswa_id = user.mahasiswaId AND status = 'aktif'
  // judulSkripsi bisa null jika TA-01 belum selesai (TA-06 tidak wajib menunggu TA-01)

  pengajuan = INSERT pengajuan_layanan {
    status: 'pending_kepala_lab',
    current_step: 'TA06-02',
    revisi_ke: 1  // counter revisi, mulai dari 1
  }

  logAudit('pengajuan.submitted')
  NOTIFY kepalaLab { "Ada pengajuan cek Turnitin baru dari {mhs.nama}. Similarity: {similarity}%" }
```

---

### STEP TA06-02: Kepala Lab Review & Keputusan

**Step ID**: `TA06-02`
**Status**: `pending_kepala_lab` → `selesai` atau `revision_required`
**Aktor**: A2 (Kepala Lab)
**SLA**: 3 hari kerja

#### Batas Similarity

- **Default**: 25% (configurable oleh admin/Kepala Lab)
- Jika similarity_percentage ≤ batas → **LOLOS**
- Jika similarity_percentage > batas → **TIDAK LOLOS** (revisi)

#### Data yang Dilihat Kepala Lab

- Input mahasiswa (submission ID, URL, persentase)
- Screenshot hasil Turnitin
- Draft skripsi
- Counter revisi (revisi ke berapa sekarang)

#### Actions

| Action | Target Status | Syarat |
|---|---|---|
| `approve` | `selesai` | Similarity ≤ batas |
| `reject_to_submitter` | `revision_required` | Similarity > batas, revisi_ke < 3 |
| `terminate` | `terminated` | Revisi ke-3 masih tidak lolos |

#### Process Logic

```
FUNCTION kepalaLabReviewTA06(pengajuanId, action, data, user):
  pengajuan = GET WHERE id = pengajuanId AND status = 'pending_kepala_lab'
  requireStructuralPosition(user, 'kepala_lab')

  batasSimilarity = getConfigValue('turnitin_batas_similarity') ?? 25  // default 25%
  revisiKe = pengajuan.revisi_ke

  IF action == 'approve':
    // Generate sertifikat Turnitin
    sertifikat = generateTurnitinSertifikat(pengajuan, {
      similarityPercentage: pengajuan.data.similarity_percentage,
      submissionId: pengajuan.data.submission_id_turnitin,
      tanggalCek: TODAY,
      keputusan: 'LOLOS'
    })

    UPDATE pengajuan SET status = 'selesai'
    logAudit('pengajuan.signed')
    NOTIFY mahasiswa { severity: success, message: "Skripsi Anda LOLOS cek Turnitin ({similarity}%). Sertifikat bisa didownload." }

  ELSE IF action == 'reject_to_submitter':
    ASSERT data.alasan IS NOT EMPTY
    ASSERT revisiKe < 3
      ELSE:
        // Sudah 3x, harus terminate
        THROW ERR_BUS_MAX_RETRY_EXCEEDED("Anda sudah 3x revisi. Pengajuan akan dihentikan.")

    UPDATE pengajuan SET status = 'revision_required'
    logAudit('pengajuan.rejected', metadata: { revisi_ke: revisiKe, similarity: similarity })
    NOTIFY mahasiswa {
      severity: warning,
      message: "Similarity {similarity}% > batas {batas}%. Revisi ke-{revisiKe}. Sisa kesempatan: {3 - revisiKe}x"
    }

  ELSE IF action == 'terminate':
    // Khusus jika revisi_ke == 3 dan masih tidak lolos
    UPDATE pengajuan SET status = 'terminated'
    logAudit('pengajuan.terminated', metadata: { alasan: 'Max revisi terlampaui' })
    NOTIFY mahasiswa { severity: error, message: "Pengajuan Turnitin dihentikan setelah 3x revisi." }
```

---

### STEP TA06-03: Mahasiswa Upload Ulang (Revisi)

**Step ID**: `TA06-03`
**Status**: `revision_required` → `pending_kepala_lab`
**Aktor**: A1 (Mahasiswa)
**Trigger**: Mahasiswa sudah revisi draft (memperbaiki similarity) dan upload ulang

#### Yang Dilakukan Mahasiswa

1. Revisi draft skripsi (di luar sistem — parafrase, perbaiki referensi, dll)
2. Submit ulang ke Turnitin
3. Upload ulang ke SILA dengan data baru

#### Input Mahasiswa (Revisi)

Sama dengan submit pertama — **semua field diisi ulang** (data dan dokumen baru):

| Field | Tipe | Wajib |
|---|---|---|
| `submission_id_turnitin` | text | Ya (ID baru dari revisi) |
| `url_turnitin` | url | Ya |
| `similarity_percentage` | number | Ya (diharapkan lebih rendah) |
| `DOK-TA06-01` | Draft skripsi revisi | Ya |
| `DOK-TA06-02` | Screenshot Turnitin baru | Ya |

#### Process Logic

```
FUNCTION resubmitTA06(pengajuanId, input, files, user):
  pengajuan = GET WHERE id = pengajuanId AND status = 'revision_required'
  ASSERT user.mahasiswaId == pengajuan.mahasiswa_id

  newRevisiKe = pengajuan.revisi_ke + 1
  ASSERT newRevisiKe <= 3
    ELSE THROW ERR_BUS_MAX_RETRY_EXCEEDED("Batas maksimal 3x revisi sudah tercapai")

  // Update data dengan data revisi baru
  UPDATE pengajuan_data SET field_values = JSON(input)

  // Save dokumen baru (versioning — versi lama tetap ada)
  FOR EACH file IN files:
    INSERT pengajuan_dokumen { ..., versi: newRevisiKe }

  // Create version snapshot
  INSERT pengajuan_versi { versi_ke: newRevisiKe, data_snapshot: ..., alasan: 'Revisi Turnitin' }

  UPDATE pengajuan SET
    status = 'pending_kepala_lab',
    revisi_ke = newRevisiKe

  logAudit('pengajuan.resubmitted', metadata: { revisi_ke: newRevisiKe, new_similarity: input.similarity_percentage })
  NOTIFY kepalaLab {
    message: "Revisi ke-{newRevisiKe} dari {mhs.nama}. Similarity baru: {input.similarity_percentage}%"
  }
```

---

## State Transition Diagram

```
(baru) ──► pending_kepala_lab ──► selesai (LOLOS)
                │
                │ [similarity > batas, revisi < 3]
                ▼
         revision_required ──► pending_kepala_lab (ulang)
                │
                │ [revisi ke-3, masih tidak lolos]
                ▼
           terminated
```

---

## Acceptance Criteria

```
AC-TA06-01: Submit pertama, similarity di bawah batas
GIVEN mahasiswa submit dengan similarity 18%, batas = 25%
WHEN Kepala Lab approve
THEN status = 'selesai'
  AND sertifikat Turnitin ter-generate
  AND notifikasi sukses ke mahasiswa

AC-TA06-02: Submit pertama, similarity di atas batas
GIVEN similarity 35%, batas 25%
WHEN Kepala Lab reject dengan alasan
THEN status = 'revision_required', revisi_ke = 1
  AND notifikasi ke mahasiswa "Sisa kesempatan: 2x"

AC-TA06-03: Revisi ketiga masih tidak lolos
GIVEN revisi_ke = 3, similarity masih 28% > 25%
WHEN Kepala Lab ingin reject
THEN sistem auto-suggest terminate
  AND Kepala Lab konfirmasi terminate
  AND status = 'terminated'
  AND notifikasi ke mahasiswa bahwa pengajuan dihentikan

AC-TA06-04: Mahasiswa coba revisi ke-4
GIVEN revisi_ke sudah = 3, status = 'revision_required'
WHEN mahasiswa coba resubmit
THEN error ERR_BUS_MAX_RETRY_EXCEEDED
```

---

## Konfigurasi Admin

| Parameter | Default | Catatan |
|---|---|---|
| Batas similarity | 25% | Bisa diubah Kepala Lab atau admin |
| Maks revisi | 3 | Tidak configurable (hardcoded berdasarkan kebijakan) |
| SLA Kepala Lab | 3 hari kerja | Configurable |
