export interface Point {
  x: number
  y: number
}

export const CALCULATOR_POSITION_KEY = 'calculator-position'
const MARGIN = 8

/** Keeps a panel of `size` fully inside the viewport. */
export function clampPosition(
  position: Point,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
): Point {
  const maxX = Math.max(MARGIN, viewport.width - size.width - MARGIN)
  const maxY = Math.max(MARGIN, viewport.height - size.height - MARGIN)
  return {
    x: Math.min(Math.max(MARGIN, position.x), maxX),
    y: Math.min(Math.max(MARGIN, position.y), maxY),
  }
}

export function loadCalculatorPosition(fallback: Point): Point {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CALCULATOR_POSITION_KEY) ?? 'null',
    )
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) {
      return { x: saved.x, y: saved.y }
    }
  } catch {
    // Ignore unavailable storage or malformed values.
  }
  return fallback
}

export function saveCalculatorPosition(position: Point): void {
  try {
    localStorage.setItem(CALCULATOR_POSITION_KEY, JSON.stringify(position))
  } catch {
    // Storage can be unavailable (private mode); position just won't persist.
  }
}
