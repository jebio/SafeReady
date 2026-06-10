import { test, expect } from "@playwright/test"

test("settings page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).toHaveURL(/\/login/)
})
