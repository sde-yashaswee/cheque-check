import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChequeService } from '@/services/cheque.service'
import { ChequeStatus } from '@/types'

export function useChequeDetail(id: string) {
  const queryClient = useQueryClient()

  const { data: cheque, isLoading, error } = useQuery({
    queryKey: ['cheque', id],
    queryFn: () => ChequeService.getById(id),
  })

  const mutation = useMutation({
    mutationFn: (status: ChequeStatus) => ChequeService.updateStatus(id, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ['cheque', id] })
      const previousCheque = queryClient.getQueryData(['cheque', id])
      queryClient.setQueryData(['cheque', id], (old: any) => {
        if (!old) return old
        return { ...old, status }
      })

      if (cheque?.business_id) {
        await queryClient.cancelQueries({ queryKey: ['cheques', cheque.business_id] })
        queryClient.setQueryData(['cheques', cheque.business_id], (old: any) => {
          if (!old) return old
          return old.map((c: any) => c.id === id ? { ...c, status } : c)
        })
      }

      return { previousCheque }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cheque', id], context?.previousCheque)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cheque', id] })
      if (cheque?.business_id) {
        queryClient.invalidateQueries({ queryKey: ['cheques', cheque.business_id] })
      }
    }
  })

  const updateStatus = (status: ChequeStatus) => {
    mutation.mutate(status)
  }

  return {
    cheque,
    isLoading,
    error,
    updateStatus,
    isUpdating: mutation.isPending,
  }
}
