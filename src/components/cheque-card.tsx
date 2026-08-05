'use client'

import { useSwipeable } from 'react-swipeable'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { cn } from '@/lib/utils'
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon as Check, Cancel01Icon as X, Delete02Icon as Trash2, Image01Icon as ImageIcon } from '@hugeicons/core-free-icons';
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProfile } from '@/hooks/use-profile'
import { format } from 'date-fns'
import { StatusPill } from '@/components/ui/status-pill'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

const DeleteConfirmationDialog = dynamic(() => import('@/components/ui/delete-dialog').then(mod => mod.DeleteConfirmationDialog), {
  loading: () => <Skeleton className="h-10 w-full rounded-lg" />,
  ssr: false
})
import { ChequeService } from '@/services/cheque.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBusiness } from '@/hooks/use-business'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import Image from 'next/image'

import Link from 'next/link'

interface ChequeCardProps {
  cheque: ChequeWithRelations
  onStatusUpdate?: (id: string, status: ChequeStatus) => void
}

export function ChequeCard({ cheque, onStatusUpdate }: ChequeCardProps) {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState<'clear' | 'bounce' | null>(null)
  const { profile } = useProfile()
  const { activeBusiness } = useBusiness()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => ChequeService.delete(cheque.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', activeBusiness?.id] })
    }
  })

  const currency = profile?.currency || '₹'
  const dateFormat = (profile?.date_format || 'dd/MM/yyyy')
    .replace(/DD/g, 'dd')
    .replace(/YYYY/g, 'yyyy')

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!onStatusUpdate || cheque.status === 'Cleared' || cheque.status === 'Bounced') return
      
      const newOffset = e.deltaX
      setOffset(newOffset)
      
      if (newOffset > 50) setSwiping('clear')
      else if (newOffset < -50) setSwiping('bounce')
      else setSwiping(null)
    },
    onSwipedLeft: (e) => {
      if (!onStatusUpdate || cheque.status === 'Cleared' || cheque.status === 'Bounced') return
      if (e.absX > 150) {
        onStatusUpdate(cheque.id, 'Bounced')
      }
      setOffset(0)
      setSwiping(null)
    },
    onSwipedRight: (e) => {
      if (!onStatusUpdate || cheque.status === 'Cleared' || cheque.status === 'Bounced') return
      if (e.absX > 150) {
        onStatusUpdate(cheque.id, 'Cleared')
      }
      setOffset(0)
      setSwiping(null)
    },
    trackMouse: true,
  })

  const getStatusDisplay = () => {
    if (cheque.status === 'Cleared') return 'Cleared'
    if (cheque.status === 'Bounced') return 'Bounced'
    const today = new Date().toISOString().split('T')[0]
    if (cheque.cheque_date === today) return 'Today'
    if (cheque.cheque_date < today) return 'Overdue'
    return 'Upcoming'
  }

  const statusLabel = getStatusDisplay()

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <div className={cn(
          "flex items-center gap-2 transition-opacity",
          swiping === 'clear' ? "opacity-100" : "opacity-0"
        )}>
          <HugeiconsIcon icon={Check} className="h-6 w-6 text-green-500" />
          <span className="font-bold text-green-500 uppercase">{t('clear')}</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 transition-opacity",
          swiping === 'bounce' ? "opacity-100" : "opacity-0"
        )}>
          <span className="font-bold text-destructive uppercase">{t('bounce')}</span>
          <HugeiconsIcon icon={X} className="h-6 w-6 text-destructive" />
        </div>
      </div>

      <motion.div
        {...handlers}
        style={{ x: offset }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 border bg-card p-5 shadow-sm active:scale-[0.99] transition-transform"
      >
        <Link href={`/cheques/${cheque.id}`} className="absolute inset-0 z-0" />
        <div className="flex justify-between items-start relative z-10 pointer-events-none">
          <div className="flex items-start gap-3">
            <EntityAvatar 
              name={cheque.party?.name || '?'} 
              color={cheque.party?.color} 
              icon={cheque.party?.icon}
              imageUrl={cheque.party?.avatar_url}
              size="md"
              className="mt-1"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{currency}{cheque.amount.toLocaleString()}</p>
                {cheque.image_url && (
                  <Dialog>
                    <DialogTrigger render={
                      <button className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-transform active:scale-90 pointer-events-auto">
                        <HugeiconsIcon icon={ImageIcon} className="h-3 w-3" />
                      </button>
                    } />
                    <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-none shadow-none">
                      <Image src={cheque.image_url} alt={t('scan')} width={800} height={400} className="w-full h-auto rounded-3xl" />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <p className="text-body-strong">{cheque.party?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              {format(new Date(cheque.cheque_date), dateFormat)}
            </p>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span className="text-[10px] text-muted-foreground">{cheque.account?.bank?.name}</span>
              <EntityAvatar 
                name={cheque.account?.bank?.name || '?'} 
                color={cheque.account?.color} 
                icon={cheque.account?.icon}
                imageUrl={cheque.account?.bank?.logo_url}
                size="sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center border-t pt-4 relative z-10">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">#{cheque.cheque_number}</p>
            <div className="pointer-events-auto">
              <DeleteConfirmationDialog 
                title={t('deleteConfirmTitle')}
                description={t('deleteConfirmDesc')}
                confirmName={cheque.cheque_number}
                onDelete={async () => { deleteMutation.mutate() }}
                trigger={
                  <button className="text-muted-foreground hover:text-destructive transition-colors">
                    <HugeiconsIcon icon={Trash2} className="h-3 w-3" />
                  </button>
                }
              />
            </div>
          </div>
          <StatusPill status={statusLabel as ChequeStatus} />
        </div>
      </motion.div>
    </div>
  )
}

