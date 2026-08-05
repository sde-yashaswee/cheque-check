'use client'

import { useQuery } from '@tanstack/react-query'
import { PartyService } from '@/services/party.service'
import { Plus, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'

export default function PartiesPage() {
  const [search, setSearch] = useState('')
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const businessId = activeBusiness?.id

  const currency = profile?.currency || '₹'

  const { data: parties, isLoading } = useQuery({
    queryKey: ['parties', businessId],
    queryFn: () => PartyService.getAll(businessId!),
    enabled: !!businessId,
  })

  const filteredParties = parties?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.contact.includes(search)
  )

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="rounded-pill pl-10 h-11 bg-canvas-parchment border-none" 
          placeholder="Search parties..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredParties?.length === 0 ? (

          <div className="py-20 text-center">
            <p className="text-muted-foreground text-body">No parties found.</p>
            <Link href="/parties/create">
              <Button variant="link" className="text-primary">Add your first party</Button>
            </Link>
          </div>
        ) : (
          filteredParties?.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`}>
              <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-transform active:scale-98">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-body">{party.name}</p>
                  <p className="text-sm text-muted-foreground">{party.contact}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Outstanding</p>
                  <p className="text-sm font-bold">{currency}0</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link href="/parties/create">
        <Button className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
