import { test as setup } from '@playwright/test'
import { LoginPage } from './pages/login.page'
import { SignupPage } from './pages/signup.page'
import { OnboardingPage } from './pages/onboarding.page'
import { e2eUser, e2eBusinessName } from './fixtures/test-data'
import { STORAGE_STATE_PATH } from './storage-state'

/**
 * Runs once before the main test suite: signs up a fresh e2e- user through the
 * real UI, completes onboarding, then persists the authenticated session so
 * most feature specs can skip repeating this and start straight on the dashboard.
 */
setup('authenticate via signup and onboarding', async ({ page }) => {
  const user = e2eUser('global')
  const businessName = e2eBusinessName('global')

  // Signup shows a success alert() before redirecting to /login; accept it automatically.
  page.on('dialog', (dialog) => dialog.accept())

  const signupPage = new SignupPage(page)
  await signupPage.goto()
  await signupPage.signup(user.name, user.email, user.password)
  await page.waitForURL('/login')

  const loginPage = new LoginPage(page)
  await loginPage.login(user.email, user.password)
  await page.waitForURL('/onboarding')

  const onboardingPage = new OnboardingPage(page)
  await onboardingPage.completeWithDefaults(businessName)
  await page.waitForURL('/')

  await page.context().storageState({ path: STORAGE_STATE_PATH })
})
