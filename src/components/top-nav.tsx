'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profile'
import { useBusiness } from '@/hooks/use-business'
import { ChevronLeft, User, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BusinessSwitcher } from "@/components/business-switcher"
import { GlobalSearch } from "@/components/global-search"
import { useState } from "react"
import Link from 'next/link'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/cheques': 'Cheques',
  '/cheques/create': 'New Cheque',
  '/parties': 'Parties',
  '/parties/create': 'New Party',
  '/accounts': 'Accounts',
  '/accounts/create': 'Add Account',
  '/settings': 'Settings',
  '/businesses': 'Businesses',
  '/businesses/create': 'New Business',
  '/features': 'Features',
}

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useProfile()
  const { activeBusiness } = useBusiness()
  const [searchOpen, setSearchOpen] = useState(false)

  const title = routeTitles[pathname] || 'Dashboard'
  const isMainTab = ['/', '/cheques', '/parties', '/accounts', '/settings', '/businesses'].includes(pathname)

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-canvas-parchment/80 px-4 backdrop-blur-md dark:bg-black/80">
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
            {isMainTab && pathname === '/' ? 'ChequeCheck' : title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSearchOpen(true)} 
            className="rounded-full"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Link href="/settings">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95">
              <User className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </header>
      
      {activeBusiness && (
        <BusinessSwitcher 
          trigger={
            <div className="flex h-7 w-full items-center border-b bg-primary/5 px-4 text-[10px] font-bold text-primary uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-primary/10 active:bg-primary/20 cursor-pointer">
              <span className="opacity-60 mr-1.5">Business:</span> 
              {activeBusiness.name}
              <ChevronDown className="ml-1.5 h-3 w-3 opacity-60" />
            </div>
          }
        />
      )}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
