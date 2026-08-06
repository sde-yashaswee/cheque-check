'use client'

import { useCreateCheque } from '@/hooks/use-create-cheque'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ArrowLeft, ArrowRight01Icon as ArrowRight, Tick02Icon as Check, Camera01Icon as Camera, Cancel01Icon as X, ArrowUpRight01Icon as ArrowUpRight, ArrowDownLeft01Icon as ArrowDownLeft, Invoice01Icon as ReceiptText } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'
import { Combobox } from '@/components/ui/combobox'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/toast'

export default function CreateChequePage() {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const imageUrlParam = searchParams.get('imageUrl')
  const actionParam = searchParams.get('action')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const [isExtracting, setIsExtracting] = useState(false)

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

  const { parties } = useParties(businessId)

  useEffect(() => {
    if (actionParam === 'ocr' && imageUrlParam && !isExtracting) {
      const extractData = async () => {
        setIsExtracting(true)
        setValue('image_url', imageUrlParam)
        
        toast.add({
          title: t('scan'),
          description: t('loading'),
          type: 'loading',
        })

        try {
          const response = await fetch('/api/ocr/cheque', {
            method: 'POST',
            body: JSON.stringify({ imageUrl: imageUrlParam }),
            headers: { 'Content-Type': 'application/json' },
          })

          if (!response.ok) throw new Error('Failed to extract data')

          const data = await response.json()
          
          if (data.amount !== null) setValue('amount', data.amount)
          if (data.cheque_number !== null) setValue('cheque_number', data.cheque_number)
          if (data.cheque_date !== null) setValue('cheque_date', data.cheque_date)
          
          // Attempt to match party
          if (data.payee_name !== null && parties) {
            const matchedParty = parties.find(p => 
              p.name.toLowerCase().includes(data.payee_name.toLowerCase()) ||
              data.payee_name.toLowerCase().includes(p.name.toLowerCase())
            )
            if (matchedParty) {
              setValue('party_id', matchedParty.id)
              toast.add({
                title: tCommon('success'),
                description: `Matched party: ${matchedParty.name}`,
                type: 'success',
              })
            } else {
              toast.add({
                title: t('scan'),
                description: `Extracted payee: ${data.payee_name}`,
                type: 'info',
              })
            }
          }

          toast.add({
            title: tCommon('success'),
            description: "Cheque details extracted successfully",
            type: 'success',
          })
        } catch (error) {
          console.error('OCR Error:', error)
          toast.add({
            title: tCommon('error'),
            description: "Failed to extract cheque details",
            type: 'error',
          })
        } finally {
          setIsExtracting(false)
        }
      }

      extractData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionParam, imageUrlParam, parties, setValue, t, tCommon])

  const { accounts } = useAccounts(businessId)

  const partyOptions = parties?.map(p => ({ 
    label: p.name, 
    value: p.id,
    color: (p as any).color,
    icon: (p as any).icon,
    imageUrl: (p as any).avatar_url
  })) || []

  const accountOptions = accounts?.map(b => ({ 
    label: `${(b as any).bank?.name || 'Bank'} (${b.account_number.slice(-4)})`, 
    value: b.id,
    color: (b as any).color,
    icon: (b as any).icon,
    imageUrl: (b as any).bank?.logo_url
  })) || []

  const selectedParty = parties?.find(p => p.id === watch('party_id'))

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        {step > 1 && (
          <Button variant="ghost"size="icon"onClick={prevStep} className="rounded-full">
            <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5"/>
          </Button>
        )}
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{tCommon('step', { step, total: 3 })}</p>
          <h2 className="text-display-sm font-semibold">{t('newCheque')}</h2>
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= step ? "bg-primary": "bg-canvas-parchment"
            )} 
          />
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('type')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('type', 'Outward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-95",
                    watch('type') === 'Outward' 
                      ? "bg-primary/5 border-primary"
                      : "bg-card border-primary/5"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-sm flex items-center justify-center transition-colors",
                    watch('type') === 'Outward' ? "bg-primary text-white": "bg-primary/10 text-primary"
                  )}>
                    <HugeiconsIcon icon={ArrowUpRight} className="h-6 w-6"/>
                  </div>
                  <span className={cn(
                    "font-semibold text-xs uppercase tracking-wider",
                    watch('type') === 'Outward' ? "text-primary": "text-muted-foreground"
                  )}>{t('issued')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('type', 'Inward')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-95",
                    watch('type') === 'Inward' 
                      ? "bg-green-500/5 border-green-500"
                      : "bg-card border-primary/5"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-sm flex items-center justify-center transition-colors",
                    watch('type') === 'Inward' ? "bg-green-500 text-white": "bg-green-500/10 text-green-600"
                  )}>
                    <HugeiconsIcon icon={ArrowDownLeft} className="h-6 w-6"/>
                  </div>
                  <span className={cn(
                    "font-semibold text-xs uppercase tracking-wider",
                    watch('type') === 'Inward' ? "text-green-600": "text-muted-foreground"
                  )}>{t('received')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('amount')}</Label>
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
              <Label htmlFor="cheque_number"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('chequeNumber')}</Label>
              <Input id="cheque_number"{...register('cheque_number')} placeholder={t('chequeNumberPlaceholder')} className="h-12 rounded-sm"/>
              {errors.cheque_number && <p className="text-xs text-destructive ml-1">{errors.cheque_number.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cheque_date"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('chequeDate')}</Label>
              <Input id="cheque_date"type="date"{...register('cheque_date')} className="h-12 rounded-sm"/>
              {errors.cheque_date && <p className="text-xs text-destructive ml-1">{errors.cheque_date.message as string}</p>}
            </div>
            
            <Button type="button"className="w-full rounded-full h-14 text-lg"onClick={nextStep} disabled={!watch('amount')}>
              {tCommon('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('party')}</Label>
              <Combobox 
                options={partyOptions} 
                value={watch('party_id')} 
                onValueChange={(val) => setValue('party_id', val)} 
                placeholder={t('partyPlaceholder')}
                createUrl="/parties/create"
                createLabel={t('addParty')}
              />
              {errors.party_id && <p className="text-xs text-destructive ml-1">{errors.party_id.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('account')}</Label>
              <Combobox 
                options={accountOptions} 
                value={watch('account_id')} 
                onValueChange={(val) => setValue('account_id', val)} 
                placeholder={t('accountPlaceholder')}
                createUrl="/accounts/create"
                createLabel={t('addAccount')}
              />
              {errors.account_id && <p className="text-xs text-destructive ml-1">{errors.account_id.message as string}</p>}
            </div>

            <Button type="button"className="w-full rounded-full h-14 text-lg"onClick={nextStep} disabled={!watch('party_id') || !watch('account_id')}>
              {tCommon('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('photo')}</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-canvas-parchment/30 min-h-[140px] transition-colors hover:bg-canvas-parchment/50 border-primary/10">
                {watch('image_url' as any) ? (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={watch('image_url' as any)} alt="Cheque"className="w-full h-full object-cover"/>
                    <button 
                      type="button"
                      onClick={() => setValue('image_url', null)}
                      className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <HugeiconsIcon icon={X} className="h-4 w-4"/>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer py-6 w-full">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {isUploading ? (
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full"/>
                      ) : (
                        <HugeiconsIcon icon={Camera} className="h-7 w-7"/>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-primary block">
                        {isUploading ? t('uploading') : t('scanUpload')}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{t('photoInstruction')}</p>
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
              <Label htmlFor="notes"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('notes')}</Label>
              <Input id="notes"{...register('notes')} placeholder={t('notesPlaceholder')} className="h-12 rounded-sm"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_date"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('depositDate')}</Label>
              <Input id="deposit_date"type="date"{...register('deposit_date')} className="h-12 rounded-sm"/>
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ReceiptText} className="h-3 w-3 text-primary opacity-80"/>
                <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">{t('summary')}</h3>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">{t('amount')}</span>
                <span className="text-xl font-semibold text-primary">₹{Number(watch('amount') || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">{t('number')}</span>
                <span className="font-semibold font-mono bg-white px-2 py-0.5 rounded border border-primary/10 text-primary">#{watch('cheque_number')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">{t('party')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{selectedParty?.name || '-'}</span>
                  {selectedParty && (
                    <EntityAvatar 
                      name={selectedParty.name} 
                      color={(selectedParty as any).color} 
                      icon={(selectedParty as any).icon} 
                      imageUrl={(selectedParty as any).avatar_url}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>

            <Button type="submit"className="w-full rounded-full h-14 text-lg"disabled={isSaving}>
              {isSaving ? tCommon('saving') : t('saveAction')} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

