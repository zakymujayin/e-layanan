import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dosen = await prisma.dosen.findMany({
    where: { is_active: true },
    select: { id: true, nidn: true, nama_lengkap: true },
    orderBy: { nama_lengkap: "asc" },
  });
  return NextResponse.json({ data: dosen });
}
