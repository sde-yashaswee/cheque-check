'use client'

import { useEditParty } from '@/hooks/use-edit-party'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { Check, User, Phone, MapPin, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteConfirmationDialog } from '@/components/ui/delete-dialog'

export default function EditPartyPage() {
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  
  const {
    form,
    party,
    isLoading,
    isSaving,
    onSubmit,
    onDelete,
  } = useEditParty(id, activeBusiness?.id)

  const { register, watch, setValue, formState: { errors } } = form

  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE']

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Party Name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
              <Input 
                id="name" 
                {...register('name')} 
                placeholder="Enter full name" 
                className="h-14 pl-12 bg-canvas-parchment border-none text-lg font-semibold rounded-sm"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Contact Number</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
              <Input 
                id="contact" 
                {...register('contact')} 
                placeholder="Phone number" 
                className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm"
              />
            </div>
            {errors.contact && <p className="text-xs text-destructive ml-1">{errors.contact.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
            <Input id="email" {...register('email')} placeholder="email@address.com" className="h-14 bg-canvas-parchment border-none rounded-sm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground opacity-50" />
              <Input id="address" {...register('address')} placeholder="Location details" className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Theme Color</Label>
            <div className="flex flex-wrap gap-3 p-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color' as any, c)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all active:scale-[0.9] ring-offset-2",
                    watch('color' as any) === c ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button type="submit" className="w-full rounded-full h-14 text-lg" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Update Party'} <Check className="ml-2 h-5 w-5" />
          </Button>

          <DeleteConfirmationDialog 
            title="Delete Party?"
            description="This will permanently delete this party and all associated records."
            confirmName={party?.name || ''}
            onDelete={async () => { onDelete() }}
            trigger={
              <Button type="button" variant="ghost" className="w-full rounded-full h-14 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="mr-2 h-5 w-5" /> Delete Party
              </Button>
            }
          />
        </div>
      </form>
    </div>
  )
}

