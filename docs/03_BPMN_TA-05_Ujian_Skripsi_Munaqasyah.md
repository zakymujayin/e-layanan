# BPMN TA-05: Ujian Skripsi (Munaqasyah)

**Kode**: TA-05
**Kategori**: Tugas Akhir
**Scope**: Prodi
**Output**: 5 dokumen (Surat Tugas, Berita Acara, Yudisium, Rekapitulasi Nilai, Detail Nilai)
**Prasyarat**: TA-04 selesai + LULUS, TA-06 selesai

---

## Workflow Summary

```
Mahasiswa → Staff Prodi (verifikasi) → Sekprodi (PENJADWALAN + PENETAPAN MAJELIS 6 dosen) → WD1 → Dekan (TTD)
  └─ [Setelah sidang] → Sekretaris Sidang input nilai semua dosen → Sistem auto-calculate Yudisium
```

**Perbedaan dari TA-03/TA-04**:
- Sekprodi melakukan **penjadwalan + penetapan majelis** dalam 1 step (bukan staff yang jadwalkan)
- Majelis terdiri dari **6 dosen** (bukan 2)
- **Sekretaris Sidang** yang input nilai (bukan masing-masing penguji)
- Output **5 dokumen**
- TTD final **Dekan** (bukan WD1)

---

## Aktor

| ID | Aktor | Kondisi |
|---|---|---|
| A1 | Mahasiswa | aktif, TA-04 selesai+lulus, TA-06 selesai |
| A2 | Staff Prodi | prodi sama, verifikasi berkas saja |
| A3 | Sekprodi | prodi sama, aktif — penjadwalan + majelis |
| A4 | Wakil Dekan 1 | aktif |
| A5 | Dekan | aktif — TTD final |
| A6 | Sekretaris Sidang | Dosen, assignment `sekretaris_sidang` |

---

## Step-by-Step Detail

### STEP TA05-01: Mahasiswa Submit

**Step ID**: `TA05-01`
**Status**: (baru) → `pending_staff_prodi`

#### Prasyarat

```
P1: mahasiswa.status_mahasiswa = 'aktif'
P2: TA-04 berstatus 'selesai' DAN keputusan = 'lulus'
P3: TA-06 berstatus 'selesai' (Sertifikat Turnitin sudah terbit)
P4: TIDAK ADA pengajuan TA-05 aktif
```

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-TA05-01` | Skripsi Lengkap (Final Draft) | PDF | 15 MB | Ya |
| `DOK-TA05-02` | Lembar Persetujuan Pembimbing untuk Diujikan | PDF | 2 MB | Ya |
| `DOK-TA05-03` | Sertifikat Lulus Komprehensif (TA-04) | Auto-attach | - | Auto |
| `DOK-TA05-04` | Sertifikat Turnitin (TA-06) | Auto-attach | - | Auto |
| `DOK-TA05-05` | Transkrip Nilai Lengkap | PDF | 2 MB | Ya |
| `DOK-TA05-06` | KRS Semester Berjalan | PDF | 2 MB | Ya |
| `DOK-TA05-07` | Bukti Pembayaran Ujian Skripsi | PDF, JPG | 2 MB | Ya |

#### Process Logic

```
FUNCTION submitTA05(input, files, user):
  // Validate prasyarat
  ta04 = QUERY pengajuan WHERE kode='TA-04' AND mahasiswa_id AND status='selesai'
  ASSERT ta04 != NULL ELSE THROW ERR_BUS_PREREQUISITE_NOT_MET("TA-04 harus selesai")

  hasilTA04 = GET nilai_sidang_keputusan WHERE pengajuan_id = ta04.id
  ASSERT hasilTA04 == 'lulus'
    ELSE THROW ERR_BUS_PREREQUISITE_NOT_MET("Ujian Komprehensif harus LULUS")

  ta06 = QUERY pengajuan WHERE kode='TA-06' AND mahasiswa_id AND status='selesai'
  ASSERT ta06 != NULL ELSE THROW ERR_BUS_PREREQUISITE_NOT_MET("Cek Turnitin harus selesai")

  existingTA05 = QUERY WHERE kode='TA-05' AND mahasiswa_id AND status NOT IN ('selesai','terminated')
  ASSERT existingTA05 == NULL ELSE THROW ERR_BUS_DUPLICATE_PENGAJUAN

  // Auto-attach TA-04 dan TA-06 sertifikat
  autoAttach(ta04.sertifikat_pdf, 'DOK-TA05-03')
  autoAttach(ta06.sertifikat_pdf, 'DOK-TA05-04')

  // Auto-fill Pembimbing 1 & 2 dari TA-02
  ta02 = GET pengajuan 'TA-02' WHERE mahasiswa AND selesai
  p1 = GET assignment 'pembimbing_skripsi_1' FROM ta02
  p2 = GET assignment 'pembimbing_skripsi_2' FROM ta02

  pengajuan = INSERT pengajuan_layanan { status: 'pending_staff_prodi', ... }
  SAVE autoFillData { judul, p1, p2 }
  // Standard: log, notify staff
```

---

### STEP TA05-02: Staff Prodi Verifikasi Berkas

**Step ID**: `TA05-02`
**Status**: `pending_staff_prodi` → `pending_sekprodi`
**Aktor**: A2
**SLA**: 2 hari kerja

**Catatan**: Staff Prodi HANYA verifikasi berkas — **penjadwalan dilakukan Sekprodi** (berbeda dengan TA-03/04).

#### Actions

| Action | Target Status | Alasan Wajib |
|---|---|---|
| `approve` | `pending_sekprodi` | Tidak |
| `reject_to_submitter` | `revision_required` | Ya |

#### Process Logic

```
FUNCTION staffVerifikasiTA05(pengajuanId, action, data, user):
  // Sama pattern dengan staff_prodi approve biasa
  // TIDAK ada input penjadwalan di step ini
  IF action == 'approve':
    UPDATE pengajuan SET status = 'pending_sekprodi', current_step = 'TA05-03'
    NOTIFY sekprodi { "Berkas munaqasyah {mhs.nama} lolos verifikasi, mohon jadwalkan dan tetapkan majelis" }
```

---

### STEP TA05-03: Sekprodi — Penjadwalan + Penetapan Majelis Sidang

**Step ID**: `TA05-03`
**Status**: `pending_sekprodi` → `pending_wd1`
**Aktor**: A3 (Sekprodi)
**SLA**: 3 hari kerja

**Ini step paling kompleks di seluruh sistem.**

#### Yang Diinput Sekprodi

**Penjadwalan**:

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `tanggal_sidang` | date | Ya | >= hari ini + 3 hari |
| `waktu_mulai` | time | Ya | Dalam jam kerja |
| `waktu_selesai` | time | Ya | > waktu_mulai |
| `ruang_sidang` | text | Ya | - |

**Penetapan Majelis (6 dosen)**:

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `ketua_sidang_dosen_id` | dosen_picker | Ya | Dosen aktif fakultas sama |
| `sekretaris_sidang_dosen_id` | dosen_picker | Ya | Dosen aktif, berbeda dari yang lain |
| `pembimbing_1_dosen_id` | text (auto-fill, read-only) | Auto | Dari TA-02 |
| `pembimbing_2_dosen_id` | text (auto-fill, read-only) | Auto | Dari TA-02 |
| `penguji_1_dosen_id` | dosen_picker | Ya | Dosen aktif, berbeda dari yang lain |
| `penguji_2_dosen_id` | dosen_picker | Ya | Dosen aktif, berbeda dari yang lain |

**Validasi uniqueness**: Semua 6 dosen harus berbeda ID.

#### Process Logic

```
FUNCTION sekprodiJadwalMajelisTA05(pengajuanId, data, user):
  pengajuan = GET WHERE id = pengajuanId AND status = 'pending_sekprodi'
  requireStructuralPosition(user, 'sekprodi', pengajuan.prodi_id)

  // Validate penjadwalan
  ASSERT data.tanggal_sidang IS NOT NULL
  ASSERT data.tanggal_sidang >= TODAY + 3 days

  // Auto-fill Pembimbing 1 & 2 dari TA-02
  ta02 = GET pengajuan 'TA-02' WHERE mahasiswa selesai
  p1 = GET assignment 'pembimbing_skripsi_1' FROM ta02
  p2 = GET assignment 'pembimbing_skripsi_2' FROM ta02
  ASSERT p1 AND p2

  // Validate semua 6 dosen berbeda
  allDosenIds = [
    data.ketua_sidang_dosen_id,
    data.sekretaris_sidang_dosen_id,
    p1.dosen_id,  // auto-fill
    p2.dosen_id,  // auto-fill
    data.penguji_1_dosen_id,
    data.penguji_2_dosen_id
  ]
  ASSERT allDosenIds.length == new Set(allDosenIds).size
    ELSE THROW ERR_VAL_DUPLICATE("Semua anggota majelis harus berbeda")

  // Validate semua dosen aktif di fakultas
  FOR EACH dosenId IN [ketua, sekretaris, penguji1, penguji2]:
    dosen = GET dosen WHERE id = dosenId AND is_active = true
    ASSERT dosen != NULL ELSE THROW ERR_VAL_INVALID_FORMAT("Dosen tidak ditemukan")

  // Save penjadwalan
  UPDATE pengajuan_data SET field_values += {
    tanggal_sidang, waktu_mulai, waktu_selesai, ruang_sidang
  }

  // Create assignments untuk semua majelis
  INSERT assignments { dosen_id: data.ketua_sidang_dosen_id, type: 'ketua_sidang', pengajuan_id }
  INSERT assignments { dosen_id: data.sekretaris_sidang_dosen_id, type: 'sekretaris_sidang', pengajuan_id }
  INSERT assignments { dosen_id: data.penguji_1_dosen_id, type: 'penguji_skripsi', pengajuan_id }
  INSERT assignments { dosen_id: data.penguji_2_dosen_id, type: 'penguji_skripsi', pengajuan_id }
  // p1 dan p2 sudah ada assignment pembimbing_skripsi_1/2

  UPDATE pengajuan SET status = 'pending_wd1', current_step = 'TA05-04'
  logAudit('pengajuan.majelis_assigned', metadata: { majelis: allDosenIds })

  // Notify semua pihak
  NOTIFY wd1 { "Munaqasyah {mhs.nama} siap untuk approval" }
  NOTIFY mahasiswa { "Jadwal munaqasyah: {tanggal} {waktu} di {ruang}" }
  FOR EACH dosenId IN allDosenIds:
    NOTIFY dosen(dosenId) { "Anda ditunjuk dalam majelis sidang {mhs.nama} pada {tanggal}" }
```

#### Acceptance Criteria

```
AC-TA05-03-01: Sekprodi tetapkan majelis berhasil
GIVEN pengajuan status "pending_sekprodi", TA-02 selesai dengan P1=Dr.A P2=Dr.B
WHEN Sekprodi input: tanggal sidang, ruang, Ketua=Dr.C, Sek=Dr.D, Penguji1=Dr.E, Penguji2=Dr.F
THEN status berubah "pending_wd1"
  AND 4 assignment baru tercipta (ketua, sek, p1, p2 penguji)
  AND auto-fill P1=Dr.A P2=Dr.B dari TA-02
  AND notifikasi ke WD1 + mahasiswa + 6 dosen majelis

AC-TA05-03-02: Ada dosen yang sama di majelis
GIVEN Sekprodi memilih Ketua = Dr. C dan Penguji 1 = Dr. C (sama)
WHEN Sekprodi submit
THEN error ERR_VAL_DUPLICATE "Semua anggota majelis harus berbeda"

AC-TA05-03-03: Tanggal kurang dari 3 hari
WHEN tanggal_sidang = besok
THEN error ERR_VAL_MIN_VALUE "Jadwal sidang minimal 3 hari dari sekarang"
```

---

### STEP TA05-04: WD1 Approve

**Step ID**: `TA05-04`
**Status**: `pending_wd1` → `pending_dekan`
**Aktor**: A4
**SLA**: 3 hari kerja

#### Actions

| Action | Target Status | Alasan Wajib |
|---|---|---|
| `approve` | `pending_dekan` | Tidak |
| `reject_to_step` (staff/sekprodi) | sesuai pilihan | Ya |

---

### STEP TA05-05: Dekan TTD Final

**Step ID**: `TA05-05`
**Status**: `pending_dekan` → `selesai`
**Aktor**: A5 (Dekan)
**SLA**: 3 hari kerja

#### Process Logic

```
FUNCTION dekanSignTA05(pengajuanId, action, data, user):
  requireStructuralPosition(user, 'dekan')

  IF action == 'sign':
    ASSERT ttdScan EXISTS ELSE THROW ERR_BUS_TTD_NOT_UPLOADED

    // Generate 5 dokumen sekaligus
    generateMultipleDocuments(pengajuan, [
      { template: 'surat_tugas_munaqasyah' },
      { template: 'berita_acara_munaqasyah' },     // template kosong, diisi setelah sidang
      { template: 'yudisium_munaqasyah' },          // template kosong
      { template: 'rekapitulasi_nilai_munaqasyah' },// template kosong
      { template: 'detail_nilai_munaqasyah' }        // template kosong
    ])

    UPDATE pengajuan SET status = 'selesai'
    logAudit('pengajuan.signed')

    // Notify semua majelis bahwa surat tugas siap
    NOTIFY mahasiswa { "Surat Tugas Sidang Munaqasyah sudah terbit. Jadwal: {tanggal} {waktu} {ruang}" }
    FOR EACH dosenMajelis:
      NOTIFY dosen { "Surat Tugas Sidang {mhs.nama} sudah terbit. Bisa didownload di menu Surat & SK Saya" }
```

---

### STEP TA05-06: Sekretaris Sidang Input Nilai (Post-Sidang)

**Step ID**: `TA05-06`
**Trigger**: Setelah sidang dilaksanakan
**Aktor**: A6 (Sekretaris Sidang)

**Catatan penting**: **HANYA Sekretaris Sidang** yang input nilai — bukan masing-masing penguji (berbeda dengan TA-03/04). Sekretaris Sidang mengumpulkan nilai dari semua penguji secara manual (form fisik) lalu input ke sistem.

#### Yang Diinput Sekretaris Sidang

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `nilai_pembimbing_1` | number | Ya | Nilai dari Pembimbing 1 (0-100) |
| `nilai_pembimbing_2` | number | Ya | Nilai dari Pembimbing 2 (0-100) |
| `nilai_penguji_1` | number | Ya | Nilai dari Penguji 1 (0-100) |
| `nilai_penguji_2` | number | Ya | Nilai dari Penguji 2 (0-100) |
| `keputusan` | radio | Ya | `lulus` / `tidak_lulus` |
| `catatan_majelis` | textarea | Tidak | Catatan umum dari majelis |

#### Auto-Calculate Yudisium

```
FUNCTION calculateYudisium(nilaiP1, nilaiP2, nilaiPenguji1, nilaiPenguji2):
  // Bobot: bisa configurable, default semua sama
  nilaiAkhir = (nilaiP1 + nilaiP2 + nilaiPenguji1 + nilaiPenguji2) / 4

  // Konversi ke 4.0 scale
  IF nilaiAkhir >= 85: ipk = 4.00
  ELSE IF nilaiAkhir >= 80: ipk = 3.75
  ELSE IF nilaiAkhir >= 75: ipk = 3.50
  ELSE IF nilaiAkhir >= 70: ipk = 3.00
  ELSE IF nilaiAkhir >= 65: ipk = 2.75
  ELSE IF nilaiAkhir >= 60: ipk = 2.50
  ELSE: ipk = 0  // tidak lulus

  // Yudisium
  IF keputusan == 'tidak_lulus': yudisium = null
  ELSE IF ipk > 3.51: yudisium = 'pujian'
  ELSE IF ipk >= 3.01: yudisium = 'sangat_memuaskan'
  ELSE IF ipk >= 2.76: yudisium = 'memuaskan'
  ELSE: yudisium = null  // tidak lulus

  RETURN { nilaiAkhir, ipk, yudisium }
```

> **Catatan**: Formula nilai dan batas IPK perlu dikonfirmasi dengan WD1 UIN SMH Banten.

#### Process Logic

```
FUNCTION sekretarisInputNilaiTA05(pengajuanId, data, user):
  pengajuan = GET WHERE id = pengajuanId AND jenis_layanan_kode = 'TA-05' AND status = 'selesai'

  // Cek user adalah sekretaris sidang
  assignment = GET assignments WHERE pengajuan_id AND dosen_id = user.dosenId AND type = 'sekretaris_sidang'
  ASSERT assignment != NULL ELSE THROW ERR_AUTH_NOT_ASSIGNED

  // Validate semua nilai diisi
  ASSERT all(data.nilai_p1, data.nilai_p2, data.nilai_penguji1, data.nilai_penguji2) NOT NULL

  // Calculate
  result = calculateYudisium(data.nilai_p1, data.nilai_p2, data.nilai_penguji1, data.nilai_penguji2)

  // Save
  INSERT nilai_sidang_detail {
    pengajuan_id,
    input_by: user.dosenId,
    assignment_type: 'sekretaris_sidang',
    nilai_per_penilai: JSON(data),
    nilai_akhir: result.nilaiAkhir,
    ipk_equivalent: result.ipk,
    yudisium: result.yudisium,
    keputusan: data.keputusan
  }

  // Regenerate dokumen dengan nilai
  regenerateDocuments(pengajuan, [
    'berita_acara_munaqasyah',
    'yudisium_munaqasyah',
    'rekapitulasi_nilai_munaqasyah',
    'detail_nilai_munaqasyah'
  ], { nilaiData: data, result })

  logAudit('nilai.input', metadata: { by: 'sekretaris', keputusan: data.keputusan, yudisium: result.yudisium })
  NOTIFY mahasiswa {
    severity: success,
    message: "Hasil Munaqasyah: {data.keputusan.toUpperCase()}. Yudisium: {result.yudisium}."
  }
```

---

## Jika TIDAK LULUS

```
IF data.keputusan == 'tidak_lulus':
  UPDATE pengajuan_nilai SET keputusan = 'tidak_lulus', yudisium = null

  // Pengajuan ini SELESAI (selesai dengan keputusan tidak lulus)
  // Mahasiswa harus buat pengajuan TA-05 BARU untuk sidang ulang

  NOTIFY mahasiswa {
    severity: warning,
    message: "Hasil munaqasyah: TIDAK LULUS. Silakan ajukan sidang ulang."
  }
```

**Alur sidang ulang**:
1. Mahasiswa submit pengajuan TA-05 baru
2. Sistem izinkan karena pengajuan lama sudah `selesai` (meskipun tidak lulus)
3. Proses mulai dari awal (Staff Prodi → Sekprodi → WD1 → Dekan)
4. Data dasar (judul, pembimbing) bisa di-copy dari pengajuan lama

---

## Dokumen Output (5 Dokumen)

| No | Nama | Template | Generate Saat |
|---|---|---|---|
| 1 | Surat Tugas Sidang Munaqasyah | `template_ujian_skripsi` | Dekan TTD (Step TA05-05) |
| 2 | Berita Acara & Keputusan Sidang | `template_ujian_skripsi` | Dekan TTD (template) + re-generate setelah nilai (Step TA05-06) |
| 3 | Data Penentuan Yudisium | `template_ujian_skripsi` | Re-generate setelah nilai (Step TA05-06) |
| 4 | Rekapitulasi Nilai Ujian Skripsi | `template_ujian_skripsi` | Re-generate setelah nilai (Step TA05-06) |
| 5 | Detail Nilai Ujian Skripsi | `template_ujian_skripsi` | Re-generate setelah nilai (Step TA05-06) |

---

## SLA Summary

| Step | Aktor | SLA | Konsekuensi |
|---|---|---|---|
| TA05-02 | Staff Prodi | 2 hari kerja | Reminder |
| TA05-03 | Sekprodi | 3 hari kerja | Reminder + eskalasi ke Kaprodi |
| TA05-04 | WD1 | 3 hari kerja | Reminder + eskalasi ke Dekan |
| TA05-05 | Dekan | 3 hari kerja | Reminder urgent |
