'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BankService } from '@/services/bank.service'
import { ChequeService } from '@/services/cheque.service'
import { ChequeCard } from '@/components/cheque-card'
import { useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { Landmark, User, Hash, Pencil, Phone } from 'lucide-react'
import { ChequeStatus } from '@/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BankDetailPage() {
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const businessId = activeBusiness?.id
  const currency = profile?.currency || '₹'

  const { data: bank, isLoading: bankLoading } = useQuery({
    queryKey: ['bank', id],
    queryFn: () => BankService.getById(id),
  })

  const { data: cheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const bankCheques = cheques?.filter((c: any) => c.bank_id === id) || []

  if (bankLoading || chequesLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!bank) return <div>Bank not found</div>

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="rounded-3xl border bg-card p-6 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <EntityAvatar 
              name={bank.bank_name} 
              color={bank.color} 
              icon={bank.icon} 
              size="lg" 
            />
            <div>
              <h2 className="text-2xl font-bold">{bank.bank_name}</h2>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{bank.account_name}</p>
            </div>
          </div>
          <Link href={`/banks/${id}/edit`}>
            <Button variant="ghost" size="icon" className="rounded-full bg-canvas-parchment/50">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Number</p>
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-primary" />
              <p className="font-mono font-bold">{bank.account_number}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">IFSC Code</p>
            <p className="font-mono font-bold uppercase">{bank.ifsc_code || 'N/A'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-dashed flex gap-3 relative z-10">
           <a href="tel:+910000000000" className="flex-1">
             <Button className="w-full rounded-2xl h-12" variant="outline">
                <Phone className="mr-2 h-4 w-4" /> Contact Person
             </Button>
           </a>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Bank Cheque History</h3>
        {bankCheques.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-10 text-center bg-canvas-parchment/30">
            <p className="text-sm text-muted-foreground font-medium">No cheques found for this bank account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankCheques.map((cheque: any) => (
              <ChequeCard 
                key={cheque.id} 
                cheque={cheque} 
                onStatusUpdate={(id, status) => mutation.mutate({ id, status })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
