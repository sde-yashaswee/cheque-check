'use client'

import { useBusinesses } from "@/hooks/use-businesses-page"
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon as User, Mail01Icon as Mail, LockPasswordIcon as Lock, CallIcon as Phone, Calendar03Icon as Calendar, HashtagIcon as Hash, Note01Icon as Note, Building03Icon as Building, Wallet01Icon as Wallet, Search01Icon as Search, Location01Icon as Location, TextFontIcon as TextIcon, Building03Icon as Building2, PlusSignIcon as Plus, ArrowRight01Icon as ArrowRight, File02Icon as FileText, Delete02Icon as Trash2, Sorting05Icon as Filter, Tick02Icon as Check, TextSquareIcon as NameIcon, Clock01Icon as UpcomingIcon, SortingAZ01Icon as AscIcon, SortingZA01Icon as DescIcon } from '@hugeicons/core-free-icons';
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
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const DeleteConfirmationDialog = dynamic(() => import("@/components/ui/delete-dialog").then(mod => mod.DeleteConfirmationDialog), {
  loading: () => <Skeleton className="h-8 w-8 rounded-full"/>,
  ssr: false
})

export default function BusinessesPage() {
  const t = useTranslations('Businesses')
  const tc = useTranslations('Common')
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
    sortBy,
    setSortBy,
    getUpcomingTotal,
    deleteBusiness,
  } = useBusinesses()

  const clearFilters = () => {
    setSearch('')
  }

  const sortOptions = [
    { label: t('sortByName'), value: 'name', icon: NameIcon },
    { label: t('sortByUpcoming'), value: 'upcoming', icon: UpcomingIcon },
  ]

  const orderOptions = [
    { label: tc('ascending'), value: 'asc', icon: AscIcon },
    { label: tc('descending'), value: 'desc', icon: DescIcon },
  ]

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input leftIcon={Search}  
            className="rounded-full  h-11 bg-canvas-parchment border-none"
            placeholder={t('searchPlaceholder')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Sheet>
          <SheetTrigger render={
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 shrink-0 bg-white"
            >
              <HugeiconsIcon icon={Filter} className="h-5 w-5"/>
            </Button>
          } />
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Filter} className="h-5 w-5 text-primary" />
                {tc('sortAndFilter')}
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc('sortBy')}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        sortBy === option.value 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-muted/30 border-transparent text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={option.icon} className="h-4 w-4"/>
                        <span className="font-bold text-sm">{option.label}</span>
                      </div>
                      {sortBy === option.value && <HugeiconsIcon icon={Check} className="h-4 w-4 stroke-[3]"/>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc('order')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {orderOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortOrder(option.value as any)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        sortOrder === option.value 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-muted/30 border-transparent text-foreground"
                      )}
                    >
                      <HugeiconsIcon icon={option.icon} className="h-4 w-4"/>
                      <span className="font-bold text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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
                <Skeleton className="h-32 w-full rounded-lg"key={i} />
              ))}
            </div>
          }
          emptyState={
            <EmptyState
              icon={Building2}
              title={t('noBusinessesTitle')}
              description={t('noBusinessesDesc')}
              action={{
                label: t('createFirstBusiness'),
                href:"/businesses/create"
              }}
            />
          }
        >
          {filteredBusinesses?.map((business) => (
            <div 
              key={business.id}
              onClick={() => setActiveBusiness(business)}
              className={cn(
                "group relative overflow-hidden rounded-lg border p-6 transition-all active:scale-95 cursor-pointer",
                activeBusiness?.id === business.id ?"bg-primary/5 border-primary/20":"bg-card border-primary/5"
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
                    <p className="text-[10px] text-muted-foreground font-semibold truncate max-w-[150px]">{business.email || tc('noEmail')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   {activeBusiness?.id === business.id && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-semibold text-white uppercase">{tc('active')}</span>
                   )}
                   <div onClick={(e) => e.stopPropagation()}>
                    <DeleteConfirmationDialog 
                      title={t('deleteConfirmTitle')}
                      description={t('deleteConfirmDesc')}
                      confirmName={business.name}
                      onDelete={async () => { deleteBusiness(business.id) }}
                      trigger={
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <HugeiconsIcon icon={Trash2} className="h-4 w-4"/>
                        </Button>
                      }
                    />
                   </div>
                   <Link href={`/businesses/${business.id}`} onClick={(e) => e.stopPropagation()}>
                    <HugeiconsIcon icon={ArrowRight} className="h-5 w-5 text-muted-foreground opacity-20 transition-opacity group-hover:opacity-100 hover:text-primary hover:opacity-100"/>
                   </Link>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-dashed pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon icon={FileText} className="h-3 w-3"/>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('upcoming')}</span>
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
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900"size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8"/>
        </Button>
      </Link>
    </div>
  )
}

