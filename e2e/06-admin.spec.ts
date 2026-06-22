import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";

test.describe("06 — Admin Functions", () => {
  test("Admin config SMTP dapat diakses", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/config");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main, form, h1").first()).toBeVisible({ timeout: 6000 });
  });

  test("Admin dosen page menampilkan list dosen", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/dosen");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Admin prodi page menampilkan list prodi", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/prodi");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Admin penomoran page berfungsi", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/penomoran");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Non-admin tidak dapat akses halaman admin", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/admin/users");
    // Harus diredirect atau dapat error forbidden
    await expect(page).not.toHaveURL(/\/admin\/users/, { timeout: 6000 });
  });

  test("Halaman profil mahasiswa dapat diakses", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/profil");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2, form, main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Dashboard mahasiswa menampilkan konten utama", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  test("Dashboard staff prodi menampilkan konten utama", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });
});
