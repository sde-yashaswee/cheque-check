'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import nProgress from 'nprogress'
import './progress-bar.css'

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    nProgress.configure({ 
      showSpinner: false, 
      speed: 400, 
      minimum: 0.2,
      parent: '#progress-bar-container'
    })
  }, [])

  useEffect(() => {
    // If top nav is present, prefer its container
    const navContainer = document.getElementById('progress-bar-nav-container')
    const parentSelector = navContainer ? '#progress-bar-nav-container' : '#progress-bar-container'
    
    nProgress.configure({ parent: parentSelector })
  }, [pathname])

  useEffect(() => {
    nProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.href && anchor.host === window.location.host) {
        // Only start for internal links that are different from current page
        const fullHref = anchor.href
        const currentHref = window.location.href
        
        // Don't start if it's the same URL (hash changes, etc.)
        if (fullHref !== currentHref && !anchor.hasAttribute('download') && anchor.target !== '_blank') {
          nProgress.start()
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => {
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return null
}
