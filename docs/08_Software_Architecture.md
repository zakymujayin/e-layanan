# Software Architecture Document
# Sistem Informasi Layanan Akademik (SILA)

**Versi**: 1.0
**Tanggal**: 28 Mei 2026

---

## 1. Arsitektur Umum

### 1.1 Pola Arsitektur: Monolith-First

SILA Phase 1 menggunakan **monolith architecture** (bukan microservices).

**Alasan**:
- Skala pengguna kecil (satu fakultas, ~500 mahasiswa + ~50 dosen + ~10 staff)
- Tim development kecil (AI Agent-based)
- Lebih mudah di-deploy dan di-maintain
- Dapat di-extract ke microservices di masa depan jika perlu

### 1.2 Layer Architecture (Next.js App Router)

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                     │
│  React Server Components + Client Components            │
│  shadcn/ui + Tailwind CSS v4                            │
├─────────────────────────────────────────────────────────┤
│  SERVER ACTION LAYER                                    │
│  Next.js Server Actions (form submission, mutations)    │
│  API Routes (file upload, verifikasi publik, dll)       │
├─────────────────────────────────────────────────────────┤
│  SERVICE LAYER                                          │
│  Business logic (workflow engine, numbering, pdf gen)   │
│  Authorization checks                                   │
├─────────────────────────────────────────────────────────┤
│  DATA ACCESS LAYER                                      │
│  Prisma ORM + PostgreSQL                                │
│  Storage abstraction (local/cloud)                      │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Folder Structure

```
sila/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (no sidebar layout)
│   │   ├── login/page.tsx
│   │   └── lupa-password/page.tsx
│   ├── (dashboard)/              # Dashboard routes (with sidebar)
│   │   ├── layout.tsx            # Dashboard layout (sidebar + header)
│   │   ├── dashboard/page.tsx
│   │   ├── pengajuan/
│   │   │   ├── page.tsx          # Daftar pengajuan
│   │   │   ├── baru/page.tsx     # Pilih layanan baru
│   │   │   └── [id]/page.tsx     # Detail pengajuan
│   │   ├── arsip/page.tsx
│   │   ├── profil/page.tsx
│   │   └── admin/                # Admin panel (super_admin only)
│   ├── verifikasi/page.tsx       # Public verification
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── pengajuan/
│       │   └── [id]/
│       │       ├── dokumen/route.ts  # File upload
│       │       └── pdf/route.ts      # Download PDF
│       ├── files/[...path]/route.ts  # Serve protected files
│       └── verifikasi/route.ts       # Public API
│
├── components/
│   ├── ui/                       # shadcn/ui components (copied)
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── NotificationSheet.tsx
│   ├── pengajuan/                # Pengajuan-specific
│   │   ├── PengajuanCard.tsx
│   │   ├── PengajuanForm.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ActivityTimeline.tsx
│   ├── workflow/
│   │   ├── ActionButtons.tsx
│   │   ├── RejectDialog.tsx
│   │   └── SignConfirmDialog.tsx
│   └── shared/
│       ├── EmptyState.tsx
│       ├── LoadingCard.tsx
│       └── FileUpload.tsx
│
├── lib/
│   ├── auth/
│   │   ├── index.ts              # Auth.js config
│   │   ├── check.ts              # requireAuth, requireRole, etc
│   │   └── scope.ts              # getAccessibleScope
│   ├── workflow/
│   │   ├── execute-action.ts     # Main workflow executor
│   │   ├── validate-transition.ts
│   │   ├── sla-checker.ts        # Cron job SLA
│   │   └── bypass-handler.ts     # TA-01 bypass
│   ├── document/
│   │   ├── generate-pdf.ts       # PDF generation
│   │   ├── embed-ttd.ts          # TTD embedding
│   │   ├── generate-qrcode.ts    # QR Code
│   │   └── numbering.ts          # Reserved numbering
│   ├── storage/
│   │   ├── index.ts              # Storage abstraction interface
│   │   └── local.ts              # Local filesystem implementation
│   ├── notification/
│   │   ├── send.ts               # Send notification (in-app + email)
│   │   └── templates.ts          # Email templates
│   ├── audit/
│   │   └── log.ts                # logAudit helper
│   └── utils/
│       ├── format-tanggal.ts
│       ├── bulan-romawi.ts
│       └── generate-kode.ts
│
├── actions/                      # Server Actions (per domain)
│   ├── auth.ts
│   ├── pengajuan.ts
│   ├── workflow.ts
│   ├── profil.ts
│   └── admin.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
└── public/
    └── (static assets only — NO uploaded files here)
```

---

## 2. Komponen Utama

### 2.1 Workflow Engine

Lokasi: `lib/workflow/execute-action.ts`

**Responsibility**:
- Menerima action dari approver
- Validasi state transition
- Eksekusi action (update status, save data, dll)
- Trigger side effects (notifikasi, log, SLA, dll)

**Pattern**: Pure function + database transaction untuk atomicity

```typescript
export async function executeWorkflowAction(params: {
  pengajuanId: number;
  action: WorkflowActionType;
  data: ActionData;
  user: User;
}): Promise<PengajuanLayanan> {
  // Pakai database transaction untuk atomicity
  return await prisma.$transaction(async (tx) => {
    // 1. Load pengajuan
    // 2. Validate
    // 3. Execute
    // 4. Side effects
    // 5. Return updated pengajuan
  });
}
```

### 2.2 Document Generation Service

Lokasi: `lib/document/generate-pdf.ts`

**Responsibility**:
- Generate PDF dari template + data pengajuan
- Mode preview (placeholder kuning) dan final (TTD embed + QR aktif)

**Library yang dipakai**: `@react-pdf/renderer` atau `puppeteer` (render HTML ke PDF)

> **Catatan untuk AI Agent**: Pilih satu library saja. Rekomendasi: `puppeteer` karena template bisa pakai HTML/CSS yang lebih familiar, dan rendering lebih konsisten. Jangan mix keduanya.

### 2.3 Storage Abstraction

Lokasi: `lib/storage/`

```typescript
interface StorageProvider {
  upload(destPath: string, buffer: Buffer, mimeType: string): Promise<string>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
  getServeUrl(filePath: string): string;
}

// Phase 1 implementation
export class LocalStorageProvider implements StorageProvider {
  private basePath = process.env.STORAGE_PATH || '/storage';
  // ...
}
```

### 2.4 Notification Service

Lokasi: `lib/notification/send.ts`

```typescript
export async function sendNotification(params: {
  userId: number;
  title: string;
  message: string;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  entityType?: string;
  entityId?: number;
}): Promise<void> {
  // 1. Always save to DB (in-app)
  // 2. If email in channels AND user email preference = on: send email
  // 3. If whatsapp in channels AND configured: send WA (future)
}
```

---

## 3. Environment Variables

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/sila"
NEXTAUTH_SECRET="[random 32+ char string]"
NEXTAUTH_URL="https://layanan.fuda.uinbanten.ac.id"

# Storage
STORAGE_PATH="/var/www/sila/storage"
MAX_FILE_SIZE_MB=15

# Email (SMTP)
SMTP_HOST="smtp.kampus.ac.id"
SMTP_PORT=587
SMTP_USER="noreply@fuda.uinbanten.ac.id"
SMTP_PASS="[password]"
SMTP_FROM="SILA FUDA <noreply@fuda.uinbanten.ac.id>"

# App
APP_NAME="SILA FUDA"
APP_URL="https://layanan.fuda.uinbanten.ac.id"
NODE_ENV="production"

# Turnitin
TURNITIN_BATAS_SIMILARITY=25
```

---

## 4. Deployment Architecture

### 4.1 Server Requirements

| Komponen | Minimum | Recommended |
|---|---|---|
| CPU | 2 core | 4 core |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 4.2 Deployment Stack

```
Internet → [Nginx Reverse Proxy + SSL] → [Next.js (PM2)] → [PostgreSQL]
                                                         → [File Storage]
                                                         → [SMTP Server]
```

### 4.3 Cron Jobs

| Job | Schedule | Fungsi |
|---|---|---|
| SLA Checker | Setiap hari 07:00 WIB | Cek SLA expired, trigger reminder/bypass |
| Session Cleanup | Setiap hari 02:00 WIB | Hapus session expired |
| Temp File Cleanup | Setiap hari 03:00 WIB | Hapus file temp > 24 jam |
| Database Backup | Setiap hari 00:00 WIB | Backup PostgreSQL dump |
| Storage Backup | Setiap Minggu 01:00 WIB | Backup file storage |

---

## 5. Security Architecture

### 5.1 Defense in Depth

```
Layer 1: Network (HTTPS, Firewall)
Layer 2: Authentication (Session + HttpOnly Cookie)
Layer 3: Authorization (Server-side role + scope check)
Layer 4: Input Validation (Zod schema)
Layer 5: File Security (API-gated, path sanitization)
Layer 6: Database (Connection pooling, prepared statements via Prisma)
```

### 5.2 OWASP Top 10 Mitigasi

| Risiko | Mitigasi |
|---|---|
| Injection | Prisma ORM (prepared statements), Zod input validation |
| Broken Auth | Auth.js + bcrypt + session management |
| Sensitive Data Exposure | HTTPS, HttpOnly cookie, no file public URL |
| IDOR | Scope filtering di setiap query, server-side auth check |
| Security Misconfiguration | Environment variables, tidak ada default credentials |
| XSS | React auto-escape, shadcn/ui components |
| CSRF | SameSite cookie, CSRF token (Auth.js) |
| Path Traversal | sanitizeFilePath() function pada setiap file path |
