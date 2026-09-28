'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { BusinessProvider } from '@/hooks/use-business'
import { ProfileProvider } from '@/hooks/use-profile'
import { CelebrationHost } from '@/components/celebration-host'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <BusinessProvider>
          {children}
          <CelebrationHost />
        </BusinessProvider>
      </ProfileProvider>
    </QueryClientProvider>
  )
}
