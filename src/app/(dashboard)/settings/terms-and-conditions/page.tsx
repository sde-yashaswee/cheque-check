import { HugeiconsIcon } from "@hugeicons/react"
import { LicenseIcon as Terms } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

export default function TermsAndConditionsPage() {
  const t = useTranslations("Settings")

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="prose prose-sm dark:prose-invert max-w-none px-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary mb-4">
            <HugeiconsIcon icon={Terms} className="h-6 w-6" />
            <span className="font-semibold uppercase tracking-wider text-xs">{t("lastUpdated", { date: "August 2026" })}</span>
          </div>
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold">1. {t("acceptance")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsAcceptanceContent")}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">2. {t("useLicense")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsUseLicenseContent")}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">3. {t("accountResp")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsAccountRespContent")}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">4. {t("liability")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsLiabilityContent")}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">5. {t("changesToTerms")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsChangesToTermsContent")}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
