import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { SignupPage } from '../pages/signup.page'
import { e2eBusinessName, e2eUser } from '../fixtures/test-data'

// Own fresh user per test, independent of the shared global-setup session,
// since onboarding can only be driven once per account.
test.describe('onboarding', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  async function signUpAndReachOnboarding(
    page: import('@playwright/test').Page,
  ) {
    const user = e2eUser('onboarding')
    page.on('dialog', (dialog) => dialog.accept())

    const signupPage = new SignupPage(page)
    await signupPage.goto()
    await signupPage.signup(user.name, user.email, user.password)
    await page.waitForURL('/login')

    const loginPage = new LoginPage(page)
    await loginPage.login(user.email, user.password)
    await page.waitForURL('/onboarding')
  }

  test('step 1 continue is disabled until a business name is entered', async ({
    page,
  }) => {
    await signUpAndReachOnboarding(page)

    const continueButton = page.getByTestId('onboarding-step1-continue')
    await expect(continueButton).toBeDisabled()

    await page
      .getByTestId('onboarding-business-name-input')
      .fill(e2eBusinessName('step1'))
    await expect(continueButton).toBeEnabled()
  })

  test('completes the wizard and reaches the dashboard', async ({ page }) => {
    await signUpAndReachOnboarding(page)

    const businessName = e2eBusinessName('complete')
    await page.getByTestId('onboarding-business-name-input').fill(businessName)
    await page.getByTestId('onboarding-step1-continue').click()
    await page.getByTestId('onboarding-step2-continue').click()
    await page.getByTestId('onboarding-step3-continue').click()
    await page.getByTestId('onboarding-step4-finish').click()

    await expect(page.getByTestId('onboarding-enter-dashboard')).toBeVisible()
    await page.getByTestId('onboarding-enter-dashboard').click()

    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('bottom-nav-dashboard')).toBeVisible()
  })
})
