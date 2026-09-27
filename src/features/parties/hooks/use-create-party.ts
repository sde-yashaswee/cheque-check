import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { partySchema } from '@/validators'
import { partyService } from '@/features/parties/services/party.service'
import { useEntityCreateMutation } from './use-entity-mutations'
import { useRouter } from 'next/navigation'
import type { Party, PartyDraft } from '@/types'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { getChequeDraftIdFromReturnTo } from '@/lib/cheque-draft'
import {
  chequeDraftService,
  draftKeys,
  firstIncompletePartyStep,
  partyDraftService,
  partyDraftToFormValues,
  toPartyDraftFields,
  useDraftController,
} from '@/features/drafts'

type PartyFormData = z.infer<typeof partySchema>

export function useCreateParty(
  businessId: string | undefined,
  {
    returnTo = null,
    draftId = null,
  }: { returnTo?: string | null; draftId?: string | null } = {},
) {
  const [step, setStep] = useState(1)
  const [isPublishing, setIsPublishing] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const tc = useTranslations('Common')

  const form = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      address: '',
      notes: '',
      color: '#34C759',
    },
  })

  const { trigger } = form

  const draft = useDraftController<PartyFormData, PartyDraft>({
    entity: 'party',
    businessId,
    form,
    initialDraftId: draftId,
    toFields: toPartyDraftFields,
    toFormValues: partyDraftToFormValues,
    onHydrated: (loaded) => setStep(firstIncompletePartyStep(loaded)),
    draftsHref: '/parties/drafts',
  })

  const mutation = useEntityCreateMutation<Party, PartyFormData, Party>({
    queryKey: ['parties', businessId],
    mutationFn: (data) =>
      partyService.create({
        ...data,
        business_id: businessId!,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        avatar_url: data.avatar_url || null,
      }),
    addToList: (current, newParty) => [
      ...(current || []),
      {
        ...newParty,
        email: newParty.email || null,
        address: newParty.address || null,
        notes: newParty.notes || null,
        avatar_url: newParty.avatar_url || null,
        id: 'temp-' + Date.now(),
        business_id: businessId!,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  })

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['name'])
    } else if (step === 2) {
      isValid = await trigger(['contact'])
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
    isSaving: mutation.isPending || isPublishing,
    draft,
    onSubmit: form.handleSubmit(async (data) => {
      const publishedDraftId = await draft.beginPublish()
      if (!publishedDraftId && !returnTo) {
        draft.finishPublish()
        mutation.mutate(data)
        draft.goBack()
        return
      }

      setIsPublishing(true)
      try {
        const created = publishedDraftId
          ? await partyDraftService.publish(publishedDraftId, data)
          : await mutation.mutateAsync(data)
        draft.finishPublish()
        if (publishedDraftId) {
          queryClient.invalidateQueries({ queryKey: ['parties', businessId] })
          queryClient.invalidateQueries({
            queryKey: draftKeys.list('party', businessId),
          })
        }

        if (!returnTo) {
          draft.goBack()
          return
        }
        const chequeDraftId = getChequeDraftIdFromReturnTo(returnTo)
        if (chequeDraftId) {
          await chequeDraftService.update(chequeDraftId, {
            party_id: created.id,
          })
        }
        router.replace(returnTo)
      } catch (error) {
        draft.failPublish()
        toast.add({
          title: tc('error'),
          description: error instanceof Error ? error.message : tc('error'),
          type: 'error',
        })
      } finally {
        setIsPublishing(false)
      }
    }),
  }
}
