'use client'

import { useCreateBusiness } from '@/hooks/use-create-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ArrowLeft, ArrowRight01Icon as ArrowRight, Tick02Icon as Check, Building03Icon as Building2, CallIcon as Phone, Mail01Icon as Mail, Location01Icon as MapPin } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function CreateBusinessPage() {
  const t = useTranslations('Businesses')
  const tc = useTranslations('Common')
  const router = useRouter()
  
  const {
    form,
    step,
    nextStep,
    prevStep,
    isSaving,
    onSubmit,
  } = useCreateBusiness()

  const { register, watch, setValue, formState: { errors } } = form

  const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#8E8E93']

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost"size="icon"onClick={() => step > 1 ? prevStep() : router.back()} className="rounded-full">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5"/>
        </Button>
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{tc('step', { step, total: 3 })}</p>
          <h2 className="text-display-sm font-semibold">{t('newBusiness')}</h2>
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= step ?"bg-primary":"bg-canvas-parchment"
            )} 
          />
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('businessName')}</Label>
                <div className="relative">
                  <HugeiconsIcon icon={Building2} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
                  <Input 
                    id="name"
                    {...register('name')} 
                    placeholder="e.g. Acme Corp"
                    className="h-14 pl-12 bg-canvas-parchment border-none text-lg font-semibold rounded-sm"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{tc('themeColor')}</Label>
                <div className="flex flex-wrap gap-3 p-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('color', c)}
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
            
            <Button type="button"className="w-full rounded-full h-14 text-lg"onClick={nextStep} disabled={!watch('name')}>
              {tc('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="email"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('businessEmail')}</Label>
              <div className="relative">
                <HugeiconsIcon icon={Mail} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
                <Input 
                  id="email"
                  {...register('email')} 
                  placeholder="contact@business.com"
                  className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive ml-1">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('businessPhone')}</Label>
              <div className="relative">
                <HugeiconsIcon icon={Phone} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
                <Input 
                  id="phone"
                  {...register('phone')} 
                  placeholder="+91 ..."
                  className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
            </div>

            <Button type="button"className="w-full rounded-full h-14 text-lg"onClick={nextStep} disabled={!watch('email')}>
              {tc('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="address"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('businessAddress')}</Label>
              <div className="relative">
                <HugeiconsIcon icon={MapPin} className="absolute left-4 top-4 h-5 w-5 text-muted-foreground opacity-50"/>
                <Input id="address"{...register('address')} placeholder="Headquarters location"className="h-14 pl-12 bg-canvas-parchment border-none rounded-sm"/>
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Building2} className="h-3 w-3 text-primary opacity-80"/>
                <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">{t('businessSummary')}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"style={{ backgroundColor: watch('color' as any) || '#007AFF' }}>
                  {watch('name')?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="font-semibold">{watch('name')}</p>
                  <p className="text-xs text-muted-foreground">{watch('email')}</p>
                </div>
              </div>
            </div>

            <Button type="submit"className="w-full rounded-full h-14 text-lg"disabled={isSaving}>
              {isSaving ? t('creatingBusiness') : t('newBusiness')} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

