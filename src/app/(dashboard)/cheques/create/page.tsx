'use client'

import { useCreateCheque } from '@/hooks/use-create-cheque'
import { PartyService } from '@/services/party.service'
import { AccountService } from '@/services/account.service'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ArrowLeft, ArrowRight01Icon as ArrowRight, Tick02Icon as Check, Camera01Icon as Camera, Cancel01Icon as X, ArrowUpRight01Icon as ArrowUpRight, ArrowDownLeft01Icon as ArrowDownLeft } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'
import { Combobox } from '@/components/ui/combobox'
import { EntityAvatar } from '@/components/ui/entity-avatar'

export default function CreateChequePage() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const {
    form,
    step,
    nextStep,
    prevStep,
    isUploading,
    handleImageUpload,
    isSaving,
    onSubmit,
  } = useCreateCheque(businessId, typeParam)

  const { register, setValue, watch, formState: { errors } } = form

  const { data: parties } = useQuery({
    queryKey: ['parties', businessId],
    queryFn: () => PartyService.getAll(businessId!),
    enabled: !!businessId,
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts', businessId],
    queryFn: () => AccountService.getAll(businessId!),
    enabled: !!businessId,
  })

  const partyOptions = parties?.map(p => ({ 
    label: p.name, 
    value: p.id,
    color: (p as any).color,
    icon: (p as any).icon
  })) || []

  const accountOptions = accounts?.map(b => ({ 
    label: `${(b as any).bank?.name || 'Bank'} (${b.account_number.slice(-4)})`, 
    value: b.id,
    color: (b as any).color,
    icon: (b as any).icon
  })) || []

  const selectedParty = parties?.find(p => p.id === watch('party_id'))

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        {step > 1 && (
          <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
            <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
          </Button>
        )}
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Step {step} of 3</p>
          <h2 className="text-display-sm font-semibold">New Cheque</h2>
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
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Cheque Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('type', 'Outward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-[0.98]",
                    watch('type') === 'Outward' 
                      ? "bg-primary/5 border-primary" 
                      : "bg-card border-primary/5"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-sm flex items-center justify-center transition-colors",
                    watch('type') === 'Outward' ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  )}>
                    <HugeiconsIcon icon={ArrowUpRight} className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "font-semibold text-xs uppercase tracking-wider",
                    watch('type') === 'Outward' ? "text-primary" : "text-muted-foreground"
                  )}>Issued</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('type', 'Inward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-[0.98]",
                    watch('type') === 'Inward' 
                      ? "bg-green-500/5 border-green-500" 
                      : "bg-card border-primary/5"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-sm flex items-center justify-center transition-colors",
                    watch('type') === 'Inward' ? "bg-green-500 text-white" : "bg-green-500/10 text-green-600"
                  )}>
                    <HugeiconsIcon icon={ArrowDownLeft} className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "font-semibold text-xs uppercase tracking-wider",
                    watch('type') === 'Inward' ? "text-green-600" : "text-muted-foreground"
                  )}>Received</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold opacity-30">₹</span>
                <Input 
                  id="amount" 
                  type="number" 
                  {...register('amount')} 
                  className="h-16 pl-10 text-3xl font-semibold border-none bg-canvas-parchment rounded-sm" 
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive ml-1">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_number" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Cheque Number</Label>
              <Input id="cheque_number" {...register('cheque_number')} placeholder="6-digit number" className="h-12 rounded-sm" />
              {errors.cheque_number && <p className="text-xs text-destructive ml-1">{errors.cheque_number.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Cheque Date</Label>
              <Input id="cheque_date" type="date" {...register('cheque_date')} className="h-12 rounded-sm" />
              {errors.cheque_date && <p className="text-xs text-destructive ml-1">{errors.cheque_date.message as string}</p>}
            </div>
            
            <Button type="button" className="w-full rounded-full h-14 text-lg" onClick={nextStep} disabled={!watch('amount')}>
              Continue <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Select Party</Label>
              <Combobox 
                options={partyOptions} 
                value={watch('party_id')} 
                onValueChange={(val) => setValue('party_id', val)} 
                placeholder="Choose a party"
                createUrl="/parties/create"
                createLabel="Add new party"
              />
              {errors.party_id && <p className="text-xs text-destructive ml-1">{errors.party_id.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Select Account</Label>
              <Combobox 
                options={accountOptions} 
                value={watch('account_id')} 
                onValueChange={(val) => setValue('account_id', val)} 
                placeholder="Choose an account"
                createUrl="/accounts/create"
                createLabel="Add new account"
              />
              {errors.account_id && <p className="text-xs text-destructive ml-1">{errors.account_id.message as string}</p>}
            </div>

            <Button type="button" className="w-full rounded-full h-14 text-lg" onClick={nextStep} disabled={!watch('party_id') || !watch('account_id')}>
              Continue <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Cheque Photo</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-canvas-parchment/30 min-h-[140px] transition-colors hover:bg-canvas-parchment/50 border-primary/10">
                {watch('image_url' as any) ? (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border">
                    <img src={watch('image_url' as any)} alt="Cheque" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setValue('image_url', null)}
                      className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <HugeiconsIcon icon={X} className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer py-6 w-full">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {isUploading ? (
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <HugeiconsIcon icon={Camera} className="h-7 w-7" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-primary block">
                        {isUploading ? 'Uploading Cheque...' : 'Scan / Upload Cheque'}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Take a photo of the physical cheque</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Notes</Label>
              <Input id="notes" {...register('notes')} placeholder="Add any notes here" className="h-12 rounded-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Expected Deposit Date</Label>
              <Input id="deposit_date" type="date" {...register('deposit_date')} className="h-12 rounded-sm" />
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">Summary</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">Amount</span>
                <span className="text-xl font-semibold text-primary">₹{Number(watch('amount') || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">Number</span>
                <span className="font-semibold font-mono bg-white px-2 py-0.5 rounded border border-primary/10 text-primary">#{watch('cheque_number')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">Party</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{selectedParty?.name || '-'}</span>
                  {selectedParty && (
                    <EntityAvatar 
                      name={selectedParty.name} 
                      color={(selectedParty as any).color} 
                      icon={(selectedParty as any).icon} 
                      size="sm" 
                    />
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full h-14 text-lg" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Cheque'} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

