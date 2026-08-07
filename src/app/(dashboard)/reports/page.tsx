'use client'

import { useBusiness } from "@/hooks/use-business"
import { useCheques } from "@/hooks/use-cheques"
import { useProfile } from "@/hooks/use-profile"
import { ReportService } from "@/services/report.service"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react';
import { File02Icon as FileText, FileDownloadIcon as Download, FilterIcon as Filter, Calendar01Icon as Calendar, Building03Icon, LockPasswordIcon } from '@hugeicons/core-free-icons';
import { useChequeStats } from "@/hooks/use-cheque-stats"
import { DataState } from "@/components/ui/data-state"
import { EmptyState } from "@/components/ui/empty-state"
import { TextTruncate } from "@/components/ui/text-truncate"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusPill } from "@/components/ui/status-pill"
import { format } from "date-fns"
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl';
import { useMonetization } from "@/hooks/use-monetization"
import { PremiumModal } from "@/components/premium-modal"
import { useRouter } from "next/navigation"

const ChequeStatsChart = dynamic(() => import("@/components/cheque-stats-chart").then(mod => mod.ChequeStatsChart), {
  loading: () => <Skeleton className="h-full w-full rounded-lg"/>,
  ssr: false
})

export default function ReportsPage() {
  const t = useTranslations('Dashboard')
  const tc = useTranslations('Common')
  const router = useRouter()
  
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const { isLifetimePremium, isLoading: isLoadingMonetization } = useMonetization()

  const { cheques, isLoading: chequesLoading, filter, setFilter } = useCheques(activeBusiness?.id)
  const { outstanding, issuedCount, receivedCount, clearedCount, bouncedCount } = useChequeStats(cheques)

  const isLoading = chequesLoading || isLoadingMonetization

  const currency = profile?.currency || '₹'

  const chartData = [
    { name: t('issued'), value: issuedCount, color: '#0066cc' },
    { name: t('received'), value: receivedCount, color: '#2997ff' },
    { name: t('cleared'), value: clearedCount, color: '#34C759' },
    { name: t('bounced'), value: bouncedCount, color: '#FF3B30' },
  ].filter(d => d.value > 0);

  const handleExport = () => {
    if (cheques && isLifetimePremium) {
      ReportService.exportToCSV(cheques, `cheques_report_${activeBusiness?.name || 'export'}.csv`)
    }
  }

  if (!isLoadingMonetization && !isLifetimePremium) {
    return (
      <div className="max-w-2xl space-y-8 pb-20 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm font-semibold tracking-tight">Reports</h1>
            <p className="text-body text-muted-foreground">Financial summary and exports</p>
          </div>
        </div>
        <EmptyState
          icon={LockPasswordIcon}
          title="Premium Feature"
          description="Reports and Data Exports are only available on the Lifetime Premium plan."
          action={{
            label: "View Features",
            onClick: () => router.push('/features')
          }}
        />
        <PremiumModal 
          open={!isLoadingMonetization && !isLifetimePremium} 
          onOpenChange={() => {}} 
          featureName="Reports & Data Export"
          description="You need to purchase the Lifetime Premium plan to access detailed financial reports and data exports."
          onCloseRedirect="/settings"
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold tracking-tight">Reports</h1>
          <p className="text-body text-muted-foreground">Financial summary and exports</p>
        </div>
        <Button onClick={handleExport} className="rounded-full gap-2" disabled={!cheques || cheques.length === 0}>
          <HugeiconsIcon icon={Download} className="h-4 w-4"/> Export
        </Button>
      </div>

      <DataState
        isLoading={isLoading}
        data={activeBusiness ? [activeBusiness] : []}
        allData={activeBusiness ? [activeBusiness] : []}
        loadingComponent={
          <>
            <Skeleton className="h-40 w-full rounded-lg"/>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg"/>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32"/>
              <Skeleton className="h-32 w-full rounded-lg"/>
            </div>
          </>
        }
        emptyState={
          <EmptyState
            icon={Building03Icon}
            title={t('welcomeTitle')}
            description={t('welcomeDescription')}
            action={{
              label: t('createBusiness'),
              href: "/businesses/create"
            }}
          />
        }
      >
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary p-6 text-primary-foreground">
              <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">{t('totalOutstanding')}</p>
              <p className="mt-1 text-2xl font-semibold">{currency}{outstanding.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-canvas-parchment p-6 dark:bg-surface-tile-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Cheques</p>
              <p className="mt-1 text-2xl font-semibold">{cheques?.length || 0}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <HugeiconsIcon icon={Calendar} className="h-3 w-3 text-muted-foreground opacity-80"/>
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Distribution</h2>
            </div>
            <div className="rounded-lg border bg-card p-6 h-[300px] relative">
              {cheques?.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No data for chart</p>
                </div>
              ) : (
                <ChequeStatsChart chartData={chartData} totalCheques={cheques?.length || 0} />
              )}
            </div>
          </div>

          {/* List Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={FileText} className="h-3 w-3 text-muted-foreground opacity-80"/>
                <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Cheques</h2>
              </div>
            </div>
            
            {cheques?.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No cheques yet"
                description="You don't have any cheques to report on."
                className="py-10 bg-canvas-parchment/30"
              />
            ) : (
              <div className="divide-y rounded-lg border bg-card overflow-hidden">
                {(cheques || []).slice(0, 10).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <TextTruncate text={c.party?.name || ''} maxLength={20} className="font-semibold block" />
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">
                        {format(new Date(c.cheque_date), 'MMM d, yyyy')} • #{c.cheque_number}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold">{currency}{c.amount.toLocaleString()}</p>
                      <StatusPill status={c.status as any} className="scale-75 origin-right"/>
                    </div>
                  </div>
                ))}
                {(cheques?.length || 0) > 10 && (
                  <div className="p-3 text-center bg-muted/20">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Showing 10 of {cheques?.length} cheques. Export to see all.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DataState>
    </div>
  )
}
