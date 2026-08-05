'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bankSchema } from '@/validators'
import { BankService } from '@/services/bank.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useBusiness } from '@/hooks/use-business'

export default function CreateBankPage() {
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_name: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
    }
  })

  const onSubmit = async (data: any) => {
    if (!activeBusiness) return
    setLoading(true)
    try {
      await BankService.create({ ...data, business_id: activeBusiness.id })
      router.push('/banks')
    } catch (error) {
      console.error(error)
      alert('Failed to create bank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-display-lg">Add Bank</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank Name *</Label>
          <Input id="bank_name" {...register('bank_name')} placeholder="e.g. ICICI Bank" />
          {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_name">Account Holder Name *</Label>
          <Input id="account_name" {...register('account_name')} placeholder="e.g. ABC Industries" />
          {errors.account_name && <p className="text-xs text-destructive">{errors.account_name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number">Account Number *</Label>
          <Input id="account_number" {...register('account_number')} placeholder="Bank account number" />
          {errors.account_number && <p className="text-xs text-destructive">{errors.account_number.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ifsc_code">IFSC Code (Optional)</Label>
          <Input id="ifsc_code" {...register('ifsc_code')} placeholder="BANK0123456" />
        </div>

        <Button type="submit" className="w-full rounded-pill h-12 text-lg" disabled={loading}>
          {loading ? 'Adding...' : 'Add Bank'}
        </Button>
      </form>
    </div>
  )
}
