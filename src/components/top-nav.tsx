'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profile'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ChevronLeft, UserIcon as User, ArrowDown01Icon as ChevronDown, Search01Icon as Search } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import { BusinessSwitcher } from "@/components/business-switcher"
import { GlobalSearch } from "@/components/global-search"
import { useState } from "react"
import Link from 'next/link'

const getTitle = (pathname: string) => {
  if (pathname === '/') return 'ChequeCheck'
  if (pathname === '/settings') return 'Settings'
  if (pathname === '/features') return 'Features'

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'ChequeCheck'

  const resource = segments[0] // cheques, parties, accounts, businesses
  const id = segments[1]
  const action = segments[2]

  const resourceMap: Record<string, string> = {
    cheques: 'Cheque',
    parties: 'Party',
    accounts: 'Account',
    businesses: 'Business'
  }

  const resourceName = resourceMap[resource] || resource.charAt(0).toUpperCase() + resource.slice(1)

  if (segments.length === 1) {
    return resource.charAt(0).toUpperCase() + resource.slice(1)
  }

  if (id === 'create') {
    if (resource === 'accounts') return 'Add Account'
    return `New ${resourceName}`
  }

  if (id && !action) {
    return `View ${resourceName}`
  }

  if (id && action === 'edit') {
    return `Edit ${resourceName}`
  }

  return 'Dashboard'
}

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const [searchOpen, setSearchOpen] = useState(false)

  const title = getTitle(pathname)
  const isMainTab = ['/', '/cheques', '/parties', '/accounts', '/settings', '/businesses'].includes(pathname)

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col">
      <header className="flex h-[52px] items-center justify-between bg-canvas-parchment/80 px-4 backdrop-blur-md dark:bg-black/80 border-b border-primary/5">
        <div className="flex items-center gap-2">
          {!isMainTab && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full -ml-2 h-9 w-9"
            >
              <HugeiconsIcon icon={ChevronLeft} className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold tracking-tight">
            {isMainTab && pathname === '/' ? 'ChequeCheck' : title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSearchOpen(true)} 
            className="rounded-full h-9 w-9"
          >
            <HugeiconsIcon icon={Search} className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Link href="/settings">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95">
              <HugeiconsIcon icon={User} className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </header>
      
      {activeBusiness && (
        <BusinessSwitcher 
          trigger={
            <button className="flex h-8 w-full items-center bg-primary/5 px-4 text-[10px] font-semibold text-primary uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-primary/10 active:bg-primary/20 cursor-pointer border-b border-primary/5">
              <span className="opacity-60 mr-1.5">Business:</span> 
              {activeBusiness.name}
              <HugeiconsIcon icon={ChevronDown} className="ml-1.5 h-3 w-3 opacity-60" />
            </button>
          }
        />
      )}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}

