import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { businessSchema } from '@/validators'
import { businessService } from '@/features/businesses/services/business.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEntityMutations } from './use-entity-mutations'
import type { Business } from '@/types'

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

  const { updateMutation, deleteMutation } = useEntityMutations<
    Business,
    z.infer<typeof businessSchema>,
    Business
  >({
    listQueryKey: ['businesses'],
    detailQueryKey: ['business', id],
    update: {
      mutationFn: (data) => businessService.update(id, data),
      updateList: (current, newBusiness) =>
        current?.map((business) =>
          business.id === id ? { ...business, ...newBusiness } : business,
        ),
    },
    remove: {
      mutationFn: () => businessService.delete(id),
      updateList: (current) =>
        current?.filter((business) => business.id !== id),
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
