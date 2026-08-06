'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profile'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ChevronLeft, UserIcon as User, ArrowDown01Icon as ChevronDown, Search01Icon as Search } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import { BusinessSwitcher } from "@/components/business-switcher"
import { useState } from "react"
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl';

const GlobalSearch = dynamic(() => import("@/components/global-search").then(mod => mod.GlobalSearch), {
  ssr: false
})

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const [searchOpen, setSearchOpen] = useState(false)
  const t = useTranslations()

  const getTitle = (path: string) => {
    if (path === '/') return 'ChequeCheck'
    if (path === '/settings') return t('Navigation.settings')
    if (path === '/features') return 'Features'

    if (path.startsWith('/settings/')) {
      const sub = path.split('/')[2]
      if (sub === 'privacy-policy') return t('Settings.privacyPolicy')
      if (sub === 'terms-and-conditions') return t('Settings.termsAndConditions')
      if (sub === 'refund-policy') return t('Settings.refundPolicy')
      if (sub === 'about') return t('Settings.aboutApp')
      if (sub === 'help-and-support') return t('Settings.helpAndSupport')
      if (sub === 'whats-new') return t('Settings.whatsNew')
    }

    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return 'ChequeCheck'

    const resource = segments[0] // cheques, parties, accounts, businesses
    const id = segments[1]
    const action = segments[2]

    const featureMap: Record<string, string> = {
      cheques: 'Cheques',
      parties: 'Parties',
      accounts: 'Accounts',
      businesses: 'Businesses'
    }

    const featureKey = featureMap[resource]
    if (!featureKey) return resource.charAt(0).toUpperCase() + resource.slice(1)

    if (segments.length === 1) {
      return t(`${featureKey}.title`)
    }

    if (id === 'create') {
      if (resource === 'accounts') return t('Accounts.addAccount')
      if (resource === 'cheques') return t('Cheques.newCheque')
      if (resource === 'parties') return t('Parties.newParty')
      if (resource === 'businesses') return t('Businesses.newBusiness')
    }

    if (id && !action) {
      if (resource === 'accounts') return t('Accounts.viewAccount')
      if (resource === 'cheques') return t('Cheques.viewCheque')
      if (resource === 'parties') return t('Parties.viewParty')
      if (resource === 'businesses') return t('Businesses.viewBusiness')
    }

    if (id && action === 'edit') {
      if (resource === 'accounts') return t('Accounts.editAccount')
      if (resource === 'cheques') return t('Cheques.editCheque')
      if (resource === 'parties') return t('Parties.editParty')
      if (resource === 'businesses') return t('Businesses.editBusiness')
    }

    return t('Navigation.dashboard')
  }

  const title = getTitle(pathname)
  const isMainTab = ['/', '/cheques', '/parties', '/accounts', '/settings', '/businesses', '/features'].includes(pathname)
  
  const hideSettingsIcon = pathname.startsWith('/settings') || pathname.startsWith('/features')
  const hideBusinessSwitcher = pathname.startsWith('/settings') || pathname.startsWith('/features')

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col">
      <header className="relative flex h-[52px] items-center justify-between bg-canvas-parchment/80 px-4 backdrop-blur-md dark:bg-black/80 border-b border-primary/5">
        <div id="progress-bar-nav-container" className="absolute bottom-0 left-0 right-0 h-[1.6px] z-50 pointer-events-none"/>
        <div className="flex items-center gap-2">
          {!isMainTab && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full -ml-2 h-9 w-9"
            >
              <HugeiconsIcon icon={ChevronLeft} className="h-5 w-5"/>
            </Button>
          )}
          <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            {isMainTab && pathname === '/' && (
              <img src="/favicon-32x32.png" alt="ChequeCheck Logo" className="h-6 w-6 rounded-md" />
            )}
            <span>{isMainTab && pathname === '/' ? 'ChequeCheck' : title}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!hideSettingsIcon && (
            <>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)} 
                className="rounded-full h-9 w-9"
              >
                <HugeiconsIcon icon={Search} className="h-5 w-5 text-muted-foreground"/>
              </Button>

              <Link href="/settings">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name || 'User'} className="h-full w-full object-cover"/>
                  ) : (
                    <HugeiconsIcon icon={User} className="h-4 w-4"/>
                  )}
                </div>
              </Link>
            </>
          )}
        </div>
      </header>
      
      {!hideBusinessSwitcher && activeBusiness && (
        <BusinessSwitcher 
          trigger={
            <button className="flex h-8 w-full items-center bg-primary/5 px-4 text-[10px] font-semibold text-primary uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-primary/10 active:bg-primary/20 cursor-pointer border-b border-primary/5">
              <span className="opacity-60 mr-1.5 font-bold">{t('Businesses.viewBusiness')}:</span> 
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="h-4 w-4 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
                  {activeBusiness.logo_url ? (
                    <img src={activeBusiness.logo_url} alt={activeBusiness.name} className="h-full w-full object-cover"/>
                  ) : (
                    <span className="text-[8px] font-bold">{activeBusiness.name?.charAt(0)}</span>
                  )}
                </div>
                <span className="truncate">{activeBusiness.name}</span>
              </div>
              <HugeiconsIcon icon={ChevronDown} className="ml-1.5 h-3 w-3 opacity-60 shrink-0"/>
            </button>
          }
        />
      )}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}

