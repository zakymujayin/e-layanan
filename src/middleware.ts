import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/verifikasi", "/lupa-password"];
const publicPrefixes = ["/api/auth", "/api/register", "/_next", "/favicon.ico"];

export default auth((req) => {
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
