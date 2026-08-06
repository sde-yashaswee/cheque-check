'use client'

import { useBusinessDetail } from '@/hooks/use-business-detail'
import { ChequeCard } from '@/components/cheque-card'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon as Phone, Mail01Icon as Mail, PencilEdit01Icon as Pencil, Location01Icon as MapPin, File02Icon as FileText } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import type { ChequeWithRelations } from '@/types'
import { useTranslations } from 'next-intl'

export default function BusinessDetailPage() {
  const t = useTranslations('Businesses')
  const tc = useTranslations('Common')
  const { id } = useParams() as { id: string }
  const { profile } = useProfile()
  const currency = profile?.currency || '₹'

  const {
    business,
    cheques,
    stats,
    isLoading,
  } = useBusinessDetail(id)

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-40 w-full rounded-lg"/>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-lg"/>
          <Skeleton className="h-24 w-full rounded-lg"/>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg"/>
          ))}
        </div>
      </div>
    )
  }

  if (!business) return <div className="text-center py-20 text-muted-foreground">{t('notFound')}</div>

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="rounded-lg border bg-card p-6 space-y-6 relative overflow-hidden border-primary/5">
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <EntityAvatar 
              name={business.name} 
              color={business.color} 
              icon={business.icon} 
              imageUrl={business.logo_url}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-semibold">{business.name}</h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{business.phone || t('noPhone')}</p>
            </div>
          </div>
          <Link href={`/businesses/${id}/edit`}>
            <Button variant="ghost"size="icon"className="rounded-full bg-canvas-parchment/50">
              <HugeiconsIcon icon={Pencil} className="h-4 w-4"/>
            </Button>
          </Link>
        </div>

        <div className="flex gap-3 relative z-10">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex-1">
              <Button className="w-full rounded-sm h-12"variant="outline">
                <HugeiconsIcon icon={Phone} className="mr-2 h-4 w-4"/> {tc('contact')}
              </Button>
            </a>
          )}
          {business.email && (
            <a href={`mailto:${business.email}`} className="flex-1">
              <Button className="w-full rounded-sm h-12"variant="outline">
                <HugeiconsIcon icon={Mail} className="mr-2 h-4 w-4"/> {tc('email')}
              </Button>
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="rounded-sm bg-primary/5 p-4 border border-primary/10">
            <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">{tc('totalVolume')}</p>
            <p className="mt-2 text-2xl font-semibold">{currency}{stats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-sm bg-canvas-parchment p-4 border border-border/50">
            <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">{tc('cheques')}</p>
            <p className="mt-2 text-2xl font-semibold">{stats.total}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 relative z-10">
          <div className="rounded-sm bg-green-500/5 p-3 border border-green-500/10 text-center">
            <p className="text-[8px] font-bold text-green-600 uppercase tracking-tighter">{tc('cleared')}</p>
            <p className="mt-1 text-lg font-bold text-green-600">{stats.cleared}</p>
          </div>
          <div className="rounded-sm bg-orange-500/5 p-3 border border-orange-500/10 text-center">
            <p className="text-[8px] font-bold text-orange-600 uppercase tracking-tighter">{tc('pending')}</p>
            <p className="mt-1 text-lg font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="rounded-sm bg-red-500/5 p-3 border border-red-500/10 text-center">
            <p className="text-[8px] font-bold text-red-600 uppercase tracking-tighter">{tc('bounced')}</p>
            <p className="mt-1 text-lg font-bold text-red-600">{stats.bounced}</p>
          </div>
        </div>
        
        {business.address && (
          <div className="pt-2 relative z-10">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <HugeiconsIcon icon={MapPin} className="h-3 w-3"/> {tc('address')}
            </p>
            <p className="text-sm font-semibold">{business.address}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <HugeiconsIcon icon={FileText} className="h-3 w-3 text-muted-foreground opacity-80"/>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('businessCheques')}</h3>
        </div>
        {cheques && cheques.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center bg-canvas-parchment/30">
            <p className="text-sm text-muted-foreground font-semibold">{t('noChequesDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cheques?.map((cheque: ChequeWithRelations) => (
              <ChequeCard 
                key={cheque.id} 
                cheque={cheque} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
