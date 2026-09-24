import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/validators'
import { AccountService } from '@/services/account.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useOptimisticMutation } from './use-optimistic-mutation'

export function useEditAccount(id: string, businessId: string | undefined) {
  const router = useRouter()

  const {
    data: account,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['account', id],
    queryFn: () => AccountService.getById(id),
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

  const updateMutation = useOptimisticMutation<any[], any, any>({
    queryKey: ['accounts', businessId],
    mutationFn: (data: any) => AccountService.update(id, data),
    update: (current, newAccount) =>
      current?.map((account) =>
        account.id === id ? { ...account, ...newAccount } : account,
      ),
  })

  const deleteMutation = useOptimisticMutation<any[], void, void>({
    queryKey: ['accounts', businessId],
    mutationFn: () => AccountService.delete(id),
    update: (current) => current?.filter((account) => account.id !== id),
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
