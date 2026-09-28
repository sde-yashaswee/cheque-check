const BRAND_COLORS = ['#0066cc', '#2997ff', '#34C759', '#FFCC00', '#FF9500']

export function celebrate() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({
      particleCount: 140,
      spread: 75,
      startVelocity: 60,
      gravity: 1.1,
      ticks: 90,
      origin: { x: 0.5, y: 1 },
      colors: BRAND_COLORS,
      zIndex: 9999,
      disableForReducedMotion: true,
    })
  })
}

export interface PendingCelebration {
  /** Pathname where the celebration should fire once navigation lands. */
  target: string
  cheque?: { id: string; businessId: string }
}

let pending: PendingCelebration | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function queueCelebration(celebration: PendingCelebration) {
  pending = celebration
  emit()
}

export function clearPendingCelebration() {
  pending = null
  emit()
}

export function getPendingCelebration() {
  return pending
}

export function subscribeCelebrations(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
