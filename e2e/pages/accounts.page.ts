import { expect, type Page } from '@playwright/test'

export class AccountsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/accounts')
  }

  /** Selects the first seeded bank since e2e doesn't depend on a specific one. */
  async createAccount(accountName: string, accountNumber: string) {
    await this.page.goto('/accounts/create')
    await this.page.getByTestId('bank-selector-trigger').click()
    await this.page.getByTestId('bank-option').first().click()
    await this.page.getByTestId('account-step1-continue').click()
    await this.page.locator('#account_name').fill(accountName)
    await this.page.locator('#account_number').fill(accountNumber)
    await this.page.getByTestId('account-step2-continue').click()
    await this.page.getByTestId('account-submit-button').click()
    const successButton = this.page.getByTestId('creation-success-continue')
    await expect(successButton).toBeVisible()
    await successButton.click()
  }

  async openByName(accountName: string) {
    await this.goto()
    await this.page.getByRole('link').filter({ hasText: accountName }).click()
  }
}
