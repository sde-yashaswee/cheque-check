import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon as Mail, MessageQuestionIcon as FAQ, Book02Icon as Docs } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export default function HelpAndSupportPage() {
  const t = useTranslations("Settings")

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="space-y-8 px-2">
        <div className="grid grid-cols-2 gap-4">
          <Link href="mailto:support@chequecheck.com" className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-muted/30 transition-all space-y-2 text-center">
            <HugeiconsIcon icon={Mail} className="h-8 w-8 text-primary" />
            <span className="font-bold">{t("emailUs")}</span>
            <span className="text-xs text-muted-foreground">{t("getHelpViaEmail")}</span>
          </Link>
          <div className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-muted/30 transition-all space-y-2 text-center">
            <HugeiconsIcon icon={Docs} className="h-8 w-8 text-primary" />
            <span className="font-bold">{t("guides")}</span>
            <span className="text-xs text-muted-foreground">{t("stepByStepTutorials")}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <HugeiconsIcon icon={FAQ} className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("faqsTitle")}</h2>
          </div>
          <div className="divide-y rounded-lg border bg-card overflow-hidden">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 space-y-2">
                <h3 className="font-bold text-sm">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-6 text-center space-y-2">
          <h3 className="font-bold">{t("stillNeedHelp")}</h3>
          <p className="text-sm text-muted-foreground">{t("supportAvailability")}</p>
          <Link href="mailto:support@chequecheck.com">
            <Button variant="outline" className="mt-4 rounded-full">
              {t("contactSupport")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
