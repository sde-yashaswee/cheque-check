import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chequeService } from '@/services/cheque.service'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { useBusiness } from './use-business'

export function useChequeActions() {
  const queryClient = useQueryClient()
  const { activeBusiness } = useBusiness()

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ChequeStatus }) =>
      chequeService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Invalidate/Update list cache
      let previousCheques: ChequeWithRelations[] = []
      if (activeBusiness?.id) {
        await queryClient.cancelQueries({
          queryKey: ['cheques', activeBusiness.id],
        })
        previousCheques =
          queryClient.getQueryData<ChequeWithRelations[]>([
            'cheques',
            activeBusiness.id,
          ]) || []
        queryClient.setQueryData<ChequeWithRelations[]>(
          ['cheques', activeBusiness.id],
          (old) => {
            if (!old) return old
            return old.map((c) => (c.id === id ? { ...c, status } : c))
          },
        )
      }

      // Invalidate/Update detail cache
      await queryClient.cancelQueries({ queryKey: ['cheque', id] })
      const previousCheque = queryClient.getQueryData<ChequeWithRelations>([
        'cheque',
        id,
      ])
      queryClient.setQueryData<ChequeWithRelations>(['cheque', id], (old) => {
        if (!old) return old
        return { ...old, status }
      })

      return { previousCheques, previousCheque }
    },
    onSettled: (data, error, { id }) => {
      if (activeBusiness?.id) {
        queryClient.invalidateQueries({
          queryKey: ['cheques', activeBusiness.id],
        })
      }
      queryClient.invalidateQueries({ queryKey: ['cheque', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chequeService.delete(id),
    onMutate: async (id) => {
      let previousCheques: ChequeWithRelations[] = []
      if (activeBusiness?.id) {
        await queryClient.cancelQueries({
          queryKey: ['cheques', activeBusiness.id],
        })
        previousCheques =
          queryClient.getQueryData<ChequeWithRelations[]>([
            'cheques',
            activeBusiness.id,
          ]) || []
        queryClient.setQueryData<ChequeWithRelations[]>(
          ['cheques', activeBusiness.id],
          (old) => {
            if (!old) return old
            return old.filter((c) => c.id !== id)
          },
        )
      }
      return { previousCheques }
    },
    onSettled: () => {
      if (activeBusiness?.id) {
        queryClient.invalidateQueries({
          queryKey: ['cheques', activeBusiness.id],
        })
      }
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
