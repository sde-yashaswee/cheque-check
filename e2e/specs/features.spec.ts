import { expect, test } from '@playwright/test'
import type { Profile } from '../../src/types'

test.describe('feature management', () => {
  for (const width of [320, 390, 1280]) {
    test(`keeps controls aligned within the app frame at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      let profile: Partial<Profile> = {
        id: 'preview-profile',
        user_id: 'preview-user',
        phone: '+919876543210',
        voice_call_enabled: false,
        received_cheques_enabled: false,
        time_zone: 'Asia/Kolkata',
        language: 'en',
      }
      await page.route('**/rest/v1/profiles?**', async (route) => {
        if (route.request().method() === 'PATCH') {
          profile = { ...profile, ...route.request().postDataJSON() }
        }
        await route.fulfill({ json: profile })
      })
      await page.route('**/rest/v1/user_entitlements?**', (route) =>
        route.fulfill({
          json: [
            {
              feature_id: 'lifetime_premium',
              status: 'active',
              valid_until: null,
            },
            {
              feature_id: 'ai_scanner_sub',
              status: 'active',
              valid_until: '2099-01-01T00:00:00Z',
            },
            {
              feature_id: 'voice_reminder_sub',
              status: 'active',
              valid_until: '2099-01-01T00:00:00Z',
            },
          ],
        }),
      )
      await page.route('**/rest/v1/user_quotas?**', (route) =>
        route.fulfill({
          json: [
            { feature_id: 'ai_scan', used: 10, limit: 250, reset_at: null },
            {
              feature_id: 'voice_reminder',
              used: 10,
              limit: 100,
              reset_at: null,
            },
          ],
        }),
      )
      await page.route('**/rest/v1/transactions?**', (route) =>
        route.fulfill({
          json: [
            {
              id: 'preview-order',
              feature_id: 'voice_reminder_sub',
              type: 'subscription',
              status: 'authorized',
              amount: 5000,
              currency: 'INR',
              created_at: '2026-10-17T00:00:00Z',
              razorpay_order_id:
                'order_long_reference_123456789012345678901234567890',
            },
          ],
        }),
      )
      await page.goto('/features')
      const features = page.getByTestId('features-page')
      await expect(
        features.getByRole('heading', { name: 'Your tools. Your way.' }),
      ).toBeVisible()
      const voice = features.getByRole('article', {
        name: 'Daily Voice Reminder',
      })
      await expect(voice.getByText('Turned off', { exact: true })).toBeVisible()
      await expect(voice.getByLabel('Your Phone Number')).toBeVisible()
      await expect(
        voice.getByRole('button', { name: 'Send test call', exact: true }),
      ).toBeDisabled()

      await voice.getByRole('switch', { name: 'Enable Service' }).click()
      await expect(
        voice.getByText('Ready to use', { exact: true }),
      ).toBeVisible()
      await expect(
        voice.getByRole('button', { name: 'Send test call', exact: true }),
      ).toBeEnabled()
      await voice.getByLabel('Your Phone Number').fill('+919876543211')
      await expect(
        voice.getByRole('button', { name: 'Send test call', exact: true }),
      ).toBeDisabled()
      await voice.getByRole('button', { name: 'Save phone number' }).click()
      await expect(
        voice.getByRole('button', { name: 'Send test call', exact: true }),
      ).toBeEnabled()

      await expect(
        features.getByText(
          'Payment authorized. Waiting for payment confirmation before activation.',
        ),
      ).toBeVisible()
      const overflowing = await features.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return Array.from(
          element.querySelectorAll<HTMLElement>(
            'article, input:not([aria-hidden="true"]), button, [role="switch"], [role="progressbar"], li',
          ),
        )
          .filter((child) => {
            const box = child.getBoundingClientRect()
            return (
              box.width > 0 &&
              (box.left < bounds.left - 1 || box.right > bounds.right + 1)
            )
          })
          .map((child) => child.tagName)
      })
      expect(overflowing).toEqual([])
      await expect(
        features.getByRole('link', { name: 'View all transactions' }),
      ).toHaveAttribute('href', '/settings/transactions')
    })
  }
})
