'use client'

import { useSwipeable } from 'react-swipeable'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProfile } from '@/hooks/use-profile'
import { format } from 'date-fns'
import { StatusPill } from '@/components/ui/status-pill'
import { EntityAvatar } from '@/components/ui/entity-avatar'

interface ChequeCardProps {
  cheque: ChequeWithRelations
  onStatusUpdate: (id: string, status: ChequeStatus) => void
}

export function ChequeCard({ cheque, onStatusUpdate }: ChequeCardProps) {
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState<'clear' | 'bounce' | null>(null)
  const { profile } = useProfile()

  const currency = profile?.currency || '₹'
  const dateFormat = profile?.date_format || 'dd/MM/yyyy'

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (cheque.status === 'Cleared' || cheque.status === 'Bounced') return
      
      const newOffset = e.deltaX
      setOffset(newOffset)
      
      if (newOffset > 50) setSwiping('clear')
      else if (newOffset < -50) setSwiping('bounce')
      else setSwiping(null)
    },
    onSwipedLeft: (e) => {
      if (cheque.status === 'Cleared' || cheque.status === 'Bounced') return
      if (e.absX > 150) {
        onStatusUpdate(cheque.id, 'Bounced')
      }
      setOffset(0)
      setSwiping(null)
    },
    onSwipedRight: (e) => {
      if (cheque.status === 'Cleared' || cheque.status === 'Bounced') return
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
          <Check className="h-6 w-6 text-green-500" />
          <span className="font-bold text-green-500">CLEAR</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 transition-opacity",
          swiping === 'bounce' ? "opacity-100" : "opacity-0"
        )}>
          <span className="font-bold text-destructive">BOUNCE</span>
          <X className="h-6 w-6 text-destructive" />
        </div>
      </div>

      <motion.div
        {...handlers}
        style={{ x: offset }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 border bg-card p-5 shadow-sm active:scale-[0.99] transition-transform"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <EntityAvatar 
              name={cheque.party?.name || '?'} 
              color={(cheque.party as any)?.color} 
              icon={(cheque.party as any)?.icon}
              size="md"
              className="mt-1"
            />
            <div>
              <p className="text-xl font-bold">{currency}{cheque.amount.toLocaleString()}</p>
              <p className="text-body-strong">{cheque.party?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              {format(new Date(cheque.cheque_date), dateFormat)}
            </p>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span className="text-[10px] text-muted-foreground">{cheque.bank?.bank_name}</span>
              <EntityAvatar 
                name={cheque.bank?.bank_name || '?'} 
                color={(cheque.bank as any)?.color} 
                icon={(cheque.bank as any)?.icon}
                size="sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Cheque #{cheque.cheque_number}</p>
          <StatusPill status={statusLabel as any} />
        </div>
      </motion.div>
    </div>
  )
}
