'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { chequeSchema } from '@/validators'
import { ChequeService } from '@/services/cheque.service'
import { PartyService } from '@/services/party.service'
import { AccountService } from '@/services/account.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Camera, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'
import { Combobox } from '@/components/ui/combobox'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { StorageService } from '@/services/storage.service'

export default function CreateChequePage() {
  const [step, setStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const queryClient = useQueryClient()

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

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      amount: 0,
      cheque_number: '',
      cheque_date: new Date().toISOString().split('T')[0],
      party_id: '',
      account_id: '',
      type: (typeParam === 'Inward' ? 'Inward' : 'Outward') as 'Outward' | 'Inward',
      notes: '',
      image_url: null as string | null,
      deposit_date: '',
    }
  })

  // Update type if query param changes
  useEffect(() => {
    if (typeParam === 'Inward' || typeParam === 'Outward') {
      setValue('type', typeParam as any)
    }
  }, [typeParam, setValue])

  const mutation = useMutation({
    mutationFn: (data: any) => ChequeService.create({ ...data, business_id: businessId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
      router.push('/cheques')
    }
  })

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  const nextStep = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['amount', 'cheque_number', 'cheque_date'])
    } else if (step === 2) {
      isValid = await trigger(['party_id', 'account_id'])
    }
    
    if (isValid) setStep(s => Math.min(s + 1, 3))
  }
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const url = await StorageService.uploadChequeImage(file)
      setValue('image_url', url)
    } catch (error: any) {
      alert("Upload failed: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

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
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Step {step} of 3</p>
          <h2 className="text-display-sm font-bold">New Cheque</h2>
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
            <div className="space-y-2">
              <Label>Cheque Type <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('type', 'Outward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-3xl p-6 border-2 transition-all active:scale-95",
                    watch('type') === 'Outward' 
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "bg-card border-transparent hover:border-primary/20"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                    watch('type') === 'Outward' ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  )}>
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "font-bold text-sm uppercase tracking-widest",
                    watch('type') === 'Outward' ? "text-primary" : "text-muted-foreground"
                  )}>Issued</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('type', 'Inward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-3xl p-6 border-2 transition-all active:scale-95",
                    watch('type') === 'Inward' 
                      ? "bg-green-500/5 border-green-500 shadow-sm" 
                      : "bg-card border-transparent hover:border-green-500/20"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                    watch('type') === 'Inward' ? "bg-green-500 text-white" : "bg-green-500/10 text-green-600"
                  )}>
                    <ArrowDownLeft className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "font-bold text-sm uppercase tracking-widest",
                    watch('type') === 'Inward' ? "text-green-600" : "text-muted-foreground"
                  )}>Received</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold">₹</span>
                <Input 
                  id="amount" 
                  type="number" 
                  {...register('amount')} 
                  className="h-16 pl-10 text-3xl font-bold border-none bg-canvas-parchment rounded-lg shadow-sm" 
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_number">Cheque Number <span className="text-destructive">*</span></Label>
              <Input id="cheque_number" {...register('cheque_number')} placeholder="6-digit number" className="h-12 rounded-xl" />
              {errors.cheque_number && <p className="text-xs text-destructive">{errors.cheque_number.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_date">Cheque Date <span className="text-destructive">*</span></Label>
              <Input id="cheque_date" type="date" {...register('cheque_date')} className="h-12 rounded-xl" />
              {errors.cheque_date && <p className="text-xs text-destructive">{errors.cheque_date.message as string}</p>}
            </div>
            
            <Button type="button" className="w-full rounded-pill h-14 text-lg shadow-product" onClick={nextStep} disabled={!watch('amount')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label>Select Party <span className="text-destructive">*</span></Label>
              <Combobox 
                options={partyOptions} 
                value={watch('party_id')} 
                onValueChange={(val) => setValue('party_id', val)} 
                placeholder="Choose a party"
                createUrl="/parties/create"
                createLabel="Add new party"
              />
              {errors.party_id && <p className="text-xs text-destructive">{errors.party_id.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label>Select Account <span className="text-destructive">*</span></Label>
              <Combobox 
                options={accountOptions} 
                value={watch('account_id')} 
                onValueChange={(val) => setValue('account_id', val)} 
                placeholder="Choose an account"
                createUrl="/accounts/create"
                createLabel="Add new account"
              />
              {errors.account_id && <p className="text-xs text-destructive">{errors.account_id.message as string}</p>}
            </div>

            <Button type="button" className="w-full rounded-pill h-14 text-lg shadow-product" onClick={nextStep} disabled={!watch('party_id') || !watch('account_id')}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cheque Photo</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-4 bg-canvas-parchment/30 min-h-[140px] transition-colors hover:bg-canvas-parchment/50">
                {watch('image_url' as any) ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-sm">
                    <img src={watch('image_url' as any)} alt="Cheque" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setValue('image_url', null)}
                      className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer py-6 w-full">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                      {isUploading ? (
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Camera className="h-7 w-7" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-primary block">
                        {isUploading ? 'Uploading Cheque...' : 'Scan / Upload Cheque'}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Take a photo of the physical cheque</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...register('notes')} placeholder="Add any notes here" className="h-12 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_date">Expected Deposit Date</Label>
              <Input id="deposit_date" type="date" {...register('deposit_date')} className="h-12 rounded-xl" />
            </div>

            <div className="rounded-3xl bg-primary/5 p-6 space-y-4 border border-primary/10 shadow-sm">
              <h3 className="font-bold text-primary uppercase tracking-widest text-[10px]">Summary</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Amount</span>
                <span className="text-xl font-black">₹{Number(watch('amount') || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Number</span>
                <span className="font-bold font-mono bg-white px-2 py-0.5 rounded shadow-sm text-primary">#{watch('cheque_number')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Party</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{selectedParty?.name || '-'}</span>
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

            <Button type="submit" className="w-full rounded-pill h-14 text-lg shadow-product" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Cheque'} <Check className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
