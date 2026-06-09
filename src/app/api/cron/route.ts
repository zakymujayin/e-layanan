import { NextRequest, NextResponse } from "next/server";
import { runSlaCheck } from "@/lib/sla-checker";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runSlaCheck();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
}
