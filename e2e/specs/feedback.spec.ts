import { expect, test } from '@playwright/test'
import { AccountsPage } from '../pages/accounts.page'
import { ChequesPage } from '../pages/cheques.page'
import { LoginPage } from '../pages/login.page'
import { OnboardingPage } from '../pages/onboarding.page'
import { PartiesPage } from '../pages/parties.page'
import { createConfirmedE2eUser } from '../admin-client'
import {
  E2E_PHONE,
  e2eBusinessName,
  e2eUser,
  uniqueChequeNumber,
  uniqueE2eName,
} from '../fixtures/test-data'

// A fresh user has no previous NPS response, so the first cheque creation is eligible.
test.describe('feedback', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('submits an NPS response after the first cheque is created', async ({
    page,
  }) => {
    const user = e2eUser('feedback')
    await createConfirmedE2eUser(user)

    const login = new LoginPage(page)
    await login.goto()
    await login.login(user.email, user.password)
    await page.waitForURL('/onboarding')
    await new OnboardingPage(page).completeWithDefaults(
      e2eBusinessName('feedback'),
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
      dismissNps: false,
    })

    await expect(page.getByTestId('nps-score-group')).toBeVisible({
      timeout: 10_000,
    })
    await page.getByTestId('nps-score-9').click()
    await page.getByTestId('nps-submit-button').click()
    await expect(page.getByTestId('nps-score-group')).toHaveCount(0)
  })
})
