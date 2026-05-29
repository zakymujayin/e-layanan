# BPMN TA-03: Seminar Proposal Skripsi

**Kode**: TA-03
**Kategori**: Tugas Akhir
**Scope**: Prodi
**Output**: 3 dokumen (Surat Tugas Penguji, Berita Acara, Daftar Hadir)
**Prasyarat**: TA-02 harus berstatus `selesai`

---

## Workflow Summary

```
Mahasiswa → Staff Prodi (verifikasi + PENJADWALAN) → Sekprodi (PENETAPAN Penguji 1 & 2) → WD1 (TTD)
  └─ [Setelah sidang] → Penguji 1 & 2 input nilai → Sistem auto-generate Berita Acara
```

---

## Aktor

| ID | Aktor | Kondisi |
|---|---|---|
| A1 | Mahasiswa | aktif, TA-02 selesai |
| A2 | Staff Prodi | prodi sama |
| A3 | Sekprodi | prodi sama, aktif |
| A4 | Wakil Dekan 1 | aktif |
| A5 | Penguji 1 | Dosen dari fakultas yang sama, di-assign Sekprodi |
| A6 | Penguji 2 | Dosen dari fakultas yang sama, di-assign Sekprodi |

---

## Step-by-Step Detail

### STEP TA03-01: Mahasiswa Submit

**Step ID**: `TA03-01`
**Status**: (baru) → `pending_staff_prodi`

#### Prasyarat

```
P1: mahasiswa aktif
P2: TA-02 berstatus 'selesai' (SK Pembimbing sudah terbit)
P3: TIDAK ADA pengajuan TA-03 aktif
```

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-TA03-01` | Draft Proposal Skripsi (lengkap) | PDF | 10 MB | Ya |
| `DOK-TA03-02` | Lembar Persetujuan Pembimbing 1 & 2 (TTD) | PDF | 2 MB | Ya |
| `DOK-TA03-03` | Form Bimbingan Proposal | PDF | 2 MB | Ya |
| `DOK-TA03-04` | Bukti Pembayaran Sempro (jika berbayar) | PDF, JPG | 2 MB | Configurable |
| `DOK-TA03-05` | KRS yang Memuat Skripsi | PDF | 2 MB | Ya |

#### Process Logic

```
FUNCTION submitTA03(input, files, user):
  // Validate TA-02 selesai
  ta02 = QUERY pengajuan_layanan WHERE mahasiswa_id AND kode 'TA-02' AND status 'selesai'
  ASSERT ta02 != NULL ELSE THROW ERR_BUS_PREREQUISITE_NOT_MET

  // Standard: create pengajuan, reserve nomor, save files, version, log, notify staff
  pengajuan = INSERT pengajuan_layanan { status: 'pending_staff_prodi', ... }

  // Auto-fill data dari layanan sebelumnya
  judulSkripsi = GET judul_skripsi WHERE mahasiswa_id AND status = 'aktif'
  pembimbing1 = GET assignments WHERE pengajuan_id = ta02.id AND type = 'pembimbing_skripsi_1'
  pembimbing2 = GET assignments WHERE pengajuan_id = ta02.id AND type = 'pembimbing_skripsi_2'

  SAVE autoFillData { judul: judulSkripsi.judul_aktif, p1: pembimbing1, p2: pembimbing2 }
  ...
```

---

### STEP TA03-02: Staff Prodi Verifikasi + Penjadwalan (1 Step)

**Step ID**: `TA03-02`
**Status**: `pending_staff_prodi` → `pending_sekprodi`
**Aktor**: A2
**SLA**: 2 hari kerja

**Catatan penting**: Verifikasi berkas DAN penjadwalan dilakukan **bersamaan** dalam 1 step.

#### Yang Diinput Staff Prodi

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `tanggal_sidang` | date | Ya | Harus >= hari ini + 3 hari |
| `waktu_mulai` | time | Ya | Dalam jam kerja (07:00-17:00) |
| `waktu_selesai` | time | Ya | > waktu_mulai |
| `ruang_sidang` | text atau dropdown | Ya | - |
| `catatan` | textarea | Tidak | - |

#### Actions

| Action | Target Status | Alasan Wajib |
|---|---|---|
| `approve` (+ penjadwalan) | `pending_sekprodi` | Tidak |
| `reject_to_submitter` | `revision_required` | Ya |

#### Process Logic

```
FUNCTION staffVerifikasiJadwalTA03(pengajuanId, action, data, user):
  pengajuan = GET WHERE id = pengajuanId AND status = 'pending_staff_prodi'
  requireRole(user, 'staff_prodi')
  requireScope(user, pengajuan)

  IF action == 'approve':
    // Validate penjadwalan
    ASSERT data.tanggal_sidang IS NOT NULL ELSE THROW ERR_VAL_REQUIRED_FIELD
    ASSERT data.waktu_mulai IS NOT NULL ELSE THROW ERR_VAL_REQUIRED_FIELD
    ASSERT data.ruang_sidang IS NOT NULL ELSE THROW ERR_VAL_REQUIRED_FIELD
    ASSERT data.tanggal_sidang >= TODAY + 3 days
      ELSE THROW ERR_VAL_MIN_VALUE("Jadwal sidang minimal 3 hari dari sekarang")

    // Save jadwal
    UPDATE pengajuan_data SET field_values += {
      tanggal_sidang: data.tanggal_sidang,
      waktu_mulai: data.waktu_mulai,
      waktu_selesai: data.waktu_selesai,
      ruang_sidang: data.ruang_sidang
    }

    UPDATE pengajuan SET status = 'pending_sekprodi', current_step = 'TA03-03'
    logAudit('pengajuan.approved', metadata: { jadwal: data.tanggal_sidang })
    NOTIFY sekprodi { "Sempro {mhs.nama} dijadwalkan {tanggal}, menunggu penetapan penguji" }
```

---

### STEP TA03-03: Sekprodi Tetapkan Penguji 1 & 2

**Step ID**: `TA03-03`
**Status**: `pending_sekprodi` → `pending_wd1`
**Aktor**: A3
**SLA**: 3 hari kerja

#### Yang Diinput Sekprodi

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `penguji_1_dosen_id` | dosen_picker | Ya | Dosen aktif di fakultas yang sama |
| `penguji_2_dosen_id` | dosen_picker | Ya | Dosen aktif, berbeda dari penguji 1, berbeda dari pembimbing 1 & 2 |

#### Process Logic

```
FUNCTION sekprodiTetapkanPengujiTA03(pengajuanId, data, user):
  pengajuan = GET WHERE id = pengajuanId AND status = 'pending_sekprodi'
  requireStructuralPosition(user, 'sekprodi', pengajuan.prodi_id)

  penguji1 = GET dosen WHERE id = data.penguji_1_dosen_id AND is_active
  penguji2 = GET dosen WHERE id = data.penguji_2_dosen_id AND is_active
  ASSERT penguji1 AND penguji2
  ASSERT penguji1.id != penguji2.id
    ELSE THROW ERR_VAL_DUPLICATE("Penguji 1 dan 2 harus berbeda")

  // Cek penguji bukan pembimbing (optional tapi recommended)
  pembimbing1Id = GET assignment pembimbing_skripsi_1 FOR this mahasiswa
  pembimbing2Id = GET assignment pembimbing_skripsi_2 FOR this mahasiswa
  // NOTE: Ini warning, bukan block — di beberapa PTKIN pembimbing boleh jadi penguji

  // Create assignments
  INSERT assignments { dosen_id: penguji1.id, type: 'penguji_proposal', pengajuan_id }
  INSERT assignments { dosen_id: penguji2.id, type: 'penguji_proposal', pengajuan_id }

  UPDATE pengajuan SET status = 'pending_wd1', current_step = 'TA03-04'
  logAudit('pengajuan.penguji_assigned')
  NOTIFY wd1 { "Sempro {mhs.nama} siap TTD surat tugas" }
```

---

### STEP TA03-04: WD1 TTD Surat Tugas

**Step ID**: `TA03-04`
**Status**: `pending_wd1` → `selesai` (surat tugas terbit, sidang bisa dilaksanakan)
**Aktor**: A4
**SLA**: 3 hari kerja

#### Actions

| Action | Target Status |
|---|---|
| `sign` | `selesai` (surat tugas terbit) |
| `reject_to_step` (staff/sekprodi) | sesuai pilihan |

#### Process Logic

```
FUNCTION wd1SignTA03(pengajuanId, action, data, user):
  // Sama pattern dengan TA01-05 dan TA02-05
  // Generate 3 dokumen sekaligus:
  // 1. Surat Tugas Penguji Proposal
  // 2. Berita Acara (template kosong — diisi setelah sidang)
  // 3. Daftar Hadir Dewan Penguji

  IF action == 'sign':
    generateMultipleDocuments(pengajuan, [
      { template: 'surat_tugas_proposal', data: pengajuanData },
      { template: 'berita_acara_proposal', data: pengajuanData },  // template, nilai diisi nanti
      { template: 'daftar_hadir_proposal', data: pengajuanData }
    ])

    // Surat Tugas bisa didownload oleh penguji 1 & 2 (menu "Surat & SK Saya")
    UPDATE pengajuan SET status = 'selesai'
    NOTIFY mahasiswa + penguji1 + penguji2 { "Surat Tugas Sempro sudah terbit" }
```

---

### STEP TA03-05: Input Nilai oleh Penguji (Post-Sidang)

**Step ID**: `TA03-05`
**Trigger**: Setelah sidang dilaksanakan (offline/hybrid)
**Aktor**: A5 (Penguji 1) dan A6 (Penguji 2) — masing-masing input sendiri

**Catatan**: Step ini BUKAN bagian dari workflow approval pengajuan (status sudah `selesai`). Ini adalah **fitur tambahan** untuk input nilai setelah sidang, yang akan meng-update Berita Acara.

#### Yang Diinput Masing-Masing Penguji

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `nilai` | number | Ya | 0-100 atau sesuai skala kampus |
| `catatan_saran` | textarea | Tidak | Saran untuk mahasiswa |
| `keputusan` | radio | Ya | `layak` / `tidak_layak` |

#### Process Logic

```
FUNCTION inputNilaiSempro(pengajuanId, data, user):
  pengajuan = GET WHERE id = pengajuanId AND jenis_layanan_kode = 'TA-03'
  // Pengajuan harus sudah 'selesai' (surat tugas sudah terbit)
  ASSERT pengajuan.status == 'selesai'

  // Cek user adalah penguji yang ditunjuk
  assignment = GET assignments WHERE pengajuan_id AND dosen_id = user.dosenId AND type = 'penguji_proposal'
  ASSERT assignment != NULL ELSE THROW ERR_AUTH_NOT_ASSIGNED

  // Save nilai
  UPSERT nilai_sidang {
    pengajuan_id, dosen_id: user.dosenId,
    assignment_type: 'penguji_proposal',
    nilai: data.nilai,
    catatan: data.catatan_saran,
    keputusan: data.keputusan
  }

  logAudit('nilai.input', metadata: { penguji: user.dosenId, nilai: data.nilai, keputusan: data.keputusan })

  // Cek apakah semua penguji sudah input
  allNilai = GET nilai_sidang WHERE pengajuan_id
  IF allNilai.count == 2:  // kedua penguji sudah input
    // Determine keputusan akhir
    IF allNilai.every(n => n.keputusan == 'layak'):
      keputusanFinal = 'layak'
    ELSE:
      keputusanFinal = 'tidak_layak'

    // Update Berita Acara dengan nilai
    regenerateBeritaAcara(pengajuan, allNilai, keputusanFinal)
    NOTIFY mahasiswa { "Hasil sempro: {keputusanFinal}. Nilai sudah diinput penguji." }
```

#### Acceptance Criteria

```
AC-TA03-05-01: Penguji input nilai berhasil
GIVEN pengajuan TA-03 status "selesai", user = Penguji 1 yang ditunjuk
WHEN Penguji 1 input nilai 85, keputusan "layak"
THEN nilai_sidang record tercipta
  AND audit log tercatat

AC-TA03-05-02: Kedua penguji sudah input
GIVEN Penguji 1 sudah input (layak), Penguji 2 input (layak)
WHEN Penguji 2 submit nilai
THEN keputusan final = "layak"
  AND Berita Acara di-regenerate dengan nilai lengkap
  AND notifikasi ke mahasiswa

AC-TA03-05-03: Bukan penguji yang ditunjuk
GIVEN Dr. Citra BUKAN penguji untuk pengajuan ini
WHEN Dr. Citra mencoba input nilai
THEN error ERR_AUTH_NOT_ASSIGNED
```

---

## Dokumen Output (3 Dokumen)

| No | Nama Dokumen | Template | Generate Saat |
|---|---|---|---|
| 1 | Surat Tugas Penguji Seminar Proposal | `template_seminar_proposal` | WD1 TTD (Step TA03-04) |
| 2 | Berita Acara & Keputusan Diskusi Proposal | `template_berita_acara_proposal` | WD1 TTD (template) + re-generate setelah nilai input (Step TA03-05) |
| 3 | Daftar Hadir Dewan Penguji | `template_daftar_hadir_proposal` | WD1 TTD (Step TA03-04) |
