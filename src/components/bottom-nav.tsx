'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon as Home, File02Icon as FileText, UserGroupIcon as Users, BankIcon as Landmark } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Cheques', href: '/cheques', icon: FileText },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Accounts', href: '/accounts', icon: Landmark },
]

export function BottomNav() {
  const pathname = usePathname()

  // Only show bottom nav on main top-level routes
  const isMainTab = ['/', '/cheques', '/parties', '/accounts', '/settings', '/businesses', '/features'].includes(pathname)

  if (!isMainTab) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around bg-canvas-parchment/80 px-4 pb-safe backdrop-blur-md dark:bg-black/80 border-t border-primary/5">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={item.icon} className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            <span className={cn("text-[10px] font-semibold tracking-tight", isActive ? "opacity-100" : "opacity-70")}>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

