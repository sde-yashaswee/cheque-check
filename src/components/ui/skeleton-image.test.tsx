import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { EntityAvatar } from './entity-avatar'
import { SkeletonImage } from './skeleton-image'

afterEach(cleanup)

describe('SkeletonImage', () => {
  it('shows a skeleton until load and resets when the source changes', () => {
    const { container, rerender } = render(
      <SkeletonImage
        src="/first.png"
        alt="Cheque"
        containerClassName="h-20 w-20"
      />,
    )
    const firstImage = screen.getByAltText('Cheque')

    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
    expect(firstImage).toHaveClass('invisible')

    fireEvent.load(firstImage)
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).not.toBeInTheDocument()
    expect(firstImage).not.toHaveClass('invisible')

    rerender(
      <SkeletonImage
        src="/second.png"
        alt="Cheque"
        containerClassName="h-20 w-20"
      />,
    )
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
    expect(screen.getByAltText('Cheque')).toHaveClass('invisible')
  })

  it('shows the image description when loading fails', () => {
    const { container } = render(
      <SkeletonImage
        src="/missing.png"
        alt="Cheque"
        containerClassName="h-20 w-20"
      />,
    )

    fireEvent.error(screen.getByAltText('Cheque'))

    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Cheque')).toBeInTheDocument()
    expect(screen.getByAltText('Cheque')).toHaveClass('hidden')
  })
})

describe('EntityAvatar', () => {
  it('shows a skeleton until the avatar loads and initials if it fails', () => {
    const { container, rerender } = render(
      <EntityAvatar name="Alice" imageUrl="/alice.png" />,
    )

    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
    fireEvent.load(screen.getByAltText('Alice'))
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).not.toBeInTheDocument()

    rerender(<EntityAvatar name="Alice" imageUrl="/missing.png" />)
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
    fireEvent.error(screen.getByAltText('Alice'))
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).not.toBeInTheDocument()
  })
})
