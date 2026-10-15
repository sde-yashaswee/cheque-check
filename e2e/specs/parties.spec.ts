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
test.describe('parties', () => {
  test('creates, edits, and deletes a party', async ({ page }) => {
    const partyName = uniqueE2eName('party')
    const updatedName = `${partyName}-updated`
    const partiesPage = new PartiesPage(page)

    await partiesPage.createParty(partyName, E2E_PHONE)
    await partiesPage.openByName(partyName)
    await page.getByTestId('speed-dial-edit-link').click()
    const partyNameInput = page.locator('#name')
    await partyNameInput.fill(updatedName)
    await expect(partyNameInput).toHaveValue(updatedName)
    const updateResponsePromise = page.waitForResponse((response) => {
      const request = response.request()
      return (
        request.method() === 'PATCH' &&
        new URL(response.url()).pathname.endsWith('/parties')
      )
    })
    await page.getByTestId('party-edit-submit-button').click()
    expect((await updateResponsePromise).ok()).toBe(true)
    await expect(page.getByText(updatedName).first()).toBeVisible()

    await page.getByTestId('speed-dial-edit-link').click()
    await page.getByTestId('party-delete-trigger').click()
    await page.locator('#confirm_name').fill(updatedName)
    await page.getByTestId('delete-dialog-confirm-button').click()

    await expect(page).toHaveURL('/parties')
    await expect(
      page.getByRole('link').filter({ hasText: updatedName }),
    ).toHaveCount(0)
  })

  test('blocks an invalid phone number from advancing past step 2', async ({
    page,
  }) => {
    await page.goto('/parties/create')
    await page.locator('#name').fill(uniqueE2eName('party'))
    await page.getByTestId('party-step1-continue').click()

    await page.locator('#contact').fill('123')
    await page.getByTestId('party-step2-continue').click()
    await expect(page.getByText('Enter a valid phone number')).toBeVisible()
    await expect(page.getByTestId('party-submit-button')).toHaveCount(0)
  })

  test('soft-deletes a party without removing its linked cheque', async ({
    page,
  }) => {
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()
    const partiesPage = new PartiesPage(page)

    await partiesPage.createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)
    await new ChequesPage(page).createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber,
    })

    await partiesPage.openByName(partyName)
    await page.getByTestId('speed-dial-edit-link').click()
    await page.getByTestId('party-delete-trigger').click()
    await page.locator('#confirm_name').fill(partyName)
    await page.getByTestId('delete-dialog-confirm-button').click()

    await page.goto('/parties')
    await expect(
      page.getByRole('link').filter({ hasText: partyName }),
    ).toHaveCount(0)
    await page.goto('/cheques')
    await expect(page.getByText(`#${chequeNumber}`).first()).toBeVisible()
  })
})
