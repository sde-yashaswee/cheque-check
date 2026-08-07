"use client"

import { useBusiness } from "@/hooks/use-business"
import { useProfile } from "@/hooks/use-profile"
import { useCheques } from "@/hooks/use-cheques"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon as ChevronRight, Logout01Icon as LogOut, UserIcon as User, Notification01Icon as Bell, GlobalIcon as Globe, CreditCardIcon as CreditCard, File01Icon as FileSpreadsheet, Building03Icon as Building2, LayoutGridIcon as LayoutGrid, FlashIcon as Zap, TranslateIcon as Languages, Settings02Icon as Settings2, Delete02Icon as Trash2, Clock01Icon as Clock, MegaphoneIcon as Megaphone, HelpCircleIcon as Help, InformationCircleIcon as Info, Shield01Icon as Shield, LicenseIcon as License, Money03Icon as Money } from '@hugeicons/core-free-icons';
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Combobox } from "@/components/ui/combobox"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings } from "@/hooks/use-settings"
import { EditableAvatar } from "@/components/ui/editable-avatar"
import { useTranslations } from 'next-intl';
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { IconType, ChequeWithRelations } from "@/types"
import { useMonetization } from "@/hooks/use-monetization"
import { Badge } from "@/components/ui/badge"

const DeleteConfirmationDialog = dynamic(() => import("@/components/ui/delete-dialog").then(mod => mod.DeleteConfirmationDialog), {
  loading: () => <Skeleton className="h-16 w-full rounded-lg"/>,
  ssr: false
})

interface SettingsItem {
  name: string
  description?: string
  icon: IconType
  href?: string
  action?: () => void
  component?: React.ReactNode
  value?: string
}

interface SettingsSection {
  title: string
  icon: IconType
  items: SettingsItem[]
}

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const { profile, updateProfile, isLoading: profileLoading } = useProfile()
  const { handleExport, handleLogout, handleDeleteProfile } = useSettings()
  const { isLifetimePremium, isLoading: monetizationLoading } = useMonetization()

  const { cheques } = useCheques(activeBusiness?.id)

  if (profileLoading || monetizationLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-20 w-full rounded-lg"/>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-full"/>
              <Skeleton className="h-48 w-full rounded-lg"/>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sections: SettingsSection[] = [
    {
      title: t('general'),
      icon: LayoutGrid,
      items: [
        { 
          name: t('preferences'), 
          description: t('preferencesDesc'),
          icon: Settings2,
          href: '/settings/preferences'
        },
        { 
          name: t('transactions'), 
          description: t('transactionsDesc'),
          icon: Money, 
          href: '/settings/transactions' 
        },
        { 
          name: t('features'), 
          description: t('featuresDesc'),
          icon: Zap, 
          href: '/features' 
        },
      ]
    },
    {
      title: t('management'),
      icon: Building2,
      items: [
        { 
          name: t('businesses'), 
          description: t('businessesDesc'),
          icon: Building2, 
          href: '/businesses' 
        },
        { 
          name: t('reports'), 
          description: t('reportsDesc'),
          icon: FileSpreadsheet, 
          href: '/reports' 
        },
      ]
    },
    {
      title: t('support'),
      icon: Help,
      items: [
        { 
          name: t('whatsNew'), 
          description: t('whatsNewDesc'),
          icon: Megaphone, 
          href: '/settings/whats-new' 
        },
        { 
          name: t('helpAndSupport'), 
          description: t('helpAndSupportDesc'),
          icon: Help, 
          href: '/settings/help-and-support' 
        },
        { 
          name: t('aboutApp'), 
          description: t('aboutAppDesc'),
          icon: Info, 
          href: '/settings/about' 
        },
      ]
    },
    {
      title: t('legal'),
      icon: Shield,
      items: [
        { 
          name: t('privacyPolicy'), 
          description: t('privacyPolicyDesc'),
          icon: Shield, 
          href: '/settings/privacy-policy' 
        },
        { 
          name: t('termsAndConditions'), 
          description: t('termsAndConditionsDesc'),
          icon: License, 
          href: '/settings/terms-and-conditions' 
        },
        { 
          name: t('refundPolicy'), 
          description: t('refundPolicyDesc'),
          icon: Money, 
          href: '/settings/refund-policy' 
        },
      ]
    }
  ]

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      {/* Profile Section */}
      <div className="flex items-center gap-4 rounded-lg bg-canvas-parchment p-5 dark:bg-surface-tile-1">
        <EditableAvatar
          name={profile?.name || t('user')}
          imageUrl={profile?.avatar_url}
          size="md"
          onUpload={async (url) => { await updateProfile({ avatar_url: url }) }}
          onDelete={async () => { await updateProfile({ avatar_url: null }) }}
        />
        <div className="flex-1">
          <p className="font-semibold text-lg leading-tight">{profile?.name || t('user')}</p>
          <p className="text-xs text-muted-foreground font-semibold">{profile?.email}</p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section: SettingsSection) => (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <HugeiconsIcon icon={section.icon} className="h-3 w-3 text-muted-foreground opacity-80"/>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-border/50 rounded-lg border bg-card overflow-hidden">
              {section.items.map((item: SettingsItem) => {
                const content = (
                  <div key={item.name} className={cn("flex items-center justify-between p-4 transition-colors", (item.action || item.href) && "cursor-pointer active:bg-muted/50 hover:bg-muted/30")} onClick={item.action}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
                        <HugeiconsIcon icon={item.icon} className="h-4 w-4"/>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{item.name}</span>
                        {item.description && <span className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">{item.description}</span>}
                      </div>
                    </div>
                    {item.component ? (
                      item.component
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.value && <span className="text-xs font-semibold text-muted-foreground">{item.value}</span>}
                        <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 text-muted-foreground opacity-30"/>
                      </div>
                    )}
                  </div>
                )

                if (item.href) {
                  return <Link href={item.href} key={item.name}>{content}</Link>
                }
                return content
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <HugeiconsIcon icon={Trash2} className="h-3 w-3 text-destructive opacity-80"/>
          <h3 className="text-[10px] font-semibold text-destructive uppercase tracking-wider">{t('dangerZone')}</h3>
        </div>
        <div className="divide-y rounded-lg border border-destructive/20 bg-destructive/5 overflow-hidden">
          <DeleteConfirmationDialog 
            title={t('deleteProfileTitle')}
            description={t('deleteProfileDescription')}
            confirmName={profile?.name || profile?.email || ''}
            onDelete={handleDeleteProfile}
            trigger={
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-destructive/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
                    <HugeiconsIcon icon={Trash2} className="h-4 w-4"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-destructive">{t('deleteMyAccount')}</span>
                    <span className="text-[10px] text-destructive/70 font-medium leading-tight mt-0.5">{t('deleteMyAccountDesc')}</span>
                  </div>
                </div>
                <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 text-destructive opacity-30"/>
              </div>
            }
          />
        </div>
      </div>

      <Button 
        variant="destructive"
        className="w-full rounded-full h-14 text-lg font-semibold"
        onClick={handleLogout}
      >
        <HugeiconsIcon icon={LogOut} className="mr-2 h-5 w-5"/> {t('signOut')}
      </Button>

      <div className="text-center pb-8">
        <p className="text-xs text-muted-foreground font-semibold opacity-50 uppercase tracking-wider">ChequeCheck v1.0.0</p>
        <p className="text-[10px] text-muted-foreground mt-2 opacity-30 font-semibold">
          {format(new Date(), "PPpp")}
        </p>
      </div>
    </div>
  )
}

