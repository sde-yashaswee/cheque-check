import { z } from 'zod'
import { businessSchema } from '@/validators'
import { businessService } from '@/features/businesses/services/business.service'
import { useRouter } from 'next/navigation'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { useEntityMutations } from './use-entity-mutations'
import type { Business } from '@/types'
import { storageService } from '@/services/storage.service'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'

export function useEditBusiness(id: string) {
  const router = useRouter()

  const {
    entity: business,
    isLoading,
    error,
    form,
  } = useEntityEditor<Business, z.infer<typeof businessSchema>>({
    queryKey: queryKeys.businesses.detail(id),
    fetchFn: () => businessService.getById(id),
    schema: businessSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      color: '#007AFF',
      icon: 'Store',
      logo_url: null,
    },
    toFormValues: (business) => ({
      name: business.name,
      email: business.email || '',
      phone: business.phone || '',
      address: business.address || '',
      color: business.color || '#007AFF',
      icon: business.icon || 'Store',
      logo_url: business.logo_url || null,
    }),
  })

  const { updateMutation, deleteMutation } = useEntityMutations<
    Business,
    z.infer<typeof businessSchema>,
    Business
  >({
    listQueryKey: queryKeys.businesses.all(),
    detailQueryKey: queryKeys.businesses.detail(id),
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
    onSubmit: form.handleSubmit(async (data) => {
      const previousLogoUrl = business?.logo_url
      await updateMutation.mutateAsync(data)
      if (previousLogoUrl && previousLogoUrl !== data.logo_url) {
        await storageService.deleteAvatar(previousLogoUrl).catch((error) => {
          logger.error('Failed to delete previous business logo', error)
        })
      }
      router.back()
    }),
    onDelete: () => {
      deleteMutation.mutate()
      router.push('/businesses')
    },
  }
}
