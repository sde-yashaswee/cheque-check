'use client'

import { useCreateParty } from '@/hooks/use-create-party'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { ArrowLeft, ArrowRight, Check, User, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreatePartyPage() {
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  
  const {
    form,
    step,
    nextStep,
    prevStep,
    isSaving,
    onSubmit,
  } = useCreateParty(activeBusiness?.id)

  const { register, watch, setValue, formState: { errors } } = form

  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE']

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => step > 1 ? prevStep() : router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Step {step} of 3</p>
          <h2 className="text-display-sm font-semibold">New Party</h2>
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-canvas-parchment"
            )} 
          />
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
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
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Theme Color</Label>
                <div className="flex flex-wrap gap-3 p-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('color', c)}
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
            
            <Button type="button" className="w-full rounded-full h-14 text-lg" onClick={nextStep} disabled={!watch('name')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
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

            <Button type="button" className="w-full rounded-full h-14 text-lg" onClick={nextStep} disabled={!watch('contact')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground opacity-50" />
                <Input id="address" {...register('address')} placeholder="Location details" className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Notes</Label>
              <Input id="notes" {...register('notes')} placeholder="Any additional notes" className="h-14 bg-canvas-parchment border-none rounded-sm" />
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">Review Information</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full" style={{ backgroundColor: watch('color' as any) || '#34C759' }} />
                <div>
                  <p className="font-semibold">{watch('name')}</p>
                  <p className="text-xs text-muted-foreground">{watch('contact')}</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full h-14 text-lg" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Create Party'} <Check className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

