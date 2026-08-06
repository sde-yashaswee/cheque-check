import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { chequeSchema } from '@/validators'
import { ChequeService } from '@/services/cheque.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { StorageService } from '@/services/storage.service'

export function useCreateCheque(businessId: string | undefined, initialType: string | null) {
  const [step, setStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      amount: 0,
      cheque_number: '',
      cheque_date: new Date().toISOString().split('T')[0],
      party_id: '',
      account_id: '',
      type: (initialType === 'Inward' ? 'Inward' : 'Outward') as 'Outward' | 'Inward',
      notes: '',
      image_url: null as string | null,
      deposit_date: '',
    }
  })

  const { setValue, trigger } = form

  useEffect(() => {
    if (initialType === 'Inward' || initialType === 'Outward') {
      setValue('type', initialType as any)
    }
  }, [initialType, setValue])

  const mutation = useMutation({
    mutationFn: (data: any) => ChequeService.create({ ...data, business_id: businessId }),
    onMutate: async (newCheque: any) => {
      // Stop any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['cheques', businessId] })

      // Snapshot the previous value
      const prev = queryClient.getQueryData(['cheques', businessId])

      // Optimistically update to the new value
      queryClient.setQueryData(['cheques', businessId], (old: any[]) => {
        const optimisticCheque = {
          ...newCheque,
          id: 'temp-' + Date.now(),
          business_id: businessId,
          status: newCheque.type === 'Inward' ? 'Received' : 'Issued',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // We try to find party name for the list display
          party: queryClient.getQueryData<any[]>(['parties', businessId])?.find(p => p.id === newCheque.party_id)
        }
        return old ? [optimisticCheque, ...old] : [optimisticCheque]
      })

      // Return a context object with the snapshotted value
      return { previousCheques: prev }
    },
    onError: (err, newCheque, context: any) => {
      queryClient.setQueryData(['cheques', businessId], context?.previousCheques)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const url = await StorageService.uploadChequeImage(file)
      setValue('image_url', url)
    } catch (error) {
      alert("Upload failed: "+ (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsUploading(false)
    }
  }

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['amount', 'cheque_number', 'cheque_date'])
    } else if (step === 2) {
      isValid = await trigger(['party_id', 'account_id'])
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
    isUploading,
    handleImageUpload,
    isSaving: mutation.isPending,
    onSubmit: form.handleSubmit((data) => {
      mutation.mutate(data)
      router.push('/cheques')
    }),
  }
}
