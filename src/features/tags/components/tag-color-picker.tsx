'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon as Check } from '@hugeicons/core-free-icons'
import { TAG_COLORS } from '@/features/tags/lib/tag-colors'
import { cn } from '@/lib/utils'

interface TagColorPickerProps {
  value: string
  onChange: (color: string) => void
  label: string
}

export function TagColorPicker({
  value,
  onChange,
  label,
}: TagColorPickerProps) {
  const selected = value.toLowerCase()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-6 gap-3 sm:grid-cols-12"
    >
      {TAG_COLORS.map((color) => {
        const isSelected = selected === color.value
        return (
          <button
            key={color.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.name}
            title={color.name}
            onClick={() => onChange(color.value)}
            className={cn(
              'flex aspect-square w-full items-center justify-center rounded-full text-white ring-offset-2 ring-offset-background transition-transform active:scale-90',
              isSelected ? 'ring-2 ring-foreground/70' : 'hover:scale-110',
            )}
            style={{ backgroundColor: color.value }}
          >
            <HugeiconsIcon
              icon={Check}
              className={cn(
                'size-4 transition-opacity',
                isSelected ? 'opacity-100' : 'opacity-0',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
