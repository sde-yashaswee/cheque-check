import { expect, type Page } from '@playwright/test'

export class BusinessesPage {
  constructor(private readonly page: Page) {}

  /** Email is UI-required to advance step 2 even though the schema allows it empty. */
  async createBusiness(name: string, email: string) {
    await this.page.goto('/businesses/create')
    await this.page.locator('#name').fill(name)
    await this.page.getByTestId('business-step1-continue').click()
    await this.page.locator('#email').fill(email)
    await this.page.getByTestId('business-step2-continue').click()
    await this.page.getByTestId('business-submit-button').click()
    const successButton = this.page.getByTestId('creation-success-continue')
    await expect(successButton).toBeVisible()
    await successButton.click()
  }

  async openSwitcher() {
    await this.page.getByTestId('business-switcher-trigger').click()
  }

  async openByName(name: string) {
    const card = this.page
      .locator('[data-testid^="business-card-"]')
      .filter({ hasText: name })
    await expect(card).toBeVisible()
    await card.getByTestId('business-detail-link').click()
  }

  /** Opens the switcher, searches by name, and selects the first matching business. */
  async switchTo(businessName: string) {
    await this.openSwitcher()
    await this.page.getByTestId('business-switcher-search').fill(businessName)
    await this.page.getByRole('option').first().click()
    await expect(
      this.page.getByTestId('business-switcher-trigger'),
    ).toHaveAttribute('data-active-business-name', businessName)
  }
}
