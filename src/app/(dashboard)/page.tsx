'use client'

import { Plus, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/hooks/use-business";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChequeService } from "@/services/cheque.service";
import { ChequeCard } from "@/components/cheque-card";
import Link from "next/link";
import { ChequeStatus, ChequeWithRelations } from "@/types";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function HomePage() {
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const queryClient = useQueryClient()

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

  const issuedCount = cheques?.filter((c) => c.type === 'Outward').length || 0
  const receivedCount = cheques?.filter((c) => c.type === 'Inward').length || 0
  const clearedCount = cheques?.filter((c) => c.status === 'Cleared').length || 0
  const bouncedCount = cheques?.filter((c) => c.status === 'Bounced').length || 0

  const upcomingCount = cheques?.filter((c) => c.cheque_date > todayDate && c.status !== 'Cleared').length || 0
  const overdueCount = cheques?.filter((c) => c.cheque_date < todayDate && c.status !== 'Cleared').length || 0

  const currency = profile?.currency || '₹'

  const chartData = [
    { name: 'Issued', value: issuedCount, color: '#EAB308' },   // Yellow
    { name: 'Received', value: receivedCount, color: '#2563EB' }, // Blue
    { name: 'Cleared', value: clearedCount, color: '#22C55E' },  // Green
    { name: 'Bounced', value: bouncedCount, color: '#EF4444' },  // Red
  ].filter(d => d.value > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-2">
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
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-3xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full rounded-3xl" />
          </div>
        </>
      ) : (
        <>
          {/* Outstanding Card */}
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Total Outstanding</p>
              <p className="mt-2 text-4xl font-black">{currency}{outstanding.toLocaleString()}</p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
              <FileText size={200} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Quick Actions</h2>
            <div className="flex gap-4">
              <Link href="/cheques/create?type=Outward" className="flex-1">
                <div className="flex flex-col items-center gap-2 rounded-3xl bg-canvas-parchment p-4 transition-transform active:scale-95 shadow-sm border border-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Issue Cheque</span>
                </div>
              </Link>
              <Link href="/cheques/create?type=Inward" className="flex-1">
                <div className="flex flex-col items-center gap-2 rounded-3xl bg-canvas-parchment p-4 transition-transform active:scale-95 shadow-sm border border-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
                    <ArrowDownLeft className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Receive Cheque</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Today's Cheques */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Today&apos;s Cheques</h2>
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

          {/* Today/Upcoming/Overdue Cards - MOVED ABOVE PIE CHART */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Today", count: todayCheques.length, color: 'bg-primary/5' },
              { label: "Upcoming", count: upcomingCount, color: 'bg-green-500/5' },
              { label: "Overdue", count: overdueCount, color: 'bg-red-500/5' },
            ].map((status) => (
              <div key={status.label} className={`group relative rounded-2xl border ${status.color} p-4 transition-all active:scale-95 overflow-hidden`}>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{status.label}</p>
                <p className="mt-2 text-2xl font-black">{status.count}</p>
              </div>
            ))}
          </div>

          {/* Statistics Pie Chart */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Statistics</h2>
            <div className="rounded-3xl border bg-card p-6 h-[300px] relative">
              {chartData.length > 0 ? (
                <div className="relative h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* TOTAL TEXT IN THE CENTER */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-black leading-none">{cheques?.length || 0}</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                   <p className="text-sm text-muted-foreground italic">No data to display</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Link href="/cheques/create">
        <Button className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}
