import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partySchema } from '@/validators'
import { PartyService } from '@/services/party.service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useEditParty(id: string, businessId: string | undefined) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { data: party, isLoading, error } = useQuery({
    queryKey: ['party', id],
    queryFn: () => PartyService.getById(id),
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
    }
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

  const updateMutation = useMutation({
    mutationFn: (data: any) => PartyService.update(id, data),
    onMutate: async (newParty) => {
      await queryClient.cancelQueries({ queryKey: ['parties', businessId] })
      const previousParties = queryClient.getQueryData(['parties', businessId])
      queryClient.setQueryData(['parties', businessId], (old: any) => {
        if (!old) return old
        return old.map((p: any) => p.id === id ? { ...p, ...newParty } : p)
      })
      return { previousParties }
    },
    onError: (err, newParty, context) => {
      queryClient.setQueryData(['parties', businessId], context?.previousParties)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', businessId] })
      queryClient.invalidateQueries({ queryKey: ['party', id] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => PartyService.delete(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['parties', businessId] })
      const previousParties = queryClient.getQueryData(['parties', businessId])
      queryClient.setQueryData(['parties', businessId], (old: any) => {
        if (!old) return old
        return old.filter((p: any) => p.id !== id)
      })
      return { previousParties }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['parties', businessId], context?.previousParties)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', businessId] })
    }
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
