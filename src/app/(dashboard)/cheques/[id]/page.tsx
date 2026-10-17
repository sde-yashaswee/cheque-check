'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useChequeDetail } from '@/hooks/use-cheque-detail'
import { useParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Calendar03Icon as Calendar,
  HashtagIcon as Hash,
  Note01Icon as Note,
  Tick02Icon as CheckCircle,
  Cancel01Icon as XCircle,
  HourglassIcon as Hourglass,
  MessageQuestionIcon as Message,
  FileDownloadIcon as Download,
  Settings02Icon as PrintSettings,
  Copy01Icon as Copy,
  Delete02Icon as Trash2,
} from '@hugeicons/core-free-icons'
import dynamic from 'next/dynamic'
import { toast } from '@/components/ui/toast'
import { SpeedDialFab, type SpeedDialAction } from '@/components/speed-dial-fab'
import { useChequeActions } from '@/hooks/use-cheque-actions'
import { chequeDraftService } from '@/features/drafts'
import { useProfile } from '@/hooks/use-profile'
import { useSignedMediaUrl } from '@/hooks/use-signed-media-url'
import { TextTruncate } from '@/components/ui/text-truncate'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'
import { ChequeStatus } from '@/types'
import { StatusPill } from '@/components/ui/status-pill'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRedirectIfDraft } from '@/features/drafts'
import { partyService } from '@/features/parties/services/party.service'
import {
  isPartySmsEnabled,
  preparePartySms,
} from '@/features/cheques/lib/notify-party'
import {
  downloadChequePrintPdf,
  getPrintLayout as getLocalPrintLayout,
} from '@/features/cheques/lib/print-cheque'
import { getPrintLayout } from '@/features/premium-workspace/services/workspace.service'
import { PrintLayoutEditor } from '@/features/cheques/components/print-layout-editor'
import { EntityTagsSection } from '@/features/tags/components/tag-chips'
import { usePremiumAction } from '@/features/monetization/components/premium-gate'

import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

const DeleteConfirmationDialog = dynamic(
  () =>
    import('@/components/ui/delete-dialog').then(
      (mod) => mod.DeleteConfirmationDialog,
    ),
  { ssr: false },
)

function ChequeScanImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const { url: resolvedSrc, failed: resolveFailed } = useSignedMediaUrl(src)
  const showFailed = failed || resolveFailed

  return (
    <div className="relative aspect-[2/1] w-full">
      {!loaded && !showFailed && (
        <Skeleton className="absolute inset-0 h-full w-full" />
      )}
      {showFailed && (
        <span className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          {alt}
        </span>
      )}
      {resolvedSrc && !showFailed && (
        <Image
          src={resolvedSrc}
          alt={alt}
          width={800}
          height={400}
          priority
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'h-full w-full object-cover transition-transform group-hover:scale-[1.02]',
            !loaded && 'invisible',
          )}
        />
      )}
    </div>
  )
}

export default function ChequeDetailPage() {
  const t = useTranslations('Cheques')
  const tc = useTranslations('Common')
  const { id } = useParams() as { id: string }
  const { profile } = useProfile()
  const premium = usePremiumAction()
  const currency = profile?.currency || '₹'

  const { cheque, isLoading, updateStatus, isUpdating } = useChequeDetail(id)
  const { deleteCheque } = useChequeActions()
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [printLayoutOpen, setPrintLayoutOpen] = useState(false)
  const { data: party } = useQuery({
    queryKey: queryKeys.parties.detail(cheque?.party_id),
    queryFn: () => partyService.getById(cheque!.party_id),
    enabled: !!cheque?.party_id,
  })
  const isDraft = useRedirectIfDraft('cheque', cheque)

  if (isLoading || isDraft) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  if (!cheque)
    return (
      <div className="text-center py-20 text-muted-foreground">
        {t('notFound')}
      </div>
    )

  const pendingStatus: ChequeStatus =
    cheque.type === 'Outward' ? 'Issued' : 'Received'
  const statusActions: SpeedDialAction[] = (
    [
      { status: pendingStatus, icon: Hourglass },
      { status: 'Cleared', icon: CheckCircle },
      { status: 'Bounced', icon: XCircle },
    ] as const
  )
    .filter(({ status }) => status !== cheque.status)
    .map(({ status, icon }) => ({
      label: t('markAs', { status }),
      icon,
      disabled: isUpdating,
      testId: `cheque-status-${status.toLowerCase()}`,
      onClick: () => updateStatus(status),
    }))

  const duplicateCheque = async () => {
    if (!(await premium.verifyAccess('duplicate-cheque'))) return
    try {
      const draft = await chequeDraftService.create(cheque.business_id, {
        party_id: cheque.party_id,
        account_id: cheque.account_id,
        amount: cheque.amount,
        cheque_date: new Date().toISOString().split('T')[0],
        deposit_date: null,
        type: cheque.type,
        notes: cheque.notes,
      })
      router.push(`/cheques/create?draftId=${draft.id}`)
    } catch {
      toast.add({ title: t('duplicateFailed'), type: 'error' })
    }
  }

  const actions: SpeedDialAction[] = [
    ...statusActions,
    ...(party?.contact && isPartySmsEnabled(profile)
      ? [
          {
            label: t('notifyParty'),
            icon: Message,
            onClick: () => {
              if (!premium.requireAccess('notify-party')) return
              void preparePartySms(
                t('notifyParty'),
                party.contact,
                cheque,
                party,
                currency,
                premium.accessRequiredMessage,
              )
            },
          },
        ]
      : []),
    {
      label: t('printCheque'),
      icon: Download,
      onClick: async () => {
        if (!(await premium.verifyAccess('cheque-printing'))) return
        try {
          const layout = await getPrintLayout(cheque.account_id)
          downloadChequePrintPdf(
            cheque,
            currency,
            layout ?? getLocalPrintLayout(cheque.account_id),
          )
        } catch (error) {
          toast.add({
            title: tc('error'),
            description: error instanceof Error ? error.message : tc('error'),
            type: 'error',
          })
        }
      },
    },
    {
      label: t('configurePrint'),
      icon: PrintSettings,
      onClick: () => {
        if (premium.requireAccess('cheque-printing')) setPrintLayoutOpen(true)
      },
    },
    {
      label: t('duplicate'),
      icon: Copy,
      onClick: () => void duplicateCheque(),
    },
    {
      label: t('deleteAction'),
      icon: Trash2,
      destructive: true,
      testId: 'cheque-detail-delete-trigger',
      onClick: () => setDeleteOpen(true),
    },
  ]

  return (
    <div className="max-w-2xl space-y-8 pb-28">
      <div className="rounded-lg border bg-card overflow-hidden relative border-primary/5">
        <div
          className={cn(
            'h-32 flex items-center justify-center relative',
            cheque.type === 'Outward' ? 'bg-primary/5' : 'bg-green-500/5',
          )}
        >
          <div className="text-center relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60 mb-1">
              {cheque.type === 'Outward'
                ? t('issuedAmount')
                : t('receivedAmount')}
            </p>
            <h2
              className={cn(
                'text-4xl font-semibold',
                cheque.type === 'Outward' ? 'text-primary' : 'text-green-600',
              )}
              data-testid="cheque-detail-amount"
            >
              {currency}
              {cheque.amount.toLocaleString()}
            </h2>
          </div>
          <div
            className="absolute top-4 right-4"
            data-testid="cheque-detail-status"
          >
            <StatusPill status={cheque.status} />
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('party')}
              </p>
              <div className="flex items-center gap-3">
                <EntityAvatar
                  name={cheque.party?.name || 'Party'}
                  color={cheque.party?.color}
                  icon={cheque.party?.icon}
                  imageUrl={cheque.party?.avatar_url}
                />
                <div className="flex-1 min-w-0">
                  <TextTruncate
                    text={cheque.party?.name || ''}
                    maxLength={25}
                    className="font-semibold block"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                    {t('recipientPayer')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('account')}
              </p>
              <div className="flex items-center gap-3">
                <EntityAvatar
                  name={cheque.account?.bank?.name || tc('bank')}
                  color={cheque.account?.color}
                  icon={cheque.account?.icon}
                  imageUrl={cheque.account?.bank?.logo_url}
                />
                <div className="flex-1 min-w-0 flex flex-col">
                  <TextTruncate
                    text={cheque.account?.account_name || ''}
                    maxLength={25}
                    className="font-semibold block"
                  />
                  <TextTruncate
                    text={cheque.account?.bank?.name || ''}
                    maxLength={30}
                    className="text-[10px] text-muted-foreground uppercase font-semibold block"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/5">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('chequeNumber')}
              </p>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Hash as any}
                  className="h-3 w-3 text-primary/40"
                />
                <p className="font-mono font-semibold tracking-wider">
                  {cheque.cheque_number}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('chequeDate')}
              </p>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Calendar as any}
                  className="h-3 w-3 text-primary/40"
                />
                <p className="font-semibold">
                  {new Date(cheque.cheque_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {cheque.notes && (
            <div className="space-y-2 pt-4 border-t border-primary/5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <HugeiconsIcon icon={Note as any} className="h-3 w-3" />{' '}
                {t('notes')}
              </p>
              <p className="text-sm font-semibold italic text-muted-foreground">
                {cheque.notes}
              </p>
            </div>
          )}

          <EntityTagsSection entityType="cheque" entityId={cheque.id} />

          {cheque.image_url && (
            <div className="space-y-4 pt-4 border-t border-primary/5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('scan')}
              </p>
              <PhotoProvider>
                <div className="rounded-lg overflow-hidden border relative group">
                  <PhotoView src={cheque.image_url}>
                    <div className="cursor-zoom-in relative">
                      <ChequeScanImage
                        key={cheque.image_url}
                        src={cheque.image_url}
                        alt={t('scan')}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>
                  </PhotoView>
                </div>
              </PhotoProvider>
            </div>
          )}
        </div>
      </div>

      <PrintLayoutEditor
        accountId={cheque.account_id}
        open={printLayoutOpen}
        onOpenChange={setPrintLayoutOpen}
      />
      <DeleteConfirmationDialog
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDesc')}
        confirmName={cheque.cheque_number}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={async () => {
          deleteCheque(cheque.id)
          router.replace('/cheques')
        }}
      />
      <SpeedDialFab
        editHref={`/cheques/${id}/edit`}
        editLabel={t('editDetails')}
        actions={actions}
      />
    </div>
  )
}
