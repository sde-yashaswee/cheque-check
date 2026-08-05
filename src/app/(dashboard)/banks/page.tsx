'use client'

import { useQuery } from '@tanstack/react-query'
import { BankService } from '@/services/bank.service'
import { Plus, Building2, CreditCard, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'

export default function BanksPage() {
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const { data: banks, isLoading } = useQuery({
    queryKey: ['banks', businessId],
    queryFn: () => BankService.getAll(businessId!),
    enabled: !!businessId,
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Management</p>
          <h2 className="text-display-sm font-bold">Bank Accounts</h2>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))
        ) : banks?.length === 0 ? (
          <div className="py-20 text-center bg-canvas-parchment/30 rounded-3xl border border-dashed">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground">No bank accounts added.</p>
            <Link href="/banks/create" className="mt-4 inline-block">
              <Button variant="outline" className="rounded-pill">Add your first bank</Button>
            </Link>
          </div>
        ) : (
          banks?.map((bank) => (
            <div key={bank.id} className="group relative rounded-3xl border bg-card p-6 transition-all active:scale-98 hover:shadow-md">
              <div className="flex items-start gap-4">
                <EntityAvatar 
                  name={bank.bank_name} 
                  color={(bank as any).color} 
                  icon={(bank as any).icon} 
                  size="lg" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold truncate">{bank.bank_name}</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{bank.account_name}</p>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-dashed pt-4">
                    <p className="text-xs font-mono text-muted-foreground tracking-tighter">
                      {bank.account_number.replace(/\d(?=\d{4})/g, "•")}
                    </p>
                    <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-black text-primary uppercase tracking-widest">
                      {bank.ifsc_code || 'No IFSC'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link href="/banks/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}
