'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessSchema } from '@/validators'
import { BusinessService } from '@/services/business.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBusiness } from '@/hooks/use-business'
import { ArrowLeft, ArrowRight, Check, Building2, Phone, Mail, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreateBusinessPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setActiveBusiness } = useBusiness()
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    }
  })

  const mutation = useMutation({
    mutationFn: (data: any) => BusinessService.create(data),
    onSuccess: (newBusiness) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      setActiveBusiness(newBusiness)
      router.push('/businesses')
    }
  })

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#8E8E93']

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => step > 1 ? prevStep() : router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Step {step} of 3</p>
          <h2 className="text-display-sm font-bold">New Business</h2>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="name" 
                    {...register('name')} 
                    placeholder="e.g. Acme Corp" 
                    className="h-14 pl-12 bg-canvas-parchment border-none text-lg font-medium rounded-2xl shadow-sm"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand Color</Label>
                <div className="flex flex-wrap gap-3 p-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => (setValue as any)('color', c)}
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
            
            <Button type="button" className="w-full rounded-pill h-14 text-lg shadow-product" onClick={nextStep} disabled={!watch('name')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Email <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  {...register('email')} 
                  placeholder="contact@business.com" 
                  className="h-14 pl-12 bg-canvas-parchment border-none rounded-2xl shadow-sm"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Phone</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="phone" 
                  {...register('phone')} 
                  placeholder="+91 ..." 
                  className="h-14 pl-12 bg-canvas-parchment border-none rounded-2xl shadow-sm"
                />
              </div>
            </div>

            <Button type="button" className="w-full rounded-pill h-14 text-lg shadow-product" onClick={nextStep} disabled={!watch('email')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Address</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input id="address" {...register('address')} placeholder="Headquarters location" className="h-14 pl-12 bg-canvas-parchment border-none rounded-2xl shadow-sm" />
              </div>
            </div>

            <div className="rounded-3xl bg-primary/5 p-6 space-y-4 border border-primary/10 shadow-sm">
              <h3 className="font-bold text-primary uppercase tracking-widest text-[10px]">Business Summary</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: watch('color' as any) || '#007AFF' }}>
                  {watch('name')?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="font-bold">{watch('name')}</p>
                  <p className="text-xs text-muted-foreground">{watch('email')}</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-pill h-14 text-lg shadow-product" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating Business...' : 'Create Business'} <Check className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
