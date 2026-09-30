'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  NoteEditIcon as DraftIcon,
  ArrowRight01Icon as ChevronRight,
} from '@hugeicons/core-free-icons'
import { useBusiness } from '@/hooks/use-business'
import { DRAFT_LIST_PATHS, type DraftEntity } from '../lib/draft-fields'
import { useDrafts } from '../hooks/use-drafts'

export function DraftsLink({ entity }: { entity: DraftEntity }) {
  const t = useTranslations('Drafts')
  const { activeBusiness } = useBusiness()
  const { data: drafts } = useDrafts(entity, activeBusiness?.id)

  if (!drafts?.length) return null

  return (
    <Link
      href={DRAFT_LIST_PATHS[entity]}
      className="flex items-center justify-between rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary"
    >
      <span className="flex items-center gap-2">
        <HugeiconsIcon icon={DraftIcon} className="h-4 w-4" />
        {t('draftsCount', { count: drafts.length })}
      </span>
      <HugeiconsIcon icon={ChevronRight} className="h-4 w-4" />
    </Link>
  )
}

export function DraftsSummaryCard() {
  const t = useTranslations('Drafts')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const cheques = useDrafts('cheque', businessId).data?.length ?? 0
  const parties = useDrafts('party', businessId).data?.length ?? 0
  const accounts = useDrafts('account', businessId).data?.length ?? 0
  const total = cheques + parties + accounts

  if (!total) return null

  const rows = [
    { label: t('cheques'), count: cheques, href: DRAFT_LIST_PATHS.cheque },
    { label: t('parties'), count: parties, href: DRAFT_LIST_PATHS.party },
    { label: t('accounts'), count: accounts, href: DRAFT_LIST_PATHS.account },
  ].filter((row) => row.count > 0)
  const breakdown = rows.map((row) => `${row.count} ${row.label}`).join(' · ')

  return (
    <Link
      href={rows[0]?.href ?? DRAFT_LIST_PATHS.cheque}
      className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3"
    >
      <div className="flex min-w-0 items-center gap-2">
        <HugeiconsIcon
          icon={DraftIcon}
          className="h-4 w-4 shrink-0 text-primary"
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-primary">
            {t('pendingSummary', { count: total })}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {breakdown}
          </p>
        </div>
      </div>
      <HugeiconsIcon
        icon={ChevronRight}
        className="h-4 w-4 shrink-0 text-primary/50"
      />
    </Link>
  )
}
