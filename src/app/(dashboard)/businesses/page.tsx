'use client'

import { useBusiness } from "@/hooks/use-business"
import { useQuery } from "@tanstack/react-query"
import { ChequeService } from "@/services/cheque.service"
import { Building2, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfile } from "@/hooks/use-profile"

export default function BusinessesPage() {
  const { businesses, isLoading: businessesLoading, activeBusiness, setActiveBusiness } = useBusiness()
  const { profile } = useProfile()
  const currency = profile?.currency || '₹'

  // Fetch cheques for all businesses to calculate upcoming totals
  const { data: allCheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['all-businesses-cheques'],
    queryFn: async () => {
      const results = await Promise.all(
        businesses.map(async (b) => {
          const cheques = await ChequeService.getAll(b.id)
          return { businessId: b.id, cheques }
        })
      )
      return results
    },
    enabled: businesses.length > 0
  })

  const getUpcomingTotal = (businessId: string) => {
    const businessData = allCheques?.find(d => d.businessId === businessId)
    if (!businessData) return 0
    const today = new Date().toISOString().split('T')[0]
    return businessData.cheques
      .filter(c => c.cheque_date >= today && c.status !== 'Cleared')
      .reduce((sum, c) => sum + c.amount, 0)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Management</p>
          <h2 className="text-display-sm font-bold">My Businesses</h2>
        </div>
        <Link href="/businesses/create">
          <Button size="icon" className="rounded-full shadow-lg">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {businessesLoading ? (
          [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)
        ) : businesses.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground">No businesses found.</p>
            <Link href="/businesses/create" className="mt-4 inline-block">
              <Button variant="outline" className="rounded-pill">Create your first business</Button>
            </Link>
          </div>
        ) : (
          businesses.map((business) => (
            <div 
              key={business.id}
              className={cn(
                "group relative flex flex-col gap-4 rounded-3xl border p-6 shadow-sm transition-all active:scale-[0.98]",
                activeBusiness?.id === business.id ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" : "bg-card hover:bg-muted/50"
              )}
              onClick={() => setActiveBusiness(business)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <EntityAvatar 
                    name={business.name} 
                    color={business.color} 
                    icon={business.icon} 
                    size="lg" 
                  />
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{business.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                      {activeBusiness?.id === business.id ? 'Active Session' : 'Tap to Switch'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-dashed pt-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upcoming Value</p>
                  <p className="text-xl font-black text-primary">
                    {chequesLoading ? '...' : `${currency}${getUpcomingTotal(business.id).toLocaleString()}`}
                  </p>
                </div>
                {activeBusiness?.id === business.id && (
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
