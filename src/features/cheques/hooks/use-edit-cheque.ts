import { useState } from 'react'
import { z } from 'zod'
import { chequeSchema } from '@/validators'
import { chequeService } from '@/features/cheques/services/cheque.service'
import { storageService } from '@/services/storage.service'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { Cheque as ChequeEntity } from '@/domain/cheque.entity'
import { useRouter } from 'next/navigation'
import { useEntityEditor } from '@/hooks/use-entity-editor'
import { useEntityMutations } from './use-entity-mutations'
import { queryKeys } from '@/lib/query-keys'

type ChequeFormData = z.infer<typeof chequeSchema>

export function useEditCheque(id: string) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const tCommon = useTranslations('Common')

  const {
    entity: cheque,
    isLoading,
    error,
    form,
  } = useEntityEditor<ChequeEntity, ChequeFormData>({
    queryKey: queryKeys.cheques.detail(id),
    fetchFn: () => chequeService.getById(id),
    schema: chequeSchema,
    defaultValues: {
      cheque_number: '',
      amount: 0,
      cheque_date: new Date().toISOString().split('T')[0],
      deposit_date: '',
      party_id: '',
      account_id: '',
      type: 'Outward',
      notes: '',
      image_url: null,
    },
    toFormValues: (cheque) => ({
      cheque_number: cheque.cheque_number,
      amount: cheque.amount,
      cheque_date: cheque.cheque_date,
      deposit_date: cheque.deposit_date || '',
      party_id: cheque.party_id,
      account_id: cheque.account_id,
      type: cheque.type,
      notes: cheque.notes || '',
      image_url: cheque.image_url || null,
    }),
  })

  const { updateMutation, deleteMutation } = useEntityMutations<
    ChequeEntity,
    ChequeFormData,
    ChequeEntity
  >({
    listQueryKey: queryKeys.cheques.list(cheque?.business_id),
    detailQueryKey: queryKeys.cheques.detail(id),
    deleteQueryKeys: [queryKeys.cheques.detail(id)],
    update: {
      mutationFn: (data) => chequeService.update(id, data),
      updateList: (current, newCheque) =>
        current?.map((cachedCheque) =>
          cachedCheque.id === id
            ? ChequeEntity.fromRow({
                ...cachedCheque.toJSON(),
                ...newCheque,
                deposit_date: newCheque.deposit_date || null,
                notes: newCheque.notes || null,
                image_url: newCheque.image_url || null,
              })
            : cachedCheque,
        ),
    },
    remove: {
      mutationFn: () => chequeService.delete(id),
      updateList: (current) =>
        current?.filter((cachedCheque) => cachedCheque.id !== id),
    },
  })

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const url = await storageService.uploadChequeImage(file)
      form.setValue('image_url', url, { shouldDirty: true })
    } catch (error) {
      toast.add({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : tCommon('error'),
        type: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = form.handleSubmit(async (data) => {
    if (isUploading) return

    try {
      await updateMutation.mutateAsync(data)
      router.back()
    } catch (error) {
      toast.add({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : tCommon('error'),
        type: 'error',
      })
    }
  })

  return {
    form,
    cheque,
    isLoading,
    error,
    isUploading,
    handleImageUpload,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    onSubmit,
    onDelete: () => {
      deleteMutation.mutate()
      router.push('/cheques')
    },
  }
}
