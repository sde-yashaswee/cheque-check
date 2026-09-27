import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// App Router has no navigation-blocking API, so guard link clicks, history back and tab close.
export function useLeaveGuard(enabled: boolean) {
  const router = useRouter()
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null)
  const bypassRef = useRef(false)
  const hasSentinelRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (bypassRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    const onClick = (event: MouseEvent) => {
      if (
        bypassRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const anchor = (event.target as Element | null)?.closest?.('a[href]')
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return
      }
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin) return
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      const href = `${url.pathname}${url.search}${url.hash}`
      setPendingLeave(() => () => router.push(href))
    }

    // A duplicate entry lets us catch the back gesture without leaving the page.
    if (!hasSentinelRef.current) {
      window.history.pushState(null, '', window.location.href)
      hasSentinelRef.current = true
    }
    const onPopState = () => {
      if (bypassRef.current) return
      window.history.pushState(null, '', window.location.href)
      setPendingLeave(() => () => window.history.go(-2))
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
    }
  }, [enabled, router])

  const bypass = useCallback((navigate: () => void) => {
    bypassRef.current = true
    navigate()
  }, [])

  const confirmLeave = useCallback(() => {
    const leave = pendingLeave
    setPendingLeave(null)
    if (leave) bypass(leave)
  }, [bypass, pendingLeave])

  const cancelLeave = useCallback(() => setPendingLeave(null), [])

  const goBack = useCallback(() => {
    bypass(() => window.history.go(hasSentinelRef.current ? -2 : -1))
  }, [bypass])

  return {
    isLeavePending: pendingLeave !== null,
    confirmLeave,
    cancelLeave,
    bypass,
    goBack,
  }
}
