import { expect, test } from '@playwright/test'
import { BusinessesPage } from '../pages/businesses.page'
import { PartiesPage } from '../pages/parties.page'
import {
  e2eBusinessName,
  uniqueE2eEmail,
  uniqueE2eName,
  E2E_PHONE,
} from '../fixtures/test-data'

// Uses the shared authenticated + onboarded session from global.setup.ts.
test.describe('businesses', () => {
  test('creates a business, switches context, and isolates party data', async ({
    page,
  }) => {
    const originalParty = uniqueE2eName('party')
    const newBusiness = e2eBusinessName('secondary')
    const partiesPage = new PartiesPage(page)
    const businessesPage = new BusinessesPage(page)

    await partiesPage.createParty(originalParty, E2E_PHONE)
    await page.goto('/parties')
    const originalBusinessLabel = await page
      .getByTestId('business-switcher-trigger')
      .getAttribute('data-active-business-name')
    expect(originalBusinessLabel).toBeTruthy()

    await businessesPage.createBusiness(newBusiness, uniqueE2eEmail('business'))
    await expect(page).toHaveURL('/businesses')
    await expect(page.getByText(newBusiness).first()).toBeVisible()

    await page.goto('/parties')
    await expect(page.getByText(originalParty)).toHaveCount(0)

    await expect(page.getByTestId('business-switcher-trigger')).toHaveAttribute(
      'data-active-business-name',
      newBusiness,
    )
    await businessesPage.switchTo(originalBusinessLabel!)
    await expect(page.getByText(originalParty).first()).toBeVisible()

    await businessesPage.switchTo(newBusiness)
    await expect(page.getByText(originalParty)).toHaveCount(0)
    await businessesPage.switchTo(originalBusinessLabel!)
  })
})
