'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import { Calendar03Icon as CalendarIcon } from '@hugeicons/core-free-icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  DATE_RANGE_PRESETS,
  type DateRangePreset,
} from '@/features/cheques/lib/date-range'

interface StatsDateFilterProps {
  preset: DateRangePreset
  onPresetChange: (preset: DateRangePreset) => void
  customRange: DateRange | undefined
  onCustomRangeChange: (range: DateRange | undefined) => void
}

export function StatsDateFilter({
  preset,
  onPresetChange,
  customRange,
  onCustomRangeChange,
}: StatsDateFilterProps) {
  const t = useTranslations('Dashboard')
  const [calendarOpen, setCalendarOpen] = useState(false)

  const items = DATE_RANGE_PRESETS.map((value) => ({
    value,
    label: t(`dateRange.${value}`),
  }))

  const customLabel = customRange?.from
    ? customRange.to && customRange.to !== customRange.from
      ? `${format(customRange.from, 'd MMM')} – ${format(customRange.to, 'd MMM yy')}`
      : format(customRange.from, 'd MMM yy')
    : t('dateRange.pickDates')

  return (
    <div className="flex items-center gap-2">
      {preset === 'custom' && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger className="flex h-7 items-center gap-1.5 rounded-lg border border-input px-2 text-xs font-medium">
            <HugeiconsIcon icon={CalendarIcon} className="h-3.5 w-3.5" />
            {customLabel}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="range"
              selected={customRange}
              onSelect={onCustomRangeChange}
              weekStartsOn={1}
              defaultMonth={customRange?.from}
            />
          </PopoverContent>
        </Popover>
      )}
      <Select
        items={items}
        value={preset}
        onValueChange={(value) => {
          const next = value as DateRangePreset
          onPresetChange(next)
          if (next === 'custom') setCalendarOpen(true)
        }}
      >
        <SelectTrigger size="sm" aria-label={t('dateRange.label')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
