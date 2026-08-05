'use client'

import { useState, useEffect } from 'react'
import { Search as SearchIcon, X, FileText, Users, Building2, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useBusiness } from '@/hooks/use-business'
import { ChequeService } from '@/services/cheque.service'
import { PartyService } from '@/services/party.service'
import { BankService } from '@/services/bank.service'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

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

  const { data: banks } = useQuery({
    queryKey: ['banks', businessId],
    queryFn: () => BankService.getAll(businessId!),
    enabled: !!businessId && open,
  })

  const results = {
    cheques: cheques?.filter((c: any) => 
      c.cheque_number.includes(query) || 
      c.party?.name.toLowerCase().includes(query.toLowerCase()) ||
      c.amount.toString().includes(query)
    ).slice(0, 3) || [],
    parties: parties?.filter((p: any) => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.contact.includes(query)
    ).slice(0, 3) || [],
    banks: banks?.filter((b: any) => 
      b.bank_name.toLowerCase().includes(query.toLowerCase()) ||
      b.account_number.includes(query)
    ).slice(0, 3) || []
  }

  const hasResults = query.length > 0 && (results.cheques.length > 0 || results.parties.length > 0 || results.banks.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[600px] gap-0 border-none shadow-2xl rounded-3xl overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <div className="flex items-center border-b px-4 py-4 bg-white dark:bg-zinc-900">
          <SearchIcon className="h-5 w-5 text-primary" />
          <Input
            autoFocus
            className="border-none bg-transparent text-lg focus-visible:ring-0 font-bold placeholder:text-muted-foreground/50"
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full hover:bg-canvas-parchment">
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="py-12 text-center">
              <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <p className="mt-4 text-muted-foreground">Type to search across your business...</p>
            </div>
          )}

          {query && !hasResults && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {hasResults && (
            <>
              {/* Cheques Section */}
              {results.cheques.length > 0 && (
                <div className="space-y-2">
                  <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cheques</h3>
                  <div className="space-y-1">
                    {results.cheques.map((c: any) => (
                      <Link key={c.id} href="/cheques" onClick={() => onOpenChange(false)} className="flex items-center gap-3 rounded-lg p-2 hover:bg-canvas-parchment dark:hover:bg-surface-tile-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">₹{c.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.party?.name} • #{c.cheque_number}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Parties Section */}
              {results.parties.length > 0 && (
                <div className="space-y-2">
                  <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parties</h3>
                  <div className="space-y-1">
                    {results.parties.map((p: any) => (
                      <Link key={p.id} href="/parties" onClick={() => onOpenChange(false)} className="flex items-center gap-3 rounded-lg p-2 hover:bg-canvas-parchment dark:hover:bg-surface-tile-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.contact}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Banks Section */}
              {results.banks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banks</h3>
                  <div className="space-y-1">
                    {results.banks.map((b: any) => (
                      <Link key={b.id} href="/banks" onClick={() => onOpenChange(false)} className="flex items-center gap-3 rounded-lg p-2 hover:bg-canvas-parchment dark:hover:bg-surface-tile-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-parchment text-foreground">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{b.bank_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{b.account_number}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
