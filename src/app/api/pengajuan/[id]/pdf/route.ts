import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildDocumentContext } from "@/lib/document/context-builder";
import { selectTemplate } from "@/lib/document/templates";
import { generatePdf } from "@/lib/document/generate-pdf";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const pengajuanId = Number(id);
  const modeParam = request.nextUrl.searchParams.get("mode") ?? "preview";
  const mode: "preview" | "final" = modeParam === "final" ? "final" : "preview";

  const pengajuan = await prisma.pengajuanLayanan.findUnique({
    where: { id: pengajuanId },
    select: { id: true, jenis_layanan: { select: { kode: true } } },
  });

  if (!pengajuan) {
    return new NextResponse("Pengajuan tidak ditemukan", { status: 404 });
  }

  const layananKode = pengajuan.jenis_layanan.kode;
  const allServices = ["TA-01", "TA-02", "TA-03", "TA-04", "TA-05", "TA-06", "AK-01", "AK-02", "AK-03", "AK-04", "AK-05", "AK-06", "AK-07"];
  if (!allServices.includes(layananKode)) {
    return new NextResponse("Template belum tersedia untuk layanan ini", { status: 501 });
  }

  const ctx = await buildDocumentContext(pengajuanId, mode);
  const templateFn = selectTemplate(layananKode, mode === "final");
  const html = templateFn(ctx);
  const pdfBuffer = await generatePdf(html, { mode });

  const filename = `${pengajuan.jenis_layanan.kode}_${String(pengajuanId).padStart(4, "0")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        mode === "final"
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
