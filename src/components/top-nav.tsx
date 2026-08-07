'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profile'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon as ChevronLeft, UserIcon as User, ArrowDown01Icon as ChevronDown, Search01Icon as Search, ViewIcon as View, Invoice01Icon as Invoice, Add01Icon as Plus, CreditCardIcon as Pay, UserGroupIcon as Party, UserAdd01Icon as NewParty, Settings02Icon as Settings, StarIcon as Star, Shield01Icon as Shield, LegalDocumentIcon as File, HelpCircleIcon as Help, RocketIcon as Rocket, PencilEdit01Icon as Edit } from '@hugeicons/core-free-icons';
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

  const getNavInfo = (path: string) => {
    if (path === '/') return { title: 'ChequeCheck', icon: null }
    if (path === '/settings') return { title: t('Navigation.settings'), icon: Settings }
    if (path === '/features') return { title: 'Features', icon: Star }

    if (path.startsWith('/settings/')) {
      const sub = path.split('/')[2]
      const subInfo: Record<string, { title: string; icon: any }> = {
        'privacy-policy': { title: t('Settings.privacyPolicy'), icon: Shield },
        'terms-and-conditions': { title: t('Settings.termsAndConditions'), icon: File },
        'refund-policy': { title: t('Settings.refundPolicy'), icon: Pay },
        'about': { title: t('Settings.aboutApp'), icon: Star },
        'help-and-support': { title: t('Settings.helpAndSupport'), icon: Help },
        'whats-new': { title: t('Settings.whatsNew'), icon: Rocket },
        'preferences': { title: t('Settings.preferences'), icon: Settings },
        'transactions': { title: t('Settings.transactions'), icon: Pay },
      }
      if (subInfo[sub]) return subInfo[sub]
    }

    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return { title: 'ChequeCheck', icon: null }

    const resource = segments[0] // cheques, parties, accounts, businesses
    const id = segments[1]
    const action = segments[2]

    const featureMap: Record<string, { key: string; icon: any }> = {
      cheques: { key: 'Cheques', icon: Invoice },
      parties: { key: 'Parties', icon: Party },
      accounts: { key: 'Accounts', icon: Pay },
      businesses: { key: 'Businesses', icon: User }
    }

    const feature = featureMap[resource]
    if (!feature) return { title: resource.charAt(0).toUpperCase() + resource.slice(1), icon: null }

    if (segments.length === 1) {
      return { title: t(`${feature.key}.title`), icon: feature.icon }
    }

    if (id === 'create') {
      const createIcons: Record<string, any> = {
        accounts: Pay,
        cheques: Plus,
        parties: NewParty,
        businesses: Plus
      }
      const createKeys: Record<string, string> = {
        accounts: 'Accounts.addAccount',
        cheques: 'Cheques.newCheque',
        parties: 'Parties.newParty',
        businesses: 'Businesses.newBusiness'
      }
      return { title: t(createKeys[resource]), icon: createIcons[resource] || Plus }
    }

    if (id && !action) {
      const viewKeys: Record<string, string> = {
        accounts: 'Accounts.viewAccount',
        cheques: 'Cheques.viewCheque',
        parties: 'Parties.viewParty',
        businesses: 'Businesses.viewBusiness'
      }
      return { title: t(viewKeys[resource]), icon: View }
    }

    if (id && action === 'edit') {
      const editKeys: Record<string, string> = {
        accounts: 'Accounts.editAccount',
        cheques: 'Cheques.editCheque',
        parties: 'Parties.editParty',
        businesses: 'Businesses.editBusiness'
      }
      return { title: t(editKeys[resource]), icon: Edit }
    }

    return { title: t('Navigation.dashboard'), icon: null }
  }

  const { title, icon: TitleIcon } = getNavInfo(pathname)
  const isMainTab = ['/', '/cheques', '/parties', '/accounts', '/settings', '/businesses', '/features'].includes(pathname)
  
  const hideSettingsIcon = pathname.startsWith('/settings') || pathname.startsWith('/features')
  const hideBusinessSwitcher = pathname.startsWith('/settings') || pathname.startsWith('/features') || pathname === '/businesses/create'

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col">
      <header className="relative flex h-[52px] items-center justify-between bg-canvas-parchment/80 px-4 backdrop-blur-md dark:bg-black/80 border-b border-primary/5">
        <div id="progress-bar-nav-container" className="absolute bottom-0 left-0 right-0 h-[1.6px] z-50 pointer-events-none"/>
        <div className="flex items-center gap-2 overflow-hidden">
          {!isMainTab && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full -ml-2 h-9 w-9 shrink-0"
            >
              <HugeiconsIcon icon={ChevronLeft} className="h-5 w-5"/>
            </Button>
          )}
          <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2 truncate">
            {isMainTab && pathname === '/' && (
              <img src="/android-chrome-512x512.png" alt="ChequeCheck Logo" className="h-6 w-6 rounded-md shrink-0" />
            )}
            {TitleIcon && <HugeiconsIcon icon={TitleIcon} className="h-5 w-5 text-primary shrink-0"/>}
            <span className="truncate">{isMainTab && pathname === '/' ? 'ChequeCheck' : title}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!hideSettingsIcon && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                className="rounded-full h-9 w-9"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </Button>

              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)} 
                className="rounded-full h-9 w-9"
              >
                <HugeiconsIcon icon={Search} className="h-5 w-5 text-muted-foreground"/>
              </Button>

              <Link href="/settings">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 overflow-hidden ring-2 ring-white shadow-sm">
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

