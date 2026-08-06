import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      console.error('Auth error during exchange:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    console.error('No code found in search params')
    return NextResponse.redirect(`${origin}/login?error=Authentication code missing`)
  } catch (err) {
    console.error('Unexpected error in auth callback:', err)
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=Internal server error`)
  }
}
