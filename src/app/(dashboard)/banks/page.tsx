'use client'

import { useQuery } from '@tanstack/react-query'
import { BankService } from '@/services/bank.service'
import { Plus, Building2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'

export default function BanksPage() {
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const { data: banks, isLoading } = useQuery({
    queryKey: ['banks', businessId],
    queryFn: () => BankService.getAll(businessId!),
    enabled: !!businessId,
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-display-lg">Banks</h1>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading banks...</p>
        ) : banks?.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground text-body">No bank accounts added.</p>
            <Link href="/banks/create">
              <Button variant="link" className="text-primary">Add your first bank</Button>
            </Link>
          </div>
        ) : (
          banks?.map((bank) => (
            <div key={bank.id} className="rounded-lg border bg-card p-5 transition-transform active:scale-98">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-parchment text-foreground">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold">{bank.bank_name}</p>
                  <p className="text-body text-muted-foreground">{bank.account_name}</p>
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <p className="text-xs font-mono text-muted-foreground">
                      {bank.account_number.replace(/\d(?=\d{4})/g, "•")}
                    </p>
                    <p className="text-xs font-semibold text-primary uppercase">{bank.ifsc_code || 'No IFSC'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Link href="/banks/create">
        <Button className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
