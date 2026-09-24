import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserIcon as User,
  Mail01Icon as Mail,
  StarsIcon as Version,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('Settings')

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-12 pb-20">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
            <img
              src="/android-chrome-512x512.png"
              alt="ChequeCheck Logo"
              className="h-full w-full object-contain p-2"
            />
          </div>
          <h1 className="mt-6 text-display-md font-semibold tracking-tight">
            ChequeCheck
          </h1>
          <p className="text-body text-muted-foreground">{t('appTagline')}</p>
        </div>

        <div className="overflow-hidden rounded-lg bg-white dark:bg-surface-tile-1 border border-primary/5">
          <div className="divide-y divide-border/50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
                  <HugeiconsIcon icon={User} className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('developer')}
                </span>
              </div>
              <span className="text-sm font-bold">{t('teamName')}</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
                  <HugeiconsIcon icon={Mail} className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('support')}
                </span>
              </div>
              <a
                href="mailto:support@chequecheck.com"
                className="text-sm font-bold text-primary hover:underline"
              >
                support@chequecheck.com
              </a>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
                  <HugeiconsIcon icon={Version} className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('version')}
                </span>
              </div>
              <span className="text-sm font-bold text-muted-foreground">
                1.0.0 (Build 2026.08)
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-widest opacity-50">
          {t('madeWithLove')}
        </p>
      </div>
    </div>
  )
}
