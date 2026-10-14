import { expect, type Page } from '@playwright/test'

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  get emailInput() {
    return this.page.getByTestId('login-email-input')
  }

  get passwordInput() {
    return this.page.getByTestId('login-password-input')
  }

  get submitButton() {
    return this.page.getByTestId('login-submit-button')
  }

  /** Login pages surface errors via native `alert()`, so callers must attach
   * a `page.on('dialog', ...)` listener before calling this if they expect one. */
  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectRedirectedToDashboard() {
    await expect(this.page).toHaveURL('/')
  }
}
