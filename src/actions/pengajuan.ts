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

  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya mahasiswa");
  const mhs = user.mahasiswa;

  if (mhs.status_mahasiswa !== "aktif") {
    throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Status mahasiswa harus aktif");
  }

  const existing = await prisma.pengajuanLayanan.findFirst({
    where: {
      mahasiswa_id: mhs.id,
      jenis_layanan: { kode: "TA-01" },
      status: { notIn: ["selesai", "terminated"] },
    },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN");

  const semester = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: "TA-01" },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!layanan || !layanan.workflow_definitions[0]) throw new Error("Layanan TA-01 tidak ditemukan");

  const count = await prisma.pengajuanLayanan.count({
    where: { academic_period_id: semester.id, jenis_layanan: { kategori: "tugas_akhir" } },
  });
  const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: layanan.workflow_definitions[0].id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const judul1 = (formData.get("judul_1") as string) || "";
  const judul2 = (formData.get("judul_2") as string) || "";
  const judul3 = (formData.get("judul_3") as string) || "";
  const judul4 = (formData.get("judul_4") as string) || null;
  const judul5 = (formData.get("judul_5") as string) || null;
  const paDosenId = Number(formData.get("pa_dosen_id"));

  if (!judul1 || !judul2 || !judul3) throw new Error("ERR_VAL_MIN_ITEMS: Minimal 3 judul");
  if (!paDosenId) throw new Error("ERR_VAL_REQUIRED_FIELD: Pilih PA");

  const pengajuan = await prisma.pengajuanLayanan.create({
    data: {
      kode_pengajuan: kodePengajuan,
      mahasiswa_id: mhs.id,
      jenis_layanan_id: layanan.id,
      academic_period_id: semester.id,
      workflow_definition_id: layanan.workflow_definitions[0].id,
      status: firstStep.status_code as "submitted",
      current_step_code: firstStep.step_code,
      scope_level: "prodi",
      fakultas_id: mhs.prodi.fakultas_id,
      prodi_id: mhs.prodi_id,
      pengajuan_data: {
        create: {
          field_values: { judul_1: judul1, judul_2: judul2, judul_3: judul3, judul_4: judul4, judul_5: judul5, pa_dosen_id: paDosenId },
        },
      },
      pengajuan_versi: {
        create: {
          versi_ke: 1,
          data_snapshot: { judul_1: judul1, judul_2: judul2, judul_3: judul3 },
          dokumen_snapshot: {},
          dibuat_oleh: userId,
        },
      },
      pengajuan_log: {
        create: {
          action_code: "submit",
          performed_by: userId,
          from_status: null,
          to_status: firstStep.status_code,
        },
      },
    },
  });

  await prisma.assignment.create({
    data: { assignment_type: "dosen_pa", dosen_id: paDosenId, mahasiswa_id: mhs.id, pengajuan_id: pengajuan.id, is_active: true },
  });

  redirect(`/pengajuan/${pengajuan.id}`);
}
