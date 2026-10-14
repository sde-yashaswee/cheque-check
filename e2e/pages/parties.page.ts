import { type Page } from '@playwright/test'

export class PartiesPage {
  constructor(private readonly page: Page) {}

  /** Party contact must be a valid E.164 phone number per `partySchema`. */
  async createParty(name: string, contact: string) {
    await this.page.goto('/parties/create')
    await this.page.locator('#name').fill(name)
    await this.page.getByTestId('party-step1-continue').click()
    await this.page.locator('#contact').fill(contact)
    await this.page.getByTestId('party-step2-continue').click()
    await this.page.getByTestId('party-submit-button').click()
  }
}
