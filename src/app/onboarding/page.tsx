'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessService } from '@/services/business.service'
import { ProfileService } from '@/services/profile.service'
import { useBusiness } from '@/hooks/use-business'
import { Wallet, Building2, Settings2, CheckCircle2 } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { businesses, isLoading: businessesLoading } = useBusiness()

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')

  // Step 2: Preferences
  const [currency, setCurrency] = useState('₹')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState('12h')
  const [timeZone, setTimeZone] = useState('Asia/Kolkata')
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    if (!businessesLoading && businesses.length > 0 && step === 1) {
      // If user already has a business, skip to preferences or dashboard
      // But for onboarding flow, we might want them to complete it.
      // However, if they have a business, they are not really "new".
      // Let's just allow them to finish if they somehow landed here.
    }
  }, [businesses, businessesLoading, step])

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await BusinessService.create({
        name: businessName,
        email: businessEmail || null,
        phone: businessPhone || null,
        address: businessAddress || null,
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
    setLoading(true)
    try {
      await ProfileService.update({
        currency,
        date_format: dateFormat,
        time_format: timeFormat,
        time_zone: timeZone,
        language,
      })
      setStep(3)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const finishOnboarding = () => {
    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-parchment px-6 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-product mb-4">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="text-display-sm font-black tracking-tight">Welcome to ChequeCheck</h1>
          <p className="text-body text-muted-foreground mt-2">Let&apos;s get you set up in a few seconds.</p>
          
          <div className="flex items-center gap-2 mt-6">
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-surface-tile-1 border border-primary/5">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 text-primary font-bold">
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
                  className="h-12 bg-canvas-parchment border-none rounded-xl"
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
                  className="h-12 bg-canvas-parchment border-none rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bizPhone">Business Phone (Optional)</Label>
                <Input 
                  id="bizPhone" 
                  placeholder="+91 98765 43210" 
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="h-12 bg-canvas-parchment border-none rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-pill h-12 text-lg shadow-product" disabled={loading}>
                {loading ? 'Saving...' : 'Next Step'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                <Settings2 className="h-5 w-5" />
                <span>Your Preferences</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-12 bg-canvas-parchment border-none rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="₹">INR (₹)</SelectItem>
                      <SelectItem value="$">USD ($)</SelectItem>
                      <SelectItem value="€">EUR (€)</SelectItem>
                      <SelectItem value="£">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger className="h-12 bg-canvas-parchment border-none rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger className="h-12 bg-canvas-parchment border-none rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-12 bg-canvas-parchment border-none rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Select value={timeZone} onValueChange={setTimeZone}>
                  <SelectTrigger className="h-12 bg-canvas-parchment border-none rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">IST (UTC+5:30)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">EST (UTC-5)</SelectItem>
                    <SelectItem value="Europe/London">GMT (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full rounded-pill h-12 text-lg shadow-product" disabled={loading}>
                {loading ? 'Saving...' : 'Finish Setup'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
                <p className="text-muted-foreground">Your business and preferences have been configured.</p>
              </div>
              <Button onClick={finishOnboarding} className="w-full rounded-pill h-12 text-lg shadow-product">
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
