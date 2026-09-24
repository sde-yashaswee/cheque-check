import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partySchema } from '@/validators'
import { PartyService, partyService } from '@/services/party.service'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Party } from '@/types'
import { useEntityMutations } from './use-entity-mutations'

export function useEditParty(id: string, businessId: string | undefined) {
  const router = useRouter()

  const {
    data: party,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['party', id],
    queryFn: () => partyService.getById(id),
  })

  const form = useForm({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      address: '',
      notes: '',
      color: '#007AFF',
      avatar_url: null,
    },
  })

  const { reset } = form

  useEffect(() => {
    if (party) {
      reset({
        name: party.name,
        contact: party.contact,
        email: party.email || '',
        address: party.address || '',
        notes: party.notes || '',
        color: party.color,
        avatar_url: party.avatar_url || null,
      })
    }
  }, [party, reset])

  const { updateMutation, deleteMutation } = useEntityMutations<
    Party,
    Parameters<PartyService['update']>[1],
    Party
  >({
    listQueryKey: ['parties', businessId],
    detailQueryKey: ['party', id],
    update: {
      mutationFn: (data) => partyService.update(id, data),
      updateList: (current, newParty) =>
        current?.map((party) =>
          party.id === id ? { ...party, ...newParty } : party,
        ),
    },
    remove: {
      mutationFn: () => partyService.delete(id),
      updateList: (current) => current?.filter((party) => party.id !== id),
    },
  })

  return {
    form,
    party,
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
      router.push('/parties')
    },
  }
}
