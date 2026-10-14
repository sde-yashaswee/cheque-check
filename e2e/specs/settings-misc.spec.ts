import { expect, test } from '@playwright/test'

test.describe('settings', () => {
  test('saves a reminder lead-time preference', async ({ page }) => {
    await page.goto('/settings/notifications')
    const reminderDays = page.getByTestId('notifications-reminder-days')

    await reminderDays.click()
    await page.getByRole('option').filter({ hasText: '7' }).click()
    await expect(reminderDays).toContainText('7')

    await reminderDays.click()
    await page.getByRole('option').filter({ hasText: '3' }).click()
    await expect(reminderDays).toContainText('3')
  })

  test('loads the transactions history view', async ({ page }) => {
    await page.goto('/settings/transactions')
    await expect(page.getByTestId('transactions-page')).toBeVisible()
  })
})
