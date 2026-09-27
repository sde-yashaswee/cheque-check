import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { accountSchema } from '@/validators'
import { accountService } from '@/features/accounts/services/account.service'
import { useEntityCreateMutation } from './use-entity-mutations'
import { useRouter } from 'next/navigation'
import type { Account } from '@/types'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { withSelectedEntity } from '@/lib/cheque-draft'

type AccountFormData = z.infer<typeof accountSchema>

export function useCreateAccount(
  businessId: string | undefined,
  returnTo?: string | null,
) {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const tc = useTranslations('Common')

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      bank_id: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
      color: '#007AFF',
      notes: '',
    },
  })

  const { trigger } = form

  const mutation = useEntityCreateMutation<Account, AccountFormData, Account>({
    queryKey: ['accounts', businessId],
    mutationFn: (data) =>
      accountService.create({
        ...data,
        business_id: businessId!,
        ifsc_code: data.ifsc_code || null,
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
    isSaving: mutation.isPending,
    onSubmit: form.handleSubmit(async (data) => {
      if (!returnTo) {
        mutation.mutate(data)
        router.back()
        return
      }
      // The cheque flow needs the real id, so wait for the server response.
      try {
        const created = await mutation.mutateAsync(data)
        router.replace(withSelectedEntity(returnTo, 'account_id', created.id))
      } catch (error) {
        toast.add({
          title: tc('error'),
          description: error instanceof Error ? error.message : tc('error'),
          type: 'error',
        })
      }
    }),
  }
}
