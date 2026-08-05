'use client'

import { ChequeStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusPillProps {
  status: ChequeStatus | 'Today' | 'Overdue' | 'Upcoming'
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const statusConfig: Record<string, { bg: string, text: string }> = {
    Cleared: { bg: 'bg-green-600', text: 'text-green-50' },
    Bounced: { bg: 'bg-red-600', text: 'text-red-50' },
    Issued: { bg: 'bg-blue-600', text: 'text-blue-50' },
    Received: { bg: 'bg-purple-600', text: 'text-purple-50' },
    Today: { bg: 'bg-orange-600', text: 'text-orange-50' },
    Overdue: { bg: 'bg-gray-800', text: 'text-gray-100' },
    Upcoming: { bg: 'bg-primary', text: 'text-primary-foreground' },
  }

  const config = statusConfig[status] || statusConfig.Upcoming

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
      config.bg,
      config.text,
      className
    )}>
      {status}
    </div>
  )
}
