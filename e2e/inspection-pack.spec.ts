import { test, expect } from "@playwright/test"

test("inspection pack page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/inspection-pack")
  await expect(page).toHaveURL(/\/login/)
})
