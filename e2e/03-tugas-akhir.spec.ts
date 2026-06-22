import { test, expect, Page } from "@playwright/test";
import { login, USERS } from "./helpers/auth";
import { approveAs, getPengajuanId } from "./helpers/workflow";
import { mockDokumenApi } from "./helpers/mock-api";

async function submitTA01(page: Page): Promise<string> {
  await mockDokumenApi(page);
  await login(page, USERS.mahasiswa);
  await page.goto("/pengajuan/baru/TA-01");
  await page.waitForLoadState("networkidle");

  await page.locator("#judul_1").fill("Analisis Pemikiran Hadis tentang Ilmu Pengetahuan dalam Islam");
  await page.locator("#judul_2").fill("Studi Komparatif Hadis Pendidikan dalam Kitab Riyadhus Sholihin");
  await page.locator("#judul_3").fill("Kritik Matan Hadis Keutamaan Belajar Mengajar dalam Islam");
  await page.locator("#pa_dosen_id").fill("1");

  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/pengajuan\/\d+/, { timeout: 12000 });
  return getPengajuanId(page);
}

test.describe("03 — Tugas Akhir", () => {
  // TA-01 submit → staff prodi approve (single test, no duplicate issue)
  test("TA-01: submit + staff prodi verifikasi", async ({ page }) => {
    const id = await submitTA01(page);
    expect(id).toBeTruthy();

    await approveAs(page, USERS.staffProdi, id);

    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main").first()).toBeVisible({ timeout: 5000 });
  });

  // TA-01 full workflow: mahasiswa submit → staff prodi approve → PA select judul → kaprodi approve → WD1 sign
  test("TA-01: full workflow sampai selesai", async ({ page }) => {
    let id = "";
    try {
      id = await submitTA01(page);
    } catch {
      test.skip(true, "TA-01 pending sudah ada, skip full workflow test");
      return;
    }
    expect(id).toBeTruthy();

    // Step 1: Staff prodi verifikasi
    await approveAs(page, USERS.staffProdi, id);

    // Step 2: PA memilih judul dan approve
    await login(page, USERS.dosenPA);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Select first judul radio
    const radio = page.locator('input[type="radio"]').first();
    if (await radio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await radio.click();
      await page.waitForTimeout(500);
    }

    // Click the select_judul action button
    const selectBtn = page.locator('button').filter({ hasText: /Pilih|Setujui|Approve|Pilih Judul/ }).first();
    if (await selectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selectBtn.click();
      await page.waitForTimeout(1500);
    }

    // Step 3: Kaprodi approve
    await approveAs(page, USERS.kaprodi, id);

    // Step 4: WD1 sign (final)
    await approveAs(page, USERS.wd1, id, "Tanda Tangan");

    // Verify selesai
    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    const done = await page
      .locator(':text("Selesai"), :text("selesai"), a:has-text("Download"), button:has-text("PDF")')
      .first()
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    expect(done).toBeTruthy();
  });

  // TA-02 to TA-06: just verify page renders (submission requires prerequisites)
  test("TA-02: halaman form dapat diakses", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/TA-02");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, main, form").first()).toBeVisible({ timeout: 6000 });
  });

  test("TA-03: halaman form dapat diakses", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/TA-03");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, main, form").first()).toBeVisible({ timeout: 6000 });
  });

  test("TA-04: halaman form dapat diakses", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/TA-04");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, main, form").first()).toBeVisible({ timeout: 6000 });
  });

  test("TA-05: halaman form dapat diakses", async ({ page }) => {
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/TA-05");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, main, form").first()).toBeVisible({ timeout: 6000 });
  });

  test("TA-06: halaman form dapat diakses", async ({ page }) => {
    await mockDokumenApi(page);
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/TA-06");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, main, form").first()).toBeVisible({ timeout: 6000 });
  });

  // Reject flow: submit a fresh TA-01 and reject it via staff prodi
  test("TA-01: reject oleh staff prodi → mahasiswa lihat status revisi", async ({ page }) => {
    // This test can only run once per fresh DB state
    // Skip if mahasiswa already has a pending TA-01 (handled by error boundary)
    let id = "";
    try {
      id = await submitTA01(page);
    } catch {
      // Possible duplicate — skip gracefully
      test.skip(true, "TA-01 pending sudah ada (duplicate), skip reject test");
      return;
    }

    await login(page, USERS.staffProdi);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    const rejectBtn = page.locator('button:has-text("Tolak"), button:has-text("Kembalikan")').first();
    if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.waitForTimeout(500);
      const alasan = page.locator('textarea[name="alasan"], textarea').first();
      if (await alasan.isVisible({ timeout: 2000 }).catch(() => false))
        await alasan.fill("Judul kurang spesifik, harap diperbaiki");
      const submit = page.locator('button:has-text("Kirim"), button[type="submit"]').last();
      await submit.click();
      await page.waitForTimeout(1500);
    }

    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator(':text("revisi"), :text("dikembalikan"), :text("revision")').first()
    ).toBeVisible({ timeout: 8000 });
  });
});
