import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { ChequesPage } from '../pages/cheques.page'
import { PartiesPage } from '../pages/parties.page'
import {
  E2E_PHONE,
  uniqueChequeNumber,
  uniqueE2eName,
} from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('cheque lifecycle', () => {
  test('blocks invalid cheque details before advancing the form', async ({
    page,
  }) => {
    const chequesPage = new ChequesPage(page)
    await chequesPage.goto()
    await chequesPage.openCreate()

    await page.getByTestId('cheque-step1-continue').click()
    await expect(page.getByTestId('cheque-party-combobox')).toHaveCount(0)

    await page.getByTestId('cheque-amount-input').fill('0')
    await page.getByTestId('cheque-number-input').fill('123')
    await page.getByTestId('cheque-step1-continue').click()
    await expect(page.getByTestId('cheque-party-combobox')).toHaveCount(0)

    await page.getByTestId('cheque-amount-input').fill('100')
    await page.getByTestId('cheque-number-input').fill(uniqueChequeNumber())
    await page.getByTestId('cheque-step1-continue').click()
    await expect(page.getByTestId('cheque-party-combobox')).toBeVisible()
  })

  test('updates status, corrects it back to pending, and changes cheque details', async ({
    page,
  }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()

    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber,
      amount: 1500,
    })
    await chequesPage.goto()
    await chequesPage.openByChequeNumber(chequeNumber)

    const status = page.getByTestId('cheque-detail-status')
    await expect(status).toContainText('Issued')

    await page.getByTestId('speed-dial-toggle').click()
    await page.getByTestId('cheque-status-cleared').click()
    await expect(status).toContainText('Cleared')

    await page.getByTestId('speed-dial-toggle').click()
    await page.getByTestId('cheque-status-issued').click()
    await expect(status).toContainText('Issued')

    await page.getByTestId('speed-dial-edit-link').click()
    await page.locator('#amount').fill('2500')
    await page.getByTestId('cheque-edit-submit-button').click()
    await expect(page).toHaveURL(new RegExp(`/cheques/.+`))
    await expect(page.getByTestId('cheque-detail-amount')).toContainText(
      '2,500',
    )
  })

  test('deletes a cheque after its number is confirmed', async ({ page }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()

    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber,
    })
    await chequesPage.goto()
    await chequesPage.openByChequeNumber(chequeNumber)

    await page.getByTestId('speed-dial-toggle').click()
    await page.getByTestId('cheque-detail-delete-trigger').click()
    await page.locator('#confirm_name').fill(chequeNumber)
    await page.getByTestId('delete-dialog-confirm-button').click()

    await expect(page).toHaveURL('/cheques')
    await expect(page.getByText(`#${chequeNumber}`)).toHaveCount(0)
  })

  test('creates an inward cheque with Received as its initial status', async ({
    page,
  }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()

    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber,
      type: 'Inward',
    })
    await chequesPage.goto()
    await chequesPage.openByChequeNumber(chequeNumber)

    await expect(page.getByTestId('cheque-detail-status')).toContainText(
      'Received',
    )
  })

  test('sorts the cheque list by amount in ascending order', async ({
    page,
  }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const smallerCheque = uniqueChequeNumber()
    const largerCheque = uniqueChequeNumber()

    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)
    const chequesPage = new ChequesPage(page)
    await chequesPage.createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber: smallerCheque,
      amount: 1000,
    })
    await chequesPage.createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber: largerCheque,
      amount: 2000,
    })

    await chequesPage.goto()
    await page.getByTestId('cheque-search-input').fill(partyName)
    await page.getByTestId('cheque-filter-trigger').click()
    await page.getByTestId('cheque-sort-by-amount').click()
    await page.getByTestId('cheque-sort-order-asc').click()

    const cards = page.locator('[data-testid^="cheque-card-"]')
    await expect(cards.first()).toContainText(`#${smallerCheque}`)
    await expect(cards.last()).toContainText(`#${largerCheque}`)
  })
})
