import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email/NIM/NIDN/NIP", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { identifier, password } = credentials as {
          identifier: string;
          password: string;
        };
        if (!identifier || !password) return null;
        const user = await findUserByIdentifier(identifier);
        if (!user || !user.is_active) return null;
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;
        return { id: String(user.id), email: user.email, name: user.email };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({ where: { id: Number(user.id) } });
        if (dbUser) {
          session.user.id = String(dbUser.id);
          (session.user as any).systemRole = dbUser.system_role;
        }
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
});
