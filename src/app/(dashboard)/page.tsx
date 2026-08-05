'use client'

import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon as Plus, ArrowUpRight01Icon as ArrowUpRight, ArrowDownLeft01Icon as ArrowDownLeft, File02Icon as FileText, FlashIcon as Zap, Calendar03Icon as Calendar, Chart01Icon as Stats } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/hooks/use-business";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChequeService } from "@/services/cheque.service";
import { ChequeCard } from "@/components/cheque-card";
import Link from "next/link";
import { ChequeStatus, ChequeWithRelations } from "@/types";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useChequeStats } from "@/hooks/use-cheque-stats";
import { DataState } from "@/components/ui/data-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Building03Icon, Calendar01Icon, PieChartIcon } from "@hugeicons/core-free-icons";
import dynamic from 'next/dynamic'

const ChequeStatsChart = dynamic(() => import("@/components/cheque-stats-chart").then(mod => mod.ChequeStatsChart), {
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
  ssr: false
})

export default function HomePage() {
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  const { data: cheques, isLoading } = useQuery<ChequeWithRelations[]>({
    queryKey: ['cheques', activeBusiness?.id],
    queryFn: () => ChequeService.getAll(activeBusiness!.id) as Promise<ChequeWithRelations[]>,
    enabled: !!activeBusiness?.id,
  })

  const {
    todayCheques,
    outstanding,
    issuedCount,
    receivedCount,
    clearedCount,
    bouncedCount,
    upcomingCount,
    overdueCount
  } = useChequeStats(cheques)

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', activeBusiness?.id] })
    }
  })

  const currency = profile?.currency || '₹'

  const chartData = [
    { name: 'Issued', value: issuedCount, color: '#0066cc' },   // Action Blue
    { name: 'Received', value: receivedCount, color: '#2997ff' }, // Sky Blue
    { name: 'Cleared', value: clearedCount, color: '#34C759' },  // iOS Green
    { name: 'Bounced', value: bouncedCount, color: '#FF3B30' },  // iOS Red
  ].filter(d => d.value > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-2">
      <DataState
        isLoading={isLoading}
        data={activeBusiness ? [activeBusiness] : []}
        allData={activeBusiness ? [activeBusiness] : []}
        loadingComponent={
          <>
            <Skeleton className="h-40 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </>
        }
        emptyState={
          <EmptyState
            icon={Building03Icon}
            title="Welcome to Cheque Check"
            description="You need to create or select a business to start tracking cheques."
            action={{
              label: "Create Business",
              href: "/businesses/create"
            }}
          />
        }
      >
        <>
          {/* Outstanding Card */}
          <div className="rounded-lg bg-primary p-8 text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">Total Outstanding</p>
              <p className="mt-2 text-4xl font-semibold">{currency}{outstanding.toLocaleString()}</p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
              <HugeiconsIcon icon={FileText} size={200} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon icon={Zap} className="h-3 w-3 text-muted-foreground opacity-80" />
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="flex gap-4">
              <Link href="/cheques/create?type=Outward" className="flex-1">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-canvas-parchment p-4 transition-transform active:scale-95 border border-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <HugeiconsIcon icon={ArrowUpRight} className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Issue Cheque</span>
                </div>
              </Link>
              <Link href="/cheques/create?type=Inward" className="flex-1">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-canvas-parchment p-4 transition-transform active:scale-95 border border-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-green-500/10 text-green-600">
                    <HugeiconsIcon icon={ArrowDownLeft} className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-green-600">Receive Cheque</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Today's Cheques */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon icon={Calendar} className="h-3 w-3 text-muted-foreground opacity-80" />
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Cheques</h2>
            </div>
            {todayCheques.length === 0 ? (
              <EmptyState
                icon={Calendar01Icon}
                title="No cheques due today"
                description="Enjoy your day! You have no upcoming cheques for today."
                className="py-10 bg-canvas-parchment/30"
              />
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

          {/* Today/Upcoming/Overdue Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Today", count: todayCheques.length, color: 'bg-primary/5' },
              { label: "Upcoming", count: upcomingCount, color: 'bg-green-500/5' },
              { label: "Overdue", count: overdueCount, color: 'bg-red-500/5' },
            ].map((status) => (
              <div key={status.label} className={`group relative rounded-lg border ${status.color} p-4 transition-all active:scale-95 overflow-hidden`}>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{status.label}</p>
                <p className="mt-2 text-2xl font-semibold">{status.count}</p>
              </div>
            ))}
          </div>

          {/* Statistics Pie Chart */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon icon={Stats} className="h-3 w-3 text-muted-foreground opacity-80" />
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Statistics</h2>
            </div>
            <div className="rounded-lg border bg-card p-6 h-[300px] relative">
              <ChequeStatsChart chartData={chartData} totalCheques={cheques?.length || 0} />
            </div>

          </div>
        </>
      </DataState>

      <Link href="/cheques/create">
        <Button className="fixed bottom-24 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}


