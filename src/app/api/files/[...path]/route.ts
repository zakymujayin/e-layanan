import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage/local";
import { prisma } from "@/lib/prisma";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

// RFC 5987 encoding for Content-Disposition filename
function encodeFilename(name: string): string {
  return `filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = Number(session.user.id);

  const { path: pathSegments } = await params;

  // Reject path traversal: no "..", null bytes, or absolute segments
  if (pathSegments.some(s => s === ".." || s.includes("\0") || s.startsWith("/"))) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const filePath = pathSegments.join("/");

  // Verify file exists in DB and user is authorised to access it
  const dokumen = await prisma.pengajuanDokumen.findFirst({
    where: { file_path: filePath },
    include: {
      pengajuan: {
        include: {
          mahasiswa: { include: { user: { select: { id: true } } } },
          assignments: { select: { dosen_id: true } },
        },
      },
    },
  });

  if (!dokumen) {
    return new NextResponse("File tidak ditemukan", { status: 404 });
  }

  // Access check: uploader, mahasiswa owner, staff/admin, or assigned dosen
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { system_role: true, dosen_id: true },
  });

  const isUploader = dokumen.di_upload_oleh === userId;
  const isMahasiswaOwner = dokumen.pengajuan?.mahasiswa?.user?.id === userId;
  const isStaffOrAdmin = user && ["staff_prodi", "staff_akademik", "kabag", "super_admin"].includes(user.system_role);
  const isAssignedDosen =
    user?.dosen_id != null &&
    (dokumen.pengajuan?.assignments ?? []).some(a => a.dosen_id === user.dosen_id);

  // Structural position holders (dekan, WD1, kaprodi, etc.) also have access
  const hasStructuralPosition = user?.dosen_id
    ? await prisma.structuralPosition.count({ where: { dosen_id: user.dosen_id, is_active: true } }).then(n => n > 0)
    : false;

  if (!isUploader && !isMahasiswaOwner && !isStaffOrAdmin && !isAssignedDosen && !hasStructuralPosition) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await storage.download(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
    const baseName = path.basename(filePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; ${encodeFilename(baseName)}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("File tidak ditemukan", { status: 404 });
  }
}
