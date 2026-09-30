import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { accountSchema } from '@/validators'
import { accountService } from '@/features/accounts/services/account.service'
import { useEntityCreateMutation } from './use-entity-mutations'
import { useRouter } from 'next/navigation'
import type { Account, AccountDraft } from '@/types'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { getChequeDraftIdFromReturnTo } from '@/lib/cheque-draft'
import {
  accountDraftService,
  accountDraftToFormValues,
  chequeDraftService,
  draftKeys,
  firstIncompleteAccountStep,
  toAccountDraftFields,
  useDraftController,
} from '@/features/drafts'

type AccountFormInput = z.input<typeof accountSchema>
type AccountFormData = z.output<typeof accountSchema>

export function useCreateAccount(
  businessId: string | undefined,
  {
    returnTo = null,
    draftId = null,
    onCreated,
  }: {
    returnTo?: string | null
    draftId?: string | null
    onCreated?: (account: Account) => void | Promise<void>
  } = {},
) {
  const [step, setStep] = useState(1)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successRedirect, setSuccessRedirect] = useState<string | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()
  const tc = useTranslations('Common')

  const form = useForm<AccountFormInput, unknown, AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      bank_id: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
      color: '#007AFF',
      notes: '',
      opening_balance: 0,
      is_default: false,
    },
  })

  const { trigger } = form

  const draft = useDraftController<AccountFormInput, AccountDraft>({
    entity: 'account',
    businessId,
    form,
    initialDraftId: draftId,
    toFields: toAccountDraftFields,
    toFormValues: accountDraftToFormValues,
    onHydrated: (loaded) => setStep(firstIncompleteAccountStep(loaded)),
    draftsHref: '/accounts/drafts',
  })

  const mutation = useEntityCreateMutation<Account, AccountFormData, Account>({
    queryKey: ['accounts', businessId],
    mutationFn: (data) =>
      accountService.create({
        ...data,
        business_id: businessId!,
        ifsc_code: data.ifsc_code || null,
        opening_balance: data.opening_balance,
      }),
    addToList: (current, newAccount) => [
      ...(current || []),
      {
        ...newAccount,
        ifsc_code: newAccount.ifsc_code || null,
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
      isValid = await trigger(['bank_id'])
    } else if (step === 2) {
      isValid = await trigger(['account_name', 'account_number'])
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
    isSuccess,
    continueAfterSuccess: () =>
      successRedirect ? router.replace(successRedirect) : draft.goBack(),
    onSubmit: form.handleSubmit(async (data) => {
      const publishedDraftId = await draft.beginPublish()
      if (!publishedDraftId && !returnTo) {
        draft.finishPublish()
        const created = await mutation.mutateAsync(data)
        await onCreated?.(created)
        setSuccessRedirect(null)
        setIsSuccess(true)
        return
      }

      setIsPublishing(true)
      try {
        const created = publishedDraftId
          ? await accountDraftService.publish(publishedDraftId, data)
          : await mutation.mutateAsync(data)
        draft.finishPublish()
        await onCreated?.(created)
        if (publishedDraftId) {
          queryClient.invalidateQueries({ queryKey: ['accounts', businessId] })
          queryClient.invalidateQueries({
            queryKey: draftKeys.list('account', businessId),
          })
        }

        if (!returnTo) {
          setSuccessRedirect(null)
          setIsSuccess(true)
          return
        }
        const chequeDraftId = getChequeDraftIdFromReturnTo(returnTo)
        if (chequeDraftId) {
          await chequeDraftService.update(chequeDraftId, {
            account_id: created.id,
          })
        }
        setSuccessRedirect(returnTo)
        setIsSuccess(true)
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
