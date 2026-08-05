import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon as ArrowLeft, MegaphoneIcon as WhatsNew, ZapIcon as Zap, StarIcon as Star, Shield01Icon as Shield } from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function WhatsNewPage() {
  const updates = [
    {
      version: "v1.0.0",
      date: "August 5, 2026",
      title: "The Grand Launch",
      items: [
        { icon: Zap, title: "Cheque Tracking", description: "Efficiently manage issued and received cheques with ease." },
        { icon: Star, title: "Business Profiles", description: "Switch between multiple businesses and manage their accounts." },
        { icon: Shield, title: "Secure Data", description: "Your financial data is encrypted and stored securely with Supabase." },
      ]
    }
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted/80 transition-colors">
          <HugeiconsIcon icon={ArrowLeft} className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">What's New</h1>
      </div>

      <div className="space-y-12 px-2">
        {updates.map((update) => (
          <div key={update.version} className="relative pl-8 space-y-6">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-4 border-background bg-primary" />
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{update.date}</span>
              <h2 className="text-xl font-bold">{update.title} - <span className="text-muted-foreground">{update.version}</span></h2>
            </div>

            <div className="grid gap-4">
              {update.items.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon icon={item.icon} className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
