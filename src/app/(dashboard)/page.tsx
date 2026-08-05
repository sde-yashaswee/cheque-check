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
      
      <div>
        <p className="text-sm text-muted-foreground font-medium">Hello, {profile?.name || 'User'}</p>
        <h1 className="text-display-lg">Dashboard</h1>
      </div>

      {!activeBusiness ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Create a business to get started.</p>
          <Link href="/businesses/create" className="mt-4 block">
            <Button className="rounded-pill">Create Business</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Outstanding Card */}
          <div className="rounded-lg bg-primary p-6 text-primary-foreground shadow-product">
            <p className="text-sm font-medium opacity-80">Outstanding</p>
            <p className="mt-1 text-display-lg">{currency}{outstanding.toLocaleString()}</p>
            <div className="mt-6 flex gap-8 border-t border-white/20 pt-4">
              <div>
                <p className="text-xs opacity-80 uppercase tracking-wider">Issued</p>
                <p className="text-lg font-semibold">{currency}{(issued / 100000).toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-xs opacity-80 uppercase tracking-wider">Received</p>
                <p className="text-lg font-semibold">{currency}{(received / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lead font-semibold">Quick Actions</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              <Link href="/banks" className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas-parchment text-primary shadow-sm">
                  <Landmark className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-medium">Banks</span>
              </Link>
              <Link href="/parties" className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas-parchment text-primary shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-medium">Parties</span>
              </Link>
              <Link href="/businesses/create" className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas-parchment text-primary shadow-sm">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-medium">Businesses</span>
              </Link>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Today", count: todayCheques.length, amount: `${currency}${(todayCheques.reduce((a, c) => a + c.amount, 0) / 100000).toFixed(1)}L` },
              { label: "Upcoming", count: upcomingCount, amount: "-" },
              { label: "Overdue", count: overdueCount, amount: "-" },
              { label: "Cleared", count: cheques?.filter((c) => c.status === 'Cleared').length || 0, amount: "-" },
              { label: "Bounced", count: cheques?.filter((c) => c.status === 'Bounced').length || 0, amount: "-" },
              { label: "Received", count: cheques?.filter((c) => c.type === 'Inward').length || 0, amount: "-" },
            ].map((status) => (
              <div key={status.label} className="rounded-lg border bg-card p-4 transition-transform active:scale-95">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{status.label}</p>
                <p className="mt-2 text-xl font-bold">{status.count}</p>
                <p className="text-sm text-muted-foreground">{status.amount !== '-' ? status.amount : ''}</p>
              </div>
            ))}
          </div>

          {/* Today's Cheques */}
          <div className="space-y-4">
            <h2 className="text-lead font-semibold">Today&apos;s Cheques</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-24 w-full animate-pulse rounded-lg bg-canvas-parchment" />)}
              </div>
            ) : todayCheques.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">No cheques due today.</p>
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
        <Button className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg z-40" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
