import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { businessSchema } from '@/validators'
import { businessService } from '@/services/business.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useOptimisticMutation } from './use-optimistic-mutation'

export function useEditBusiness(id: string) {
  const router = useRouter()

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

  const updateMutation = useOptimisticMutation<any[], any, any>({
    queryKey: ['businesses'],
    additionalQueryKeys: [['business', id]],
    mutationFn: (data: z.infer<typeof businessSchema>) =>
      businessService.update(id, data),
    update: (current, newBusiness) =>
      current?.map((business) =>
        business.id === id ? { ...business, ...newBusiness } : business,
      ),
  })

  const deleteMutation = useOptimisticMutation<any[], void, void>({
    queryKey: ['businesses'],
    mutationFn: () => businessService.delete(id),
    update: (current) => current?.filter((business) => business.id !== id),
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
