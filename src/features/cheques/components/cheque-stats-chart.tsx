'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { PieChartIcon } from '@hugeicons/core-free-icons'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'

interface ChartData {
  name: string
  value: number
  color: string
}

interface ChequeStatsChartProps {
  chartData: ChartData[]
  totalCheques: number
}

export function ChequeStatsChart({
  chartData,
  totalCheques,
}: ChequeStatsChartProps) {
  const t = useTranslations('Common')

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={PieChartIcon}
          title={t('noData')}
          description={t('addChequesForStats')}
          className="border-none p-0"
        />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '11px', border: 'none' }}
            itemStyle={{ fontWeight: '600' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* TOTAL TEXT IN THE CENTER */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {t('total')}
        </p>
        <p className="text-2xl font-semibold leading-none">{totalCheques}</p>
      </div>
    </div>
  )
}
