import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const layananKode = request.nextUrl.searchParams.get("layanan_kode");
  if (!layananKode) {
    return NextResponse.json({ error: "layanan_kode is required" }, { status: 400 });
  }

  const layanan = await prisma.jenisLayanan.findUnique({
    where: { kode: layananKode },
    include: { dokumen_persyaratan: { orderBy: { urutan: "asc" } } },
  });

  if (!layanan) {
    return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });
  }

  const dokumen = layanan.dokumen_persyaratan.map(d => ({
    id: d.id,
    nama_dokumen: d.nama_dokumen,
    format_diizinkan: d.format_diizinkan,
    ukuran_max_mb: d.ukuran_max_mb,
    is_required: d.is_required,
  }));

  return NextResponse.json({ dokumen });
}
