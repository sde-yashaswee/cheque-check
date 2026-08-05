'use client'

import { useState } from 'react'
import { FileText, Users, Building2, ChevronRight } from 'lucide-react'
import { useBusiness } from '@/hooks/use-business'
import { ChequeService } from '@/services/cheque.service'
import { PartyService } from '@/services/party.service'
import { AccountService } from '@/services/account.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const router = useRouter()

  const { data: cheques } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!),
    enabled: !!businessId && open,
  })

  const { data: parties } = useQuery({
    queryKey: ['parties', businessId],
    queryFn: () => PartyService.getAll(businessId!),
    enabled: !!businessId && open,
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts', businessId],
    queryFn: () => AccountService.getAll(businessId!),
    enabled: !!businessId && open,
  })

  const filteredCheques = query.length > 0 
    ? cheques?.filter((c: any) => 
        c.cheque_number.includes(query) || 
        c.party?.name.toLowerCase().includes(query.toLowerCase()) ||
        c.amount.toString().includes(query)
      ).slice(0, 5) 
    : []

  const filteredParties = query.length > 0
    ? parties?.filter((p: any) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.contact.includes(query)
      ).slice(0, 5)
    : []

  const filteredAccounts = query.length > 0
    ? accounts?.filter((a: any) => 
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
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">₹{c.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">{c.party?.name} • #{c.cheque_number}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-green-500/10 text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">{p.contact}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{a.bank?.name || 'Bank'}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-semibold uppercase tracking-wider">{a.account_name} • {a.account_number}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40" />
              </CommandItem>
            ))}
          </CommandGroup>

        )}
      </CommandList>
    </CommandDialog>
  )
}
