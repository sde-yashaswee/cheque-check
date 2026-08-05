import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { chequeSchema } from '@/validators'
import { ChequeService } from '@/services/cheque.service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

type ChequeFormData = z.infer<typeof chequeSchema>

export function useEditCheque(id: string) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { data: cheque, isLoading, error } = useQuery({
    queryKey: ['cheque', id],
    queryFn: () => ChequeService.getById(id),
  })

  const form = useForm<ChequeFormData>({
    resolver: zodResolver(chequeSchema) as any,
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
    }
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

  const updateMutation = useMutation({
    mutationFn: (data: ChequeFormData) => ChequeService.update(id, data),
    onSuccess: () => {
      if (cheque?.business_id) {
        queryClient.invalidateQueries({ queryKey: ['cheques', cheque.business_id] })
      }
      queryClient.invalidateQueries({ queryKey: ['cheque', id] })
      router.back()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => ChequeService.delete(id),
    onSuccess: () => {
      if (cheque?.business_id) {
        queryClient.invalidateQueries({ queryKey: ['cheques', cheque.business_id] })
      }
      router.push('/cheques')
    }
  })

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data)
  })

  return {
    form,
    cheque,
    isLoading,
    error,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    onSubmit,
    onDelete: () => deleteMutation.mutate(),
  }
}
