'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partySchema } from '@/validators'
import { PartyService } from '@/services/party.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useBusiness } from '@/hooks/use-business'

import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function CreatePartyPage() {
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      address: '',
      notes: '',
    }
  })

  const mutation = useMutation({
    mutationFn: (data: any) => PartyService.create({ ...data, business_id: activeBusiness!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', activeBusiness?.id] })
      router.push('/parties')
    }
  })

  const onSubmit = (data: any) => {
    if (!activeBusiness) return
    mutation.mutate(data)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12">
        <div className="space-y-2">
          <Label htmlFor="name">Party Name *</Label>
          <Input id="name" {...register('name')} placeholder="Customer or Vendor name" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact Number *</Label>
          <Input id="contact" {...register('contact')} placeholder="Phone number" />
          {errors.contact && <p className="text-xs text-destructive">{errors.contact.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" {...register('email')} placeholder="Email address" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address (Optional)</Label>
          <Input id="address" {...register('address')} placeholder="Party location" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input id="notes" {...register('notes')} placeholder="Any additional details" />
        </div>

        <Button type="submit" className="w-full rounded-pill h-12 text-lg" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Party'}
        </Button>
      </form>
    </div>
  )
}
