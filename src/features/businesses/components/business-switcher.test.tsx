import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import messages from '../../../../messages/en.json'
import { BusinessSwitcher } from './business-switcher'

vi.mock('@/hooks/use-business', () => ({
  useBusiness: () => ({
    activeBusiness: null,
    businesses: [{ id: 'business-1', name: 'Acme' }],
    setActiveBusiness: vi.fn(),
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: keyof typeof messages.Businesses) =>
    messages.Businesses[key],
}))

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  },
)
Element.prototype.scrollIntoView = vi.fn()

describe('BusinessSwitcher', () => {
  it('offers to create a business when the search has no matches', async () => {
    render(<BusinessSwitcher trigger={<button>Choose business</button>} />)

    fireEvent.click(screen.getByRole('button', { name: 'Choose business' }))
    fireEvent.change(screen.getByPlaceholderText('Search business...'), {
      target: { value: 'missing' },
    })

    expect(await screen.findByText('No business found.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Add New Business' }),
    ).toHaveAttribute('href', '/businesses/create')
  })
})
