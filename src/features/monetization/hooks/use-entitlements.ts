import { useQuery } from '@tanstack/react-query'
import { monetizationService } from '../services/monetization.service'
import type { Entitlement } from '../repositories/monetization.repository'
import { queryKeys } from '@/lib/query-keys'

export function useEntitlements() {
  return useQuery<Entitlement[]>({
    queryKey: queryKeys.monetization.entitlements(),
    queryFn: () => monetizationService.getEntitlements(),
    refetchInterval: (query) => {
      const now = Date.now()
      const expirations =
        query.state.data
          ?.filter(
            (entry) => entry.status === 'active' || entry.status === 'trialing',
          )
          .map((entry) =>
            entry.valid_until ? Date.parse(entry.valid_until) - now : Infinity,
          )
          .filter((remaining) => remaining > 0) ?? []
      return Math.min(60_000, ...expirations.map((remaining) => remaining + 10))
    },
    refetchIntervalInBackground: true,
  })
}
