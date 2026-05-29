# BPMN Layanan Akademik (AK-01 s.d. AK-07)

**Kategori**: Akademik
**Scope**: Fakultas
**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## Pola Umum Semua Layanan Akademik

Seluruh 7 layanan AK mengikuti **workflow yang identik**:

```
Mahasiswa → Staff Akademik (verifikasi) → Kabag (approval) → WD1 atau Dekan (TTD final)
```

**Perbedaan antar layanan AK**:
- Field input mahasiswa yang berbeda
- Dokumen upload yang berbeda
- Pejabat TTD akhir (WD1 atau Dekan) yang berbeda
- Kondisi eligibility mahasiswa yang berbeda

Dokumen ini mendefinisikan **pola umum** satu kali, lalu mendefinisikan **perbedaan spesifik** per layanan.

---

## Aktor Umum Semua Layanan AK

| ID | Aktor | Kondisi |
|---|---|---|
| A1 | Mahasiswa | `status_mahasiswa = 'aktif'` (kecuali AK-03: alumni boleh) |
| A2 | Staff Akademik | `system_role = 'staff_akademik'` |
| A3 | Kabag | `structural_positions.position_code = 'kabag_tu'` AND aktif |
| A4 | Wakil Dekan 1 | `structural_positions.position_code = 'wakil_dekan_1'` AND aktif |
| A5 | Dekan | `structural_positions.position_code = 'dekan'` AND aktif |

---

## Pola Workflow Engine (Template AK)

### STEP AK-XX-01: Mahasiswa Submit

**Status**: (baru) → `pending_staff_akademik`

#### Process Logic (Template)

```
FUNCTION submitLayananAK(jenisLayananKode, input, files, user):
  // 1. Validate eligibility (berbeda per layanan, lihat bagian spesifik)
  validateEligibility(jenisLayananKode, user)

  // 2. Validate tidak ada pengajuan aktif
  existing = QUERY WHERE jenis_layanan_kode = jenisLayananKode
    AND mahasiswa_id = user.mahasiswaId
    AND status NOT IN ('selesai', 'terminated')
  ASSERT existing == NULL ELSE THROW ERR_BUS_DUPLICATE_PENGAJUAN

  // 3. Create pengajuan
  pengajuan = INSERT pengajuan_layanan {
    status: 'pending_staff_akademik',
    scope_level: 'fakultas',
    fakultas_id: user.mahasiswa.prodi.fakultasId
  }

  // 4. Reserve nomor surat
  reserveNomorSurat(semester.id, kodeKlasifikasi[jenisLayananKode], 'fakultas', fakultasId)

  // 5. Save data & files
  // 6. Create version snapshot
  // 7. Log & notify
  logAudit('pengajuan.submitted')
  NOTIFY staffAkademik { "Pengajuan {jenisLayanan} baru dari {mhs.nama}" }
```

### STEP AK-XX-02: Staff Akademik Verifikasi

**Status**: `pending_staff_akademik` → `pending_kabag`
**SLA**: 2 hari kerja

#### Actions

| Action | Target Status | Alasan Wajib |
|---|---|---|
| `approve` | `pending_kabag` | Tidak |
| `reject_to_submitter` | `revision_required` | Ya |

```
FUNCTION staffAkademikVerifikasi(pengajuanId, action, data, user):
  ASSERT pengajuan.status == 'pending_staff_akademik'
  requireRole(user, 'staff_akademik')

  IF action == 'approve':
    UPDATE pengajuan SET status = 'pending_kabag', current_step = 'AK-XX-03'
    NOTIFY kabag { "Pengajuan {jenisLayanan} {mhs.nama} menunggu approval Anda" }

  ELSE IF action == 'reject_to_submitter':
    ASSERT data.alasan IS NOT EMPTY
    UPDATE pengajuan SET status = 'revision_required'
    NOTIFY mahasiswa { "Pengajuan perlu revisi: {data.alasan}" }
```

### STEP AK-XX-03: Kabag Approval

**Status**: `pending_kabag` → `pending_wd1` atau `pending_dekan`
**SLA**: 2 hari kerja

```
FUNCTION kabagApprove(pengajuanId, action, data, user):
  ASSERT pengajuan.status == 'pending_kabag'
  requireStructuralPosition(user, 'kabag_tu')

  IF action == 'approve':
    targetStatus = getTtdFinalRole(jenisLayananKode)  // 'pending_wd1' atau 'pending_dekan'
    UPDATE pengajuan SET status = targetStatus
    NOTIFY pejabatFinal { "Pengajuan {jenisLayanan} {mhs.nama} siap TTD" }

  ELSE IF action == 'reject_to_step':
    // Reject bertingkat: ke staff_akademik atau ke mahasiswa
    ASSERT data.alasan IS NOT EMPTY
    UPDATE pengajuan SET status = data.target_status, metadata.returned_from = 'kabag'
    NOTIFY target { "Kabag mengembalikan: {data.alasan}" }
```

### STEP AK-XX-04: WD1 atau Dekan TTD Final

**Status**: `pending_wd1` / `pending_dekan` → `selesai`
**SLA**: 2 hari kerja

```
FUNCTION pejabatSignAK(pengajuanId, action, data, user):
  ASSERT ttdScan EXISTS ELSE THROW ERR_BUS_TTD_NOT_UPLOADED

  IF action == 'sign':
    generateFinalDocument(pengajuan, templateAK[jenisLayananKode])
    UPDATE pengajuan SET status = 'selesai'
    NOTIFY mahasiswa { severity: success, message: "Surat {jenisLayanan} sudah jadi! Silakan download." }

  ELSE IF action == 'reject_to_step':
    // Reject bertingkat ke kabag atau staff
    ASSERT data.alasan IS NOT EMPTY
    UPDATE pengajuan SET status = data.target_status, metadata.returned_from = pejabatRole
    NOTIFY target { "WD1/Dekan mengembalikan: {data.alasan}" }
```

---

## Spesifikasi per Layanan

### AK-01: Surat Keterangan Aktif Kuliah

**TTD Final**: Wakil Dekan 1
**Kode Klasifikasi**: PP.00.9
**Kode Template**: `template_keterangan_aktif_kuliah`

#### Eligibility

```
mahasiswa.status_mahasiswa = 'aktif'
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `peruntukan` | textarea | Ya | Tujuan pembuatan surat (mis. "Tunjangan Keluarga Orang Tua") |

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-AK01-01` | Bukti Pembayaran UKT Semester Berjalan | PDF, JPG | 2 MB | Ya |

#### Acceptance Criteria

```
AC-AK01-01: Submit berhasil
GIVEN mahasiswa "Aini" status aktif
WHEN Aini submit dengan peruntukan "Tunjangan Keluarga" + upload bukti UKT
THEN pengajuan tercipta status "pending_staff_akademik"
  AND notifikasi ke staff akademik

AC-AK01-02: Mahasiswa status cuti
GIVEN mahasiswa "Budi" status "cuti"
WHEN Budi submit AK-01
THEN error ERR_BUS_PREREQUISITE_NOT_MET "Status mahasiswa harus aktif"
```

---

### AK-02: Surat Keterangan Masih Kuliah (PNS/Tunjangan)

**TTD Final**: Wakil Dekan 1
**Kode Klasifikasi**: PP.00.9
**Kode Template**: `template_keterangan_masih_kuliah`

#### Eligibility

```
mahasiswa.status_mahasiswa = 'aktif'
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Conditional | Catatan |
|---|---|---|---|---|
| `peruntukan` | textarea | Ya | - | Tujuan surat |
| `orang_tua_pns` | radio (`ya`/`tidak`) | Ya | - | Apakah orang tua PNS |
| `nama_orang_tua` | text | Ya | jika `orang_tua_pns = ya` | - |
| `nip_orang_tua` | text | Ya | jika `orang_tua_pns = ya` | Format: 18 digit |
| `pangkat_golongan` | text | Ya | jika `orang_tua_pns = ya` | - |
| `jabatan_orang_tua` | text | Ya | jika `orang_tua_pns = ya` | - |
| `instansi_orang_tua` | textarea | Ya | jika `orang_tua_pns = ya` | - |
| `hubungan_orang_tua` | select | Ya | jika `orang_tua_pns = ya` | `ayah` / `ibu` |

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-AK02-01` | Bukti Pembayaran UKT | PDF, JPG | 2 MB | Ya |
| `DOK-AK02-02` | SK CPNS/PNS Orang Tua | PDF | 2 MB | Jika PNS = ya |
| `DOK-AK02-03` | Kartu Keluarga (KK) | PDF, JPG | 2 MB | Jika PNS = ya |

#### Process Logic Tambahan

```
// Conditional field validation
IF input.orang_tua_pns == 'ya':
  ASSERT input.nama_orang_tua IS NOT EMPTY
  ASSERT input.nip_orang_tua MATCHES /^[0-9]{18}$/ ELSE THROW ERR_VAL_INVALID_FORMAT("NIP harus 18 digit")
  ASSERT files.DOK-AK02-02 EXISTS
  ASSERT files.DOK-AK02-03 EXISTS
```

#### Acceptance Criteria

```
AC-AK02-01: Submit dengan data PNS lengkap
GIVEN mahasiswa aktif
WHEN submit dengan orang_tua_pns=ya + semua data PNS + upload SK PNS + KK
THEN pengajuan tercipta, notifikasi ke staff akademik

AC-AK02-02: Submit dengan PNS tapi NIP salah format
WHEN input.nip_orang_tua = "1234" (tidak 18 digit)
THEN error ERR_VAL_INVALID_FORMAT "NIP harus 18 digit"
```

---

### AK-03: Surat Keterangan Pernah Kuliah

**TTD Final**: Dekan
**Kode Klasifikasi**: PP.00.9
**Kode Template**: `template_keterangan_pernah_kuliah`

#### Eligibility — BERBEDA dari AK lain

```
mahasiswa.status_mahasiswa IN ('alumni', 'keluar', 'do')
// Alumni, yang mengundurkan diri, atau yang di-DO boleh mengajukan
// Mahasiswa AKTIF tidak perlu surat ini (pakai AK-01)
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `tahun_masuk` | number | Ya | Auto-fill dari data mahasiswa |
| `tahun_keluar` | number | Ya | Auto-fill dari data mahasiswa |
| `peruntukan` | textarea | Ya | Tujuan surat |

#### Dokumen Upload

Tidak ada dokumen wajib upload (data diambil dari sistem).

#### Acceptance Criteria

```
AC-AK03-01: Alumni bisa submit
GIVEN mahasiswa "Budi" status "alumni"
WHEN Budi submit AK-03
THEN pengajuan tercipta normal

AC-AK03-02: Mahasiswa aktif tidak bisa submit
GIVEN mahasiswa "Aini" status "aktif"
WHEN Aini submit AK-03
THEN error ERR_BUS_PREREQUISITE_NOT_MET "Layanan ini hanya untuk alumni atau mahasiswa yang sudah keluar"
```

---

### AK-04: Surat Pengantar Observasi

**TTD Final**: Wakil Dekan 1
**Kode Klasifikasi**: PP.00.9
**Kode Template**: `template_pengantar_observasi`

#### Eligibility

```
mahasiswa.status_mahasiswa = 'aktif'
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `mata_kuliah` | text | Ya | Mata kuliah yang membutuhkan observasi |
| `pejabat_tujuan` | text | Ya | Nama & jabatan penerima surat |
| `instansi_tujuan` | text | Ya | Instansi yang dituju |
| `lokasi_observasi` | repeater (text) | Ya | Min 1, bisa multiple lokasi |
| `tanggal_mulai` | date | Ya | - |
| `tanggal_selesai` | date | Ya | >= tanggal_mulai |
| `dosen_pembimbing_observasi_id` | dosen_picker | Ya | Auto-create assignment `dosen_pembimbing_observasi` |

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-AK04-01` | Tugas/Penugasan dari Dosen Pengampu | PDF | 2 MB | Ya |
| `DOK-AK04-02` | Surat Persetujuan Dosen Pembimbing | PDF | 2 MB | Ya |

#### Side Effect

```
// Saat pengajuan disubmit, create assignment observasi
INSERT assignments {
  dosen_id: input.dosen_pembimbing_observasi_id,
  mahasiswa_id: user.mahasiswaId,
  assignment_type: 'dosen_pembimbing_observasi',
  pengajuan_id: pengajuan.id
}
```

---

### AK-05: Surat Pengantar Penelitian

**TTD Final**: Wakil Dekan 1
**Kode Klasifikasi**: TL.00
**Kode Template**: `template_pengantar_penelitian`

#### Eligibility

```
mahasiswa.status_mahasiswa = 'aktif'
// CATATAN: Idealnya TA-01 sudah selesai (ada judul disetujui)
// tapi tidak di-block jika belum (bisa penelitian non-skripsi)
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `judul_penelitian` | text | Ya | Auto-fill dari judul_skripsi jika ada, atau input manual |
| `pejabat_tujuan` | repeater (text) | Ya | Bisa multiple |
| `lokasi_penelitian` | repeater (text) | Ya | Bisa multiple |
| `tanggal_mulai` | date | Ya | - |
| `tanggal_selesai` | date | Ya | >= tanggal_mulai |
| `tujuan_penelitian` | textarea | Ya | Deskripsi singkat tujuan |

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-AK05-01` | Proposal Penelitian/Skripsi | PDF | 10 MB | Ya |
| `DOK-AK05-02` | SK Pembimbing (auto-attach dari TA-02 jika ada) | PDF | - | Auto jika TA-02 selesai |

#### Process Logic Tambahan

```
// Auto-fill judul dari TA-01 jika ada
judulAktif = GET judul_skripsi WHERE mahasiswa_id AND status='aktif'
IF judulAktif:
  autoFill('judul_penelitian', judulAktif.judul_aktif)

// Auto-attach SK Pembimbing jika TA-02 selesai
ta02 = GET pengajuan WHERE kode='TA-02' AND mahasiswa AND selesai
IF ta02:
  autoAttach(ta02.finalPdfPath, 'DOK-AK05-02')
```

---

### AK-06: Surat Permohonan Magang

**TTD Final**: Dekan
**Kode Klasifikasi**: KS.01
**Kode Template**: `template_permohonan_magang`

#### Eligibility

```
mahasiswa.status_mahasiswa = 'aktif'
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `pejabat_tujuan` | text | Ya | - |
| `instansi_tujuan` | text | Ya | - |
| `alamat_instansi` | textarea | Ya | - |
| `tanggal_mulai` | date | Ya | - |
| `tanggal_selesai` | date | Ya | >= tanggal_mulai |
| `bidang_magang` | textarea | Ya | Bidang yang diminati |
| `dosen_pembimbing_magang_id` | dosen_picker | Ya | Auto-create assignment `dosen_pembimbing_magang` |

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-AK06-01` | Proposal Magang | PDF | 2 MB | Ya |
| `DOK-AK06-02` | CV Mahasiswa | PDF | 2 MB | Ya |
| `DOK-AK06-03` | Transkrip Nilai Sementara | PDF | 2 MB | Ya |
| `DOK-AK06-04` | Surat Persetujuan Dosen Pembimbing | PDF | 2 MB | Ya |

#### Side Effect

```
INSERT assignments {
  dosen_id: input.dosen_pembimbing_magang_id,
  mahasiswa_id: user.mahasiswaId,
  assignment_type: 'dosen_pembimbing_magang',
  pengajuan_id: pengajuan.id
}
```

---

### AK-07: Surat Rekomendasi

**TTD Final**: Dekan
**Kode Klasifikasi**: PP.00.9
**Kode Template**: `template_rekomendasi`

#### Eligibility

```
mahasiswa.status_mahasiswa IN ('aktif', 'alumni')
// Alumni juga boleh mengajukan rekomendasi
```

#### Input Mahasiswa

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `tujuan_rekomendasi` | textarea | Ya | Untuk apa rekomendasi ini |
| `pihak_penerima` | text | Ya | Instansi/kampus tujuan |
| `tipe_rekomendasi` | select | Ya | `beasiswa` / `lanjut_studi` / `kerja` / `lainnya` |

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-AK07-01` | Surat Permohonan dari Mahasiswa | PDF | 2 MB | Ya |
| `DOK-AK07-02` | Transkrip Nilai | PDF | 2 MB | Jika tipe = beasiswa atau lanjut_studi |
| `DOK-AK07-03` | Dokumen Pendukung Lainnya | PDF | 2 MB | Tidak |

#### Process Logic Tambahan

```
// Conditional dokumen
IF input.tipe_rekomendasi IN ('beasiswa', 'lanjut_studi'):
  ASSERT files['DOK-AK07-02'] EXISTS
    ELSE THROW ERR_VAL_REQUIRED_FIELD("Transkrip nilai wajib untuk rekomendasi beasiswa/lanjut studi")
```

---

## Tabel Ringkasan Layanan AK

| Kode | Nama | TTD Final | Kode Klasifikasi | Eligibility | Dok Wajib |
|---|---|---|---|---|---|
| AK-01 | Surat Aktif Kuliah | WD1 | PP.00.9 | Aktif | 1 (UKT) |
| AK-02 | Surat Masih Kuliah PNS | WD1 | PP.00.9 | Aktif | 1-3 (tergantung PNS) |
| AK-03 | Surat Pernah Kuliah | Dekan | PP.00.9 | Alumni/keluar/DO | 0 |
| AK-04 | Surat Pengantar Observasi | WD1 | PP.00.9 | Aktif | 2 |
| AK-05 | Surat Pengantar Penelitian | WD1 | TL.00 | Aktif | 1-2 |
| AK-06 | Surat Permohonan Magang | Dekan | KS.01 | Aktif | 4 |
| AK-07 | Surat Rekomendasi | Dekan | PP.00.9 | Aktif/Alumni | 1-3 |

---

## SLA Semua Layanan AK

| Step | Aktor | SLA | Konsekuensi |
|---|---|---|---|
| Verifikasi | Staff Akademik | 2 hari kerja | Reminder |
| Approval | Kabag | 2 hari kerja | Reminder + eskalasi |
| TTD Final | WD1 atau Dekan | 2 hari kerja | Reminder urgent |

---

## Acceptance Criteria Umum (Berlaku untuk Semua AK)

```
AC-AK-UMUM-01: Reject dengan alasan bertingkat
GIVEN pengajuan AK status "pending_wd1"
WHEN WD1 reject ke Staff Akademik dengan alasan "Data tidak sesuai"
THEN status = 'pending_staff_akademik', metadata.returned_from = 'wd1'
  AND notifikasi ke Staff Akademik dengan alasan

AC-AK-UMUM-02: Mahasiswa tidak aktif mencoba submit AK-01
GIVEN mahasiswa status "cuti"
WHEN coba submit AK-01
THEN error ERR_BUS_PREREQUISITE_NOT_MET

AC-AK-UMUM-03: Dokumen final bisa didownload
GIVEN pengajuan AK status "selesai"
WHEN mahasiswa buka halaman arsip
THEN dokumen final tersedia untuk didownload
```
