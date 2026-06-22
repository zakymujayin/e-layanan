import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/verifikasi", "/lupa-password"];
const publicPrefixes = ["/api/auth", "/api/register", "/api/test", "/api/cron", "/api/upload", "/_next", "/favicon.ico"];

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  if (publicRoutes.includes(pathname) || publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  // Server actions (POST with Next-Action header) handle auth internally — let them through
  if (req.method === "POST" && req.headers.get("next-action")) {
    return NextResponse.next();
  }
  if (!req.auth) {
    // Use Host header to get actual port — req.url may be normalized by NextAuth to NEXTAUTH_URL
    const host = req.headers.get("host") ?? req.nextUrl.host;
    const loginUrl = new URL("/login", `${req.nextUrl.protocol}//${host}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
