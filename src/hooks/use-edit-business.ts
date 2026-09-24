import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { businessSchema } from '@/validators'
import { businessService } from '@/services/business.service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useEditBusiness(id: string) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: business,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['business', id],
    queryFn: () => businessService.getById(id),
  })

  const form = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      color: '#007AFF',
      icon: 'Store',
      logo_url: null,
    },
  })

  const { reset } = form

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        email: business.email || '',
        phone: business.phone || '',
        address: business.address || '',
        color: business.color || '#007AFF',
        icon: business.icon || 'Store',
        logo_url: business.logo_url || null,
      })
    }
  }, [business, reset])

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof businessSchema>) =>
      businessService.update(id, data),
    onMutate: async (newBusiness) => {
      await queryClient.cancelQueries({ queryKey: ['businesses'] })
      const previousBusinesses = queryClient.getQueryData(['businesses'])
      queryClient.setQueryData(['businesses'], (old: any[]) => {
        if (!old) return old
        return old.map((b) => (b.id === id ? { ...b, ...newBusiness } : b))
      })
      return { previousBusinesses }
    },
    onError: (err, newBusiness, context: any) => {
      queryClient.setQueryData(['businesses'], context?.previousBusinesses)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      queryClient.invalidateQueries({ queryKey: ['business', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => businessService.delete(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['businesses'] })
      const previousBusinesses = queryClient.getQueryData(['businesses'])
      queryClient.setQueryData(['businesses'], (old: any[]) => {
        if (!old) return old
        return old.filter((b) => b.id !== id)
      })
      return { previousBusinesses }
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(['businesses'], context?.previousBusinesses)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
    },
  })

  return {
    form,
    business,
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
      router.push('/businesses')
    },
  }
}
