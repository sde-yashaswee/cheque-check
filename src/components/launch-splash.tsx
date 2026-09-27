'use client'

import { useEffect, useState } from 'react'
import packageJson from '../../package.json'

export function LaunchSplash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 900)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-primary text-primary-foreground animate-out fade-out duration-300 [animation-delay:600ms] [animation-fill-mode:forwards]">
      <div className="text-3xl font-semibold tracking-tight">ChequeCheck</div>
      <div className="absolute bottom-8 text-xs font-semibold tracking-wider opacity-70">
        v{packageJson.version}
      </div>
    </div>
  )
}
