'use client'

import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import { File01Icon as DraftIcon } from '@hugeicons/core-free-icons'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import type { AccountDraft, ChequeDraft, PartyDraft } from '@/types'
import { DRAFT_CREATE_PATHS, type DraftEntity } from '../lib/draft-fields'
import { useDeleteDraft, useDrafts } from '../hooks/use-drafts'
import { DraftCard, type DraftCardProps } from './draft-card'

type Describe = Omit<DraftCardProps, 'href' | 'updatedAt' | 'onDelete'>

export function DraftList({ entity }: { entity: DraftEntity }) {
  const t = useTranslations('Drafts')
  const tc = useTranslations('Common')
  const tCheques = useTranslations('Cheques')
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const businessId = activeBusiness?.id
  const currency = profile?.currency || '₹'
  const { data: drafts, isLoading } = useDrafts(entity, businessId)
  const deleteDraft = useDeleteDraft(entity, businessId)

  const describe = (
    draft: ChequeDraft | PartyDraft | AccountDraft,
  ): Describe => {
    if (entity === 'cheque') {
      const cheque = draft as ChequeDraft
      const amount = cheque.amount
        ? `${currency}${cheque.amount.toLocaleString()}`
        : null
      return {
        title: amount ?? cheque.party?.name ?? t('untitled'),
        subtitle: amount ? cheque.party?.name : null,
        meta: [
          cheque.type === 'Inward'
            ? tCheques('received')
            : cheque.type === 'Outward'
              ? tCheques('issued')
              : null,
          cheque.cheque_number ? `#${cheque.cheque_number}` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        avatar: {
          name: cheque.party?.name || '?',
          color: cheque.party?.color,
          imageUrl: cheque.party?.avatar_url,
        },
      }
    }
    if (entity === 'party') {
      const party = draft as PartyDraft
      return {
        title: party.name || t('untitled'),
        subtitle: party.contact,
        avatar: {
          name: party.name || '?',
          color: party.color,
          imageUrl: party.avatar_url,
        },
      }
    }
    const account = draft as AccountDraft
    return {
      title: account.account_name || t('untitled'),
      subtitle: account.account_number
        ? `${account.bank?.name ?? tc('bank')} (${account.account_number.slice(-4)})`
        : account.bank?.name,
      avatar: {
        name: account.bank?.name || account.account_name || '?',
        color: account.color,
        imageUrl: account.bank?.logo_url,
      },
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!drafts?.length) {
    return (
      <EmptyState
        illustration={
          <HugeiconsIcon
            icon={DraftIcon}
            className="h-10 w-10 text-primary/40"
          />
        }
        title={t('emptyTitle')}
        description={t('emptyDescription')}
      />
    )
  }

  return (
    <div className="space-y-3">
      {drafts.map((draft) => (
        <DraftCard
          key={draft.id}
          href={`${DRAFT_CREATE_PATHS[entity]}?draftId=${draft.id}`}
          updatedAt={draft.updated_at}
          onDelete={async () => {
            await deleteDraft.mutateAsync(draft.id)
            toast.add({ title: t('deleted'), type: 'success' })
          }}
          {...describe(draft)}
        />
      ))}
    </div>
  )
}
