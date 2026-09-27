import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toPartyDraftFields } from '../lib/draft-fields'
import { useDraftAutosave } from './use-draft-autosave'

const service = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./use-drafts', () => ({
  draftServices: { party: service },
  draftKeys: {
    list: (entity: string, businessId: string) => [
      'drafts',
      entity,
      businessId,
    ],
    detail: (entity: string, id: string) => ['draft', entity, id],
  },
}))

type Values = { name: string; contact: string; color: string }

function renderAutosave(initialDraftId: string | null = null) {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(
    () => {
      const form = useForm<Values>({
        defaultValues: { name: '', contact: '', color: '#34C759' },
      })
      const autosave = useDraftAutosave({
        entity: 'party',
        businessId: 'b1',
        form,
        toFields: toPartyDraftFields,
        initialDraftId,
      })
      return { form, autosave }
    },
    { wrapper },
  )
}

async function typeName(
  result: ReturnType<typeof renderAutosave>['result'],
  value: string,
) {
  await act(async () => {
    await result.current.form.register('name').onChange({
      target: { name: 'name', value },
      type: 'change',
    })
  })
}

describe('useDraftAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    service.create.mockResolvedValue({ id: 'd1' })
    service.update.mockResolvedValue({ id: 'd1' })
    service.delete.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('ignores programmatic values such as OCR prefill', async () => {
    const { result } = renderAutosave()

    act(() => result.current.form.setValue('name', 'Scanned Name'))
    await act(() => vi.advanceTimersByTimeAsync(2000))

    expect(service.create).not.toHaveBeenCalled()
    expect(result.current.autosave.hasUserChanges).toBe(false)
  })

  it('creates the draft once after typing stops, then updates it', async () => {
    const { result } = renderAutosave()

    await typeName(result, 'A')
    await typeName(result, 'Ac')
    await act(() => vi.advanceTimersByTimeAsync(1500))

    expect(service.create).toHaveBeenCalledTimes(1)
    expect(service.create).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({ name: 'Ac' }),
    )
    expect(result.current.autosave.draftId).toBe('d1')
    expect(window.location.search).toContain('draftId=d1')

    await typeName(result, 'Acme')
    await act(() => vi.advanceTimersByTimeAsync(1500))

    expect(service.create).toHaveBeenCalledTimes(1)
    expect(service.update).toHaveBeenCalledWith(
      'd1',
      expect.objectContaining({ name: 'Acme' }),
    )
  })

  it('treats setUserValue as a user change', async () => {
    const { result } = renderAutosave()

    act(() => result.current.autosave.setUserValue('color', '#FF3B30'))
    await act(() => vi.advanceTimersByTimeAsync(1500))

    expect(service.create).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({ color: '#FF3B30' }),
    )
  })

  it('serializes overlapping saves so only one draft row is created', async () => {
    let resolveCreate: (value: { id: string }) => void = () => undefined
    service.create.mockImplementation(
      () => new Promise((resolve) => (resolveCreate = resolve)),
    )
    const { result } = renderAutosave()

    let first: Promise<string | null> = Promise.resolve(null)
    let second: Promise<string | null> = Promise.resolve(null)
    act(() => {
      first = result.current.autosave.save()
      second = result.current.autosave.save()
    })
    await act(async () => {
      await vi.waitFor(() => expect(service.create).toHaveBeenCalledTimes(1))
      resolveCreate({ id: 'd1' })
      await first
      await second
    })

    expect(service.create).toHaveBeenCalledTimes(1)
    expect(service.update).toHaveBeenCalledTimes(1)
    expect(service.update).toHaveBeenCalledWith('d1', expect.any(Object))
  })

  it('discard deletes the saved draft and stops autosaving', async () => {
    const { result } = renderAutosave('d1')

    await act(() => result.current.autosave.discard())
    await typeName(result, 'After discard')
    await act(() => vi.advanceTimersByTimeAsync(1500))

    expect(service.delete).toHaveBeenCalledWith('d1')
    expect(service.create).not.toHaveBeenCalled()
    expect(result.current.autosave.draftId).toBeNull()
  })

  it('stop waits for pending saves and blocks new ones', async () => {
    const { result } = renderAutosave('d1')

    await typeName(result, 'Pending')
    let stoppedId: string | null = null
    await act(async () => {
      stoppedId = await result.current.autosave.stop()
    })
    await act(() => vi.advanceTimersByTimeAsync(1500))

    expect(stoppedId).toBe('d1')
    expect(service.update).not.toHaveBeenCalled()
  })
})
