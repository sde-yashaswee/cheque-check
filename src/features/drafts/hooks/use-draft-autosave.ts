import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from 'react-hook-form'
import { logger } from '@/lib/logger'
import type { DraftEntity } from '../lib/draft-fields'
import { draftKeys, draftServices } from './use-drafts'

export type DraftSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseDraftAutosaveOptions<TValues extends FieldValues> {
  entity: DraftEntity
  businessId: string | undefined
  form: UseFormReturn<TValues>
  toFields: (values: Record<string, unknown>) => object
  initialDraftId: string | null
  debounceMs?: number
}

function writeDraftIdToUrl(id: string | null) {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('draftId', id)
  else url.searchParams.delete('draftId')
  window.history.replaceState(null, '', url)
}

export function useDraftAutosave<TValues extends FieldValues>({
  entity,
  businessId,
  form,
  toFields,
  initialDraftId,
  debounceMs = 1500,
}: UseDraftAutosaveOptions<TValues>) {
  const queryClient = useQueryClient()
  const [draftId, setDraftId] = useState(initialDraftId)
  const [status, setStatus] = useState<DraftSaveStatus>('idle')
  const [hasUserChanges, setHasUserChanges] = useState(false)

  const draftIdRef = useRef(initialDraftId)
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stoppedRef = useRef(false)
  const optionsRef = useRef({ businessId, toFields })
  useEffect(() => {
    optionsRef.current = { businessId, toFields }
  })

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const save = useCallback((): Promise<string | null> => {
    clearTimer()
    const run = queueRef.current.then(async () => {
      const { businessId: currentBusinessId, toFields: convert } =
        optionsRef.current
      if (stoppedRef.current || !currentBusinessId) return draftIdRef.current

      setStatus('saving')
      const fields = convert(form.getValues() as Record<string, unknown>)
      const service = draftServices[entity]
      try {
        const saved = draftIdRef.current
          ? await service.update(draftIdRef.current, fields)
          : await service.create(currentBusinessId, fields)

        if (!draftIdRef.current) {
          draftIdRef.current = saved.id
          setDraftId(saved.id)
          writeDraftIdToUrl(saved.id)
        }
        queryClient.setQueryData(draftKeys.detail(entity, saved.id), saved)
        queryClient.invalidateQueries({
          queryKey: draftKeys.list(entity, currentBusinessId),
        })
        setStatus('saved')
        return saved.id
      } catch (error) {
        logger.error('Draft autosave failed', error)
        setStatus('error')
        throw error
      }
    })
    queueRef.current = run.catch(() => undefined)
    return run
  }, [entity, form, queryClient])

  const scheduleSave = useCallback(() => {
    if (stoppedRef.current) return
    setHasUserChanges(true)
    clearTimer()
    timerRef.current = setTimeout(() => {
      save().catch(() => undefined)
    }, debounceMs)
  }, [debounceMs, save])

  // Only typed input counts; OCR prefill and form.reset use setValue/reset and are ignored.
  useEffect(() => {
    const subscription = form.watch((_values, info) => {
      if (info.type === 'change') scheduleSave()
    })
    return () => subscription.unsubscribe()
  }, [form, scheduleSave])

  useEffect(() => clearTimer, [])

  const setUserValue = useCallback(
    <TName extends Path<TValues>>(
      name: TName,
      value: PathValue<TValues, TName>,
    ) => {
      form.setValue(name, value, { shouldDirty: true })
      scheduleSave()
    },
    [form, scheduleSave],
  )

  const discard = useCallback(async () => {
    clearTimer()
    stoppedRef.current = true
    await queueRef.current
    const id = draftIdRef.current
    if (!id) return
    await draftServices[entity].delete(id)
    draftIdRef.current = null
    setDraftId(null)
    writeDraftIdToUrl(null)
    queryClient.removeQueries({ queryKey: draftKeys.detail(entity, id) })
    queryClient.invalidateQueries({
      queryKey: draftKeys.list(entity, optionsRef.current.businessId),
    })
  }, [entity, queryClient])

  // Waits for in-flight saves, then prevents further autosaves (used before publishing).
  const stop = useCallback(async () => {
    clearTimer()
    await queueRef.current
    stoppedRef.current = true
    return draftIdRef.current
  }, [])

  const resume = useCallback(() => {
    stoppedRef.current = false
  }, [])

  // Forget a draft that no longer exists so the next save creates a fresh one.
  const forget = useCallback(() => {
    draftIdRef.current = null
    setDraftId(null)
  }, [])

  return {
    draftId,
    status,
    hasUserChanges,
    setUserValue,
    save,
    discard,
    stop,
    resume,
    forget,
  }
}
