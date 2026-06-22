import { test, expect } from "@playwright/test";
import { login, USERS } from "./helpers/auth";
import { getPengajuanId, approveAs, rejectAs, waitForStatus } from "./helpers/workflow";

test.describe("08 — Full Workflow E2E", () => {
  let ta01Id = "";
  let ak01Id = "";

  test("TA-01: form submit → detail → approve chain", async ({ page }) => {
    await login(page, USERS.mahasiswa);

    await page.goto("/pengajuan/baru?jenis=TA-01");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await expect(page.locator("form, [data-slot='card']").first()).toBeVisible({ timeout: 10000 });

    await page.fill('[name="judul_1"]', "E2E Test Judul 1: Analisis Hadis");
    await page.fill('[name="judul_2"]', "E2E Test Judul 2: Metode Kritik Sanad");
    await page.fill('[name="judul_3"]', "E2E Test Judul 3: Studi Komparatif");

    const paSelect = page.locator('[name="pa_dosen_id"]');
    if (await paSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await paSelect.selectOption({ index: 1 });
    }

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).toMatch(/\/pengajuan\/\d+/);
    ta01Id = await getPengajuanId(page);
    expect(ta01Id).toBeTruthy();

    await approveAs(page, USERS.staffProdi, ta01Id);
    await page.waitForTimeout(1000);

    await login(page, USERS.dosenPA);
    await page.goto(`/pengajuan/${ta01Id}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const selectBtn = page.locator('button:has-text("Pilih"), button:has-text("select")').first();
    if (await selectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selectBtn.click();
      await page.waitForTimeout(1500);
    }

    await approveAs(page, USERS.kaprodi, ta01Id);
    await page.waitForTimeout(1000);

    await approveAs(page, USERS.wd1, ta01Id);
    await page.waitForTimeout(1000);

    await page.goto(`/pengajuan/${ta01Id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/selesai|Selesai/i);
  });

  test("AK-01: form submit → detail → approve chain", async ({ page }) => {
    await login(page, USERS.mahasiswa);

    await page.goto("/pengajuan/baru?jenis=AK-01");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await expect(page.locator("form, [data-slot='card']").first()).toBeVisible({ timeout: 10000 });

    const peruntukanField = page.locator('[name="peruntukan"]');
    if (await peruntukanField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await peruntukanField.fill("E2E Test Tunjangan Orang Tua");
    }

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).toMatch(/\/pengajuan\/\d+/);
    ak01Id = await getPengajuanId(page);
    expect(ak01Id).toBeTruthy();

    await approveAs(page, USERS.staffAkademik, ak01Id);
    await page.waitForTimeout(1000);

    await approveAs(page, USERS.kabag, ak01Id);
    await page.waitForTimeout(1000);

    await approveAs(page, USERS.wd1, ak01Id);
    await page.waitForTimeout(1000);

    await page.goto(`/pengajuan/${ak01Id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/selesai|Selesai/i);
  });

  test("TA-06: reject 3x → terminate", async ({ page }) => {
    await login(page, USERS.mahasiswa);

    await page.goto("/pengajuan/baru?jenis=TA-06");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await expect(page.locator("form, [data-slot='card']").first()).toBeVisible({ timeout: 10000 });

    await page.fill('[name="submission_id_turnitin"]', "E2E-TEST-001");
    await page.fill('[name="url_turnitin"]', "https://turnitin.com/submission/e2e-001");
    await page.fill('[name="similarity_percentage"]', "35");

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url).toMatch(/\/pengajuan\/\d+/);
    const ta06Id = await getPengajuanId(page);
    expect(ta06Id).toBeTruthy();

    for (let i = 0; i < 3; i++) {
      await rejectAs(page, USERS.kepalaLab, ta06Id, `Revisi ke-${i + 1}: similarity terlalu tinggi`);

      if (i < 2) {
        await login(page, USERS.mahasiswa);
        await page.goto(`/pengajuan/${ta06Id}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1500);

        const isRevisionVisible = await page.locator('text=Revisi').first().isVisible({ timeout: 2000 }).catch(() => false);
        if (isRevisionVisible) {
          await page.fill('[name="similarity_percentage"]', String(30 - i * 2));
          const resubmitBtn = page.locator('button[type="submit"]').first();
          await resubmitBtn.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    await page.goto(`/pengajuan/${ta06Id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/terminated|Ditutup|ditutup/i);
  });
});
