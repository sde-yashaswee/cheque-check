import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { chequeSchema } from '@/validators'
import { ChequeService } from '@/services/cheque.service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useEditCheque(id: string) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { data: cheque, isLoading, error } = useQuery({
    queryKey: ['cheque', id],
    queryFn: () => ChequeService.getById(id),
  })

  const form = useForm<z.infer<typeof chequeSchema>>({
    resolver: zodResolver(chequeSchema),
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
    mutationFn: (data: z.infer<typeof chequeSchema>) => ChequeService.update(id, data),
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

  return {
    form,
    cheque,
    isLoading,
    error,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    onSubmit: form.handleSubmit((data) => updateMutation.mutate(data)),
    onDelete: () => deleteMutation.mutate(),
  }
}
