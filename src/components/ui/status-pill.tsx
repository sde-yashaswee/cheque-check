'use client'

import { ChequeStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusPillProps {
  status: ChequeStatus | 'Today' | 'Overdue' | 'Upcoming'
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const statusConfig: Record<string, { bg: string, text: string }> = {
    Cleared: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    Bounced: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    Issued: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    Received: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    Today: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    Overdue: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    Upcoming: { bg: 'bg-primary/10', text: 'text-primary' },
  }

  const config = statusConfig[status] || statusConfig.Upcoming

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      config.bg,
      config.text,
      className
    )}>
      {status}
    </div>
  )
}
