import { Page, expect } from "@playwright/test";
import { login, USERS } from "./auth";

export async function getPengajuanId(page: Page): Promise<string> {
  const url = page.url();
  const match = url.match(/\/pengajuan\/(\d+)/);
  return match?.[1] ?? "";
}

export async function approveAsStaffProdi(page: Page, pengajuanId: string) {
  await login(page, USERS.staffProdi);
  await page.goto(`/pengajuan/${pengajuanId}`);
  await page.waitForLoadState("networkidle");
  const approveBtn = page.locator('button:has-text("Setujui"), button:has-text("Approve"), button:has-text("Terima")').first();
  if (await approveBtn.isVisible()) {
    await approveBtn.click();
    await page.waitForTimeout(1500);
  }
}

export async function approveAs(page: Page, user: { identifier: string; password: string }, pengajuanId: string, btnText?: string) {
  await login(page, user);
  await page.goto(`/pengajuan/${pengajuanId}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  const texts = btnText
    ? [btnText]
    : ["Setujui", "Approve", "Terima", "Tandatangani", "Tanda Tangan", "Terbitkan", "Proses", "Lanjutkan", "Sign", "Verifikasi"];

  for (const text of texts) {
    const btn = page.locator(`button:has-text("${text}")`).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();

      // Handle modal/dialog confirmation if appears
      await page.waitForTimeout(800);
      const confirmBtn = page.locator('button:has-text("Ya"), button:has-text("Konfirmasi"), button:has-text("Kirim")').first();
      if (await confirmBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await confirmBtn.click();
      }
      await page.waitForTimeout(1500);
      return;
    }
  }
}

export async function rejectAs(page: Page, user: { identifier: string; password: string }, pengajuanId: string, alasan: string) {
  await login(page, user);
  await page.goto(`/pengajuan/${pengajuanId}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  const rejectBtn = page.locator('button:has-text("Tolak"), button:has-text("Kembalikan"), button:has-text("Reject")').first();
  if (await rejectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await rejectBtn.click();
    await page.waitForTimeout(500);
    const alasanField = page.locator('textarea[name="alasan"], input[name="alasan"]').first();
    if (await alasanField.isVisible({ timeout: 1500 }).catch(() => false)) {
      await alasanField.fill(alasan);
    }
    const submitBtn = page.locator('button[type="submit"]:has-text("Tolak"), button:has-text("Kirim")').first();
    await submitBtn.click();
    await page.waitForTimeout(1500);
  }
}

export async function waitForStatus(page: Page, pengajuanId: string, expectedStatus: string | RegExp, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    await page.goto(`/pengajuan/${pengajuanId}`);
    await page.waitForLoadState("networkidle");
    const statusEl = page.locator('[class*="status"], [class*="badge"], span:has-text("Selesai"), span:has-text("pending")').first();
    const text = await statusEl.textContent().catch(() => "");
    if (typeof expectedStatus === "string" ? text?.includes(expectedStatus) : expectedStatus.test(text ?? "")) {
      return;
    }
    await page.waitForTimeout(1000);
  }
}
