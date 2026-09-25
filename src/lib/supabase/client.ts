import { createBrowserClient } from '@supabase/ssr'
import { publicEnv } from '@/lib/env/client'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
