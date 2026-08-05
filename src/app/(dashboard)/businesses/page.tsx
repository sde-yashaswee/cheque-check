'use client'

import { useBusinesses } from "@/hooks/use-businesses-page"
import { HugeiconsIcon } from '@hugeicons/react';
import { Building03Icon as Building2, PlusSignIcon as Plus, ArrowRight01Icon as ArrowRight, File02Icon as FileText, Delete02Icon as Trash2, Search01Icon as Search, TextSquareIcon as ArrowUpAz, SortingZA01Icon as ArrowDownAz } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfile } from "@/hooks/use-profile"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'
import { DataState } from "@/components/ui/data-state"
import { EmptyState } from "@/components/ui/empty-state"

const DeleteConfirmationDialog = dynamic(() => import("@/components/ui/delete-dialog").then(mod => mod.DeleteConfirmationDialog), {
  loading: () => <Skeleton className="h-8 w-8 rounded-full" />,
  ssr: false
})

export default function BusinessesPage() {
  const { profile } = useProfile()
  const currency = profile?.currency || '₹'

  const {
    businesses,
    filteredBusinesses,
    isLoading,
    activeBusiness,
    setActiveBusiness,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    getUpcomingTotal,
    deleteBusiness,
  } = useBusinesses()

  const clearFilters = () => {
    setSearch('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-full pl-10 h-11 bg-canvas-parchment border-none" 
            placeholder="Search businesses..." 
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
          {sortOrder === 'asc' ? <HugeiconsIcon icon={ArrowUpAz} className="h-5 w-5" /> : <HugeiconsIcon icon={ArrowDownAz} className="h-5 w-5" />}
        </Button>
      </div>

      <div className="space-y-4">
        <DataState
          isLoading={isLoading}
          data={filteredBusinesses}
          allData={businesses}
          onClearFilters={clearFilters}
          loadingComponent={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          }
          emptyState={
            <EmptyState
              icon={Building2}
              title="No businesses found"
              description="Create a business profile to start managing your accounts, parties, and cheques."
              action={{
                label: "Create your first business",
                href: "/businesses/create"
              }}
            />
          }
        >
          {filteredBusinesses?.map((business) => (
            <div 
              key={business.id}
              onClick={() => setActiveBusiness(business)}
              className={cn(
                "group relative overflow-hidden rounded-lg border p-6 transition-all active:scale-[0.98] cursor-pointer",
                activeBusiness?.id === business.id ? "bg-primary/5 border-primary/20" : "bg-card border-primary/5"
              )}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <EntityAvatar 
                    name={business.name} 
                    color={business.color} 
                    icon={business.icon} 
                    imageUrl={business.logo_url}
                    size="lg" 
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold truncate max-w-[150px]">{business.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   {activeBusiness?.id === business.id && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-semibold text-white uppercase">Active</span>
                   )}
                   <div onClick={(e) => e.stopPropagation()}>
                    <DeleteConfirmationDialog 
                      title="Delete Business?"
                      description="This will permanently delete this business and all associated data."
                      confirmName={business.name}
                      onDelete={async () => { deleteBusiness(business.id) }}
                      trigger={
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
                        </Button>
                      }
                    />
                   </div>
                   <Link href={`/businesses/${business.id}`} onClick={(e) => e.stopPropagation()}>
                    <HugeiconsIcon icon={ArrowRight} className="h-5 w-5 text-muted-foreground opacity-20 transition-opacity group-hover:opacity-100 hover:text-primary hover:opacity-100" />
                   </Link>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-dashed pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon icon={FileText} className="h-3 w-3" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</span>
                </div>
                <p className="font-semibold text-primary">
                  {currency}{getUpcomingTotal(business.id).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </DataState>
      </div>

      <Link href="/businesses/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}

