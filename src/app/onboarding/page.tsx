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
import { Wallet, Building2, Settings2, CheckCircle2, Bell, ArrowRight, ArrowLeft } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { businesses, isLoading: businessesLoading, activeBusiness } = useBusiness()
  const { profile, updateProfile } = useProfile()

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')

  // Step 2: General Preferences
  const [currency, setCurrency] = useState('₹')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState('12h')
  const [timeZone, setTimeZone] = useState('Asia/Kolkata')
  const [language, setLanguage] = useState('en')

  // Step 3: Reminder Preferences
  const [remindersPerDay, setRemindersPerDay] = useState('1')
  const [defaultReminderDays, setDefaultReminderDays] = useState('3')

  useEffect(() => {
    if (profile) {
      setCurrency(profile.currency || '₹')
      setDateFormat(profile.date_format || 'DD/MM/YYYY')
      setTimeFormat(profile.time_format || '12h')
      setTimeZone(profile.time_zone || 'Asia/Kolkata')
      setLanguage(profile.language || 'en')
      setRemindersPerDay(profile.reminders_per_day?.toString() || '1')
      setDefaultReminderDays(profile.default_reminder_days?.toString() || '3')
    }
  }, [profile])

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName) return
    setLoading(true)
    try {
      await BusinessService.create({
        name: businessName,
        email: businessEmail || null,
        phone: businessPhone || null,
        address: businessAddress || null,
        logo_url: null,
      })
      setStep(2)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile({
        currency,
        date_format: dateFormat,
        time_format: timeFormat,
        time_zone: timeZone,
        language,
        reminders_per_day: parseInt(remindersPerDay),
        default_reminder_days: parseInt(defaultReminderDays)
      })
      setStep(4)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const finishOnboarding = () => {
    router.push('/')
  }

  const currencyOptions = [
    { label: '₹ (INR)', value: '₹' },
    { label: '$ (USD)', value: '$' },
    { label: '€ (EUR)', value: '€' },
    { label: '£ (GBP)', value: '£' },
  ]

  const dateFormatOptions = [
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  ]

  const timeFormatOptions = [
    { label: '12-hour (AM/PM)', value: '12h' },
    { label: '24-hour', value: '24h' },
  ]

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
  ]

  const timeZoneOptions = [
    { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
    { label: 'UTC', value: 'UTC' },
    { label: 'EST (UTC-5)', value: 'America/New_York' },
    { label: 'GMT (UTC+0)', value: 'Europe/London' },
  ]

  const remindersPerDayOptions = [
    { label: '1 time/day', value: '1' },
    { label: '2 times/day', value: '2' },
    { label: '3 times/day', value: '3' },
  ]

  const reminderFrequencyOptions = [
    { label: '1 day before', value: '1' },
    { label: '3 days before', value: '3' },
    { label: '7 days before', value: '7' },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-parchment px-6 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white mb-4">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="text-display-md font-semibold tracking-tight">Welcome to ChequeCheck</h1>
          <p className="text-body text-muted-foreground mt-2">Let&apos;s get you set up in a few seconds.</p>
          
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 w-10 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-8 dark:bg-surface-tile-1 border border-primary/5">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                <Building2 className="h-5 w-5" />
                <span>Business Information</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bizName">Business Name</Label>
                <Input 
                  id="bizName" 
                  placeholder="My Awesome Business" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="h-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bizEmail">Business Email (Optional)</Label>
                <Input 
                  id="bizEmail" 
                  type="email"
                  placeholder="contact@business.com" 
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="h-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bizPhone">Business Phone (Optional)</Label>
                <Input 
                  id="bizPhone" 
                  placeholder="+91 98765 43210" 
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="h-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              <Button type="submit" className="w-full rounded-full h-12 text-lg" disabled={loading || !businessName}>
                {loading ? 'Saving...' : 'Next Step'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                <Settings2 className="h-5 w-5" />
                <span>General Preferences</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Combobox 
                    options={currencyOptions} 
                    value={currency} 
                    onValueChange={setCurrency}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Combobox 
                    options={dateFormatOptions} 
                    value={dateFormat} 
                    onValueChange={setDateFormat}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <Combobox 
                      options={timeFormatOptions} 
                      value={timeFormat} 
                      onValueChange={setTimeFormat}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Combobox 
                      options={languageOptions} 
                      value={language} 
                      onValueChange={setLanguage}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Combobox 
                    options={timeZoneOptions} 
                    value={timeZone} 
                    onValueChange={setTimeZone}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-full h-12" onClick={() => setStep(1)}>
                   Back
                </Button>
                <Button type="submit" className="flex-[2] rounded-full h-12 text-lg">
                  Next Step <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-6">
              <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                <Bell className="h-5 w-5" />
                <span>Reminder Preferences</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reminders Per Day</Label>
                  <Combobox 
                    options={remindersPerDayOptions} 
                    value={remindersPerDay} 
                    onValueChange={setRemindersPerDay}
                  />
                  <p className="text-[10px] text-muted-foreground">How many times should we notify you about a cheque on its due date?</p>
                </div>

                <div className="space-y-2">
                  <Label>Default Reminder Frequency</Label>
                  <Combobox 
                    options={reminderFrequencyOptions} 
                    value={defaultReminderDays} 
                    onValueChange={setDefaultReminderDays}
                  />
                  <p className="text-[10px] text-muted-foreground">Start notifying you this many days before the due date.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-full h-12" onClick={() => setStep(2)}>
                   Back
                </Button>
                <Button type="submit" className="flex-[2] rounded-full h-12 text-lg" disabled={loading}>
                  {loading ? 'Saving...' : 'Finish Setup'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">You&apos;re all set!</h2>
                <p className="text-muted-foreground">Your business and preferences have been configured.</p>
              </div>
              <Button onClick={finishOnboarding} className="w-full rounded-full h-12 text-lg">
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

}
