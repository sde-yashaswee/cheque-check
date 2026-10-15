import { expect, test } from '@playwright/test'

// Uses the shared authenticated + onboarded session from global.setup.ts.
// public/sw.js has no real caching strategy yet (pass-through fetch only), so this
// only verifies registration - not caching/offline behavior that doesn't exist.
test.describe('pwa', () => {
  test('registers a service worker on a dashboard route', async ({ page }) => {
    await page.goto('/')
    const registration = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return null
      const reg = await navigator.serviceWorker.ready
      return reg.scope
    })
    expect(registration).toContain('/')
  })
})
