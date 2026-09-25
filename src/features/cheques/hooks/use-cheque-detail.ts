import { useQuery } from '@tanstack/react-query'
import { chequeService } from '@/features/cheques/services/cheque.service'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { useOptimisticMutation } from './use-optimistic-mutation'

export function useChequeDetail(id: string) {
  const {
    data: cheque,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cheque', id],
    queryFn: () => chequeService.getById(id),
  })

  const mutation = useOptimisticMutation<
    ChequeWithRelations,
    ChequeStatus,
    ChequeWithRelations
  >({
    queryKey: ['cheque', id],
    additionalQueryKeys: cheque?.business_id
      ? [['cheques', cheque.business_id]]
      : [],
    mutationFn: (status: ChequeStatus) =>
      chequeService.updateStatus(id, status),
    update: (current, status) => {
      if (!current) return current
      return { ...current, status }
    },
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
