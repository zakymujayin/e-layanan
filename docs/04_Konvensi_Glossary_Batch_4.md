# Dokumen Konvensi & Glossary SILA — Batch 4

**Sistem**: SILA — Fakultas Ushuluddin dan Adab, UIN SMH Banten
**Cakupan Batch 4**: Bagian 11 (AI Agent Guidelines), Bagian 12 (Workflow & State Machine), Bagian 13 (Audit Logging), Bagian 14 (Testing), Bagian 15 (Documentation)
**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## ⚠️ Status Dokumen

- ✅ **Batch 1**: Bagian 1-3 — Fondasi Terminologi
- ✅ **Batch 2**: Bagian 4-7 — Konvensi Teknis
- ✅ **Batch 3**: Bagian 8-10 — UI & Acceptance
- ✅ **Batch 4** (dokumen ini): Bagian 11-15 — Tata Kelola Agent

**Seluruh 15 Bagian Konvensi & Glossary SILA sekarang LENGKAP.**

---

# Bagian 11: AI Agent Guidelines

> **Bagian ini adalah PANDUAN WAJIB untuk Claude Code dan DeepSeek Pro saat mengerjakan codebase SILA.** Bagian ini harus di-include di context setiap sesi coding agent.

## 11.1 Konteks Proyek untuk Agent

SILA adalah Sistem Informasi Layanan Akademik untuk Fakultas Ushuluddin dan Adab, UIN Sultan Maulana Hasanuddin Banten. Sistem ini mendigitalisasi 13 layanan akademik (6 Tugas Akhir + 7 Akademik) yang sebelumnya menggunakan Google Form + ketik manual Word + TTD basah.

**Tech Stack**:
- Next.js 16.2.x (App Router, React Server Components, Server Actions)
- React 19.2 (React Compiler stable)
- TypeScript strict mode
- shadcn/ui (style: new-york, Tailwind CSS v4, OKLCH colors)
- Prisma atau Drizzle ORM
- PostgreSQL 16+
- Zod v4 untuk validation
- Auth.js v5 untuk authentication
- date-fns v4 atau dayjs untuk date handling

## 11.2 Hierarchy of Authority (Dokumen Mana yang Menang)

Saat ada informasi yang konflik antar dokumen, ikuti urutan ini:

| Prioritas | Dokumen | Otoritatif Untuk |
|---|---|---|
| 1 (tertinggi) | **04 Konvensi & Glossary (Batch 1-4)** | Naming, enum, format, error code, konvensi teknis |
| 2 | **ERD / Database Schema** (akan dibuat) | Struktur data, relasi tabel, tipe kolom |
| 3 | **03 BPMN per Layanan** | Workflow detail, status transition, siapa input apa |
| 4 | **02 Aturan Akademik** | Field input, dokumen persyaratan per layanan |
| 5 | **01 Inventarisasi Layanan** | Keputusan arsitektur tingkat tinggi |
| 6 (terendah) | Komentar di code | Penjelasan implementasi spesifik |

**Jika ada konflik**: Dokumen prioritas lebih tinggi yang menang. Jika masih ragu, **STOP dan tanya user**.

## 11.3 Hal yang Agent TIDAK BOLEH Lakukan

### 11.3.1 Naming & Convention

1. **TIDAK BOLEH invent nama tabel/kolom** yang tidak ada di ERD
2. **TIDAK BOLEH ubah naming convention** (mis. camelCase ke snake_case di database)
3. **TIDAK BOLEH buat enum value baru** yang tidak ada di Batch 1 Bagian 3
4. **TIDAK BOLEH ubah error code format** dari pattern `ERR_[CATEGORY]_[SPECIFIC]`
5. **TIDAK BOLEH ganti komponen shadcn/ui** dengan library lain (mis. Material UI, Chakra)

### 11.3.2 Fitur & Logic

6. **TIDAK BOLEH tambah fitur** yang tidak ada di dokumen requirement (BPMN/SRS)
7. **TIDAK BOLEH skip authorization check** di server-side
8. **TIDAK BOLEH ubah workflow step** atau status transition tanpa validasi ke dokumen BPMN
9. **TIDAK BOLEH hardcode konfigurasi** yang seharusnya database-driven (SLA, field form, dokumen wajib)
10. **TIDAK BOLEH buat validasi akademik otomatis** (IPK/SKS) — Phase 1 hanya cek dokumen ada/tidak

### 11.3.3 Data & Security

11. **TIDAK BOLEH serve file langsung dari folder public** (semua file lewat API dengan auth check)
12. **TIDAK BOLEH skip scope filtering** saat query data pengajuan
13. **TIDAK BOLEH expose internal error/stack trace** ke user
14. **TIDAK BOLEH simpan password plaintext** (wajib hash)
15. **TIDAK BOLEH trust client-side check** untuk security (selalu cek di server juga)

## 11.4 Hal yang Agent WAJIB Lakukan

### 11.4.1 Setiap File Baru

1. **WAJIB** ikuti file naming convention (Batch 1 Bagian 2.3)
2. **WAJIB** tambah JSDoc untuk function public
3. **WAJIB** import dari path alias `@/` (bukan relative path panjang)

### 11.4.2 Setiap API Endpoint / Server Action

4. **WAJIB** validate input dengan Zod schema
5. **WAJIB** cek authentication (`requireAuth()`)
6. **WAJIB** cek authorization (role + scope + assignment)
7. **WAJIB** return response sesuai format Batch 2 Bagian 5
8. **WAJIB** handle error sesuai pattern Batch 2 Bagian 4
9. **WAJIB** log aksi ke audit log (Bagian 13)

### 11.4.3 Setiap UI Component

10. **WAJIB** pakai komponen shadcn/ui sebagai basis
11. **WAJIB** semua text UI dalam Bahasa Indonesia
12. **WAJIB** ada loading state untuk async action
13. **WAJIB** ada empty state untuk list/tabel kosong
14. **WAJIB** confirmation dialog untuk destructive action
15. **WAJIB** error display sesuai pattern Batch 2 Bagian 4.7

### 11.4.4 Setiap Fitur Workflow

16. **WAJIB** validasi state transition sesuai state machine (Bagian 12)
17. **WAJIB** kirim notifikasi sesuai event trigger (Batch 1 Bagian 3.9-3.10)
18. **WAJIB** catat di pengajuan_log
19. **WAJIB** cek SLA timer jika relevan

## 11.5 Cara Agent Mengatasi Ambiguity

Saat menemukan spec yang tidak jelas atau konflik, ikuti urutan ini:

```
1. Cek dokumen Konvensi & Glossary (Batch 1-4)
     ↓ tidak ada?
2. Cek dokumen BPMN layanan terkait
     ↓ tidak ada?
3. Cek dokumen Aturan Akademik (02)
     ↓ tidak ada?
4. Cek dokumen Inventarisasi Layanan (01)
     ↓ masih tidak jelas?
5. STOP — tulis komentar // TODO: AMBIGUITY — [deskripsi ketidakjelasan]
   dan tanya user sebelum lanjut
```

**JANGAN** invent solusi sendiri kalau spec tidak jelas. Lebih baik tanya daripada salah implement.

## 11.6 Cara Agent Melaporkan Asumsi

Jika Agent **terpaksa** berasumsi (karena spec belum tersedia dan implementasi tidak bisa ditunda):

```typescript
// ASUMSI: [deskripsi asumsi]
// ALASAN: [kenapa asumsi ini diambil]
// DOKUMEN-REF: [dokumen mana yang kurang jelas]
// TODO: Konfirmasi asumsi ini ke PM/user
```

**Contoh**:
```typescript
// ASUMSI: Timeout session idle = 2 jam (7200 detik)
// ALASAN: Batch 3 Bagian 9.1.4 menyebutkan 2 jam tapi belum dikonfirmasi user
// DOKUMEN-REF: 04_Konvensi_Glossary_Batch_3.md Section 9.1.4
// TODO: Konfirmasi ke user apakah 2 jam sesuai
const IDLE_TIMEOUT_SECONDS = 7200;
```

## 11.7 Definition of Done (DoD) per Fitur

Sebuah fitur dianggap **"SELESAI"** jika semua checklist berikut terpenuhi:

```
[ ] Mengikuti naming convention (Batch 1 Bagian 2)
[ ] Menggunakan enum yang valid (Batch 1 Bagian 3)
[ ] Error handling sesuai standar (Batch 2 Bagian 4)
[ ] Response format sesuai standar (Batch 2 Bagian 5)
[ ] Date/time format sesuai standar (Batch 2 Bagian 6)
[ ] File handling sesuai standar (Batch 2 Bagian 7)
[ ] UI pakai shadcn/ui (Batch 3 Bagian 8)
[ ] Auth check server-side (Batch 3 Bagian 9)
[ ] Acceptance criteria terpenuhi (Batch 3 Bagian 10)
[ ] Audit log tercipta untuk action sensitif (Bagian 13)
[ ] Tidak ada hardcoded value yang seharusnya configurable
[ ] Test ditulis (Bagian 14)
[ ] Tidak ada komentar // ASUMSI yang belum dikonfirmasi
```

## 11.8 File Konvensi yang Harus Di-Include di Context Agent

Saat memulai sesi coding dengan AI Agent, include file-file ini di context:

**Wajib selalu**:
- `04_Konvensi_Glossary_Batch_1.md` (naming, enum)
- `04_Konvensi_Glossary_Batch_4.md` (agent guidelines — dokumen ini)

**Sesuai kebutuhan task**:
- Batch 2 (saat bikin API/error handling)
- Batch 3 (saat bikin UI/auth)
- BPMN layanan terkait (saat bikin fitur layanan spesifik)
- ERD (saat bikin model/migration)

---

# Bagian 12: Workflow & State Machine Convention

## 12.1 Prinsip State Machine

Setiap pengajuan layanan di SILA adalah **state machine** (mesin status). Artinya:

1. Pengajuan selalu punya **tepat 1 status aktif** pada satu waktu
2. Status hanya bisa berubah melalui **transisi yang valid** (didefinisikan per layanan)
3. Transisi **tidak bisa di-skip** (harus lewat jalur yang valid)
4. Setiap transisi **dicatat di audit log** (`pengajuan_log`)

## 12.2 Komponen State Machine per Layanan

Setiap layanan didefinisikan oleh:

```typescript
type WorkflowDefinition = {
  layananId: number;
  kode: string;                    // "TA-01", "AK-01", dll
  steps: WorkflowStep[];
  initialStatus: StatusPengajuanType;
  finalStatuses: StatusPengajuanType[];  // "selesai", "terminated"
};

type WorkflowStep = {
  stepId: string;                  // "TA01-STEP-01"
  status: StatusPengajuanType;     // status pengajuan saat di step ini
  actor: ActorDefinition;          // siapa yang bertindak
  availableActions: ActionDefinition[];
  slaInDays: number | null;        // null = no SLA
  slaConsequence: "reminder" | "bypass" | "escalation" | null;
  inputFields: InputFieldDefinition[];  // data yang harus diisi actor
};

type ActionDefinition = {
  action: WorkflowActionType;
  targetStatus: StatusPengajuanType;
  requiresReason: boolean;
  requiresConfirmation: boolean;
  sideEffects: SideEffect[];       // notifikasi, create record, dll
};
```

## 12.3 Konfigurasi di Database (Database-Driven)

Workflow didefinisikan di database, bukan hardcode:

```
workflow_definitions
  - id, jenis_layanan_id, versi, is_active

workflow_steps
  - id, workflow_definition_id, step_order
  - status_code, actor_type, actor_condition
  - sla_days, sla_consequence

workflow_step_actions
  - id, workflow_step_id
  - action_code, target_status
  - requires_reason, requires_confirmation

workflow_step_fields
  - id, workflow_step_id
  - field_name, field_type, is_required
```

**Implikasi**: Admin bisa ubah workflow tanpa ubah kode. Tapi perubahan workflow hanya berlaku untuk **pengajuan baru** — pengajuan yang sudah in-progress tetap pakai workflow saat pengajuan dibuat.

## 12.4 Workflow Execution Engine

### 12.4.1 Pseudo-code Workflow Engine

```typescript
async function executeAction(
  pengajuanId: number,
  action: WorkflowActionType,
  data: ActionData,
  user: User
) {
  // 1. Get pengajuan & current step
  const pengajuan = await getPengajuan(pengajuanId);
  const currentStep = await getCurrentStep(pengajuan);

  // 2. Validate action is allowed at current step
  const actionDef = currentStep.availableActions.find(a => a.action === action);
  if (!actionDef) {
    throw new BusinessError("ERR_BUS_INVALID_STATE_TRANSITION");
  }

  // 3. Validate actor is the right person
  await validateActor(user, currentStep.actor, pengajuan);

  // 4. Validate required fields
  if (actionDef.requiresReason && !data.reason) {
    throw new ValidationError("ERR_VAL_REQUIRED_FIELD", { field: "reason" });
  }

  // 5. Execute state transition
  await updatePengajuanStatus(pengajuan, actionDef.targetStatus);

  // 6. Save action data (fields input by actor)
  await saveStepData(pengajuan, currentStep, data);

  // 7. Execute side effects
  for (const effect of actionDef.sideEffects) {
    await executeSideEffect(effect, pengajuan, user);
  }

  // 8. Log to audit
  await createPengajuanLog({
    pengajuanId,
    action,
    performedBy: user.id,
    fromStatus: pengajuan.status,
    toStatus: actionDef.targetStatus,
    reason: data.reason,
    metadata: data
  });

  // 9. Check next step SLA
  const nextStep = await getStepByStatus(actionDef.targetStatus);
  if (nextStep?.slaInDays) {
    await scheduleSlaCheck(pengajuan, nextStep);
  }
}
```

### 12.4.2 SLA Timer

```typescript
async function scheduleSlaCheck(pengajuan: Pengajuan, step: WorkflowStep) {
  const deadline = addBusinessDays(new Date(), step.slaInDays);

  await createSlaSchedule({
    pengajuanId: pengajuan.id,
    stepId: step.stepId,
    deadline,
    consequence: step.slaConsequence
  });
}

// Cron job: jalankan setiap hari
async function checkExpiredSla() {
  const expiredItems = await getExpiredSlaSchedules();

  for (const item of expiredItems) {
    switch (item.consequence) {
      case "reminder":
        await sendSlaReminder(item);
        break;
      case "bypass":
        await triggerBypass(item);  // khusus TA-01
        break;
      case "escalation":
        await triggerEscalation(item);
        break;
    }
  }
}
```

## 12.5 Versioning Behavior

### 12.5.1 Kapan Versi Baru Tercipta

Versi baru di `pengajuan_versi` tercipta **hanya saat**:
- Mahasiswa **resubmit** setelah status `revision_required`
- Bukan saat approver approve/reject (itu masuk `pengajuan_log`, bukan versi baru)

### 12.5.2 Apa yang Di-snapshot

```typescript
type PengajuanVersi = {
  id: number;
  pengajuanId: number;
  versiKe: number;
  dataSnapshot: JSON;  // semua field input mahasiswa saat itu
  dokumenSnapshot: {    // referensi ke file yang di-upload saat itu
    dokumenPersyaratanId: number;
    filePath: string;
    fileName: string;
  }[];
  dibuatOleh: number;
  dibuatPada: Date;
  alasanPerubahan: string | null;
};
```

### 12.5.3 Akses Versi Lama

- Approver & mahasiswa bisa lihat versi sebelumnya via toggle di UI
- Versi lama **read-only**
- Dokumen output yang sudah terbit dengan data versi lama **tetap valid** (snapshot)

## 12.6 Reject & Re-approval Flow

### 12.6.1 Reject oleh Pejabat Atas (WD1/Dekan)

```
Status: pending_wd1 atau pending_dekan
  ↓
WD1/Dekan klik "Kembalikan"
  ↓
Pilih target role dari dropdown:
  - Staff Prodi
  - Sekprodi
  - Kaprodi
  - PA (khusus TA-01)
  ↓
Isi alasan (wajib)
  ↓
Status berubah sesuai target role (mis. pending_sekprodi)
Pengajuan ditandai "returned_from": "wd1" atau "dekan"
  ↓
Target role perbaiki → approve → re-approval lengkap ke atas
(semua step di atas harus re-approve, tapi mereka lihat badge "Returned from WD1")
```

### 12.6.2 Reject oleh Approver Level Bawah

```
Kaprodi/Sekprodi/Staff/PA klik "Tolak"
  ↓
Pilihan:
  - reject_to_submitter: kembali ke mahasiswa (status: revision_required)
  - reject_to_previous: kembali ke step sebelumnya
  ↓
Isi alasan (wajib)
  ↓
Status berubah sesuai pilihan
```

## 12.7 AI Agent Rules untuk Workflow

1. **WAJIB** validasi state transition sesuai state machine sebelum execute action
2. **WAJIB** buat `pengajuan_log` entry untuk setiap transisi
3. **WAJIB** schedule SLA timer saat pengajuan masuk step baru yang punya SLA
4. **JANGAN** allow skip step (mis. langsung dari `pending_staff_prodi` ke `pending_wd1`)
5. **WAJIB** cek pengajuan masih pakai workflow definition yang benar (versi saat dibuat)
6. **JANGAN** ubah data pengajuan yang sudah `selesai` atau `terminated` (immutable)

---

# Bagian 13: Audit Logging Convention

## 13.1 Prinsip

Audit log = catatan **siapa melakukan apa, kapan, terhadap resource apa**. Wajib ada untuk compliance, debugging, dan traceability.

## 13.2 Event yang Wajib Di-log

### 13.2.1 Authentication Events

| Event | Severity |
|---|---|
| Login berhasil | info |
| Login gagal | warning |
| Logout | info |
| Session expired | info |
| Password reset requested | info |
| Password changed | info |

### 13.2.2 Workflow Events

| Event | Severity |
|---|---|
| Pengajuan submitted | info |
| Pengajuan resubmitted (versi baru) | info |
| Step approved | info |
| Step rejected (dengan target & alasan) | info |
| Step signed (TTD final) | info |
| Bypass triggered (SLA expired) | warning |
| Pengajuan terminated | warning |
| Nilai sidang diinput | info |

### 13.2.3 Data Events

| Event | Severity |
|---|---|
| Master data created (dosen, mahasiswa, dll) | info |
| Master data updated | info |
| Master data deleted (soft) | warning |
| File uploaded | info |
| File downloaded | info |
| Dokumen final generated | info |
| TTD scan uploaded/updated | info |

### 13.2.4 System Events

| Event | Severity |
|---|---|
| Semester switched | warning |
| SLA check executed | info |
| Backup completed | info |
| System error | error |

### 13.2.5 Admin Events

| Event | Severity |
|---|---|
| User created/updated/deactivated | info |
| Role assigned/removed | warning |
| Workflow configuration changed | warning |
| System setting changed | warning |

## 13.3 Struktur Log Entry

### 13.3.1 Tabel `audit_logs`

```
audit_logs
  - id (bigint, auto-increment)
  - timestamp (datetime, UTC)
  - user_id (nullable, FK ke users — null untuk system events)
  - action (string, mis. "pengajuan.submitted", "auth.login_success")
  - entity_type (string, mis. "pengajuan_layanan", "users")
  - entity_id (nullable, int)
  - severity (enum: info, warning, error, critical)
  - metadata (JSON — detail tambahan)
  - ip_address (string, nullable)
  - user_agent (string, nullable)
  - request_id (string, nullable — untuk traceability)
```

### 13.3.2 Action Naming Convention

Format: `[entity].[action]`

**Contoh**:
- `auth.login_success`
- `auth.login_failed`
- `pengajuan.submitted`
- `pengajuan.approved`
- `pengajuan.rejected`
- `pengajuan.signed`
- `pengajuan.terminated`
- `pengajuan.bypass_triggered`
- `nilai.input`
- `dokumen.generated`
- `dokumen.downloaded`
- `file.uploaded`
- `user.created`
- `user.role_assigned`
- `semester.switched`
- `system.backup_completed`
- `system.error`

### 13.3.3 Metadata JSON Examples

```typescript
// Pengajuan submitted
{
  "pengajuan_kode": "TA-2026-0023",
  "jenis_layanan": "TA-01",
  "mahasiswa_nim": "221360001"
}

// Step approved
{
  "pengajuan_kode": "TA-2026-0023",
  "from_status": "pending_staff_prodi",
  "to_status": "pending_pa",
  "actor_role": "staff_prodi",
  "catatan": "Berkas lengkap"
}

// Reject bertingkat
{
  "pengajuan_kode": "TA-2026-0023",
  "from_status": "pending_wd1",
  "to_status": "pending_sekprodi",
  "actor_role": "wakil_dekan_1",
  "alasan": "Penguji 2 sedang cuti, mohon ganti",
  "returned_from": "wd1"
}
```

## 13.4 Helper Function

```typescript
// lib/audit.ts

export async function logAudit(params: {
  userId?: number;
  action: string;
  entityType?: string;
  entityId?: number;
  severity?: "info" | "warning" | "error" | "critical";
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}) {
  await prisma.auditLogs.create({
    data: {
      timestamp: new Date(),
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      severity: params.severity ?? "info",
      metadata: params.metadata ?? {},
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      requestId: params.requestId ?? null
    }
  });
}
```

## 13.5 Retention Policy

| Jenis | Retention | Storage |
|---|---|---|
| Audit log aktif | 2 tahun | Database utama |
| Audit log archive | 5 tahun | Database archive atau file |
| Audit log expired | Hapus | - |

**Implementasi**: Cron job bulanan pindahkan log > 2 tahun ke archive, hapus > 5 tahun.

## 13.6 AI Agent Rules untuk Audit Logging

1. **WAJIB** log setiap event di Section 13.2 menggunakan `logAudit()`
2. **WAJIB** pakai action naming convention `[entity].[action]`
3. **WAJIB** include metadata yang relevan (kode pengajuan, from/to status, alasan)
4. **JANGAN** log data sensitif (password, token session) di metadata
5. **WAJIB** set severity yang tepat (info untuk normal, warning untuk perubahan penting)

---

# Bagian 14: Testing Convention

## 14.1 Testing Strategy

SILA menggunakan **3 level testing**:

| Level | Scope | Tools | Target Coverage |
|---|---|---|---|
| **Unit Test** | Function individual, business logic | Vitest | 80% business logic |
| **Integration Test** | API endpoint, database query | Vitest + Prisma test utils | Semua endpoint |
| **E2E Test** | User flow end-to-end | Playwright | Happy path per layanan |

## 14.2 Test File Convention

### 14.2.1 Lokasi

```
src/
  lib/
    workflow/
      execute-action.ts
      execute-action.test.ts        ← unit test (co-located)
  app/
    api/
      pengajuan/
        route.ts
        route.test.ts               ← integration test (co-located)
tests/
  e2e/
    ta-01-pengajuan-judul.spec.ts   ← E2E test
    ak-01-surat-aktif.spec.ts
  fixtures/
    mahasiswa.ts                    ← test data
    dosen.ts
    pengajuan.ts
```

### 14.2.2 Test Naming

Format: `should [expected behavior] when [condition]`

```typescript
describe("executeAction", () => {
  it("should change status to pending_pa when staff_prodi approves", async () => {
    // ...
  });

  it("should throw ERR_BUS_INVALID_STATE_TRANSITION when action is not valid for current status", async () => {
    // ...
  });

  it("should create audit log entry when action is executed", async () => {
    // ...
  });
});
```

## 14.3 Test Data (Fixtures)

### 14.3.1 Seed Data untuk Test

```typescript
// tests/fixtures/mahasiswa.ts
export const testMahasiswa = {
  aktif: {
    nim: "221360001",
    namaLengkap: "Aini Fitri Utami",
    prodiId: 1,
    statusMahasiswa: "aktif" as const,
    semesterAktif: 7
  },
  alumni: {
    nim: "181360099",
    namaLengkap: "Budi Santoso",
    prodiId: 1,
    statusMahasiswa: "alumni" as const,
    semesterAktif: null
  }
};

// tests/fixtures/dosen.ts
export const testDosen = {
  pa: {
    nidn: "0115098501",
    namaLengkap: "Dr. Ahmad, M.Pd",
    jabatanFungsional: "Lektor"
  },
  kaprodi: {
    nidn: "0220077301",
    namaLengkap: "Prof. Dr. Siti Aminah",
    jabatanFungsional: "Guru Besar"
  }
};
```

### 14.3.2 Aturan Test Data

1. **JANGAN** pakai data production untuk test (selalu pakai fixtures)
2. **WAJIB** clean up setelah test (database test di-reset per suite)
3. **WAJIB** nama test data realistis (sesuai konteks PTKIN Indonesia)
4. **JANGAN** pakai random data yang tidak reproducible

## 14.4 Test Pattern per Level

### 14.4.1 Unit Test — Business Logic

```typescript
// lib/workflow/validate-transition.test.ts
import { validateTransition } from "./validate-transition";

describe("validateTransition", () => {
  it("should allow pending_staff_prodi → pending_pa", () => {
    expect(validateTransition("TA-01", "pending_staff_prodi", "approve")).toBe("pending_pa");
  });

  it("should reject pending_staff_prodi → pending_wd1 (skip)", () => {
    expect(() => validateTransition("TA-01", "pending_staff_prodi", "sign"))
      .toThrow("ERR_BUS_INVALID_STATE_TRANSITION");
  });
});
```

### 14.4.2 Integration Test — API

```typescript
// app/api/pengajuan/route.test.ts
describe("POST /api/pengajuan", () => {
  it("should create pengajuan when valid input", async () => {
    const response = await testClient.post("/api/pengajuan", {
      body: validPengajuanInput
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("pending_staff_prodi");
  });

  it("should return 422 when missing required fields", async () => {
    const response = await testClient.post("/api/pengajuan", {
      body: { /* missing fields */ }
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("ERR_VAL_MULTIPLE");
  });

  it("should return 403 when staff_prodi accesses other prodi", async () => {
    const response = await testClient.get("/api/pengajuan/123", {
      headers: { authorization: staffProdiOtherProdi.token }
    });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("ERR_AUTH_OUTSIDE_SCOPE");
  });
});
```

### 14.4.3 E2E Test — User Flow

```typescript
// tests/e2e/ta-01-pengajuan-judul.spec.ts
import { test, expect } from "@playwright/test";

test.describe("TA-01 Pengajuan Judul Skripsi", () => {
  test("happy path: mahasiswa submit → staff approve → PA pilih judul → kaprodi approve → WD1 sign", async ({ page }) => {
    // 1. Login sebagai mahasiswa
    await page.goto("/login");
    await page.fill("[name=email]", "aini@student.uinbanten.ac.id");
    await page.fill("[name=password]", "password123");
    await page.click("button[type=submit]");

    // 2. Submit pengajuan
    await page.click("text=Ajukan Layanan");
    await page.click("text=Pengajuan Judul Skripsi");
    await page.fill("[name=judul1]", "Analisis Hadis tentang...");
    await page.fill("[name=judul2]", "Kajian Tafsir Al-Quran...");
    await page.fill("[name=judul3]", "Studi Komparatif...");
    // ... upload dokumen, pilih PA
    await page.click("text=Submit Pengajuan");
    await expect(page.locator("text=Pengajuan berhasil")).toBeVisible();

    // 3. Login sebagai staff prodi, approve
    // ... (lanjut step per step)
  });
});
```

## 14.5 AI Agent Rules untuk Testing

1. **WAJIB** tulis unit test untuk setiap business logic function
2. **WAJIB** tulis integration test untuk setiap API endpoint
3. **WAJIB** test happy path + minimal 1 error scenario per fitur
4. **WAJIB** pakai fixtures, jangan hardcode data di test
5. **JANGAN** skip test untuk fitur auth/authorization
6. **WAJIB** test state transition (valid dan invalid) untuk workflow

---

# Bagian 15: Documentation Convention

## 15.1 Code Documentation

### 15.1.1 JSDoc untuk Function Public

**Semua function yang di-export WAJIB punya JSDoc**:

```typescript
/**
 * Eksekusi action workflow pada pengajuan.
 *
 * @param pengajuanId - ID pengajuan yang akan di-proses
 * @param action - Jenis action (approve, reject_to_step, dll)
 * @param data - Data tambahan (alasan, field input, dll)
 * @param user - User yang melakukan action
 * @returns Pengajuan yang sudah di-update
 * @throws ERR_BUS_INVALID_STATE_TRANSITION - Jika action tidak valid untuk status saat ini
 * @throws ERR_AUTH_INSUFFICIENT_ROLE - Jika user tidak punya kewenangan
 *
 * @see Batch 1 Bagian 3.5 untuk daftar action
 * @see BPMN TA-01 untuk workflow Pengajuan Judul
 */
export async function executeAction(
  pengajuanId: number,
  action: WorkflowActionType,
  data: ActionData,
  user: User
): Promise<PengajuanLayanan> {
  // ...
}
```

### 15.1.2 Inline Comment

Untuk logic yang tidak obvious:

```typescript
// Nomor surat di-reserve saat pengajuan dibuat (Srikandi pattern)
// sehingga muncul di live preview — lihat Batch 2 Bagian 8.5
const nomorSurat = await reserveNomorSurat(pengajuan);
```

### 15.1.3 TODO Comment

Format:
```typescript
// TODO: [deskripsi] — [siapa/kapan]
// TODO: Implement integrasi SIAKAD — Phase 2
// TODO: AMBIGUITY — Aturan IPK minimum belum dikonfirmasi user
```

## 15.2 README per Module

Setiap module/folder utama WAJIB punya README:

```markdown
# Module: Workflow Engine

## Tujuan
Mengelola eksekusi workflow (state machine) untuk semua 13 layanan SILA.

## File Utama
- `execute-action.ts` — Entry point untuk eksekusi action
- `validate-transition.ts` — Validasi state transition
- `sla-checker.ts` — Cron job untuk cek SLA expired
- `bypass-handler.ts` — Handler untuk mekanisme bypass TA-01

## Dokumen Referensi
- Konvensi Bagian 12 (Workflow & State Machine)
- BPMN per layanan
- Batch 1 Bagian 3.4 (Status Pengajuan)
- Batch 1 Bagian 3.5 (Workflow Actions)

## Dependency
- Prisma client
- Audit logger (Bagian 13)
- Notification service

## How to Test
`npx vitest run src/lib/workflow/`
```

## 15.3 API Documentation

### 15.3.1 OpenAPI / Swagger

**Phase 1**: Manual Markdown documentation per endpoint (di file route bersangkutan).

**Phase 2**: Generate otomatis dari code menggunakan library seperti `next-swagger-doc` atau `zod-to-openapi`.

### 15.3.2 Minimal API Doc per Endpoint

```typescript
/**
 * POST /api/pengajuan
 *
 * Buat pengajuan baru.
 *
 * Auth: Required (mahasiswa only)
 * Body: CreatePengajuanInput (Zod schema)
 * Response 201: { success: true, data: PengajuanLayanan }
 * Response 422: { success: false, error: ValidationError }
 * Response 403: { success: false, error: AuthorizationError }
 *
 * Side effects:
 * - Reserve nomor surat
 * - Create pengajuan_versi (v1)
 * - Create pengajuan_log (submitted)
 * - Send notification ke Staff Prodi
 */
export async function POST(request: Request) {
  // ...
}
```

## 15.4 Changelog

### 15.4.1 Format

```markdown
# Changelog

## [1.0.0] - 2026-XX-XX
### Added
- 13 layanan akademik (TA-01 s.d. TA-06, AK-01 s.d. AK-07)
- Workflow engine dengan configurable steps
- TTD scan + QR Code verifikasi
- Multi-hat dashboard

### Changed
- (belum ada)

### Fixed
- (belum ada)
```

## 15.5 AI Agent Rules untuk Documentation

1. **WAJIB** JSDoc untuk setiap function yang di-export
2. **WAJIB** README di setiap folder module utama
3. **WAJIB** minimal API doc di setiap route file
4. **WAJIB** referensi ke dokumen konvensi yang relevan (Batch/Bagian)
5. **JANGAN** biarkan komentar // TODO tanpa deskripsi yang jelas

---

## Status Final Dokumen Konvensi & Glossary

Seluruh **15 Bagian** sudah lengkap di 4 batch:

| Batch | Bagian | File |
|---|---|---|
| Batch 1 | 1-3: Glossary, Naming, Enum | `04_Konvensi_Glossary_Batch_1.md` |
| Batch 2 | 4-7: Error, API, Date/Number, Storage | `04_Konvensi_Glossary_Batch_2.md` |
| Batch 3 | 8-10: UI, Auth, Acceptance Criteria | `04_Konvensi_Glossary_Batch_3.md` |
| Batch 4 | 11-15: AI Agent, Workflow, Audit, Test, Docs | `04_Konvensi_Glossary_Batch_4.md` |

**Dokumen-dokumen ini merupakan fondasi wajib untuk semua tahap development selanjutnya.**

---

*Dokumen ini adalah AUTHORITATIVE SOURCE untuk AI Agent guidelines, workflow state machine, audit logging, testing, dan documentation convention SILA.*
