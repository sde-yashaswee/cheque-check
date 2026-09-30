'use client'

import { useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  createStaggerCounter,
  prefersReducedMotion,
  spawnSkeletonGhost,
  staggerDelay,
} from '@/lib/skeleton-stagger'

const nextEnterIndex = createStaggerCounter()
const nextExitIndex = createStaggerCounter()

function Skeleton({
  className,
  style,
  stagger = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!stagger || !node) return
    node.style.setProperty(
      '--skeleton-delay',
      `${staggerDelay(nextEnterIndex())}ms`,
    )
    return () => {
      if (!node.isConnected || prefersReducedMotion()) return
      spawnSkeletonGhost(node, staggerDelay(nextExitIndex()))
    }
  }, [stagger])

  return (
    <div
      ref={ref}
      data-slot="skeleton"
      className={cn(
        'bg-muted rounded-md',
        stagger ? 'skeleton-stagger' : 'animate-pulse',
        className,
      )}
      style={style}
      {...props}
    />
  )
}

export { Skeleton }
