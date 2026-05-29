# Phase 2: Workflow Engine + Layanan TA-01 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** TA-01 full end-to-end — mahasiswa submit 3-5 judul → staff verifikasi → PA pilih 1 judul → kaprodi approve → WD1 TTD final → dokumen selesai. Plus bypass mechanism.

**Architecture:** Workflow execution engine (`lib/workflow/`) dengan database-driven state machine. Server Actions untuk mutations, API routes untuk file upload. Referensi: [BPMN-TA01].

**Tech Stack:** Next.js 16.2, Prisma 7, PostgreSQL, Auth.js v5, TypeScript

---

## Task 2.1: Workflow Execution Engine

**Files:**
- Create: `src/lib/workflow/execute-action.ts`
- Create: `src/lib/workflow/validate-transition.ts`
- Create: `src/lib/workflow/sla-checker.ts`
- Create: `src/lib/workflow/bypass-handler.ts`

### Step 1: Validate Transition

`src/lib/workflow/validate-transition.ts`:
```typescript
import { prisma } from "@/lib/prisma";

export async function validateTransition(
  workflowDefinitionId: number,
  currentStepCode: string,
  action: string
) {
  const step = await prisma.workflowStep.findFirst({
    where: {
      workflowDefinitionId,
      stepCode: currentStepCode,
    },
    include: { actions: true },
  });

  if (!step) {
    throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Step tidak ditemukan");
  }

  const validAction = step.actions.find((a) => a.actionCode === action);
  if (!validAction) {
    throw new Error(`ERR_BUS_INVALID_STATE_TRANSITION: Action '${action}' tidak valid untuk step '${currentStepCode}'`);
  }

  return { step, targetStep: validAction, targetStatus: validAction.targetStatus };
}
```

### Step 2: Execute Action

`src/lib/workflow/execute-action.ts`:
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { validateTransition } from "./validate-transition";
import { createPengajuanLog } from "./audit";

export type WorkflowActionInput = {
  pengajuanId: number;
  action: string;
  data: Record<string, unknown>;
};

export async function executeWorkflowAction(userId: number, input: WorkflowActionInput) {
  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: input.pengajuanId },
    include: { jenisLayanan: true },
  });

  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND");

  // Load current step from status
  const workflow = await prisma.workflowDefinition.findFirst({
    where: {
      jenisLayananId: pengajuan.jenisLayananId,
      isActive: true,
    },
  });

  if (!workflow) throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Workflow tidak ditemukan");

  const validation = await validateTransition(workflow.id, pengajuan.currentStepCode!, input.action);

  const fromStatus = pengajuan.status;

  return prisma.$transaction(async (tx) => {
    // 1. Update pengajuan status
    const updated = await tx.pengajuanLayanan.update({
      where: { id: pengajuan.id },
      data: {
        status: validation.targetStatus,
        currentStepCode: validation.targetStep.targetStatus
          ? (await tx.workflowStep.findFirst({
              where: { workflowDefinitionId: workflow.id, statusCode: validation.targetStatus },
            }))?.stepCode ?? null
          : null,
      },
    });

    // 2. Log action
    await createPengajuanLog(tx, {
      pengajuanId: pengajuan.id,
      actionCode: input.action,
      performedBy: userId,
      fromStatus,
      toStatus: validation.targetStatus,
      alasan: input.data?.alasan as string,
      metadata: input.data,
    });

    return updated;
  });
}
```

### Step 3: Audit Logger (simplified)

`src/lib/workflow/audit.ts`:
```typescript
export async function createPengajuanLog(
  tx: any,
  params: {
    pengajuanId: number;
    actionCode: string;
    performedBy: number;
    fromStatus: string;
    toStatus: string | null;
    alasan?: string;
    metadata?: Record<string, unknown>;
  }
) {
  return tx.pengajuanLog.create({
    data: {
      pengajuanId: params.pengajuanId,
      actionCode: params.actionCode,
      performedBy: params.performedBy,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      alasan: params.alasan ?? null,
      metadata: params.metadata ?? {},
    },
  });
}
```

- [ ] **Step 4: Commit**

---

## Task 2.2: Server Action — Submit TA-01

**Files:**
- Create: `src/actions/pengajuan.ts`

`src/actions/pengajuan.ts`:
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function submitPengajuanTA01(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: { include: { prodi: true } } },
  });
  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE");

  const judul1 = formData.get("judul_1") as string;
  const judul2 = formData.get("judul_2") as string;
  const judul3 = formData.get("judul_3") as string;
  const judul4 = formData.get("judul_4") as string || undefined;
  const judul5 = formData.get("judul_5") as string || undefined;
  const paDosenId = Number(formData.get("pa_dosen_id"));

  if (!judul1 || !judul2 || !judul3) {
    throw new Error("ERR_VAL_MIN_ITEMS: Minimal 3 judul");
  }
  if (!paDosenId) throw new Error("ERR_VAL_REQUIRED_FIELD: Pilih PA");

  const mhs = user.mahasiswa;
  if (mhs.statusMahasiswa !== "aktif") {
    throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Status mahasiswa harus aktif");
  }

  // Check existing active TA-01
  const existing = await prisma.pengajuanLayanan.findFirst({
    where: {
      mahasiswaId: mhs.id,
      jenisLayanan: { kode: "TA-01" },
      status: { notIn: ["selesai", "terminated"] },
    },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN: Sudah memiliki pengajuan TA-01 aktif");

  // Get active semester
  const semester = await prisma.academicPeriod.findFirst({
    where: { status: "active" },
  });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  // Get TA-01 layanan
  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: "TA-01" },
    include: { workflowDefinitions: { where: { isActive: true }, take: 1 } },
  });
  if (!layanan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND");

  // Generate kode pengajuan
  const count = await prisma.pengajuanLayanan.count({
    where: { academicPeriodId: semester.id, jenisLayanan: { kategori: "tugas_akhir" } },
  });
  const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  // Get first step
  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflowDefinitionId: layanan.workflowDefinitions[0].id },
    orderBy: { stepOrder: "asc" },
  });

  const pengajuan = await prisma.pengajuanLayanan.create({
    data: {
      kodePengajuan,
      mahasiswaId: mhs.id,
      jenisLayananId: layanan.id,
      academicPeriodId: semester.id,
      workflowDefinitionId: layanan.workflowDefinitions[0].id,
      status: firstStep?.statusCode ?? "pending_staff_prodi",
      currentStepCode: firstStep?.stepCode,
      scopeLevel: "prodi",
      fakultasId: mhs.prodi.fakultasId,
      prodiId: mhs.prodiId,
      pengajuanData: {
        create: {
          fieldValues: {
            judul_1: judul1,
            judul_2: judul2,
            judul_3: judul3,
            judul_4: judul4 ?? null,
            judul_5: judul5 ?? null,
            pa_dosen_id: paDosenId,
          },
        },
      },
      pengajuanVersi: {
        create: {
          versiKe: 1,
          dataSnapshot: { judul_1: judul1, judul_2: judul2, judul_3: judul3 },
          dokumenSnapshot: {},
          dibuatOleh: userId,
        },
      },
      pengajuanLog: {
        create: {
          actionCode: "submit",
          performedBy: userId,
          fromStatus: null,
          toStatus: firstStep?.statusCode ?? "pending_staff_prodi",
        },
      },
    },
  });

  // Create PA assignment
  await prisma.assignment.create({
    data: {
      assignmentType: "dosen_pa",
      dosenId: paDosenId,
      mahasiswaId: mhs.id,
      pengajuanId: pengajuan.id,
      isActive: true,
    },
  });

  redirect(`/pengajuan/${pengajuan.id}`);
}
```

- [ ] Commit

---

## Task 2.3: Halaman Submit TA-01

**Files:**
- Create: `src/app/(dashboard)/pengajuan/baru/TA-01/page.tsx`

Full form: 3-5 judul textarea + pilih PA (searchable select) + 3 file upload.

- [ ] Implement and commit

---

## Task 2.4: Detail Pengajuan + Activity Timeline + Progress Bar

**Files:**
- Create: `src/app/(dashboard)/pengajuan/[id]/page.tsx`
- Create: `src/components/pengajuan/StatusBadge.tsx`
- Create: `src/components/pengajuan/ProgressBar.tsx`
- Create: `src/components/pengajuan/ActivityTimeline.tsx`

- [ ] Implement and commit

---

## Task 2.5: UI Workflow Actions (TA-01)

**Files:**
- Create: `src/components/workflow/ActionButtons.tsx`
- Create: `src/components/workflow/RejectDialog.tsx`
- Create: `src/app/(dashboard)/pengajuan/[id]/actions.ts`

Staff Prodi: approve / reject. PA: select judul (radio). Kaprodi: approve / reject to PA / reject to mahasiswa. WD1: sign.

- [ ] Implement and commit

---

## Task 2.6: Dashboard Multi-Role

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

Stat cards real + daftar pengajuan menunggu tindakan + unified inbox dengan context badge (dosen multi-hat).

- [ ] Implement and commit

---

## Task 2.7: Pilih Layanan Page

**Files:**
- Create: `src/app/(dashboard)/pengajuan/baru/page.tsx`

Grid cards TA-01 s.d. AK-07 — eligible/greyed out dengan tooltip.

- [ ] Implement and commit

---

## Task 2.8: Verifikasi End-to-End

1. Login mahasiswa → buka `/pengajuan/baru` → pilih TA-01
2. Submit 3 judul + pilih PA + upload 3 "dokumen" (text files for test)
3. Verifikasi redirect ke detail pengajuan
4. Login staff prodi → approve
5. Login PA → pilih judul (radio button)
6. Login kaprodi → approve
7. Login WD1 → sign → status selesai
8. Build passes

- [ ] Verify dan fix bugs
- [ ] Commit
