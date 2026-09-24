import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { businessSchema } from '@/validators'
import { businessService } from '@/services/business.service'
import { useEntityCreateMutation } from './use-entity-mutations'
import { useRouter } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import type { Business } from '@/types'

type BusinessFormData = z.infer<typeof businessSchema>

export function useCreateBusiness() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { setActiveBusiness } = useBusiness()

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      color: '#007AFF',
    },
  })

  const { trigger } = form

  const mutation = useEntityCreateMutation<
    Business,
    BusinessFormData,
    Business
  >({
    queryKey: ['businesses'],
    mutationFn: (data) =>
      businessService.create({
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        logo_url: data.logo_url || null,
      }),
    addToList: (current, newBusiness) => [
      ...(current || []),
      {
        ...newBusiness,
        user_id: '',
        email: newBusiness.email || null,
        phone: newBusiness.phone || null,
        address: newBusiness.address || null,
        logo_url: newBusiness.logo_url || null,
        id: 'temp-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    onSuccess: (newBusiness) => {
      if (newBusiness) setActiveBusiness(newBusiness)
    },
  })

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['name'])
    } else if (step === 2) {
      isValid = await trigger(['email'])
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
      router.push('/businesses')
    }),
  }
}
