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

  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={DraftIcon} className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary">
          {t('pendingSummary', { count: total })}
        </h3>
      </div>
      <div className="grid gap-2">
        {rows.map((row) => (
          <Link
            key={row.href}
            href={row.href}
            className="flex items-center justify-between rounded-sm bg-card px-4 py-3 text-sm font-semibold"
          >
            <span>{row.label}</span>
            <span className="flex items-center gap-2 text-muted-foreground">
              {row.count}
              <HugeiconsIcon icon={ChevronRight} className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
