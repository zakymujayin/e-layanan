import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const dokumenPersyaratanIdStr = formData.get("dokumen_persyaratan_id") as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }
    if (!dokumenPersyaratanIdStr) {
      return NextResponse.json({ error: "dokumen_persyaratan_id wajib diisi" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await saveUploadedFile(
      null,
      Number(dokumenPersyaratanIdStr),
      { name: file.name, buffer, mimeType: file.type, size: file.size },
      userId,
      false
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload gagal" }, { status: 400 });
  }
}
