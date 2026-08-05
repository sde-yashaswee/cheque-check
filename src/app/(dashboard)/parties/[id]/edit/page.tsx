'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partySchema } from '@/validators'
import { PartyService } from '@/services/party.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, User, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditPartyPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const queryClient = useQueryClient()
  
  const { data: party, isLoading } = useQuery({
    queryKey: ['party', id],
    queryFn: () => PartyService.getById(id),
  })

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(partySchema),
  })

  useEffect(() => {
    if (party) {
      reset({
        name: party.name,
        contact: party.contact,
        email: party.email || '',
        address: party.address || '',
        notes: party.notes || '',
        color: party.color,
      })
    }
  }, [party, reset])

  const mutation = useMutation({
    mutationFn: (data: any) => PartyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', activeBusiness?.id] })
      queryClient.invalidateQueries({ queryKey: ['party', id] })
      router.back()
    }
  })

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE']

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Party Name <span className="text-destructive">*</span></Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="name" 
                {...register('name')} 
                placeholder="Enter full name" 
                className="h-14 pl-12 bg-canvas-parchment border-none text-lg font-medium rounded-2xl shadow-sm"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="contact" 
                {...register('contact')} 
                placeholder="Phone number" 
                className="h-14 pl-12 bg-canvas-parchment border-none rounded-2xl shadow-sm"
              />
            </div>
            {errors.contact && <p className="text-xs text-destructive">{errors.contact.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input id="email" {...register('email')} placeholder="email@address.com" className="h-14 bg-canvas-parchment border-none rounded-2xl shadow-sm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input id="address" {...register('address')} placeholder="Location details" className="h-14 pl-12 bg-canvas-parchment border-none rounded-2xl shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Theme Color</Label>
            <div className="flex flex-wrap gap-3 p-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color' as any, c)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all active:scale-90 ring-offset-2",
                    watch('color' as any) === c ? "ring-2 ring-primary scale-110 shadow-md" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full rounded-pill h-14 text-lg shadow-product" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Update Party'} <Check className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
