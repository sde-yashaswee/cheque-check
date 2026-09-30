'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon as ChevronRight,
  Tag01Icon as TagIcon,
} from '@hugeicons/core-free-icons'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { TextTruncate } from '@/components/ui/text-truncate'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChequeCard } from '@/features/cheques/components/cheque-card'
import { useCheques } from '@/hooks/use-cheques'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { useBusiness } from '@/hooks/use-business'
import { useTagDetail } from '@/features/tags/hooks/use-tag-list'
import type { TagEntityType } from '@/types'

interface LinkedRow {
  id: string
  href: string
  name: string
  subtitle?: string | null
  color?: string
  icon?: string
  imageUrl?: string | null
}

function LinkedRowItem({ row }: { row: LinkedRow }) {
  return (
    <Link href={row.href} className="block">
      <div className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-card p-4 transition-all active:scale-95 dark:border-zinc-800">
        <EntityAvatar
          name={row.name}
          color={row.color}
          icon={row.icon}
          imageUrl={row.imageUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <TextTruncate
            text={row.name}
            maxLength={25}
            className="text-base font-bold"
          />
          {row.subtitle && (
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {row.subtitle}
            </p>
          )}
        </div>
        <HugeiconsIcon
          icon={ChevronRight}
          className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  )
}

export default function TagDetailPage() {
  const t = useTranslations('Tags')
  const { id } = useParams() as { id: string }
  const { tag, links, isLoading } = useTagDetail(id)
  const businessId = tag?.business_id
  const { cheques, isLoading: chequesLoading } = useCheques(businessId)
  const { parties, isLoading: partiesLoading } = useParties(businessId)
  const { accounts, isLoading: accountsLoading } = useAccounts(businessId)
  const { businesses } = useBusiness()
  const [tab, setTab] = useState<TagEntityType>('cheque')

  const idsByType = useMemo(() => {
    const map: Record<TagEntityType, Set<string>> = {
      cheque: new Set(),
      party: new Set(),
      account: new Set(),
      business: new Set(),
    }
    for (const link of links) map[link.entity_type].add(link.entity_id)
    return map
  }, [links])

  const linkedCheques = (cheques ?? []).filter((c) =>
    idsByType.cheque.has(c.id),
  )
  const rows: Record<Exclude<TagEntityType, 'cheque'>, LinkedRow[]> = {
    party: (parties ?? [])
      .filter((p) => idsByType.party.has(p.id))
      .map((p) => ({
        id: p.id,
        href: `/parties/${p.id}`,
        name: p.name,
        subtitle: p.contact,
        color: p.color,
        icon: p.icon,
        imageUrl: p.avatar_url,
      })),
    account: (accounts ?? [])
      .filter((a) => idsByType.account.has(a.id))
      .map((a) => ({
        id: a.id,
        href: `/accounts/${a.id}`,
        name: a.account_name,
        subtitle: `${a.bank?.name ?? ''} ${a.account_number.slice(-4)}`.trim(),
        color: a.color,
        icon: a.icon,
        imageUrl: a.bank?.logo_url,
      })),
    business: businesses
      .filter((b) => idsByType.business.has(b.id))
      .map((b) => ({
        id: b.id,
        href: `/businesses/${b.id}`,
        name: b.name,
        subtitle: b.email,
        color: b.color,
        icon: b.icon,
        imageUrl: b.logo_url,
      })),
  }

  const tabs: { value: TagEntityType; label: string; count: number }[] = [
    { value: 'cheque', label: t('cheques'), count: linkedCheques.length },
    { value: 'party', label: t('parties'), count: rows.party.length },
    { value: 'account', label: t('accounts'), count: rows.account.length },
    { value: 'business', label: t('businesses'), count: rows.business.length },
  ]

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t('notFound')}
      </div>
    )
  }

  const listLoading =
    (tab === 'cheque' && chequesLoading) ||
    (tab === 'party' && partiesLoading) ||
    (tab === 'account' && accountsLoading)

  return (
    <div className="max-w-2xl space-y-8 pb-24">
      <div
        className="relative flex h-32 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-primary/5"
        style={{ backgroundColor: `${tag.color}14` }}
      >
        <span
          className="inline-flex h-9 max-w-[80%] items-center gap-2 truncate rounded-full px-4 text-lg font-semibold text-white"
          style={{ backgroundColor: tag.color }}
        >
          <HugeiconsIcon icon={TagIcon} className="size-4 shrink-0" />
          {tag.name}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t('usageCount', { count: links.length })}
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TagEntityType)}
      >
        <TabsList className="h-12 w-full rounded-lg bg-canvas-parchment p-1">
          {tabs.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="h-full flex-1 gap-1 rounded-md px-1 text-[10px] font-semibold uppercase tracking-wider data-active:bg-primary data-active:text-white"
            >
              {item.label}
              <span className="opacity-60">{item.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {listLoading
          ? [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))
          : tab === 'cheque'
            ? linkedCheques.map((cheque) => (
                <ChequeCard key={cheque.id} cheque={cheque} />
              ))
            : rows[tab].map((row) => <LinkedRowItem key={row.id} row={row} />)}
        {!listLoading &&
          tabs.find((item) => item.value === tab)!.count === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t('noLinkedItems')}
            </div>
          )}
      </div>
    </div>
  )
}
