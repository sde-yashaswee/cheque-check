'use client'

import { useProfile } from "@/hooks/use-profile"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon as Phone, CheckmarkCircle01Icon as CheckCircle2 } from '@hugeicons/core-free-icons';
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export default function FeaturesPage() {
  const { profile, updateProfile } = useProfile()

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
      name: 'Daily Automated Voice Reminder',
      description: 'Receive a daily automated voice call at 9 AM IST with a summary of cheques hitting your bank accounts today. Consolidates cheques across all your businesses.',
      icon: Phone,
      checked: !!profile?.voice_call_enabled,
      onChange: (val: boolean) => updateProfile({ voice_call_enabled: val }),
      showExtra: !!profile?.voice_call_enabled,
      extra: (
        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Phone Number</label>
          <Input 
            placeholder="+91 00000 00000"
            defaultValue={profile?.phone || ''}
            onBlur={(e) => updateProfile({ phone: e.target.value })}
            className="h-11 rounded-lg"
          />
          <p className="text-[10px] text-muted-foreground font-medium italic">Make sure to include country code (e.g. +91)</p>
        </div>
      )
    }
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="grid gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="relative flex flex-col gap-4 rounded-lg border bg-card p-6 transition-all border-primary/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <HugeiconsIcon icon={feature.icon} className="h-6 w-6" />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{feature.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {feature.description}
              </p>
              {feature.showExtra && feature.extra}
            </div>

            <div className="mt-2 flex items-center justify-between border-t pt-4 border-primary/5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Enable Feature
              </span>
              <Switch 
                checked={feature.checked} 
                onCheckedChange={feature.onChange} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
