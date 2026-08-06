'use client'

import { useCreateBusiness } from '@/hooks/use-create-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ArrowLeft, ArrowRight01Icon as ArrowRight, Tick02Icon as Check, Building03Icon as Building2, CallIcon as Phone, Mail01Icon as Mail, Location01Icon as MapPin } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/reui/stepper'
import { Badge } from '@/components/reui/badge'
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
    <div className="max-w-2xl space-y-8 pb-20">
      <Stepper
        value={step}
        className="w-full max-w-xl mx-auto space-y-8"
        indicators={{
          completed: <HugeiconsIcon icon={Check} className="size-3.5" />,
        }}
      >
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevStep}
            disabled={step === 1}
            className="rounded-full h-8 w-8 shrink-0 hover:bg-canvas-parchment"
          >
            <HugeiconsIcon icon={ArrowLeft} className="h-4 w-4"/>
          </Button>

          <StepperNav className="gap-3 flex-1">
            {[
              { title: "Business Profile", icon: <HugeiconsIcon icon={Building2} className="size-4" /> },
              { title: "Contact Info", icon: <HugeiconsIcon icon={Phone} className="size-4" /> },
              { title: "Location", icon: <HugeiconsIcon icon={MapPin} className="size-4" /> }
            ].map((s, index) => (
              <StepperItem
                key={index}
                step={index + 1}
                className="relative flex-1 items-center"
              >
                <StepperTrigger className="flex grow flex-col items-center justify-center gap-2.5">
                  <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-success size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-background z-10">
                    {s.icon}
                  </StepperIndicator>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-muted-foreground text-[10px] font-semibold uppercase text-center">
                      Step {index + 1}
                    </div>
                    <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-center text-[10px] font-semibold">
                      {s.title}
                    </StepperTitle>
                    <div className="mt-0.5">
                      <Badge
                        size="sm"
                        variant="primary-light"
                        className="hidden group-data-[state=active]/step:inline-flex text-[8px] h-4 px-1"
                      >
                        In Progress
                      </Badge>
                      <Badge
                        variant="success-light"
                        size="sm"
                        className="hidden group-data-[state=completed]/step:inline-flex text-[8px] h-4 px-1"
                      >
                        Completed
                      </Badge>
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="text-muted-foreground hidden group-data-[state=inactive]/step:inline-flex text-[8px] h-4 px-1"
                      >
                        Pending
                      </Badge>
                    </div>
                  </div>
                </StepperTrigger>
                {3 > index + 1 && (
                  <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute inset-x-0 left-[50%] top-4 m-0 w-full z-0" />
                )}
              </StepperItem>
            ))}
          </StepperNav>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextStep}
            disabled={step === 3 || (step === 1 && !watch('name'))}
            className="rounded-full h-8 w-8 shrink-0 hover:bg-canvas-parchment"
          >
            <HugeiconsIcon icon={ArrowRight} className="h-4 w-4"/>
          </Button>
        </div>
      </Stepper>

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
                        (watch as any)('color') === c ?"ring-2 ring-primary scale-110":"hover:scale-105"
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
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"style={{ backgroundColor: (watch as any)('color') || '#007AFF' }}>
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

