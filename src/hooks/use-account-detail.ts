import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AccountService } from '@/services/account.service'
import { ChequeService } from '@/services/cheque.service'
import { ChequeStatus } from '@/types'
import { useMemo } from 'react'

export function useAccountDetail(id: string, businessId: string | undefined) {
  const queryClient = useQueryClient()

  const { data: account, isLoading: accountLoading, error: accountError } = useQuery({
    queryKey: ['account', id],
    queryFn: () => AccountService.getById(id),
  })

  const { data: cheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const accountCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter((c: any) => c.account_id === id)
  }, [cheques, id])

  const updateChequeStatus = (id: string, status: ChequeStatus) => {
    mutation.mutate({ id, status })
  }

  return {
    account,
    accountCheques,
    isLoading: accountLoading || chequesLoading,
    error: accountError,
    updateChequeStatus,
    isUpdating: mutation.isPending,
  }
}
