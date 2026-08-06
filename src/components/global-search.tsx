'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { File02Icon as FileText, UserGroupIcon as Users, Building03Icon as Building2, ArrowRight01Icon as ChevronRight } from '@hugeicons/core-free-icons';
import { useBusiness } from '@/hooks/use-business'
import { useCheques } from '@/hooks/use-cheques'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { useRouter } from 'next/navigation'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { EntityAvatar } from '@/components/ui/entity-avatar'

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const router = useRouter()

  const { cheques } = useCheques(open ? businessId : undefined)
  const { parties } = useParties(open ? businessId : undefined)
  const { accounts } = useAccounts(open ? businessId : undefined)

  const filteredCheques = query.length > 0 
    ? (cheques || []).filter((c: any) => 
        c.cheque_number.includes(query) || 
        c.party?.name.toLowerCase().includes(query.toLowerCase()) ||
        c.amount.toString().includes(query)
      ).slice(0, 5) 
    : []

  const filteredParties = query.length > 0
    ? (parties || []).filter((p: any) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.contact.includes(query)
      ).slice(0, 5)
    : []

  const filteredAccounts = query.length > 0
    ? (accounts || []).filter((a: any) => 
        (a.bank?.name || '').toLowerCase().includes(query.toLowerCase()) ||
        a.account_name.toLowerCase().includes(query.toLowerCase()) ||
        a.account_number.includes(query)
      ).slice(0, 5)
    : []

  const navigateTo = (path: string) => {
    router.push(path)
    onOpenChange(false)
  }

  const hasResults = filteredCheques.length > 0 || filteredParties.length > 0 || filteredAccounts.length > 0

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search everything..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        {query.length > 0 && !hasResults && (
          <CommandEmpty>No results found for &quot;{query}&quot;.</CommandEmpty>
        )}
        
        {filteredCheques && filteredCheques.length > 0 && (
          <CommandGroup heading="Cheques">
            {filteredCheques.map((c: any) => (
              <CommandItem 
                key={c.id} 
                onSelect={() => navigateTo(`/cheques`)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary shrink-0">
                  <HugeiconsIcon icon={FileText} className="h-5 w-5"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">₹{c.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">{c.party?.name} • #{c.cheque_number}</p>
                </div>
                <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 text-muted-foreground opacity-40 shrink-0"/>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredParties && filteredParties.length > 0 && (
          <CommandGroup heading="Parties">
            {filteredParties.map((p: any) => (
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">{p.contact}</p>
                </div>
                <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 text-muted-foreground opacity-40 shrink-0"/>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredAccounts && filteredAccounts.length > 0 && (
          <CommandGroup heading="Accounts">
            {filteredAccounts.map((a: any) => (
              <CommandItem 
                key={a.id} 
                onSelect={() => navigateTo(`/accounts/${a.id}`)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                <EntityAvatar 
                  name={a.bank?.name || 'A'} 
                  color={a.color} 
                  icon={a.icon} 
                  imageUrl={a.bank?.logo_url}
                  size="lg"
                  className="rounded-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{a.bank?.name || 'Bank'}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">{a.account_name} • {a.account_number}</p>
                </div>
                <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 text-muted-foreground opacity-40 shrink-0"/>
              </CommandItem>
            ))}
          </CommandGroup>

        )}
      </CommandList>
    </CommandDialog>
  )
}
