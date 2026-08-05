import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon as ArrowLeft, HelpCircleIcon as Help, Mail01Icon as Mail, MessageQuestionIcon as FAQ, Book02Icon as Docs } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HelpAndSupportPage() {
  const faqs = [
    { q: "How do I add a new business?", a: "Go to Settings > My Businesses and click on the 'Add Business' button." },
    { q: "Can I export my data?", a: "Yes, you can export all your cheques to a CSV file from Settings > Data & Reports." },
    { q: "What happens if a cheque bounces?", a: "You can update the status of any cheque to 'Bounced' from the cheque detail page." },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/80 transition-colors">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </div>

      <div className="space-y-8 px-2">
        <div className="grid grid-cols-2 gap-4">
          <Link href="mailto:support@chequecheck.com" className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-muted/30 transition-all space-y-2 text-center">
            <HugeiconsIcon icon={Mail} className="h-8 w-8 text-primary" />
            <span className="font-bold">Email Us</span>
            <span className="text-xs text-muted-foreground">Get help via email</span>
          </Link>
          <div className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-muted/30 transition-all space-y-2 text-center">
            <HugeiconsIcon icon={Docs} className="h-8 w-8 text-primary" />
            <span className="font-bold">Guides</span>
            <span className="text-xs text-muted-foreground">Step-by-step tutorials</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <HugeiconsIcon icon={FAQ} className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Frequently Asked Questions</h2>
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
          <h3 className="font-bold">Still need help?</h3>
          <p className="text-sm text-muted-foreground">Our support team is available Monday to Friday, 9 AM - 6 PM IST.</p>
          <Link href="mailto:support@chequecheck.com">
            <Button variant="outline" className="mt-4 rounded-full">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
