import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  reserveNomorSurat,
  activateNomorSurat,
  voidNomorSurat,
} from "../numbering";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pengajuanLayanan: {
      findUnique: vi.fn(),
    },
    penomoranCounter: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("numbering", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.setSystemTime(new Date("2026-06-22T00:00:00Z"));
  });

  describe("reserveNomorSurat", () => {
    it("returns existing formatted number if already reserved", async () => {
      vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue({
        id: 1,
      } as any);
      vi.mocked(prisma.penomoranCounter.findFirst).mockResolvedValue({
        id: 10,
        nomor_formatted: "0005/Un.17/F.III/AK/VI/2026",
      } as any);

      const result = await reserveNomorSurat(1);

      expect(result).toBe("0005/Un.17/F.III/AK/VI/2026");
      expect(prisma.penomoranCounter.create).not.toHaveBeenCalled();
    });

    it("generates formatted FUDA number for a new reservation", async () => {
      vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue({
        id: 1,
        academic_period_id: 2,
        scope_level: "prodi",
        prodi_id: 3,
        jenis_layanan: {
          kode_klasifikasi_id: 4,
          kode_klasifikasi: { kode: "AK" },
        },
      } as any);
      vi.mocked(prisma.penomoranCounter.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.$transaction).mockResolvedValue([{ id: 100 }]);
      vi.mocked(prisma.penomoranCounter.count).mockResolvedValue(1);

      const result = await reserveNomorSurat(1);

      expect(result).toBe("0001/Un.17/F.III/AK/VI/2026");
      expect(prisma.penomoranCounter.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          academic_period_id: 2,
          kode_klasifikasi_id: 4,
          scope_level: "prodi",
          scope_id: 3,
          pengajuan_id: 1,
          nomor_urut: 0,
          nomor_formatted: "",
          status: "reserved",
        }),
      });
      expect(prisma.penomoranCounter.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { nomor_urut: 1, nomor_formatted: "0001/Un.17/F.III/AK/VI/2026" },
      });
    });

    it("uses Roman numeral for the current month", async () => {
      vi.setSystemTime(new Date("2026-03-15T00:00:00Z"));
      vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue({
        id: 1,
        academic_period_id: 2,
        scope_level: "prodi",
        prodi_id: 3,
        jenis_layanan: {
          kode_klasifikasi_id: 4,
          kode_klasifikasi: { kode: "TA" },
        },
      } as any);
      vi.mocked(prisma.penomoranCounter.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.$transaction).mockResolvedValue([{ id: 101 }]);
      vi.mocked(prisma.penomoranCounter.count).mockResolvedValue(12);

      const result = await reserveNomorSurat(1);

      expect(result).toBe("0012/Un.17/F.III/TA/III/2026");
    });

    it("throws when pengajuan is not found", async () => {
      vi.mocked(prisma.pengajuanLayanan.findUnique).mockResolvedValue(null);

      await expect(reserveNomorSurat(999)).rejects.toThrow("Pengajuan tidak ditemukan");
    });
  });

  describe("activateNomorSurat", () => {
    it("updates reserved counters to active", async () => {
      vi.mocked(prisma.penomoranCounter.updateMany).mockResolvedValue({ count: 1 } as any);

      await activateNomorSurat(1);

      expect(prisma.penomoranCounter.updateMany).toHaveBeenCalledWith({
        where: { pengajuan_id: 1, status: "reserved" },
        data: { status: "active", activated_at: expect.any(Date) },
      });
    });
  });

  describe("voidNomorSurat", () => {
    it("updates reserved counters to void", async () => {
      vi.mocked(prisma.penomoranCounter.updateMany).mockResolvedValue({ count: 1 } as any);

      await voidNomorSurat(1);

      expect(prisma.penomoranCounter.updateMany).toHaveBeenCalledWith({
        where: { pengajuan_id: 1, status: "reserved" },
        data: { status: "void", voided_at: expect.any(Date) },
      });
    });
  });
});
