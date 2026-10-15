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

    const draftChequeNumber = uniqueChequeNumber()
    await page.goto('/cheques/create')
    await page.getByTestId('cheque-amount-input').fill('6750')
    await page.getByTestId('cheque-number-input').fill(draftChequeNumber)
    await page.getByTestId('draft-save-button').click()
    await expect(page).toHaveURL(/draftId=/)

    await page.getByTestId('global-search-trigger').click()
    await page.getByTestId('global-search-input').fill(draftChequeNumber)
    const draftResult = page.getByTestId('global-search-result-cheque-draft')
    await expect(draftResult).toBeVisible()
    await draftResult.click()
    await expect(page).toHaveURL(/\/cheques\/create\?draftId=/)
  })

  test('shows a no-results message for a query matching nothing', async ({
    page,
  }) => {
    const query = uniqueE2eName('no-such-match')
    await page.goto('/')
    await page.getByTestId('global-search-trigger').click()
    await page.getByTestId('global-search-input').fill(query)
    await expect(
      page.getByText(`No results found for "${query}"`),
    ).toBeVisible()
  })

  test('only returns results from the active business', async ({ page }) => {
    const partyName = uniqueE2eName('search-isolated')
    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await page.goto('/')
    await page.getByTestId('global-search-trigger').click()
    await page.getByTestId('global-search-input').fill(partyName)
    await expect(page.getByTestId('global-search-result-party')).toBeVisible()
    await page.keyboard.press('Escape')

    // Businesses load newest-first, so creating one makes it the active
    // business on the next fresh page load without an explicit switch.
    const newBusiness = e2eBusinessName('search-isolation')
    await new BusinessesPage(page).createBusiness(
      newBusiness,
      uniqueE2eEmail('search-isolation'),
    )

    await page.goto('/')
    await page.getByTestId('global-search-trigger').click()
    await page.getByTestId('global-search-input').fill(partyName)
    await expect(
      page.getByText(`No results found for "${partyName}"`),
    ).toBeVisible()
  })
})
