'use client'

import { useEffect, useState } from 'react'

const PRIVATE_MEDIA_PREFIX = '/api/storage/'

/**
 * Resolves our private-media proxy URLs to an absolute signed URL client-side,
 * since next/image's optimizer fetches server-side and can't forward cookies
 * to the auth-gated proxy route. Absolute (legacy public bucket) URLs pass through.
 */
export function useSignedMediaUrl(url: string | null | undefined) {
  const isPrivate = !!url && url.startsWith(PRIVATE_MEDIA_PREFIX)
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    url && !isPrivate ? url : null,
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFailed(false)

    if (!url) {
      setResolvedUrl(null)
      return
    }
    if (!url.startsWith(PRIVATE_MEDIA_PREFIX)) {
      setResolvedUrl(url)
      return
    }

    setResolvedUrl(null)
    const controller = new AbortController()
    const separator = url.includes('?') ? '&' : '?'

    fetch(`${url}${separator}format=json`, {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to resolve media URL')
        return res.json() as Promise<{ url: string }>
      })
      .then((data) => setResolvedUrl(data.url))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setFailed(true)
      })

    return () => controller.abort()
  }, [url])

  return { url: resolvedUrl, failed }
}
