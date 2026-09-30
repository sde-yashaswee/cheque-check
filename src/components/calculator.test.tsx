import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Calculator } from './calculator'

afterEach(() => {
  cleanup()
})

describe('Calculator', () => {
  it('calculates a basic addition', () => {
    render(<Calculator onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '7' }))
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '=' }))

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('resets and closes from the floating panel', () => {
    const onClose = vi.fn()
    render(<Calculator onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: '9' }))
    fireEvent.click(screen.getByRole('button', { name: 'RESET' }))
    expect(
      within(screen.getByRole('dialog')).getByText('0', { selector: 'span' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close calculator' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('drags by the header and remembers the position', () => {
    localStorage.clear()
    render(<Calculator onClose={vi.fn()} />)
    const header = screen.getByText('Calculator').parentElement!

    fireEvent.pointerDown(header, {
      pointerId: 1,
      button: 0,
      clientX: 100,
      clientY: 100,
    })
    fireEvent.pointerMove(header, { pointerId: 1, clientX: 140, clientY: 130 })
    fireEvent.pointerUp(header, { pointerId: 1, clientX: 140, clientY: 130 })

    expect(JSON.parse(localStorage.getItem('calculator-position')!)).toEqual({
      x: 56,
      y: 102,
    })
    expect(screen.getByRole('dialog').style.transform).toBe(
      'translate3d(56px, 102px, 0)',
    )
  })
})
