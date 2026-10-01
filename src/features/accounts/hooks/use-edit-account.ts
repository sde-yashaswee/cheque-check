import { z } from 'zod'
import { accountSchema } from '@/validators'
import {
  AccountService,
  accountService,
} from '@/features/accounts/services/account.service'
import { useRouter } from 'next/navigation'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { useEntityMutations } from './use-entity-mutations'
import type { Account } from '@/types'
import { queryKeys } from '@/lib/query-keys'

export function useEditAccount(id: string, businessId: string | undefined) {
  const router = useRouter()

  const {
    entity: account,
    isLoading,
    error,
    form,
  } = useEntityEditor<Account, z.infer<typeof accountSchema>>({
    queryKey: queryKeys.accounts.detail(id),
    fetchFn: () => accountService.getById(id),
    schema: accountSchema,
    defaultValues: {
      bank_id: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
      color: '#007AFF',
      notes: '',
      opening_balance: 0,
      is_default: false,
    },
    toFormValues: (account) => ({
      bank_id: account.bank_id || '',
      account_name: account.account_name,
      account_number: account.account_number,
      ifsc_code: account.ifsc_code || '',
      color: account.color,
      notes: account.notes || '',
      opening_balance: account.opening_balance ?? 0,
      is_default: account.is_default,
    }),
  })

  const { updateMutation, deleteMutation } = useEntityMutations<
    Account,
    Parameters<AccountService['update']>[1],
    Account
  >({
    listQueryKey: queryKeys.accounts.list(businessId),
    detailQueryKey: queryKeys.accounts.detail(id),
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
