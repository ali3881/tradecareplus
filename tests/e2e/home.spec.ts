import { expect, test } from "@playwright/test";

test("homepage renders core navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /services/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /sales and hire/i })).toBeVisible();
});
