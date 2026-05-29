-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('mahasiswa', 'dosen', 'staff_prodi', 'staff_akademik', 'kabag', 'super_admin');

-- CreateEnum
CREATE TYPE "StatusMahasiswa" AS ENUM ('aktif', 'cuti', 'alumni', 'do', 'keluar');

-- CreateEnum
CREATE TYPE "PositionCode" AS ENUM ('sekprodi', 'kaprodi', 'wakil_dekan_1', 'dekan', 'kabag_tu', 'kepala_lab');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('dosen_pa', 'pembimbing_skripsi_1', 'pembimbing_skripsi_2', 'penguji_proposal', 'penguji_komprehensif_prodi', 'penguji_komprehensif_keislaman', 'penguji_skripsi', 'ketua_sidang', 'sekretaris_sidang', 'dosen_pembimbing_observasi', 'dosen_pembimbing_magang');

-- CreateEnum
CREATE TYPE "TipeSemester" AS ENUM ('ganjil', 'genap');

-- CreateEnum
CREATE TYPE "StatusSemester" AS ENUM ('upcoming', 'active', 'completed');

-- CreateEnum
CREATE TYPE "KategoriLayanan" AS ENUM ('tugas_akhir', 'akademik');

-- CreateEnum
CREATE TYPE "TipeField" AS ENUM ('text', 'textarea', 'number', 'date', 'datetime', 'time', 'select', 'multi_select', 'radio', 'checkbox', 'file', 'repeater', 'dosen_picker', 'mahasiswa_picker');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('draft', 'submitted', 'pending_staff_prodi', 'pending_staff_akademik', 'pending_pa', 'pending_kaprodi', 'pending_sekprodi', 'pending_kabag', 'pending_wd1', 'pending_dekan', 'pending_kepala_lab', 'bypass_active', 'revision_required', 'selesai', 'terminated');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('info', 'success', 'warning', 'urgent');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('in_app', 'email', 'whatsapp');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "system_role" "SystemRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dosen_id" INTEGER,
    "pegawai_id" INTEGER,
    "mahasiswa_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosen" (
    "id" SERIAL NOT NULL,
    "nidn" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "gelar_depan" TEXT,
    "gelar_belakang" TEXT,
    "jabatan_fungsional" TEXT,
    "bidang_keahlian" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pegawai" (
    "id" SERIAL NOT NULL,
    "nip" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "golongan" TEXT,
    "unit_kerja" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" SERIAL NOT NULL,
    "nim" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "jenisKelamin" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "prodi_id" INTEGER NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "semester_aktif" INTEGER,
    "status_mahasiswa" "StatusMahasiswa" NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fakultas" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prodi" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "fakultas_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structural_positions" (
    "id" SERIAL NOT NULL,
    "position_code" "PositionCode" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dosen_id" INTEGER,
    "pegawai_id" INTEGER,
    "prodi_id" INTEGER,

    CONSTRAINT "structural_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" SERIAL NOT NULL,
    "assignment_type" "AssignmentType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dosen_id" INTEGER NOT NULL,
    "mahasiswa_id" INTEGER,
    "pengajuan_id" INTEGER,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" SERIAL NOT NULL,
    "nama_semester" TEXT NOT NULL,
    "tahun_akademik" TEXT NOT NULL,
    "tipe" "TipeSemester" NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_berakhir" TIMESTAMP(3),
    "status" "StatusSemester" NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_layanan" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" "KategoriLayanan" NOT NULL,
    "scope_level" TEXT NOT NULL,
    "kode_klasifikasi_id" INTEGER NOT NULL,
    "template_kode" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "jenis_layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_layanan" (
    "id" SERIAL NOT NULL,
    "jenis_layanan_id" INTEGER NOT NULL,
    "nama_field" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tipe_field" "TipeField" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "validation_rule" JSONB,
    "kondisi_tampil" JSONB,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "placeholder" TEXT,
    "keterangan" TEXT,

    CONSTRAINT "field_layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_persyaratan" (
    "id" SERIAL NOT NULL,
    "jenis_layanan_id" INTEGER NOT NULL,
    "nama_dokumen" TEXT NOT NULL,
    "format_diizinkan" TEXT[],
    "ukuran_max_mb" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "validation_rule" JSONB,
    "sumber_validasi" TEXT,

    CONSTRAINT "dokumen_persyaratan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" SERIAL NOT NULL,
    "jenis_layanan_id" INTEGER NOT NULL,
    "versi" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" SERIAL NOT NULL,
    "workflow_definition_id" INTEGER NOT NULL,
    "step_code" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "status_code" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_condition" JSONB,
    "sla_days" INTEGER,
    "sla_consequence" TEXT,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_actions" (
    "id" SERIAL NOT NULL,
    "workflow_step_id" INTEGER NOT NULL,
    "action_code" TEXT NOT NULL,
    "target_status" TEXT NOT NULL,
    "requires_reason" BOOLEAN NOT NULL DEFAULT false,
    "requires_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL,
    "actionConfig" JSONB,

    CONSTRAINT "workflow_step_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_layanan" (
    "id" SERIAL NOT NULL,
    "kode_pengajuan" TEXT NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "jenis_layanan_id" INTEGER NOT NULL,
    "academic_period_id" INTEGER NOT NULL,
    "workflow_definition_id" INTEGER NOT NULL,
    "status" "StatusPengajuan" NOT NULL DEFAULT 'pending_staff_prodi',
    "current_step_code" TEXT,
    "scope_level" TEXT NOT NULL,
    "fakultas_id" INTEGER NOT NULL,
    "prodi_id" INTEGER,
    "revisi_ke" INTEGER NOT NULL DEFAULT 1,
    "is_bypass" BOOLEAN NOT NULL DEFAULT false,
    "returned_from" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "terminated_at" TIMESTAMP(3),

    CONSTRAINT "pengajuan_layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_data" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER NOT NULL,
    "field_values" JSONB NOT NULL,

    CONSTRAINT "pengajuan_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_dokumen" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER NOT NULL,
    "dokumen_persyaratan_id" INTEGER,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "versi" INTEGER NOT NULL DEFAULT 1,
    "is_auto_attached" BOOLEAN NOT NULL DEFAULT false,
    "di_upload_oleh" INTEGER NOT NULL,
    "di_upload_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengajuan_dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_versi" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER NOT NULL,
    "versi_ke" INTEGER NOT NULL,
    "data_snapshot" JSONB NOT NULL,
    "dokumen_snapshot" JSONB NOT NULL,
    "dibuat_oleh" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alasan_perubahan" TEXT,

    CONSTRAINT "pengajuan_versi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_log" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER NOT NULL,
    "action_code" TEXT NOT NULL,
    "performed_by" INTEGER NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT,
    "target_step" TEXT,
    "alasan" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengajuan_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judul_skripsi" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "judul_aktif" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judul_skripsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judul_skripsi_history" (
    "id" SERIAL NOT NULL,
    "judul_skripsi_id" INTEGER NOT NULL,
    "versi_ke" INTEGER NOT NULL,
    "judul_text" TEXT NOT NULL,
    "diubah_oleh" INTEGER NOT NULL,
    "diubah_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "konteks_perubahan" TEXT,
    "alasan_perubahan" TEXT,
    "referensi_pengajuan_id" INTEGER,

    CONSTRAINT "judul_skripsi_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kode_klasifikasi" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,

    CONSTRAINT "kode_klasifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penomoran_counter" (
    "id" SERIAL NOT NULL,
    "academic_period_id" INTEGER NOT NULL,
    "kode_klasifikasi_id" INTEGER NOT NULL,
    "scope_level" TEXT NOT NULL,
    "scope_id" INTEGER,
    "pengajuan_id" INTEGER,
    "nomor_urut" INTEGER NOT NULL,
    "nomor_formatted" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),

    CONSTRAINT "penomoran_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_output" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER NOT NULL,
    "jenis_dokumen" TEXT NOT NULL,
    "nomor_surat" TEXT,
    "file_path_preview" TEXT,
    "file_path_final" TEXT,
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized_at" TIMESTAMP(3),
    "signed_by" INTEGER,

    CONSTRAINT "dokumen_output_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_verifikasi" (
    "id" SERIAL NOT NULL,
    "dokumen_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "qr_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dokumen_verifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifikasi_log" (
    "id" BIGSERIAL NOT NULL,
    "dokumen_verifikasi_id" INTEGER NOT NULL,
    "ip_address" TEXT NOT NULL,
    "is_success" BOOLEAN NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifikasi_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ttd_scans" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ttd_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai_sidang" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "assignment_type" "AssignmentType" NOT NULL,
    "nilai" DOUBLE PRECISION,
    "catatan" TEXT,
    "keputusan" TEXT,
    "nilai_per_penilai" JSONB,
    "nilai_akhir" DOUBLE PRECISION,
    "ipk_equivalent" DOUBLE PRECISION,
    "yudisium" TEXT,
    "input_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nilai_sidang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_schedules" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER NOT NULL,
    "step_code" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "consequence" TEXT NOT NULL,
    "is_triggered" BOOLEAN NOT NULL DEFAULT false,
    "triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sla_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'info',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'in_app',
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "request_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_dosen_id_key" ON "users"("dosen_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_pegawai_id_key" ON "users"("pegawai_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_mahasiswa_id_key" ON "users"("mahasiswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nidn_key" ON "dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "pegawai_nip_key" ON "pegawai"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_kode_key" ON "fakultas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "prodi_kode_key" ON "prodi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_layanan_kode_key" ON "jenis_layanan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "pengajuan_layanan_kode_pengajuan_key" ON "pengajuan_layanan"("kode_pengajuan");

-- CreateIndex
CREATE UNIQUE INDEX "pengajuan_data_pengajuan_id_key" ON "pengajuan_data"("pengajuan_id");

-- CreateIndex
CREATE UNIQUE INDEX "kode_klasifikasi_kode_key" ON "kode_klasifikasi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "dokumen_verifikasi_dokumen_id_key" ON "dokumen_verifikasi"("dokumen_id");

-- CreateIndex
CREATE UNIQUE INDEX "dokumen_verifikasi_token_key" ON "dokumen_verifikasi"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ttd_scans_user_id_key" ON "ttd_scans"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_fakultas_id_fkey" FOREIGN KEY ("fakultas_id") REFERENCES "fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structural_positions" ADD CONSTRAINT "structural_positions_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structural_positions" ADD CONSTRAINT "structural_positions_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "pegawai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structural_positions" ADD CONSTRAINT "structural_positions_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jenis_layanan" ADD CONSTRAINT "jenis_layanan_kode_klasifikasi_id_fkey" FOREIGN KEY ("kode_klasifikasi_id") REFERENCES "kode_klasifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_layanan" ADD CONSTRAINT "field_layanan_jenis_layanan_id_fkey" FOREIGN KEY ("jenis_layanan_id") REFERENCES "jenis_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_persyaratan" ADD CONSTRAINT "dokumen_persyaratan_jenis_layanan_id_fkey" FOREIGN KEY ("jenis_layanan_id") REFERENCES "jenis_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_jenis_layanan_id_fkey" FOREIGN KEY ("jenis_layanan_id") REFERENCES "jenis_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_actions" ADD CONSTRAINT "workflow_step_actions_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_layanan" ADD CONSTRAINT "pengajuan_layanan_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_layanan" ADD CONSTRAINT "pengajuan_layanan_jenis_layanan_id_fkey" FOREIGN KEY ("jenis_layanan_id") REFERENCES "jenis_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_layanan" ADD CONSTRAINT "pengajuan_layanan_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_data" ADD CONSTRAINT "pengajuan_data_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_dokumen" ADD CONSTRAINT "pengajuan_dokumen_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_dokumen" ADD CONSTRAINT "pengajuan_dokumen_dokumen_persyaratan_id_fkey" FOREIGN KEY ("dokumen_persyaratan_id") REFERENCES "dokumen_persyaratan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_versi" ADD CONSTRAINT "pengajuan_versi_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_log" ADD CONSTRAINT "pengajuan_log_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judul_skripsi" ADD CONSTRAINT "judul_skripsi_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judul_skripsi_history" ADD CONSTRAINT "judul_skripsi_history_judul_skripsi_id_fkey" FOREIGN KEY ("judul_skripsi_id") REFERENCES "judul_skripsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penomoran_counter" ADD CONSTRAINT "penomoran_counter_academic_period_id_fkey" FOREIGN KEY ("academic_period_id") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penomoran_counter" ADD CONSTRAINT "penomoran_counter_kode_klasifikasi_id_fkey" FOREIGN KEY ("kode_klasifikasi_id") REFERENCES "kode_klasifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penomoran_counter" ADD CONSTRAINT "penomoran_counter_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_output" ADD CONSTRAINT "dokumen_output_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_verifikasi" ADD CONSTRAINT "dokumen_verifikasi_dokumen_id_fkey" FOREIGN KEY ("dokumen_id") REFERENCES "dokumen_output"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifikasi_log" ADD CONSTRAINT "verifikasi_log_dokumen_verifikasi_id_fkey" FOREIGN KEY ("dokumen_verifikasi_id") REFERENCES "dokumen_verifikasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ttd_scans" ADD CONSTRAINT "ttd_scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_sidang" ADD CONSTRAINT "nilai_sidang_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_sidang" ADD CONSTRAINT "nilai_sidang_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_schedules" ADD CONSTRAINT "sla_schedules_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
