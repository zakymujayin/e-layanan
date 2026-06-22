import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { isRateLimited } from "@/lib/rate-limit";

async function findUserByIdentifier(identifier: string) {
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { dosen: { nidn: identifier } },
        { pegawai: { nip: identifier } },
        { mahasiswa: { nim: identifier } },
      ],
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email/NIM/NIDN/NIP", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip =
          (req as Request)?.headers?.get("x-forwarded-for") ??
          (req as Request)?.headers?.get("x-real-ip") ??
          "unknown";

        if (isRateLimited(`login:${ip}`, 5, 60_000)) {
          throw new Error("ERR_AUTH_RATE_LIMIT: Terlalu banyak percobaan login. Coba lagi dalam 1 menit.");
        }

        const { identifier, password } = credentials as {
          identifier: string;
          password: string;
        };
        if (!identifier || !password) return null;

        const rateLimitKey = `login:${identifier ?? "anon"}`;
        if (isRateLimited(rateLimitKey, 5, 15 * 60 * 1000)) {
          throw new Error("ERR_RATE_LIMIT: Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
        }

        const user = await findUserByIdentifier(identifier);
        if (!user || !user.is_active) return null;
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;
        return { id: String(user.id), email: user.email, name: user.email };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
