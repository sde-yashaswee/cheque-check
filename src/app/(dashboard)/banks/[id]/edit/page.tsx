'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bankSchema } from '@/validators'
import { BankService } from '@/services/bank.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Check, Landmark, User, CreditCard, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditBankPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const queryClient = useQueryClient()
  
  const { data: bank, isLoading } = useQuery({
    queryKey: ['bank', id],
    queryFn: () => BankService.getById(id),
  })

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(bankSchema),
  })

  useEffect(() => {
    if (bank) {
      reset({
        bank_name: bank.bank_name,
        account_name: bank.account_name,
        account_number: bank.account_number,
        ifsc_code: bank.ifsc_code || '',
        color: bank.color,
      })
    }
  }, [bank, reset])

  const mutation = useMutation({
    mutationFn: (data: any) => BankService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks', activeBusiness?.id] })
      queryClient.invalidateQueries({ queryKey: ['bank', id] })
      router.back()
    }
  })

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30', '#FF9500', '#34C759']

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
            <Label htmlFor="bank_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bank Name <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="bank_name" 
                {...register('bank_name')} 
                placeholder="e.g. ICICI Bank" 
                className="h-14 pl-12 bg-canvas-parchment border-none text-lg font-medium rounded-2xl shadow-sm"
              />
            </div>
            {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Holder Name <span className="text-destructive">*</span></Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="account_name" 
                {...register('account_name')} 
                placeholder="e.g. John Doe" 
                className="h-14 pl-12 bg-canvas-parchment border-none rounded-2xl shadow-sm"
              />
            </div>
            {errors.account_name && <p className="text-xs text-destructive">{errors.account_name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Number <span className="text-destructive">*</span></Label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="account_number" 
                {...register('account_number')} 
                placeholder="Enter full number" 
                className="h-14 pl-12 bg-canvas-parchment border-none rounded-2xl shadow-sm"
              />
            </div>
            {errors.account_number && <p className="text-xs text-destructive">{errors.account_number.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifsc_code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">IFSC Code</Label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="ifsc_code" {...register('ifsc_code')} placeholder="BANK0123456" className="h-14 pl-12 bg-canvas-parchment border-none uppercase rounded-2xl shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand Color</Label>
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
            {mutation.isPending ? 'Saving...' : 'Update Bank'} <Check className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
