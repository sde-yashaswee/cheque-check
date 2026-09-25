import { chequeService } from '@/features/cheques/services/cheque.service'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { useBusiness } from './use-business'
import { useOptimisticMutation } from './use-optimistic-mutation'

export function useChequeActions() {
  const { activeBusiness } = useBusiness()

  const updateStatusMutation = useOptimisticMutation<
    ChequeWithRelations[],
    { id: string; status: ChequeStatus },
    ChequeWithRelations
  >({
    queryKey: activeBusiness?.id ? ['cheques', activeBusiness.id] : ['cheques'],
    additionalMutations: [
      {
        queryKey: ({ id }) => ['cheque', id],
        update: (current, { id, status }) => {
          if (!current || current.id !== id) return current
          return { ...current, status }
        },
      },
    ],
    mutationFn: ({ id, status }) => chequeService.updateStatus(id, status),
    update: (current, { id, status }) => {
      if (!current) return current
      return current.map((cheque) =>
        cheque.id === id ? { ...cheque, status } : cheque,
      )
    },
  })

  const deleteMutation = useOptimisticMutation<
    ChequeWithRelations[],
    string,
    void
  >({
    queryKey: activeBusiness?.id ? ['cheques', activeBusiness.id] : ['cheques'],
    mutationFn: (id: string) => chequeService.delete(id),
    update: (current, id) => {
      if (!current) return current
      return current.filter((cheque) => cheque.id !== id)
    },
  })

  const updateStatus = (id: string, status: ChequeStatus) => {
    updateStatusMutation.mutate({ id, status })
  }

  const deleteCheque = (id: string) => {
    deleteMutation.mutate(id)
  }

  return {
    updateStatus,
    deleteCheque,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
