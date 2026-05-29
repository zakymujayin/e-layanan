# Phase 1: Fondasi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** App bisa login, dashboard tampil, semua data master dan infrastruktur siap.

**Architecture:** Next.js 16 App Router + Prisma + PostgreSQL + Auth.js v5. Monolith dengan layer: Server Components → Server Actions → Service Layer → Prisma → DB. shadcn/ui untuk UI, Tailwind v4 untuk styling.

**Tech Stack:** Next.js 16.2, React 19.2, TypeScript strict, Prisma, PostgreSQL 16, Auth.js v5, Zod v4, date-fns v4, shadcn/ui (new-york), Tailwind CSS v4, lucide-react, bcryptjs

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: project root via `create-next-app`

- [ ] **Step 1: Scaffold Next.js**

```bash
npx create-next-app@latest sila --typescript --tailwind --eslint --src-dir --app --import-alias "@/*" --turbopack
```

- [ ] **Step 2: Masuk ke direktori dan install dependencies utama**

```bash
cd sila
npm install prisma @prisma/client @auth/prisma-adapter next-auth@beta zod date-fns bcryptjs
npm install -D @types/bcryptjs vitest @playwright/test prettier
```

- [ ] **Step 3: Init shadcn/ui (new-york style)**

```bash
npx shadcn@latest init
```
Pilih: `new-york` style, neutral base color, yes to CSS variables.

- [ ] **Step 4: Init Prisma**

```bash
npx prisma init
```
Ini akan membuat `prisma/schema.prisma` template.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js 16 + Prisma + shadcn/ui"
```

---

## Task 2: Create Prisma Schema (32 Tabel)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Tulis schema lengkap**

Copy seluruh schema dari [docs/07_ERD_Database_Design.md] ke `prisma/schema.prisma`. Tambahkan kolom dari gap analysis:
- `action_config Json?` di model `WorkflowStepAction`
- `jenis_kelamin String?` di model `Mahasiswa`
- `tempat_lahir String?` di model `Mahasiswa`
- `tanggal_lahir DateTime?` di model `Mahasiswa`

- [ ] **Step 2: Pastikan DATABASE_URL di `.env`**

```bash
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sila_dev"' >> .env
```

- [ ] **Step 3: Buat database dan jalankan migration**

```bash
createdb sila_dev
npx prisma migrate dev --name init
```

Expected: Migration sukses, 32 tabel ter-create di PostgreSQL.

- [ ] **Step 4: Verifikasi tabel**

```bash
psql sila_dev -c "\dt"
```

Expected: 32 tabel terdaftar (`users`, `dosen`, `pegawai`, `mahasiswa`, ...).

- [ ] **Step 5: Generate Prisma Client**

```bash
npx prisma generate
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ .env prisma/migrations/ && git commit -m "feat: add complete Prisma schema (32 tables)"
```

---

## Task 3: Setup Auth.js v5

**Files:**
- Create: `src/lib/auth/index.ts`
- Create: `src/lib/auth/check.ts`
- Create: `src/lib/auth/scope.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`
- Modify: `.env`

- [ ] **Step 1: Tambahkan NEXTAUTH_SECRET + NEXTAUTH_URL**

```bash
echo 'NEXTAUTH_SECRET="super-secret-key-change-in-production-32chars-min"' >> .env
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
```

- [ ] **Step 2: Buat Auth.js config**

`src/lib/auth/index.ts`:
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, ...(await getIdentifierConditions(identifier))],
          },
        });
        if (!user || !user.isActive) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        return { id: String(user.id), email: user.email };
      },
    }),
  ],
  pages: { signIn: "/login" },
});
```

`src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Buat API route handler**

`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 4: Buat middleware**

`src/middleware.ts`:
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/verifikasi", "/lupa-password", "/api/register"];
const publicPrefixes = ["/api/auth", "/_next", "/favicon.ico"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (publicRoutes.includes(pathname) || publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/ src/app/api/ src/middleware.ts .env && git commit -m "feat: setup Auth.js v5 with database sessions"
```

---

## Task 4: Install shadcn/ui Components

**Files:**
- Create: `src/components/ui/*` (via CLI)

- [ ] **Step 1: Install semua komponen yang dibutuhkan**

```bash
npx shadcn@latest add button input textarea select checkbox radio-group label form card badge sheet sonner alert-dialog dialog progress skeleton avatar tooltip separator tabs accordion table calendar dropdown-menu sidebar breadcrumb scroll-area
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ && git commit -m "feat: install shadcn/ui components (new-york)"
```

---

## Task 5: Shared Layout (Sidebar + Header)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Buat Sidebar navigasi**

`src/components/layout/Sidebar.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Archive, User, Settings } from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"] },
  { label: "Pengajuan", href: "/pengajuan", icon: FileText, roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"] },
  { label: "Arsip", href: "/arsip", icon: Archive, roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"] },
  { label: "Surat & SK Saya", href: "/surat-saya", icon: FileText, roles: ["dosen"] },
  { label: "Profil", href: "/profil", icon: User, roles: ["mahasiswa", "dosen", "staff_prodi", "staff_akademik", "kabag", "super_admin"] },
  { label: "Admin Panel", href: "/admin", icon: Settings, roles: ["super_admin"] },
];

export function AppSidebar({ systemRole }: { systemRole: string }) {
  const pathname = usePathname();
  const filtered = menuItems.filter((item) => item.roles.includes(systemRole));

  return (
    <ShadSidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SILA FUDA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadSidebar>
  );
}
```

- [ ] **Step 2: Buat Header**

`src/components/layout/Header.tsx`:
```typescript
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationSheet } from "./NotificationSheet";

export function Header({ userName }: { userName: string }) {
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center gap-4 border-b px-6">
      <div className="flex-1">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari pengajuan..." className="pl-8" />
        </div>
      </div>
      <NotificationSheet />
      <Avatar className="h-8 w-8">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}
```

- [ ] **Step 3: Buat layout dashboard (dengan sidebar)**

`src/app/(dashboard)/layout.tsx`:
```typescript
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch user info dari database untuk system_role
  // TODO: replace with actual user query
  const user = { systemRole: "super_admin", name: "Admin" };

  return (
    <SidebarProvider>
      <AppSidebar systemRole={user.systemRole} />
      <main className="flex-1">
        <Header userName={user.name} />
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
```

- [ ] **Step 4: Buat layout auth (tanpa sidebar)**

`src/app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/app/ && git commit -m "feat: add shared layout (sidebar + header + auth wrapper)"
```

---

## Task 6: Halaman Login + Register

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/lib/nim-validator/types.ts`
- Create: `src/lib/nim-validator/local.ts`
- Create: `src/actions/auth.ts`

- [ ] **Step 1: Buat halaman login**

`src/app/(auth)/login/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      identifier: form.get("identifier") as string,
      password: form.get("password") as string,
      redirect: false,
    });
    if (result?.error) {
      setError("Email/NIM/NIDN/NIP atau password salah");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Masuk ke SILA</CardTitle>
        <CardDescription>Sistem Informasi Layanan Akademik<br />Fakultas Ushuluddin dan Adab</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email / NIM / NIDN / NIP</Label>
            <Input id="identifier" name="identifier" placeholder="221360001" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Masuk..." : "Masuk"}
          </Button>
          <div className="text-center text-sm">
            <Link href="/lupa-password" className="text-muted-foreground hover:underline">
              Lupa Password?
            </Link>
          </div>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Belum punya akun? </span>
            <Link href="/register" className="text-primary hover:underline">Daftar</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Buat NIM Validator interface**

`src/lib/nim-validator/types.ts`:
```typescript
export interface NimValidationResult {
  valid: boolean;
  nama: string;
  prodi: string;
  angkatan: number;
}

export interface NimValidator {
  validate(nim: string): Promise<NimValidationResult>;
}
```

`src/lib/nim-validator/local.ts`:
```typescript
import { NimValidator, NimValidationResult } from "./types";

const MOCK_DATA: Record<string, Omit<NimValidationResult, "valid">> = {
  "221360001": { nama: "Aini Fitri Utami", prodi: "Ilmu Hadis", angkatan: 2022 },
  "221360002": { nama: "Budi Santoso", prodi: "Ilmu Al-Quran dan Tafsir", angkatan: 2022 },
};

export class LocalNimValidator implements NimValidator {
  async validate(nim: string): Promise<NimValidationResult> {
    const data = MOCK_DATA[nim];
    if (!data) return { valid: false, nama: "", prodi: "", angkatan: 0 };
    return { valid: true, ...data };
  }
}

export const nimValidator: NimValidator = new LocalNimValidator();
```

- [ ] **Step 3: Buat action register**

`src/actions/auth.ts`:
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { nimValidator } from "@/lib/nim-validator/local";
import bcrypt from "bcryptjs";

export async function registerMahasiswa(data: {
  nim: string;
  email: string;
  password: string;
}) {
  const validation = await nimValidator.validate(data.nim);
  if (!validation.valid) {
    return { success: false, error: { code: "ERR_VAL_INVALID_NIM", message: "NIM tidak valid atau tidak terdaftar" } };
  }

  const existingNim = await prisma.mahasiswa.findUnique({ where: { nim: data.nim } });
  if (existingNim) {
    const existingUser = await prisma.user.findFirst({ where: { mahasiswaId: existingNim.id } });
    if (existingUser) {
      return { success: false, error: { code: "ERR_VAL_DUPLICATE", message: "NIM sudah terdaftar" } };
    }
  }

  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) {
    return { success: false, error: { code: "ERR_VAL_DUPLICATE", message: "Email sudah terdaftar" } };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const mahasiswa = await tx.mahasiswa.upsert({
      where: { nim: data.nim },
      update: { namaLengkap: validation.nama },
      create: {
        nim: data.nim,
        namaLengkap: validation.nama,
        prodiId: 1,
        angkatan: validation.angkatan,
        statusMahasiswa: "aktif",
      },
    });

    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        systemRole: "mahasiswa",
        mahasiswaId: mahasiswa.id,
        isActive: true,
      },
    });

    return { mahasiswa, user };
  });

  return { success: true, data: { id: result.user.id } };
}
```

- [ ] **Step 4: Buat halaman register**

`src/app/(auth)/register/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { registerMahasiswa } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"nim" | "form">("nim");
  const [nim, setNim] = useState("");
  const [nimData, setNimData] = useState<{ nama: string; prodi: string; angkatan: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function checkNim(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const { nimValidator } = await import("@/lib/nim-validator/local");
    const result = await nimValidator.validate(nim);
    if (!result.valid) {
      toast.error("NIM tidak valid atau tidak terdaftar");
    } else {
      setNimData(result);
      setStep("form");
    }
    setIsLoading(false);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await registerMahasiswa({
      nim,
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
    if (result.success) {
      toast.success("Pendaftaran berhasil! Silakan login.");
      router.push("/login");
    } else {
      toast.error(result.error?.message);
    }
    setIsLoading(false);
  }

  if (step === "form" && nimData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lengkapi Data</CardTitle>
          <CardDescription>
            {nimData.nama} — {nimData.prodi} — Angkatan {nimData.angkatan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Akun</CardTitle>
        <CardDescription>Masukkan NIM Anda untuk memulai pendaftaran</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={checkNim} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <Input id="nim" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="221360001" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Memeriksa..." : "Lanjutkan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/ src/actions/ src/lib/nim-validator/ && git commit -m "feat: add login + register (NIM-validator based)"
```

---

## Task 7: Empty Halaman Dashboard + Shared Components

**Files:**
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/components/shared/EmptyState.tsx`
- Create: `src/components/shared/LoadingCard.tsx`
- Create: `src/components/layout/NotificationSheet.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Buat utils (cn helper)**

`src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Buat EmptyState**

`src/components/shared/EmptyState.tsx`:
```typescript
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Buat LoadingCard**

`src/components/shared/LoadingCard.tsx`:
```typescript
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Buat NotificationSheet (placeholder)**

`src/components/layout/NotificationSheet.tsx`:
```typescript
"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function NotificationSheet() {
  const unreadCount = 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Notifikasi</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="mb-2 h-8 w-8" />
          <p className="text-sm">Belum ada notifikasi</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 5: Buat halaman dashboard kosong**

`src/app/(dashboard)/dashboard/page.tsx`:
```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Sistem Informasi Layanan Akademik
          Fakultas Ushuluddin dan Adab
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pengajuan Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu Tindakan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selesai Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="Belum ada pengajuan"
        description="Anda dapat mengajukan layanan akademik melalui menu Pengajuan."
      />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/(dashboard)/ src/components/ src/lib/utils.ts && git commit -m "feat: add dashboard shell + shared components (EmptyState, LoadingCard)"
```

---

## Task 8: Storage Service

**Files:**
- Create: `src/lib/storage/types.ts`
- Create: `src/lib/storage/local.ts`
- Create: `storage/` directory

- [ ] **Step 1: Buat interface**

`src/lib/storage/types.ts`:
```typescript
export interface StorageProvider {
  upload(destPath: string, buffer: Buffer, mimeType: string): Promise<string>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
  getServeUrl(filePath: string): string;
}
```

- [ ] **Step 2: Buat LocalStorageProvider**

`src/lib/storage/local.ts`:
```typescript
import fs from "fs/promises";
import path from "path";
import { StorageProvider } from "./types";

const STORAGE_BASE = process.env.STORAGE_PATH || "storage";

export class LocalStorageProvider implements StorageProvider {
  async upload(destPath: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const fullPath = path.join(STORAGE_BASE, destPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return destPath;
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(STORAGE_BASE, filePath);
    return fs.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(STORAGE_BASE, filePath);
    await fs.unlink(fullPath).catch(() => {});
  }

  getServeUrl(filePath: string): string {
    return `/api/files/${filePath}`;
  }
}

export const storage = new LocalStorageProvider();
```

- [ ] **Step 3: Buat direktori storage**

```bash
mkdir -p storage/pengajuan storage/ttd_scan storage/logo storage/temp storage/backups
echo "*" > storage/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/storage/ storage/ && git commit -m "feat: add storage service (local filesystem implementation)"
```

---

## Task 9: Seed Data

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Buat seed data lengkap**

`prisma/seed.ts` — mengacu ke [docs/12_Seed_Data_Workflow.md] dan [docs/07_ERD_Database_Design.md]:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Kode Klasifikasi
  const kk = await prisma.kodeKlasifikasi.createMany({
    data: [
      { kode: "PP.00.9", nama: "Pendidikan dan Pengajaran", deskripsi: "Layanan akademik umum" },
      { kode: "KP.01.2", nama: "Kepegawaian - SK", deskripsi: "SK Pembimbing Skripsi" },
      { kode: "TL.00", nama: "Penelitian", deskripsi: "Pengantar penelitian" },
      { kode: "KS.01", nama: "Kerjasama", deskripsi: "Permohonan magang" },
    ],
  });

  // 2. Fakultas
  const fuda = await prisma.fakultas.create({
    data: { kode: "FUDA", nama: "Fakultas Ushuluddin dan Adab" },
  });

  // 3. Prodi
  const prodiIH = await prisma.prodi.create({
    data: { kode: "IH", nama: "Ilmu Hadis", fakultasId: fuda.id },
  });
  const prodiIAT = await prisma.prodi.create({
    data: { kode: "IAT", nama: "Ilmu Al-Quran dan Tafsir", fakultasId: fuda.id },
  });

  // 4. Academic Period
  const semester = await prisma.academicPeriod.create({
    data: {
      namaSemester: "Ganjil 2025/2026",
      tahunAkademik: "2025/2026",
      tipe: "ganjil",
      tanggalMulai: new Date("2025-08-01"),
      tanggalBerakhir: new Date("2026-01-31"),
      status: "active",
    },
  });

  // 5. Dosen
  const passwordHash = await bcrypt.hash("password123", 12);

  const dosenPA = await prisma.dosen.create({
    data: { nidn: "0115098501", namaLengkap: "Dr. Ahmad Fauzi, M.Pd", isActive: true },
  });
  await prisma.user.create({
    data: { email: "ahmad@uinbanten.ac.id", passwordHash, systemRole: "dosen", dosenId: dosenPA.id, isActive: true },
  });

  const dosenKaprodi = await prisma.dosen.create({
    data: { nidn: "0220077301", namaLengkap: "Prof. Dr. Siti Aminah, M.Ag", isActive: true },
  });
  await prisma.user.create({
    data: { email: "siti@uinbanten.ac.id", passwordHash, systemRole: "dosen", dosenId: dosenKaprodi.id, isActive: true },
  });

  const dosenSekprodi = await prisma.dosen.create({
    data: { nidn: "0315088402", namaLengkap: "Dr. Hasan Basri, M.Si", isActive: true },
  });
  await prisma.user.create({
    data: { email: "hasan@uinbanten.ac.id", passwordHash, systemRole: "dosen", dosenId: dosenSekprodi.id, isActive: true },
  });

  const dosenWD1 = await prisma.dosen.create({
    data: { nidn: "0410067501", namaLengkap: "Dr. H. Ahmad Yani, MA", isActive: true },
  });
  await prisma.user.create({
    data: { email: "yani@uinbanten.ac.id", passwordHash, systemRole: "dosen", dosenId: dosenWD1.id, isActive: true },
  });

  const dosenDekan = await prisma.dosen.create({
    data: { nidn: "0505066001", namaLengkap: "Prof. Dr. H. Masrukhin Muhsin, Lc., MA", isActive: true },
  });
  await prisma.user.create({
    data: { email: "dekan@uinbanten.ac.id", passwordHash, systemRole: "dosen", dosenId: dosenDekan.id, isActive: true },
  });

  const dosenKalab = await prisma.dosen.create({
    data: { nidn: "0610088901", namaLengkap: "Dr. Hamdan, M.Kom", isActive: true },
  });
  await prisma.user.create({
    data: { email: "hamdan@uinbanten.ac.id", passwordHash, systemRole: "dosen", dosenId: dosenKalab.id, isActive: true },
  });

  // 6. Pegawai
  const staffProdi = await prisma.pegawai.create({
    data: { nip: "198001012010011001", namaLengkap: "Budi Santoso, S.Kom", isActive: true },
  });
  await prisma.user.create({
    data: { email: "budi@uinbanten.ac.id", passwordHash, systemRole: "staff_prodi", pegawaiId: staffProdi.id, isActive: true },
  });

  const staffAkad = await prisma.pegawai.create({
    data: { nip: "198102022010012002", namaLengkap: "Siti Maryam, A.Md", isActive: true },
  });
  await prisma.user.create({
    data: { email: "maryam@uinbanten.ac.id", passwordHash, systemRole: "staff_akademik", pegawaiId: staffAkad.id, isActive: true },
  });

  const kabag = await prisma.pegawai.create({
    data: { nip: "197503032008011001", namaLengkap: "Drs. Abdul Karim", isActive: true },
  });
  await prisma.user.create({
    data: { email: "karim@uinbanten.ac.id", passwordHash, systemRole: "kabag", pegawaiId: kabag.id, isActive: true },
  });

  // 7. Mahasiswa
  const mhs = await prisma.mahasiswa.create({
    data: { nim: "221360001", namaLengkap: "Aini Fitri Utami", prodiId: prodiIH.id, angkatan: 2022, semesterAktif: 7, statusMahasiswa: "aktif" },
  });
  await prisma.user.create({
    data: { email: "aini@student.uinbanten.ac.id", passwordHash, systemRole: "mahasiswa", mahasiswaId: mhs.id, isActive: true },
  });

  // 8. Structural Positions
  const now = new Date();
  await prisma.structuralPosition.createMany({
    data: [
      { positionCode: "kaprodi", dosenId: dosenKaprodi.id, prodiId: prodiIH.id, startDate: now, isActive: true },
      { positionCode: "sekprodi", dosenId: dosenSekprodi.id, prodiId: prodiIH.id, startDate: now, isActive: true },
      { positionCode: "wakil_dekan_1", dosenId: dosenWD1.id, startDate: now, isActive: true },
      { positionCode: "dekan", dosenId: dosenDekan.id, startDate: now, isActive: true },
      { positionCode: "kepala_lab", dosenId: dosenKalab.id, startDate: now, isActive: true },
      { positionCode: "kabag_tu", pegawaiId: kabag.id, startDate: now, isActive: true },
    ],
  });

  // 9. Assignment (PA untuk mahasiswa)
  await prisma.assignment.create({
    data: { assignmentType: "dosen_pa", dosenId: dosenPA.id, mahasiswaId: mhs.id, isActive: true },
  });

  // 10. Jenis Layanan & Workflow
  // TA services
  const kkPP = await prisma.kodeKlasifikasi.findFirst({ where: { kode: "PP.00.9" } })!;
  const kkKP = await prisma.kodeKlasifikasi.findFirst({ where: { kode: "KP.01.2" } })!;
  const kkTL = await prisma.kodeKlasifikasi.findFirst({ where: { kode: "TL.00" } })!;
  const kkKS = await prisma.kodeKlasifikasi.findFirst({ where: { kode: "KS.01" } })!;

  const layananTA = [
    { kode: "TA-01", nama: "Pengajuan Judul Skripsi", kategori: "tugas_akhir" as const, kodeKlasifikasiId: kkPP.id, templateKode: "persetujuan_judul" },
    { kode: "TA-02", nama: "SK Pembimbing Skripsi", kategori: "tugas_akhir" as const, kodeKlasifikasiId: kkKP.id, templateKode: "sk_pembimbing" },
    { kode: "TA-03", nama: "Seminar Proposal Skripsi", kategori: "tugas_akhir" as const, kodeKlasifikasiId: kkPP.id, templateKode: "seminar_proposal" },
    { kode: "TA-04", nama: "Ujian Komprehensif", kategori: "tugas_akhir" as const, kodeKlasifikasiId: kkPP.id, templateKode: "ujian_komprehensif" },
    { kode: "TA-05", nama: "Ujian Skripsi (Munaqasyah)", kategori: "tugas_akhir" as const, kodeKlasifikasiId: kkPP.id, templateKode: "ujian_skripsi" },
    { kode: "TA-06", nama: "Cek Turnitin", kategori: "tugas_akhir" as const, kodeKlasifikasiId: kkPP.id, templateKode: "cek_turnitin" },
  ];

  const layananAK = [
    { kode: "AK-01", nama: "Surat Keterangan Aktif Kuliah", kategori: "akademik" as const, kodeKlasifikasiId: kkPP.id, templateKode: "aktif_kuliah" },
    { kode: "AK-02", nama: "Surat Keterangan Masih Kuliah (PNS)", kategori: "akademik" as const, kodeKlasifikasiId: kkPP.id, templateKode: "masih_kuliah" },
    { kode: "AK-03", nama: "Surat Keterangan Pernah Kuliah", kategori: "akademik" as const, kodeKlasifikasiId: kkPP.id, templateKode: "pernah_kuliah" },
    { kode: "AK-04", nama: "Surat Pengantar Observasi", kategori: "akademik" as const, kodeKlasifikasiId: kkPP.id, templateKode: "pengantar_observasi" },
    { kode: "AK-05", nama: "Surat Pengantar Penelitian", kategori: "akademik" as const, kodeKlasifikasiId: kkTL.id, templateKode: "pengantar_penelitian" },
    { kode: "AK-06", nama: "Surat Permohonan Magang", kategori: "akademik" as const, kodeKlasifikasiId: kkKS.id, templateKode: "permohonan_magang" },
    { kode: "AK-07", nama: "Surat Rekomendasi", kategori: "akademik" as const, kodeKlasifikasiId: kkPP.id, templateKode: "rekomendasi" },
  ];

  for (const l of [...layananTA, ...layananAK]) {
    await prisma.jenisLayanan.create({
      data: {
        kode: l.kode,
        nama: l.nama,
        kategori: l.kategori,
        scopeLevel: l.kode.startsWith("TA-") ? "prodi" : "fakultas",
        kodeKlasifikasiId: l.kodeKlasifikasiId,
        templateKode: l.templateKode,
      },
    });
  }

  // 11. Workflow Definitions
  // Use data from docs/12_Seed_Data_Workflow.md
  // ... (detailed workflow seed — implement full seed in follow-up task)

  console.log("Seed completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

- [ ] **Step 2: Update package.json seed script**

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Install tsx dan jalankan seed**

```bash
npm install -D tsx
npx prisma db seed
```

- [ ] **Step 4: Verifikasi data**

```bash
npx prisma studio
```
Buka di browser, periksa data di semua tabel.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json && git commit -m "feat: add complete seed data (dummy users, layanan, akademik period)"
```

---

## Task 10: Workflow Seed Detail (13 Layanan)

**Files:**
- Modify: `prisma/seed.ts` (tambahkan workflow seed)

- [ ] **Step 1: Tambahkan seed workflow lengkap dari [SEED]**

Tambahkan kode berikut setelah bagian Jenis Layanan di `prisma/seed.ts`:

```typescript
// --- WORKFLOW DEFINITIONS ---
async function createWorkflows() {
  const allLayanan = await prisma.jenisLayanan.findMany();

  // Helper: TA-01 Workflow
  const ta01 = allLayanan.find((l) => l.kode === "TA-01")!;
  await prisma.workflowDefinition.create({
    data: {
      jenisLayananId: ta01.id, versi: 1, isActive: true,
      steps: {
        create: [
          {
            stepCode: "TA01-02", stepOrder: 1, statusCode: "pending_staff_prodi",
            actorType: "staff_prodi", actorCondition: { prodiMatch: true },
            slaDays: 2, slaConsequence: "reminder",
            actions: {
              create: [
                { actionCode: "approve", targetStatus: "pending_pa", requiresReason: false, requiresConfirmation: false, label: "Setujui & Teruskan ke PA" },
                { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak (Kembalikan ke Mahasiswa)" },
              ],
            },
          },
          {
            stepCode: "TA01-03", stepOrder: 2, statusCode: "pending_pa",
            actorType: "dosen_pa", actorCondition: { checkAssignment: "dosen_pa" },
            slaDays: 7, slaConsequence: "bypass",
            actions: {
              create: [
                { actionCode: "select_judul", targetStatus: "pending_kaprodi", requiresReason: false, requiresConfirmation: false, label: "Pilih Judul & Lanjutkan" },
                { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak Semua Judul" },
              ],
            },
          },
          {
            stepCode: "TA01-04", stepOrder: 3, statusCode: "pending_kaprodi",
            actorType: "kaprodi", actorCondition: { checkStructuralPosition: "kaprodi", prodiMatch: true },
            slaDays: 3, slaConsequence: "reminder",
            actions: {
              create: [
                { actionCode: "approve", targetStatus: "pending_wd1", requiresReason: false, requiresConfirmation: false, label: "Setujui & Teruskan ke WD1" },
                { actionCode: "reject_to_step", targetStatus: "pending_pa", requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke PA" },
                { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke Mahasiswa" },
              ],
            },
          },
          {
            stepCode: "TA01-05", stepOrder: 4, statusCode: "pending_wd1",
            actorType: "wakil_dekan_1", actorCondition: { checkStructuralPosition: "wakil_dekan_1" },
            slaDays: 3, slaConsequence: "reminder",
            actions: {
              create: [
                { actionCode: "sign", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Tanda Tangan & Terbitkan" },
                { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...",
                  actionConfig: { allowTarget: ["pending_staff_prodi", "pending_pa", "pending_kaprodi"] } },
              ],
            },
          },
        ],
      },
    },
  });

  // TA-02 (4 steps: staff → sekprodi → wd1 → dekan)
  const ta02 = allLayanan.find((l) => l.kode === "TA-02")!;
  await prisma.workflowDefinition.create({
    data: {
      jenisLayananId: ta02.id, versi: 1, isActive: true,
      steps: {
        create: [
          { stepCode: "TA02-02", stepOrder: 1, statusCode: "pending_staff_prodi", actorType: "staff_prodi", actorCondition: { prodiMatch: true }, slaDays: 2, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_sekprodi", requiresReason: false, requiresConfirmation: false, label: "Setujui" },
              { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak" },
            ]},
          },
          { stepCode: "TA02-03", stepOrder: 2, statusCode: "pending_sekprodi", actorType: "sekprodi", actorCondition: { checkStructuralPosition: "sekprodi", prodiMatch: true }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_wd1", requiresReason: false, requiresConfirmation: false, label: "Tetapkan Pembimbing & Lanjut" },
              { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak" },
            ]},
          },
          { stepCode: "TA02-04", stepOrder: 3, statusCode: "pending_wd1", actorType: "wakil_dekan_1", actorCondition: { checkStructuralPosition: "wakil_dekan_1" }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_dekan", requiresReason: false, requiresConfirmation: false, label: "Setujui" },
              { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
            ]},
          },
          { stepCode: "TA02-05", stepOrder: 4, statusCode: "pending_dekan", actorType: "dekan", actorCondition: { checkStructuralPosition: "dekan" }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "sign", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Tanda Tangan & Terbitkan SK" },
              { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi", "pending_wd1"] } },
            ]},
          },
        ],
      },
    },
  });

  // TA-03 (3 steps: staff → sekprodi → wd1)
  const ta03 = allLayanan.find((l) => l.kode === "TA-03")!;
  await prisma.workflowDefinition.create({
    data: {
      jenisLayananId: ta03.id, versi: 1, isActive: true,
      steps: {
        create: [
          { stepCode: "TA03-02", stepOrder: 1, statusCode: "pending_staff_prodi", actorType: "staff_prodi", actorCondition: { prodiMatch: true }, slaDays: 2, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_sekprodi", requiresReason: false, requiresConfirmation: false, label: "Verifikasi & Simpan Jadwal" },
              { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak" },
            ]},
          },
          { stepCode: "TA03-03", stepOrder: 2, statusCode: "pending_sekprodi", actorType: "sekprodi", actorCondition: { checkStructuralPosition: "sekprodi", prodiMatch: true }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_wd1", requiresReason: false, requiresConfirmation: false, label: "Tetapkan Penguji & Lanjut" },
              { actionCode: "reject_to_step", targetStatus: "pending_staff_prodi", requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke Staff Prodi" },
            ]},
          },
          { stepCode: "TA03-04", stepOrder: 3, statusCode: "pending_wd1", actorType: "wakil_dekan_1", actorCondition: { checkStructuralPosition: "wakil_dekan_1" }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "sign", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Tanda Tangan & Terbitkan Surat Tugas" },
              { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
            ]},
          },
        ],
      },
    },
  });

  // TA-04 (same pattern as TA-03)
  const ta04 = allLayanan.find((l) => l.kode === "TA-04")!;
  await prisma.workflowDefinition.create({
    data: {
      jenisLayananId: ta04.id, versi: 1, isActive: true,
      steps: {
        create: [
          { stepCode: "TA04-02", stepOrder: 1, statusCode: "pending_staff_prodi", actorType: "staff_prodi", actorCondition: { prodiMatch: true }, slaDays: 2, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_sekprodi", requiresReason: false, requiresConfirmation: false, label: "Verifikasi & Simpan Jadwal" },
              { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak" },
            ]},
          },
          { stepCode: "TA04-03", stepOrder: 2, statusCode: "pending_sekprodi", actorType: "sekprodi", actorCondition: { checkStructuralPosition: "sekprodi", prodiMatch: true }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_wd1", requiresReason: false, requiresConfirmation: false, label: "Tetapkan Penguji & Lanjut" },
              { actionCode: "reject_to_step", targetStatus: "pending_staff_prodi", requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke Staff Prodi" },
            ]},
          },
          { stepCode: "TA04-04", stepOrder: 3, statusCode: "pending_wd1", actorType: "wakil_dekan_1", actorCondition: { checkStructuralPosition: "wakil_dekan_1" }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "sign", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Tanda Tangan & Terbitkan Surat Tugas" },
              { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
            ]},
          },
        ],
      },
    },
  });

  // TA-05 (4 steps: staff → sekprodi → wd1 → dekan)
  const ta05 = allLayanan.find((l) => l.kode === "TA-05")!;
  await prisma.workflowDefinition.create({
    data: {
      jenisLayananId: ta05.id, versi: 1, isActive: true,
      steps: {
        create: [
          { stepCode: "TA05-02", stepOrder: 1, statusCode: "pending_staff_prodi", actorType: "staff_prodi", actorCondition: { prodiMatch: true }, slaDays: 2, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_sekprodi", requiresReason: false, requiresConfirmation: false, label: "Verifikasi Berkas" },
              { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak" },
            ]},
          },
          { stepCode: "TA05-03", stepOrder: 2, statusCode: "pending_sekprodi", actorType: "sekprodi", actorCondition: { checkStructuralPosition: "sekprodi", prodiMatch: true }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_wd1", requiresReason: false, requiresConfirmation: false, label: "Tetapkan Jadwal & Majelis" },
              { actionCode: "reject_to_step", targetStatus: "pending_staff_prodi", requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke Staff Prodi" },
            ]},
          },
          { stepCode: "TA05-04", stepOrder: 3, statusCode: "pending_wd1", actorType: "wakil_dekan_1", actorCondition: { checkStructuralPosition: "wakil_dekan_1" }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "pending_dekan", requiresReason: false, requiresConfirmation: false, label: "Setujui" },
              { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi"] } },
            ]},
          },
          { stepCode: "TA05-05", stepOrder: 4, statusCode: "pending_dekan", actorType: "dekan", actorCondition: { checkStructuralPosition: "dekan" }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "sign", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Tanda Tangan & Terbitkan" },
              { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_prodi", "pending_sekprodi", "pending_wd1"] } },
            ]},
          },
        ],
      },
    },
  });

  // TA-06 (1 step: kepala lab)
  const ta06 = allLayanan.find((l) => l.kode === "TA-06")!;
  await prisma.workflowDefinition.create({
    data: {
      jenisLayananId: ta06.id, versi: 1, isActive: true,
      steps: {
        create: [
          { stepCode: "TA06-02", stepOrder: 1, statusCode: "pending_kepala_lab", actorType: "kepala_lab", actorCondition: { checkStructuralPosition: "kepala_lab" }, slaDays: 3, slaConsequence: "reminder",
            actions: { create: [
              { actionCode: "approve", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Setujui & Terbitkan Sertifikat" },
              { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak (Perlu Revisi)" },
            ]},
          },
        ],
      },
    },
  });

  // AK services: 2 templates — TTD WD1 or TTD Dekan
  const akWd1Codes = ["AK-01", "AK-02", "AK-04", "AK-05"];
  const akDekanCodes = ["AK-03", "AK-06", "AK-07"];

  for (const kode of akWd1Codes) {
    const l = allLayanan.find((x) => x.kode === kode)!;
    await prisma.workflowDefinition.create({
      data: {
        jenisLayananId: l.id, versi: 1, isActive: true,
        steps: {
          create: [
            { stepCode: `${kode.replace("-","")}-02`, stepOrder: 1, statusCode: "pending_staff_akademik", actorType: "staff_akademik", slaDays: 2, slaConsequence: "reminder",
              actions: { create: [
                { actionCode: "approve", targetStatus: "pending_kabag", requiresReason: false, requiresConfirmation: false, label: "Verifikasi & Setujui" },
                { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak" },
              ]},
            },
            { stepCode: `${kode.replace("-","")}-03`, stepOrder: 2, statusCode: "pending_kabag", actorType: "kabag", actorCondition: { checkStructuralPosition: "kabag_tu" }, slaDays: 2, slaConsequence: "reminder",
              actions: { create: [
                { actionCode: "approve", targetStatus: "pending_wd1", requiresReason: false, requiresConfirmation: false, label: "Setujui" },
                { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_akademik"] } },
              ]},
            },
            { stepCode: `${kode.replace("-","")}-04`, stepOrder: 3, statusCode: "pending_wd1", actorType: "wakil_dekan_1", actorCondition: { checkStructuralPosition: "wakil_dekan_1" }, slaDays: 2, slaConsequence: "reminder",
              actions: { create: [
                { actionCode: "sign", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Tanda Tangan & Terbitkan" },
                { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_akademik", "pending_kabag"] } },
              ]},
            },
          ],
        },
      },
    });
  }

  for (const kode of akDekanCodes) {
    const l = allLayanan.find((x) => x.kode === kode)!;
    await prisma.workflowDefinition.create({
      data: {
        jenisLayananId: l.id, versi: 1, isActive: true,
        steps: {
          create: [
            { stepCode: `${kode.replace("-","")}-02`, stepOrder: 1, statusCode: "pending_staff_akademik", actorType: "staff_akademik", slaDays: 2, slaConsequence: "reminder",
              actions: { create: [
                { actionCode: "approve", targetStatus: "pending_kabag", requiresReason: false, requiresConfirmation: false, label: "Verifikasi & Setujui" },
                { actionCode: "reject_to_submitter", targetStatus: "revision_required", requiresReason: true, requiresConfirmation: true, label: "Tolak" },
              ]},
            },
            { stepCode: `${kode.replace("-","")}-03`, stepOrder: 2, statusCode: "pending_kabag", actorType: "kabag", actorCondition: { checkStructuralPosition: "kabag_tu" }, slaDays: 2, slaConsequence: "reminder",
              actions: { create: [
                { actionCode: "approve", targetStatus: "pending_dekan", requiresReason: false, requiresConfirmation: false, label: "Setujui" },
                { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_akademik"] } },
              ]},
            },
            { stepCode: `${kode.replace("-","")}-04`, stepOrder: 3, statusCode: "pending_dekan", actorType: "dekan", actorCondition: { checkStructuralPosition: "dekan" }, slaDays: 2, slaConsequence: "reminder",
              actions: { create: [
                { actionCode: "sign", targetStatus: "selesai", requiresReason: false, requiresConfirmation: true, label: "Tanda Tangan & Terbitkan" },
                { actionCode: "reject_to_step", targetStatus: null, requiresReason: true, requiresConfirmation: true, label: "Kembalikan ke...", actionConfig: { allowTarget: ["pending_staff_akademik", "pending_kabag"] } },
              ]},
            },
          ],
        },
      },
    });
  }
}

await createWorkflows();
```

- [ ] **Step 2: Jalankan ulang seed**

```bash
npx prisma db seed
```

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts && git commit -m "feat: add complete workflow seed for all 13 layanan"
```

---

## Task 11: Verifikasi End-to-End

- [ ] **Step 1: Jalankan dev server**

```bash
npm run dev
```

- [ ] **Step 2: Buka `http://localhost:3000`**

Verifikasi:
- [ ] Redirect ke `/login`
- [ ] Login dengan `aini@student.uinbanten.ac.id` / `password123` → masuk ke dashboard
- [ ] Dashboard menampilkan stat cards + empty state
- [ ] Sidebar menampilkan menu yang sesuai
- [ ] Logout → kembali ke login
- [ ] Register dengan NIM `221360001` → gagal (sudah terdaftar)
- [ ] Register dengan NIM `221360002` → sukses → redirect ke login → login

- [ ] **Step 3: Commit (jika ada perbaikan)**

```bash
git add -A && git commit -m "fix: final adjustments after phase 1 verification"
```

---

## Fase 1 Complete

Setelah semua 11 task selesai, sistem sudah:
- Database 32 tabel siap
- 13 workflow definitions ter-seed
- Dummy users untuk semua role
- Auth.js v5 berjalan (login/logout/session)
- Self-registration mahasiswa via NIM validator
- Dashboard dengan sidebar + header + shared components
- Storage service ready
