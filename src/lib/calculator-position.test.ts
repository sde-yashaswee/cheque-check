import { afterEach, describe, expect, it } from 'vitest'
import {
  CALCULATOR_POSITION_KEY,
  clampPosition,
  loadCalculatorPosition,
  saveCalculatorPosition,
} from './calculator-position'

const size = { width: 248, height: 360 }
const viewport = { width: 400, height: 800 }

describe('clampPosition', () => {
  it('keeps the panel inside the viewport with a margin', () => {
    expect(clampPosition({ x: -50, y: -10 }, size, viewport)).toEqual({
      x: 8,
      y: 8,
    })
    expect(clampPosition({ x: 999, y: 999 }, size, viewport)).toEqual({
      x: 400 - 248 - 8,
      y: 800 - 360 - 8,
    })
  })

  it('leaves in-bounds positions untouched', () => {
    expect(clampPosition({ x: 20, y: 100 }, size, viewport)).toEqual({
      x: 20,
      y: 100,
    })
  })

  it('pins to the margin when the viewport is smaller than the panel', () => {
    expect(
      clampPosition({ x: 50, y: 50 }, size, { width: 200, height: 300 }),
    ).toEqual({ x: 8, y: 8 })
  })
})

describe('calculator position storage', () => {
  afterEach(() => localStorage.clear())

  it('round-trips a saved position', () => {
    saveCalculatorPosition({ x: 30, y: 40 })
    expect(loadCalculatorPosition({ x: 0, y: 0 })).toEqual({ x: 30, y: 40 })
  })

  it('falls back on missing or malformed data', () => {
    expect(loadCalculatorPosition({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 })
    localStorage.setItem(CALCULATOR_POSITION_KEY, '{bad')
    expect(loadCalculatorPosition({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 })
  })
})
