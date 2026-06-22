import { NextRequest, NextResponse } from "next/server";
import { executeWorkflowAction } from "@/lib/workflow/execute-action";
import { prisma } from "@/lib/prisma";

function authorize(req: NextRequest): boolean {
  const secret = req.headers.get("x-test-secret");
  return process.env.NODE_ENV !== "production" && secret === process.env.TEST_SECRET;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = Number(body.userId);
    const pengajuanId = Number(body.pengajuanId);
    const action = String(body.action);
    const data = body.data as Record<string, unknown> | undefined;
    const type = String(body.type ?? "workflow");

    if (type === "workflow") {
      // Verify user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      }

      const result = await executeWorkflowAction({
        pengajuanId,
        action,
        data,
        __test_userId: userId,
      });
      return NextResponse.json({ ok: true, data: { status: result.status, currentStep: result.current_step_code } });
    }

    if (type === "status") {
      const pengajuan = await prisma.pengajuanLayanan.findUnique({
        where: { id: pengajuanId },
        select: { status: true, current_step_code: true, mahasiswa_id: true, completed_at: true },
      });
      if (!pengajuan) {
        return NextResponse.json({ ok: false, error: "Pengajuan not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, data: pengajuan });
    }

    if (type === "submit") {
      const formData = new FormData();
      for (const [key, value] of Object.entries(body.formData ?? {})) {
        formData.append(key, String(value));
      }

      const { submitPengajuanTA01 } = await import("@/actions/pengajuan");
      // This won't work with redirect... let's handle through direct DB
      return NextResponse.json({ ok: false, error: "Submit via server action not supported in test API. Use direct prisma." }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: `Unknown type: ${type}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? "Unknown error" });
  }
}
