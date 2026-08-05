import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon as ArrowLeft, Money03Icon as Refund } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function RefundPolicyPage() {
  const t = useTranslations("Settings")

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/80 transition-colors">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{t("refundPolicy")}</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none px-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary mb-4">
            <HugeiconsIcon icon={Refund} className="h-6 w-6" />
            <span className="font-semibold uppercase tracking-wider text-xs">{t("effectiveDate", { date: "August 2026" })}</span>
          </div>
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold">1. {t("subRefunds")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("refundSubRefundsContent")}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">2. {t("howRequest")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("refundHowRequestContent")}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">3. {t("exceptions")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("refundExceptionsContent")}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">4. {t("trialPeriods")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("refundTrialPeriodsContent")}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
