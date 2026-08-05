'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BusinessService } from '@/services/business.service'
import { ProfileService } from '@/services/profile.service'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { useQueryClient } from '@tanstack/react-query'
import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet01Icon as Wallet, Building03Icon as Building2, Settings02Icon as Settings2, CheckmarkCircle01Icon as CheckCircle2, Notification01Icon as Bell, ArrowRight01Icon as ArrowRight, ArrowLeft01Icon as ArrowLeft, Mail01Icon as Mail, CallIcon as Phone, Location01Icon as MapPin, Tick02Icon as Check, GlobalIcon as Globe, Calendar01Icon as Calendar, Clock01Icon as Clock, TranslateIcon as Languages, DollarCircleIcon as DollarSign } from '@hugeicons/core-free-icons';
import { Combobox } from '@/components/ui/combobox'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#0066cc', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#8E8E93']

const CURRENCY_OPTIONS = [
  { label: '₹ (INR)', value: '₹' },
  { label: '$ (USD)', value: '$' },
  { label: '€ (EUR)', value: '€' },
  { label: '£ (GBP)', value: '£' },
]

const DATE_FORMAT_OPTIONS = [
  { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
  { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
  { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
]

const TIME_FORMAT_OPTIONS = [
  { label: '12-hour (AM/PM)', value: '12h' },
  { label: '24-hour', value: '24h' },
]

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
]

const TIMEZONE_OPTIONS = [
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'UTC', value: 'UTC' },
  { label: 'EST (UTC-5)', value: 'America/New_York' },
  { label: 'GMT (UTC+0)', value: 'Europe/London' },
]

const REMINDERS_PER_DAY_OPTIONS = [
  { label: '1 time/day', value: '1' },
  { label: '2 times/day', value: '2' },
  { label: '3 times/day', value: '3' },
]

const REMINDER_FREQUENCY_OPTIONS = [
  { label: '1 day before', value: '1' },
  { label: '3 days before', value: '3' },
  { label: '7 days before', value: '7' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { profile, updateProfile } = useProfile()
  const { setActiveBusiness } = useBusiness()

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessColor: '#0066cc',
    currency: '₹',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    timeZone: 'Asia/Kolkata',
    language: 'en',
    remindersPerDay: '1',
    defaultReminderDays: '3',
  })

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        currency: profile.currency || '₹',
        dateFormat: profile.date_format || 'dd/MM/yyyy',
        timeFormat: profile.time_format || '12h',
        timeZone: profile.time_zone || 'Asia/Kolkata',
        language: profile.language || 'en',
        remindersPerDay: profile.reminders_per_day?.toString() || '1',
        defaultReminderDays: profile.default_reminder_days?.toString() || '3',
      }))
    }
  }, [profile])

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleFinish = async () => {
    setLoading(true)
    try {
      // 1. Create Business
      const business = await BusinessService.create({
        name: formData.businessName,
        email: formData.businessEmail || null,
        phone: formData.businessPhone || null,
        address: formData.businessAddress || null,
        color: formData.businessColor,
        logo_url: null,
      })
      await queryClient.invalidateQueries({ queryKey: ['businesses'] })
      setActiveBusiness(business)

      // 2. Update Profile
      await updateProfile({
        currency: formData.currency,
        date_format: formData.dateFormat,
        time_format: formData.timeFormat,
        time_zone: formData.timeZone,
        language: formData.language,
        reminders_per_day: parseInt(formData.remindersPerDay),
        default_reminder_days: parseInt(formData.defaultReminderDays)
      })

      setStep(5)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-black selection:bg-primary/10 transition-colors duration-500">
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-24 space-y-12">
        
        {/* Header */}
        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {step > 1 && step < 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={prevStep} 
                  className="rounded-full h-12 w-12 hover:bg-canvas-parchment"
                >
                  <HugeiconsIcon icon={ArrowLeft} className="h-6 w-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {step < 5 ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Step {step} of 4</p>
                <h1 className="text-display-md md:text-display-lg font-semibold tracking-tight text-ink dark:text-white">
                  {step === 1 && "Welcome to ChequeCheck"}
                  {step === 2 && "Business Details"}
                  {step === 3 && "Personalize Experience"}
                  {step === 4 && "Notifications"}
                </h1>
              </>
            ) : (
              <h1 className="text-display-lg font-semibold tracking-tight text-ink dark:text-white text-center w-full">All Set!</h1>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  s <= step ? "bg-primary" : "bg-canvas-parchment dark:bg-surface-tile-1"
                )} 
              />
            ))}
          </div>
        )}

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Business Name</Label>
                    <div className="relative group">
                      <HugeiconsIcon icon={Building2} className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        placeholder="e.g. Apple Inc." 
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        className="h-14 pl-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none text-xl font-medium rounded-sm transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Brand Color</Label>
                    <div className="flex flex-wrap gap-4 p-1">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({...formData, businessColor: c})}
                          className={cn(
                            "h-12 w-12 rounded-full transition-all active:scale-[0.85] ring-offset-4 dark:ring-offset-black",
                            formData.businessColor === c ? "ring-2 ring-primary scale-110 shadow-lg" : "hover:scale-105 opacity-80 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full rounded-pill h-14 text-lg font-medium shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform" 
                  onClick={nextStep} 
                  disabled={!formData.businessName}
                >
                  Get Started <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Business Email</Label>
                    <div className="relative group">
                      <HugeiconsIcon icon={Mail} className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email"
                        placeholder="contact@company.com" 
                        value={formData.businessEmail}
                        onChange={(e) => setFormData({...formData, businessEmail: e.target.value})}
                        className="h-14 pl-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none text-lg rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Business Phone</Label>
                    <div className="relative group">
                      <HugeiconsIcon icon={Phone} className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.businessPhone}
                        onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                        className="h-14 pl-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none text-lg rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Headquarters</Label>
                    <div className="relative group">
                      <HugeiconsIcon icon={MapPin} className="absolute left-5 top-5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="City, Country" 
                        value={formData.businessAddress}
                        onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                        className="h-14 pl-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none text-lg rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full rounded-pill h-14 text-lg font-medium shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform" 
                  onClick={nextStep}
                >
                  Continue <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Currency</Label>
                    <Combobox 
                      options={CURRENCY_OPTIONS} 
                      value={formData.currency} 
                      onValueChange={(v) => setFormData({...formData, currency: v})}
                      className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Language</Label>
                    <Combobox 
                      options={LANGUAGE_OPTIONS} 
                      value={formData.language} 
                      onValueChange={(v) => setFormData({...formData, language: v})}
                      className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Date Format</Label>
                  <Combobox 
                    options={DATE_FORMAT_OPTIONS} 
                    value={formData.dateFormat} 
                    onValueChange={(v) => setFormData({...formData, dateFormat: v})}
                    className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Time Format</Label>
                    <Combobox 
                      options={TIME_FORMAT_OPTIONS} 
                      value={formData.timeFormat} 
                      onValueChange={(v) => setFormData({...formData, timeFormat: v})}
                      className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Time Zone</Label>
                    <Combobox 
                      options={TIMEZONE_OPTIONS} 
                      value={formData.timeZone} 
                      onValueChange={(v) => setFormData({...formData, timeZone: v})}
                      className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full rounded-pill h-14 text-lg font-medium shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform" 
                  onClick={nextStep}
                >
                  Looks Good <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Daily Frequency</Label>
                    <Combobox 
                      options={REMINDERS_PER_DAY_OPTIONS} 
                      value={formData.remindersPerDay} 
                      onValueChange={(v) => setFormData({...formData, remindersPerDay: v})}
                      className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
                    />
                    <p className="text-[11px] text-muted-foreground px-1">How many alerts should we send on the due date?</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Advanced Warning</Label>
                    <Combobox 
                      options={REMINDER_FREQUENCY_OPTIONS} 
                      value={formData.defaultReminderDays} 
                      onValueChange={(v) => setFormData({...formData, defaultReminderDays: v})}
                      className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
                    />
                    <p className="text-[11px] text-muted-foreground px-1">Days before the due date to start notifying you.</p>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 space-y-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: formData.businessColor }}
                    >
                      {formData.businessName?.charAt(0) || 'B'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink dark:text-white">{formData.businessName}</h3>
                      <p className="text-sm text-muted-foreground">Ready to manage your cheques.</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full rounded-pill h-14 text-lg font-medium shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform" 
                  onClick={handleFinish}
                  disabled={loading}
                >
                  {loading ? 'Completing Setup...' : 'Finish Setup'} <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-12 py-12"
              >
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                    className="flex h-32 w-32 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/20"
                  >
                    <HugeiconsIcon icon={CheckCircle2} className="h-16 w-16" />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500 rounded-full -z-10"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-display-md font-semibold tracking-tight">You&apos;re Ready to Go</h2>
                  <p className="text-lead text-muted-foreground max-w-sm mx-auto">
                    Everything is configured. Welcome to the future of cheque management.
                  </p>
                </div>

                <Button 
                  onClick={() => router.push('/')} 
                  className="w-full max-w-sm rounded-pill h-14 text-xl font-semibold shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
                >
                  Enter Dashboard <HugeiconsIcon icon={ArrowRight} className="ml-2 h-6 w-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
