'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  File02Icon as FileText,
  Building03Icon as Building2,
  ArrowRight01Icon as ChevronRight,
} from '@hugeicons/core-free-icons'
import { useBusiness } from '@/hooks/use-business'
import { useCheques } from '@/hooks/use-cheques'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { TextTruncate } from '@/components/ui/text-truncate'
import { ChequeWithRelations, Party, AccountWithRelations } from '@/types'
import { useTranslations } from 'next-intl'

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState('')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const router = useRouter()
  const t = useTranslations('Common')

  const { cheques } = useCheques(open ? businessId : undefined)
  const { parties } = useParties(open ? businessId : undefined)
  const { accounts } = useAccounts(open ? businessId : undefined)

  const filteredCheques =
    query.length > 0
      ? (cheques || [])
          .filter(
            (c: ChequeWithRelations) =>
              c.cheque_number.includes(query) ||
              c.party?.name.toLowerCase().includes(query.toLowerCase()) ||
              c.amount.toString().includes(query),
          )
          .slice(0, 5)
      : []

  const filteredParties =
    query.length > 0
      ? (parties || [])
          .filter(
            (p: Party) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              (p.contact || '').includes(query),
          )
          .slice(0, 5)
      : []

  const filteredAccounts =
    query.length > 0
      ? (accounts || [])
          .filter(
            (a: AccountWithRelations) =>
              (a.bank?.name || '')
                .toLowerCase()
                .includes(query.toLowerCase()) ||
              a.account_name.toLowerCase().includes(query.toLowerCase()) ||
              a.account_number.includes(query),
          )
          .slice(0, 5)
      : []

  const navigateTo = (path: string) => {
    router.push(path)
    onOpenChange(false)
  }

  const hasResults =
    filteredCheques.length > 0 ||
    filteredParties.length > 0 ||
    filteredAccounts.length > 0

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t('searchEverything')}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        {query.length > 0 && !hasResults && (
          <CommandEmpty>{t('noResultsFor', { query })}</CommandEmpty>
        )}

        {filteredCheques && filteredCheques.length > 0 && (
          <CommandGroup heading={t('cheques')}>
            {filteredCheques.map((c: ChequeWithRelations) => (
              <CommandItem
                key={c.id}
                onSelect={() => navigateTo(`/cheques`)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary shrink-0">
                  <HugeiconsIcon icon={FileText} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    ₹{c.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">
                    {c.party?.name} • #{c.cheque_number}
                  </p>
                </div>
                <HugeiconsIcon
                  icon={ChevronRight}
                  className="h-4 w-4 text-muted-foreground opacity-40 shrink-0"
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredParties && filteredParties.length > 0 && (
          <CommandGroup heading={t('parties')}>
            {filteredParties.map((p: Party) => (
              <CommandItem
                key={p.id}
                onSelect={() => navigateTo(`/parties/${p.id}`)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <EntityAvatar
                  name={p.name}
                  color={p.color}
                  icon={p.icon}
                  imageUrl={p.avatar_url}
                  size="lg"
                  className="rounded-sm shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col">
                  <TextTruncate
                    text={p.name}
                    maxLength={25}
                    className="text-sm font-semibold block"
                  />
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">
                    {p.contact}
                  </p>
                </div>
                <HugeiconsIcon
                  icon={ChevronRight}
                  className="h-4 w-4 text-muted-foreground opacity-40 shrink-0"
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredAccounts && filteredAccounts.length > 0 && (
          <CommandGroup heading={t('accounts')}>
            {filteredAccounts.map((a: AccountWithRelations) => (
              <CommandItem
                key={a.id}
                onSelect={() => navigateTo(`/accounts/${a.id}`)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <EntityAvatar
                  name={a.bank?.name || t('bank')}
                  color={a.color}
                  icon={a.icon}
                  imageUrl={a.bank?.logo_url}
                  size="lg"
                  className="rounded-sm shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col">
                  <TextTruncate
                    text={a.bank?.name || t('bank')}
                    maxLength={25}
                    className="text-sm font-semibold block"
                  />
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">
                    <TextTruncate text={a.account_name} maxLength={15} /> •{' '}
                    {a.account_number}
                  </p>
                </div>
                <HugeiconsIcon
                  icon={ChevronRight}
                  className="h-4 w-4 text-muted-foreground opacity-40 shrink-0"
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
