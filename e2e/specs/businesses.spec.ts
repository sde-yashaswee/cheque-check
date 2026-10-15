import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { BusinessesPage } from '../pages/businesses.page'
import { ChequesPage } from '../pages/cheques.page'
import { PartiesPage } from '../pages/parties.page'
import {
  e2eBusinessName,
  uniqueE2eEmail,
  uniqueE2eName,
  uniqueChequeNumber,
  E2E_PHONE,
} from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('businesses', () => {
  test('edits and deletes a business', async ({ page }) => {
    const businessName = e2eBusinessName('manage')
    const updatedName = `${businessName}-updated`
    const businessesPage = new BusinessesPage(page)

    await businessesPage.createBusiness(
      businessName,
      uniqueE2eEmail('business'),
    )
    await businessesPage.openByName(businessName)
    await page.getByTestId('speed-dial-edit-link').click()
    await page.locator('#name').fill(updatedName)
    await page.getByTestId('business-edit-submit-button').click()
    await expect(page.getByText(updatedName).first()).toBeVisible()

    await page.getByTestId('speed-dial-edit-link').click()
    await page.getByTestId('business-delete-trigger').click()
    await page.locator('#confirm_name').fill(updatedName)
    await page.getByTestId('delete-dialog-confirm-button').click()

    await expect(page).toHaveURL('/businesses')
    await expect(
      page
        .locator('[data-testid^="business-card-"]')
        .filter({ hasText: updatedName }),
    ).toHaveCount(0)
  })

  test('creates a business, switches context, and isolates party data', async ({
    page,
  }) => {
    const originalParty = uniqueE2eName('party')
    const originalAccount = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()
    const newBusiness = e2eBusinessName('secondary')
    const partiesPage = new PartiesPage(page)
    const businessesPage = new BusinessesPage(page)

    await partiesPage.createParty(originalParty, E2E_PHONE)
    await new AccountsPage(page).createAccount(originalAccount, accountNumber)
    await new ChequesPage(page).createCheque({
      partyName: originalParty,
      accountSearch: accountNumber.slice(-4),
      chequeNumber,
    })
    await page.locator('nav a[href="/parties"]').click()
    const originalBusinessLabel = await page
      .getByTestId('business-switcher-trigger')
      .getAttribute('data-active-business-name')
    expect(originalBusinessLabel).toBeTruthy()

    await businessesPage.createBusiness(newBusiness, uniqueE2eEmail('business'))
    await expect(page).toHaveURL('/businesses')
    await expect(page.getByText(newBusiness).first()).toBeVisible()

    await page.locator('nav a[href="/parties"]').click()
    await expect(page.getByText(originalParty)).toHaveCount(0)
    await page.locator('nav a[href="/accounts"]').click()
    await expect(
      page.getByRole('link').filter({ hasText: originalAccount.slice(0, 15) }),
    ).toHaveCount(0)
    await page.locator('nav a[href="/cheques"]').click()
    await expect(
      page
        .locator('[data-testid^="cheque-card-"]')
        .filter({ hasText: `#${chequeNumber}` }),
    ).toHaveCount(0)

    await expect(page.getByTestId('business-switcher-trigger')).toHaveAttribute(
      'data-active-business-name',
      newBusiness,
    )
    await businessesPage.switchTo(originalBusinessLabel!)
    await expect(page.getByText(originalParty).first()).toBeVisible()
    await page.locator('nav a[href="/accounts"]').click()
    await expect(
      page.getByRole('link').filter({ hasText: originalAccount.slice(0, 15) }),
    ).toBeVisible()
    await page.locator('nav a[href="/cheques"]').click()
    await expect(
      page
        .locator('[data-testid^="cheque-card-"]')
        .filter({ hasText: `#${chequeNumber}` }),
    ).toBeVisible()

    await businessesPage.switchTo(newBusiness)
    await expect(page.getByText(originalParty)).toHaveCount(0)
    await businessesPage.switchTo(originalBusinessLabel!)
  })

  test('switcher search with no match shows no selectable business', async ({
    page,
  }) => {
    await page.goto('/')
    await new BusinessesPage(page).openSwitcher()
    await page
      .getByTestId('business-switcher-search')
      .fill(uniqueE2eName('no-such-business'))
    await expect(page.getByRole('option')).toHaveCount(0)
  })
})
