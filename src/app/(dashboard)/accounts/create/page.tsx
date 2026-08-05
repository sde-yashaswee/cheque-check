'use client'

import { useCreateAccount } from '@/hooks/use-create-account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ArrowLeft, ArrowRight01Icon as ArrowRight, Tick02Icon as Check, CreditCardIcon as CreditCard, UserIcon as User, HashtagIcon as Hash } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { BankSelector } from '@/components/bank-selector'

export default function CreateAccountPage() {
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  
  const {
    form,
    step,
    nextStep,
    prevStep,
    isSaving,
    onSubmit,
  } = useCreateAccount(activeBusiness?.id)

  const { register, watch, setValue, formState: { errors } } = form

  const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30', '#FF9500', '#34C759']

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => step > 1 ? prevStep() : router.back()} className="rounded-full">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Step {step} of 3</p>
          <h2 className="text-display-sm font-semibold">Add Account</h2>
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
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Select Bank</Label>
                <BankSelector 
                  value={watch('bank_id')}
                  onValueChange={(val) => setValue('bank_id', val)}
                />
                {errors.bank_id && <p className="text-xs text-destructive ml-1">{errors.bank_id.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Brand Color</Label>
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
            
            <Button type="button" className="w-full rounded-full h-14 text-lg" onClick={nextStep} disabled={!watch('bank_id')}>
              Continue <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="account_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Account Holder Name</Label>
              <div className="relative">
                <HugeiconsIcon icon={User} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                <Input 
                  id="account_name" 
                  {...register('account_name')} 
                  placeholder="e.g. John Doe" 
                  className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              {errors.account_name && <p className="text-xs text-destructive ml-1">{errors.account_name.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Account Number</Label>
              <div className="relative">
                <HugeiconsIcon icon={CreditCard} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                <Input 
                  id="account_number" 
                  {...register('account_number')} 
                  placeholder="Enter full number" 
                  className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              {errors.account_number && <p className="text-xs text-destructive ml-1">{errors.account_number.message as string}</p>}
            </div>

            <Button type="button" className="w-full rounded-full h-14 text-lg" onClick={nextStep} disabled={!watch('account_name') || !watch('account_number')}>
              Continue <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="ifsc_code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">IFSC Code</Label>
              <div className="relative">
                <HugeiconsIcon icon={Hash} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                <Input id="ifsc_code" {...register('ifsc_code')} placeholder="BANK0123456" className="h-14 pl-12 bg-canvas-parchment border-none uppercase rounded-sm" />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full h-14 text-lg" disabled={isSaving}>
              {isSaving ? 'Adding Account...' : 'Add Account'} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

