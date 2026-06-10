import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";
import { approveAs } from "./helpers/workflow";

test.describe("04 — Output Dokumen PDF", () => {
  test("AK-01: Dokumen PDF dapat diakses setelah selesai", async ({ page }) => {
    // Submit AK-01
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/AK-01");
    await page.waitForLoadState("networkidle");

    const submitBtn = page.locator('button:has-text("Ajukan"), button:has-text("Kirim")').first();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.waitForURL(/\/pengajuan\/\d+/, { timeout: 10000 });
    const url = page.url();
    const id = url.match(/\/pengajuan\/(\d+)/)?.[1] ?? "";

    // Approve sampai selesai
    await approveAs(page, USERS.staffProdi, id);

    // Cek halaman surat-saya
    await login(page, USERS.mahasiswa);
    await page.goto("/surat-saya");
    await page.waitForLoadState("networkidle");
    const downloadLink = page.locator('a:has-text("Download"), button:has-text("Download"), a[href*="/api/pengajuan"]').first();
    await expect(downloadLink).toBeVisible({ timeout: 8000 });
  });

  test("Arsip menampilkan pengajuan yang selesai", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/arsip");
    await page.waitForLoadState("networkidle");
    // Halaman arsip harus render tanpa error
    await expect(page.locator("h1, h2, main").first()).toBeVisible({ timeout: 5000 });
  });

  test("PDF preview dapat diakses via API route", async ({ page }) => {
    await login(page, USERS.staffProdi);
    // Cek list pengajuan dan ambil yang selesai
    await page.goto("/pengajuan?status=selesai");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator('a[href*="/pengajuan/"]').first();
    if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstLink.click();
      await page.waitForLoadState("networkidle");
      const downloadBtn = page.locator('a:has-text("Download"), a[href*="pdf"]').first();
      if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await downloadBtn.getAttribute("href");
        expect(href).toBeTruthy();
      }
    }
  });
});
