import { expect, type Page } from '@playwright/test'

export class ChequesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/cheques')
  }

  async openCreate() {
    await this.page.getByTestId('app-fab-create').click()
    await expect(this.page).toHaveURL(/\/cheques\/create/)
  }

  /** Fills amount/number (step 1) and advances; cheque_date defaults to today. */
  async fillDetails({
    amount,
    chequeNumber,
    type = 'Outward',
  }: {
    amount: number
    chequeNumber: string
    type?: 'Outward' | 'Inward'
  }) {
    if (type === 'Inward') {
      await this.page.getByTestId('cheque-type-inward').click()
    }
    await this.page.getByTestId('cheque-amount-input').fill(String(amount))
    await this.page.getByTestId('cheque-number-input').fill(chequeNumber)
    await this.page.getByTestId('cheque-step1-continue').click()
  }

  /** Step 2: search+select an existing party and account by their unique names. */
  async selectPartyAndAccount(partySearch: string, accountSearch: string) {
    await this.page.getByTestId('cheque-party-combobox').click()
    await this.page.getByRole('textbox').fill(partySearch)
    await this.page.getByRole('option').first().click()

    await this.page.getByTestId('cheque-account-combobox').click()
    await this.page.getByRole('textbox').fill(accountSearch)
    await this.page.getByRole('option').first().click()

    await this.page.getByTestId('cheque-step2-continue').click()
  }

  /** Step 3: fills the required deposit date and submits. */
  async finishAndSubmit(depositDate: string) {
    await this.page.locator('#deposit_date').fill(depositDate)
    await this.page.getByTestId('cheque-submit-button').click()
  }

  chequeCard(chequeId: string) {
    return this.page.getByTestId(`cheque-card-${chequeId}`)
  }
}
