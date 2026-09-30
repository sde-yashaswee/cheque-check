import { describe, expect, it, vi } from 'vitest'
import { ValidationError } from '@/lib/errors'
import {
  AccountDraftService,
  ChequeDraftService,
  PartyDraftService,
} from './draft.service'

const completeCheque = {
  cheque_number: '123456',
  amount: 2500,
  cheque_date: '2026-10-01',
  deposit_date: '2026-10-02',
  party_id: 'p1',
  account_id: 'a1',
  type: 'Inward' as const,
  notes: '',
  image_url: undefined,
}

function chequeRepository(overrides: Record<string, unknown> = {}) {
  return {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    publish: vi.fn().mockResolvedValue({ ...completeCheque, id: 'd1' }),
    hasNumberConflict: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

describe('ChequeDraftService', () => {
  it('publishes a complete draft with its initial status and reminder', async () => {
    const repository = chequeRepository()
    const service = new ChequeDraftService(repository, {
      deleteChequeImage: vi.fn(),
    })

    const published = await service.publish('d1', completeCheque, 3)

    expect(repository.publish).toHaveBeenCalledWith('d1', {
      ...completeCheque,
      notes: null,
      image_url: null,
      remind_before_days: 3,
      status: 'Received',
    })
    expect(published.id).toBe('d1')
  })

  it('refuses to publish an incomplete draft', async () => {
    const repository = chequeRepository()
    const service = new ChequeDraftService(repository, {
      deleteChequeImage: vi.fn(),
    })

    await expect(
      service.publish('d1', { ...completeCheque, cheque_number: '12' }, null),
    ).rejects.toBeInstanceOf(ValidationError)
    expect(repository.publish).not.toHaveBeenCalled()
  })

  it('deletes the draft image along with the draft', async () => {
    const repository = chequeRepository({
      getById: vi.fn().mockResolvedValue({ id: 'd1', image_url: '/img' }),
    })
    const storage = { deleteChequeImage: vi.fn().mockResolvedValue(undefined) }
    const service = new ChequeDraftService(repository, storage)

    await service.delete('d1')

    expect(repository.delete).toHaveBeenCalledWith('d1')
    expect(storage.deleteChequeImage).toHaveBeenCalledWith('/img')
  })

  it('still deletes the draft when image cleanup fails', async () => {
    const repository = chequeRepository({
      getById: vi.fn().mockResolvedValue({ id: 'd1', image_url: '/img' }),
    })
    const storage = {
      deleteChequeImage: vi.fn().mockRejectedValue(new Error('storage down')),
    }
    const service = new ChequeDraftService(repository, storage)

    await expect(service.delete('d1')).resolves.toBeUndefined()
    expect(repository.delete).toHaveBeenCalledWith('d1')
  })

  it('skips image cleanup for drafts without an image', async () => {
    const repository = chequeRepository({
      getById: vi.fn().mockResolvedValue({ id: 'd1', image_url: null }),
    })
    const storage = { deleteChequeImage: vi.fn() }
    const service = new ChequeDraftService(repository, storage)

    await service.delete('d1')

    expect(storage.deleteChequeImage).not.toHaveBeenCalled()
  })

  it('delegates cheque number conflict checks', async () => {
    const repository = chequeRepository()
    const service = new ChequeDraftService(repository, {
      deleteChequeImage: vi.fn(),
    })

    await expect(service.hasNumberConflict('b1', 'a1', '123456')).resolves.toBe(
      true,
    )
    expect(repository.hasNumberConflict).toHaveBeenCalledWith(
      'b1',
      'a1',
      '123456',
    )
  })
})

describe('PartyDraftService', () => {
  it('publishes with empty optional fields stored as null', async () => {
    const repository = {
      ...chequeRepository(),
      publish: vi.fn().mockResolvedValue({ id: 'p1' }),
    }
    const service = new PartyDraftService(repository)

    await service.publish('p1', {
      name: 'Acme',
      contact: '+919876543210',
      email: '',
      address: '',
      notes: '',
    })

    expect(repository.publish).toHaveBeenCalledWith('p1', {
      name: 'Acme',
      contact: '+919876543210',
      email: null,
      address: null,
      notes: null,
      avatar_url: null,
    })
  })

  it('refuses to publish without a contact', async () => {
    const service = new PartyDraftService(chequeRepository())
    await expect(
      service.publish('p1', { name: 'Acme', contact: '' }),
    ).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('AccountDraftService', () => {
  it('publishes with empty optional fields stored as null', async () => {
    const repository = {
      ...chequeRepository(),
      publish: vi.fn().mockResolvedValue({ id: 'a1' }),
    }
    const service = new AccountDraftService(repository)

    await service.publish('a1', {
      bank_id: 'b1',
      account_name: 'Main',
      account_number: '0001',
      ifsc_code: '',
      notes: '',
    })

    expect(repository.publish).toHaveBeenCalledWith('a1', {
      bank_id: 'b1',
      account_name: 'Main',
      account_number: '0001',
      ifsc_code: null,
      notes: null,
      opening_balance: 0,
      is_default: false,
    })
  })
})
