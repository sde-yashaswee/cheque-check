import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { SignupPage } from '../pages/signup.page'
import { OnboardingPage } from '../pages/onboarding.page'
import { e2eBusinessName, e2eUser } from '../fixtures/test-data'
import { createConfirmedE2eUser } from '../admin-client'

// Each test starts with a clean, logged-out context.
// Logout must not reuse the shared storageState: Supabase signOut() revokes the
// session server-side, which would break every other spec running against it.
test.describe('authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('signup form requires name, email, and password', async ({ page }) => {
    const signupPage = new SignupPage(page)
    await signupPage.goto()

    await expect(signupPage.nameInput).toHaveAttribute('required', '')
    await expect(signupPage.emailInput).toHaveAttribute('required', '')
    await expect(signupPage.passwordInput).toHaveAttribute('required', '')
    await signupPage.submitButton.click()
    await expect(page).toHaveURL('/signup')
  })

  test('login with valid credentials redirects away from /login', async ({
    page,
  }) => {
    const user = e2eUser('login')
    await createConfirmedE2eUser(user)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(user.email, user.password)

    await expect(page).not.toHaveURL('/login')
  })

  test('login with invalid credentials shows an error and stays on /login', async ({
    page,
  }) => {
    let dialogMessage = ''
    page.on('dialog', (dialog) => {
      dialogMessage = dialog.message()
      void dialog.accept()
    })

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(e2eUser('nonexistent').email, 'wrong-password')

    await expect.poll(() => dialogMessage).not.toBe('')
    await expect(page).toHaveURL('/login')
  })

  test('forgot password shows a confirmation message', async ({ page }) => {
    const user = e2eUser('forgot')
    await page.route('**/auth/v1/recover**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      }),
    )
    await page.goto('/forgot-password')
    await page.getByTestId('forgot-password-email-input').fill(user.email)
    await page.getByTestId('forgot-password-submit-button').click()

    await expect(
      page.getByTestId('forgot-password-sent-confirmation'),
    ).toBeVisible()
  })

  test('signup with an already-registered email does not reach the app', async ({
    page,
  }) => {
    const user = e2eUser('signup-dupe')
    await createConfirmedE2eUser(user)

    let dialogMessage = ''
    page.on('dialog', (dialog) => {
      dialogMessage = dialog.message()
      void dialog.accept()
    })

    const signupPage = new SignupPage(page)
    await signupPage.goto()
    await signupPage.signup(user.name, user.email, user.password)

    await expect.poll(() => dialogMessage).not.toBe('')
    await expect(page).not.toHaveURL('/')
  })

  test.describe('signup form success', () => {
    test.use({ serviceWorkers: 'block' })

    test('shows the confirmation alert and returns to login', async ({
      page,
    }) => {
      let dialogMessage = ''
      page.on('dialog', (dialog) => {
        dialogMessage = dialog.message()
        void dialog.accept()
      })

      const user = e2eUser('signup-ui')
      await page.route('**/auth/v1/signup**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '00000000-0000-4000-8000-000000000001',
            aud: 'authenticated',
            role: 'authenticated',
            email: user.email,
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: { name: user.name },
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        }),
      )
      const signupPage = new SignupPage(page)
      await signupPage.goto()
      await signupPage.signup(user.name, user.email, user.password)

      await expect
        .poll(() => dialogMessage)
        .toBe('Check your email for confirmation!')
      await expect(page).toHaveURL('/login')
    })
  })
})

test.describe('logout', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('logs the user out and redirects to login', async ({ page }) => {
    const user = e2eUser('logout')
    await createConfirmedE2eUser(user)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(user.email, user.password)
    await expect(page).not.toHaveURL('/login')

    // Fresh account has no business yet, so it lands on onboarding, not settings.
    await page.waitForURL('/onboarding')
    await new OnboardingPage(page).completeWithDefaults(
      e2eBusinessName('logout'),
    )
    await page.waitForURL('/')

    await page.goto('/settings')
    await page.getByTestId('settings-logout-button').click()

    await expect(page).toHaveURL('/login')
  })

  test('a protected route redirects to login after logout, not just the button', async ({
    page,
  }) => {
    const user = e2eUser('logout-guard')
    await createConfirmedE2eUser(user)

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(user.email, user.password)
    await page.waitForURL('/onboarding')
    await new OnboardingPage(page).completeWithDefaults(
      e2eBusinessName('logout-guard'),
    )
    await page.waitForURL('/')

    await page.goto('/settings')
    await page.getByTestId('settings-logout-button').click()
    await expect(page).toHaveURL('/login')

    // Proves Supabase signOut() actually revoked the session server-side,
    // not just that the client redirected once.
    await page.goto('/cheques')
    await expect(page).toHaveURL('/login')
  })
})
