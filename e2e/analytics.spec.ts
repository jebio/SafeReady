import { test, expect } from "@playwright/test"

test("analytics page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/analytics")
  await expect(page).toHaveURL(/\/login/)
})
