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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
      router.push('/cheques')
    }
  })

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const url = await StorageService.uploadChequeImage(file)
      setValue('image_url', url)
    } catch (error: any) {
      alert("Upload failed: " + error.message)
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
    onSubmit: form.handleSubmit((data) => mutation.mutate(data)),
  }
}
