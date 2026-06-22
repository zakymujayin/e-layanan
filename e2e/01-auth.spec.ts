import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";

test.describe("01 — Autentikasi", () => {
  test("Register mahasiswa baru dengan NIM valid", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-slot="card-title"]').first()).toBeVisible({ timeout: 8000 });

    // Step 1: masukkan NIM test (221360099 tidak pernah di-seed)
    await page.fill("#nim", "221360099");
    await page.click('button[type="submit"]');

    // Step 2: form muncul dengan data mahasiswa
    await expect(page.locator("text=Test Register E2E")).toBeVisible({ timeout: 8000 });

    // Isi email unik + password
    await page.fill("#email", `e2e.register.${Date.now()}@student.uinbanten.ac.id`);
    await page.fill("#password", "password123");
    await page.click('button[type="submit"]');

    // Redirect ke login setelah sukses
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("Register dengan NIM tidak valid ditolak (toast/error muncul)", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.fill("#nim", "999999999");
    await page.click('button[type="submit"]');
    // Sonner toast muncul untuk NIM tidak valid
    const toast = page.locator('[data-sonner-toaster] li, [data-sonner-toast]').first();
    await expect(toast).toBeVisible({ timeout: 6000 });
  });

  test("Login mahasiswa berhasil", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await expect(page).toHaveURL(/\/(dashboard|pengajuan)/, { timeout: 10000 });
  });

  test("Login dengan password salah ditolak (error inline muncul)", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill('[name="identifier"]', USERS.mahasiswa.identifier);
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // URL tetap di login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    // Error ditampilkan sebagai p.text-destructive (bukan toast)
    await expect(
      page.locator('.text-destructive, [class*="destructive"]:not(button)').first()
    ).toBeVisible({ timeout: 6000 });
  });

  test("Login staff prodi berhasil", async ({ page }) => {
    await login(page, USERS.staffProdi);
    await expect(page).toHaveURL(/\/(dashboard|pengajuan)/, { timeout: 10000 });
  });

  test("Login super admin dan akses panel admin", async ({ page }) => {
    await login(page, USERS.admin);
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[data-slot="card-title"], h1, h2, main').first()).toBeVisible({ timeout: 8000 });
  });

  test("Akses halaman pengajuan tanpa login diredirect ke login", async ({ request }) => {
    // Use HTTP client (not browser) to avoid sandbox connection issues
    const res = await request.get("http://localhost:3003/pengajuan", { maxRedirects: 0 });
    // Must be a redirect response (307/302)
    expect([301, 302, 307, 308]).toContain(res.status());
    const location = res.headers()["location"] ?? "";
    expect(location).toMatch(/login/);
  });
});
