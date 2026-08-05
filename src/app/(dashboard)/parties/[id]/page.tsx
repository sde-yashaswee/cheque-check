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
import { Mail, Phone, MapPin, FileText, Pencil } from 'lucide-react'
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

  const outstanding = partyCheques.reduce((acc: number, curr: any) => {
    if (curr.status === 'Cleared') return acc
    return curr.type === 'Outward' ? acc + curr.amount : acc - curr.amount
  }, 0)

  if (partyLoading || chequesLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <EntityAvatar 
            name={party.name} 
            color={party.color} 
            icon={party.icon} 
            size="lg" 
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-display-sm font-bold truncate">{party.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <Phone className="h-3.5 w-3.5" />
                {party.contact}
              </div>
              {party.email && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <Mail className="h-3.5 w-3.5" />
                  {party.email}
                </div>
              )}
            </div>
          </div>
        </div>
        <Link href={`/parties/${id}/edit`}>
          <Button variant="ghost" size="icon" className="rounded-full bg-canvas-parchment/50">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <a href={`tel:${party.contact}`} className="flex-1">
          <Button className="w-full rounded-2xl h-12" variant="outline">
            <Phone className="mr-2 h-4 w-4" /> Contact Person
          </Button>
        </a>
        {party.email && (
          <a href={`mailto:${party.email}`} className="flex-1">
            <Button className="w-full rounded-2xl h-12" variant="outline">
              <Mail className="mr-2 h-4 w-4" /> Email Party
            </Button>
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground relative overflow-hidden">
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest relative z-10">Outstanding Balance</p>
          <p className="mt-2 text-2xl font-bold relative z-10">{currency}{outstanding.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border bg-card p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Cheques</p>
          <div className="flex items-center gap-2 mt-2">
            <FileText className="h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{partyCheques.length}</p>
          </div>
        </div>
      </div>

      {party.address && (
        <div className="rounded-3xl border bg-card p-5 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Address</p>
            <p className="text-sm font-medium mt-0.5">{party.address}</p>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4">
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
