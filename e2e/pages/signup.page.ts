import { type Page } from '@playwright/test'

export class SignupPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/signup')
  }

  get nameInput() {
    return this.page.getByTestId('signup-name-input')
  }

  get emailInput() {
    return this.page.getByTestId('signup-email-input')
  }

  get passwordInput() {
    return this.page.getByTestId('signup-password-input')
  }

  get submitButton() {
    return this.page.getByTestId('signup-submit-button')
  }

  async signup(name: string, email: string, password: string) {
    await this.nameInput.fill(name)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
