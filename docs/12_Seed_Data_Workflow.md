# Seed Data Workflow — 13 Layanan SILA

**Versi**: 1.0
**Tanggal**: 28 Mei 2026

> **PENTING untuk AI Agent**: Dokumen ini adalah data seed konkret yang harus dimasukkan ke tabel `workflow_definitions`, `workflow_steps`, dan `workflow_step_actions` saat pertama kali sistem di-deploy. Tanpa data ini, workflow engine tidak bisa berjalan.

---

## Format Prisma Seed (TypeScript)

Data ini ditulis dalam format yang siap di-paste ke `prisma/seed.ts`:

```typescript
// prisma/seed.ts — Bagian Workflow

// =====================================================================
// WORKFLOW TA-01: Pengajuan Judul Skripsi
// =====================================================================
const wf_ta01 = await prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: /* ID TA-01 */,
    versi: 1,
    is_active: true,
    steps: {
      create: [

        // STEP 1: Verifikasi Staff Prodi
        {
          step_code: 'TA01-02',
          step_order: 1,
          status_code: 'pending_staff_prodi',
          actor_type: 'staff_prodi',
          actor_condition: { prodi_match: true },
          sla_days: 2,
          sla_consequence: 'reminder',
          actions: {
            create: [
              {
                action_code: 'approve',
                target_status: 'pending_pa',
                requires_reason: false,
                requires_confirmation: false,
                label: 'Setujui & Teruskan ke PA'
              },
              {
                action_code: 'reject_to_submitter',
                target_status: 'revision_required',
                requires_reason: true,
                requires_confirmation: true,
                label: 'Tolak (Kembalikan ke Mahasiswa)'
              }
            ]
          }
        },

        // STEP 2: PA Pilih Judul
        {
          step_code: 'TA01-03',
          step_order: 2,
          status_code: 'pending_pa',
          actor_type: 'dosen_pa',
          actor_condition: { check_assignment: 'dosen_pa' },
          sla_days: 7,
          sla_consequence: 'bypass',
          actions: {
            create: [
              {
                action_code: 'select_judul',
                target_status: 'pending_kaprodi',
                requires_reason: false,
                requires_confirmation: false,
                label: 'Pilih Judul & Lanjutkan'
              },
              {
                action_code: 'reject_to_submitter',
                target_status: 'revision_required',
                requires_reason: true,
                requires_confirmation: true,
                label: 'Tolak Semua Judul'
              }
            ]
          }
        },

        // STEP 3: Approval Kaprodi
        {
          step_code: 'TA01-04',
          step_order: 3,
          status_code: 'pending_kaprodi',
          actor_type: 'kaprodi',
          actor_condition: { check_structural_position: 'kaprodi', prodi_match: true },
          sla_days: 3,
          sla_consequence: 'reminder',
          actions: {
            create: [
              {
                action_code: 'approve',
                target_status: 'pending_wd1',
                requires_reason: false,
                requires_confirmation: false,
                label: 'Setujui & Teruskan ke WD1'
              },
              {
                action_code: 'reject_to_step',
                target_status: 'pending_pa',
                requires_reason: true,
                requires_confirmation: true,
                label: 'Kembalikan ke PA'
              },
              {
                action_code: 'reject_to_submitter',
                target_status: 'revision_required',
                requires_reason: true,
                requires_confirmation: true,
                label: 'Kembalikan ke Mahasiswa'
              }
            ]
          }
        },

        // STEP 4: WD1 TTD Final
        {
          step_code: 'TA01-05',
          step_order: 4,
          status_code: 'pending_wd1',
          actor_type: 'wakil_dekan_1',
          actor_condition: { check_structural_position: 'wakil_dekan_1' },
          sla_days: 3,
          sla_consequence: 'reminder',
          actions: {
            create: [
              {
                action_code: 'sign',
                target_status: 'selesai',
                requires_reason: false,
                requires_confirmation: true,
                label: 'Tanda Tangan & Terbitkan'
              },
              {
                action_code: 'reject_to_step',
                target_status: null, // target dipilih dynamic oleh WD1
                requires_reason: true,
                requires_confirmation: true,
                label: 'Kembalikan ke...',
                extra_config: {
                  allow_target: ['pending_staff_prodi', 'pending_pa', 'pending_kaprodi']
                }
              }
            ]
          }
        }
      ]
    }
  }
});

// =====================================================================
// WORKFLOW TA-02: SK Pembimbing Skripsi
// =====================================================================
const wf_ta02 = await prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: /* ID TA-02 */,
    versi: 1,
    is_active: true,
    steps: {
      create: [
        // STEP 1: Staff Prodi Verifikasi
        {
          step_code: 'TA02-02',
          step_order: 1,
          status_code: 'pending_staff_prodi',
          actor_type: 'staff_prodi',
          actor_condition: { prodi_match: true },
          sla_days: 2,
          sla_consequence: 'reminder',
          actions: { create: [
            { action_code: 'approve', target_status: 'pending_sekprodi', requires_reason: false, requires_confirmation: false, label: 'Setujui' },
            { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak' }
          ]}
        },
        // STEP 2: Sekprodi Tetapkan Pembimbing
        {
          step_code: 'TA02-03',
          step_order: 2,
          status_code: 'pending_sekprodi',
          actor_type: 'sekprodi',
          actor_condition: { check_structural_position: 'sekprodi', prodi_match: true },
          sla_days: 3,
          sla_consequence: 'reminder',
          actions: { create: [
            { action_code: 'approve', target_status: 'pending_wd1', requires_reason: false, requires_confirmation: false, label: 'Tetapkan Pembimbing & Lanjut' },
            { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak' }
          ]}
        },
        // STEP 3: WD1 Approval
        {
          step_code: 'TA02-04',
          step_order: 3,
          status_code: 'pending_wd1',
          actor_type: 'wakil_dekan_1',
          actor_condition: { check_structural_position: 'wakil_dekan_1' },
          sla_days: 3,
          sla_consequence: 'reminder',
          actions: { create: [
            { action_code: 'approve', target_status: 'pending_dekan', requires_reason: false, requires_confirmation: false, label: 'Setujui' },
            { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
              extra_config: { allow_target: ['pending_staff_prodi', 'pending_sekprodi'] } }
          ]}
        },
        // STEP 4: Dekan TTD Final
        {
          step_code: 'TA02-05',
          step_order: 4,
          status_code: 'pending_dekan',
          actor_type: 'dekan',
          actor_condition: { check_structural_position: 'dekan' },
          sla_days: 3,
          sla_consequence: 'reminder',
          actions: { create: [
            { action_code: 'sign', target_status: 'selesai', requires_reason: false, requires_confirmation: true, label: 'Tanda Tangan & Terbitkan SK' },
            { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
              extra_config: { allow_target: ['pending_staff_prodi', 'pending_sekprodi', 'pending_wd1'] } }
          ]}
        }
      ]
    }
  }
});

// =====================================================================
// WORKFLOW TA-03: Seminar Proposal
// =====================================================================
// Pola: Staff Prodi (verifikasi + jadwal) → Sekprodi (penguji) → WD1 (sign)
const wf_ta03 = await prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: /* ID TA-03 */,
    versi: 1, is_active: true,
    steps: { create: [
      {
        step_code: 'TA03-02', step_order: 1,
        status_code: 'pending_staff_prodi',
        actor_type: 'staff_prodi',
        actor_condition: { prodi_match: true },
        sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_sekprodi', requires_reason: false, requires_confirmation: false, label: 'Verifikasi & Simpan Jadwal' },
          { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak' }
        ]}
      },
      {
        step_code: 'TA03-03', step_order: 2,
        status_code: 'pending_sekprodi',
        actor_type: 'sekprodi',
        actor_condition: { check_structural_position: 'sekprodi', prodi_match: true },
        sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_wd1', requires_reason: false, requires_confirmation: false, label: 'Tetapkan Penguji & Lanjut' },
          { action_code: 'reject_to_step', target_status: 'pending_staff_prodi', requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke Staff Prodi' }
        ]}
      },
      {
        step_code: 'TA03-04', step_order: 3,
        status_code: 'pending_wd1',
        actor_type: 'wakil_dekan_1',
        actor_condition: { check_structural_position: 'wakil_dekan_1' },
        sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'sign', target_status: 'selesai', requires_reason: false, requires_confirmation: true, label: 'Tanda Tangan & Terbitkan Surat Tugas' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_prodi', 'pending_sekprodi'] } }
        ]}
      }
    ]}
  }
});

// =====================================================================
// WORKFLOW TA-04: Ujian Komprehensif
// (Pola identik dengan TA-03)
// =====================================================================
const wf_ta04 = await prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: /* ID TA-04 */,
    versi: 1, is_active: true,
    steps: { create: [
      {
        step_code: 'TA04-02', step_order: 1,
        status_code: 'pending_staff_prodi', actor_type: 'staff_prodi',
        actor_condition: { prodi_match: true }, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_sekprodi', requires_reason: false, requires_confirmation: false, label: 'Verifikasi & Simpan Jadwal' },
          { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak' }
        ]}
      },
      {
        step_code: 'TA04-03', step_order: 2,
        status_code: 'pending_sekprodi', actor_type: 'sekprodi',
        actor_condition: { check_structural_position: 'sekprodi', prodi_match: true }, sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_wd1', requires_reason: false, requires_confirmation: false, label: 'Tetapkan Penguji & Lanjut' },
          { action_code: 'reject_to_step', target_status: 'pending_staff_prodi', requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke Staff Prodi' }
        ]}
      },
      {
        step_code: 'TA04-04', step_order: 3,
        status_code: 'pending_wd1', actor_type: 'wakil_dekan_1',
        actor_condition: { check_structural_position: 'wakil_dekan_1' }, sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'sign', target_status: 'selesai', requires_reason: false, requires_confirmation: true, label: 'Tanda Tangan & Terbitkan Surat Tugas' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_prodi', 'pending_sekprodi'] } }
        ]}
      }
    ]}
  }
});

// =====================================================================
// WORKFLOW TA-05: Ujian Skripsi (Munaqasyah)
// Berbeda: Staff hanya verifikasi (tidak jadwalkan), Sekprodi jadwal+majelis, TTD Dekan
// =====================================================================
const wf_ta05 = await prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: /* ID TA-05 */,
    versi: 1, is_active: true,
    steps: { create: [
      {
        step_code: 'TA05-02', step_order: 1,
        status_code: 'pending_staff_prodi', actor_type: 'staff_prodi',
        actor_condition: { prodi_match: true }, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_sekprodi', requires_reason: false, requires_confirmation: false, label: 'Verifikasi Berkas' },
          { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak' }
        ]}
      },
      {
        step_code: 'TA05-03', step_order: 2,
        status_code: 'pending_sekprodi', actor_type: 'sekprodi',
        actor_condition: { check_structural_position: 'sekprodi', prodi_match: true }, sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_wd1', requires_reason: false, requires_confirmation: false, label: 'Tetapkan Jadwal & Majelis' },
          { action_code: 'reject_to_step', target_status: 'pending_staff_prodi', requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke Staff Prodi' }
        ]}
      },
      {
        step_code: 'TA05-04', step_order: 3,
        status_code: 'pending_wd1', actor_type: 'wakil_dekan_1',
        actor_condition: { check_structural_position: 'wakil_dekan_1' }, sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_dekan', requires_reason: false, requires_confirmation: false, label: 'Setujui' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_prodi', 'pending_sekprodi'] } }
        ]}
      },
      {
        step_code: 'TA05-05', step_order: 4,
        status_code: 'pending_dekan', actor_type: 'dekan',
        actor_condition: { check_structural_position: 'dekan' }, sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'sign', target_status: 'selesai', requires_reason: false, requires_confirmation: true, label: 'Tanda Tangan & Terbitkan' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_prodi', 'pending_sekprodi', 'pending_wd1'] } }
        ]}
      }
    ]}
  }
});

// =====================================================================
// WORKFLOW TA-06: Cek Turnitin
// =====================================================================
const wf_ta06 = await prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: /* ID TA-06 */,
    versi: 1, is_active: true,
    steps: { create: [
      {
        step_code: 'TA06-02', step_order: 1,
        status_code: 'pending_kepala_lab', actor_type: 'kepala_lab',
        actor_condition: { check_structural_position: 'kepala_lab' },
        sla_days: 3, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'selesai', requires_reason: false, requires_confirmation: true, label: 'Setujui & Terbitkan Sertifikat' },
          { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak (Perlu Revisi)' }
        ]}
      }
    ]}
  }
});

// =====================================================================
// WORKFLOW AK-01 s.d. AK-05, AK-07 (TTD WD1)
// Pola: Staff Akademik → Kabag → WD1
// =====================================================================
const wfAkWd1 = (jenisLayananId: number, kode: string) => prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: jenisLayananId,
    versi: 1, is_active: true,
    steps: { create: [
      {
        step_code: `${kode}-02`, step_order: 1,
        status_code: 'pending_staff_akademik', actor_type: 'staff_akademik',
        actor_condition: {}, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_kabag', requires_reason: false, requires_confirmation: false, label: 'Verifikasi & Setujui' },
          { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak' }
        ]}
      },
      {
        step_code: `${kode}-03`, step_order: 2,
        status_code: 'pending_kabag', actor_type: 'kabag',
        actor_condition: { check_structural_position: 'kabag_tu' }, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_wd1', requires_reason: false, requires_confirmation: false, label: 'Setujui' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_akademik'] } }
        ]}
      },
      {
        step_code: `${kode}-04`, step_order: 3,
        status_code: 'pending_wd1', actor_type: 'wakil_dekan_1',
        actor_condition: { check_structural_position: 'wakil_dekan_1' }, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'sign', target_status: 'selesai', requires_reason: false, requires_confirmation: true, label: 'Tanda Tangan & Terbitkan' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_akademik', 'pending_kabag'] } }
        ]}
      }
    ]}
  }
});

// AK-01 Aktif Kuliah → WD1
await wfAkWd1(/* ID AK-01 */, 'AK01');
// AK-02 Masih Kuliah PNS → WD1
await wfAkWd1(/* ID AK-02 */, 'AK02');
// AK-04 Pengantar Observasi → WD1
await wfAkWd1(/* ID AK-04 */, 'AK04');
// AK-05 Pengantar Penelitian → WD1
await wfAkWd1(/* ID AK-05 */, 'AK05');

// =====================================================================
// WORKFLOW AK-03, AK-06, AK-07 (TTD Dekan)
// Pola: Staff Akademik → Kabag → Dekan
// =====================================================================
const wfAkDekan = (jenisLayananId: number, kode: string) => prisma.workflowDefinition.create({
  data: {
    jenis_layanan_id: jenisLayananId,
    versi: 1, is_active: true,
    steps: { create: [
      {
        step_code: `${kode}-02`, step_order: 1,
        status_code: 'pending_staff_akademik', actor_type: 'staff_akademik',
        actor_condition: {}, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_kabag', requires_reason: false, requires_confirmation: false, label: 'Verifikasi & Setujui' },
          { action_code: 'reject_to_submitter', target_status: 'revision_required', requires_reason: true, requires_confirmation: true, label: 'Tolak' }
        ]}
      },
      {
        step_code: `${kode}-03`, step_order: 2,
        status_code: 'pending_kabag', actor_type: 'kabag',
        actor_condition: { check_structural_position: 'kabag_tu' }, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'approve', target_status: 'pending_dekan', requires_reason: false, requires_confirmation: false, label: 'Setujui' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_akademik'] } }
        ]}
      },
      {
        step_code: `${kode}-04`, step_order: 3,
        status_code: 'pending_dekan', actor_type: 'dekan',
        actor_condition: { check_structural_position: 'dekan' }, sla_days: 2, sla_consequence: 'reminder',
        actions: { create: [
          { action_code: 'sign', target_status: 'selesai', requires_reason: false, requires_confirmation: true, label: 'Tanda Tangan & Terbitkan' },
          { action_code: 'reject_to_step', target_status: null, requires_reason: true, requires_confirmation: true, label: 'Kembalikan ke...',
            extra_config: { allow_target: ['pending_staff_akademik', 'pending_kabag'] } }
        ]}
      }
    ]}
  }
});

// AK-03 Pernah Kuliah → Dekan
await wfAkDekan(/* ID AK-03 */, 'AK03');
// AK-06 Permohonan Magang → Dekan
await wfAkDekan(/* ID AK-06 */, 'AK06');
// AK-07 Rekomendasi → Dekan
await wfAkDekan(/* ID AK-07 */, 'AK07');
```

---

## Ringkasan SLA per Layanan

| Layanan | Step 1 | Step 2 | Step 3 | Step 4 | Total Maks |
|---|---|---|---|---|---|
| TA-01 | Staff 2hr | PA **7hr** | Kaprodi 3hr | WD1 3hr | 15 hari kerja |
| TA-02 | Staff 2hr | Sekprodi 3hr | WD1 3hr | Dekan 3hr | 11 hari kerja |
| TA-03 | Staff+Jadwal 2hr | Sekprodi 3hr | WD1 3hr | - | 8 hari kerja |
| TA-04 | Staff+Jadwal 2hr | Sekprodi 3hr | WD1 3hr | - | 8 hari kerja |
| TA-05 | Staff 2hr | Sekprodi 3hr | WD1 3hr | Dekan 3hr | 11 hari kerja |
| TA-06 | Kepala Lab 3hr | - | - | - | 3 hari kerja |
| AK-01,02,04,05 | Staff 2hr | Kabag 2hr | WD1 2hr | - | 6 hari kerja |
| AK-03,06,07 | Staff 2hr | Kabag 2hr | Dekan 2hr | - | 6 hari kerja |

---

## Catatan untuk AI Agent

1. **Ganti placeholder `/* ID */`** dengan ID aktual setelah insert tabel `jenis_layanan`
2. **`extra_config`** di action `reject_to_step` berisi `allow_target` — daftar status yang boleh dipilih WD1/Dekan/Kabag saat reject bertingkat. Simpan sebagai JSON di kolom `action_config` (tambahkan kolom ini ke tabel `workflow_step_actions` jika belum ada)
3. **Jangan hardcode SLA** di kode — selalu baca dari `workflow_steps.sla_days`
4. Seed ini adalah **versi 1** per layanan. Jika admin ubah workflow di kemudian hari, buat versi baru (increment `versi`) dan set yang lama `is_active = false`
