'use client'

import { useSwipeable } from 'react-swipeable'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface ChequeCardProps {
  cheque: ChequeWithRelations
  onStatusUpdate: (id: string, status: ChequeStatus) => void
}

export function ChequeCard({ cheque, onStatusUpdate }: ChequeCardProps) {
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState<'clear' | 'bounce' | null>(null)

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

  const statusColors = {
    Upcoming: 'bg-primary/10 text-primary',
    Cleared: 'bg-green-500/10 text-green-600',
    Bounced: 'bg-destructive/10 text-destructive',
    Today: 'bg-orange-500/10 text-orange-600',
    Overdue: 'bg-gray-500/10 text-gray-600',
  }

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
          <div>
            <p className="text-xl font-bold">₹{cheque.amount.toLocaleString()}</p>
            <p className="text-body-strong">{cheque.party?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase">{cheque.cheque_date}</p>
            <p className="text-xs text-muted-foreground">{cheque.bank?.bank_name}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Cheque #{cheque.cheque_number}</p>
          <div className={cn(
            "rounded-pill px-2 py-1 text-[10px] font-bold uppercase",
            statusColors[statusLabel as keyof typeof statusColors] || statusColors.Upcoming
          )}>
            {statusLabel}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
