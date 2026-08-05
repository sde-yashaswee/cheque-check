import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/validators'
import { AccountService } from '@/services/account.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useCreateAccount(businessId: string | undefined) {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const form = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      bank_id: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
      color: '#007AFF'
    }
  })

  const { trigger } = form

  const mutation = useMutation({
    mutationFn: (data: any) => AccountService.create({ ...data, business_id: businessId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] })
      router.back()
    }
  })

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['bank_id'])
    } else if (step === 2) {
      isValid = await trigger(['account_name', 'account_number'])
    }
    
    if (isValid) setStep(s => Math.min(s + 1, 3))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  return {
    form,
    step,
    setStep,
    nextStep,
    prevStep,
    isSaving: mutation.isPending,
    onSubmit: form.handleSubmit((data) => mutation.mutate(data)),
  }
}
