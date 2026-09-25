import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { partySchema } from '@/validators'
import { partyService } from '@/features/parties/services/party.service'
import { useEntityCreateMutation } from './use-entity-mutations'
import { useRouter } from 'next/navigation'
import type { Party } from '@/types'

type PartyFormData = z.infer<typeof partySchema>

export function useCreateParty(businessId: string | undefined) {
  const [step, setStep] = useState(1)
  const router = useRouter()

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
    isSaving: mutation.isPending,
    onSubmit: form.handleSubmit((data) => {
      mutation.mutate(data)
      router.back()
    }),
  }
}
