'use client'

import { useQuery } from '@tanstack/react-query'
import { PartyService } from '@/services/party.service'
import { ChequeService } from '@/services/cheque.service'
import { Plus, Search, User, ChevronRight, ArrowUpAz, ArrowDownAz } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'

export default function PartiesPage() {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const businessId = activeBusiness?.id

  const currency = profile?.currency || '₹'

  const { data: parties, isLoading: partiesLoading } = useQuery({
    queryKey: ['parties', businessId],
    queryFn: () => PartyService.getAll(businessId!),
    enabled: !!businessId,
  })

  const { data: cheques } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const getBalance = (partyId: string) => {
    if (!cheques) return 0
    return cheques
      .filter((c: any) => c.party_id === partyId && c.status !== 'Cleared' && c.status !== 'Bounced')
      .reduce((sum: number, c: any) => sum + c.amount, 0)
  }

  const filteredParties = parties?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.contact.includes(search)
  ).sort((a, b) => {
    if (sortOrder === 'asc') return a.name.localeCompare(b.name)
    return b.name.localeCompare(a.name)
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-pill pl-10 h-11 bg-canvas-parchment border-none shadow-sm" 
            placeholder="Search parties..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-11 w-11 shrink-0 bg-white shadow-sm border-none"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <ArrowUpAz className="h-5 w-5" /> : <ArrowDownAz className="h-5 w-5" />}
        </Button>
      </div>

      <div className="space-y-4">
        {partiesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-3xl" />
            ))}
          </div>
        ) : filteredParties?.length === 0 ? (
          <div className="py-20 text-center bg-canvas-parchment/30 rounded-3xl border border-dashed">
            <User className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground text-body">No parties found.</p>
            <Link href="/parties/create">
              <Button variant="link" className="text-primary font-bold">Add your first party</Button>
            </Link>
          </div>
        ) : (
          filteredParties?.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`}>
              <div className="group flex items-center gap-4 rounded-3xl border bg-card p-5 transition-all active:scale-98 hover:shadow-md">
                <EntityAvatar 
                  name={party.name} 
                  color={party.color} 
                  icon={party.icon} 
                  size="lg" 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{party.name}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{party.contact}</p>
                </div>
                <div className="text-right pr-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Balance</p>
                  <p className="text-sm font-black text-primary">{currency}{getBalance(party.id).toLocaleString()}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>

      <Link href="/parties/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}
