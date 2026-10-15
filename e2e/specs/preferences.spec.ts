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
test.describe('preferences', () => {
  test('currency and date format changes propagate to cheque records', async ({
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
    })

    await page.goto('/settings/preferences')
    const currency = page.getByTestId('preferences-currency')
    await currency.click()
    await page.getByRole('option', { name: '$ (USD)' }).click()
    await expect(currency).toContainText('$ (USD)')

    const dateFormat = page.getByTestId('preferences-date-format')
    await dateFormat.click()
    await page.getByRole('option', { name: 'YYYY-MM-DD' }).click()
    await expect(dateFormat).toContainText('YYYY-MM-DD')

    await chequesPage.goto()
    const card = page
      .locator('[data-testid^="cheque-card-"]')
      .filter({ hasText: `#${chequeNumber}` })
    await expect(card).toContainText('$1,500')
    await expect(card).toContainText(/\d{4}-\d{2}-\d{2}/)

    await page.goto('/settings/preferences')
    await page.getByTestId('preferences-currency').click()
    await page.getByRole('option', { name: '₹ (INR)' }).click()
    await page.getByTestId('preferences-date-format').click()
    await page.getByRole('option', { name: 'DD/MM/YYYY' }).click()
  })

  test('time format selection is saved across a reload', async ({ page }) => {
    await page.goto('/settings/preferences')
    const timeFormat = page.getByTestId('preferences-time-format')
    await expect(timeFormat).toContainText('12-hour (AM/PM)')

    await timeFormat.click()
    await page.getByRole('option', { name: '24-hour' }).click()
    await expect(timeFormat).toContainText('24-hour')

    await page.reload()
    await expect(timeFormat).toContainText('24-hour')

    await timeFormat.click()
    await page.getByRole('option', { name: '12-hour (AM/PM)' }).click()
  })
})
