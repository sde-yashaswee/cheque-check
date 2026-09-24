'use client'

import { useState, useMemo } from 'react'
import { useTransactions } from '@/hooks/use-transactions'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon as Search,
  Money03Icon,
  ReceiptTextIcon,
  CheckmarkCircle02Icon as Success,
  CancelCircleIcon as Failed,
  RefreshIcon as Refunded,
  Clock01Icon as Pending,
  Sorting05Icon as Filter,
  Tick02Icon as Check,
  SortingAZ01Icon as AscIcon,
  SortingZA01Icon as DescIcon,
} from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function TransactionsPage() {
  const t = useTranslations('Transactions')
  const { transactions, isLoading } = useTransactions()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  const filteredAndSortedTransactions = useMemo(() => {
    if (!transactions) return []

    let result = [...transactions]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.razorpay_order_id?.toLowerCase().includes(q) ||
          tx.razorpay_payment_id?.toLowerCase().includes(q),
      )
    }

    // Filter Type
    if (filterType !== 'all') {
      result = result.filter((tx) => tx.type === filterType)
    }

    // Filter Status
    if (filterStatus !== 'all') {
      result = result.filter((tx) => tx.status === filterStatus)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        comparison = dateA - dateB
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [transactions, searchQuery, filterType, filterStatus, sortOrder, sortBy])

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto pb-20 p-4">
        <Skeleton className="h-11 w-full rounded-full" />
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'captured':
        return {
          icon: Success,
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
        }
      case 'authorized':
        return {
          icon: Success,
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
        }
      case 'failed':
        return {
          icon: Failed,
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
        }
      case 'refunded':
        return {
          icon: Refunded,
          color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        }
      default:
        return {
          icon: Pending,
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        }
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lifetime':
        return t('lifetimePremium')
      case 'subscription':
        return t('subscription')
      case 'top_up':
        return t('topUp')
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'captured':
        return t('captured')
      case 'authorized':
        return t('authorized')
      case 'failed':
        return t('failed')
      case 'refunded':
        return t('refunded')
      case 'created':
        return t('created')
      default:
        return status
    }
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search}
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            leftIcon={Search}
            className="rounded-full h-11 bg-canvas-parchment border-none"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-11 w-11 shrink-0 bg-white dark:bg-zinc-900 border-none shadow-sm"
              >
                <HugeiconsIcon icon={Filter} className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <HugeiconsIcon icon={Filter} className="h-5 w-5 text-primary" />
                {t('sortAndFilter')}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Filter Type */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t('type')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'lifetime', 'subscription', 'top_up'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilterType(opt)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]',
                        filterType === opt
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'bg-muted/30 border-transparent text-foreground',
                      )}
                    >
                      <span className="font-bold text-sm">
                        {opt === 'all' ? t('allTypes') : getTypeLabel(opt)}
                      </span>
                      {filterType === opt && (
                        <HugeiconsIcon
                          icon={Check}
                          className="h-4 w-4 stroke-[3]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Status */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t('status')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'all',
                    'captured',
                    'authorized',
                    'failed',
                    'refunded',
                    'created',
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilterStatus(opt)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]',
                        filterStatus === opt
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'bg-muted/30 border-transparent text-foreground',
                      )}
                    >
                      <span className="font-bold text-sm capitalize">
                        {opt === 'all' ? t('allStatuses') : getStatusLabel(opt)}
                      </span>
                      {filterStatus === opt && (
                        <HugeiconsIcon
                          icon={Check}
                          className="h-4 w-4 stroke-[3]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t('sortBy')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: t('date'), value: 'date' },
                    { label: t('amount'), value: 'amount' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value as any)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]',
                        sortBy === opt.value
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'bg-muted/30 border-transparent text-foreground',
                      )}
                    >
                      <span className="font-bold text-sm">{opt.label}</span>
                      {sortBy === opt.value && (
                        <HugeiconsIcon
                          icon={Check}
                          className="h-4 w-4 stroke-[3]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t('order')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('ascending'), value: 'asc', icon: AscIcon },
                    { label: t('descending'), value: 'desc', icon: DescIcon },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortOrder(opt.value as any)}
                      className={cn(
                        'flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]',
                        sortOrder === opt.value
                          ? 'bg-primary/5 border-primary text-primary'
                          : 'bg-muted/30 border-transparent text-foreground',
                      )}
                    >
                      <HugeiconsIcon icon={opt.icon} className="h-4 w-4" />
                      <span className="font-bold text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {filteredAndSortedTransactions.length === 0 ? (
        <EmptyState
          icon={ReceiptTextIcon}
          title={t('noTransactions')}
          description={
            searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? t('adjustFilters')
              : t('noTransactionsYet')
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAndSortedTransactions.map((tx) => {
            const statusConfig = getStatusConfig(tx.status)
            const StatusIcon = statusConfig.icon

            return (
              <Card
                key={tx.id}
                className="group p-4 flex flex-col gap-4 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all active:scale-[0.98] bg-card rounded-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <HugeiconsIcon icon={Money03Icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base truncate">
                        {getTypeLabel(tx.type)}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                        {format(new Date(tx.created_at), 'PPP at p')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary text-sm">
                      {tx.currency === 'INR'
                        ? '₹'
                        : tx.currency === 'USD'
                          ? '$'
                          : tx.currency}{' '}
                      {(tx.amount / 100).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <Badge
                      variant="outline"
                      className={`mt-1.5 gap-1 text-[10px] font-semibold border ${statusConfig.color}`}
                    >
                      <HugeiconsIcon icon={StatusIcon} className="w-3 h-3" />
                      {getStatusLabel(tx.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-3 rounded-lg border border-transparent">
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-0.5">
                      {t('orderId')}
                    </span>
                    <span className="font-mono text-[11px] font-medium break-all text-foreground/80">
                      {tx.razorpay_order_id || t('notAvailable')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-0.5">
                      {t('paymentId')}
                    </span>
                    <span className="font-mono text-[11px] font-medium break-all text-foreground/80">
                      {tx.razorpay_payment_id || t('notAvailable')}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
