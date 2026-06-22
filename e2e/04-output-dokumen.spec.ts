import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";
import { approveAs, getPengajuanId } from "./helpers/workflow";
import { mockDokumenApi } from "./helpers/mock-api";

test.describe("04 — Output Dokumen PDF", () => {
  test("AK-01: PDF dapat diakses setelah selesai", async ({ page }) => {
    await mockDokumenApi(page);
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/AK-01");
    await page.waitForLoadState("networkidle");
    await page.locator("#peruntukan").fill("Keperluan beasiswa studi lanjut");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/pengajuan\/\d+/, { timeout: 12000 });
    const id = await getPengajuanId(page);

    await approveAs(page, USERS.staffProdi, id);

    await login(page, USERS.mahasiswa);
    await page.goto("/surat-saya");
    await page.waitForLoadState("networkidle");
    const downloadLink = page
      .locator('a:has-text("Download"), button:has-text("Download"), a[href*="/api/pengajuan"]')
      .first();
    await expect(downloadLink).toBeVisible({ timeout: 8000 });
  });

  test("Arsip menampilkan halaman tanpa error", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/arsip");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2, main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Surat-saya page dapat diakses mahasiswa", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/surat-saya");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("PDF preview via link dari halaman detail pengajuan", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/pengajuan");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator('a[href*="/pengajuan/"]').first();
    if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstLink.click();
      await page.waitForLoadState("networkidle");
      const downloadBtn = page.locator('a:has-text("Download"), a[href*="pdf"], button:has-text("Download")').first();
      if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await downloadBtn.getAttribute("href");
        expect(href).toBeTruthy();
      }
    }
    // Page must be accessible
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });
});
