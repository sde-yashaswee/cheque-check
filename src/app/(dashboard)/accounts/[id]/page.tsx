'use client'

import { useAccountDetail } from '@/hooks/use-account-detail'
import { ChequeCard } from '@/components/cheque-card'
import { useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { HugeiconsIcon } from '@hugeicons/react';
import { HashtagIcon as Hash, PencilEdit01Icon as Pencil } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AccountDetailPage() {
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const {
    account,
    accountCheques,
    isLoading,
    updateChequeStatus,
  } = useAccountDetail(id, businessId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!account) return <div className="text-center py-20 text-muted-foreground">Account not found</div>

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="rounded-lg border bg-card p-6 space-y-6 relative overflow-hidden border-primary/5">
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <EntityAvatar 
              name={account.bank?.name || 'A'} 
              color={account.color} 
              icon={account.icon} 
              size="lg" 
            />
            <div>
              <h2 className="text-2xl font-semibold">{account.bank?.name}</h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{account.account_name}</p>
            </div>
          </div>
          <Link href={`/accounts/${id}/edit`}>
            <Button variant="ghost" size="icon" className="rounded-full bg-canvas-parchment/50">
              <HugeiconsIcon icon={Pencil} className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Account Number</p>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Hash} className="h-3 w-3 text-primary" />
              <p className="font-mono font-semibold">{account.account_number}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">IFSC Code</p>
            <p className="font-mono font-semibold uppercase">{account.ifsc_code || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Cheque History</h3>
        {accountCheques.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center bg-canvas-parchment/30">
            <p className="text-sm text-muted-foreground font-semibold">No cheques found for this account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accountCheques.map((cheque: any) => (
              <ChequeCard 
                key={cheque.id} 
                cheque={cheque} 
                onStatusUpdate={updateChequeStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

