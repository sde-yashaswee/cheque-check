'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChequeService } from '@/services/cheque.service'
import { ChequeCard } from '@/components/cheque-card'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { ChequeStatus } from '@/types'
import { useBusiness } from '@/hooks/use-business'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'

export default function ChequesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ChequeStatus | 'All'>('All')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const queryClient = useQueryClient()

  const { data: cheques, isLoading } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const filteredCheques = cheques?.filter((c: any) => {
    const matchesSearch = c.cheque_number.includes(search) || 
                         c.party?.name.toLowerCase().includes(search.toLowerCase()) ||
                         c.amount.toString().includes(search)
    const matchesFilter = filter === 'All' || c.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-pill pl-10 h-11 bg-canvas-parchment border-none" 
            placeholder="Search cheques..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={filter !== 'All' ? 'default' : 'outline'} className="rounded-full h-11 w-11 p-0" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 rounded-3xl" align="end">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-2">Filter Status</p>
              {['All', 'Issued', 'Received', 'Cleared', 'Bounced'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s as any)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold transition-all active:scale-95",
                    filter === s ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {s}
                  {filter === s ? (
                    <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                  ) : (
                    <StatusPill status={s as any} className="scale-75 origin-right opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        ) : filteredCheques?.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-body">No cheques found.</p>
          </div>
        ) : (
          filteredCheques?.map((cheque: any) => (
            <ChequeCard 
              key={cheque.id} 
              cheque={cheque} 
              onStatusUpdate={(id, status) => mutation.mutate({ id, status })}
            />
          ))
        )}
      </div>

      <Link href="/cheques/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}
