import { test, expect } from "@playwright/test"

test("history page redirects unauthenticated users", async ({ page }) => {
  await page.goto("/history")
  await expect(page).toHaveURL(/\/login/)
})
