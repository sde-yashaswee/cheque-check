'use client'

import { useChequeDetail } from '@/hooks/use-cheque-detail'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon as Pencil, Calendar03Icon as Calendar, HashtagIcon as Hash, Note01Icon as Note, Tick02Icon as CheckCircle, Cancel01Icon as XCircle, HourglassIcon as Hourglass } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { cn } from '@/lib/utils'
import { ChequeStatus } from '@/types'
import { StatusPill } from '@/components/ui/status-pill'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function ChequeDetailPage() {
  const t = useTranslations('Cheques')
  const { id } = useParams() as { id: string }
  const { profile } = useProfile()
  const currency = profile?.currency || '₹'

  const {
    cheque,
    isLoading,
    updateStatus,
    isUpdating,
  } = useChequeDetail(id)

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-64 w-full rounded-lg"/>
        <Skeleton className="h-40 w-full rounded-lg"/>
      </div>
    )
  }

  if (!cheque) return <div className="text-center py-20 text-muted-foreground">{t('notFound')}</div>

  const statusActions = [
    { 
      status: (cheque.type === 'Outward' ? 'Issued' : 'Received') as ChequeStatus, 
      icon: Hourglass, 
      label: cheque.type === 'Outward' ? t('issued') : t('received'), 
      color: 'orange' 
    },
    { status: 'Cleared' as ChequeStatus, icon: CheckCircle, label: t('clear'), color: 'green' },
    { status: 'Bounced' as ChequeStatus, icon: XCircle, label: t('bounce'), color: 'red' },
  ]

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="rounded-lg border bg-card overflow-hidden relative border-primary/5">
        <div className={cn(
          "h-32 flex items-center justify-center relative",
          cheque.type === 'Outward' ? "bg-primary/5": "bg-green-500/5"
        )}>
          <div className="text-center relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-1">
              {cheque.type === 'Outward' ? t('issuedAmount') : t('receivedAmount')}
            </p>
            <h2 className={cn(
              "text-4xl font-semibold",
              cheque.type === 'Outward' ? "text-primary": "text-green-600"
            )}>
              {currency}{cheque.amount.toLocaleString()}
            </h2>
          </div>
          <div className="absolute top-4 right-4">
            <StatusPill status={cheque.status} />
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('party')}</p>
              <div className="flex items-center gap-3">
                <EntityAvatar 
                  name={cheque.party?.name} 
                  color={cheque.party?.color} 
                  icon={cheque.party?.icon} 
                  imageUrl={cheque.party?.avatar_url}
                />
                <div>
                  <p className="font-semibold">{cheque.party?.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">{t('recipientPayer')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('account')}</p>
              <div className="flex items-center gap-3">
                <EntityAvatar 
                  name={cheque.account?.bank?.name || 'A'} 
                  color={cheque.account?.color} 
                  icon={cheque.account?.icon} 
                  imageUrl={cheque.account?.bank?.logo_url}
                />
                <div>
                  <p className="font-semibold">{cheque.account?.bank?.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">{cheque.account?.account_name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/5">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('chequeNumber')}</p>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Hash as any} className="h-3 w-3 text-primary/40"/>
                <p className="font-mono font-semibold tracking-wider">{cheque.cheque_number}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('chequeDate')}</p>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar as any} className="h-3 w-3 text-primary/40"/>
                <p className="font-semibold">{new Date(cheque.cheque_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {cheque.notes && (
            <div className="space-y-2 pt-4 border-t border-primary/5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <HugeiconsIcon icon={Note as any} className="h-3 w-3"/> {t('notes')}
              </p>
              <p className="text-sm font-semibold italic text-muted-foreground">{cheque.notes}</p>
            </div>
          )}

          {cheque.image_url && (
            <div className="space-y-4 pt-4 border-t border-primary/5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('scan')}</p>
              <div className="rounded-lg overflow-hidden border">
                <Image src={cheque.image_url} alt={t('scan')} width={800} height={400} className="w-full h-auto object-cover"/>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <HugeiconsIcon icon={CheckCircle} className="h-3 w-3 text-muted-foreground opacity-80"/>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('updateStatus')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {statusActions.map((action) => (
            <Button
              key={action.status}
              variant={cheque.status === action.status ? 'default' : 'outline'}
              className={cn(
                "h-16 flex flex-col gap-1 rounded-sm transition-all active:scale-95",
                cheque.status === action.status && action.color === 'green' && "bg-green-600 hover:bg-green-700",
                cheque.status === action.status && action.color === 'orange' && "bg-orange-500 hover:bg-orange-600",
                cheque.status === action.status && action.color === 'red' && "bg-red-600 hover:bg-red-700",
              )}
              onClick={() => updateStatus(action.status)}
              disabled={isUpdating}
            >
              <HugeiconsIcon icon={action.icon as any} className="h-5 w-5"/>
              <span className="text-[10px] uppercase font-bold tracking-wider">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <Link href={`/cheques/${id}/edit`} className="w-full">
          <Button className="w-full rounded-full h-14 text-lg"variant="secondary">
            <HugeiconsIcon icon={Pencil as any} className="mr-2 h-5 w-5"/> {t('editDetails')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
