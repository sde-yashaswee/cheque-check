import { expect, test } from '@playwright/test'
import { PartiesPage } from '../pages/parties.page'
import { E2E_PHONE, uniqueE2eName } from '../fixtures/test-data'

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
})
