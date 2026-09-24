import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { chequeSchema } from '@/validators'
import { chequeService } from '@/services/cheque.service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

type ChequeFormData = z.infer<typeof chequeSchema>

export function useEditCheque(id: string) {
  const router = useRouter()
  const queryClient = useQueryClient()

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

  const updateMutation = useMutation({
    mutationFn: (data: ChequeFormData) => chequeService.update(id, data),
    onMutate: async (newCheque) => {
      const businessId = cheque?.business_id
      if (businessId) {
        await queryClient.cancelQueries({ queryKey: ['cheques', businessId] })
        const prev = queryClient.getQueryData(['cheques', businessId])
        queryClient.setQueryData(['cheques', businessId], (old: any[]) => {
          if (!old) return old
          return old.map((c) => (c.id === id ? { ...c, ...newCheque } : c))
        })
        return { previousCheques: prev }
      }
    },
    onError: (err, newCheque, context: any) => {
      const businessId = cheque?.business_id
      if (businessId && context?.previousCheques) {
        queryClient.setQueryData(
          ['cheques', businessId],
          context.previousCheques,
        )
      }
    },
    onSettled: () => {
      if (cheque?.business_id) {
        queryClient.invalidateQueries({
          queryKey: ['cheques', cheque.business_id],
        })
      }
      queryClient.invalidateQueries({ queryKey: ['cheque', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => chequeService.delete(id),
    onMutate: async () => {
      const businessId = cheque?.business_id
      if (businessId) {
        await queryClient.cancelQueries({ queryKey: ['cheques', businessId] })
        const prev = queryClient.getQueryData(['cheques', businessId])
        queryClient.setQueryData(['cheques', businessId], (old: any[]) => {
          if (!old) return old
          return old.filter((c) => c.id !== id)
        })
        return { previousCheques: prev }
      }
    },
    onError: (err, variables, context: any) => {
      const businessId = cheque?.business_id
      if (businessId && context?.previousCheques) {
        queryClient.setQueryData(
          ['cheques', businessId],
          context.previousCheques,
        )
      }
    },
    onSettled: () => {
      if (cheque?.business_id) {
        queryClient.invalidateQueries({
          queryKey: ['cheques', cheque.business_id],
        })
      }
    },
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
