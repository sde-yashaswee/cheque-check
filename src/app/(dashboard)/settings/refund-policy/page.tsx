import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon as ArrowLeft, Money03Icon as Refund } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/80 transition-colors">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Refund Policy</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none px-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary mb-4">
            <HugeiconsIcon icon={Refund} className="h-6 w-6" />
            <span className="font-semibold uppercase tracking-wider text-xs">Effective Date: August 2026</span>
          </div>
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold">1. Subscription Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              We offer a 7-day money-back guarantee for all new subscriptions. If you are not satisfied with ChequeCheck, you can request a full refund within 7 days of your initial purchase.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">2. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed">
              To request a refund, please email us at support@chequecheck.com with your account details and the reason for your request. We process refunds within 5-10 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">3. Exceptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Refunds are not available for monthly renewals unless requested within 24 hours of the charge. We do not provide partial refunds for unused portions of a subscription month or year.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">4. Trial Periods</h2>
            <p className="text-muted-foreground leading-relaxed">
              New users may be eligible for a free trial period. No charges will be made during the trial period, and you can cancel at any time.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
