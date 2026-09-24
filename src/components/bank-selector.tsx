'use client'

import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Tick02Icon as Check,
  ArrowUpDownIcon as ChevronsUpDown,
  BankIcon as Landmark,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { useBanks } from '@/hooks/use-banks'
import { useTranslations } from 'next-intl'

interface BankSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  className?: string
}

export function BankSelector({
  value,
  onValueChange,
  className,
}: BankSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations('Common')

  const { data: banks } = useBanks()

  const selectedBank = banks?.find((bank) => bank.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <div
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full justify-between h-14 rounded-2xl bg-canvas-parchment border-none px-4 text-lg font-medium cursor-pointer',
              className?.includes('rounded-sm') && 'rounded-sm',
              className,
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedBank ? (
                <EntityAvatar
                  name={selectedBank.name}
                  imageUrl={selectedBank.logo_url}
                  size="sm"
                />
              ) : (
                <HugeiconsIcon
                  icon={Landmark}
                  className="h-5 w-5 text-muted-foreground"
                />
              )}
              <span className="truncate">
                {selectedBank ? selectedBank.name : t('selectBank')}
              </span>
            </div>
            <HugeiconsIcon
              icon={ChevronsUpDown}
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
            />
          </div>
        }
      />
      <PopoverContent
        className="w-full p-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
        align="start"
      >
        <Command className="rounded-none">
          <CommandInput placeholder={t('searchBank')} className="h-12" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm">
              <p className="text-muted-foreground">{t('noBankFound')}</p>
            </CommandEmpty>
            <CommandGroup>
              {banks?.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={bank.name}
                  onSelect={() => {
                    onValueChange(bank.id)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-3 px-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <EntityAvatar
                      name={bank.name}
                      imageUrl={bank.logo_url}
                      size="sm"
                    />
                    <span className="font-bold">{bank.name}</span>
                  </div>
                  <HugeiconsIcon
                    icon={Check}
                    className={cn(
                      'h-4 w-4 text-primary',
                      value === bank.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
