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
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto("/login", { timeout: 15000 });
      await page.fill('[name="identifier"]', user.identifier);
      await page.fill('[name="password"]', user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|pengajuan|admin)/, { timeout: 15000 });
      return;
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

export async function logout(page: Page) {
  await page.goto("/api/auth/signout");
}
