'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon as Search,
  Sorting05Icon as Filter,
  Tick02Icon as Check,
  Calendar03Icon as DateIcon,
  Money03Icon as AmountIcon,
  SortingAZ01Icon as AscIcon,
  SortingZA01Icon as DescIcon,
  CircleIcon as AllIcon,
  ArrowUpRight01Icon as IssuedIcon,
  ArrowDownLeft01Icon as ReceivedIcon,
  CheckmarkCircle01Icon as ClearedIcon,
  Cancel01Icon as BouncedIcon,
} from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { ChequeStatus } from '@/types'
import type { SortBy, SortOrder } from '../hooks/use-cheques'

export interface ChequeFilterBarProps {
  search: string
  setSearch: (value: string) => void
  filter: ChequeStatus | 'All'
  setFilter: (value: ChequeStatus | 'All') => void
  sortBy: SortBy
  setSortBy: (value: SortBy) => void
  sortOrder: SortOrder
  setSortOrder: (value: SortOrder) => void
}

export function ChequeFilterBar({
  search,
  setSearch,
  filter,
  setFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: ChequeFilterBarProps) {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')

  const statusOptions = [
    { label: tCommon('all'), value: 'All', icon: AllIcon },
    { label: tCommon('issued'), value: 'Issued', icon: IssuedIcon },
    { label: tCommon('received'), value: 'Received', icon: ReceivedIcon },
    { label: tCommon('cleared'), value: 'Cleared', icon: ClearedIcon },
    { label: tCommon('bounced'), value: 'Bounced', icon: BouncedIcon },
  ] as const

  const sortOptions = [
    { label: t('sortDate'), value: 'date', icon: DateIcon },
    { label: t('sortAmount'), value: 'amount', icon: AmountIcon },
  ] as const

  const orderOptions = [
    { label: tCommon('ascending'), value: 'asc', icon: AscIcon },
    { label: tCommon('descending'), value: 'desc', icon: DescIcon },
  ] as const

  const isDefault =
    filter === 'All' && sortBy === 'date' && sortOrder === 'desc'

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <HugeiconsIcon
          icon={Search}
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          leftIcon={Search}
          className="rounded-full h-11 bg-canvas-parchment border-none"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant={isDefault ? 'outline' : 'default'}
              size="icon"
              className={cn(
                'rounded-full h-11 w-11 shrink-0',
                isDefault && 'bg-white',
              )}
            >
              <HugeiconsIcon icon={Filter} className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent className="max-h-[85dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Filter} className="h-5 w-5 text-primary" />
              {tCommon('sortAndFilter')}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {tCommon('sortBy')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]',
                      sortBy === option.value
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-muted/30 border-transparent text-foreground',
                    )}
                  >
                    <HugeiconsIcon icon={option.icon} className="h-4 w-4" />
                    <span className="font-bold text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {tCommon('order')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {orderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortOrder(option.value)}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]',
                      sortOrder === option.value
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-muted/30 border-transparent text-foreground',
                    )}
                  >
                    <HugeiconsIcon icon={option.icon} className="h-4 w-4" />
                    <span className="font-bold text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('filterStatus')}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFilter(s.value as ChequeStatus | 'All')}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]',
                      filter === s.value
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-muted/30 border-transparent text-foreground',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon icon={s.icon} className="h-4 w-4" />
                      <span className="font-bold text-sm">
                        {tCommon(s.value.toLowerCase() as never)}
                      </span>
                    </div>
                    {filter === s.value && (
                      <HugeiconsIcon
                        icon={Check}
                        className="h-4 w-4 stroke-[3]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
