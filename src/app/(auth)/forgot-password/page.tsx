'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthService } from '@/services/auth.service'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet01Icon as Wallet, ArrowLeft01Icon as ArrowLeft, Mail01Icon as Mail } from '@hugeicons/core-free-icons';
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth')
  const tc = useTranslations('Common')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await AuthService.resetPassword(email)
      if (error) {
        alert(error.message)
      } else {
        setSent(true)
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-canvas-parchment px-6 dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white">
            <HugeiconsIcon icon={Wallet} className="h-8 w-8"/>
          </div>
          <h1 className="mt-6 text-display-md font-semibold tracking-tight">Reset Password</h1>
          <p className="text-body text-muted-foreground">
            {sent ? "Check your email for the reset link": "Enter your email to receive a reset link"}
          </p>
        </div>

        <div className="space-y-4 rounded-lg bg-white p-8 dark:bg-surface-tile-1 border border-primary/5">
          {sent ? (
            <div className="space-y-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 mx-auto">
                <HugeiconsIcon icon={Mail} className="h-6 w-6"/>
              </div>
              <p className="text-sm">We've sent a password reset link to <strong>{email}</strong>.</p>
              <Button asChild className="w-full rounded-full h-12">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              <Button type="submit"className="w-full rounded-full h-12 text-lg"disabled={loading}>
                {loading ? "Sending...": "Send Reset Link"}
              </Button>
              <Link href="/login"className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-2">
                <HugeiconsIcon icon={ArrowLeft} className="h-4 w-4"/> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
