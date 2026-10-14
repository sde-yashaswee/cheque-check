/** Central registry of React Query keys, mirroring the `draftKeys` pattern in use-drafts.ts. */
export const queryKeys = {
  accounts: {
    list: (businessId: string | undefined) => ['accounts', businessId] as const,
    detail: (id: string | undefined) => ['account', id] as const,
  },
  banks: {
    list: () => ['master-banks'] as const,
  },
  businesses: {
    all: () => ['businesses'] as const,
    detail: (id: string | undefined) => ['business', id] as const,
    allCheques: () => ['all-businesses-cheques'] as const,
  },
  cheques: {
    list: (businessId: string | undefined) => ['cheques', businessId] as const,
    detail: (id: string | undefined) => ['cheque', id] as const,
    numberConflict: (
      businessId: string | undefined,
      accountId: string | undefined,
      chequeNumber: string,
    ) =>
      ['cheque-number-conflict', businessId, accountId, chequeNumber] as const,
  },
  parties: {
    list: (businessId: string | undefined) => ['parties', businessId] as const,
    detail: (id: string | undefined) => ['party', id] as const,
  },
  profile: {
    detail: () => ['profile'] as const,
  },
  monetization: {
    entitlements: () => ['entitlements'] as const,
    quotas: () => ['quotas'] as const,
  },
  tags: {
    all: () => ['tags'] as const,
    list: (businessId: string | undefined) => ['tags', businessId] as const,
    listWithUsage: (businessId: string | undefined) =>
      ['tags', businessId, 'usage'] as const,
    allDetail: () => ['tag'] as const,
    detail: (id: string | undefined) => ['tag', id] as const,
    links: (id: string | undefined) => ['tag', id, 'links'] as const,
  },
  entityTags: {
    all: () => ['entity-tags'] as const,
    forEntity: (entityType: string, entityId: string | undefined) =>
      ['entity-tags', entityType, entityId] as const,
  },
  entityTagMap: {
    all: () => ['entity-tag-map'] as const,
    forBusiness: (businessId: string | null | undefined, entityType: string) =>
      ['entity-tag-map', businessId, entityType] as const,
  },
}
