'use client'

import * as React from 'react'
import PhoneInputBase, {
  getCountryCallingCode,
  type Country,
} from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon as ChevronDown,
  Tick02Icon as Check,
} from '@hugeicons/core-free-icons'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useProfile } from '@/hooks/use-profile'
import { resolveDefaultPhoneCountry, toE164 } from '@/lib/phone'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const noopSubscribe = () => () => {}

export function useDefaultPhoneCountry(): Country {
  const { profile } = useProfile()
  // Browser timezone is only known on the client; avoid a hydration mismatch.
  const browserTimeZone = React.useSyncExternalStore(
    noopSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => undefined,
  )
  return resolveDefaultPhoneCountry(profile?.time_zone, browserTimeZone)
}

function CountryFlag({ country }: { country?: Country }) {
  const Flag = country ? flags[country] : undefined
  return (
    <span className="flex h-4 w-6 shrink-0 overflow-hidden rounded-[2px] bg-muted [&_svg]:h-full [&_svg]:w-full">
      {Flag && <Flag title={country!} />}
    </span>
  )
}

interface CountrySelectProps {
  value?: Country
  onChange: (country?: Country) => void
  options: { value?: Country; label: string; divider?: boolean }[]
  disabled?: boolean
  readOnly?: boolean
}

function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
}: CountrySelectProps) {
  const t = useTranslations('Common')
  const [open, setOpen] = React.useState(false)
  const countries = options.filter(
    (o): o is { value: Country; label: string } => !!o.value && !o.divider,
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        disabled={disabled || readOnly}
        aria-label={t('selectCountry')}
        className="flex h-full shrink-0 items-center gap-1.5 border-r border-primary/10 px-3 outline-none focus-visible:bg-primary/5 disabled:opacity-50"
      >
        <CountryFlag country={value} />
        <span className="text-sm font-semibold text-muted-foreground">
          {value ? `+${getCountryCallingCode(value)}` : ''}
        </span>
        <HugeiconsIcon icon={ChevronDown} className="h-3.5 w-3.5 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 rounded-lg overflow-hidden"
        align="start"
      >
        <Command className="rounded-none">
          <CommandInput placeholder={t('searchCountry')} className="h-11" />
          <CommandList className="max-h-[280px]">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              {t('noCountryFound')}
            </CommandEmpty>
            <CommandGroup>
              {countries.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} +${getCountryCallingCode(option.value)}`}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 py-2.5 px-3"
                >
                  <CountryFlag country={option.value} />
                  <span className="flex-1 truncate">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    +{getCountryCallingCode(option.value)}
                  </span>
                  <HugeiconsIcon
                    icon={Check}
                    className={cn(
                      'h-4 w-4 text-primary',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const NumberInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground',
      className,
    )}
    {...props}
  />
))
NumberInput.displayName = 'NumberInput'

export interface PhoneInputProps {
  id?: string
  value?: string | null
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  'aria-invalid'?: boolean
}

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
}: PhoneInputProps) {
  const defaultCountry = useDefaultPhoneCountry()
  const isLegacy = !!value && !value.startsWith('+')
  const normalized = isLegacy
    ? toE164(value, defaultCountry)
    : value || undefined

  // Legacy rows stored national numbers; lift them to E.164 so the field can render them.
  React.useEffect(() => {
    if (isLegacy && normalized) onChange(normalized)
  }, [isLegacy, normalized, onChange])

  return (
    <PhoneInputBase
      id={id}
      defaultCountry={defaultCountry}
      value={normalized}
      onChange={(v) => onChange(v ?? '')}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      countrySelectComponent={CountrySelect}
      inputComponent={NumberInput}
      className={cn(
        'flex h-14 w-full items-center overflow-hidden rounded-sm bg-canvas-parchment focus-within:ring-2 focus-within:ring-primary/20',
        ariaInvalid && 'ring-2 ring-destructive/40',
        className,
      )}
    />
  )
}
