'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profile'
import { useBusiness } from '@/hooks/use-business'
import { ChevronLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/cheques': 'Cheques',
  '/cheques/create': 'New Cheque',
  '/parties': 'Parties',
  '/parties/create': 'New Party',
  '/banks': 'Banks',
  '/banks/create': 'Add Bank',
  '/settings': 'Settings',
  '/businesses/create': 'New Business',
}

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useProfile()
  const { activeBusiness } = useBusiness()

  const title = routeTitles[pathname] || 'Dashboard'
  const isMainTab = ['/', '/cheques', '/parties', '/settings'].includes(pathname)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-canvas-parchment/80 px-4 backdrop-blur-md dark:bg-black/80">
      <div className="flex items-center gap-2">
        {!isMainTab && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full -ml-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-bold tracking-tight">
         {title}
        </h1>
        {isMainTab && pathname === '/' && activeBusiness && (
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
            {activeBusiness.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isMainTab && (
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold leading-none">{profile?.name || 'User'}</span>
            <span className="text-[10px] text-muted-foreground leading-none mt-1">ChequeCheck</span>
          </div>
        )}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  )
}
