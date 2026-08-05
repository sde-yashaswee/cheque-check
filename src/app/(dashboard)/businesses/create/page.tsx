'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessSchema } from '@/validators'
import { BusinessService } from '@/services/business.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    }
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      await BusinessService.create(data)
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Failed to create business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-display-lg">Create Business</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Business Name</Label>
          <Input id="name" {...register('name')} placeholder="e.g. ABC Industries" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" {...register('email')} placeholder="contact@business.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" {...register('phone')} placeholder="+91 ..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address (Optional)</Label>
          <Input id="address" {...register('address')} placeholder="Business location" />
        </div>

        <Button type="submit" className="w-full rounded-pill h-12 text-lg" disabled={loading}>
          {loading ? 'Creating...' : 'Create Business'}
        </Button>
      </form>
    </div>
  )
}
