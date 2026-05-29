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
