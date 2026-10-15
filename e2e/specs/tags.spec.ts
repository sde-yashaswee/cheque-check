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
  test('edits and deletes a tag', async ({ page }) => {
    const tagName = uniqueE2eName('tag')
    const updatedName = `${tagName}-updated`
    await new TagsPage(page).createTag(tagName)

    await page.getByTestId('speed-dial-edit-link').click()
    await page.locator('#tag-name').fill(updatedName)
    await page.getByTestId('tag-form-submit-button').click()
    await expect(page.getByText(updatedName).first()).toBeVisible()

    await page.getByTestId('speed-dial-edit-link').click()
    await page.getByTestId('tag-delete-trigger').click()
    await page.locator('#confirm_name').fill(updatedName)
    await page.getByTestId('delete-dialog-confirm-button').click()

    await expect(page).toHaveURL('/tags')
    await expect(
      page.getByRole('link').filter({ hasText: updatedName }),
    ).toHaveCount(0)
  })

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

  test('renaming a tag keeps it linked to its cheque', async ({ page }) => {
    const tagName = uniqueE2eName('tag')
    const renamedTag = `${tagName}-renamed`
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()

    const tagsPage = new TagsPage(page)
    await tagsPage.createTag(tagName)
    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.goto()
    await chequesPage.openCreate()
    await chequesPage.fillDetails({ amount: 950, chequeNumber })
    await chequesPage.selectPartyAndAccount(partyName, accountNumber.slice(-4))
    await page.getByTestId('tag-selector-trigger').click()
    await page.getByRole('button', { name: tagName }).click()
    const depositDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    await chequesPage.finishAndSubmit(depositDate)

    await page.goto('/tags')
    await page.getByRole('link').filter({ hasText: tagName }).click()
    await page.getByTestId('speed-dial-edit-link').click()
    await page.locator('#tag-name').fill(renamedTag)
    await page.getByTestId('tag-form-submit-button').click()
    await expect(page.locator('[data-slot="toast-title"]')).toContainText(
      'Tag updated',
    )

    await chequesPage.openByChequeNumber(chequeNumber)
    await expect(page.getByText(renamedTag).first()).toBeVisible()
    await expect(page.getByText(tagName, { exact: true })).toHaveCount(0)
  })

  test('deleting a tag unassigns it without deleting the cheque', async ({
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
    await chequesPage.fillDetails({ amount: 950, chequeNumber })
    await chequesPage.selectPartyAndAccount(partyName, accountNumber.slice(-4))
    await page.getByTestId('tag-selector-trigger').click()
    await page.getByRole('button', { name: tagName }).click()
    const depositDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    await chequesPage.finishAndSubmit(depositDate)

    await page.goto('/tags')
    await page.getByRole('link').filter({ hasText: tagName }).click()
    await page.getByTestId('speed-dial-edit-link').click()
    await page.getByTestId('tag-delete-trigger').click()
    await page.locator('#confirm_name').fill(tagName)
    await page.getByTestId('delete-dialog-confirm-button').click()
    await expect(page).toHaveURL('/tags')
    await expect(page.getByText(tagName)).toHaveCount(0)

    await chequesPage.openByChequeNumber(chequeNumber)
    await expect(page.getByTestId('cheque-detail-amount')).toBeVisible()
    await expect(page.getByText(tagName)).toHaveCount(0)
  })

  test('assigns two tags to one cheque', async ({ page }) => {
    const firstTag = uniqueE2eName('tag')
    const secondTag = uniqueE2eName('tag')
    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    const chequeNumber = uniqueChequeNumber()

    await new TagsPage(page).createTag(firstTag)
    await new TagsPage(page).createTag(secondTag)
    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)

    const chequesPage = new ChequesPage(page)
    await chequesPage.goto()
    await chequesPage.openCreate()
    await chequesPage.fillDetails({ amount: 950, chequeNumber })
    await chequesPage.selectPartyAndAccount(partyName, accountNumber.slice(-4))
    await page.getByTestId('tag-selector-trigger').click()
    await page.getByRole('button', { name: firstTag }).click()
    await page.getByRole('button', { name: secondTag }).click()
    const depositDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    await chequesPage.finishAndSubmit(depositDate)

    await chequesPage.openByChequeNumber(chequeNumber)
    await expect(page.getByText(firstTag).first()).toBeVisible()
    await expect(page.getByText(secondTag).first()).toBeVisible()
  })
})
