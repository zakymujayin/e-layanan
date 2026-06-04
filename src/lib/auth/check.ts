import { auth } from "./index";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (!user) throw new Error("ERR_AUTH_NOT_AUTHENTICATED");
  return user;
}

export function requireRole(user: { systemRole: string }, ...roles: string[]) {
  if (!roles.includes(user.systemRole)) throw new Error("ERR_AUTH_INSUFFICIENT_ROLE");
}

export function requireScope(user: { systemRole: string }, resource: { fakultasId?: number; prodiId?: number; mahasiswaId?: number }, scope: { level: string; fakultasId?: number; prodiId?: number; userId?: number }) {
  if (scope.level === "all") return;
  if (scope.level === "own" && scope.userId !== resource.mahasiswaId) throw new Error("ERR_AUTH_OUTSIDE_SCOPE");
  if (scope.level === "prodi" && scope.prodiId !== resource.prodiId) throw new Error("ERR_AUTH_OUTSIDE_SCOPE");
  if (scope.level === "fakultas" && scope.fakultasId !== resource.fakultasId) throw new Error("ERR_AUTH_OUTSIDE_SCOPE");
}

export async function canAccessPengajuan(
  userId: number,
  pengajuanId: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { system_role: true, mahasiswa_id: true, dosen_id: true },
  });
  if (!user) return false;
  if (user.system_role === "super_admin") return true;

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    select: {
      mahasiswa_id: true,
      scope_level: true,
      jenis_layanan: { select: { kode: true } },
    },
  });
  if (!pengajuan) return false;

  switch (user.system_role) {
    case "mahasiswa":
      return pengajuan.mahasiswa_id === user.mahasiswa_id;
    case "staff_prodi":
      return pengajuan.scope_level === "prodi";
    case "staff_akademik":
    case "kabag":
      return pengajuan.scope_level === "fakultas";
    case "dosen": {
      if (!user.dosen_id) return false;
      const positions = await prisma.structuralPosition.findMany({
        where: { dosen_id: user.dosen_id, is_active: true },
        select: { position_code: true },
      });
      const codes = positions.map(p => p.position_code as string);
      if (codes.some(c => ["wakil_dekan_1", "dekan", "kaprodi", "sekprodi"].includes(c))) return true;
      if (codes.includes("kepala_lab")) return pengajuan.jenis_layanan.kode === "TA-06";

      const data = await prisma.pengajuanData.findFirst({
        where: { pengajuan_id: pengajuanId },
        select: { field_values: true },
      });
      if (data?.field_values) {
        const fv = data.field_values as Record<string, unknown>;
        if (Number(fv.pa_dosen_id) === user.dosen_id) return true;
      }
      const count = await prisma.assignment.count({
        where: { pengajuan_id: pengajuanId, dosen_id: user.dosen_id, is_active: true },
      });
      return count > 0;
    }
    default:
      return false;
  }
}
