'use client'

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessSwitcher } from "@/components/business-switcher";
import { useBusiness } from "@/hooks/use-business";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChequeService } from "@/services/cheque.service";
import { ChequeCard } from "@/components/cheque-card";
import Link from "next/link";
import { ChequeStatus } from "@/types";

export default function HomePage() {
  const { activeBusiness } = useBusiness()
  const queryClient = useQueryClient()

  const { data: cheques, isLoading } = useQuery({
    queryKey: ['cheques', activeBusiness?.id],
    queryFn: () => ChequeService.getAll(activeBusiness!.id),
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
  const today = new Date().toISOString().split('T')[0]
  const todayCheques = cheques?.filter((c: any) => c.cheque_date === today) || []
  const outstanding = cheques?.reduce((acc: number, curr: any) => {
    if (curr.status === 'Cleared') return acc
    return curr.type === 'Outward' ? acc + curr.amount : acc - curr.amount
  }, 0) || 0

  const issued = cheques?.filter((c: any) => c.type === 'Outward').reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0
  const received = cheques?.filter((c: any) => c.type === 'Inward').reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0

  const upcomingCount = cheques?.filter((c: any) => c.cheque_date > today && c.status !== 'Cleared').length || 0
  const overdueCount = cheques?.filter((c: any) => c.cheque_date < today && c.status !== 'Cleared').length || 0

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <BusinessSwitcher />

      <h1 className="text-display-lg">Home</h1>

      {!activeBusiness ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Create a business to get started.</p>
          <Link href="/businesses/create" className="mt-4 block">
            <Button>Create Business</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Outstanding Card */}
          <div className="rounded-lg bg-primary p-6 text-primary-foreground shadow-product">
            <p className="text-sm font-medium opacity-80">Outstanding</p>
            <p className="mt-1 text-display-lg">₹{outstanding.toLocaleString()}</p>
            <div className="mt-6 flex gap-8 border-t border-white/20 pt-4">
              <div>
                <p className="text-xs opacity-80 uppercase tracking-wider">Issued</p>
                <p className="text-lg font-semibold">₹{(issued / 100000).toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-xs opacity-80 uppercase tracking-wider">Received</p>
                <p className="text-lg font-semibold">₹{(received / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Today", count: todayCheques.length, amount: `₹${(todayCheques.reduce((a: number, c: any) => a + c.amount, 0) / 100000).toFixed(1)}L` },
              { label: "Upcoming", count: upcomingCount, amount: "-" },
              { label: "Overdue", count: overdueCount, amount: "-" },
              { label: "Cleared", count: cheques?.filter((c: any) => c.status === 'Cleared').length || 0, amount: "-" },
              { label: "Bounced", count: cheques?.filter((c: any) => c.status === 'Bounced').length || 0, amount: "-" },
              { label: "Received", count: cheques?.filter((c: any) => c.type === 'Inward').length || 0, amount: "-" },
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
            {todayCheques.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cheques due today.</p>
            ) : (
              <div className="space-y-4">
                {todayCheques.map((cheque: any) => (
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
        <Button className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
