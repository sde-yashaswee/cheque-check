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
    onMutate: async (newParty: any) => {
      await queryClient.cancelQueries({ queryKey: ['parties', businessId] })
      const previousParties = queryClient.getQueryData(['parties', businessId])
      queryClient.setQueryData(['parties', businessId], (old: any[]) => {
        const optimisticParty = {
          ...newParty,
          id: 'temp-' + Date.now(),
          business_id: businessId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return old ? [...old, optimisticParty] : [optimisticParty]
      })
      return { previousParties }
    },
    onError: (err, newParty, context: any) => {
      queryClient.setQueryData(['parties', businessId], context?.previousParties)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', businessId] })
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
    onSubmit: form.handleSubmit((data) => {
      mutation.mutate(data)
      router.back()
    }),
  }
}
