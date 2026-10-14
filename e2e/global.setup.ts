import { test as setup } from '@playwright/test'
import { LoginPage } from './pages/login.page'
import { OnboardingPage } from './pages/onboarding.page'
import { e2eUser, e2eBusinessName } from './fixtures/test-data'
import { STORAGE_STATE_PATH } from './storage-state'
import { createConfirmedE2eUser } from './admin-client'

/**
 * Runs once before the main test suite: creates a confirmed e2e user,
 * completes onboarding through the UI, then persists the session so
 * most feature specs can skip repeating this and start straight on the dashboard.
 */
setup('authenticate via signup and onboarding', async ({ page }) => {
  const user = e2eUser('global')
  const businessName = e2eBusinessName('global')

  await createConfirmedE2eUser(user)

  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(user.email, user.password)
  await page.waitForURL('/onboarding')

  const onboardingPage = new OnboardingPage(page)
  await onboardingPage.completeWithDefaults(businessName)
  await page.waitForURL('/')

  await page.context().storageState({ path: STORAGE_STATE_PATH })
})
