import { describe, it, expect, vi, beforeEach } from "vitest";
import { canAccessPengajuan } from "../check";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    pengajuanLayanan: {
      findUnique: vi.fn(),
    },
    structuralPosition: {
      findMany: vi.fn(),
    },
    pengajuanData: {
      findFirst: vi.fn(),
    },
    assignment: {
      count: vi.fn(),
    },
  },
}));

describe("canAccessPengajuan", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const basePengajuan = {
    id: 1,
    mahasiswa_id: 10,
    scope_level: "prodi",
    jenis_layanan: { kode: "TA-01" },
  };

  it("allows mahasiswa to access their own pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "mahasiswa",
      mahasiswa_id: 10,
      dosen_id: null,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("denies mahasiswa access to another student's pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "mahasiswa",
      mahasiswa_id: 99,
      dosen_id: null,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(false);
  });

  it("allows super_admin to access any pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "super_admin",
      mahasiswa_id: null,
      dosen_id: null,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("allows staff_prodi to access prodi-scoped pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "staff_prodi",
      mahasiswa_id: null,
      dosen_id: null,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("denies staff_prodi access to fakultas-scoped pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "staff_prodi",
      mahasiswa_id: null,
      dosen_id: null,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue({
      ...basePengajuan,
      scope_level: "fakultas",
    } as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(false);
  });

  it("allows staff_akademik to access fakultas-scoped pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "staff_akademik",
      mahasiswa_id: null,
      dosen_id: null,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue({
      ...basePengajuan,
      scope_level: "fakultas",
    } as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("allows kaprodi to access any pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "kaprodi",
      mahasiswa_id: null,
      dosen_id: 5,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("allows dosen PA to access assigned pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "dosen",
      mahasiswa_id: null,
      dosen_id: 5,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);
    vi.mocked(prisma.structuralPosition.findMany).mockResolvedValue([]);
    vi.mocked(prisma.pengajuanData.findFirst).mockResolvedValue({
      field_values: { pa_dosen_id: 5 },
    } as any);
    vi.mocked(prisma.assignment.count).mockResolvedValue(0);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("allows dosen penguji to access assigned pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "dosen",
      mahasiswa_id: null,
      dosen_id: 5,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);
    vi.mocked(prisma.structuralPosition.findMany).mockResolvedValue([]);
    vi.mocked(prisma.pengajuanData.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.assignment.count).mockResolvedValue(1);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("denies dosen without assignment or structural role", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "dosen",
      mahasiswa_id: null,
      dosen_id: 5,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);
    vi.mocked(prisma.structuralPosition.findMany).mockResolvedValue([]);
    vi.mocked(prisma.pengajuanData.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.assignment.count).mockResolvedValue(0);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(false);
  });

  it("allows dosen with structural position to access any pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "dosen",
      mahasiswa_id: null,
      dosen_id: 5,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);
    vi.mocked(prisma.structuralPosition.findMany).mockResolvedValue([
      { position_code: "sekprodi" },
    ] as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("allows kepala_lab to access TA-06 pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "dosen",
      mahasiswa_id: null,
      dosen_id: 5,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue({
      ...basePengajuan,
      jenis_layanan: { kode: "TA-06" },
    } as any);
    vi.mocked(prisma.structuralPosition.findMany).mockResolvedValue([
      { position_code: "kepala_lab" },
    ] as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(true);
  });

  it("denies kepala_lab access to non-TA-06 pengajuan", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "dosen",
      mahasiswa_id: null,
      dosen_id: 5,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);
    vi.mocked(prisma.structuralPosition.findMany).mockResolvedValue([
      { position_code: "kepala_lab" },
    ] as any);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(false);
  });

  it("returns false when user is not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(false);
  });

  it("returns false when pengajuan is not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      system_role: "mahasiswa",
      mahasiswa_id: 10,
      dosen_id: null,
    } as any);
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(null);

    const result = await canAccessPengajuan(1, 1);

    expect(result).toBe(false);
  });

  it("uses preloaded user when provided", async () => {
    vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(basePengajuan as any);

    const result = await canAccessPengajuan(1, 1, {
      system_role: "mahasiswa",
      mahasiswa_id: 10,
      dosen_id: null,
    });

    expect(result).toBe(true);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
