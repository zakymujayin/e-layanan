"use server";

import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/local";
import type { StorageProvider } from "@/lib/storage/types";

const MAX_FILE_SIZE_DEFAULT = 2 * 1024 * 1024;

export async function saveUploadedFile(
  pengajuanId: number | null,
  dokumenPersyaratanId: number,
  file: { name: string; buffer: Buffer; mimeType: string; size: number },
  uploadedBy: number,
  isAutoAttached = false
) {
  const dokumenPersyaratan = await prisma.dokumenPersyaratan.findUnique({
    where: { id: dokumenPersyaratanId },
  });

  if (dokumenPersyaratan) {
    const maxSize = (dokumenPersyaratan.ukuran_max_mb ?? 2) * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`ERR_VAL_MAX_SIZE: Ukuran file maksimal ${dokumenPersyaratan.ukuran_max_mb}MB`);
    }

    const allowedFormats = (dokumenPersyaratan.format_diizinkan as string[]) ?? [];
    if (allowedFormats.length > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const mimeMap: Record<string, string> = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };
      const detectedType = mimeMap[ext] ?? file.mimeType;
      const allowedMimes = allowedFormats.map(f => mimeMap[f.toLowerCase()] ?? "").filter(Boolean);
      if (allowedMimes.length > 0 && !allowedMimes.includes(detectedType)) {
        throw new Error(`ERR_VAL_INVALID_FORMAT: Format file harus ${allowedFormats.join("/")}`);
      }
    }
  } else {
    if (file.size > MAX_FILE_SIZE_DEFAULT) {
      throw new Error(`ERR_VAL_MAX_SIZE: Ukuran file maksimal 2MB`);
    }
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const destPath = pengajuanId
    ? `pengajuan/${pengajuanId}/${timestamp}-${safeName}`
    : `pengajuan/temp/${timestamp}-${safeName}`;

  const filePath = await storage.upload(destPath, file.buffer, file.mimeType);
  const serveUrl = storage.getServeUrl(filePath);

  const dokumen = await prisma.pengajuanDokumen.create({
    data: {
      pengajuan_id: pengajuanId ?? undefined,
      dokumen_persyaratan_id: dokumenPersyaratanId,
      file_path: filePath,
      file_name: file.name,
      file_size_bytes: file.size,
      mime_type: file.mimeType,
      is_auto_attached: isAutoAttached,
      di_upload_oleh: uploadedBy,
    },
  });

  return { id: dokumen.id, file_path: filePath, file_name: file.name, serve_url: serveUrl, size: file.size };
}

export async function linkDokumenToPengajuan(dokumenIds: number[], pengajuanId: number) {
  if (dokumenIds.length === 0) return;

  await prisma.$transaction(
    dokumenIds.map(id =>
      prisma.pengajuanDokumen.update({
        where: { id },
        data: { pengajuan_id: pengajuanId },
      })
    )
  );
}
