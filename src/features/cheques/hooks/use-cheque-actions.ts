import { chequeService } from '@/features/cheques/services/cheque.service'
import { ChequeStatus } from '@/types'
import { Cheque as ChequeEntity } from '@/domain/cheque.entity'
import { useBusiness } from './use-business'
import { useOptimisticMutation } from './use-optimistic-mutation'

export function useChequeActions() {
  const { activeBusiness } = useBusiness()

  const updateStatusMutation = useOptimisticMutation<
    ChequeEntity[],
    { id: string; status: ChequeStatus },
    ChequeEntity
  >({
    queryKey: activeBusiness?.id ? ['cheques', activeBusiness.id] : ['cheques'],
    additionalMutations: [
      {
        queryKey: ({ id }) => ['cheque', id],
        update: (current: ChequeEntity | undefined, { id, status }) => {
          if (!current || current.id !== id) return current
          return ChequeEntity.fromRow({ ...current.toJSON(), status })
        },
      },
    ],
    mutationFn: ({ id, status }) => chequeService.updateStatus(id, status),
    update: (current, { id, status }) => {
      if (!current) return current
      return current.map((cheque) =>
        cheque.id === id
          ? ChequeEntity.fromRow({ ...cheque.toJSON(), status })
          : cheque,
      )
    },
  })

  const deleteMutation = useOptimisticMutation<ChequeEntity[], string, void>({
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
