import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);

  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: 30,
  });

  const unreadCount = await prisma.notification.count({
    where: { user_id: userId, is_read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  const body = await request.json();
  const id = typeof body.id === "number" ? body.id : null;

  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // Scoped to owner — updateMany matches 0 rows if id belongs to another user
  await prisma.notification.updateMany({
    where: { id, user_id: userId },
    data: { is_read: true, read_at: new Date() },
  });

  return NextResponse.json({ ok: true });
}
