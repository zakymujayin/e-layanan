# Entity Relationship Diagram & Database Design
# Sistem Informasi Layanan Akademik (SILA)

**Versi**: 1.0
**Tanggal**: 28 Mei 2026
**ORM**: Prisma (pilihan final)
**Database**: PostgreSQL 16+

---

## Daftar Tabel (Index)

| No | Tabel | Deskripsi |
|---|---|---|
| 1 | `users` | Akun autentikasi |
| 2 | `dosen` | Profil dosen |
| 3 | `pegawai` | Profil pegawai/tendik |
| 4 | `mahasiswa` | Profil mahasiswa |
| 5 | `fakultas` | Data fakultas |
| 6 | `prodi` | Data program studi |
| 7 | `structural_positions` | Jabatan struktural aktif |
| 8 | `assignments` | Penugasan dinamis (PA, Pembimbing, Penguji) |
| 9 | `academic_periods` | Semester / tahun akademik |
| 10 | `jenis_layanan` | Master data jenis layanan (13 layanan) |
| 11 | `field_layanan` | Konfigurasi field input per layanan |
| 12 | `dokumen_persyaratan` | Konfigurasi dokumen wajib per layanan |
| 13 | `workflow_definitions` | Definisi workflow per layanan |
| 14 | `workflow_steps` | Step-step dalam workflow |
| 15 | `workflow_step_actions` | Action yang tersedia per step |
| 16 | `pengajuan_layanan` | Pengajuan layanan (main entity) |
| 17 | `pengajuan_data` | Data field yang diisi mahasiswa |
| 18 | `pengajuan_dokumen` | File yang di-upload |
| 19 | `pengajuan_versi` | Snapshot versi pengajuan |
| 20 | `pengajuan_log` | Event log / audit trail pengajuan |
| 21 | `judul_skripsi` | Living entity judul skripsi |
| 22 | `judul_skripsi_history` | Riwayat perubahan judul |
| 23 | `penomoran_counter` | Counter penomoran surat |
| 24 | `dokumen_output` | Dokumen PDF yang diterbitkan |
| 25 | `dokumen_verifikasi` | Token verifikasi dokumen |
| 26 | `nilai_sidang` | Nilai hasil sidang |
| 27 | `sla_schedules` | Schedule timer SLA |
| 28 | `notifications` | Notifikasi in-app |
| 29 | `audit_logs` | Audit log seluruh sistem |
| 30 | `sessions` | Session autentikasi |
| 31 | `ttd_scans` | Gambar TTD scan pejabat |
| 32 | `kode_klasifikasi` | Master kode klasifikasi surat |

---

## Schema Lengkap (Prisma Schema)

```prisma
// ===================================================================
// 1. IDENTITY & AUTH
// ===================================================================

model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  password_hash   String
  system_role     SystemRole
  is_active       Boolean   @default(true)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  // Profile FK — hanya satu yang terisi (CHECK constraint di DB)
  dosen_id        Int?      @unique
  pegawai_id      Int?      @unique
  mahasiswa_id    Int?      @unique

  // Relations
  dosen           Dosen?    @relation(fields: [dosen_id], references: [id])
  pegawai         Pegawai?  @relation(fields: [pegawai_id], references: [id])
  mahasiswa       Mahasiswa? @relation(fields: [mahasiswa_id], references: [id])
  sessions        Session[]
  ttd_scan        TtdScan?
  notifications   Notification[]
  audit_logs      AuditLog[]

  @@map("users")
}

enum SystemRole {
  mahasiswa
  dosen
  staff_prodi
  staff_akademik
  kabag
  super_admin
}

model Dosen {
  id                Int      @id @default(autoincrement())
  nidn              String   @unique
  nama_lengkap      String
  gelar_depan       String?
  gelar_belakang    String?
  jabatan_fungsional String?
  bidang_keahlian   String?
  is_active         Boolean  @default(true)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  user                    User?
  structural_positions    StructuralPosition[]
  assignments             Assignment[]
  nilai_sidang_input      NilaiSidang[]

  @@map("dosen")
}

model Pegawai {
  id            Int      @id @default(autoincrement())
  nip           String   @unique
  nama_lengkap  String
  golongan      String?
  unit_kerja    String?
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relations
  user                  User?
  structural_positions  StructuralPosition[]

  @@map("pegawai")
}

model Mahasiswa {
  id                Int              @id @default(autoincrement())
  nim               String           @unique
  nama_lengkap      String
  prodi_id          Int
  angkatan          Int
  semester_aktif    Int?
  status_mahasiswa  StatusMahasiswa  @default(aktif)
  created_at        DateTime         @default(now())
  updated_at        DateTime         @updatedAt

  // Relations
  user              User?
  prodi             Prodi            @relation(fields: [prodi_id], references: [id])
  pengajuan         PengajuanLayanan[]
  judul_skripsi     JudulSkripsi[]
  assignments       Assignment[]

  @@map("mahasiswa")
}

enum StatusMahasiswa {
  aktif
  cuti
  alumni
  do
  keluar
}

// ===================================================================
// 2. STRUKTUR INSTITUSI
// ===================================================================

model Fakultas {
  id          Int      @id @default(autoincrement())
  kode        String   @unique   // "FUDA"
  nama        String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())

  prodi       Prodi[]

  @@map("fakultas")
}

model Prodi {
  id          Int      @id @default(autoincrement())
  kode        String   @unique
  nama        String
  fakultas_id Int
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())

  fakultas    Fakultas @relation(fields: [fakultas_id], references: [id])
  mahasiswa   Mahasiswa[]
  structural_positions StructuralPosition[]

  @@map("prodi")
}

model StructuralPosition {
  id              Int               @id @default(autoincrement())
  position_code   PositionCode
  is_active       Boolean           @default(true)
  start_date      DateTime
  end_date        DateTime?
  created_at      DateTime          @default(now())

  // Holder: salah satu terisi
  dosen_id        Int?
  pegawai_id      Int?

  // Scope (untuk sekprodi/kaprodi)
  prodi_id        Int?

  dosen           Dosen?    @relation(fields: [dosen_id], references: [id])
  pegawai         Pegawai?  @relation(fields: [pegawai_id], references: [id])
  prodi           Prodi?    @relation(fields: [prodi_id], references: [id])

  @@map("structural_positions")
}

enum PositionCode {
  sekprodi
  kaprodi
  wakil_dekan_1
  dekan
  kabag_tu
  kepala_lab
}

model Assignment {
  id              Int            @id @default(autoincrement())
  assignment_type AssignmentType
  is_active       Boolean        @default(true)
  created_at      DateTime       @default(now())

  dosen_id        Int
  mahasiswa_id    Int?
  pengajuan_id    Int?

  dosen           Dosen            @relation(fields: [dosen_id], references: [id])
  mahasiswa       Mahasiswa?       @relation(fields: [mahasiswa_id], references: [id])
  pengajuan       PengajuanLayanan? @relation(fields: [pengajuan_id], references: [id])

  @@map("assignments")
}

enum AssignmentType {
  dosen_pa
  pembimbing_skripsi_1
  pembimbing_skripsi_2
  penguji_proposal
  penguji_komprehensif_prodi
  penguji_komprehensif_keislaman
  penguji_skripsi
  ketua_sidang
  sekretaris_sidang
  dosen_pembimbing_observasi
  dosen_pembimbing_magang
}

// ===================================================================
// 3. ACADEMIC PERIOD
// ===================================================================

model AcademicPeriod {
  id              Int             @id @default(autoincrement())
  nama_semester   String          // "Ganjil 2025/2026"
  tahun_akademik  String          // "2025/2026"
  tipe            TipeSemester
  tanggal_mulai   DateTime
  tanggal_berakhir DateTime?
  status          StatusSemester  @default(upcoming)
  created_at      DateTime        @default(now())

  pengajuan       PengajuanLayanan[]
  penomoran       PenomoranCounter[]

  @@map("academic_periods")
}

enum TipeSemester {
  ganjil
  genap
}

enum StatusSemester {
  upcoming
  active
  completed
}

// ===================================================================
// 4. KONFIGURASI LAYANAN
// ===================================================================

model JenisLayanan {
  id              Int           @id @default(autoincrement())
  kode            String        @unique  // "TA-01", "AK-01"
  nama            String
  kategori        KategoriLayanan
  scope_level     String        // "prodi" | "fakultas"
  kode_klasifikasi_id Int
  template_kode   String        // untuk generate PDF
  is_active       Boolean       @default(true)
  urutan          Int           @default(0)

  kode_klasifikasi  KodeKlasifikasi    @relation(fields: [kode_klasifikasi_id], references: [id])
  field_layanan     FieldLayanan[]
  dokumen_persyaratan DokumenPersyaratan[]
  workflow_definitions WorkflowDefinition[]
  pengajuan         PengajuanLayanan[]

  @@map("jenis_layanan")
}

enum KategoriLayanan {
  tugas_akhir
  akademik
}

model FieldLayanan {
  id                Int      @id @default(autoincrement())
  jenis_layanan_id  Int
  nama_field        String   // identifier (snake_case)
  label             String   // tampilan
  tipe_field        TipeField
  is_required       Boolean  @default(true)
  validation_rule   Json?    // { min, max, pattern, dll }
  kondisi_tampil    Json?    // conditional display rule
  urutan            Int      @default(0)
  placeholder       String?
  keterangan        String?

  jenis_layanan     JenisLayanan @relation(fields: [jenis_layanan_id], references: [id])

  @@map("field_layanan")
}

enum TipeField {
  text
  textarea
  number
  date
  datetime
  time
  select
  multi_select
  radio
  checkbox
  file
  repeater
  dosen_picker
  mahasiswa_picker
}

model DokumenPersyaratan {
  id                Int      @id @default(autoincrement())
  jenis_layanan_id  Int
  nama_dokumen      String
  format_diizinkan  String[] // ["pdf", "jpg", "png"]
  ukuran_max_mb     Float    @default(2)
  is_required       Boolean  @default(true)
  urutan            Int      @default(0)
  keterangan        String?
  // Future-proof untuk integrasi SIAKAD
  validation_rule   Json?
  sumber_validasi   String?  // null | "manual" | "siakad_api"

  jenis_layanan     JenisLayanan   @relation(fields: [jenis_layanan_id], references: [id])
  pengajuan_dokumen PengajuanDokumen[]

  @@map("dokumen_persyaratan")
}

// ===================================================================
// 5. WORKFLOW ENGINE
// ===================================================================

model WorkflowDefinition {
  id                Int      @id @default(autoincrement())
  jenis_layanan_id  Int
  versi             Int      @default(1)
  is_active         Boolean  @default(true)
  created_at        DateTime @default(now())

  jenis_layanan     JenisLayanan   @relation(fields: [jenis_layanan_id], references: [id])
  steps             WorkflowStep[]

  @@map("workflow_definitions")
}

model WorkflowStep {
  id                    Int      @id @default(autoincrement())
  workflow_definition_id Int
  step_code             String   // "TA01-02", "TA01-03"
  step_order            Int
  status_code           String   // maps to StatusPengajuan
  actor_type            String   // "staff_prodi", "pa", "kaprodi", dll
  actor_condition       Json?    // kondisi tambahan
  sla_days              Int?
  sla_consequence       String?  // "reminder" | "bypass" | "escalation"

  workflow_definition   WorkflowDefinition   @relation(fields: [workflow_definition_id], references: [id])
  actions               WorkflowStepAction[]

  @@map("workflow_steps")
}

model WorkflowStepAction {
  id                  Int     @id @default(autoincrement())
  workflow_step_id    Int
  action_code         String  // maps to WorkflowAction enum
  target_status       String  // status setelah action ini
  requires_reason     Boolean @default(false)
  requires_confirmation Boolean @default(false)
  label               String  // label tombol di UI

  workflow_step       WorkflowStep @relation(fields: [workflow_step_id], references: [id])

  @@map("workflow_step_actions")
}

// ===================================================================
// 6. PENGAJUAN (MAIN ENTITY)
// ===================================================================

model PengajuanLayanan {
  id                    Int                @id @default(autoincrement())
  kode_pengajuan        String             @unique  // "TA-2026-0023"
  mahasiswa_id          Int
  jenis_layanan_id      Int
  academic_period_id    Int
  workflow_definition_id Int

  // Status & step
  status                StatusPengajuan    @default(pending_staff_prodi)
  current_step_code     String?

  // Scope
  scope_level           String             // "prodi" | "fakultas"
  fakultas_id           Int
  prodi_id              Int?

  // Revisi tracking
  revisi_ke             Int                @default(1)

  // Bypass metadata
  is_bypass             Boolean            @default(false)

  // Returned from
  returned_from         String?            // "wd1" | "dekan" | "kabag"

  // Timestamps
  created_at            DateTime           @default(now())
  updated_at            DateTime           @updatedAt
  completed_at          DateTime?
  terminated_at         DateTime?

  // Relations
  mahasiswa             Mahasiswa          @relation(fields: [mahasiswa_id], references: [id])
  jenis_layanan         JenisLayanan       @relation(fields: [jenis_layanan_id], references: [id])
  academic_period       AcademicPeriod     @relation(fields: [academic_period_id], references: [id])
  pengajuan_data        PengajuanData?
  pengajuan_dokumen     PengajuanDokumen[]
  pengajuan_versi       PengajuanVersi[]
  pengajuan_log         PengajuanLog[]
  assignments           Assignment[]
  dokumen_output        DokumenOutput[]
  nilai_sidang          NilaiSidang[]
  sla_schedules         SlaSchedule[]
  penomoran_reserved    PenomoranCounter[]

  @@map("pengajuan_layanan")
}

enum StatusPengajuan {
  draft
  submitted
  pending_staff_prodi
  pending_staff_akademik
  pending_pa
  pending_kaprodi
  pending_sekprodi
  pending_kabag
  pending_wd1
  pending_dekan
  pending_kepala_lab
  bypass_active
  revision_required
  selesai
  terminated
}

model PengajuanData {
  id              Int      @id @default(autoincrement())
  pengajuan_id    Int      @unique
  field_values    Json     // key-value semua field yang diisi mahasiswa

  pengajuan       PengajuanLayanan @relation(fields: [pengajuan_id], references: [id])

  @@map("pengajuan_data")
}

model PengajuanDokumen {
  id                      Int      @id @default(autoincrement())
  pengajuan_id            Int
  dokumen_persyaratan_id  Int?     // null untuk auto-attach
  file_path               String
  file_name               String
  file_size_bytes         Int
  mime_type               String
  versi                   Int      @default(1)
  is_auto_attached        Boolean  @default(false)
  di_upload_oleh          Int      // user_id
  di_upload_pada          DateTime @default(now())

  pengajuan               PengajuanLayanan   @relation(fields: [pengajuan_id], references: [id])
  dokumen_persyaratan     DokumenPersyaratan? @relation(fields: [dokumen_persyaratan_id], references: [id])

  @@map("pengajuan_dokumen")
}

model PengajuanVersi {
  id              Int      @id @default(autoincrement())
  pengajuan_id    Int
  versi_ke        Int
  data_snapshot   Json     // snapshot field_values saat versi ini
  dokumen_snapshot Json    // referensi file paths saat versi ini
  dibuat_oleh     Int      // user_id
  dibuat_pada     DateTime @default(now())
  alasan_perubahan String?

  pengajuan       PengajuanLayanan @relation(fields: [pengajuan_id], references: [id])

  @@map("pengajuan_versi")
}

model PengajuanLog {
  id              Int      @id @default(autoincrement())
  pengajuan_id    Int
  action_code     String   // WorkflowAction enum value
  performed_by    Int      // user_id
  from_status     String?
  to_status       String?
  target_step     String?  // untuk reject_to_step
  alasan          String?
  metadata        Json?
  created_at      DateTime @default(now())

  pengajuan       PengajuanLayanan @relation(fields: [pengajuan_id], references: [id])

  @@map("pengajuan_log")
}

// ===================================================================
// 7. JUDUL SKRIPSI (LIVING ENTITY)
// ===================================================================

model JudulSkripsi {
  id              Int      @id @default(autoincrement())
  mahasiswa_id    Int
  judul_aktif     String
  status          String   @default("aktif")  // "aktif" | "dibatalkan"
  current_version Int      @default(1)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  mahasiswa       Mahasiswa          @relation(fields: [mahasiswa_id], references: [id])
  history         JudulSkripsiHistory[]

  @@map("judul_skripsi")
}

model JudulSkripsiHistory {
  id                  Int      @id @default(autoincrement())
  judul_skripsi_id    Int
  versi_ke            Int
  judul_text          String
  diubah_oleh         Int      // user_id
  diubah_pada         DateTime @default(now())
  konteks_perubahan   String?
  alasan_perubahan    String?
  referensi_pengajuan_id Int?

  judul_skripsi       JudulSkripsi @relation(fields: [judul_skripsi_id], references: [id])

  @@map("judul_skripsi_history")
}

// ===================================================================
// 8. PENOMORAN SURAT
// ===================================================================

model KodeKlasifikasi {
  id          Int      @id @default(autoincrement())
  kode        String   @unique  // "PP.00.9", "KP.01.2"
  nama        String
  deskripsi   String?

  jenis_layanan JenisLayanan[]
  penomoran   PenomoranCounter[]

  @@map("kode_klasifikasi")
}

model PenomoranCounter {
  id                    Int      @id @default(autoincrement())
  academic_period_id    Int
  kode_klasifikasi_id   Int
  scope_level           String   // "fakultas" | "prodi"
  scope_id              Int?     // prodi_id jika scope = "prodi"

  // Untuk reserved numbering
  pengajuan_id          Int?     // linked ke pengajuan yang reserve nomor ini
  nomor_urut            Int
  nomor_formatted       String   // "040/Un.17/F.III/PP.00.9/V/2026"
  status                String   @default("reserved")  // "reserved" | "active" | "void"
  reserved_at           DateTime @default(now())
  activated_at          DateTime?
  voided_at             DateTime?

  academic_period       AcademicPeriod   @relation(fields: [academic_period_id], references: [id])
  kode_klasifikasi      KodeKlasifikasi  @relation(fields: [kode_klasifikasi_id], references: [id])
  pengajuan             PengajuanLayanan? @relation(fields: [pengajuan_id], references: [id])

  @@map("penomoran_counter")
}

// ===================================================================
// 9. DOKUMEN OUTPUT
// ===================================================================

model DokumenOutput {
  id                Int      @id @default(autoincrement())
  pengajuan_id      Int
  jenis_dokumen     String   // "surat_tugas", "berita_acara", "sk_pembimbing", dll
  nomor_surat       String?  // dari reserved numbering
  file_path_preview String?  // path ke preview (placeholder kuning)
  file_path_final   String?  // path ke dokumen final (TTD embed)
  is_final          Boolean  @default(false)
  generated_at      DateTime @default(now())
  finalized_at      DateTime?
  signed_by         Int?     // user_id pejabat yang TTD

  pengajuan         PengajuanLayanan @relation(fields: [pengajuan_id], references: [id])
  dokumen_verifikasi DokumenVerifikasi?

  @@map("dokumen_output")
}

model DokumenVerifikasi {
  id              Int      @id @default(autoincrement())
  dokumen_id      Int      @unique
  token           String   @unique   // "A7K9-PQRZ-2BX8"
  qr_url          String             // URL yang di-encode di QR Code
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())

  dokumen         DokumenOutput @relation(fields: [dokumen_id], references: [id])
  verifikasi_log  VerifikasiLog[]

  @@map("dokumen_verifikasi")
}

model VerifikasiLog {
  id                    Int      @id @default(autoincrement())
  dokumen_verifikasi_id Int
  ip_address            String
  is_success            Boolean
  attempted_at          DateTime @default(now())

  dokumen_verifikasi    DokumenVerifikasi @relation(fields: [dokumen_verifikasi_id], references: [id])

  @@map("verifikasi_log")
}

// ===================================================================
// 10. TTD SCAN
// ===================================================================

model TtdScan {
  id          Int      @id @default(autoincrement())
  user_id     Int      @unique
  file_path   String
  uploaded_at DateTime @default(now())
  updated_at  DateTime @updatedAt

  user        User     @relation(fields: [user_id], references: [id])

  @@map("ttd_scans")
}

// ===================================================================
// 11. NILAI SIDANG
// ===================================================================

model NilaiSidang {
  id                  Int      @id @default(autoincrement())
  pengajuan_id        Int
  dosen_id            Int
  assignment_type     AssignmentType
  nilai               Float?
  catatan             String?
  keputusan           String?  // "layak"|"tidak_layak"|"lulus"|"tidak_lulus"

  // Khusus Sekretaris Sidang TA-05 (input nilai gabungan)
  nilai_per_penilai   Json?
  nilai_akhir         Float?
  ipk_equivalent      Float?
  yudisium            String?  // "memuaskan"|"sangat_memuaskan"|"pujian"

  input_at            DateTime @default(now())

  pengajuan           PengajuanLayanan @relation(fields: [pengajuan_id], references: [id])
  dosen               Dosen            @relation(fields: [dosen_id], references: [id])

  @@map("nilai_sidang")
}

// ===================================================================
// 12. SLA MANAGEMENT
// ===================================================================

model SlaSchedule {
  id              Int      @id @default(autoincrement())
  pengajuan_id    Int
  step_code       String
  deadline        DateTime
  consequence     String   // "reminder" | "bypass" | "escalation"
  is_triggered    Boolean  @default(false)
  triggered_at    DateTime?
  created_at      DateTime @default(now())

  pengajuan       PengajuanLayanan @relation(fields: [pengajuan_id], references: [id])

  @@map("sla_schedules")
}

// ===================================================================
// 13. NOTIFIKASI
// ===================================================================

model Notification {
  id          Int                  @id @default(autoincrement())
  user_id     Int
  title       String
  message     String
  severity    NotificationSeverity @default(info)
  channel     NotificationChannel  @default(in_app)
  entity_type String?              // "pengajuan_layanan", dll
  entity_id   Int?
  is_read     Boolean              @default(false)
  read_at     DateTime?
  created_at  DateTime             @default(now())

  user        User  @relation(fields: [user_id], references: [id])

  @@map("notifications")
}

enum NotificationSeverity {
  info
  success
  warning
  urgent
}

enum NotificationChannel {
  in_app
  email
  whatsapp
}

// ===================================================================
// 14. AUDIT LOG
// ===================================================================

model AuditLog {
  id          BigInt   @id @default(autoincrement())
  timestamp   DateTime @default(now())
  user_id     Int?
  action      String
  entity_type String?
  entity_id   Int?
  severity    String   @default("info")
  metadata    Json?
  ip_address  String?
  user_agent  String?
  request_id  String?

  user        User?  @relation(fields: [user_id], references: [id])

  @@map("audit_logs")
}

// ===================================================================
// 15. SESSION
// ===================================================================

model Session {
  id              Int      @id @default(autoincrement())
  user_id         Int
  token_hash      String   @unique
  expires_at      DateTime
  last_active_at  DateTime @default(now())
  ip_address      String?
  user_agent      String?
  created_at      DateTime @default(now())

  user            User  @relation(fields: [user_id], references: [id])

  @@map("sessions")
}
```

---

## Relasi Antar Entitas (ERD Naratif)

### Relasi Utama

```
User (1) ──── (0..1) Dosen
User (1) ──── (0..1) Pegawai
User (1) ──── (0..1) Mahasiswa

Fakultas (1) ──── (N) Prodi
Prodi (1) ──── (N) Mahasiswa

Dosen (1) ──── (N) StructuralPosition
Pegawai (1) ──── (N) StructuralPosition
StructuralPosition (N) ──── (1) Prodi [nullable]

Dosen (1) ──── (N) Assignment
Mahasiswa (1) ──── (N) Assignment
PengajuanLayanan (1) ──── (N) Assignment

Mahasiswa (1) ──── (N) PengajuanLayanan
JenisLayanan (1) ──── (N) PengajuanLayanan
AcademicPeriod (1) ──── (N) PengajuanLayanan

PengajuanLayanan (1) ──── (1) PengajuanData
PengajuanLayanan (1) ──── (N) PengajuanDokumen
PengajuanLayanan (1) ──── (N) PengajuanVersi
PengajuanLayanan (1) ──── (N) PengajuanLog
PengajuanLayanan (1) ──── (N) DokumenOutput
PengajuanLayanan (1) ──── (N) NilaiSidang
PengajuanLayanan (1) ──── (N) SlaSchedule

JenisLayanan (1) ──── (N) FieldLayanan
JenisLayanan (1) ──── (N) DokumenPersyaratan
JenisLayanan (1) ──── (N) WorkflowDefinition

WorkflowDefinition (1) ──── (N) WorkflowStep
WorkflowStep (1) ──── (N) WorkflowStepAction

Mahasiswa (1) ──── (0..1) JudulSkripsi
JudulSkripsi (1) ──── (N) JudulSkripsiHistory

DokumenOutput (1) ──── (0..1) DokumenVerifikasi
DokumenVerifikasi (1) ──── (N) VerifikasiLog

User (1) ──── (0..1) TtdScan
```

---

## Index Database (Performance)

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_system_role ON users(system_role);

-- Mahasiswa
CREATE INDEX idx_mahasiswa_nim ON mahasiswa(nim);
CREATE INDEX idx_mahasiswa_prodi ON mahasiswa(prodi_id, status_mahasiswa);

-- Pengajuan
CREATE INDEX idx_pengajuan_mahasiswa ON pengajuan_layanan(mahasiswa_id, status);
CREATE INDEX idx_pengajuan_jenis ON pengajuan_layanan(jenis_layanan_id, status);
CREATE INDEX idx_pengajuan_prodi ON pengajuan_layanan(prodi_id, status);
CREATE INDEX idx_pengajuan_period ON pengajuan_layanan(academic_period_id, status);
CREATE INDEX idx_pengajuan_kode ON pengajuan_layanan(kode_pengajuan);

-- Assignments
CREATE INDEX idx_assignments_dosen ON assignments(dosen_id, assignment_type);
CREATE INDEX idx_assignments_mahasiswa ON assignments(mahasiswa_id, is_active);
CREATE INDEX idx_assignments_pengajuan ON assignments(pengajuan_id);

-- Structural Positions
CREATE INDEX idx_pos_code_active ON structural_positions(position_code, is_active);

-- Notifications
CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Penomoran
CREATE UNIQUE INDEX idx_penomoran_unique ON penomoran_counter(academic_period_id, kode_klasifikasi_id, scope_level, scope_id, nomor_urut);

-- SLA
CREATE INDEX idx_sla_deadline ON sla_schedules(deadline, is_triggered);

-- Verifikasi
CREATE INDEX idx_verifikasi_token ON dokumen_verifikasi(token);
```

---

## Seed Data (Data Awal)

Data yang harus di-seed sebelum sistem go-live:

```typescript
// prisma/seed.ts

// 1. Kode Klasifikasi
const kodeKlasifikasi = [
  { kode: 'PP.00.9', nama: 'Pendidikan dan Pengajaran', deskripsi: 'Layanan akademik umum' },
  { kode: 'KP.01.2', nama: 'Kepegawaian - SK', deskripsi: 'SK Pembimbing Skripsi' },
  { kode: 'TL.00', nama: 'Penelitian', deskripsi: 'Pengantar penelitian' },
  { kode: 'KS.01', nama: 'Kerjasama', deskripsi: 'Permohonan magang' }
];

// 2. Fakultas
const fakultas = [
  { kode: 'FUDA', nama: 'Fakultas Ushuluddin dan Adab' }
];

// 3. Prodi (sesuaikan dengan prodi yang ada di FUDA)
const prodi = [
  { kode: 'IH', nama: 'Ilmu Hadis', fakultas_kode: 'FUDA' },
  { kode: 'IAT', nama: 'Ilmu Al-Quran dan Tafsir', fakultas_kode: 'FUDA' }
  // ... tambah prodi lain
];

// 4. Jenis Layanan (13 layanan)
// 5. Field Layanan per layanan
// 6. Dokumen Persyaratan per layanan
// 7. Workflow Definitions per layanan
// 8. Workflow Steps per workflow
// 9. Workflow Step Actions per step
// 10. Super admin user awal
```

---

## Database Constraints (Tambahan di PostgreSQL)

```sql
-- CHECK: user harus punya tepat satu profile
ALTER TABLE users ADD CONSTRAINT check_user_profile
  CHECK (
    (dosen_id IS NOT NULL AND pegawai_id IS NULL AND mahasiswa_id IS NULL) OR
    (dosen_id IS NULL AND pegawai_id IS NOT NULL AND mahasiswa_id IS NULL) OR
    (dosen_id IS NULL AND pegawai_id IS NULL AND mahasiswa_id IS NOT NULL)
  );

-- CHECK: structural_position holder harus dosen atau pegawai (bukan keduanya)
ALTER TABLE structural_positions ADD CONSTRAINT check_position_holder
  CHECK (
    (dosen_id IS NOT NULL AND pegawai_id IS NULL) OR
    (dosen_id IS NULL AND pegawai_id IS NOT NULL)
  );

-- CHECK: hanya 1 academic_period dengan status 'active'
CREATE UNIQUE INDEX unique_active_period ON academic_periods(status)
  WHERE status = 'active';
```
