'use client'

import { useEditAccount } from '@/hooks/use-edit-account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon as Check, UserIcon as User, CreditCardIcon as CreditCard, HashtagIcon as Hash, Delete02Icon as Trash2 } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

const DeleteConfirmationDialog = dynamic(() => import('@/components/ui/delete-dialog').then(mod => mod.DeleteConfirmationDialog), {
  loading: () => <Skeleton className="h-14 w-full rounded-full"/>,
  ssr: false
})

const BankSelector = dynamic(() => import('@/components/bank-selector').then(mod => mod.BankSelector), {
  loading: () => <Skeleton className="h-14 w-full rounded-2xl"/>,
  ssr: false
})

export default function EditAccountPage() {
  const t = useTranslations('Accounts')
  const tc = useTranslations('Common')
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  
  const {
    form,
    account,
    isLoading,
    isSaving,
    onSubmit,
    onDelete,
  } = useEditAccount(id, activeBusiness?.id)

  const { register, watch, setValue, formState: { errors } } = form

  const colors = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30', '#FF9500', '#34C759']

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-14 w-full rounded-lg"/>
        <Skeleton className="h-14 w-full rounded-lg"/>
        <Skeleton className="h-14 w-full rounded-lg"/>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('bank')}</Label>
            <BankSelector 
              value={watch('bank_id')}
              onValueChange={(val) => setValue('bank_id', val)}
            />
            {errors.bank_id && <p className="text-xs text-destructive ml-1">{errors.bank_id.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_name"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('accountName')}</Label>
            <div className="relative">
              <HugeiconsIcon icon={User} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
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
            <Label htmlFor="account_number"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('accountNumber')}</Label>
            <div className="relative">
              <HugeiconsIcon icon={CreditCard} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
              <Input 
                id="account_number"
                {...register('account_number')} 
                placeholder={t('accountNumberPlaceholder')} 
                className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm"
              />
            </div>
            {errors.account_number && <p className="text-xs text-destructive ml-1">{errors.account_number.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifsc_code"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('ifscCode')}</Label>
            <div className="relative">
              <HugeiconsIcon icon={Hash} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
              <Input id="ifsc_code"{...register('ifsc_code')} placeholder={t('ifscPlaceholder')} className="h-14 pl-12 bg-canvas-parchment border-none uppercase rounded-sm"/>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{tc('themeColor')}</Label>
            <div className="flex flex-wrap gap-3 p-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color' as any, c)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all active:scale-95 ring-offset-2",
                    watch('color' as any) === c ?"ring-2 ring-primary scale-110":"hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button type="submit"className="w-full rounded-full h-14 text-lg"disabled={isSaving}>
            {isSaving ? tc('saving') : t('updateAccount')} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5"/>
          </Button>

          <DeleteConfirmationDialog 
            title={t('deleteConfirmTitle')}
            description={t('deleteConfirmDesc')}
            confirmName={account?.bank?.name || 'Account'}
            onDelete={async () => { onDelete() }}
            trigger={
              <Button type="button"variant="ghost"className="w-full rounded-full h-14 text-muted-foreground hover:text-destructive transition-colors">
                <HugeiconsIcon icon={Trash2} className="mr-2 h-5 w-5"/> {t('deleteAccount')}
              </Button>
            }
          />
        </div>
      </form>
    </div>
  )
}

