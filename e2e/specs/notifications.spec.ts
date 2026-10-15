import { expect, test } from '@playwright/test'

// Uses the shared authenticated + onboarded session from global.setup.ts.
// `settings-misc.spec.ts` already proves a single toggle persists across reload;
// this proves each channel is wired to its own field, not a shared one.
test.describe('notification preferences', () => {
  test('toggling one channel does not affect the others', async ({ page }) => {
    await page.goto('/settings/notifications')

    const channels = [
      'party_sms_enabled',
      'voice_call_enabled',
      'sms_enabled',
      'push_enabled',
      'whatsapp_enabled',
    ]

    const originalState: Record<string, string | null> = {}
    for (const channel of channels) {
      originalState[channel] = await page
        .getByTestId(`notifications-toggle-${channel}`)
        .getAttribute('data-checked')
    }

    const pushToggle = page.getByTestId('notifications-toggle-push_enabled')
    const wasChecked = originalState['push_enabled'] !== null
    await pushToggle.click()
    await expect(pushToggle).toHaveAttribute(
      wasChecked ? 'data-unchecked' : 'data-checked',
      '',
    )

    for (const channel of channels.filter((c) => c !== 'push_enabled')) {
      const stillOriginal = originalState[channel] !== null
      await expect(
        page.getByTestId(`notifications-toggle-${channel}`),
      ).toHaveAttribute(stillOriginal ? 'data-checked' : 'data-unchecked', '')
    }

    // Restore.
    await pushToggle.click()
  })
})
