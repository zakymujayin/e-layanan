import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/local";
import { buildDocumentContext } from "./context-builder";
import { selectTemplate, type JenisDokumen } from "./templates";
import { generatePdf } from "./generate-pdf";

export async function generateAndStoreDokumen(opts: {
  pengajuanId: number;
  layananKode: string;
  jenis: JenisDokumen;
  signedBy: number;
  nomorSurat?: string;
}): Promise<void> {
  const { pengajuanId, layananKode, jenis, signedBy, nomorSurat } = opts;

  const ctx = await buildDocumentContext(pengajuanId, "final", jenis);
  const templateFn = selectTemplate(layananKode, true, jenis);
  const html = templateFn(ctx);
  const pdfBuffer = await generatePdf(html, { mode: "final" });

  const filePath = `output/${pengajuanId}/${jenis}.pdf`;
  await storage.upload(filePath, Buffer.from(pdfBuffer), "application/pdf");

  const jenisDokumenLabel =
    jenis === "surat_tugas" ? "Surat Tugas" : "Berita Acara dan Nilai";

  const existing = await prisma.dokumenOutput.findFirst({
    where: { pengajuan_id: pengajuanId, jenis_dokumen: jenisDokumenLabel },
  });

  if (existing) {
    await prisma.dokumenOutput.update({
      where: { id: existing.id },
      data: {
        file_path_final: filePath,
        is_final: true,
        finalized_at: new Date(),
        signed_by: signedBy,
        ...(nomorSurat ? { nomor_surat: nomorSurat } : {}),
      },
    });
  } else {
    await prisma.dokumenOutput.create({
      data: {
        pengajuan_id: pengajuanId,
        jenis_dokumen: jenisDokumenLabel,
        nomor_surat: nomorSurat ?? null,
        file_path_final: filePath,
        is_final: true,
        generated_at: new Date(),
        finalized_at: new Date(),
        signed_by: signedBy,
      },
    });
  }
}
