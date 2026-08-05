import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon as ArrowLeft, Shield01Icon as Shield } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/80 transition-colors">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none px-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary mb-4">
            <HugeiconsIcon icon={Shield} className="h-6 w-6" />
            <span className="font-semibold uppercase tracking-wider text-xs">Last Updated: August 2026</span>
          </div>
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to ChequeCheck. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">2. Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information that you provide directly to us, such as your name, email address, and business details. We also collect data related to your cheques, accounts, and parties to provide our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">3. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is used solely to provide and improve the ChequeCheck service, including managing your cheques, sending reminders, and providing reports. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data. Your information is stored securely using Supabase and is encrypted where appropriate.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. You can manage your information directly within the app settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">6. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at support@chequecheck.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
