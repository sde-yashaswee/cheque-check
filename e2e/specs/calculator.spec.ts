import { expect, test } from '@playwright/test'

// Uses the shared authenticated + onboarded session from global.setup.ts.
// Drag/position persistence is already covered at the unit level (calculator.test.tsx);
// this only verifies the calculator is reachable and functional from the real app shell.
test.describe('calculator', () => {
  test('opens from the top nav, computes a result, and closes', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open calculator' }).click()

    const calculator = page.getByRole('dialog', { name: 'Calculator' })
    await expect(calculator).toBeVisible()

    await calculator.getByRole('button', { name: '7', exact: true }).click()
    await calculator.getByRole('button', { name: '+', exact: true }).click()
    await calculator.getByRole('button', { name: '3', exact: true }).click()
    await calculator.getByRole('button', { name: '=', exact: true }).click()
    await expect(calculator.locator('span')).toHaveText('10')

    await calculator.getByRole('button', { name: 'RESET' }).click()
    await expect(calculator.locator('span')).toHaveText('0')

    await calculator.getByRole('button', { name: 'Close calculator' }).click()
    await expect(calculator).toHaveCount(0)
  })
})
