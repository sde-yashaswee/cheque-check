'use client'

import { useProfile } from '@/hooks/use-profile'
import { Switch } from '@/components/ui/switch'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserIcon as User,
  Mail01Icon as Mail,
  LockPasswordIcon as Lock,
  CallIcon as Phone,
  Calendar03Icon as Calendar,
  HashtagIcon as Hash,
  Note01Icon as Note,
  Building03Icon as Building,
  Wallet01Icon as Wallet,
  Search01Icon as Search,
  Location01Icon as Location,
  TextFontIcon as TextIcon,
  CheckmarkCircle01Icon as CheckCircle2,
  AiImageIcon as AiIcon,
  PackageIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { useMonetization } from '@/hooks/use-monetization'
import { useRazorpay } from '@/hooks/use-razorpay'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function FeaturesPage() {
  const { profile, updateProfile } = useProfile()
  const {
    isLifetimePremium,
    checkEntitlement,
    getQuota,
    isLoading: isLoadingMonetization,
  } = useMonetization()
  const { processPayment, isProcessing } = useRazorpay()

  const aiQuota = getQuota('ai_scan')
  const voiceQuota = getQuota('voice_reminder')

  const lifetimeFeatures = [
    {
      id: 'receiving_mode',
      name: 'Receiving Cheques Mode',
      description:
        'Enable this if your business also receives cheques from parties. Adds "Inward" cheque support throughout the app.',
      icon: CheckCircle2,
      checked: !!profile?.received_cheques_enabled,
      onChange: (val: boolean) =>
        updateProfile({ received_cheques_enabled: val }),
      price: '₹300 One-time',
    },
  ]

  const addonFeatures = [
    {
      id: 'ai_scanner',
      name: 'AI Cheque Scanner',
      description:
        'Use AI to scan cheques and automatically extract details like amount, date, and party name. High accuracy scanning.',
      icon: AiIcon,
      subscriptionId: 'ai_scanner_sub',
      quotaId: 'ai_scan',
      quota: aiQuota,
      price: '₹50/month (250 scans)',
      onUnlock: () => processPayment({ productId: 'ai_scanner_30d' }),
      onTopUp: () => processPayment({ productId: 'ai_scan_250' }),
    },
    {
      id: 'voice_calls',
      name: 'Daily Automated Voice Reminder',
      description:
        'Receive a daily automated voice call at 9 AM IST with a summary of cheques hitting your bank accounts today.',
      icon: Phone,
      subscriptionId: 'voice_reminder_sub',
      quotaId: 'voice_reminder',
      quota: voiceQuota,
      price: '₹50/month (100 calls)',
      checked: !!profile?.voice_call_enabled,
      onChange: (val: boolean) => updateProfile({ voice_call_enabled: val }),
      onUnlock: () => processPayment({ productId: 'voice_reminder_30d' }),
      onTopUp: () => processPayment({ productId: 'voice_reminder_100' }),
      extra: (
        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Phone Number
          </label>
          <Input
            leftIcon={TextIcon}
            placeholder="+91 00000 00000"
            defaultValue={profile?.phone || ''}
            onBlur={(e) => updateProfile({ phone: e.target.value })}
            className="h-11 rounded-lg"
          />
          <p className="text-[10px] text-muted-foreground font-medium italic">
            Make sure to include country code (e.g. +91)
          </p>
        </div>
      ),
    },
  ]

  if (isLoadingMonetization) {
    return <div className="p-8">Loading features...</div>
  }

  return (
    <div className="max-w-2xl space-y-12 pb-20">
      {/* Lifetime Premium Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">
              Lifetime Premium
            </h2>
            <p className="text-sm text-muted-foreground">
              One-time purchase for foundational features.
            </p>
          </div>
          {isLifetimePremium ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-3 py-1">
              Active
            </Badge>
          ) : (
            <span className="text-sm font-semibold text-primary">
              ₹300 One-time
            </span>
          )}
        </div>

        {!isLifetimePremium && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold">Upgrade Now</h3>
              <p className="text-sm text-muted-foreground">
                Get lifetime access to all base features.
              </p>
            </div>
            <Button
              onClick={() => processPayment({ productId: 'lifetime_premium' })}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              <HugeiconsIcon icon={ZapIcon} className="w-4 h-4 mr-2" />
              Get Lifetime Premium
            </Button>
          </div>
        )}

        <div className="grid gap-4">
          {lifetimeFeatures.map((feature) => (
            <div
              key={feature.id}
              className="group relative flex flex-col gap-4 rounded-xl border bg-card p-6 transition-all hover:border-primary/20 border-primary/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <HugeiconsIcon icon={feature.icon} className="h-5 w-5" />
                </div>
                {!isLifetimePremium && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 border-none"
                  >
                    Locked
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold">{feature.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {isLifetimePremium && (
                <div className="mt-2 flex items-center justify-between border-t pt-4 border-primary/5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Enable Feature
                  </span>
                  <Switch
                    checked={feature.checked}
                    onCheckedChange={feature.onChange}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add-on Services Section */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Add-on Services</h2>
          <p className="text-sm text-muted-foreground">
            Monthly subscriptions for high-value services.
          </p>
        </div>

        <div className="grid gap-6">
          {addonFeatures.map((addon) => {
            const isSubscribed = checkEntitlement(addon.subscriptionId)
            const hasQuota = (addon.quota?.limit || 0) > 0
            const isLocked = !isSubscribed && !hasQuota

            return (
              <div
                key={addon.id}
                className="relative flex flex-col gap-4 rounded-xl border bg-card p-6 transition-all border-primary/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={addon.icon} className="h-6 w-6" />
                  </div>
                  {isSubscribed ? (
                    <Badge className="bg-primary/10 text-primary border-none">
                      Active Subscription
                    </Badge>
                  ) : isLocked ? (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 border-none"
                    >
                      Locked
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 border-none"
                    >
                      Trial Access
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{addon.name}</h3>
                      {!isSubscribed && (
                        <span className="text-sm font-medium text-primary">
                          {addon.price}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {addon.description}
                    </p>
                  </div>

                  {/* Quota Progress - Shown if subscribed OR has trial quota */}
                  {(isSubscribed || hasQuota) && addon.quota && (
                    <div className="space-y-2 rounded-lg bg-primary/5 p-4">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-muted-foreground">
                          Current Usage
                        </span>
                        <span className="text-primary">
                          {addon.quota.used} / {addon.quota.limit}
                        </span>
                      </div>
                      <Progress
                        value={(addon.quota.used / addon.quota.limit) * 100}
                        className="h-2"
                      />
                      {isSubscribed && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={addon.onTopUp}
                            className="text-xs font-bold text-primary hover:underline flex items-center"
                          >
                            <HugeiconsIcon
                              icon={ZapIcon}
                              className="w-3 h-3 mr-1"
                            />
                            Buy Top-up
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Settings / Extra - Only shown if subscribed */}
                  {isSubscribed && addon.onChange && (
                    <div className="space-y-4 border-t pt-4 border-primary/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Enable Service
                        </span>
                        <Switch
                          checked={addon.checked}
                          onCheckedChange={addon.onChange}
                        />
                      </div>
                      {addon.checked && addon.extra}
                    </div>
                  )}

                  {!isSubscribed && (
                    <Button
                      className="w-full mt-2"
                      variant={isLocked ? 'default' : 'outline'}
                      onClick={addon.onUnlock}
                      disabled={isProcessing}
                    >
                      <HugeiconsIcon
                        icon={PackageIcon}
                        className="w-4 h-4 mr-2"
                      />
                      {isLocked
                        ? `Subscribe for ${addon.price}`
                        : 'Upgrade Subscription'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
