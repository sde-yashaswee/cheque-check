import { describe, expect, it } from 'vitest'
import {
  countryFromTimeZone,
  isValidE164Phone,
  resolveDefaultPhoneCountry,
  toE164,
} from './phone'

describe('countryFromTimeZone', () => {
  it('maps IANA time zones to countries', () => {
    expect(countryFromTimeZone('Asia/Kolkata')).toBe('IN')
    expect(countryFromTimeZone('America/New_York')).toBe('US')
    expect(countryFromTimeZone('Europe/London')).toBe('GB')
  })

  it('returns undefined for zones without a country', () => {
    expect(countryFromTimeZone('UTC')).toBeUndefined()
    expect(countryFromTimeZone(null)).toBeUndefined()
  })
})

describe('resolveDefaultPhoneCountry', () => {
  it('prefers the profile time zone', () => {
    expect(resolveDefaultPhoneCountry('Europe/London', 'Asia/Kolkata')).toBe(
      'GB',
    )
  })

  it('falls back to the browser time zone, then India', () => {
    expect(resolveDefaultPhoneCountry('UTC', 'America/New_York')).toBe('US')
    expect(resolveDefaultPhoneCountry(null, undefined)).toBe('IN')
  })
})

describe('toE164', () => {
  it('parses legacy national numbers with the default country', () => {
    expect(toE164('98765 43210', 'IN')).toBe('+919876543210')
    expect(toE164('+1 415 555 2671', 'IN')).toBe('+14155552671')
  })

  it('returns undefined for blank or unparseable input', () => {
    expect(toE164('', 'IN')).toBeUndefined()
    expect(toE164('abc', 'IN')).toBeUndefined()
  })
})

describe('isValidE164Phone', () => {
  it('requires a valid international number', () => {
    expect(isValidE164Phone('+919876543210')).toBe(true)
    expect(isValidE164Phone('9876543210')).toBe(false)
    expect(isValidE164Phone('+91123')).toBe(false)
  })
})
