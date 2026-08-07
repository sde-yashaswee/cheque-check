'use client'

import { useCreateParty } from '@/hooks/use-create-party'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react';
import {  ArrowLeft01Icon as ArrowLeft, ArrowRight01Icon as ArrowRight, Tick02Icon as Check, UserIcon as User, CallIcon as Phone, Location01Icon as MapPin , TextFontIcon as TextIcon, Mail01Icon as Mail, Note01Icon as Note } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from '@/components/reui/stepper'
import { useTranslations } from 'next-intl'

export default function CreatePartyPage() {
  const t = useTranslations('Parties')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  
  const {
    form,
    step,
    nextStep,
    prevStep,
    isSaving,
    onSubmit,
  } = useCreateParty(activeBusiness?.id)

  const { register, watch, setValue, formState: { errors } } = form

  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE']

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
              { title: "Basic Details", icon: <HugeiconsIcon icon={User} className="size-4" /> },
              { title: "Contact Info", icon: <HugeiconsIcon icon={Phone} className="size-4" /> },
              { title: "Location & Notes", icon: <HugeiconsIcon icon={MapPin} className="size-4" /> }
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
                <Label htmlFor="name"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('partyName')}</Label>
                <div className="relative">
                  <HugeiconsIcon icon={User} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
                  <Input leftIcon={User}  
                    id="name"
                    {...register('name')} 
                    placeholder={t('enterFullName')} 
                    className="h-14  bg-canvas-parchment border-none text-lg font-semibold rounded-sm"
                   />
                </div>
                {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{tCommon('themeColor')}</Label>
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
              {tCommon('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="contact"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{t('contactNumber')}</Label>
              <div className="relative">
                <HugeiconsIcon icon={Phone} className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"/>
                <Input leftIcon={TextIcon}  
                  id="contact"
                  {...register('contact')} 
                  placeholder={t('phoneNumber')} 
                  className="h-14  bg-canvas-parchment border-none rounded-sm"
                 />
              </div>
              {errors.contact && <p className="text-xs text-destructive ml-1">{errors.contact.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{tCommon('email')}</Label>
              <Input leftIcon={Mail}  id="email"{...register('email')} placeholder="email@address.com"className="h-14 bg-canvas-parchment border-none rounded-sm" />
            </div>

            <Button type="button"className="w-full rounded-full h-14 text-lg"onClick={nextStep} disabled={!watch('contact')}>
              {tCommon('continue')} <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="address"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{tCommon('address')}</Label>
              <div className="relative">
                <HugeiconsIcon icon={MapPin} className="absolute left-4 top-4 h-5 w-5 text-muted-foreground opacity-50"/>
                <Input leftIcon={Location}  id="address"{...register('address')} placeholder={t('locationDetails')} className="h-14  bg-canvas-parchment border-none rounded-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes"className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">{tCommon('notes')}</Label>
              <Input leftIcon={Note}  id="notes"{...register('notes')} placeholder={t('anyAdditionalNotes')} className="h-14 bg-canvas-parchment border-none rounded-sm" />
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={User} className="h-3 w-3 text-primary opacity-80"/>
                <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">{t('reviewInformation')}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full"style={{ backgroundColor: (watch as any)('color') || '#34C759' }} />
                <div>
                  <p className="font-semibold">{watch('name')}</p>
                  <p className="text-xs text-muted-foreground">{watch('contact')}</p>
                </div>
              </div>
            </div>

            <Button type="submit"className="w-full rounded-full h-14 text-lg"disabled={isSaving}>
              {isSaving ? tCommon('saving') : t('createParty')} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5"/>
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

