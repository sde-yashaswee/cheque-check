'use client'

import { useCreateParty } from '@/hooks/use-create-party'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon as ArrowLeft,
  ArrowRight01Icon as ArrowRight,
  Tick02Icon as Check,
  UserIcon as User,
  CallIcon as Phone,
  Location01Icon as MapPin,
  TextFontIcon as TextIcon,
  Mail01Icon as Mail,
  Note01Icon as Note,
  Camera01Icon as Camera,
} from '@hugeicons/core-free-icons'
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
import { getSafeChequeReturnTo } from '@/lib/cheque-draft'
import { useEffect, useRef, useState } from 'react'
import { DraftLeaveDialog, DraftSaveFab, DraftToolbar } from '@/features/drafts'
import { toast } from '@/components/ui/toast'
import { PhoneInput, useDefaultPhoneCountry } from '@/components/ui/phone-input'
import { toE164 } from '@/lib/phone'
import { Controller } from 'react-hook-form'
import { TagSelector } from '@/features/tags/components/tag-selector'
import { tagService } from '@/features/tags/services/tag.service'
import { storageService } from '@/services/storage.service'
import { validateImageFile } from '@/lib/storage'
import { CreationSuccessScreen } from '@/components/ui/creation-success-screen'

export default function CreatePartyPage() {
  const t = useTranslations('Parties')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = getSafeChequeReturnTo(searchParams.get('returnTo'))
  // Read once: autosave later writes a new draftId into the URL for the same form.
  const [initialDraftId] = useState(() => searchParams.get('draftId'))
  const [prefill] = useState(() => ({ name: searchParams.get('name') }))
  const { activeBusiness } = useBusiness()
  const [tagIds, setTagIds] = useState<string[]>([])

  const {
    form,
    step,
    nextStep,
    prevStep,
    isSaving,
    isSuccess,
    continueAfterSuccess,
    onSubmit,
    draft,
  } = useCreateParty(activeBusiness?.id, {
    returnTo,
    draftId: initialDraftId,
    onCreated: async (party) => {
      await Promise.all(
        tagIds.map((tagId) =>
          tagService.attach({
            tag_id: tagId,
            entity_type: 'party',
            entity_id: party.id,
          }),
        ),
      )
    },
  })

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form
  const { setUserValue } = draft

  useEffect(() => {
    if (initialDraftId) return
    if (prefill.name) setValue('name', prefill.name)
  }, [initialDraftId, prefill, setValue])
  const defaultPhoneCountry = useDefaultPhoneCountry()
  const importContact = async () => {
    const contacts = (
      navigator as Navigator & {
        contacts?: {
          select: (
            properties: string[],
            options: { multiple: boolean },
          ) => Promise<Array<{ name?: string[]; tel?: string[] }>>
        }
      }
    ).contacts

    if (!contacts) {
      toast.add({
        title: tCommon('contactPickerUnavailable'),
        description: t('contactPickerUnavailable'),
        type: 'info',
      })
      return
    }

    try {
      const contactList = await contacts.select(['name', 'tel'], {
        multiple: false,
      })
      const contact = contactList[0]
      const fullName = contact?.name?.[0]?.trim()
      const phone = contact?.tel?.[0]?.trim()
      if (fullName) setValue('name', fullName)
      if (phone)
        setValue('contact', toE164(phone, defaultPhoneCountry) ?? phone)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.add({
        title: tCommon('error'),
        description: t('contactImportFailed'),
        type: 'error',
      })
    }
  }

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await validateImageFile(file, 5 * 1024 * 1024)
    } catch (error) {
      toast.add({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : tCommon('error'),
        type: 'error',
      })
      return
    }
    setAvatarFile(file)
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  // Avatar is only uploaded to storage right before the party itself is created.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (avatarFile) {
      setIsAvatarUploading(true)
      try {
        const url = await storageService.uploadAvatar(avatarFile)
        setValue('avatar_url', url)
      } catch (error) {
        setIsAvatarUploading(false)
        toast.add({
          title: tCommon('error'),
          description: tCommon('avatarUploadFailed'),
          type: 'error',
        })
        return
      }
      setIsAvatarUploading(false)
    }
    await onSubmit(e)
  }

  const colors = [
    '#FF3B30',
    '#FF9500',
    '#FFCC00',
    '#34C759',
    '#007AFF',
    '#5856D6',
    '#AF52DE',
  ]

  if (isSuccess) {
    return (
      <div className="max-w-2xl">
        <CreationSuccessScreen
          title={t('successTitle')}
          description={t('successDescription')}
          ctaLabel={t('successCta')}
          onContinue={continueAfterSuccess}
        />
      </div>
    )
  }

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
            <HugeiconsIcon icon={ArrowLeft} className="h-4 w-4" />
          </Button>

          <StepperNav className="gap-3 flex-1">
            {[
              {
                title: t('basicDetails'),
                icon: <HugeiconsIcon icon={User} className="size-4" />,
              },
              {
                title: t('contactInfo'),
                icon: <HugeiconsIcon icon={Phone} className="size-4" />,
              },
              {
                title: t('locationNotes'),
                icon: <HugeiconsIcon icon={MapPin} className="size-4" />,
              },
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
            <HugeiconsIcon icon={ArrowRight} className="h-4 w-4" />
          </Button>
        </div>
      </Stepper>

      <DraftToolbar status={draft.status} />
      <DraftLeaveDialog {...draft.leaveDialogProps} />
      <DraftSaveFab
        status={draft.status}
        hasUserChanges={draft.hasUserChanges}
        onSave={() => void draft.saveDraft()}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    aria-label={t('addPhoto')}
                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary ring-2 ring-white shadow-sm transition-transform active:scale-95"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt={t('partyAvatar')}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <HugeiconsIcon icon={User} className="h-8 w-8" />
                    )}
                  </button>
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white ring-2 ring-white">
                    <HugeiconsIcon icon={Camera} className="h-3.5 w-3.5" />
                  </span>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleAvatarChange(e)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  {t('partyName')}
                </Label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={User}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"
                  />
                  <Input
                    leftIcon={User}
                    id="name"
                    {...register('name')}
                    placeholder={t('enterFullName')}
                    className="h-14  bg-canvas-parchment border-none text-lg font-semibold rounded-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={importContact}
                    aria-label={t('importFromContacts')}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                  >
                    <HugeiconsIcon icon={User} className="h-5 w-5" />
                  </button>
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive ml-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  {tCommon('themeColor')}
                </Label>
                <div className="flex flex-wrap gap-3 p-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setUserValue('color', c)}
                      className={cn(
                        'h-10 w-10 rounded-full transition-all active:scale-95 ring-offset-2',
                        (watch as any)('color') === c
                          ? 'ring-2 ring-primary scale-110'
                          : 'hover:scale-105',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="button"
              data-testid="party-step1-continue"
              className="w-full rounded-full h-14 text-lg"
              onClick={nextStep}
              disabled={!watch('name')}
            >
              {tCommon('continue')}{' '}
              <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label
                htmlFor="contact"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('contactNumber')}
              </Label>
              <Controller
                control={control}
                name="contact"
                render={({ field }) => (
                  <PhoneInput
                    id="contact"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('phoneNumber')}
                    aria-invalid={!!errors.contact}
                  />
                )}
              />
              {errors.contact && (
                <p className="text-xs text-destructive ml-1">
                  {errors.contact.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {tCommon('email')}
              </Label>
              <Input
                leftIcon={Mail}
                id="email"
                {...register('email')}
                placeholder={t('emailPlaceholder')}
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
            </div>

            <Button
              type="button"
              data-testid="party-step2-continue"
              className="w-full rounded-full h-14 text-lg"
              onClick={nextStep}
              disabled={!watch('contact')}
            >
              {tCommon('continue')}{' '}
              <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {tCommon('address')}
              </Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={MapPin}
                  className="absolute left-4 top-4 h-5 w-5 text-muted-foreground opacity-50"
                />
                <Input
                  leftIcon={MapPin}
                  id="address"
                  {...register('address')}
                  placeholder={t('locationDetails')}
                  className="h-14  bg-canvas-parchment border-none rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {tCommon('notes')}
              </Label>
              <Input
                leftIcon={Note}
                id="notes"
                {...register('notes')}
                placeholder={t('anyAdditionalNotes')}
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                {tCommon('tags')}
              </Label>
              <TagSelector
                businessId={activeBusiness?.id}
                value={tagIds}
                onChange={setTagIds}
                placeholder={tCommon('addTags')}
              />
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={User}
                  className="h-3 w-3 text-primary opacity-80"
                />
                <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">
                  {t('reviewInformation')}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{
                    backgroundColor: (watch as any)('color') || '#34C759',
                  }}
                />
                <div>
                  <p className="font-semibold">{watch('name')}</p>
                  <p className="text-xs text-muted-foreground">
                    {watch('contact')}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="party-submit-button"
              className="w-full rounded-full h-14 text-lg"
              disabled={isSaving || isAvatarUploading}
            >
              {isSaving || isAvatarUploading
                ? tCommon('saving')
                : t('createParty')}{' '}
              <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
