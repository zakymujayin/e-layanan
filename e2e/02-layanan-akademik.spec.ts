import { test, expect, Page } from "@playwright/test";
import { login, USERS } from "./helpers/auth";
import { approveAs, getPengajuanId } from "./helpers/workflow";
import { mockDokumenApi } from "./helpers/mock-api";

type Fields = Record<string, string>;

const REQUIRED_FIELDS: Record<string, Fields> = {
  "AK-01": { "#peruntukan": "Keperluan beasiswa pendidikan" },
  "AK-02": { "#peruntukan": "Keperluan tunjangan PNS" },
  "AK-04": {
    "#mata_kuliah": "Observasi KKN",
    "#pejabat_tujuan": "Kepala Dinas",
    "#instansi_tujuan": "Dinas Pendidikan Serang",
    "#lokasi_observasi": "Kota Serang",
    "#tanggal_mulai": "2026-07-01",
    "#tanggal_selesai": "2026-07-31",
    "#dosen_pembimbing_observasi_id": "1",
  },
  "AK-05": { "#peruntukan": "Penelitian skripsi" },
  "AK-06": {
    "#pejabat_tujuan": "Manager HRD",
    "#instansi_tujuan": "PT Test Indonesia",
    "#tanggal_mulai": "2026-07-01",
    "#tanggal_selesai": "2026-12-31",
  },
};

async function submitAK(page: Page, kode: string): Promise<string> {
  await mockDokumenApi(page);
  await login(page, USERS.mahasiswa);
  await page.goto(`/pengajuan/baru/${kode}`);
  await page.waitForLoadState("networkidle");

  const fields = REQUIRED_FIELDS[kode] ?? {};
  for (const [sel, val] of Object.entries(fields)) {
    const el = page.locator(sel);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.fill(val);
    }
  }

  // AK-07: shadcn Select untuk tipe_rekomendasi
  if (kode === "AK-07") {
    const combobox = page.locator('[role="combobox"]').first();
    if (await combobox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await combobox.click();
      await page.waitForTimeout(400);
      const opt = page.locator('[role="option"]:has-text("Beasiswa")').first();
      if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) {
        await opt.click();
        // Wait for dropdown portal to close
        await page.waitForTimeout(500);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }
    const tujuan = page.locator("#tujuan_rekomendasi");
    if (await tujuan.isVisible({ timeout: 1000 }).catch(() => false))
      await tujuan.fill("Beasiswa pendidikan lanjut");
    const pihak = page.locator("#pihak_penerima");
    if (await pihak.isVisible({ timeout: 1000 }).catch(() => false))
      await pihak.fill("Kemendikbud");
    // Ensure no overlay is blocking the submit button
    await page.waitForTimeout(500);
  }

  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/pengajuan\/\d+/, { timeout: 12000 });
  return getPengajuanId(page);
}

// AK workflow: staff_akademik → kabag → wd1 (sign → selesai)
async function approveAKFull(page: Page, id: string) {
  await approveAs(page, USERS.staffAkademik, id);
  await approveAs(page, USERS.kabag, id);
  await approveAs(page, USERS.wd1, id, "Tanda Tangan");
}

test.describe("02 — Layanan Akademik", () => {
  test("AK-01: submit + full approval chain + selesai → download tersedia", async ({ page }) => {
    const id = await submitAK(page, "AK-01");
    expect(id).toBeTruthy();

    await approveAKFull(page, id);

    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    const done = await page
      .locator('a:has-text("Download"), button:has-text("Download"), :text("Selesai"), :text("selesai")')
      .first()
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    expect(done).toBeTruthy();
  });

  test("AK-02: submit berhasil", async ({ page }) => {
    const id = await submitAK(page, "AK-02");
    expect(id).toBeTruthy();
  });

  test("AK-04: submit berhasil", async ({ page }) => {
    const id = await submitAK(page, "AK-04");
    expect(id).toBeTruthy();
  });

  test("AK-05: submit berhasil", async ({ page }) => {
    const id = await submitAK(page, "AK-05");
    expect(id).toBeTruthy();
  });

  test("AK-06: submit berhasil", async ({ page }) => {
    const id = await submitAK(page, "AK-06");
    expect(id).toBeTruthy();
  });

  test("AK-07: submit berhasil", async ({ page }) => {
    const id = await submitAK(page, "AK-07");
    expect(id).toBeTruthy();
  });

  test("AK-01: tolak oleh staff akademik → mahasiswa lihat status revisi", async ({ page }) => {
    await mockDokumenApi(page);
    await login(page, USERS.mahasiswa);
    await page.goto("/pengajuan/baru/AK-01");
    await page.waitForLoadState("networkidle");
    await page.locator("#peruntukan").fill("Keperluan CPNS");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/pengajuan\/\d+/, { timeout: 12000 });
    const id = await getPengajuanId(page);

    await login(page, USERS.staffAkademik);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    const rejectBtn = page.locator('button:has-text("Tolak"), button:has-text("Kembalikan")').first();
    if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.waitForTimeout(500);
      const alasan = page.locator('textarea[name="alasan"], textarea').first();
      if (await alasan.isVisible({ timeout: 2000 }).catch(() => false))
        await alasan.fill("Dokumen tidak lengkap, harap perbaiki");
      const konfirm = page.locator('button:has-text("Kirim"), button:has-text("Tolak"), button[type="submit"]').last();
      await konfirm.click();
      await page.waitForTimeout(1500);
    }

    await login(page, USERS.mahasiswa);
    await page.goto(`/pengajuan/${id}`);
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator(':text("dikembalikan"), :text("revisi"), :text("revision")').first()
    ).toBeVisible({ timeout: 6000 });
  });
});
