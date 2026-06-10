import { test, expect } from "@playwright/test";
import { login, logout, USERS } from "./helpers/auth";

test.describe("01 — Autentikasi", () => {
  test("Register mahasiswa baru dengan NIM valid", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1, h2, [class*='title']").first()).toBeVisible();

    // Step 1: input NIM
    await page.fill("#nim", "221360002");
    await page.click('button[type="submit"]');

    // Step 2: form muncul dengan data mahasiswa
    await expect(page.locator("text=Budi Santoso")).toBeVisible({ timeout: 5000 });

    // Isi email + password
    await page.fill("#email", `budi.test.${Date.now()}@student.uinbanten.ac.id`);
    await page.fill("#password", "password123");
    await page.click('button[type="submit"]');

    // Redirect ke login setelah sukses
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test("Register dengan NIM tidak valid ditolak", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#nim", "999999999");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=tidak valid, text=tidak terdaftar").first()).toBeVisible({ timeout: 5000 });
  });

  test("Login mahasiswa berhasil", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await expect(page).toHaveURL(/\/(dashboard|pengajuan)/, { timeout: 8000 });
  });

  test("Login dengan password salah ditolak", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="identifier"]', USERS.mahasiswa.identifier);
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=salah, text=gagal, text=invalid, text=Kredensial").first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 3000 });
  });

  test("Login staff prodi berhasil dan melihat menu admin", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await expect(page).toHaveURL(/\/(dashboard|pengajuan)/, { timeout: 8000 });
  });

  test("Login super admin berhasil dan akses panel admin", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 5000 });
  });

  test("Akses dashboard tanpa login diredirect ke login", async ({ page }) => {
    await page.goto("/pengajuan");
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
