import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { accountSchema } from '@/validators'
import { accountService } from '@/services/account.service'
import { useOptimisticMutation } from './use-optimistic-mutation'
import { useRouter } from 'next/navigation'
import type { Account } from '@/types'

type AccountFormData = z.infer<typeof accountSchema>

export function useCreateAccount(businessId: string | undefined) {
  const [step, setStep] = useState(1)
  const router = useRouter()

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

  const mutation = useOptimisticMutation<Account[], AccountFormData, Account>({
    queryKey: ['accounts', businessId],
    mutationFn: (data) =>
      accountService.create({
        ...data,
        business_id: businessId!,
        ifsc_code: data.ifsc_code || null,
      }),
    update: (current, newAccount) => [
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
    onSubmit: form.handleSubmit((data) => {
      mutation.mutate(data)
      router.back()
    }),
  }
}
