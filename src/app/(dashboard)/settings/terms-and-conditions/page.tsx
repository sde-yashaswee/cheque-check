import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon as ArrowLeft, LicenseIcon as Terms } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/80 transition-colors">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Terms & Conditions</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none px-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary mb-4">
            <HugeiconsIcon icon={Terms} className="h-6 w-6" />
            <span className="font-semibold uppercase tracking-wider text-xs">Last Updated: August 2026</span>
          </div>
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ChequeCheck, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed">
              We grant you a personal, non-transferable license to use ChequeCheck for your personal or business cheque management purposes. You may not reverse engineer, decompile, or attempt to extract the source code of the app.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">3. Account Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">4. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              ChequeCheck is provided "as is" without any warranties. We shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">5. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any significant changes by posting the new terms within the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
