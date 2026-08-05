'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bankSchema } from '@/validators'
import { BankService } from '@/services/bank.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, Landmark, CreditCard, User, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreateBankPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_name: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
    }
  })

  const mutation = useMutation({
    mutationFn: (data: any) => BankService.create({ ...data, business_id: activeBusiness!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks', activeBusiness?.id] })
      router.push('/banks')
    }
  })

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const onSubmit = (data: any) => {
    if (!activeBusiness) return
    mutation.mutate(data)
  }

  const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30', '#FF9500', '#34C759']

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        {step > 1 && (
          <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Step {step} of 3</p>
          <h2 className="text-display-sm font-bold">Add Bank</h2>
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
                <Label htmlFor="bank_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bank Name</Label>
                <div className="relative">
                  <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="bank_name" 
                    {...register('bank_name')} 
                    placeholder="e.g. ICICI Bank" 
                    className="h-14 pl-12 bg-canvas-parchment border-none text-lg font-medium"
                  />
                </div>
                {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name.message as string}</p>}
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
            
            <Button type="button" className="w-full rounded-pill h-14 text-lg" onClick={nextStep} disabled={!watch('bank_name')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="account_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Holder Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="account_name" 
                  {...register('account_name')} 
                  placeholder="e.g. John Doe" 
                  className="h-14 pl-12 bg-canvas-parchment border-none"
                />
              </div>
              {errors.account_name && <p className="text-xs text-destructive">{errors.account_name.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="account_number" 
                  {...register('account_number')} 
                  placeholder="Enter full number" 
                  className="h-14 pl-12 bg-canvas-parchment border-none"
                />
              </div>
              {errors.account_number && <p className="text-xs text-destructive">{errors.account_number.message as string}</p>}
            </div>

            <Button type="button" className="w-full rounded-pill h-14 text-lg" onClick={nextStep} disabled={!watch('account_name') || !watch('account_number')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="ifsc_code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">IFSC Code (Optional)</Label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="ifsc_code" {...register('ifsc_code')} placeholder="BANK0123456" className="h-14 pl-12 bg-canvas-parchment border-none uppercase" />
              </div>
            </div>

            <div className="rounded-3xl bg-primary/5 p-6 space-y-4 border border-primary/10">
              <h3 className="font-bold text-primary uppercase tracking-widest text-[10px]">Bank Details</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: watch('color' as any) || '#5856D6' }}>
                  {watch('bank_name')?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="font-bold">{watch('bank_name')}</p>
                  <p className="text-xs text-muted-foreground">{watch('account_number')}</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-pill h-14 text-lg shadow-product" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding Bank...' : 'Add Bank'} <Check className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
