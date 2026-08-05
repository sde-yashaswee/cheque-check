import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { businessSchema } from '@/validators'
import { BusinessService } from '@/services/business.service'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useEditBusiness(id: string) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { data: business, isLoading, error } = useQuery({
    queryKey: ['business', id],
    queryFn: () => BusinessService.getById(id),
  })

  const form = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
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
      })
    }
  }, [business, reset])

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof businessSchema>) => BusinessService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      queryClient.invalidateQueries({ queryKey: ['business', id] })
      router.back()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => BusinessService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      router.push('/businesses')
    }
  })

  return {
    form,
    business,
    isLoading,
    error,
    isSaving: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    onSubmit: form.handleSubmit((data) => updateMutation.mutate(data)),
    onDelete: () => deleteMutation.mutate(),
  }
}
