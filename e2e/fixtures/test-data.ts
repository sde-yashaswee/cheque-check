import { randomUUID } from 'node:crypto'

/**
 * All e2e-created data must be identifiable so `scripts/e2e-cleanup.ts` can
 * safely purge it from the shared staging project without touching real data.
 */
const E2E_EMAIL_DOMAIN = 'e2e.chequecheck.test'

export function uniqueE2eEmail(label = 'user') {
  return `e2e-${label}-${randomUUID()}@${E2E_EMAIL_DOMAIN}`
}

export function uniqueE2eName(label: string) {
  return `e2e-${label}-${randomUUID().slice(0, 8)}`
}

export const E2E_PASSWORD = 'E2e-Test-Password-1!'
export const E2E_PHONE = '+919810000000'

/** 6-digit cheque numbers are required by the cheque schema; keep them unique per test. */
export function uniqueChequeNumber() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function e2eUser(label = 'user') {
  return {
    name: uniqueE2eName(label),
    email: uniqueE2eEmail(label),
    password: E2E_PASSWORD,
  }
}

export function e2eBusinessName(label = 'business') {
  return uniqueE2eName(label)
}
