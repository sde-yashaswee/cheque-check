import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { ChequesPage } from '../pages/cheques.page'
import { DraftsPage } from '../pages/drafts.page'
import { PartiesPage } from '../pages/parties.page'
import { uniqueChequeNumber, uniqueE2eName } from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('cheque drafts', () => {
  test('saves, resumes, and publishes a cheque draft', async ({ page }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()
    const amount = 4321

    await new PartiesPage(page).createParty(partyName, '+919810000000')
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.goto()
    await chequesPage.openCreate()
    await page.getByTestId('cheque-amount-input').fill(String(amount))
    await page.getByTestId('cheque-number-input').fill(chequeNumber)
    await page.getByTestId('draft-save-button').click()
    await expect(page).toHaveURL(/draftId=/)

    const draftsPage = new DraftsPage(page)
    await draftsPage.goto()
    const draft = page.getByRole('link', {
      name: new RegExp(amount.toLocaleString()),
    })
    await expect(draft).toBeVisible()
    await draft.click()
    await expect(page).toHaveURL(/\/cheques\/create\?draftId=/)
    await expect(page.getByTestId('cheque-party-combobox')).toBeVisible()
    await expect(page.getByTestId('cheque-account-combobox')).toBeVisible()

    await chequesPage.selectPartyAndAccount(partyName, accountNumber.slice(-4))
    const depositDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    await chequesPage.finishAndSubmit(depositDate)

    await expect(page).toHaveURL('/cheques')
    await expect(page.getByText(`#${chequeNumber}`).first()).toBeVisible()
    await draftsPage.goto()
    await expect(
      page.getByRole('link', {
        name: new RegExp(amount.toLocaleString()),
      }),
    ).toHaveCount(0)
  })
})
