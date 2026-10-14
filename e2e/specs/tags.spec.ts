import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { ChequesPage } from '../pages/cheques.page'
import { PartiesPage } from '../pages/parties.page'
import { TagsPage } from '../pages/tags.page'
import {
  E2E_PHONE,
  uniqueChequeNumber,
  uniqueE2eName,
} from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('tags', () => {
  test('creates a tag, assigns it to a cheque, and shows the linked cheque', async ({
    page,
  }) => {
    const tagName = uniqueE2eName('tag')
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()

    await new TagsPage(page).createTag(tagName)
    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.goto()
    await chequesPage.openCreate()
    await chequesPage.fillDetails({ amount: 875, chequeNumber })
    await chequesPage.selectPartyAndAccount(partyName, accountNumber.slice(-4))
    await page.getByTestId('tag-selector-trigger').click()
    await page.getByRole('button', { name: tagName }).click()

    const depositDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    await chequesPage.finishAndSubmit(depositDate)
    await expect(page).toHaveURL('/cheques')
    await chequesPage.openByChequeNumber(chequeNumber)
    await expect(page.getByText(tagName).first()).toBeVisible()

    await page.goto('/tags')
    await page.getByRole('link').filter({ hasText: tagName }).click()
    await expect(page.getByText(`#${chequeNumber}`).first()).toBeVisible()
  })
})
