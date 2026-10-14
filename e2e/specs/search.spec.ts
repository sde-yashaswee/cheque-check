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
test.describe('global search', () => {
  test('finds a party and opens its detail page', async ({ page }) => {
    const partyName = uniqueE2eName('search-party')
    const accountName = uniqueE2eName('search-account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()
    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)
    await new ChequesPage(page).createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber,
    })
    await page.goto('/accounts')
    await expect(
      page.getByRole('link').filter({ hasText: accountName.slice(0, 15) }),
    ).toBeVisible()

    const cases = [
      {
        query: partyName,
        resultTestId: 'global-search-result-party',
        url: /\/parties\/[\w-]+$/,
      },
      {
        query: accountName,
        resultTestId: 'global-search-result-account',
        url: /\/accounts\/[\w-]+$/,
      },
      {
        query: chequeNumber,
        resultTestId: 'global-search-result-cheque',
        url: /\/cheques$/,
      },
    ]

    for (const { query, resultTestId, url } of cases) {
      await page.getByTestId('global-search-trigger').click()
      await page.getByTestId('global-search-input').fill(query)
      const result = page.getByTestId(resultTestId)
      await expect(result).toBeVisible()
      await result.click()
      await expect(page).toHaveURL(url)
    }
  })
})
