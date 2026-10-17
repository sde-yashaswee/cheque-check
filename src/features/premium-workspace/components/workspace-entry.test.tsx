import { cleanup, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, describe, expect, it, vi } from 'vitest'
import messages from '../../../../messages/en.json'
import { WorkspaceEntry } from './workspace-entry'

vi.mock('@/features/monetization/components/premium-gate', () => ({
  PremiumGate: ({ feature }: { feature: string }) => (
    <p data-testid="locked-feature">{feature}</p>
  ),
}))
vi.mock('./workspace', () => ({
  PremiumWorkspace: () => <p>Paid workspace data</p>,
}))

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/premium')
})

describe('locked workspace entry context', () => {
  it.each([
    'party-statements',
    'consolidated-dashboard',
    'cheque-templates',
    'saved-views',
  ])('uses the %s entry feature without rendering paid content', (feature) => {
    window.history.replaceState(
      null,
      '',
      `/premium?partyId=not-owned#${feature}`,
    )
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <WorkspaceEntry />
      </NextIntlClientProvider>,
    )
    expect(
      screen.getByRole('heading', { name: 'Premium workspace' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('locked-feature')).toHaveTextContent(feature)
    expect(screen.queryByText('Paid workspace data')).not.toBeInTheDocument()
  })
  it('keeps unknown links discoverable with neutral workspace context and a gated fallback', () => {
    window.history.replaceState(null, '', '/premium#unknown')
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <WorkspaceEntry />
      </NextIntlClientProvider>,
    )
    expect(
      screen.getByRole('heading', { name: 'Premium workspace' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('locked-feature')).toHaveTextContent(
      'bulk-import',
    )
    expect(screen.queryByText('Paid workspace data')).not.toBeInTheDocument()
  })
})
