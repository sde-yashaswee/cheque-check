import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { chequeSchema } from '@/validators'
import { chequeService } from '@/features/cheques/services/cheque.service'
import { useRouter } from 'next/navigation'
import { storageService } from '@/services/storage.service'
import { z } from 'zod'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { Party, type ChequeDraft } from '@/types'
import { Cheque as ChequeEntity } from '@/domain/cheque.entity'
import { useProfile } from './use-profile'
import { ConflictError } from '@/lib/errors'
import { queueCelebration } from '@/lib/celebrate'
import { useEntityCreateMutation } from './use-entity-mutations'
import { useQueryClient } from '@tanstack/react-query'
import {
  chequeDraftService,
  chequeDraftToFormValues,
  draftKeys,
  firstIncompleteChequeStep,
  toChequeDraftFields,
  useDraftController,
} from '@/features/drafts'
import { buildNotifyPartyAction } from '@/features/cheques/lib/notify-party'

type ChequeFormValues = z.infer<typeof chequeSchema>

const optimisticId = () => `temp-${Date.now()}`

export function useCreateCheque(
  businessId: string | undefined,
  initialType: string | null,
  {
    draftId = null,
    onCreated,
  }: {
    draftId?: string | null
    onCreated?: (cheque: ChequeEntity) => void | Promise<void>
  } = {},
) {
  const [step, setStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Cheques')
  const tc = useTranslations('Common')
  const { profile } = useProfile()

  const form = useForm<ChequeFormValues>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      amount: 0,
      cheque_number: '',
      cheque_date: new Date().toISOString().split('T')[0],
      party_id: '',
      account_id: '',
      type: initialType === 'Inward' ? 'Inward' : 'Outward',
      notes: '',
      image_url: null,
      deposit_date: '',
    },
  })

  const { setValue, trigger } = form

  const draft = useDraftController<ChequeFormValues, ChequeDraft>({
    entity: 'cheque',
    businessId,
    form,
    initialDraftId: draftId,
    toFields: toChequeDraftFields,
    toFormValues: chequeDraftToFormValues,
    onHydrated: (loaded) => setStep(firstIncompleteChequeStep(loaded)),
    draftsHref: '/cheques/drafts',
  })

  useEffect(() => {
    if (initialType === 'Inward' || initialType === 'Outward') {
      setValue('type', initialType)
    }
  }, [initialType, setValue])

  const mutation = useEntityCreateMutation<
    ChequeEntity,
    ChequeFormValues,
    ChequeEntity
  >({
    queryKey: businessId ? ['cheques', businessId] : ['cheques'],
    mutationFn: (data: ChequeFormValues) => {
      if (!businessId)
        throw new Error('Select a business before creating a cheque')

      return chequeService.create({
        ...data,
        business_id: businessId,
        image_url: data.image_url ?? null,
        notes: data.notes || null,
        remind_before_days: profile?.default_reminder_days ?? null,
        status: ChequeEntity.initialStatusFor(data.type),
      })
    },
    addToList: (current, newCheque) => {
      if (!businessId) return current

      const optimisticCheque = ChequeEntity.fromRow({
        ...newCheque,
        id: optimisticId(),
        business_id: businessId,
        image_url: newCheque.image_url ?? null,
        notes: newCheque.notes || null,
        remind_before_days: profile?.default_reminder_days ?? null,
        status: ChequeEntity.initialStatusFor(newCheque.type),
        voice_call_sent: false,
        last_call_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        party: queryClient
          .getQueryData<Party[]>(['parties', businessId])
          ?.find((party) => party.id === newCheque.party_id),
      })
      return current ? [optimisticCheque, ...current] : [optimisticCheque]
    },
    onSuccess: async (created) => {
      await onCreated?.(created)
      const actionProps = await buildNotifyPartyAction(
        created,
        profile?.currency || '₹',
        t('notifyParty'),
      )
      toast.add({
        title: tc('success'),
        description: t('chequeCreated'),
        type: 'success',
        actionProps,
      })
      celebrateCheque(created)
      setIsSuccess(true)
    },
    onError: (error) => {
      draft.failPublish()
      showCreateError(error)
    },
  })

  function celebrateCheque(cheque: ChequeEntity | undefined) {
    queueCelebration({
      target: '/cheques',
      cheque: cheque && businessId ? { id: cheque.id, businessId } : undefined,
    })
  }

  function showCreateError(error: unknown) {
    if (error instanceof ConflictError) {
      toast.add({
        title: tc('error'),
        description: t('duplicateChequeError'),
        type: 'error',
      })
      return
    }
    toast.add({
      title: tc('error'),
      description: error instanceof Error ? error.message : tc('error'),
      type: 'error',
    })
  }

  const publishDraft = async (id: string, data: ChequeFormValues) => {
    setIsPublishing(true)
    try {
      const published = await chequeDraftService.publish(
        id,
        data,
        profile?.default_reminder_days ?? null,
      )
      draft.finishPublish()
      await onCreated?.(published)
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
      queryClient.invalidateQueries({
        queryKey: draftKeys.list('cheque', businessId),
      })
      const actionProps = await buildNotifyPartyAction(
        published,
        profile?.currency || '₹',
        t('notifyParty'),
      )
      toast.add({
        title: tc('success'),
        description: t('chequeCreated'),
        type: 'success',
        actionProps,
      })
      celebrateCheque(published)
      setIsSuccess(true)
    } catch (error) {
      draft.failPublish()
      showCreateError(error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const url = await storageService.uploadChequeImage(file)
      setValue('image_url', url)
      return url
    } catch (error) {
      alert(
        'Upload failed: ' +
          (error instanceof Error ? error.message : String(error)),
      )
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['amount', 'cheque_number'])
    } else if (step === 2) {
      isValid = await trigger(['party_id', 'account_id'])
    }

    if (isValid) setStep((s) => Math.min(s + 1, 3))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  return {
    form,
    step,
    setStep,
    nextStep,
    prevStep,
    isUploading,
    handleImageUpload,
    isSaving: mutation.isPending || isPublishing,
    isSuccess,
    continueAfterSuccess: () => router.push('/cheques'),
    draft,
    onSubmit: form.handleSubmit(async (data) => {
      const publishedDraftId = await draft.beginPublish()
      if (publishedDraftId) {
        await publishDraft(publishedDraftId, data)
        return
      }
      draft.finishPublish()
      await mutation.mutateAsync(data)
    }),
  }
}
