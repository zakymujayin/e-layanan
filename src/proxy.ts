import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/verifikasi", "/lupa-password"];
const publicPrefixes = ["/api/auth", "/api/register", "/_next", "/favicon.ico"];

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  if (publicRoutes.includes(pathname) || publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
