import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AccountDraft, ChequeDraft, PartyDraft } from '@/types'
import type { DraftEntity } from '../lib/draft-fields'
import {
  accountDraftService,
  chequeDraftService,
  partyDraftService,
} from '../services/draft.service'

type DraftByEntity = {
  cheque: ChequeDraft
  party: PartyDraft
  account: AccountDraft
}

export const draftServices = {
  cheque: chequeDraftService,
  party: partyDraftService,
  account: accountDraftService,
} as const

export const draftKeys = {
  list: (entity: DraftEntity, businessId: string | undefined) =>
    ['drafts', entity, businessId] as const,
  detail: (entity: DraftEntity, id: string | null | undefined) =>
    ['draft', entity, id] as const,
}

export function useDrafts<E extends DraftEntity>(
  entity: E,
  businessId: string | undefined,
) {
  return useQuery({
    queryKey: draftKeys.list(entity, businessId),
    queryFn: () =>
      draftServices[entity].list(businessId!) as Promise<DraftByEntity[E][]>,
    enabled: !!businessId,
  })
}

export function useDraft<E extends DraftEntity>(
  entity: E,
  id: string | null | undefined,
) {
  return useQuery({
    queryKey: draftKeys.detail(entity, id),
    queryFn: () =>
      draftServices[entity].getById(id!) as Promise<DraftByEntity[E]>,
    enabled: !!id,
    staleTime: 0,
  })
}

export function useDeleteDraft(
  entity: DraftEntity,
  businessId: string | undefined,
) {
  const queryClient = useQueryClient()
  const listKey = draftKeys.list(entity, businessId)

  return useMutation({
    mutationFn: (id: string) => draftServices[entity].delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<{ id: string }[]>(listKey)
      queryClient.setQueryData<{ id: string }[]>(listKey, (current) =>
        current?.filter((draft) => draft.id !== id),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(listKey, context?.previous)
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.removeQueries({ queryKey: draftKeys.detail(entity, id) })
    },
  })
}
