import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { uniqueChequeNumber, uniqueE2eName } from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('accounts', () => {
  test('creates, edits, and deletes a bank account', async ({ page }) => {
    const accountName = uniqueE2eName('account')
    const updatedName = `${accountName}-updated`
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const accountsPage = new AccountsPage(page)

    await accountsPage.createAccount(accountName, accountNumber)
    await accountsPage.openByName(accountName)
    await page.getByTestId('speed-dial-edit-link').click()
    const accountNameInput = page.locator('#account_name')
    await accountNameInput.fill(updatedName)
    await expect(accountNameInput).toHaveValue(updatedName)
    const updateResponsePromise = page.waitForResponse((response) => {
      const request = response.request()
      return (
        request.method() === 'PATCH' &&
        new URL(response.url()).pathname.endsWith('/accounts')
      )
    })
    await page.getByTestId('account-edit-submit-button').click()
    expect((await updateResponsePromise).ok()).toBe(true)
    await expect(page.getByText(updatedName).first()).toBeVisible()

    await page.getByTestId('speed-dial-edit-link').click()
    await page.getByTestId('account-delete-trigger').click()
    await page.locator('#confirm_name').fill(updatedName)
    await page.getByTestId('delete-dialog-confirm-button').click()

    await expect(page).toHaveURL('/accounts')
    await expect(
      page.getByRole('link').filter({ hasText: updatedName }),
    ).toHaveCount(0)
  })
})
