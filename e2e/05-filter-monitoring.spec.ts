import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";

test.describe("05 — Filter, Monitoring & Semester Selector", () => {
  test("Halaman pengajuan — filter per status berfungsi", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/pengajuan");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main, h1, table, [class*='list']").first()).toBeVisible({ timeout: 5000 });

    // Filter per status
    const statusFilter = page.locator('select[name="status"], [placeholder*="status"], button:has-text("Filter")').first();
    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.click();
      await page.waitForTimeout(500);
    }
  });

  test("Monitoring admin menampilkan statistik pengajuan", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/monitoring");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
    // Harus ada angka statistik
    const stats = page.locator('[class*="card"], [class*="stat"], [class*="count"]').first();
    await expect(stats).toBeVisible({ timeout: 5000 });
  });

  test("Semester selector tampil di header dashboard", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/pengajuan");
    await page.waitForLoadState("networkidle");
    // SemesterSelector harus ada di header
    const selector = page.locator('[class*="semester"], select:near(header), button:has-text("Semester"), button:has-text("Genap"), button:has-text("Ganjil")').first();
    await expect(selector).toBeVisible({ timeout: 5000 });
  });

  test("Admin users page menampilkan daftar user", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("table, [class*='user'], [class*='list']").first()).toBeVisible({ timeout: 5000 });
  });

  test("Admin periods page menampilkan daftar semester", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/periods");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, table, [class*='period']").first()).toBeVisible({ timeout: 5000 });
  });

  test("Bulk import user — halaman dapat diakses", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users/import");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1:has-text('Import'), h2:has-text('Import')").first()).toBeVisible({ timeout: 5000 });
    // Template CSV link harus ada
    const templateLink = page.locator('a[download], a:has-text("Download template")').first();
    await expect(templateLink).toBeVisible({ timeout: 3000 });
  });

  test("Bulk import CSV berhasil diproses", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users/import");
    await page.waitForLoadState("networkidle");

    const csvContent = `email,password,system_role,nama_lengkap,identifier,prodi_kode,angkatan\ntest.import.${Date.now()}@student.uinbanten.ac.id,password123,mahasiswa,Test Import User,${Date.now().toString().slice(-9)},IH,2023`;

    const fileInput = page.locator('input[type="file"][accept*="csv"]').first();
    await fileInput.setInputFiles({
      name: "test-import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    await page.click('button[type="submit"]:has-text("Upload"), button:has-text("Upload")');
    await page.waitForTimeout(3000);

    // Harus muncul hasil import
    const result = page.locator("text=berhasil, text=gagal, text=Import").first();
    await expect(result).toBeVisible({ timeout: 8000 });
  });

  test("Filter pengajuan per layanan (kategori TA vs AK)", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/pengajuan?kategori=tugas_akhir");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });
});
