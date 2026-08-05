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
    onSuccess: () => {
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
