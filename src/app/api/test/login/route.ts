import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function authorize(req: NextRequest): boolean {
  const secret = req.headers.get("x-test-secret");
  return process.env.NODE_ENV !== "production" && secret === process.env.TEST_SECRET;
}

/**
 * Test-only login endpoint.
 * Bypasses CSRF token, rate limiter, and client-side signIn.
 * POST /api/test/login
 * Header: x-test-secret
 * Body: { userId: number }
 */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = body.userId ? Number(body.userId) : null;
    const identifier = body.identifier as string | undefined;

    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, system_role: true, is_active: true },
      });
    } else if (identifier) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
        select: { id: true, email: true, system_role: true, is_active: true },
      });
    } else {
      return NextResponse.json({ ok: false, error: "Missing userId or identifier" }, { status: 400 });
    }
    if (!user || !user.is_active) {
      return NextResponse.json({ ok: false, error: "User not found or inactive" }, { status: 404 });
    }

    // Generate a JWT session token using next-auth internals
    const { encode } = await import("@auth/core/jwt");
    const token = await encode({
      token: {
        sub: String(user.id),
        email: user.email,
        name: user.email,
        role: user.system_role,
      },
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "test-auth-secret-change-me",
      salt: "authjs.session-token",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    if (!token) {
      return NextResponse.json({ ok: false, error: "Failed to encode token" }, { status: 500 });
    }

    // Set the session cookie directly in the response
    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.system_role } });
    response.cookies.set("authjs.session-token", token, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
