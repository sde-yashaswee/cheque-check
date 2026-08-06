import { HugeiconsIcon } from "@hugeicons/react"
import { Money03Icon as Refund } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"

export default function RefundPolicyPage() {
  const t = useTranslations("Settings")

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="prose prose-sm dark:prose-invert max-w-none px-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary mb-4">
            <HugeiconsIcon icon={Refund} className="h-6 w-6"/>
            <span className="font-semibold uppercase tracking-wider text-xs">{t("effectiveDate", { date: "August 2026"})}</span>
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
        </div>
      </div>
    </div>
  )
}
