'use client'

import { useProfile } from "@/hooks/use-profile"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon as Phone, CheckmarkCircle01Icon as CheckCircle2, SecurityCheckIcon as ShieldCheck, FlashIcon as Zap } from '@hugeicons/core-free-icons';
import { cn } from "@/lib/utils"

export default function FeaturesPage() {
  const { profile, updateProfile, isLoading } = useProfile()

  const features = [
    {
      id: 'receiving_mode',
      name: 'Receiving Cheques Mode',
      description: 'Enable this if your business also receives cheques from parties. Adds "Inward" cheque support throughout the app.',
      icon: CheckCircle2,
      checked: !!profile?.received_cheques_enabled,
      onChange: (val: boolean) => updateProfile({ received_cheques_enabled: val })
    },
    {
      id: 'voice_calls',
      name: 'Voice Call Reminders',
      description: 'Automatically call parties when their cheques are due. Professional automated voice reminders to ensure timely payment.',
      icon: Phone,
      checked: (profile?.reminders_per_day ?? 0) > 0, // Placeholder logic for now
      disabled: true,
      badge: 'Coming Soon'
    },
    {
      id: 'advanced_security',
      name: 'Advanced Security',
      description: 'Require Biometric/PIN authentication every time the app is opened.',
      icon: ShieldCheck,
      disabled: true,
      badge: 'Pro'
    },
    {
      id: 'smart_insights',
      name: 'Smart Insights',
      description: 'AI-powered predictions for cheque clearances and cashflow health scores.',
      icon: Zap,
      disabled: true,
      badge: 'Beta'
    }
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="grid gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={cn(
              "relative flex flex-col gap-4 rounded-lg border bg-card p-6 transition-all border-primary/5",
              feature.disabled && "opacity-60 grayscale-[0.5]"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <HugeiconsIcon icon={feature.icon} className="h-6 w-6" />
              </div>
              {feature.badge && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary uppercase">
                  {feature.badge}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{feature.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between border-t pt-4 border-primary/5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {feature.disabled ? 'Coming Soon' : 'Enable Feature'}
              </span>
              <Switch 
                checked={feature.checked} 
                onCheckedChange={feature.onChange} 
                disabled={feature.disabled}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

}
