import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon as ArrowLeft, InformationCircleIcon as Info, UserIcon as User, Mail01Icon as Mail, StarsIcon as Version } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function AboutPage() {
  const t = useTranslations("Settings")

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/80 transition-colors">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{t("aboutApp")}</h1>
      </div>

      <div className="space-y-6 px-2">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-6 text-center space-y-2 bg-muted/20">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-4">
              <HugeiconsIcon icon={Info} className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold">ChequeCheck</h2>
            <p className="text-sm text-muted-foreground">{t("appDescription")}</p>
          </div>
          
          <div className="divide-y divide-border/50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
                  <HugeiconsIcon icon={User} className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("developer")}</span>
              </div>
              <span className="text-sm font-bold">{t("teamName")}</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
                  <HugeiconsIcon icon={Mail} className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("support")}</span>
              </div>
              <Link href="mailto:support@chequecheck.com" className="text-sm font-bold text-primary">support@chequecheck.com</Link>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
                  <HugeiconsIcon icon={Version} className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("version")}</span>
              </div>
              <span className="text-sm font-bold">1.0.0 (Build 2026.08)</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-widest opacity-50">
          {t("madeWithLove")}
        </p>
      </div>
    </div>
  )
}
