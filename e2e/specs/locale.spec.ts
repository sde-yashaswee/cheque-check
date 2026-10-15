import { expect, test } from '@playwright/test'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('locale', () => {
  test('switching to Hindi translates the UI and persists across a reload', async ({
    page,
  }) => {
    await page.goto('/settings/preferences')
    const language = page.getByTestId('preferences-language')
    if (!(await language.innerText()).includes('English')) {
      await language.click()
      await page.getByRole('option', { name: 'English' }).click()
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    }

    await language.click()
    await page.getByRole('option', { name: 'Hindi' }).click()

    // Language switch sets a cookie + calls window.location.reload().
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi')
    await page.goto('/')
    await expect(page.getByTestId('bottom-nav-parties')).toContainText(
      'पार्टियाँ',
    )

    await page.reload()
    await expect(page.getByTestId('bottom-nav-parties')).toContainText(
      'पार्टियाँ',
    )

    await page.goto('/settings/preferences')
    await language.click()
    await page.getByRole('option', { name: 'English' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await page.goto('/')
    await expect(page.getByTestId('bottom-nav-parties')).toContainText(
      'Parties',
    )
  })
})
