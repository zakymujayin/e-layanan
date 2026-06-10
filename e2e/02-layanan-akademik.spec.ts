import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";
import { approveAs, getPengajuanId } from "./helpers/workflow";

/**
 * Layanan Akademik (AK-01 s/d AK-07) — alur pendek: mahasiswa submit → staff prodi setujui → selesai.
 */

async function submitLayananAkademik(page: any, kode: string, extraFields?: Record<string, string>) {
  await login(page, USERS.mahasiswa);
  await page.goto(`/pengajuan/baru/${kode}`);
  await page.waitForLoadState("networkidle");

  // Isi field tambahan jika ada
  if (extraFields) {
    for (const [selector, value] of Object.entries(extraFields)) {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        await el.fill(value);
      }
    }
  }

  // Upload file persyaratan jika ada file input
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  for (let i = 0; i < count; i++) {
    // Buat file dummy untuk test
    await fileInputs.nth(i).setInputFiles({
      name: "test-dokumen.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test document"),
    });
  }

  const submitBtn = page.locator('button[type="submit"]:has-text("Ajukan"), button:has-text("Submit"), button:has-text("Kirim Pengajuan")').first();
  await submitBtn.click();
  await page.waitForTimeout(2000);

  // Redirect ke detail pengajuan
  await page.waitForURL(/\/pengajuan\/\d+/, { timeout: 10000 });
  return getPengajuanId(page);
}

test.describe("02 — Layanan Akademik", () => {
  test("AK-01: Surat Keterangan Aktif Kuliah — submit + approve + selesai", async ({ page }) => {
    const id = await submitLayananAkademik(page, "AK-01");
    expect(id).toBeTruthy();

    await approveAs(page, USERS.staffProdi, id);

    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    // Harus ada tombol download atau status selesai
    const hasDownload = await page.locator('a:has-text("Download"), button:has-text("Download"), text=Selesai').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasDownload).toBeTruthy();
  });

  test("AK-02: Surat Keterangan Masih Kuliah — submit berhasil", async ({ page }) => {
    const id = await submitLayananAkademik(page, "AK-02");
    expect(id).toBeTruthy();
  });

  test("AK-03: Surat Keterangan Pernah Kuliah — submit berhasil", async ({ page }) => {
    const id = await submitLayananAkademik(page, "AK-03");
    expect(id).toBeTruthy();
  });

  test("AK-04: Surat Pengantar Observasi — submit berhasil", async ({ page }) => {
    const id = await submitLayananAkademik(page, "AK-04", {
      'input[name="nama_instansi"], input[placeholder*="instansi"]': "PT Test Indonesia",
    });
    expect(id).toBeTruthy();
  });

  test("AK-05: Surat Pengantar Penelitian — submit berhasil", async ({ page }) => {
    const id = await submitLayananAkademik(page, "AK-05", {
      'input[name="nama_instansi"], input[placeholder*="instansi"]': "Desa Cikaret",
    });
    expect(id).toBeTruthy();
  });

  test("AK-06: Surat Permohonan Magang — submit berhasil", async ({ page }) => {
    const id = await submitLayananAkademik(page, "AK-06", {
      'input[name="nama_instansi"], input[placeholder*="instansi"]': "Bank BRI Cabang Serang",
    });
    expect(id).toBeTruthy();
  });

  test("AK-01: Reject oleh staff prodi → mahasiswa dapat notifikasi revisi", async ({ page }) => {
    const id = await submitLayananAkademik(page, "AK-01");

    await login(page, USERS.staffProdi);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");

    const rejectBtn = page.locator('button:has-text("Tolak"), button:has-text("Kembalikan")').first();
    if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.waitForTimeout(500);
      const alasanField = page.locator('textarea, input[name="alasan"]').first();
      if (await alasanField.isVisible({ timeout: 1500 }).catch(() => false)) {
        await alasanField.fill("Dokumen tidak lengkap");
      }
      const konfirmBtn = page.locator('button:has-text("Kirim"), button:has-text("Tolak"), button[type="submit"]').last();
      await konfirmBtn.click();
      await page.waitForTimeout(1500);
    }

    // Mahasiswa melihat status dikembalikan
    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=dikembalikan, text=revisi, text=revision").first()).toBeVisible({ timeout: 5000 });
  });
});
