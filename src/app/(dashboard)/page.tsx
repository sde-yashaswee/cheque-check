'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  File02Icon as FileText,
  FlashIcon as Zap,
  Calendar03Icon as Calendar,
  Chart01Icon as Stats,
  Camera01Icon as Camera,
  Building03Icon,
  Calendar01Icon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { useBusiness } from '@/hooks/use-business'
import { useCheques } from '@/hooks/use-cheques'
import { ChequeCard } from '@/components/cheque-card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useMemo } from 'react'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { useChequeStats } from '@/hooks/use-cheque-stats'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { logger } from '@/lib/logger'
import { DraftsSummaryCard } from '@/features/drafts'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'
import { StatsDateFilter } from '@/features/cheques/components/stats-date-filter'
import {
  filterByChequeDate,
  resolveDateRange,
  type DateRangePreset,
} from '@/features/cheques/lib/date-range'

const ChequeStatsChart = dynamic(
  () =>
    import('@/components/cheque-stats-chart').then(
      (mod) => mod.ChequeStatsChart,
    ),
  {
    loading: () => <Skeleton className="h-full w-full rounded-lg" />,
    ssr: false,
  },
)

export default function HomePage() {
  const tDashboard = useTranslations('Dashboard')
  const tCheques = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { cheques, isLoading, updateStatus } = useCheques(activeBusiness?.id)

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Store file for the next page to pick up
    import('@/lib/scan-store').then(({ ScanStore }) => {
      ScanStore.setFile(file)
      router.push('/cheques/create?action=scan')
    })
  }

  const {
    todayCheques,
    payable,
    receivable,
    currentBalance,
    upcomingCount,
    overdueCount,
  } = useChequeStats(cheques)

  const [statsPreset, setStatsPreset] = useState<DateRangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange>()
  const statsCheques = useMemo(
    () =>
      filterByChequeDate(
        cheques,
        resolveDateRange(statsPreset, new Date(), customRange),
      ),
    [cheques, statsPreset, customRange],
  )
  const { issuedCount, receivedCount, clearedCount, bouncedCount } =
    useChequeStats(statsCheques)

  const currency = profile?.currency || '₹'
  const formatAmount = (value: number) =>
    `${value < 0 ? '-' : ''}${currency}${Math.abs(value).toLocaleString()}`

  const chartData = [
    { name: tDashboard('issued'), value: issuedCount, color: '#0066cc' }, // Action Blue
    { name: tDashboard('received'), value: receivedCount, color: '#2997ff' }, // Sky Blue
    { name: tDashboard('cleared'), value: clearedCount, color: '#34C759' }, // iOS Green
    { name: tDashboard('bounced'), value: bouncedCount, color: '#FF3B30' }, // iOS Red
  ].filter((d) => d.value > 0)

  return (
    <div className="max-w-2xl space-y-8 pb-20 pt-2">
      <DataState
        isLoading={isLoading}
        data={activeBusiness ? [activeBusiness] : []}
        allData={activeBusiness ? [activeBusiness] : []}
        loadingComponent={
          <>
            <Skeleton className="h-40 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </>
        }
        emptyState={
          <EmptyState
            icon={Building03Icon}
            title={tDashboard('welcomeTitle')}
            description={tDashboard('welcomeDescription')}
            action={{
              label: tDashboard('createBusiness'),
              href: '/businesses/create',
            }}
          />
        }
      >
        <>
          {/* Balance Card */}
          <div className="rounded-lg bg-primary p-5 text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">
                {tDashboard('currentBalance')}
              </p>
              <p
                className={cn(
                  'mt-1.5 text-3xl font-semibold',
                  currentBalance > 0 && 'text-emerald-200',
                  currentBalance < 0 && 'text-rose-200',
                )}
              >
                {formatAmount(currentBalance)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-white/10 p-2">
                  <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">
                    {tDashboard('receivable')}
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-emerald-200">
                    {formatAmount(receivable)}
                  </p>
                </div>
                <div className="rounded-md bg-white/10 p-2">
                  <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">
                    {tDashboard('payable')}
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-rose-200">
                    {formatAmount(payable)}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
              <HugeiconsIcon icon={FileText} size={200} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon
                icon={Zap}
                className="h-3 w-3 text-muted-foreground opacity-80"
              />
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {tDashboard('quickActions')}
              </h2>
            </div>
            <div className="flex gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleScan}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 transition-transform active:scale-95"
              >
                <div className="flex flex-col items-center gap-2 rounded-lg bg-canvas-parchment p-4 border border-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <HugeiconsIcon icon={Camera} className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {tDashboard('scanCheque')}
                  </span>
                </div>
              </button>
              <Link href="/businesses" className="flex-1">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-canvas-parchment p-4 transition-transform active:scale-95 border border-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <HugeiconsIcon icon={Building03Icon} className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Businesses
                  </span>
                </div>
              </Link>
              <Link href="/reports" className="flex-1">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-canvas-parchment p-4 transition-transform active:scale-95 border border-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <HugeiconsIcon icon={FileText} className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Reports
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <DraftsSummaryCard />

          {/* Today's Cheques */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon
                icon={Calendar}
                className="h-3 w-3 text-muted-foreground opacity-80"
              />
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {tDashboard('todaysCheques')}
              </h2>
            </div>
            {todayCheques.length === 0 ? (
              <EmptyState
                icon={Calendar01Icon}
                title={tDashboard('noChequesTodayTitle')}
                description={tDashboard('noChequesTodayDescription')}
                className="py-10 bg-canvas-parchment/30"
              />
            ) : (
              <div className="space-y-4">
                {todayCheques.map((cheque) => (
                  <ChequeCard
                    key={cheque.id}
                    cheque={cheque}
                    onStatusUpdate={(id, status) => updateStatus(id, status)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Today/Upcoming/Overdue Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: tDashboard('today'),
                count: todayCheques.length,
                color: 'bg-primary/5',
              },
              {
                label: tDashboard('upcoming'),
                count: upcomingCount,
                color: 'bg-green-500/5',
              },
              {
                label: tDashboard('overdue'),
                count: overdueCount,
                color: 'bg-red-500/5',
              },
            ].map((status) => (
              <div
                key={status.label}
                className={`group relative rounded-lg border ${status.color} p-4 transition-all active:scale-95 overflow-hidden`}
              >
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {status.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{status.count}</p>
              </div>
            ))}
          </div>

          {/* Statistics Pie Chart */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon
                icon={Stats}
                className="h-3 w-3 text-muted-foreground opacity-80"
              />
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {tDashboard('statistics')}
              </h2>
              <div className="ml-auto">
                <StatsDateFilter
                  preset={statsPreset}
                  onPresetChange={setStatsPreset}
                  customRange={customRange}
                  onCustomRangeChange={setCustomRange}
                />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 h-[300px] relative">
              <ChequeStatsChart
                chartData={chartData}
                totalCheques={statsCheques?.length || 0}
              />
            </div>
          </div>
        </>
      </DataState>
    </div>
  )
}
