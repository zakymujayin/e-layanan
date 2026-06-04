"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";
import { linkDokumenToPengajuan } from "@/lib/upload";
import { reserveNomorSurat } from "@/lib/document/numbering";
import { notifyFirstApprover } from "@/lib/notification";

async function requireRole(userId: number, allowedRoles: string[]): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { system_role: true, dosen_id: true },
  });
  if (!user) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  if (user.system_role === "super_admin") return;

  for (const role of allowedRoles) {
    if (user.system_role === role) return;
    if (user.dosen_id) {
      const pos = await prisma.structuralPosition.count({
        where: { dosen_id: user.dosen_id, position_code: role as any, is_active: true },
      });
      if (pos > 0) return;
    }
  }
  throw new Error(`ERR_AUTH_INSUFFICIENT_ROLE: Hanya ${allowedRoles.join("/")} yang dapat melakukan ini`);
}

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

  const dokumenIds = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIds.length > 0) await linkDokumenToPengajuan(dokumenIds, pengajuan.id, userId);

  await reserveNomorSurat(pengajuan.id).catch(() => {});
  notifyFirstApprover(pengajuan.id, layanan.nama, mhs.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuan.id}`);
}

export async function submitPengajuanTA02(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: { include: { prodi: true } } },
  });

  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya mahasiswa");
  const mhs = user.mahasiswa;

  if (mhs.status_mahasiswa !== "aktif") throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Status mahasiswa harus aktif");

  const ta01 = await prisma.pengajuanLayanan.findFirst({
    where: {
      mahasiswa_id: mhs.id,
      jenis_layanan: { kode: "TA-01" },
      status: "selesai",
    },
  });
  if (!ta01) throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Pengajuan Judul Skripsi (TA-01) harus selesai");

  const existing = await prisma.pengajuanLayanan.findFirst({
    where: {
      mahasiswa_id: mhs.id,
      jenis_layanan: { kode: "TA-02" },
      status: { notIn: ["selesai", "terminated"] },
    },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN");

  const semester = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: "TA-02" },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!layanan || !layanan.workflow_definitions[0]) throw new Error("Layanan TA-02 tidak ditemukan");

  const count = await prisma.pengajuanLayanan.count({
    where: { academic_period_id: semester.id, jenis_layanan: { kategori: "tugas_akhir" } },
  });
  const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: layanan.workflow_definitions[0].id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const judulSkripsi = await prisma.judulSkripsi.findFirst({
    where: { mahasiswa_id: mhs.id, status: "aktif" },
  });

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
          field_values: {
            judul_skripsi: judulSkripsi?.judul_aktif ?? null,
            ta01_id: ta01.id,
          },
        },
      },
      pengajuan_versi: {
        create: {
          versi_ke: 1,
          data_snapshot: { judul: judulSkripsi?.judul_aktif },
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

  const dokumenIdsTA02 = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIdsTA02.length > 0) await linkDokumenToPengajuan(dokumenIdsTA02, pengajuan.id, userId);

  await reserveNomorSurat(pengajuan.id).catch(() => {});
  notifyFirstApprover(pengajuan.id, layanan.nama, mhs.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuan.id}`);
}

export async function submitPengajuanTA03(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: { include: { prodi: true } } },
  });
  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE");
  const mhs = user.mahasiswa;

  if (mhs.status_mahasiswa !== "aktif") throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Status mahasiswa harus aktif");

  const ta02 = await prisma.pengajuanLayanan.findFirst({
    where: { mahasiswa_id: mhs.id, jenis_layanan: { kode: "TA-02" }, status: "selesai" },
  });
  if (!ta02) throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: SK Pembimbing (TA-02) harus selesai");

  const existing = await prisma.pengajuanLayanan.findFirst({
    where: { mahasiswa_id: mhs.id, jenis_layanan: { kode: "TA-03" }, status: { notIn: ["selesai", "terminated"] } },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN");

  const semester = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: "TA-03" },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!layanan || !layanan.workflow_definitions[0]) throw new Error("Layanan TA-03 tidak ditemukan");

  const count = await prisma.pengajuanLayanan.count({
    where: { academic_period_id: semester.id, jenis_layanan: { kategori: "tugas_akhir" } },
  });
  const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: layanan.workflow_definitions[0].id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const judulSkripsi = await prisma.judulSkripsi.findFirst({
    where: { mahasiswa_id: mhs.id, status: "aktif" },
  });

  const pembimbing1 = await prisma.assignment.findFirst({
    where: { pengajuan_id: ta02.id, assignment_type: "pembimbing_skripsi_1" },
    include: { dosen: true },
  });
  const pembimbing2 = await prisma.assignment.findFirst({
    where: { pengajuan_id: ta02.id, assignment_type: "pembimbing_skripsi_2" },
    include: { dosen: true },
  });

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
          field_values: {
            judul_skripsi: judulSkripsi?.judul_aktif ?? null,
            ta02_id: ta02.id,
            pembimbing_1: pembimbing1?.dosen?.nama_lengkap ?? null,
            pembimbing_2: pembimbing2?.dosen?.nama_lengkap ?? null,
          },
        },
      },
      pengajuan_versi: {
        create: {
          versi_ke: 1,
          data_snapshot: { judul: judulSkripsi?.judul_aktif },
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

  const dokumenIdsTA03 = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIdsTA03.length > 0) await linkDokumenToPengajuan(dokumenIdsTA03, pengajuan.id, userId);

  await reserveNomorSurat(pengajuan.id).catch(() => {});
  notifyFirstApprover(pengajuan.id, layanan.nama, mhs.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuan.id}`);
}

// ============================================================
// Generic AK Submit (AK-01 s.d. AK-07)
// ============================================================

type AkEligibility = { allowedStatuses: string[]; errorMessage: string };

const akEligibility: Record<string, AkEligibility> = {
  "AK-01": { allowedStatuses: ["aktif"], errorMessage: "Status mahasiswa harus aktif" },
  "AK-02": { allowedStatuses: ["aktif"], errorMessage: "Status mahasiswa harus aktif" },
  "AK-03": { allowedStatuses: ["alumni", "keluar", "do"], errorMessage: "Hanya untuk alumni atau mahasiswa yang sudah keluar" },
  "AK-04": { allowedStatuses: ["aktif"], errorMessage: "Status mahasiswa harus aktif" },
  "AK-05": { allowedStatuses: ["aktif"], errorMessage: "Status mahasiswa harus aktif" },
  "AK-06": { allowedStatuses: ["aktif"], errorMessage: "Status mahasiswa harus aktif" },
  "AK-07": { allowedStatuses: ["aktif", "alumni"], errorMessage: "Status mahasiswa harus aktif atau alumni" },
};

const AK_ALLOWED_FIELDS: Record<string, string[]> = {
  "AK-01": ["peruntukan", "tujuan_peruntukan"],
  "AK-02": [
    "peruntukan", "orang_tua_pns", "nama_orang_tua", "nip_orang_tua",
    "pangkat_golongan", "jabatan_orang_tua", "instansi_orang_tua", "hubungan_orang_tua",
  ],
  "AK-03": ["peruntukan"],
  "AK-04": [
    "mata_kuliah", "instansi_tujuan", "pejabat_tujuan", "alamat_instansi",
    "lokasi_observasi", "tanggal_mulai", "tanggal_selesai", "dosen_pembimbing_observasi_id",
  ],
  "AK-05": ["judul_penelitian", "lokasi_penelitian", "tujuan_penelitian", "tanggal_mulai", "tanggal_selesai"],
  "AK-06": [
    "bidang_magang", "instansi_tujuan", "alamat_instansi", "pejabat_tujuan",
    "tanggal_mulai", "tanggal_selesai", "dosen_pembimbing_magang_id",
  ],
  "AK-07": ["tipe_rekomendasi", "tujuan_rekomendasi", "pihak_penerima"],
};

export async function submitPengajuanAK(kode: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: { include: { prodi: true } } },
  });

  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya mahasiswa");
  const mhs = user.mahasiswa;

  const eligibility = akEligibility[kode];
  if (!eligibility) throw new Error("ERR_VAL_INVALID_FORMAT: Kode layanan tidak dikenal");

  if (!eligibility.allowedStatuses.includes(mhs.status_mahasiswa)) {
    throw new Error(`ERR_BUS_PREREQUISITE_NOT_MET: ${eligibility.errorMessage}`);
  }

  const existing = await prisma.pengajuanLayanan.findFirst({
    where: {
      mahasiswa_id: mhs.id,
      jenis_layanan: { kode },
      status: { notIn: ["selesai", "terminated"] },
    },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN");

  const akPrefix = kode.startsWith("TA-") ? "TA" : "AK";

  if (kode === "AK-02") {
    const orangTuaPns = formData.get("orang_tua_pns") as string;
    if (orangTuaPns === "ya") {
      const nip = (formData.get("nip_orang_tua") as string) || "";
      if (!/^[0-9]{18}$/.test(nip)) throw new Error("ERR_VAL_INVALID_FORMAT: NIP harus 18 digit");
      if (!formData.get("nama_orang_tua")) throw new Error("ERR_VAL_REQUIRED_FIELD: Nama orang tua wajib diisi");
      if (!formData.get("pangkat_golongan")) throw new Error("ERR_VAL_REQUIRED_FIELD: Pangkat golongan wajib diisi");
      if (!formData.get("jabatan_orang_tua")) throw new Error("ERR_VAL_REQUIRED_FIELD: Jabatan orang tua wajib diisi");
      if (!formData.get("instansi_orang_tua")) throw new Error("ERR_VAL_REQUIRED_FIELD: Instansi orang tua wajib diisi");
      if (!formData.get("hubungan_orang_tua")) throw new Error("ERR_VAL_REQUIRED_FIELD: Hubungan orang tua wajib diisi");
    }
  }

  if (akPrefix === "AK") {
    if (["AK-01", "AK-02", "AK-03"].includes(kode)) {
      const peruntukan = formData.get("peruntukan") as string;
      if (!peruntukan) throw new Error("ERR_VAL_REQUIRED_FIELD: Peruntukan wajib diisi");
    }

    if (kode === "AK-04") {
      if (!formData.get("mata_kuliah")) throw new Error("ERR_VAL_REQUIRED_FIELD: Mata kuliah wajib diisi");
      if (!formData.get("instansi_tujuan")) throw new Error("ERR_VAL_REQUIRED_FIELD: Instansi tujuan wajib diisi");
    }
    if (kode === "AK-07") {
      const tipe = formData.get("tipe_rekomendasi") as string;
      if (!tipe) throw new Error("ERR_VAL_REQUIRED_FIELD: Tipe rekomendasi wajib diisi");
    }
  }

  const semester = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!layanan || !layanan.workflow_definitions[0]) throw new Error(`Layanan ${kode} tidak ditemukan`);

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: layanan.workflow_definitions[0].id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const allowed = AK_ALLOWED_FIELDS[kode] ?? [];
  const fieldValues: Record<string, unknown> = {};
  for (const key of allowed) {
    const val = formData.get(key);
    if (val && typeof val === "string" && val.trim().length > 0) {
      fieldValues[key] = val.trim();
    }
  }

  const count = await prisma.pengajuanLayanan.count({
    where: { academic_period_id: semester.id, jenis_layanan: { kategori: "akademik" } },
  });
  const kodePengajuan = `${akPrefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const pengajuan = await prisma.pengajuanLayanan.create({
    data: {
      kode_pengajuan: kodePengajuan,
      mahasiswa_id: mhs.id,
      jenis_layanan_id: layanan.id,
      academic_period_id: semester.id,
      workflow_definition_id: layanan.workflow_definitions[0].id,
      status: firstStep.status_code as "submitted",
      current_step_code: firstStep.step_code,
      scope_level: "fakultas",
      fakultas_id: mhs.prodi.fakultas_id,
      prodi_id: mhs.prodi_id,
      pengajuan_data: { create: { field_values: fieldValues as any } },
      pengajuan_versi: { create: { versi_ke: 1, data_snapshot: fieldValues as any, dokumen_snapshot: {} as any, dibuat_oleh: userId } },
      pengajuan_log: { create: { action_code: "submit", performed_by: userId, from_status: null, to_status: firstStep.status_code } },
    },
  });

  const dokumenIdsAK = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIdsAK.length > 0) await linkDokumenToPengajuan(dokumenIdsAK, pengajuan.id, userId);

  await reserveNomorSurat(pengajuan.id).catch(() => {});
  notifyFirstApprover(pengajuan.id, layanan.nama, mhs.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuan.id}`);
}

// ============================================================
// TA-04 Submit
// ============================================================

export async function submitPengajuanTA04(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: { include: { prodi: true } } },
  });
  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya mahasiswa");
  const mhs = user.mahasiswa;

  if (mhs.status_mahasiswa !== "aktif") throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Status mahasiswa harus aktif");

  const ta03 = await prisma.pengajuanLayanan.findFirst({
    where: { mahasiswa_id: mhs.id, jenis_layanan: { kode: "TA-03" }, status: "selesai" },
  });
  if (!ta03) throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Seminar Proposal (TA-03) harus selesai");

  const hasilSempro = await prisma.nilaiSidang.findFirst({
    where: { pengajuan_id: ta03.id },
    orderBy: { input_at: "desc" },
  });
  if (!hasilSempro || hasilSempro.keputusan !== "layak") {
    throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Hasil Seminar Proposal harus layak");
  }

  const existing = await prisma.pengajuanLayanan.findFirst({
    where: { mahasiswa_id: mhs.id, jenis_layanan: { kode: "TA-04" }, status: { notIn: ["selesai", "terminated"] } },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN");

  const semester = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: "TA-04" },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!layanan || !layanan.workflow_definitions[0]) throw new Error("Layanan TA-04 tidak ditemukan");

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: layanan.workflow_definitions[0].id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const judulSkripsi = await prisma.judulSkripsi.findFirst({
    where: { mahasiswa_id: mhs.id, status: "aktif" },
  });

  const count = await prisma.pengajuanLayanan.count({
    where: { academic_period_id: semester.id, jenis_layanan: { kategori: "tugas_akhir" } },
  });
  const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

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
      pengajuan_data: { create: { field_values: { judul_skripsi: judulSkripsi?.judul_aktif ?? null } } },
      pengajuan_versi: { create: { versi_ke: 1, data_snapshot: { judul: judulSkripsi?.judul_aktif }, dokumen_snapshot: {}, dibuat_oleh: userId } },
      pengajuan_log: { create: { action_code: "submit", performed_by: userId, from_status: null, to_status: firstStep.status_code } },
    },
  });

  const dokumenIdsTA04 = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIdsTA04.length > 0) await linkDokumenToPengajuan(dokumenIdsTA04, pengajuan.id, userId);

  await reserveNomorSurat(pengajuan.id).catch(() => {});
  notifyFirstApprover(pengajuan.id, layanan.nama, mhs.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuan.id}`);
}

// ============================================================
// TA-05 Submit
// ============================================================

export async function submitPengajuanTA05(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: { include: { prodi: true } } },
  });
  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya mahasiswa");
  const mhs = user.mahasiswa;

  if (mhs.status_mahasiswa !== "aktif") throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Status mahasiswa harus aktif");

  const ta04 = await prisma.pengajuanLayanan.findFirst({
    where: { mahasiswa_id: mhs.id, jenis_layanan: { kode: "TA-04" }, status: "selesai" },
  });
  if (!ta04) throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Ujian Komprehensif (TA-04) harus selesai");

  const hasilKomprehensif = await prisma.nilaiSidang.findFirst({
    where: { pengajuan_id: ta04.id },
    orderBy: { input_at: "desc" },
  });
  if (!hasilKomprehensif || hasilKomprehensif.keputusan !== "lulus") {
    throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Ujian Komprehensif harus LULUS");
  }

  const ta06 = await prisma.pengajuanLayanan.findFirst({
    where: { mahasiswa_id: mhs.id, jenis_layanan: { kode: "TA-06" }, status: "selesai" },
  });
  if (!ta06) throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Cek Turnitin (TA-06) harus selesai");

  const existing = await prisma.pengajuanLayanan.findFirst({
    where: { mahasiswa_id: mhs.id, jenis_layanan: { kode: "TA-05" }, status: { notIn: ["selesai", "terminated"] } },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN");

  const semester = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: "TA-05" },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!layanan || !layanan.workflow_definitions[0]) throw new Error("Layanan TA-05 tidak ditemukan");

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: layanan.workflow_definitions[0].id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const judulSkripsi = await prisma.judulSkripsi.findFirst({
    where: { mahasiswa_id: mhs.id, status: "aktif" },
  });

  const count = await prisma.pengajuanLayanan.count({
    where: { academic_period_id: semester.id, jenis_layanan: { kategori: "tugas_akhir" } },
  });
  const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

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
      pengajuan_data: { create: { field_values: { judul_skripsi: judulSkripsi?.judul_aktif ?? null } } },
      pengajuan_versi: { create: { versi_ke: 1, data_snapshot: { judul: judulSkripsi?.judul_aktif }, dokumen_snapshot: {}, dibuat_oleh: userId } },
      pengajuan_log: { create: { action_code: "submit", performed_by: userId, from_status: null, to_status: firstStep.status_code } },
    },
  });

  const dokumenIdsTA05 = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIdsTA05.length > 0) await linkDokumenToPengajuan(dokumenIdsTA05, pengajuan.id, userId);

  await reserveNomorSurat(pengajuan.id).catch(() => {});
  notifyFirstApprover(pengajuan.id, layanan.nama, mhs.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuan.id}`);
}

// ============================================================
// TA-06 Submit
// ============================================================

export async function submitPengajuanTA06(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: { include: { prodi: true } } },
  });
  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Hanya mahasiswa");
  const mhs = user.mahasiswa;

  if (mhs.status_mahasiswa !== "aktif") throw new Error("ERR_BUS_PREREQUISITE_NOT_MET: Status mahasiswa harus aktif");

  const existing = await prisma.pengajuanLayanan.findFirst({
    where: {
      mahasiswa_id: mhs.id,
      jenis_layanan: { kode: "TA-06" },
      status: { in: ["pending_kepala_lab", "revision_required"] },
    },
  });
  if (existing) throw new Error("ERR_BUS_DUPLICATE_PENGAJUAN: Sudah ada pengajuan Turnitin aktif");

  const semester = await prisma.academicPeriod.findFirst({ where: { status: "active" } });
  if (!semester) throw new Error("ERR_BUS_SEMESTER_NOT_ACTIVE");

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: "TA-06" },
    include: { workflow_definitions: { where: { is_active: true }, take: 1 } },
  });
  if (!layanan || !layanan.workflow_definitions[0]) throw new Error("Layanan TA-06 tidak ditemukan");

  const firstStep = await prisma.workflowStep.findFirst({
    where: { workflow_definition_id: layanan.workflow_definitions[0].id },
    orderBy: { step_order: "asc" },
  });
  if (!firstStep) throw new Error("Workflow step tidak ditemukan");

  const submissionId = (formData.get("submission_id_turnitin") as string) || "";
  const urlTurnitin = (formData.get("url_turnitin") as string) || "";
  const similarityStr = (formData.get("similarity_percentage") as string) || "0";
  const similarityPercentage = Number(similarityStr);

  if (!submissionId) throw new Error("ERR_VAL_REQUIRED_FIELD: Submission ID wajib diisi");
  if (!urlTurnitin) throw new Error("ERR_VAL_REQUIRED_FIELD: URL Turnitin wajib diisi");
  if (similarityPercentage < 0 || similarityPercentage > 100) throw new Error("ERR_VAL_INVALID_FORMAT: Similarity harus 0-100");

  const judulSkripsi = await prisma.judulSkripsi.findFirst({
    where: { mahasiswa_id: mhs.id, status: "aktif" },
  });

  const count = await prisma.pengajuanLayanan.count({
    where: { academic_period_id: semester.id, jenis_layanan: { kategori: "tugas_akhir" } },
  });
  const kodePengajuan = `TA-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const fieldValues = {
    judul_skripsi: judulSkripsi?.judul_aktif ?? null,
    submission_id_turnitin: submissionId,
    url_turnitin: urlTurnitin,
    similarity_percentage: similarityPercentage,
  };

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
      revisi_ke: 1,
      pengajuan_data: { create: { field_values: fieldValues as any } },
      pengajuan_versi: { create: { versi_ke: 1, data_snapshot: fieldValues as any, dokumen_snapshot: {} as any, dibuat_oleh: userId } },
      pengajuan_log: { create: { action_code: "submit", performed_by: userId, from_status: null, to_status: firstStep.status_code } },
    },
  });

  const dokumenIdsTA06 = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIdsTA06.length > 0) await linkDokumenToPengajuan(dokumenIdsTA06, pengajuan.id, userId);

  await reserveNomorSurat(pengajuan.id).catch(() => {});
  notifyFirstApprover(pengajuan.id, layanan.nama, mhs.nama_lengkap, firstStep.actor_type).catch(() => {});
  redirect(`/pengajuan/${pengajuan.id}`);
}

// ============================================================
// TA-06 Resubmit (revisi)
// ============================================================

export async function resubmitTA06(pengajuanId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mahasiswa: true },
  });
  if (!user?.mahasiswa) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE");

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true },
  });
  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND: Pengajuan tidak ditemukan");
  if (pengajuan.mahasiswa_id !== user.mahasiswa.id) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE: Bukan pengajuan Anda");
  if (pengajuan.status !== "revision_required") throw new Error("ERR_BUS_INVALID_STATE_TRANSITION: Pengajuan tidak dalam status revisi");

  const newRevisiKe = pengajuan.revisi_ke + 1;
  if (newRevisiKe > 3) throw new Error("ERR_BUS_MAX_RETRY_EXCEEDED: Batas maksimal 3x revisi sudah tercapai");

  const submissionId = (formData.get("submission_id_turnitin") as string) || "";
  const urlTurnitin = (formData.get("url_turnitin") as string) || "";
  const similarityStr = (formData.get("similarity_percentage") as string) || "0";
  const similarityPercentage = Number(similarityStr);

  if (!submissionId) throw new Error("ERR_VAL_REQUIRED_FIELD: Submission ID wajib diisi");
  if (!urlTurnitin) throw new Error("ERR_VAL_REQUIRED_FIELD: URL Turnitin wajib diisi");

  const newFieldValues = {
    ...((pengajuan.pengajuan_data?.field_values as Record<string, unknown>) || {}),
    submission_id_turnitin: submissionId,
    url_turnitin: urlTurnitin,
    similarity_percentage: similarityPercentage,
  };

  await prisma.pengajuanData.update({
    where: { pengajuan_id: pengajuanId },
    data: { field_values: newFieldValues },
  });

  await prisma.pengajuanVersi.create({
    data: { pengajuan_id: pengajuanId, versi_ke: newRevisiKe, data_snapshot: newFieldValues, dokumen_snapshot: {}, dibuat_oleh: userId },
  });

  await prisma.pengajuanLayanan.update({
    where: { id: pengajuanId },
    data: { status: "pending_kepala_lab", revisi_ke: newRevisiKe, current_step_code: "TA06-02" },
  });

  await prisma.pengajuanLog.create({
    data: { pengajuan_id: pengajuanId, action_code: "resubmit", performed_by: userId, from_status: "revision_required", to_status: "pending_kepala_lab", metadata: { revisi_ke: newRevisiKe } },
  });

  const dokumenIdsResubmit = (formData.get("dokumen_ids") as string)?.split(",").filter(Boolean).map(Number) ?? [];
  if (dokumenIdsResubmit.length > 0) await linkDokumenToPengajuan(dokumenIdsResubmit, pengajuanId, userId);

  redirect(`/pengajuan/${pengajuanId}`);
}

// ============================================================
// TA-04 Penguji + SetJadwal helpers
// ============================================================

export async function setJadwalKomprehensif(pengajuanId: number, data: { tanggal_sidang: string; waktu_mulai: string; waktu_selesai: string; ruang_sidang: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  await requireRole(userId, ["staff_prodi"]);

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true },
  });
  if (!pengajuan) throw new Error("Pengajuan tidak ditemukan");

  const currentValues = (pengajuan.pengajuan_data?.field_values as Record<string, unknown>) || {};
  await prisma.pengajuanData.upsert({
    where: { pengajuan_id: pengajuanId },
    update: { field_values: { ...currentValues, ...data } },
    create: { pengajuan_id: pengajuanId, field_values: { ...currentValues, ...data } },
  });
}

export async function setPengujiKomprehensif(pengajuanId: number, data: { penguji_prodi_dosen_id: number; penguji_keislaman_dosen_id: number }) {
  if (data.penguji_prodi_dosen_id === data.penguji_keislaman_dosen_id) {
    throw new Error("ERR_VAL_DUPLICATE: Penguji Prodi dan Keislaman harus berbeda");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  await requireRole(userId, ["sekprodi"]);

  await prisma.assignment.createMany({
    data: [
      { assignment_type: "penguji_komprehensif_prodi", dosen_id: data.penguji_prodi_dosen_id, pengajuan_id: pengajuanId, is_active: true },
      { assignment_type: "penguji_komprehensif_keislaman", dosen_id: data.penguji_keislaman_dosen_id, pengajuan_id: pengajuanId, is_active: true },
    ],
  });

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true },
  });
  const currentValues = (pengajuan?.pengajuan_data?.field_values as Record<string, unknown>) || {};
  await prisma.pengajuanData.upsert({
    where: { pengajuan_id: pengajuanId },
    update: { field_values: { ...currentValues, penguji_prodi_dosen_id: data.penguji_prodi_dosen_id, penguji_keislaman_dosen_id: data.penguji_keislaman_dosen_id } },
    create: { pengajuan_id: pengajuanId, field_values: { ...currentValues, penguji_prodi_dosen_id: data.penguji_prodi_dosen_id, penguji_keislaman_dosen_id: data.penguji_keislaman_dosen_id } },
  });
}

// ============================================================
// TA-05 Majelis + SetJadwal helper
// ============================================================

export async function setMajelisTA05(
  pengajuanId: number,
  data: {
    tanggal_sidang: string;
    waktu_mulai: string;
    waktu_selesai: string;
    ruang_sidang: string;
    ketua_sidang_dosen_id: number;
    sekretaris_sidang_dosen_id: number;
    penguji_1_dosen_id: number;
    penguji_2_dosen_id: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  await requireRole(userId, ["sekprodi"]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const allDosenIds = [
    data.ketua_sidang_dosen_id,
    data.sekretaris_sidang_dosen_id,
    data.penguji_1_dosen_id,
    data.penguji_2_dosen_id,
  ];
  if (new Set(allDosenIds).size !== allDosenIds.length) {
    throw new Error("ERR_VAL_DUPLICATE: Semua anggota majelis harus berbeda");
  }

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true },
  });
  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND: Pengajuan tidak ditemukan");

  await prisma.assignment.createMany({
    data: [
      { assignment_type: "ketua_sidang", dosen_id: data.ketua_sidang_dosen_id, pengajuan_id: pengajuanId, mahasiswa_id: pengajuan.mahasiswa_id, is_active: true },
      { assignment_type: "sekretaris_sidang", dosen_id: data.sekretaris_sidang_dosen_id, pengajuan_id: pengajuanId, mahasiswa_id: pengajuan.mahasiswa_id, is_active: true },
      { assignment_type: "penguji_skripsi", dosen_id: data.penguji_1_dosen_id, pengajuan_id: pengajuanId, mahasiswa_id: pengajuan.mahasiswa_id, is_active: true },
      { assignment_type: "penguji_skripsi", dosen_id: data.penguji_2_dosen_id, pengajuan_id: pengajuanId, mahasiswa_id: pengajuan.mahasiswa_id, is_active: true },
    ],
  });

  const currentValues = (pengajuan.pengajuan_data?.field_values as Record<string, unknown>) || {};
  await prisma.pengajuanData.upsert({
    where: { pengajuan_id: pengajuanId },
    update: { field_values: { ...currentValues, ...data } },
    create: { pengajuan_id: pengajuanId, field_values: { ...currentValues, ...data } },
  });

  await executeWorkflowAction({ pengajuanId, action: "approve", data: data as Record<string, unknown> });
}

export async function setJadwalTA03(pengajuanId: number, data: { tanggal_sidang: string; waktu_mulai: string; waktu_selesai: string; ruang_sidang: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  await requireRole(userId, ["staff_prodi"]);

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true },
  });
  if (!pengajuan) throw new Error("Pengajuan tidak ditemukan");

  const currentValues = (pengajuan.pengajuan_data?.field_values as Record<string, unknown>) || {};
  await prisma.pengajuanData.upsert({
    where: { pengajuan_id: pengajuanId },
    update: { field_values: { ...currentValues, ...data } },
    create: { pengajuan_id: pengajuanId, field_values: { ...currentValues, ...data } },
  });
}

export async function setPengujiTA03(pengajuanId: number, data: { penguji_1_dosen_id: number; penguji_2_dosen_id: number }) {
  if (data.penguji_1_dosen_id === data.penguji_2_dosen_id) {
    throw new Error("ERR_VAL_DUPLICATE: Penguji 1 dan 2 harus berbeda");
  }

  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  await requireRole(userId, ["sekprodi"]);

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true },
  });
  if (!pengajuan) throw new Error("Pengajuan tidak ditemukan");

  await prisma.assignment.createMany({
    data: [
      { assignment_type: "penguji_proposal", dosen_id: data.penguji_1_dosen_id, pengajuan_id: pengajuanId, is_active: true },
      { assignment_type: "penguji_proposal", dosen_id: data.penguji_2_dosen_id, pengajuan_id: pengajuanId, is_active: true },
    ],
  });

  const currentValues = (pengajuan.pengajuan_data?.field_values as Record<string, unknown>) || {};
  await prisma.pengajuanData.upsert({
    where: { pengajuan_id: pengajuanId },
    update: { field_values: { ...currentValues, penguji_1_dosen_id: data.penguji_1_dosen_id, penguji_2_dosen_id: data.penguji_2_dosen_id } },
    create: { pengajuan_id: pengajuanId, field_values: { ...currentValues, penguji_1_dosen_id: data.penguji_1_dosen_id, penguji_2_dosen_id: data.penguji_2_dosen_id } },
  });
}

export async function setPembimbingTA02(
  pengajuanId: number,
  data: {
    pembimbing_1_dosen_id: number;
    pembimbing_2_dosen_id: number;
    nomor_surat_prodi: string;
    tanggal_surat_prodi: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const userId = Number(session.user.id);
  await requireRole(userId, ["sekprodi"]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    include: { pengajuan_data: true },
  });
  if (!pengajuan) throw new Error("ERR_BUS_PROFILE_NOT_FOUND: Pengajuan tidak ditemukan");

  await prisma.assignment.createMany({
    data: [
      {
        assignment_type: "pembimbing_skripsi_1",
        dosen_id: data.pembimbing_1_dosen_id,
        mahasiswa_id: pengajuan.mahasiswa_id,
        pengajuan_id: pengajuanId,
        is_active: true,
      },
      {
        assignment_type: "pembimbing_skripsi_2",
        dosen_id: data.pembimbing_2_dosen_id,
        mahasiswa_id: pengajuan.mahasiswa_id,
        pengajuan_id: pengajuanId,
        is_active: true,
      },
    ],
  });

  if (pengajuan.pengajuan_data) {
    const currentValues = (pengajuan.pengajuan_data.field_values as Record<string, unknown>) || {};
    await prisma.pengajuanData.update({
      where: { id: pengajuan.pengajuan_data.id },
      data: {
        field_values: {
          ...currentValues,
          pembimbing_1_dosen_id: data.pembimbing_1_dosen_id,
          pembimbing_2_dosen_id: data.pembimbing_2_dosen_id,
          nomor_surat_prodi: data.nomor_surat_prodi,
          tanggal_surat_prodi: data.tanggal_surat_prodi,
        },
      },
    });
  }

  await executeWorkflowAction({ pengajuanId, action: "approve", data: data as Record<string, unknown> });
}
