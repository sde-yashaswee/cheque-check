import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessSchema } from '@/validators'
import { BusinessService } from '@/services/business.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'

export function useCreateBusiness() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setActiveBusiness } = useBusiness()
  
  const form = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      color: '#007AFF'
    }
  })

  const { trigger } = form

  const mutation = useMutation({
    mutationFn: (data: any) => BusinessService.create(data),
    onSuccess: (newBusiness) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      setActiveBusiness(newBusiness)
      router.push('/businesses')
    }
  })

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['name'])
    } else if (step === 2) {
      isValid = await trigger(['email'])
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
