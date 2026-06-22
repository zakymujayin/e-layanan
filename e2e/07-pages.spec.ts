import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";

const ALL_PAGES = [
  { url: "/login", description: "Login page" },
  { url: "/register", description: "Register page" },
  { url: "/dashboard", description: "Dashboard (mahasiswa)", user: USERS.mahasiswa },
  { url: "/pengajuan", description: "Pengajuan list (mahasiswa)", user: USERS.mahasiswa },
  { url: "/pengajuan/baru", description: "New pengajuan form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=TA-01", description: "New TA-01 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=TA-06", description: "New TA-06 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=AK-01", description: "New AK-01 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=AK-02", description: "New AK-02 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=AK-03", description: "New AK-03 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=AK-04", description: "New AK-04 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=AK-05", description: "New AK-05 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=AK-06", description: "New AK-06 form", user: USERS.mahasiswa },
  { url: "/pengajuan/baru?jenis=AK-07", description: "New AK-07 form", user: USERS.mahasiswa },
  { url: "/dashboard", description: "Dashboard (staff_prodi)", user: USERS.staffProdi },
  { url: "/pengajuan", description: "Pengajuan list (staff_prodi)", user: USERS.staffProdi },
  { url: "/dashboard", description: "Dashboard (kaprodi)", user: USERS.kaprodi },
  { url: "/dashboard", description: "Dashboard (sekprodi)", user: USERS.sekprodi },
  { url: "/dashboard", description: "Dashboard (wd1)", user: USERS.wd1 },
  { url: "/dashboard", description: "Dashboard (dekan)", user: USERS.dekan },
  { url: "/dashboard", description: "Dashboard (staff_akademik)", user: USERS.staffAkademik },
  { url: "/dashboard", description: "Dashboard (kabag)", user: USERS.kabag },
  { url: "/dashboard", description: "Dashboard (dosen_pa)", user: USERS.dosenPA },
  { url: "/dashboard", description: "Dashboard (kepala_lab)", user: USERS.kepalaLab },
  { url: "/dashboard", description: "Dashboard (admin)", user: USERS.admin },
  { url: "/admin/users", description: "Admin users page", user: USERS.admin },
  { url: "/admin/config", description: "Admin config page", user: USERS.admin },
  { url: "/admin/jenis-layanan", description: "Admin jenis layanan page", user: USERS.admin },
  { url: "/admin/penomoran", description: "Admin penomoran page", user: USERS.admin },
  { url: "/admin/periods", description: "Admin academic periods page", user: USERS.admin },
  { url: "/admin/positions", description: "Admin positions page", user: USERS.admin },
  { url: "/admin/prodi", description: "Admin prodi page", user: USERS.admin },
  { url: "/admin/workflow", description: "Admin workflow page", user: USERS.admin },
  { url: "/monitoring", description: "Monitoring page", user: USERS.staffProdi },
  { url: "/profil", description: "Profil page", user: USERS.mahasiswa },
  { url: "/verifikasi", description: "Verifikasi page (unauthenticated)" },
];

test.describe("07 — All Pages Load", () => {
  for (const { url, description, user } of ALL_PAGES) {
    test(`${description} (${url})`, async ({ page }) => {
      if (user) {
        await login(page, user);
      }

      const response = await page.goto(url, { timeout: 25000, waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);

      const status = response?.status() ?? 0;
      expect(status, `${url} returned ${status}`).toBeLessThan(500);

      const title = await page.title().catch(() => "");
      expect(title.length).toBeGreaterThan(0);

      const bodyContent = await page.locator("body").innerHTML().catch(() => "");
      expect(bodyContent.length).toBeGreaterThan(100);
    });
  }
});
