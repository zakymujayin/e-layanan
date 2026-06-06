# Arsip & Surat-saya Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perbaiki halaman `/arsip` dan `/surat-saya` agar menampilkan semua dokumen final dari pengajuan selesai, termasuk layanan AK dan TA-01/02/06 yang sebelumnya tidak punya DokumenOutput tersimpan.

**Architecture:** 
1. `execute-action.ts` diperluas: saat `sign → selesai`, semua layanan (bukan hanya TA-03/04/05) kini generate + store PDF ke `dokumen_output`.
2. Arsip: query diubah ke `PengajuanLayanan` (bukan `DokumenOutput`), render stored docs + on-demand fallback untuk data lama tanpa DokumenOutput.
3. Surat-saya: hapus `take: 1`, tambah download button per dokumen.

**Tech Stack:** Next.js App Router (Server Components), Prisma, shadcn/ui, date-fns

---

## File Map

| File | Action |
|------|--------|
| `src/lib/workflow/execute-action.ts` | Modify — hapus filter TA_SIDANG di blok sign, generate untuk semua layanan |
| `src/app/(dashboard)/arsip/page.tsx` | Modify — ganti query ke PengajuanLayanan, dual render |
| `src/app/(dashboard)/surat-saya/page.tsx` | Modify — hapus `take: 1`, tambah download buttons |

---

## Task 1: Extend PDF generation ke semua layanan saat sign

**File:** `src/lib/workflow/execute-action.ts`

Blok saat ini (baris ~234–251) hanya generate `surat_tugas` untuk TA-03/04/05. Kita hapus filter itu dan generate untuk semua layanan.

- [ ] **Step 1: Ganti blok TA_SIDANG di execute-action.ts**

Cari bagian ini (baris ~224–252):

```typescript
  if (input.action === "sign" && targetStatus === "selesai") {
    createNotification({
      user_id: mhsId,
      title: `Pengajuan Selesai`,
      message: `${layananNama} telah disetujui. Dokumen final siap didownload.`,
      severity: "success",
      entity_type: "pengajuan",
      entity_id: pengajuan.id,
    }).catch(() => {});

    const TA_SIDANG = ["TA-03", "TA-04", "TA-05"] as const;
    if (TA_SIDANG.includes(pengajuan.jenis_layanan.kode as (typeof TA_SIDANG)[number])) {
      prisma.penomoranCounter
        .findFirst({
          where: { pengajuan_id: pengajuan.id, status: { in: ["reserved", "active"] } },
          orderBy: { reserved_at: "desc" },
        })
        .catch(() => null)
        .then((penomoran) => {
          generateAndStoreDokumen({
            pengajuanId: pengajuan.id,
            layananKode: pengajuan.jenis_layanan.kode,
            jenis: "surat_tugas",
            signedBy: userId,
            nomorSurat: penomoran?.nomor_formatted ?? undefined,
          }).catch((err) => console.error(`[Phase1PDF] pengajuan ${pengajuan.id}:`, err));
        });
    }
  }
```

Ganti dengan:

```typescript
  if (input.action === "sign" && targetStatus === "selesai") {
    createNotification({
      user_id: mhsId,
      title: `Pengajuan Selesai`,
      message: `${layananNama} telah disetujui. Dokumen final siap didownload.`,
      severity: "success",
      entity_type: "pengajuan",
      entity_id: pengajuan.id,
    }).catch(() => {});

    // Generate surat_tugas untuk semua layanan.
    // TA-03/04/05: ini Phase 1; Phase 2 (berita_acara) di-generate di nilai.ts setelah nilai input.
    // Layanan lain: ini satu-satunya dokumen final.
    prisma.penomoranCounter
      .findFirst({
        where: { pengajuan_id: pengajuan.id, status: { in: ["reserved", "active"] } },
        orderBy: { reserved_at: "desc" },
      })
      .catch(() => null)
      .then((penomoran) => {
        generateAndStoreDokumen({
          pengajuanId: pengajuan.id,
          layananKode: pengajuan.jenis_layanan.kode,
          jenis: "surat_tugas",
          signedBy: userId,
          nomorSurat: penomoran?.nomor_formatted ?? undefined,
        }).catch((err) => console.error(`[FinalPDF] pengajuan ${pengajuan.id}:`, err));
      });
  }
```

- [ ] **Step 2: Type check**

```bash
cd /home/zhev/myproject/e-layanan && tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/workflow/execute-action.ts
git commit -m "feat: generate surat_tugas PDF for all layanan on sign → selesai"
```

---

## Task 2: Rewrite arsip/page.tsx

**File:** `src/app/(dashboard)/arsip/page.tsx`

Query diubah dari DokumenOutput ke PengajuanLayanan. Render dual: stored docs per pengajuan, atau fallback on-demand link jika tidak ada DokumenOutput.

- [ ] **Step 1: Ganti seluruh isi arsip/page.tsx**

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Archive, Download, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function ArsipPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dosen: true, mahasiswa: true, pegawai: true },
  });
  if (!user) redirect("/login");

  const baseRole = user.system_role;
  let structuralPositions: string[] = [];

  if (user.dosen?.id) {
    const positions = await prisma.structuralPosition.findMany({
      where: { dosen_id: user.dosen.id, is_active: true },
    });
    structuralPositions = positions.map((p) => p.position_code);
  }

  const effectiveRoles = [baseRole, ...structuralPositions];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pengajuanWhere: any = { status: "selesai" };

  if (effectiveRoles.includes("mahasiswa") && user.mahasiswa) {
    pengajuanWhere.mahasiswa_id = user.mahasiswa.id;
  } else if (
    effectiveRoles.includes("dosen") &&
    user.dosen &&
    !effectiveRoles.some((r) =>
      ["kaprodi", "sekprodi", "wakil_dekan_1", "dekan"].includes(r)
    )
  ) {
    pengajuanWhere.assignments = {
      some: { dosen_id: user.dosen.id, is_active: true },
    };
  } else if (effectiveRoles.includes("staff_prodi")) {
    pengajuanWhere.scope_level = "prodi";
  } else if (
    effectiveRoles.includes("staff_akademik") ||
    effectiveRoles.includes("kabag")
  ) {
    pengajuanWhere.scope_level = "fakultas";
  }
  // WD1, Dekan, super_admin: semua selesai

  const selesaiList = await prisma.pengajuanLayanan.findMany({
    where: pengajuanWhere,
    include: {
      jenis_layanan: true,
      mahasiswa: true,
      dokumen_output: {
        where: { is_final: true },
        include: { dokumen_verifikasi: true },
        orderBy: { finalized_at: "desc" },
      },
    },
    orderBy: { completed_at: "desc" },
    take: 100,
  });

  const isMahasiswa = effectiveRoles.includes("mahasiswa");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Arsip Dokumen</h1>
        <p className="text-muted-foreground">
          {selesaiList.length} layanan selesai · Hanya dokumen final yang
          ditampilkan
        </p>
      </div>

      {selesaiList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Archive className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Belum ada arsip dokumen</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Dokumen akan muncul di sini setelah pengajuan selesai diproses.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {selesaiList.map((p) => {
            const docs = p.dokumen_output;
            const dateStr = p.completed_at
              ? format(p.completed_at, "d MMMM yyyy", { locale: idLocale })
              : "";

            if (docs.length > 0) {
              return docs.map((dok) => (
                <Card key={dok.id}>
                  <CardHeader className="py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-xs font-mono shrink-0"
                          >
                            {p.jenis_layanan?.kode}
                          </Badge>
                          <CardTitle className="text-sm truncate">
                            {dok.jenis_dokumen}
                          </CardTitle>
                        </div>
                        {!isMahasiswa && p.mahasiswa && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {p.mahasiswa.nama_lengkap} · {p.mahasiswa.nim}
                          </p>
                        )}
                        {dok.nomor_surat && (
                          <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                            {dok.nomor_surat}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {dateStr}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dok.dokumen_verifikasi && (
                          <Link
                            href={`/verifikasi?token=${dok.dokumen_verifikasi.token}`}
                            target="_blank"
                            title="Verifikasi"
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" })
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/api/pengajuan/${p.id}/pdf?mode=final&jenis=${
                            dok.jenis_dokumen === "Surat Tugas"
                              ? "surat_tugas"
                              : "berita_acara"
                          }`}
                          target="_blank"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" })
                          )}
                        >
                          <Download className="mr-1.5 h-4 w-4" />
                          Unduh
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ));
            }

            // Fallback: data lama tanpa DokumenOutput tersimpan
            return (
              <Card key={`p-${p.id}`}>
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono shrink-0"
                        >
                          {p.jenis_layanan?.kode}
                        </Badge>
                        <CardTitle className="text-sm truncate">
                          {p.jenis_layanan?.nama}
                        </CardTitle>
                      </div>
                      {!isMahasiswa && p.mahasiswa && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {p.mahasiswa.nama_lengkap} · {p.mahasiswa.nim}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {dateStr}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Link
                        href={`/api/pengajuan/${p.id}/pdf?mode=final`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" })
                        )}
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Unduh
                      </Link>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type check**

```bash
cd /home/zhev/myproject/e-layanan && tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/arsip/page.tsx
git commit -m "feat: rewrite arsip page — query from pengajuan, dual render stored/on-demand"
```

---

## Task 3: Fix surat-saya/page.tsx — tambah download buttons

**File:** `src/app/(dashboard)/surat-saya/page.tsx`

Dua perubahan:
1. Hapus `take: 1` → fetch semua dokumen final per pengajuan.
2. Tambah download button per dokumen di bawah tombol "Lihat".

- [ ] **Step 1: Update query — hapus `take: 1`, tambah `orderBy`**

Ganti:
```typescript
      dokumen_output: {
        where: { is_final: true },
        take: 1,
      },
```

Dengan:
```typescript
      dokumen_output: {
        where: { is_final: true },
        orderBy: { finalized_at: "desc" },
      },
```

- [ ] **Step 2: Tambah import Download icon**

Ganti baris import lucide:
```typescript
import { FileText } from "lucide-react";
```

Dengan:
```typescript
import { FileText, Download } from "lucide-react";
```

- [ ] **Step 3: Tambah download buttons di render**

Di dalam `items.map(assignment => { ... })`, cari bagian action buttons (kanan atas card):

```typescript
                          <div className="flex items-center gap-2 shrink-0">
                            {pengajuan && <StatusBadge status={pengajuan.status} />}
                            {pengajuan && (
                              <Link
                                href={`/pengajuan/${pengajuan.id}`}
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                              >
                                Lihat
                              </Link>
                            )}
                          </div>
```

Ganti dengan:
```typescript
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            {pengajuan && <StatusBadge status={pengajuan.status} />}
                            {pengajuan && pengajuan.status === "selesai" &&
                              pengajuan.dokumen_output &&
                              pengajuan.dokumen_output.length > 0
                              ? pengajuan.dokumen_output.map((dok) => (
                                  <Link
                                    key={dok.id}
                                    href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final&jenis=${
                                      dok.jenis_dokumen === "Surat Tugas"
                                        ? "surat_tugas"
                                        : "berita_acara"
                                    }`}
                                    target="_blank"
                                    className={buttonVariants({ variant: "outline", size: "sm" })}
                                  >
                                    <Download className="mr-1.5 h-4 w-4" />
                                    {dok.jenis_dokumen === "Surat Tugas"
                                      ? "Surat Tugas"
                                      : "Berita Acara"}
                                  </Link>
                                ))
                              : pengajuan && pengajuan.status === "selesai"
                              ? (
                                  <Link
                                    href={`/api/pengajuan/${pengajuan.id}/pdf?mode=final`}
                                    target="_blank"
                                    className={buttonVariants({ variant: "outline", size: "sm" })}
                                  >
                                    <Download className="mr-1.5 h-4 w-4" />
                                    Unduh
                                  </Link>
                                )
                              : null}
                            {pengajuan && (
                              <Link
                                href={`/pengajuan/${pengajuan.id}`}
                                className={buttonVariants({ variant: "ghost", size: "sm" })}
                              >
                                Lihat
                              </Link>
                            )}
                          </div>
```

- [ ] **Step 4: Type check**

```bash
cd /home/zhev/myproject/e-layanan && tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/surat-saya/page.tsx
git commit -m "feat: add download buttons to surat-saya, fetch all final dokumen per assignment"
```

---

## Task 4: Build check

- [ ] **Step 1: Full build**

```bash
cd /home/zhev/myproject/e-layanan && npm run build 2>&1 | tail -30
```

Expected: zero errors, zero warnings. Build completes successfully.

- [ ] **Step 2: (Jika ada error) Fix dan ulangi type check**

```bash
cd /home/zhev/myproject/e-layanan && tsc --noEmit 2>&1
```
