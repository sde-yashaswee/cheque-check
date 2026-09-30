'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon as CloseIcon,
  Calculator01Icon as CalculatorIcon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  clampPosition,
  loadCalculatorPosition,
  saveCalculatorPosition,
  type Point,
} from '@/lib/calculator-position'

const DEFAULT_POSITION: Point = { x: 16, y: 72 }

const buttonValues = [
  [7, 8, 9, 'DEL'],
  [4, 5, 6, '+'],
  [1, 2, 3, '-'],
  ['.', 0, '/', 'x'],
  ['RESET', '='],
] as const

type CalculatorButton = (typeof buttonValues)[number][number]
type Operator = '+' | '-' | '/' | 'x'

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return 'Error'
  return Number.isInteger(value)
    ? String(value)
    : Number(value.toFixed(10)).toString()
}

export function Calculator({ onClose }: { onClose: () => void }) {
  const [result, setResult] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const position = useRef<Point>(DEFAULT_POSITION)
  const dragState = useRef<{
    pointerId: number
    startX: number
    startY: number
    origin: Point
  } | null>(null)
  const frame = useRef(0)
  const pendingPosition = useRef<Point | null>(null)

  const applyPosition = (next: Point) => {
    const panel = panelRef.current
    if (!panel) return
    position.current = clampPosition(
      next,
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    )
    panel.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`
  }

  useLayoutEffect(() => {
    applyPosition(loadCalculatorPosition(DEFAULT_POSITION))
    const handleResize = () => applyPosition(position.current)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: position.current,
    }
  }

  const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const next = {
      x: drag.origin.x + event.clientX - drag.startX,
      y: drag.origin.y + event.clientY - drag.startY,
    }
    cancelAnimationFrame(frame.current)
    pendingPosition.current = next
    frame.current = requestAnimationFrame(() => applyPosition(next))
  }

  const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return
    dragState.current = null
    cancelAnimationFrame(frame.current)
    if (pendingPosition.current) applyPosition(pendingPosition.current)
    pendingPosition.current = null
    saveCalculatorPosition(position.current)
  }

  const reset = () => {
    setResult('0')
    setStoredValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  const calculate = (left: number, right: number, action: Operator) => {
    if (action === '+') return left + right
    if (action === '-') return left - right
    if (action === 'x') return left * right
    return right === 0 ? Number.NaN : left / right
  }

  const handleClick = (value: CalculatorButton) => {
    if (value === 'RESET') {
      reset()
      return
    }

    if (value === 'DEL') {
      setResult((current) => (current.length > 1 ? current.slice(0, -1) : '0'))
      return
    }

    if (typeof value === 'number' || value === '.') {
      const digit = String(value)
      setResult((current) => {
        if (current === 'Error' || waitingForOperand)
          return digit === '.' ? '0.' : digit
        if (digit === '.' && current.includes('.')) return current
        return current === '0' && digit !== '.' ? digit : current + digit
      })
      setWaitingForOperand(false)
      return
    }

    if (value === '=') {
      if (storedValue === null || !operator) return
      setResult(formatResult(calculate(storedValue, Number(result), operator)))
      setStoredValue(null)
      setOperator(null)
      setWaitingForOperand(true)
      return
    }

    const currentValue = Number(result)
    if (storedValue !== null && operator && !waitingForOperand) {
      const nextValue = calculate(storedValue, currentValue, operator)
      setResult(formatResult(nextValue))
      setStoredValue(nextValue)
    } else {
      setStoredValue(currentValue)
    }
    setOperator(value)
    setWaitingForOperand(true)
  }

  return (
    <div
      ref={panelRef}
      className="fixed left-0 top-0 z-[90] w-[248px] rounded-2xl border border-primary/15 bg-background p-3 shadow-2xl will-change-transform"
      role="dialog"
      aria-label="Calculator"
    >
      <div
        className="flex cursor-grab touch-none select-none items-center justify-between border-b border-border/60 px-1 pb-2 active:cursor-grabbing"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HugeiconsIcon
            icon={CalculatorIcon}
            className="h-4 w-4 text-primary"
          />
          Calculator
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
          aria-label="Close calculator"
        >
          <HugeiconsIcon icon={CloseIcon} className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 rounded-lg bg-foreground px-3 py-3 text-right text-2xl font-semibold tabular-nums text-background">
        <span>{result}</span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-muted/70 p-2">
        {buttonValues.flat().map((value, index) => (
          <button
            key={`${value}-${index}`}
            type="button"
            value={value}
            onClick={() => handleClick(value)}
            className={cn(
              'h-10 rounded-lg border border-border/50 bg-background text-sm font-semibold shadow-sm transition-colors hover:bg-primary/10 active:scale-95',
              (value === 'DEL' || value === 'RESET') &&
                'bg-muted text-muted-foreground',
              value === '=' &&
                'col-span-2 bg-primary text-primary-foreground hover:bg-primary/90',
              value === 'RESET' && 'col-span-2',
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
