import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/validators'
import { AccountService, accountService } from '@/services/account.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEntityMutations } from './use-entity-mutations'
import type { Account } from '@/types'

export function useEditAccount(id: string, businessId: string | undefined) {
  const router = useRouter()

  const {
    data: account,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.getById(id),
  })

  const form = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      bank_id: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
      color: '#007AFF',
    },
  })

  const { reset } = form

  useEffect(() => {
    if (account) {
      reset({
        bank_id: account.bank_id || '',
        account_name: account.account_name,
        account_number: account.account_number,
        ifsc_code: account.ifsc_code || '',
        color: account.color,
      })
    }
  }, [account, reset])

  const { updateMutation, deleteMutation } = useEntityMutations<
    Account,
    Parameters<AccountService['update']>[1],
    Account
  >({
    listQueryKey: ['accounts', businessId],
    detailQueryKey: ['account', id],
    update: {
      mutationFn: (data) => accountService.update(id, data),
      updateList: (current, newAccount) =>
        current?.map((account) =>
          account.id === id ? { ...account, ...newAccount } : account,
        ),
    },
    remove: {
      mutationFn: () => accountService.delete(id),
      updateList: (current) => current?.filter((account) => account.id !== id),
    },
  })

  return {
    form,
    account,
    isLoading,
    error,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    onSubmit: form.handleSubmit((data) => {
      updateMutation.mutate(data)
      router.back()
    }),
    onDelete: () => {
      deleteMutation.mutate()
      router.push('/accounts')
    },
  }
}
