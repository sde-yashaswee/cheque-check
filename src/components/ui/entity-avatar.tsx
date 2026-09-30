'use client'

import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import * as HugeIcons from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface EntityAvatarProps {
  name: string
  color?: string
  icon?: string
  imageUrl?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

function AvatarImage({
  imageUrl,
  name,
  size,
}: {
  imageUrl: string
  name: string
  size: 'sm' | 'md' | 'lg'
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  if (failed) {
    return (
      <span
        className={cn(
          'font-bold uppercase',
          size === 'sm'
            ? 'text-[8px]'
            : size === 'md'
              ? 'text-[10px]'
              : 'text-sm',
        )}
      >
        {name?.charAt(0) || '?'}
      </span>
    )
  }

  return (
    <>
      {!loaded && (
        <Skeleton stagger={false} className="absolute inset-0 rounded-full" />
      )}
      <img
        ref={imageRef}
        src={imageUrl}
        alt={name}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn('h-full w-full object-cover', !loaded && 'invisible')}
      />
    </>
  )
}

export function EntityAvatar({
  name,
  color,
  icon,
  imageUrl,
  className,
  size = 'md',
}: EntityAvatarProps) {
  // Use a default color based on the first letter if none provided
  const defaultColor = color || '#007AFF'

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  }

  const iconSizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3.5 w-3.5',
    lg: 'h-6 w-6',
  }

  const IconComponent = icon ? (HugeIcons as any)[icon] : null

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full text-white overflow-hidden',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: defaultColor }}
    >
      {imageUrl ? (
        <AvatarImage
          key={imageUrl}
          imageUrl={imageUrl}
          name={name}
          size={size}
        />
      ) : IconComponent ? (
        <HugeiconsIcon icon={IconComponent} className={iconSizeClasses[size]} />
      ) : (
        <span
          className={cn(
            'font-bold uppercase',
            size === 'sm'
              ? 'text-[8px]'
              : size === 'md'
                ? 'text-[10px]'
                : 'text-sm',
          )}
        >
          {name?.charAt(0) || '?'}
        </span>
      )}
    </div>
  )
}
