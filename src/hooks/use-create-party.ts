import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partySchema } from '@/validators'
import { PartyService } from '@/services/party.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useCreateParty(businessId: string | undefined) {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const form = useForm({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      address: '',
      notes: '',
      color: '#34C759'
    }
  })

  const { trigger } = form

  const mutation = useMutation({
    mutationFn: (data: any) => PartyService.create({ ...data, business_id: businessId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', businessId] })
      router.back()
    }
  })

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['name'])
    } else if (step === 2) {
      isValid = await trigger(['contact'])
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
