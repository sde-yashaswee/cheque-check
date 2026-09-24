import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { chequeSchema } from '@/validators'
import { chequeService } from '@/services/cheque.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { StorageService } from '@/services/storage.service'
import { z } from 'zod'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { ChequeWithRelations, Party } from '@/types'
import { getInitialChequeStatus } from '@/lib/cheque-state'
import { useProfile } from './use-profile'
import { ConflictError } from '@/lib/errors'

type ChequeFormValues = z.infer<typeof chequeSchema>

export function useCreateCheque(
  businessId: string | undefined,
  initialType: string | null,
) {
  const [step, setStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('Cheques')
  const tc = useTranslations('Common')
  const { profile } = useProfile()

  const form = useForm<ChequeFormValues>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      amount: 0,
      cheque_number: '',
      cheque_date: new Date().toISOString().split('T')[0],
      party_id: '',
      account_id: '',
      type: initialType === 'Inward' ? 'Inward' : 'Outward',
      notes: '',
      image_url: null,
      deposit_date: '',
    },
  })

  const { setValue, trigger } = form

  useEffect(() => {
    if (initialType === 'Inward' || initialType === 'Outward') {
      setValue('type', initialType)
    }
  }, [initialType, setValue])

  const mutation = useMutation({
    mutationFn: (data: ChequeFormValues) => {
      if (!businessId)
        throw new Error('Select a business before creating a cheque')

      return chequeService.create({
        ...data,
        business_id: businessId,
        image_url: data.image_url ?? null,
        notes: data.notes || null,
        remind_before_days: profile?.default_reminder_days ?? null,
        status: getInitialChequeStatus(data.type),
      })
    },
    onMutate: async (newCheque) => {
      if (!businessId)
        throw new Error('Select a business before creating a cheque')

      // Stop any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['cheques', businessId] })

      // Snapshot the previous value
      const prev = queryClient.getQueryData<ChequeWithRelations[]>([
        'cheques',
        businessId,
      ])

      // Optimistically update to the new value
      queryClient.setQueryData<ChequeWithRelations[]>(
        ['cheques', businessId],
        (old) => {
          const optimisticCheque: ChequeWithRelations = {
            ...newCheque,
            id: 'temp-' + Date.now(),
            business_id: businessId,
            image_url: newCheque.image_url ?? null,
            notes: newCheque.notes || null,
            remind_before_days: profile?.default_reminder_days ?? null,
            status: getInitialChequeStatus(newCheque.type),
            voice_call_sent: false,
            last_call_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            party: queryClient
              .getQueryData<Party[]>(['parties', businessId])
              ?.find((party) => party.id === newCheque.party_id),
          }
          return old ? [optimisticCheque, ...old] : [optimisticCheque]
        },
      )

      // Return a context object with the snapshotted value
      return { previousCheques: prev }
    },
    onSuccess: () => {
      toast.add({
        title: tc('success'),
        description: t('chequeCreated'),
        type: 'success',
      })
      router.push('/cheques')
    },
    onError: (error, _newCheque, context) => {
      queryClient.setQueryData(
        ['cheques', businessId],
        context?.previousCheques,
      )

      const errorMessage = error instanceof Error ? error.message : tc('error')

      if (error instanceof ConflictError) {
        toast.add({
          title: tc('error'),
          description: t('duplicateChequeError'),
          type: 'error',
        })
      } else {
        toast.add({
          title: tc('error'),
          description: errorMessage,
          type: 'error',
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    },
  })

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const url = await StorageService.uploadChequeImage(file)
      setValue('image_url', url)
      return url
    } catch (error) {
      alert(
        'Upload failed: ' +
          (error instanceof Error ? error.message : String(error)),
      )
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['amount', 'cheque_number'])
    } else if (step === 2) {
      isValid = await trigger(['party_id', 'account_id'])
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
    isUploading,
    handleImageUpload,
    isSaving: mutation.isPending,
    onSubmit: form.handleSubmit((data) => {
      mutation.mutate(data)
    }),
  }
}
