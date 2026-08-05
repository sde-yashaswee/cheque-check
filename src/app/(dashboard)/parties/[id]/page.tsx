'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PartyService } from '@/services/party.service'
import { ChequeService } from '@/services/cheque.service'
import { ChequeCard } from '@/components/cheque-card'
import { useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { Phone, Mail, Pencil } from 'lucide-react'
import { ChequeStatus } from '@/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PartyDetailPage() {
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const businessId = activeBusiness?.id
  const currency = profile?.currency || '₹'

  const { data: party, isLoading: partyLoading } = useQuery({
    queryKey: ['party', id],
    queryFn: () => PartyService.getById(id),
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

  const partyCheques = cheques?.filter((c: any) => c.party_id === id) || []
  const outstanding = partyCheques
    .filter((c: any) => c.status !== 'Cleared' && c.status !== 'Bounced')
    .reduce((sum: number, c: any) => sum + c.amount, 0)

  if (partyLoading || chequesLoading) {
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

  if (!party) return <div>Party not found</div>

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="rounded-3xl border bg-card p-6 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <EntityAvatar 
              name={party.name} 
              color={party.color} 
              icon={party.icon} 
              size="lg" 
            />
            <div>
              <h2 className="text-2xl font-bold">{party.name}</h2>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{party.contact}</p>
            </div>
          </div>
          <Link href={`/parties/${id}/edit`}>
            <Button variant="ghost" size="icon" className="rounded-full bg-canvas-parchment/50">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-3 relative z-10">
          <a href={`tel:${party.contact}`} className="flex-1">
            <Button className="w-full rounded-2xl h-12" variant="outline">
              <Phone className="mr-2 h-4 w-4" /> Contact
            </Button>
          </a>
          {party.email && (
            <a href={`mailto:${party.email}`} className="flex-1">
              <Button className="w-full rounded-2xl h-12" variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Outstanding</p>
            <p className="mt-2 text-2xl font-bold">{currency}{outstanding.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-canvas-parchment p-4 border border-border/50">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Total Cheques</p>
            <p className="mt-2 text-2xl font-bold">{partyCheques.length}</p>
          </div>
        </div>
        
        {party.address && (
          <div className="pt-2 relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Address</p>
            <p className="text-sm font-medium">{party.address}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Cheque History</h3>
        {partyCheques.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-10 text-center bg-canvas-parchment/30">
            <p className="text-sm text-muted-foreground font-medium">No cheques found for this party.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {partyCheques.map((cheque: any) => (
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
