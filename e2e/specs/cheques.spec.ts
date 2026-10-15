import { test, expect } from '@playwright/test'
import { PartiesPage } from '../pages/parties.page'
import { AccountsPage } from '../pages/accounts.page'
import { ChequesPage } from '../pages/cheques.page'
import {
  E2E_PHONE,
  uniqueChequeNumber,
  uniqueE2eName,
} from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('cheques', () => {
  test('creates a cheque and shows it in the list', async ({ page }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()
    const amount = 1500

    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.goto()
    await chequesPage.openCreate()
    await chequesPage.fillDetails({ amount, chequeNumber, type: 'Outward' })
    await chequesPage.selectPartyAndAccount(partyName, accountNumber.slice(-4))

    const depositDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    await chequesPage.finishAndSubmit(depositDate)

    await expect(page.getByText(partyName).first()).toBeVisible()
    await page.getByTestId('cheque-search-input').fill(chequeNumber)
    await expect(page.locator('[data-testid^="cheque-card-"]')).toHaveCount(1)
    await page.getByTestId('cheque-filter-trigger').click()
    await page.getByTestId('cheque-filter-status-issued').click()
    await expect(page.locator('[data-testid^="cheque-card-"]')).toHaveCount(1)
    await page.getByTestId('cheque-search-input').fill('no-matching-cheque')
    await expect(page.locator('[data-testid^="cheque-card-"]')).toHaveCount(0)
  })

  test('sorts the cheque list by cheque date', async ({ page }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const earlierCheque = uniqueChequeNumber()
    const laterCheque = uniqueChequeNumber()

    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)
    const chequesPage = new ChequesPage(page)
    const depositDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    for (const [chequeNumber, daysAgo] of [
      [earlierCheque, 5],
      [laterCheque, 1],
    ] as const) {
      await chequesPage.goto()
      await chequesPage.openCreate()
      await chequesPage.fillDetails({ amount: 1000, chequeNumber })
      await chequesPage.selectPartyAndAccount(
        partyName,
        accountNumber.slice(-4),
      )
      const chequeDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      await page.locator('#cheque_date').fill(chequeDate)
      await chequesPage.finishAndSubmit(depositDate)
    }

    await chequesPage.goto()
    await page.getByTestId('cheque-search-input').fill(partyName)
    await page.getByTestId('cheque-filter-trigger').click()
    await page.getByTestId('cheque-sort-by-date').click()
    await page.getByTestId('cheque-sort-order-asc').click()

    const cards = page.locator('[data-testid^="cheque-card-"]')
    await expect(cards.first()).toContainText(`#${earlierCheque}`)
    await expect(cards.last()).toContainText(`#${laterCheque}`)

    await page.getByTestId('cheque-filter-trigger').click()
    await page.getByTestId('cheque-sort-order-desc').click()
    await expect(cards.first()).toContainText(`#${laterCheque}`)
    await expect(cards.last()).toContainText(`#${earlierCheque}`)
  })

  test('filters the cheque list by status', async ({ page }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const receivedNumber = uniqueChequeNumber()
    const clearedNumber = uniqueChequeNumber()

    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)
    const chequesPage = new ChequesPage(page)

    // Inward cheques start as Received - a distinct status without needing a transition.
    await chequesPage.createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber: receivedNumber,
      type: 'Inward',
    })
    await chequesPage.createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber: clearedNumber,
    })
    await chequesPage.openByChequeNumber(clearedNumber)
    await page.getByTestId('speed-dial-toggle').click()
    await page.getByTestId('cheque-status-cleared').click()

    await chequesPage.goto()
    await page.getByTestId('cheque-search-input').fill(partyName)
    await page.getByTestId('cheque-filter-trigger').click()
    await page.getByTestId('cheque-filter-status-received').click()
    await expect(page.locator('[data-testid^="cheque-card-"]')).toHaveCount(1)
    await expect(page.getByText(`#${receivedNumber}`)).toBeVisible()

    await page.getByTestId('cheque-filter-trigger').click()
    await page.getByTestId('cheque-filter-status-cleared').click()
    await expect(page.locator('[data-testid^="cheque-card-"]')).toHaveCount(1)
    await expect(page.getByText(`#${clearedNumber}`)).toBeVisible()

    await page.getByTestId('cheque-filter-trigger').click()
    await page.getByTestId('cheque-filter-status-bounced').click()
    await expect(page.locator('[data-testid^="cheque-card-"]')).toHaveCount(0)
  })
})
