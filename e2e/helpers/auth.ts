import { Page, expect } from "@playwright/test";

export const USERS = {
  mahasiswa: { identifier: "aini@student.uinbanten.ac.id", password: "password123" },
  staffProdi: { identifier: "budi@uinbanten.ac.id", password: "password123" },
  kaprodi: { identifier: "siti@uinbanten.ac.id", password: "password123" },
  sekprodi: { identifier: "hasan@uinbanten.ac.id", password: "password123" },
  wd1: { identifier: "yani@uinbanten.ac.id", password: "password123" },
  dekan: { identifier: "dekan@uinbanten.ac.id", password: "password123" },
  kabag: { identifier: "karim@uinbanten.ac.id", password: "password123" },
  staffAkademik: { identifier: "maryam@uinbanten.ac.id", password: "password123" },
  dosenPA: { identifier: "ahmad@uinbanten.ac.id", password: "password123" },
  kepalaLab: { identifier: "hamdan@uinbanten.ac.id", password: "password123" },
  admin: { identifier: "admin@sila.local", password: "password123" },
};

export async function login(page: Page, user: { identifier: string; password: string }) {
  await page.goto("/login", { timeout: 10000, waitUntil: "domcontentloaded" });
  await page.fill('[name="identifier"]', user.identifier);
  await page.fill('[name="password"]', user.password);
  await page.click('button[type="submit"]');
  // Wait for dashboard content — more reliable than waitForURL for client-side nav
  await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
}

export async function logout(page: Page) {
  await page.goto("/api/auth/signout");
}
