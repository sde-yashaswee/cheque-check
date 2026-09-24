import '@testing-library/jest-dom/vitest'

process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://example.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'example-anon-key'
process.env.NEXT_PUBLIC_LOG_LEVEL ??= 'debug'
