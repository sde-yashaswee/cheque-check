import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChequeService } from '@/services/cheque.service'
import { ChequeStatus } from '@/types'
import { useBusiness } from './use-business'

export function useChequeActions() {
  const queryClient = useQueryClient()
  const { activeBusiness } = useBusiness()

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Invalidate/Update list cache
      if (activeBusiness?.id) {
        await queryClient.cancelQueries({ queryKey: ['cheques', activeBusiness.id] })
        const previousCheques = queryClient.getQueryData(['cheques', activeBusiness.id])
        queryClient.setQueryData(['cheques', activeBusiness.id], (old: any) => {
          if (!old) return old
          return old.map((c: any) => c.id === id ? { ...c, status } : c)
        })
      }

      // Invalidate/Update detail cache
      await queryClient.cancelQueries({ queryKey: ['cheque', id] })
      const previousCheque = queryClient.getQueryData(['cheque', id])
      queryClient.setQueryData(['cheque', id], (old: any) => {
        if (!old) return old
        return { ...old, status }
      })

      return { previousCheques: queryClient.getQueryData(['cheques', activeBusiness?.id]), previousCheque }
    },
    onSettled: (data, error, { id }) => {
      if (activeBusiness?.id) {
        queryClient.invalidateQueries({ queryKey: ['cheques', activeBusiness.id] })
      }
      queryClient.invalidateQueries({ queryKey: ['cheque', id] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ChequeService.delete(id),
    onMutate: async (id) => {
      if (activeBusiness?.id) {
        await queryClient.cancelQueries({ queryKey: ['cheques', activeBusiness.id] })
        const previousCheques = queryClient.getQueryData(['cheques', activeBusiness.id])
        queryClient.setQueryData(['cheques', activeBusiness.id], (old: any) => {
          if (!old) return old
          return old.filter((c: any) => c.id !== id)
        })
      }
      return { previousCheques: queryClient.getQueryData(['cheques', activeBusiness?.id]) }
    },
    onSettled: () => {
      if (activeBusiness?.id) {
        queryClient.invalidateQueries({ queryKey: ['cheques', activeBusiness.id] })
      }
    }
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
