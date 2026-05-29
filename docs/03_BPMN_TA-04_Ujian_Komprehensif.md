# BPMN TA-04: Ujian Komprehensif

**Kode**: TA-04
**Kategori**: Tugas Akhir
**Scope**: Prodi
**Output**: 5 dokumen (Surat Tugas + Form I-IV K)
**Prasyarat**: TA-03 harus berstatus `selesai` DAN hasil sempro = `layak`

---

## Workflow Summary

```
Mahasiswa → Staff Prodi (verifikasi + PENJADWALAN) → Sekprodi (PENETAPAN Penguji Prodi & Keislaman) → WD1 (TTD)
  └─ [Setelah sidang] → Penguji Prodi & Penguji Keislaman input nilai → Sistem auto-calculate
```

**Catatan**: Pola workflow **identik dengan TA-03**, perbedaan utama:
1. Jenis penguji: **Penguji Keahlian Prodi + Penguji Keislaman** (bukan Penguji 1 & 2 biasa)
2. Formula nilai: **P = (X1 + X2) / 2**
3. Output dokumen: **5 dokumen** (bukan 3)
4. Prasyarat: TA-03 selesai + hasil LAYAK

---

## Aktor

| ID | Aktor | Kondisi |
|---|---|---|
| A1 | Mahasiswa | aktif, TA-03 selesai + layak |
| A2 | Staff Prodi | prodi sama |
| A3 | Sekprodi | prodi sama, aktif |
| A4 | Wakil Dekan 1 | aktif |
| A5 | Penguji Keahlian Prodi | Dosen fakultas, assignment `penguji_komprehensif_prodi` |
| A6 | Penguji Keislaman | Dosen fakultas, assignment `penguji_komprehensif_keislaman` |

---

## Step-by-Step (Perbedaan dari TA-03)

### STEP TA04-01: Mahasiswa Submit

Sama pola dengan TA03-01. Prasyarat tambahan:

```
P1: TA-03 berstatus 'selesai'
P2: Hasil sempro TA-03 = 'layak' (cek dari nilai_sidang)
```

#### Dokumen Upload

| Dok ID | Nama | Format | Max | Wajib |
|---|---|---|---|---|
| `DOK-TA04-01` | Transkrip Nilai Terbaru | PDF | 2 MB | Ya |
| `DOK-TA04-02` | Sertifikat Lulus Seminar Proposal (dari TA-03) | Auto-attach | - | Auto |
| `DOK-TA04-03` | Bukti Pembayaran Ujian Komprehensif | PDF, JPG | 2 MB | Ya |
| `DOK-TA04-04` | KRS Semester Berjalan | PDF | 2 MB | Ya |

---

### STEP TA04-02: Staff Prodi Verifikasi + Penjadwalan

Sama pola dengan TA03-02. Staff input tanggal/waktu/ruang sidang + approve/reject.

---

### STEP TA04-03: Sekprodi Tetapkan Penguji

Sama pola dengan TA03-03, **perbedaan pada tipe penguji**:

#### Yang Diinput Sekprodi

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| `penguji_prodi_dosen_id` | dosen_picker | Ya | Dosen aktif fakultas sama |
| `penguji_keislaman_dosen_id` | dosen_picker | Ya | Dosen aktif fakultas sama, berbeda dari penguji prodi |

#### Assignments yang Dibuat

```
INSERT assignments { dosen_id: pengujiProdi.id, type: 'penguji_komprehensif_prodi', pengajuan_id }
INSERT assignments { dosen_id: pengujiKeislaman.id, type: 'penguji_komprehensif_keislaman', pengajuan_id }
```

---

### STEP TA04-04: WD1 TTD

Sama pola, generate **5 dokumen**:
1. Surat Tugas Penguji Komprehensif
2. Form I K — Berita Acara Keputusan Sidang
3. Form II K — Rekapitulasi Nilai
4. Form III K — Nilai Komponen Dasar (Keahlian Prodi)
5. Form IV K — Nilai Komponen Pendukung (Keislaman)

---

### STEP TA04-05: Input Nilai (Post-Sidang)

**Perbedaan kunci dari TA-03**: Formula nilai spesifik.

#### Yang Diinput Masing-Masing Penguji

**Penguji Keahlian Prodi** input:
| Field | Tipe | Wajib |
|---|---|---|
| `nilai_prodi` (X1) | number | Ya (0-100) |
| `catatan` | textarea | Tidak |
| `keputusan` | radio | Ya (`lulus` / `tidak_lulus`) |

**Penguji Keislaman** input:
| Field | Tipe | Wajib |
|---|---|---|
| `nilai_keislaman` (X2) | number | Ya (0-100) |
| `catatan` | textarea | Tidak |
| `keputusan` | radio | Ya (`lulus` / `tidak_lulus`) |

#### Auto-Calculate

```
FUNCTION calculateNilaiKomprehensif(nilaiProdi, nilaiKeislaman):
  P = (nilaiProdi + nilaiKeislaman) / 2

  // Konversi ke huruf
  IF P >= 3.51: huruf = 'A'
  ELSE IF P >= 3.01: huruf = 'B+'
  ELSE IF P >= 2.76: huruf = 'B'
  ELSE IF P >= 2.51: huruf = 'C+'
  ELSE IF P >= 2.50: huruf = 'C'
  ELSE: huruf = 'D' (tidak lulus)

  // Keputusan final
  IF keduaPenguji == 'lulus' AND P >= 2.50:
    keputusanFinal = 'lulus'
  ELSE:
    keputusanFinal = 'tidak_lulus'

  RETURN { nilaiAkhir: P, huruf, keputusanFinal }
```

#### Acceptance Criteria

```
AC-TA04-05-01: Hitung nilai komprehensif
GIVEN Penguji Prodi input X1=85 (skala 0-100), Penguji Keislaman input X2=78
WHEN kedua penguji submit "lulus"
THEN P = (85 + 78) / 2 = 81.5
  AND keputusan final = "lulus"
  AND Form II K ter-regenerate dengan nilai

AC-TA04-05-02: Salah satu penguji "tidak lulus"
GIVEN Penguji Prodi input "lulus", Penguji Keislaman input "tidak_lulus"
THEN keputusan final = "tidak_lulus" (meskipun nilai cukup)
```

---

## Jika TIDAK LULUS

Mahasiswa bisa **submit TA-04 lagi** (pengajuan baru, bukan revisi):
- Pengajuan lama status: `selesai` dengan keputusan `tidak_lulus`
- Pengajuan baru: copy data dasar, proses dari awal
- Maksimal ujian ulang: sesuai kebijakan kampus (configurable)
