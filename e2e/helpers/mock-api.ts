import { Page } from "@playwright/test";

export async function mockDokumenApi(page: Page) {
  await page.route(/\/api\/dokumen-persyaratan/, route =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ dokumen: [] }) })
  );
  await page.route(/\/api\/upload/, route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 1, file_name: "test.pdf", serve_url: "/test.pdf", size: 1024 }),
    })
  );
}
