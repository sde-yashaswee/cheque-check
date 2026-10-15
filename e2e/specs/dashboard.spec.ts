import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { BusinessesPage } from '../pages/businesses.page'
import { ChequesPage } from '../pages/cheques.page'
import { PartiesPage } from '../pages/parties.page'
import {
  E2E_PHONE,
  e2eBusinessName,
  uniqueChequeNumber,
  uniqueE2eEmail,
  uniqueE2eName,
} from '../fixtures/test-data'

// Uses a dedicated business so dashboard totals are deterministic.
test("dashboard shows the current balance and today's cheque", async ({
  page,
}) => {
  await new BusinessesPage(page).createBusiness(
    e2eBusinessName('dashboard'),
    uniqueE2eEmail('dashboard'),
  )

  const partyName = uniqueE2eName('party')
  const accountName = uniqueE2eName('account')
  const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
  const chequeNumber = uniqueChequeNumber()
  await new PartiesPage(page).createParty(partyName, E2E_PHONE)
  await new AccountsPage(page).createAccount(accountName, accountNumber)
  await new ChequesPage(page).createCheque({
    partyName,
    accountSearch: accountNumber.slice(-4),
    chequeNumber,
    amount: 1500,
  })

  await page.goto('/')
  await expect(page.getByTestId('dashboard-current-balance')).toHaveText(
    '-₹1,500',
  )
  await expect(
    page
      .locator('[data-testid^="cheque-card-"]')
      .filter({ hasText: `#${chequeNumber}` }),
  ).toBeVisible()
})

// A second, separate business keeps this chart assertion independent of the
// single-cheque scenario above.
test('stats chart only shows legend entries for statuses with cheques', async ({
  page,
}) => {
  await new BusinessesPage(page).createBusiness(
    e2eBusinessName('dashboard-chart'),
    uniqueE2eEmail('dashboard-chart'),
  )

  const partyName = uniqueE2eName('party')
  const accountName = uniqueE2eName('account')
  const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
  await new PartiesPage(page).createParty(partyName, E2E_PHONE)
  await new AccountsPage(page).createAccount(accountName, accountNumber)

  const chequesPage = new ChequesPage(page)
  await chequesPage.createCheque({
    partyName,
    accountSearch: accountNumber.slice(-4),
    chequeNumber: uniqueChequeNumber(),
    amount: 1000,
    type: 'Outward',
  })
  await chequesPage.createCheque({
    partyName,
    accountSearch: accountNumber.slice(-4),
    chequeNumber: uniqueChequeNumber(),
    amount: 2500,
    type: 'Inward',
  })

  await page.goto('/')
  const chart = page.locator('.recharts-responsive-container')
  await expect(chart.getByText('Issued', { exact: true })).toBeVisible()
  await expect(chart.getByText('Received', { exact: true })).toBeVisible()
  await expect(chart.getByText('Cleared', { exact: true })).toHaveCount(0)
  await expect(chart.getByText('Bounced', { exact: true })).toHaveCount(0)
})
