import { getCountryForTimezone } from 'countries-and-timezones'
import {
  isSupportedCountry,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/min'

export const FALLBACK_PHONE_COUNTRY: CountryCode = 'IN'

export function countryFromTimeZone(
  timeZone: string | null | undefined,
): CountryCode | undefined {
  if (!timeZone) return undefined
  const id = getCountryForTimezone(timeZone)?.id
  return id && isSupportedCountry(id) ? id : undefined
}

function browserTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

export function resolveDefaultPhoneCountry(
  profileTimeZone: string | null | undefined,
  fallbackTimeZone: string | undefined = browserTimeZone(),
): CountryCode {
  return (
    countryFromTimeZone(profileTimeZone) ??
    countryFromTimeZone(fallbackTimeZone) ??
    FALLBACK_PHONE_COUNTRY
  )
}

/** Converts legacy national-format numbers to E.164; returns undefined if unparseable. */
export function toE164(
  value: string | null | undefined,
  defaultCountry: CountryCode,
): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return parsePhoneNumberFromString(trimmed, defaultCountry)?.number
}

export function isValidE164Phone(value: string): boolean {
  return value.startsWith('+') && isValidPhoneNumber(value)
}
