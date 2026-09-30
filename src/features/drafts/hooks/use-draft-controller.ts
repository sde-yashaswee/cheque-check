import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import { toast } from '@/components/ui/toast'
import type { DraftEntity } from '../lib/draft-fields'
import { useDraft } from './use-drafts'
import { useDraftAutosave } from './use-draft-autosave'
import { useLeaveGuard } from './use-leave-guard'

interface UseDraftControllerOptions<TValues extends FieldValues, TDraft> {
  entity: DraftEntity
  businessId: string | undefined
  form: UseFormReturn<TValues>
  initialDraftId: string | null
  toFields: (values: Record<string, unknown>) => object
  toFormValues: (draft: TDraft) => DefaultValues<TValues>
  onHydrated?: (draft: TDraft) => void
  draftsHref: string
}

export function useDraftController<TValues extends FieldValues, TDraft>({
  entity,
  businessId,
  form,
  initialDraftId,
  toFields,
  toFormValues,
  onHydrated,
  draftsHref,
}: UseDraftControllerOptions<TValues, TDraft>) {
  const t = useTranslations('Drafts')
  const tc = useTranslations('Common')
  const router = useRouter()
  const [published, setPublished] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const autosave = useDraftAutosave({
    entity,
    businessId,
    form,
    toFields,
    initialDraftId,
  })
  const guard = useLeaveGuard(autosave.hasUserChanges && !published)

  const draftQuery = useDraft(entity, loadFailed ? null : initialDraftId)
  const hydratedIdRef = useRef<string | null>(null)
  const hydrationRef = useRef({ toFormValues, onHydrated })
  useEffect(() => {
    hydrationRef.current = { toFormValues, onHydrated }
  })

  useEffect(() => {
    const draft = draftQuery.data as (TDraft & { id: string }) | undefined
    // Wait for a fresh fetch so edits made elsewhere (e.g. a newly selected party) are included.
    if (!draft || !draftQuery.isFetchedAfterMount) return
    if (hydratedIdRef.current === draft.id) return
    hydratedIdRef.current = draft.id
    form.reset(hydrationRef.current.toFormValues(draft))
    hydrationRef.current.onHydrated?.(draft)
  }, [draftQuery.data, draftQuery.isFetchedAfterMount, form])

  // A published or deleted draft (e.g. reached via history) just starts a fresh form.
  const { forget } = autosave
  useEffect(() => {
    if (!draftQuery.isError || !initialDraftId) return
    const url = new URL(window.location.href)
    url.searchParams.delete('draftId')
    window.history.replaceState(null, '', url)
    forget()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadFailed(true)
  }, [draftQuery.isError, forget, initialDraftId])

  const notifySaveFailed = useCallback(() => {
    toast.add({
      title: tc('error'),
      description: t('saveFailed'),
      type: 'error',
    })
  }, [t, tc])

  const saveDraftAndExit = useCallback(async () => {
    try {
      await autosave.save()
    } catch {
      notifySaveFailed()
      return
    }
    toast.add({ title: t('saved'), type: 'success' })
    setPublished(true)
    guard.bypass(() => router.push(draftsHref))
  }, [autosave, draftsHref, guard, notifySaveFailed, router, t])

  // Saves in place without leaving the page (used by the draft-save FAB).
  const saveDraft = useCallback(async () => {
    try {
      await autosave.save()
    } catch {
      notifySaveFailed()
    }
  }, [autosave, notifySaveFailed])

  const navigateAfterSave = useCallback(
    async (buildHref: (draftId: string | null) => string) => {
      let id: string | null
      try {
        id = await autosave.save()
      } catch {
        notifySaveFailed()
        return
      }
      guard.bypass(() => router.push(buildHref(id)))
    },
    [autosave, guard, notifySaveFailed, router],
  )

  const leaveDialogProps = {
    open: guard.isLeavePending,
    onSave: async () => {
      try {
        await autosave.save()
      } catch {
        notifySaveFailed()
        return
      }
      guard.confirmLeave()
    },
    onDiscard: async () => {
      await autosave.discard()
      guard.confirmLeave()
    },
    onCancel: guard.cancelLeave,
  }

  const beginPublish = autosave.stop
  const finishPublish = useCallback(() => setPublished(true), [])
  const { resume } = autosave
  const failPublish = useCallback(() => {
    setPublished(false)
    resume()
  }, [resume])

  return {
    draftId: autosave.draftId,
    status: autosave.status,
    hasUserChanges: autosave.hasUserChanges,
    isLoadingDraft: !!initialDraftId && !loadFailed && draftQuery.isLoading,
    setUserValue: autosave.setUserValue,
    saveDraft,
    saveDraftAndExit,
    navigateAfterSave,
    leaveDialogProps,
    beginPublish,
    finishPublish,
    failPublish,
    goBack: guard.goBack,
  }
}

export type DraftController = ReturnType<typeof useDraftController>
