'use client'

import { useParties } from '@/hooks/use-parties'
import { Plus, Search, User, ChevronRight, ArrowUpAz, ArrowDownAz } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'

export default function PartiesPage() {
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const businessId = activeBusiness?.id

  const currency = profile?.currency || '₹'

  const {
    filteredParties,
    isLoading,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    getBalance,
  } = useParties(businessId)

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-full pl-10 h-11 bg-canvas-parchment border-none" 
            placeholder="Search parties..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-11 w-11 shrink-0 bg-white"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <ArrowUpAz className="h-5 w-5" /> : <ArrowDownAz className="h-5 w-5" />}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredParties?.length === 0 ? (
          <div className="py-20 text-center bg-canvas-parchment/30 rounded-lg border border-dashed">
            <User className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground text-body">No parties found.</p>
            <Link href="/parties/create">
              <Button variant="link" className="text-primary font-semibold">Add your first party</Button>
            </Link>
          </div>
        ) : (
          filteredParties?.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`}>
              <div className="group flex items-center gap-4 rounded-lg border bg-card p-5 transition-all active:scale-[0.98] border-primary/5">
                <EntityAvatar 
                  name={party.name} 
                  color={party.color} 
                  icon={party.icon} 
                  size="lg" 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{party.name}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{party.contact}</p>
                </div>
                <div className="text-right pr-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Balance</p>
                  <p className="text-sm font-semibold text-primary">{currency}{getBalance(party.id).toLocaleString()}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>

      <Link href="/parties/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}

