import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { chequeSchema } from '@/validators'
import { chequeService } from '@/services/cheque.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useOptimisticMutation } from './use-optimistic-mutation'

type ChequeFormData = z.infer<typeof chequeSchema>

export function useEditCheque(id: string) {
  const router = useRouter()

  const {
    data: cheque,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cheque', id],
    queryFn: () => chequeService.getById(id),
  })

  const form = useForm<ChequeFormData>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      cheque_number: '',
      amount: 0,
      cheque_date: new Date().toISOString().split('T')[0],
      deposit_date: '',
      party_id: '',
      account_id: '',
      type: 'Outward',
      notes: '',
      image_url: null,
    },
  })

  const { reset } = form

  useEffect(() => {
    if (cheque) {
      reset({
        cheque_number: cheque.cheque_number,
        amount: cheque.amount,
        cheque_date: cheque.cheque_date,
        deposit_date: cheque.deposit_date || '',
        party_id: cheque.party_id,
        account_id: cheque.account_id,
        type: cheque.type,
        notes: cheque.notes || '',
        image_url: cheque.image_url || null,
      })
    }
  }, [cheque, reset])

  const updateMutation = useOptimisticMutation<any[], ChequeFormData, any>({
    queryKey: ['cheques', cheque?.business_id],
    additionalQueryKeys: [['cheque', id]],
    mutationFn: (data: ChequeFormData) => chequeService.update(id, data),
    update: (current, newCheque) =>
      current?.map((cachedCheque) =>
        cachedCheque.id === id
          ? { ...cachedCheque, ...newCheque }
          : cachedCheque,
      ),
  })

  const deleteMutation = useOptimisticMutation<any[], void, void>({
    queryKey: ['cheques', cheque?.business_id],
    additionalQueryKeys: [['cheque', id]],
    mutationFn: () => chequeService.delete(id),
    update: (current) =>
      current?.filter((cachedCheque) => cachedCheque.id !== id),
  })

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data)
    router.back()
  })

  return {
    form,
    cheque,
    isLoading,
    error,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    onSubmit,
    onDelete: () => {
      deleteMutation.mutate()
      router.push('/cheques')
    },
  }
}
