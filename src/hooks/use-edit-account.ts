import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/validators'
import { AccountService } from '@/services/account.service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useEditAccount(id: string, businessId: string | undefined) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { data: account, isLoading, error } = useQuery({
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
    }
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

  const updateMutation = useMutation({
    mutationFn: (data: any) => AccountService.update(id, data),
    onMutate: async (newAccount) => {
      await queryClient.cancelQueries({ queryKey: ['accounts', businessId] })
      const previousAccounts = queryClient.getQueryData(['accounts', businessId])
      queryClient.setQueryData(['accounts', businessId], (old: any) => {
        if (!old) return old
        return old.map((a: any) => a.id === id ? { ...a, ...newAccount } : a)
      })
      return { previousAccounts }
    },
    onError: (err, newAccount, context) => {
      queryClient.setQueryData(['accounts', businessId], context?.previousAccounts)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] })
      queryClient.invalidateQueries({ queryKey: ['account', id] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => AccountService.delete(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['accounts', businessId] })
      const previousAccounts = queryClient.getQueryData(['accounts', businessId])
      queryClient.setQueryData(['accounts', businessId], (old: any) => {
        if (!old) return old
        return old.filter((a: any) => a.id !== id)
      })
      return { previousAccounts }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['accounts', businessId], context?.previousAccounts)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] })
    }
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
