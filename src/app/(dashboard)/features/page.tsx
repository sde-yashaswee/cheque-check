'use client'

import { useProfile } from "@/hooks/use-profile"
import { Switch } from "@/components/ui/switch"
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon as User, Mail01Icon as Mail, LockPasswordIcon as Lock, CallIcon as Phone, Calendar03Icon as Calendar, HashtagIcon as Hash, Note01Icon as Note, Building03Icon as Building, Wallet01Icon as Wallet, Search01Icon as Search, Location01Icon as Location, TextFontIcon as TextIcon, CheckmarkCircle01Icon as CheckCircle2, AiImageIcon as AiIcon, PackageIcon, ZapIcon } from '@hugeicons/core-free-icons';
import { Input } from "@/components/ui/input"
import { useMonetization } from "@/hooks/use-monetization"
import { useRazorpay } from "@/hooks/use-razorpay"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function FeaturesPage() {
  const { profile, updateProfile } = useProfile()
  const { 
    isLifetimePremium, 
    checkEntitlement, 
    getQuota, 
    isLoading: isLoadingMonetization 
  } = useMonetization()
  const { processPayment, isProcessing } = useRazorpay()

  const aiQuota = getQuota('ai_scan')
  const voiceQuota = getQuota('voice_reminder')

  const features = [
    {
      id: 'receiving_mode',
      name: 'Receiving Cheques Mode',
      description: 'Enable this if your business also receives cheques from parties. Adds "Inward" cheque support throughout the app.',
      icon: CheckCircle2,
      checked: !!profile?.received_cheques_enabled,
      onChange: (val: boolean) => updateProfile({ received_cheques_enabled: val }),
      isLocked: !isLifetimePremium,
      lockMessage: 'Requires Lifetime Premium',
      price: '₹300 One-time',
      onUnlock: () => processPayment({ type: 'lifetime', featureId: 'lifetime_premium' })
    },
    {
      id: 'ai_scanner',
      name: 'AI Cheque Scanner',
      description: 'Use AI to scan cheques and automatically extract details like amount, date, and party name. High accuracy scanning.',
      icon: AiIcon,
      checked: true, // Always "enabled" if you have quota
      isLocked: !checkEntitlement('ai_scanner_sub') && (aiQuota?.limit || 0) <= 0,
      lockMessage: 'Subscription Required',
      price: '₹50/month (250 scans)',
      onUnlock: () => processPayment({ type: 'subscription', featureId: 'ai_scanner_sub' }),
      quota: aiQuota,
      onTopUp: () => processPayment({ type: 'top_up', featureId: 'ai_scan' })
    },
    {
      id: 'voice_calls',
      name: 'Daily Automated Voice Reminder',
      description: 'Receive a daily automated voice call at 9 AM IST with a summary of cheques hitting your bank accounts today.',
      icon: Phone,
      checked: !!profile?.voice_call_enabled,
      onChange: (val: boolean) => updateProfile({ voice_call_enabled: val }),
      showExtra: !!profile?.voice_call_enabled,
      isLocked: !checkEntitlement('voice_reminder_sub'),
      lockMessage: 'Subscription Required',
      price: '₹50/month (100 calls)',
      onUnlock: () => processPayment({ type: 'subscription', featureId: 'voice_reminder_sub' }),
      quota: voiceQuota,
      onTopUp: () => processPayment({ type: 'top_up', featureId: 'voice_reminder' }),
      extra: (
        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Phone Number</label>
          <Input leftIcon={TextIcon}  
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

  if (isLoadingMonetization) {
    return <div className="p-8">Loading features...</div>
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      {/* Lifetime Banner */}
      {!isLifetimePremium && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Lifetime Premium</h3>
            <p className="text-sm text-muted-foreground">Unlock all base features forever for just ₹300.</p>
          </div>
          <Button 
            onClick={() => processPayment({ type: 'lifetime', featureId: 'lifetime_premium' })}
            disabled={isProcessing}
          >
            Upgrade Now
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="relative flex flex-col gap-4 rounded-xl border bg-card p-6 transition-all border-primary/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HugeiconsIcon icon={feature.icon} className="h-6 w-6"/>
              </div>
              {feature.isLocked && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-none">
                  Locked
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{feature.name}</h3>
                <span className="text-sm font-medium text-primary">{feature.price}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {feature.description}
              </p>
              
              {feature.quota && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Usage: {feature.quota.used} / {feature.quota.limit}</span>
                    <button 
                      onClick={feature.onTopUp}
                      className="text-primary hover:underline"
                    >
                      Buy Top-up
                    </button>
                  </div>
                  <Progress value={(feature.quota.used / feature.quota.limit) * 100} className="h-1.5" />
                </div>
              )}

              {feature.showExtra && !feature.isLocked && feature.extra}
            </div>

            <div className="mt-2 flex items-center justify-between border-t pt-4 border-primary/5">
              {feature.isLocked ? (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={feature.onUnlock}
                  disabled={isProcessing}
                >
                  <HugeiconsIcon icon={ZapIcon} className="w-4 h-4 mr-2" />
                  Unlock for {feature.price}
                </Button>
              ) : (
                <>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Enable Feature
                  </span>
                  {feature.onChange && (
                    <Switch 
                      checked={feature.checked} 
                      onCheckedChange={feature.onChange} 
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
