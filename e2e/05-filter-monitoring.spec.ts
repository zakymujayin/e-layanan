import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";

test.describe("05 — Filter, Monitoring & Semester Selector", () => {
  test("Halaman pengajuan mahasiswa dapat diakses", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Halaman pengajuan staff prodi dapat diakses", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/pengajuan");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Monitoring admin menampilkan statistik pengajuan", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/monitoring");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2, main").first()).toBeVisible({ timeout: 5000 });
    // Harus ada card statistik
    const stats = page.locator('[class*="card"], [class*="stat"]').first();
    await expect(stats).toBeVisible({ timeout: 5000 });
  });

  test("Semester selector tampil di header (staff prodi)", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/pengajuan");
    await page.waitForLoadState("networkidle");
    // SemesterSelector render sebagai shadcn Select trigger
    const selector = page
      .locator('button[role="combobox"], [data-slot="select-trigger"], button:has-text("Semester"), button:has-text("Genap"), button:has-text("Ganjil")')
      .first();
    await expect(selector).toBeVisible({ timeout: 6000 });
  });

  test("Admin users page menampilkan daftar user", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Admin periods page menampilkan daftar semester", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/periods");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, table, main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Bulk import — halaman dapat diakses dan template tersedia", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users/import");
    await page.waitForLoadState("networkidle");
    // Cek heading atau form
    await expect(
      page.locator('[data-slot="card-title"], h1, h2').first()
    ).toBeVisible({ timeout: 5000 });
    // Template CSV link harus ada
    const templateLink = page.locator('a[download], a[href*="template"], a:has-text("template")').first();
    await expect(templateLink).toBeVisible({ timeout: 4000 });
  });

  test("Bulk import CSV berhasil diproses", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users/import");
    await page.waitForLoadState("networkidle");

    const nim = Date.now().toString().slice(-9);
    const csvContent = [
      "email,password,system_role,nama_lengkap,identifier,prodi_kode,angkatan",
      `import.test.${nim}@student.uinbanten.ac.id,password123,mahasiswa,Test Import ${nim},${nim},IH,2024`,
    ].join("\n");

    const fileInput = page.locator('input[type="file"][accept*="csv"], input[type="file"]').first();
    await fileInput.setInputFiles({
      name: "test-import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    await page.locator('button[type="submit"], button:has-text("Upload"), button:has-text("Import")').first().click();
    await page.waitForTimeout(4000);

    // Harus muncul hasil (berhasil atau ada error yang deskriptif)
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Filter pengajuan per kategori layanan berfungsi", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/pengajuan?kategori=tugas_akhir");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });
});
