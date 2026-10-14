import { expect, test } from '@playwright/test'

const staticPages = [
  '/settings/about',
  '/settings/help-and-support',
  '/settings/privacy-policy',
  '/settings/terms-and-conditions',
  '/settings/whats-new',
]

// These routes are informational; route availability and a rendered heading are the contract.
test('static settings pages render', async ({ page }) => {
  for (const path of staticPages) {
    await page.goto(path)
    await expect(page).toHaveURL(path)
    await expect(page.getByRole('heading').first()).toBeVisible()
  }
})
