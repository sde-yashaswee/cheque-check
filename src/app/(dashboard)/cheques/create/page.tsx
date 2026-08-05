'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { chequeSchema } from '@/validators'
import { ChequeService } from '@/services/cheque.service'
import { PartyService } from '@/services/party.service'
import { BankService } from '@/services/bank.service'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'

export default function CreateChequePage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const [loading, setLoading] = useState(false)

  const { data: parties } = useQuery({
    queryKey: ['parties', businessId],
    queryFn: () => PartyService.getAll(businessId!),
    enabled: !!businessId,
  })

  const { data: banks } = useQuery({
    queryKey: ['banks', businessId],
    queryFn: () => BankService.getAll(businessId!),
    enabled: !!businessId,
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      amount: 0,
      cheque_number: '',
      cheque_date: new Date().toISOString().split('T')[0],
      party_id: '',
      bank_id: '',
      type: 'Outward',
      notes: '',
      deposit_date: '',
    }
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      await ChequeService.create({ ...data, business_id: businessId })
      router.push('/cheques')
    } catch (error) {
      console.error(error)
      alert('Failed to create cheque')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        {step > 1 && (
          <Button variant="ghost" size="icon" onClick={prevStep} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-display-lg">New Cheque</h1>
      </div>

      {/* Progress Bar */}
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
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold">₹</span>
                <Input 
                  id="amount" 
                  type="number" 
                  {...register('amount')} 
                  className="h-16 pl-10 text-3xl font-bold border-none bg-canvas-parchment rounded-lg" 
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_number">Cheque Number</Label>
              <Input id="cheque_number" {...register('cheque_number')} placeholder="6-digit number" className="h-12" />
              {errors.cheque_number && <p className="text-xs text-destructive">{errors.cheque_number.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_date">Cheque Date</Label>
              <Input id="cheque_date" type="date" {...register('cheque_date')} className="h-12" />
              {errors.cheque_date && <p className="text-xs text-destructive">{errors.cheque_date.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {['Outward', 'Inward'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('type', t as any)}
                    className={cn(
                      "flex-1 rounded-pill h-11 text-sm font-semibold transition-colors",
                      watch('type') === t ? "bg-primary text-white" : "bg-canvas-parchment text-muted-foreground"
                    )}
                  >
                    {t === 'Outward' ? 'Issued' : 'Received'}
                  </button>
                ))}
              </div>
            </div>
            
            <Button type="button" className="w-full rounded-pill h-14 text-lg" onClick={nextStep}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label>Select Party</Label>
              <Select onValueChange={(val) => setValue('party_id', val)} defaultValue={watch('party_id')}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a party" />
                </SelectTrigger>
                <SelectContent>
                  {parties?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                  {parties?.length === 0 && <SelectItem value="none" disabled>No parties added</SelectItem>}
                </SelectContent>
              </Select>
              {errors.party_id && <p className="text-xs text-destructive">{errors.party_id.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label>Select Bank</Label>
              <Select onValueChange={(val) => setValue('bank_id', val)} defaultValue={watch('bank_id')}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.bank_name}</SelectItem>
                  ))}
                  {banks?.length === 0 && <SelectItem value="none" disabled>No banks added</SelectItem>}
                </SelectContent>
              </Select>
              {errors.bank_id && <p className="text-xs text-destructive">{errors.bank_id.message as string}</p>}
            </div>

            <Button type="button" className="w-full rounded-pill h-14 text-lg" onClick={nextStep}>
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" {...register('notes')} placeholder="Add any notes here" className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_date">Expected Deposit Date (Optional)</Label>
              <Input id="deposit_date" type="date" {...register('deposit_date')} className="h-12" />
            </div>

            <div className="rounded-lg bg-canvas-parchment p-6 space-y-4">
              <h3 className="font-bold">Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">₹{watch('amount').toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Number</span>
                <span className="font-medium">#{watch('cheque_number')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Party</span>
                <span className="font-medium">{parties?.find(p => p.id === watch('party_id'))?.name || '-'}</span>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-pill h-14 text-lg" disabled={loading}>
              {loading ? 'Saving...' : 'Save Cheque'} <Check className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
