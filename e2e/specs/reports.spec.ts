import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { ChequesPage } from '../pages/cheques.page'
import { LoginPage } from '../pages/login.page'
import { OnboardingPage } from '../pages/onboarding.page'
import { PartiesPage } from '../pages/parties.page'
import { createConfirmedE2eUser, grantLifetimePremium } from '../admin-client'
import {
  E2E_PHONE,
  e2eBusinessName,
  e2eUser,
  uniqueChequeNumber,
  uniqueE2eName,
} from '../fixtures/test-data'

// The shared global-setup user has no premium entitlement.
test('non-premium users see the reports paywall', async ({ page }) => {
  await page.goto('/reports')
  await expect(page.getByTestId('reports-premium-gate')).toBeVisible()
})

test.describe('premium reports', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('premium user can download every report format', async ({ page }) => {
    const user = e2eUser('reports')
    const createdUser = await createConfirmedE2eUser(user)
    await grantLifetimePremium(createdUser.id)

    const login = new LoginPage(page)
    await login.goto()
    await login.login(user.email, user.password)
    await page.waitForURL('/onboarding')
    await new OnboardingPage(page).completeWithDefaults(
      e2eBusinessName('reports'),
    )
    await page.waitForURL('/')

    const partyName = uniqueE2eName('party')
    const accountName = uniqueE2eName('account')
    const accountNumber = uniqueChequeNumber() + uniqueChequeNumber()
    await new PartiesPage(page).createParty(partyName, E2E_PHONE)
    await new AccountsPage(page).createAccount(accountName, accountNumber)
    await new ChequesPage(page).createCheque({
      partyName,
      accountSearch: accountNumber.slice(-4),
      chequeNumber: uniqueChequeNumber(),
    })

    await page.goto('/reports')
    await expect(page.getByTestId('reports-content')).toBeVisible()
    const formats = [
      ['csv', '.csv'],
      ['json', '.json'],
      ['pdf', '.pdf'],
      ['excel', '.xlsx'],
    ] as const

    for (const [format, extension] of formats) {
      await page.getByTestId('reports-export-trigger').click()
      const downloadPromise = page.waitForEvent('download')
      await page.getByTestId(`reports-export-${format}`).click()
      const download = await downloadPromise
      expect(download.suggestedFilename().endsWith(extension)).toBe(true)
    }
  })
})
