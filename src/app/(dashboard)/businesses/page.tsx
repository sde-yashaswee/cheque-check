'use client'

import { useBusiness } from "@/hooks/use-business"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChequeService } from "@/services/cheque.service"
import { BusinessService } from "@/services/business.service"
import { Building2, Plus, ArrowRight, FileText, Trash2, Search, ArrowUpAz, ArrowDownAz } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfile } from "@/hooks/use-profile"
import { cn } from "@/lib/utils"
import { DeleteConfirmationDialog } from "@/components/ui/delete-dialog"
import { useState } from "react"

export default function BusinessesPage() {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { businesses, isLoading: businessesLoading, activeBusiness, setActiveBusiness } = useBusiness()
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const currency = profile?.currency || '₹'

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BusinessService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
    }
  })

  // Fetch cheques for all businesses to calculate upcoming totals
  const { data: allCheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['all-businesses-cheques'],
    queryFn: async () => {
      const results = await Promise.all(
        businesses.map(b => ChequeService.getAll(b.id))
      )
      return results.flat()
    },
    enabled: businesses.length > 0
  })

  const filteredBusinesses = businesses?.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortOrder === 'asc') return a.name.localeCompare(b.name)
    return b.name.localeCompare(a.name)
  })

  const getUpcomingTotal = (businessId: string) => {
    if (!allCheques) return 0
    const today = new Date().toISOString().split('T')[0]
    return allCheques
      .filter(c => c.business_id === businessId && c.status !== 'Cleared' && c.status !== 'Bounced' && c.cheque_date >= today)
      .reduce((sum, c) => sum + c.amount, 0)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-pill pl-10 h-11 bg-canvas-parchment border-none shadow-sm" 
            placeholder="Search businesses..." 
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
        {businessesLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))
        ) : filteredBusinesses?.length === 0 ? (
          <div className="py-20 text-center bg-canvas-parchment/30 rounded-3xl border border-dashed">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground">No businesses found.</p>
            <Link href="/businesses/create" className="mt-4 inline-block">
              <Button variant="outline" className="rounded-pill">Create your first business</Button>
            </Link>
          </div>
        ) : (
          filteredBusinesses?.map((business) => (
            <div 
              key={business.id}
              onClick={() => setActiveBusiness(business)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border p-6 transition-all active:scale-98 cursor-pointer hover:shadow-md",
                activeBusiness?.id === business.id ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" : "bg-card"
              )}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <EntityAvatar 
                    name={business.name} 
                    color={business.color} 
                    icon={business.icon} 
                    size="lg" 
                  />
                  <div>
                    <h3 className="text-lg font-bold">{business.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">{business.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   {activeBusiness?.id === business.id && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold text-white uppercase">Active</span>
                   )}
                   <div onClick={(e) => e.stopPropagation()}>
                    <DeleteConfirmationDialog 
                      title="Delete Business?"
                      description="This will permanently delete this business and all associated data. This action is irreversible."
                      confirmName={business.name}
                      onDelete={async () => { deleteMutation.mutate(business.id) }}
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                   </div>
                   <ArrowRight className="h-5 w-5 text-muted-foreground opacity-20 transition-opacity group-hover:opacity-100" />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-dashed pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Upcoming</span>
                </div>
                <p className="font-black text-primary">
                  {currency}{getUpcomingTotal(business.id).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <Link href="/businesses/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}
