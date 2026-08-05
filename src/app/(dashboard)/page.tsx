'use client'

import { Plus, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessSwitcher } from "@/components/business-switcher";
import { useBusiness } from "@/hooks/use-business";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChequeService } from "@/services/cheque.service";
import { ChequeCard } from "@/components/cheque-card";
import Link from "next/link";
import { ChequeStatus, ChequeWithRelations } from "@/types";
import { useState } from "react";
import { GlobalSearch } from "@/components/global-search";
import { useProfile } from "@/hooks/use-profile";
import { Landmark, Building2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";

export default function HomePage() {
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const [searchOpen, setSearchOpen] = useState(false)

  const { data: cheques, isLoading } = useQuery<ChequeWithRelations[]>({
    queryKey: ['cheques', activeBusiness?.id],
    queryFn: () => ChequeService.getAll(activeBusiness!.id) as Promise<ChequeWithRelations[]>,
    enabled: !!activeBusiness?.id,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', activeBusiness?.id] })
    }
  })

  // Derived stats
  const todayDate = new Date().toISOString().split('T')[0]
  const todayCheques = cheques?.filter((c) => c.cheque_date === todayDate) || []
  const outstanding = cheques?.reduce((acc: number, curr) => {
    if (curr.status === 'Cleared') return acc
    return curr.type === 'Outward' ? acc + curr.amount : acc - curr.amount
  }, 0) || 0

  const issued = cheques?.filter((c) => c.type === 'Outward').reduce((acc, curr) => acc + curr.amount, 0) || 0
  const received = cheques?.filter((c) => c.type === 'Inward').reduce((acc, curr) => acc + curr.amount, 0) || 0

  const upcomingCount = cheques?.filter((c) => c.cheque_date > todayDate && c.status !== 'Cleared').length || 0
  const overdueCount = cheques?.filter((c) => c.cheque_date < todayDate && c.status !== 'Cleared').length || 0

  const currency = profile?.currency || '₹'

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <BusinessSwitcher />
        <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="rounded-full">
          <SearchIcon className="h-5 w-5" />
        </Button>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      
      {!activeBusiness && !isLoading ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Create a business to get started.</p>
          <Link href="/businesses/create" className="mt-4 block">
            <Button className="rounded-pill">Create Business</Button>
          </Link>
        </div>
      ) : isLoading ? (
        <>
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-3xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
          </div>
        </>
      ) : (
        <>
          {/* Outstanding Card */}
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-product relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-black opacity-70 uppercase tracking-widest">Total Outstanding</p>
              <p className="mt-2 text-4xl font-black">{currency}{outstanding.toLocaleString()}</p>
              <div className="mt-8 flex gap-8 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Issued</p>
                  <p className="text-xl font-bold">{currency}{(issued / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Received</p>
                  <p className="text-xl font-bold">{currency}{(received / 100000).toFixed(1)}L</p>
                </div>
              </div>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-black/5 blur-3xl" />
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Quick Actions</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              <Link href="/banks" className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-canvas-parchment text-primary shadow-sm ring-1 ring-primary/5 transition-transform active:scale-90">
                  <Landmark className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Banks</span>
              </Link>
              <Link href="/parties" className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-canvas-parchment text-primary shadow-sm ring-1 ring-primary/5 transition-transform active:scale-90">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Parties</span>
              </Link>
              <Link href="/businesses" className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-canvas-parchment text-primary shadow-sm ring-1 ring-primary/5 transition-transform active:scale-90">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Business</span>
              </Link>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Today", count: todayCheques.length, amount: `${currency}${(todayCheques.reduce((a, c) => a + c.amount, 0) / 100000).toFixed(1)}L`, status: 'Today' },
              { label: "Upcoming", count: upcomingCount, amount: "-", status: 'Upcoming' },
              { label: "Overdue", count: overdueCount, amount: "-", status: 'Overdue' },
              { label: "Cleared", count: cheques?.filter((c) => c.status === 'Cleared').length || 0, amount: "-", status: 'Cleared' },
              { label: "Bounced", count: cheques?.filter((c) => c.status === 'Bounced').length || 0, amount: "-", status: 'Bounced' },
              { label: "Received", count: cheques?.filter((c) => c.type === 'Inward').length || 0, amount: "-", status: 'Received' },
            ].map((status) => (
              <div key={status.label} className="group relative rounded-3xl border bg-card p-5 transition-all active:scale-95 hover:shadow-md overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{status.label}</p>
                  <StatusPill status={status.status as any} className="scale-75 origin-right" />
                </div>
                <p className="mt-4 text-3xl font-black">{status.count}</p>
                <p className="text-xs font-bold text-muted-foreground mt-1">{status.amount !== '-' ? status.amount : ''}</p>
              </div>
            ))}
          </div>

          {/* Today's Cheques */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Today&apos;s Cheques</h2>
            {todayCheques.length === 0 ? (
              <div className="rounded-3xl border border-dashed p-10 text-center bg-canvas-parchment/30">
                <p className="text-sm text-muted-foreground font-medium">Enjoy your day! No cheques due.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayCheques.map((cheque) => (
                  <ChequeCard 
                    key={cheque.id} 
                    cheque={cheque} 
                    onStatusUpdate={(id, status) => mutation.mutate({ id, status })}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Link href="/cheques/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}
