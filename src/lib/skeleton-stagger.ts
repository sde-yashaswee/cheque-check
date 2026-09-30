export const STAGGER_STEP_MS = 45
export const STAGGER_MAX_STEPS = 12
export const SKELETON_EXIT_MS = 260

export function staggerDelay(index: number): number {
  return Math.min(index, STAGGER_MAX_STEPS) * STAGGER_STEP_MS
}

/** Hands out sequential indices to skeletons mounting/unmounting in the same commit. */
export function createStaggerCounter() {
  let count = 0
  let scheduled = false
  return () => {
    if (!scheduled) {
      scheduled = true
      queueMicrotask(() => {
        count = 0
        scheduled = false
      })
    }
    return count++
  }
}

export function prefersReducedMotion(): boolean {
  return (
    document.documentElement.hasAttribute('data-reduce-motion') ||
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/** Leaves a fading copy of a skeleton in place after React removes the original. */
export function spawnSkeletonGhost(node: HTMLElement, delayMs: number): void {
  const rect = node.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return

  const ghost = node.cloneNode(true) as HTMLElement
  ghost.removeAttribute('id')
  ghost.setAttribute('aria-hidden', 'true')
  Object.assign(ghost.style, {
    position: 'absolute',
    inset: 'auto',
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    pointerEvents: 'none',
    zIndex: '30',
    animation: `skeleton-out ${SKELETON_EXIT_MS}ms ease-in ${delayMs}ms both`,
  })
  document.body.appendChild(ghost)

  const remove = () => ghost.remove()
  ghost.addEventListener('animationend', remove, { once: true })
  window.setTimeout(remove, SKELETON_EXIT_MS + delayMs + 100)
}
