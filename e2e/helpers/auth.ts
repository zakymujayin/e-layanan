import { Page } from "@playwright/test";

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
  // Direct POST to credentials endpoint with form data.
  // This sets the session cookie in the page context.
  await page.request.post("http://localhost:3003/api/auth/callback/credentials", {
    form: {
      identifier: user.identifier,
      password: user.password,
      redirect: "false",
      json: "true",
    },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }).catch(() => {}); // ignore response - cookies are set automatically

  // Navigate to dashboard to verify
  await page.goto("/dashboard", { timeout: 15000, waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const url = page.url();
  if (url.includes("/login")) {
    throw new Error(`Login failed for ${user.identifier}: still on login page`);
  }
}

export async function logout(page: Page) {
  await page.goto("/api/auth/signout");
}
