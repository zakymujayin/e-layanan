# Dokumen Konvensi & Glossary SILA — Batch 3

**Sistem**: SILA — Fakultas Ushuluddin dan Adab, UIN SMH Banten
**Cakupan Batch 3**: Bagian 8 (UI Component & Behavior), Bagian 9 (Auth & Authorization), Bagian 10 (Acceptance Criteria Template)
**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## ⚠️ Status Dokumen

- ✅ **Batch 1**: Bagian 1-3 — Fondasi Terminologi (selesai)
- ✅ **Batch 2**: Bagian 4-7 — Konvensi Teknis (selesai)
- ✅ **Batch 3** (dokumen ini): Bagian 8-10 — UI & Acceptance
- ⏳ **Batch 4**: Bagian 11-15 — Tata Kelola Agent

---

## Tech Stack Final (Verified Mei 2026)

Sebelum masuk konvensi, ini tech stack final yang sudah diverifikasi versinya:

| Komponen | Versi | Catatan |
|---|---|---|
| **Next.js** | 16.2.x | App Router, React Server Components, Server Actions |
| **React** | 19.2 | React Compiler stable (auto-memoization) |
| **TypeScript** | 5.x latest | Strict mode |
| **shadcn/ui** | latest (`npx shadcn@latest`) | Style: `new-york`, full Tailwind v4 + React 19 support |
| **Tailwind CSS** | v4 | `@theme` directive, OKLCH colors, `@tailwindcss/vite` atau PostCSS |
| **ORM** | Prisma atau Drizzle (latest) | Keputusan final di dokumen ERD |
| **Database** | PostgreSQL 16+ | Mendukung RLS native jika dibutuhkan |
| **Date library** | date-fns v4 atau dayjs | Locale `id` |
| **Validation** | Zod v4 | Schema validation |
| **Auth** | Auth.js v5 (NextAuth) atau Lucia | Keputusan di Bagian 9 |

> **Catatan untuk AI Agent**: Saat scaffolding, gunakan `npx create-next-app@latest` lalu `npx shadcn@latest init`. Pilih style `new-york`. Jangan pakai `@canary` lagi karena Tailwind v4 + React 19 sudah masuk stable release shadcn.

---

# Bagian 8: UI Component & Behavior Convention

## 8.1 Prinsip Dasar UI

1. **Konsistensi**: Pakai komponen shadcn/ui sebagai basis, jangan buat komponen custom yang duplikat fungsi
2. **Accessibility**: Semua komponen harus accessible (ARIA labels, keyboard navigation) — shadcn/ui sudah handle ini via Radix UI
3. **Responsive**: Mobile-first, tapi prioritas desktop untuk Phase 1 (kebanyakan staff pakai desktop)
4. **Bahasa Indonesia**: Semua text UI dalam Bahasa Indonesia
5. **Own the code**: shadcn/ui di-copy ke project (`components/ui/`), bukan di-import dari npm — kita bisa modifikasi sesuai kebutuhan

## 8.2 Komponen shadcn/ui yang Dipakai

shadcn/ui bukan library yang di-install, tapi komponen yang di-copy ke `components/ui/` via CLI. Berikut komponen yang akan dipakai di SILA:

### 8.2.1 Form & Input

| Komponen | shadcn CLI | Penggunaan di SILA |
|---|---|---|
| Button | `npx shadcn@latest add button` | Semua action (submit, approve, dll) |
| Input | `add input` | Text field |
| Textarea | `add textarea` | Field panjang (judul, alasan) |
| Select | `add select` | Dropdown (pilih dosen, prodi, dll) |
| Checkbox | `add checkbox` | Multi-pilihan |
| Radio Group | `add radio-group` | Pilih 1 (PA pilih judul) |
| Label | `add label` | Label field |
| Form | `add form` | Form wrapper (dengan react-hook-form + zod) |
| Calendar | `add calendar` | Date picker base |
| Date Picker | (composed) | Penjadwalan sidang |
| Input OTP | `add input-otp` | PIN konfirmasi TTD |

### 8.2.2 Layout & Navigation

| Komponen | shadcn CLI | Penggunaan |
|---|---|---|
| Sidebar | `add sidebar` | Navigasi utama dashboard |
| Navigation Menu | `add navigation-menu` | Menu navigasi |
| Tabs | `add tabs` | Tab di halaman (mis. filter arsip per role) |
| Breadcrumb | `add breadcrumb` | Navigasi hierarki |
| Separator | `add separator` | Pemisah visual |
| Scroll Area | `add scroll-area` | Area scroll terbatas |

### 8.2.3 Feedback & Overlay

| Komponen | shadcn CLI | Penggunaan |
|---|---|---|
| Dialog | `add dialog` | Modal konfirmasi, form popup |
| Alert Dialog | `add alert-dialog` | Konfirmasi destructive action |
| Sheet | `add sheet` | Drawer (notifikasi slider) |
| Sonner | `add sonner` | Toast notification (pengganti toast lama) |
| Alert | `add alert` | Inline alert (info/warning/error) |
| Tooltip | `add tooltip` | Penjelasan singkat |
| Popover | `add popover` | Popup kecil |
| Progress | `add progress` | Progress bar tracking pengajuan |
| Skeleton | `add skeleton` | Loading state |
| Badge | `add badge` | Status badge, context badge multi-hat |

### 8.2.4 Data Display

| Komponen | shadcn CLI | Penggunaan |
|---|---|---|
| Table | `add table` | List pengajuan, arsip |
| Data Table | (composed dengan TanStack Table) | Tabel dengan sort/filter/pagination |
| Card | `add card` | Stat card dashboard, item pengajuan |
| Avatar | `add avatar` | Foto profil user |
| Accordion | `add accordion` | Collapsible content |

> **Catatan deprecation**: Komponen `toast` lama sudah deprecated di shadcn, gunakan **Sonner** untuk toast notification.

## 8.3 Tailwind v4 Theming

### 8.3.1 Konfigurasi Theme

Tailwind v4 pakai **`@theme` directive** di CSS, bukan `tailwind.config.js`. Warna pakai **OKLCH**.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Warna brand UIN SMH Banten (sesuaikan dengan brand guideline) */
  --color-primary: oklch(0.45 0.15 250);     /* contoh: biru tua */
  --color-secondary: oklch(0.65 0.12 145);   /* contoh: hijau */

  /* shadcn/ui akan inject variabel-nya sendiri */
}
```

### 8.3.2 Aturan Warna

| Token | Penggunaan |
|---|---|
| `primary` | Action utama (submit, approve) |
| `secondary` | Action sekunder |
| `destructive` | Action berbahaya (reject, terminate, delete) |
| `muted` | Background, teks sekunder |
| `accent` | Highlight |

### 8.3.3 Warna Semantik untuk Status

Mapping warna untuk status pengajuan & badge (konsisten di seluruh app):

| Konteks | Warna | Contoh Penggunaan |
|---|---|---|
| Status menunggu | Amber/Kuning | Badge "Menunggu Kaprodi" |
| Status sukses/selesai | Hijau | Badge "Selesai" |
| Status ditolak/revisi | Merah | Badge "Perlu Revisi" |
| Status info/proses | Biru | Badge "Diajukan" |
| Role struktural (badge multi-hat) | Ungu | Badge "SEBAGAI KAPRODI" |
| Role akademik (badge multi-hat) | Teal | Badge "SEBAGAI PA" |
| Role situasional (badge multi-hat) | Pink | Badge "SEBAGAI PENGUJI" |
| Placeholder dokumen (live preview) | Kuning | Highlight nomor/QR/TTD belum final |

## 8.4 Loading State

### 8.4.1 Aturan

| Konteks | Komponen | Pattern |
|---|---|---|
| Load data halaman | Skeleton | Tampilkan skeleton sesuai bentuk konten |
| Submit/action | Button loading | Disable button + spinner di dalam button |
| Load data tabel | Skeleton rows | Skeleton untuk N baris |
| Background fetch | (no blocking) | Tampilkan data lama + indikator kecil |

### 8.4.2 Contoh Button Loading

```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Menyimpan..." : "Simpan"}
</Button>
```

## 8.5 Error State

Mengacu ke Bagian 4 (Error Handling). Recap untuk UI:

| Jenis Error | Komponen UI |
|---|---|
| Validation error (field) | Inline text merah di bawah field (via Form component) |
| Action error | Sonner toast (merah) |
| Critical error | Dialog/Alert Dialog |
| Page error (404/500) | Halaman error khusus |

## 8.6 Empty State

Saat tidak ada data, tampilkan **empty state** yang informatif, bukan halaman kosong.

```tsx
<EmptyState
  icon={<InboxIcon />}
  title="Belum ada pengajuan"
  description="Anda belum memiliki pengajuan layanan. Mulai dengan mengajukan layanan baru."
  action={<Button>Ajukan Layanan</Button>}
/>
```

**Aturan**: Setiap list/tabel WAJIB punya empty state.

## 8.7 Confirmation Dialog

Untuk **destructive action** (reject, terminate, delete), WAJIB pakai Alert Dialog konfirmasi.

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Tolak Pengajuan</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tolak pengajuan ini?</AlertDialogTitle>
      <AlertDialogDescription>
        Anda akan menolak pengajuan ini. Mohon isi alasan penolakan.
        Tindakan ini akan mengembalikan pengajuan ke mahasiswa.
      </AlertDialogDescription>
    </AlertDialogHeader>
    {/* Textarea alasan wajib */}
    <AlertDialogFooter>
      <AlertDialogCancel>Batal</AlertDialogCancel>
      <AlertDialogAction>Tolak</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Aturan**: Action yang mengubah state secara permanen/sulit di-undo WAJIB konfirmasi.

## 8.8 Form Behavior

### 8.8.1 Stack Form

- **react-hook-form** untuk state management form
- **Zod** untuk validation schema
- **shadcn Form** component sebagai wrapper

### 8.8.2 Validation Timing

| Event | Behavior |
|---|---|
| On blur | Validate field yang baru ditinggalkan |
| On submit | Validate semua field |
| On change (setelah error) | Re-validate field yang sedang diperbaiki |

### 8.8.3 Pattern

```tsx
const formSchema = z.object({
  judul1: z.string().min(1, "Judul 1 wajib diisi"),
  judul2: z.string().min(1, "Judul 2 wajib diisi"),
  judul3: z.string().min(1, "Judul 3 wajib diisi"),
  pembimbingAkademikId: z.number({ required_error: "Pilih Pembimbing Akademik" })
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema)
});
```

## 8.9 Responsive Behavior

### 8.9.1 Breakpoints (Tailwind default)

| Breakpoint | Min Width | Target |
|---|---|---|
| (default) | 0 | Mobile |
| `sm` | 640px | Mobile besar |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop besar |

### 8.9.2 Aturan Phase 1

- **Desktop-first prioritas** (staff & approver banyak pakai desktop)
- **Mobile harus tetap functional** (mahasiswa banyak pakai HP)
- Sidebar collapse jadi hamburger menu di mobile
- Tabel besar bisa horizontal scroll di mobile (atau card view)

## 8.10 Dashboard Layout

### 8.10.1 Struktur

```
┌────────────────────────────────────────────────┐
│ Header (logo, search, notif bell, profile)     │
├──────────┬─────────────────────────────────────┤
│          │                                     │
│ Sidebar  │  Main Content Area                  │
│ (menu    │  - Stat cards (max 4)               │
│  per     │  - List/detail content              │
│  role)   │                                     │
│          │                                     │
└──────────┴─────────────────────────────────────┘
```

### 8.10.2 Komponen Header

- Logo fakultas (kiri)
- Search global (tengah)
- Notification bell dengan badge unread (kanan)
- Avatar + dropdown profile (kanan)

### 8.10.3 Notifikasi Drawer (Sheet)

Klik bell → buka **Sheet** dari kanan:
- List notifikasi (terbaru di atas)
- Tombol "Mark all as read"
- Tombol "Clear all"
- Filter: Semua / Belum dibaca

## 8.11 Icon Convention

- **Library**: `lucide-react` (default shadcn/ui)
- **Ukuran standar**: 16px (`h-4 w-4`) untuk inline, 20px (`h-5 w-5`) untuk button, 24px (`h-6 w-6`) untuk header
- **Jangan** mix icon library lain

## 8.12 AI Agent Rules untuk UI

1. **WAJIB** pakai komponen shadcn/ui via CLI, jangan buat dari nol
2. **WAJIB** copy komponen ke `components/ui/`, jangan import dari npm package
3. **WAJIB** pakai Sonner untuk toast (bukan toast lama yang deprecated)
4. **WAJIB** pakai lucide-react untuk icon
5. **WAJIB** semua text UI dalam Bahasa Indonesia
6. **WAJIB** confirmation dialog untuk destructive action
7. **WAJIB** empty state untuk setiap list/tabel
8. **WAJIB** loading state untuk setiap async action
9. **JANGAN** pakai warna hardcoded, pakai theme token
10. **WAJIB** pakai warna semantik status sesuai Section 8.3.3

---

# Bagian 9: Authentication & Authorization Convention

## 9.1 Authentication Strategy

### 9.1.1 Pilihan Library

**Pilihan SILA**: **Auth.js v5 (NextAuth)** dengan Credentials Provider.

**Alasan**:
- Native integration dengan Next.js App Router
- Mature, well-documented
- Support session management built-in
- Mudah extend ke OAuth nanti (mis. login dengan akun kampus/Google Workspace)

**Alternatif** (jika butuh kontrol lebih): **Lucia Auth** — lebih lightweight, full control.

### 9.1.2 Login Method

**Phase 1**: Email/Username + Password (Credentials Provider)

- Mahasiswa login dengan: NIM atau email
- Dosen login dengan: NIDN atau email
- Pegawai login dengan: NIP atau email

**Phase 2+**: SSO dengan akun kampus (jika ada Identity Provider kampus)

### 9.1.3 Password Security

- **Hashing**: bcrypt (cost factor 12) atau argon2
- **Minimum length**: 8 karakter
- **Tidak ada complexity requirement berlebihan** (sesuai NIST modern guidance)
- **Reset password**: via email token (expire 1 jam)

### 9.1.4 Session Management

**Strategy**: Database session (bukan JWT) untuk Phase 1.

**Alasan memilih database session**:
- Bisa **revoke session** kapan saja (penting untuk keamanan)
- Bisa lihat active sessions
- Tidak ada masalah token besar di cookie

**Konfigurasi**:
- Session expiry: 7 hari (rolling)
- Idle timeout: 2 jam (auto logout jika tidak ada aktivitas)
- "Remember me": extend ke 30 hari

### 9.1.5 Tabel Session

```
sessions
  - id
  - user_id (FK)
  - token (hashed)
  - expires_at
  - created_at
  - ip_address
  - user_agent
  - last_active_at
```

## 9.2 Authorization Model

Mengacu ke dokumen 01 Section 3 (Model Otorisasi). Recap implementasi:

### 9.2.1 Tiga Lapis Authorization Check

```
1. Authentication: apakah user login? (session valid?)
2. Role check (RBAC): apakah role user boleh akses fitur ini?
3. Scope check (RLS): apakah resource dalam scope user?
4. Assignment check (ReBAC): apakah user punya assignment yang dibutuhkan?
```

### 9.2.2 Authorization Check Pattern

**Server-side (WAJIB)**: Cek di setiap Server Action / API Route.

```typescript
// lib/auth/check.ts

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new AuthError("ERR_AUTH_NOT_AUTHENTICATED");
  }
  return session.user;
}

export async function requireRole(user: User, ...allowedRoles: SystemRoleType[]) {
  if (!allowedRoles.includes(user.systemRole)) {
    throw new AuthError("ERR_AUTH_INSUFFICIENT_ROLE");
  }
}

export async function requireScope(user: User, resource: { fakultasId: number; prodiId?: number }) {
  const scope = getAccessibleScope(user);
  if (!isInScope(resource, scope)) {
    throw new AuthError("ERR_AUTH_OUTSIDE_SCOPE");
  }
}

export async function requireAssignment(
  user: User,
  pengajuanId: number,
  assignmentType: AssignmentTypeType
) {
  const hasAssignment = await checkAssignment(user, pengajuanId, assignmentType);
  if (!hasAssignment) {
    throw new AuthError("ERR_AUTH_NOT_ASSIGNED");
  }
}
```

**Contoh penggunaan di Server Action**:

```typescript
"use server";

export async function approvePengajuan(pengajuanId: number) {
  // 1. Auth
  const user = await requireAuth();

  // 2. Get pengajuan
  const pengajuan = await getPengajuan(pengajuanId);

  // 3. Scope check
  await requireScope(user, pengajuan);

  // 4. Role/assignment check (tergantung step)
  // misal step Kaprodi
  await requireRole(user, "dosen");
  await requireStructuralPosition(user, "kaprodi", pengajuan.prodiId);

  // 5. State check
  if (pengajuan.status !== "pending_kaprodi") {
    throw new BusinessError("ERR_BUS_INVALID_STATE_TRANSITION");
  }

  // ... proses approve
}
```

### 9.2.3 Client-side (UX Only, BUKAN Security)

Client-side check hanya untuk **conditional rendering** (sembunyikan tombol yang tidak relevan). **BUKAN** security — security selalu di server.

```tsx
{canApprove(user, pengajuan) && (
  <Button onClick={handleApprove}>Setujui</Button>
)}
```

## 9.3 Scope Filtering Implementation

### 9.3.1 Function getAccessibleScope

```typescript
type ScopeFilter = {
  level: "all" | "fakultas" | "prodi" | "own";
  fakultasId?: number;
  prodiId?: number;
  userId?: number;
};

function getAccessibleScope(user: User): ScopeFilter {
  switch (user.systemRole) {
    case "super_admin":
      return { level: "all" };

    case "mahasiswa":
      return { level: "own", userId: user.id };

    case "staff_prodi":
      return { level: "prodi", prodiId: user.prodiId };

    case "staff_akademik":
    case "kabag":
      return { level: "fakultas", fakultasId: user.fakultasId };

    case "dosen":
      // Dosen: kompleks, tergantung structural position + assignment
      // Detail di implementasi
      return resolveDosenScope(user);
  }
}
```

### 9.3.2 Aplikasi di Query

```typescript
async function getPengajuanList(user: User, filters: Filters) {
  const scope = getAccessibleScope(user);

  const where: Prisma.PengajuanWhereInput = {
    ...buildScopeWhere(scope),  // inject scope filter
    ...buildUserFilters(filters)
  };

  return prisma.pengajuanLayanan.findMany({ where, ... });
}
```

## 9.4 Permission Matrix

Tabel kewenangan akses per role (untuk referensi AI Agent):

| Fitur | mahasiswa | dosen | staff_prodi | staff_akademik | kabag | super_admin |
|---|---|---|---|---|---|---|
| Submit pengajuan TA | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Submit pengajuan AK | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Verifikasi TA | ✗ | ✗ | ✓ (prodinya) | ✗ | ✗ | ✓ |
| Verifikasi AK | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Pilih judul (PA) | ✗ | ✓ (jika PA) | ✗ | ✗ | ✗ | ✗ |
| Approve Kaprodi | ✗ | ✓ (jika kaprodi) | ✗ | ✗ | ✗ | ✗ |
| Tetapkan penguji (Sekprodi) | ✗ | ✓ (jika sekprodi) | ✗ | ✗ | ✗ | ✗ |
| Approve Kabag | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| TTD final | ✗ | ✓ (jika WD1/Dekan) | ✗ | ✗ | ✗ | ✗ |
| Input nilai sidang | ✗ | ✓ (jika penguji/sekretaris) | ✗ | ✗ | ✗ | ✗ |
| Kelola master data | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Kelola user | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Kelola workflow/form | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Lihat arsip prodi | ✗ | ✓ (terkait) | ✓ (prodinya) | ✗ | ✗ | ✓ |
| Lihat arsip fakultas | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Download SK/Surat Tugas sendiri | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |

> **Catatan**: Dosen dengan structural position (kaprodi, sekprodi, WD1, dekan) atau assignment (PA, penguji, dll) dapat akses tambahan sesuai posisi/assignment-nya.

## 9.5 Route Protection

### 9.5.1 Middleware

Next.js middleware untuk protect routes:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  // Public routes
  const publicRoutes = ["/login", "/verifikasi", "/lupa-password"];
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protected routes: harus login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
```

> **Catatan keamanan Next.js 16**: Ada CVE terkait middleware/proxy bypass di versi sebelumnya. Pastikan pakai versi patched (16.2.x terbaru). Authorization JANGAN hanya andalkan middleware — selalu cek lagi di Server Action/API (defense in depth).

### 9.5.2 Public Routes (Tanpa Login)

| Route | Tujuan |
|---|---|
| `/login` | Halaman login |
| `/lupa-password` | Reset password |
| `/verifikasi` | Verifikasi dokumen via QR + token (publik) |
| `/api/verifikasi` | API verifikasi dokumen (publik, rate-limited) |

## 9.6 AI Agent Rules untuk Auth

1. **WAJIB** cek authorization di server-side (Server Action/API), JANGAN hanya client
2. **WAJIB** pakai pattern `requireAuth`, `requireRole`, `requireScope`, `requireAssignment`
3. **WAJIB** cek state pengajuan sebelum proses action (cegah invalid transition)
4. **JANGAN** trust client-side check untuk security
5. **WAJIB** hash password dengan bcrypt/argon2
6. **WAJIB** apply scope filter di SEMUA query data pengajuan
7. **JANGAN** expose data di luar scope user
8. **WAJIB** pakai versi Next.js patched (16.2.x) untuk hindari CVE middleware bypass

---

# Bagian 10: Acceptance Criteria Template

## 10.1 Tujuan

Acceptance Criteria (AC) adalah **kriteria testable** yang menentukan apakah sebuah fitur "selesai" dan benar. Format Given-When-Then memudahkan AI Agent paham requirement secara tidak ambigu.

## 10.2 Format Given-When-Then

```
GIVEN [kondisi awal / context]
WHEN [aksi yang dilakukan]
THEN [hasil yang diharapkan]
  AND [hasil tambahan / side effect]
```

**Penjelasan**:
- **GIVEN**: State sistem sebelum aksi (data, status, role user)
- **WHEN**: Aksi yang di-trigger (user action atau system event)
- **THEN**: Hasil yang harus terjadi (state change, output, notifikasi)
- **AND**: Hasil tambahan (bisa multiple)

## 10.3 Contoh per Jenis Skenario

### 10.3.1 Happy Path (Skenario Sukses)

```
SKENARIO: Mahasiswa berhasil submit pengajuan TA-01

GIVEN mahasiswa "Aini" dengan status "aktif"
  AND tidak punya pengajuan TA-01 yang aktif
  AND semester "Ganjil 2025/2026" sedang aktif
WHEN Aini submit pengajuan TA-01 dengan:
  - 3 judul skripsi (valid)
  - memilih PA "Dr. Ahmad"
  - upload 3 dokumen wajib (transkrip, KHS, bukti UKT)
THEN pengajuan tercipta dengan status "pending_staff_prodi"
  AND kode pengajuan ter-generate format "TA-2026-XXXX"
  AND nomor surat di-reserve (status VOID belum aktif)
  AND record judul_skripsi BELUM tercipta (baru tercipta setelah PA pilih)
  AND notifikasi terkirim ke Staff Prodi prodi Aini (in-app + email)
  AND Aini melihat status "Diajukan, menunggu verifikasi Staff Prodi"
  AND aktivitas tercatat di pengajuan_log
```

### 10.3.2 Validation Error

```
SKENARIO: Mahasiswa submit dengan judul kurang dari 3

GIVEN mahasiswa "Aini" dengan status "aktif"
WHEN Aini submit pengajuan TA-01 dengan hanya 2 judul
THEN sistem menolak submit
  AND menampilkan error "ERR_VAL_MIN_ITEMS" dengan pesan "Minimal 3 judul"
  AND pengajuan TIDAK tercipta
  AND tidak ada perubahan di database
```

### 10.3.3 Authorization Error

```
SKENARIO: Staff Prodi mencoba akses pengajuan dari prodi lain

GIVEN Staff Prodi "Budi" dari prodi "Ilmu Hadis"
  AND ada pengajuan TA-01 dari mahasiswa prodi "Ilmu Al-Quran dan Tafsir"
WHEN Budi mencoba membuka detail pengajuan tersebut
THEN sistem menolak akses
  AND menampilkan error "ERR_AUTH_OUTSIDE_SCOPE" dengan pesan "Data ini di luar kewenangan Anda"
  AND pengajuan TIDAK ditampilkan
```

### 10.3.4 Business Logic Error

```
SKENARIO: Mahasiswa submit TA-02 sebelum TA-01 selesai

GIVEN mahasiswa "Aini" dengan status "aktif"
  AND pengajuan TA-01 Aini masih berstatus "pending_kaprodi" (belum selesai)
WHEN Aini mencoba submit pengajuan TA-02 (SK Pembimbing)
THEN sistem menolak submit
  AND menampilkan error "ERR_BUS_PREREQUISITE_NOT_MET" dengan pesan "Anda harus menyelesaikan Pengajuan Judul Skripsi terlebih dahulu"
  AND pengajuan TA-02 TIDAK tercipta
```

### 10.3.5 Edge Case

```
SKENARIO: PA tidak respon, sistem trigger bypass

GIVEN pengajuan TA-01 dengan status "pending_pa"
  AND sudah 7 hari kerja sejak masuk status "pending_pa"
  AND PA belum melakukan aksi apapun
WHEN cron job harian berjalan
THEN sistem mengubah status pengajuan menjadi "bypass_active"
  AND generate Formulir Pengajuan Judul (PDF)
  AND notifikasi terkirim ke Mahasiswa, PA, dan Staff Prodi
  AND aktivitas "bypass triggered" tercatat di pengajuan_log
```

### 10.3.6 State Transition

```
SKENARIO: WD1 menolak dan kembalikan ke Sekprodi (reject bertingkat)

GIVEN pengajuan TA-03 dengan status "pending_wd1"
  AND user adalah WD1 yang aktif
WHEN WD1 melakukan action "reject_to_step" dengan:
  - target_step: "sekprodi"
  - alasan: "Penguji 2 sedang cuti, mohon ganti"
THEN status pengajuan berubah menjadi "pending_sekprodi"
  AND pengajuan ditandai "Returned from WD1"
  AND alasan tersimpan di pengajuan_log
  AND notifikasi terkirim ke Sekprodi dengan konteks "dikembalikan dari WD1"
  AND saat Sekprodi selesai, pengajuan re-approval lengkap (Sekprodi → WD1)
```

## 10.4 Acceptance Criteria untuk Setiap Fitur Workflow

Template yang harus diisi untuk setiap step di dokumen BPMN:

```
FITUR: [Nama fitur, mis. "Staff Prodi verifikasi TA-01"]

PRECONDITIONS:
- [kondisi yang harus true sebelum fitur bisa dijalankan]

MAIN FLOW (Happy Path):
GIVEN [...]
WHEN [...]
THEN [...]

ALTERNATIVE FLOWS:
- [skenario reject]
- [skenario edge case]

ERROR SCENARIOS:
- [validation error]
- [authorization error]
- [business logic error]

POSTCONDITIONS:
- [state setelah fitur selesai]

SIDE EFFECTS:
- [notifikasi]
- [audit log]
- [data changes]
```

## 10.5 Testable Assertion Checklist

Setiap AC harus bisa diverifikasi dengan assertion konkret:

| Aspek | Pertanyaan Verifikasi |
|---|---|
| State change | Apakah status berubah sesuai harapan? |
| Data persistence | Apakah data tersimpan dengan benar? |
| Notification | Apakah notifikasi terkirim ke pihak yang tepat? |
| Audit log | Apakah aktivitas tercatat? |
| Error handling | Apakah error code & message sesuai? |
| Authorization | Apakah akses ditolak untuk user yang tidak berhak? |
| Idempotency | Apakah aksi yang sama tidak menghasilkan duplikat? |

## 10.6 AI Agent Rules untuk Acceptance Criteria

1. **WAJIB** implement semua skenario di AC (happy path + error + edge case)
2. **WAJIB** tulis test yang sesuai dengan AC (Given-When-Then → test case)
3. **JANGAN** anggap fitur selesai jika ada AC yang belum terpenuhi
4. **WAJIB** verifikasi side effects (notifikasi, audit log) di test
5. **JIKA** ada skenario yang tidak ada di AC tapi muncul saat implementasi → tanya, jangan asumsi

---

## Action Items untuk Anda (Batch 3)

| No | Action | Catatan |
|---|---|---|
| 1 | Konfirmasi pilihan Auth library (Auth.js v5) | Saya rekomendasi Auth.js, bisa diganti Lucia |
| 2 | Konfirmasi session strategy (database session, bukan JWT) | Lebih aman, bisa revoke |
| 3 | Konfirmasi warna brand UIN SMH Banten (untuk theme) | Perlu brand guideline kampus |
| 4 | Konfirmasi idle timeout (2 jam) & session expiry (7 hari) | Sesuaikan kebijakan keamanan |
| 5 | Review permission matrix (Section 9.4) | Pastikan kewenangan sudah tepat |
| 6 | Konfirmasi login method (NIM/NIDN/NIP + password) | Apakah ada SSO kampus yang harus diintegrasi? |

---

## Lanjut ke Batch 4 (Terakhir)

Setelah Anda review Batch 3, saya lanjut ke **Batch 4** (batch terakhir):
- **Bagian 11**: AI Agent Guidelines (paling penting untuk Claude Code & DeepSeek)
- **Bagian 12**: Workflow & State Machine Convention
- **Bagian 13**: Audit Logging Convention
- **Bagian 14**: Testing Convention
- **Bagian 15**: Documentation Convention

---

*Dokumen ini adalah AUTHORITATIVE SOURCE untuk UI components, auth, dan acceptance criteria SILA. Semua dokumen lain dan code wajib mengacu ke sini.*
