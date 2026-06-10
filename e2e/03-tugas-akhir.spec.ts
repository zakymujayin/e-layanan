import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";
import { approveAs, getPengajuanId } from "./helpers/workflow";

async function submitTA(page: any, kode: string, extraFields?: Record<string, string>) {
  await login(page, USERS.mahasiswa);
  await page.goto(`/pengajuan/baru/${kode}`);
  await page.waitForLoadState("networkidle");

  if (extraFields) {
    for (const [selector, value] of Object.entries(extraFields)) {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        await el.fill(value);
      }
    }
  }

  // Upload dokumen persyaratan
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  for (let i = 0; i < count; i++) {
    await fileInputs.nth(i).setInputFiles({
      name: "dokumen-test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
  }

  const submitBtn = page.locator('button[type="submit"]:has-text("Ajukan"), button:has-text("Kirim Pengajuan")').first();
  if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await page.waitForURL(/\/pengajuan\/\d+/, { timeout: 10000 });
  }

  return getPengajuanId(page);
}

test.describe("03 — Tugas Akhir", () => {
  test("TA-01: Pengajuan Judul Skripsi — submit berhasil", async ({ page }) => {
    const id = await submitTA(page, "TA-01", {
      'input[name="judul_skripsi"], textarea[name="judul"]': "Analisis Hadis tentang Ilmu Pengetahuan",
    });
    expect(id).toBeTruthy();

    // Staff prodi verifikasi
    await approveAs(page, USERS.staffProdi, id);

    // PA setujui
    await approveAs(page, USERS.dosenPA, id);

    // Kaprodi setujui
    await approveAs(page, USERS.kaprodi, id);
  });

  test("TA-02: SK Pembimbing — submit dan staff prodi approve", async ({ page }) => {
    const id = await submitTA(page, "TA-02");
    expect(id).toBeTruthy();
    await approveAs(page, USERS.staffProdi, id);
  });

  test("TA-03: Seminar Proposal — submit berhasil", async ({ page }) => {
    const id = await submitTA(page, "TA-03");
    expect(id).toBeTruthy();
  });

  test("TA-04: Ujian Komprehensif — submit berhasil", async ({ page }) => {
    const id = await submitTA(page, "TA-04");
    expect(id).toBeTruthy();
  });

  test("TA-05: Ujian Skripsi (Munaqasyah) — submit berhasil", async ({ page }) => {
    const id = await submitTA(page, "TA-05");
    expect(id).toBeTruthy();
  });

  test("TA-06: Cek Turnitin — submit dan approve staff akademik", async ({ page }) => {
    const id = await submitTA(page, "TA-06");
    expect(id).toBeTruthy();
    await approveAs(page, USERS.staffAkademik, id);
  });

  test("TA-01: Reject oleh PA → kembali ke mahasiswa", async ({ page }) => {
    const id = await submitTA(page, "TA-01", {
      'input[name="judul_skripsi"], textarea[name="judul"]': "Judul Test Reject",
    });

    // Staff prodi approve dulu
    await approveAs(page, USERS.staffProdi, id);

    // PA reject
    await login(page, USERS.dosenPA);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    const rejectBtn = page.locator('button:has-text("Tolak"), button:has-text("Kembalikan")').first();
    if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.waitForTimeout(500);
      const alasanField = page.locator('textarea, input[name="alasan"]').first();
      if (await alasanField.isVisible({ timeout: 1500 }).catch(() => false)) {
        await alasanField.fill("Judul kurang spesifik");
      }
      const konfirmBtn = page.locator('button:has-text("Kirim"), button[type="submit"]').last();
      await konfirmBtn.click();
      await page.waitForTimeout(1500);
    }

    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    const statusEl = page.locator("text=revisi, text=dikembalikan, text=revision").first();
    await expect(statusEl).toBeVisible({ timeout: 8000 });
  });
});
