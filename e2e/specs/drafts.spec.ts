import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { ChequesPage } from '../pages/cheques.page'
import { DraftsPage } from '../pages/drafts.page'
import { PartiesPage } from '../pages/parties.page'
import {
  E2E_PHONE,
  uniqueChequeNumber,
  uniqueE2eName,
} from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('drafts', () => {
  test('saves, resumes, and publishes an account draft', async ({ page }) => {
    const accountName = uniqueE2eName('account-draft')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()

    await page.goto('/accounts/create')
    await page.getByTestId('bank-selector-trigger').click()
    await page.getByTestId('bank-option').first().click()
    await page.getByTestId('account-step1-continue').click()
    await page.locator('#account_name').fill(accountName)
    await page.getByTestId('draft-save-button').click()
    await expect(page).toHaveURL(/draftId=/)

    const draftsPage = new DraftsPage(page)
    await draftsPage.goto('account')
    const draft = page.getByRole('link', { name: new RegExp(accountName) })
    await expect(draft).toBeVisible()
    await draft.click()
    await expect(page).toHaveURL(/\/accounts\/create\?draftId=/)
    await expect(page.locator('#account_name')).toHaveValue(accountName)
    await expect(page.getByTestId('account-step2-continue')).toBeVisible()

    await page.locator('#account_number').fill(accountNumber)
    await page.getByTestId('account-step2-continue').click()
    await page.getByTestId('account-submit-button').click()
    await expect(page.getByTestId('creation-success-continue')).toBeVisible()
    await page.getByTestId('creation-success-continue').click()

    await page.goto('/accounts')
    await expect(
      page.getByRole('link').filter({ hasText: accountName.slice(0, 15) }),
    ).toBeVisible()
    await draftsPage.goto('account')
    await expect(
      page.getByRole('link', { name: new RegExp(accountName) }),
    ).toHaveCount(0)
  })

  test('saves, resumes, and publishes a party draft', async ({ page }) => {
    const partyName = uniqueE2eName('party-draft')

    await page.goto('/parties/create')
    await page.locator('#name').fill(partyName)
    await page.getByTestId('draft-save-button').click()
    await expect(page).toHaveURL(/draftId=/)

    const draftsPage = new DraftsPage(page)
    await draftsPage.goto('party')
    const draft = page.getByRole('link', { name: new RegExp(partyName) })
    await expect(draft).toBeVisible()
    await draft.click()
    await expect(page).toHaveURL(/\/parties\/create\?draftId=/)
    await expect(page.getByTestId('party-step2-continue')).toBeVisible()

    await page.locator('#contact').fill(E2E_PHONE)
    await page.getByTestId('party-step2-continue').click()
    await page.getByTestId('party-submit-button').click()
    await expect(page.getByTestId('creation-success-continue')).toBeVisible()
    await page.getByTestId('creation-success-continue').click()

    await page.goto('/parties')
    await expect(
      page.getByRole('link').filter({ hasText: partyName }),
    ).toBeVisible()
    await draftsPage.goto('party')
    await expect(
      page.getByRole('link', { name: new RegExp(partyName) }),
    ).toHaveCount(0)
  })

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
