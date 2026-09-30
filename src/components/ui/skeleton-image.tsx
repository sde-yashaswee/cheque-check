'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

type SkeletonImageProps = Omit<React.ComponentProps<'img'>, 'src'> & {
  src: string
  containerClassName?: string
}

function ImageContent({
  src,
  alt,
  className,
  containerClassName,
  onLoad,
  onError,
  ...props
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [])

  return (
    <span className={cn('relative block overflow-hidden', containerClassName)}>
      {!loaded && !failed && (
        <Skeleton
          stagger={false}
          className="absolute inset-0 h-full w-full rounded-[inherit]"
        />
      )}
      {failed && (
        <span className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          {alt}
        </span>
      )}
      <img
        {...props}
        ref={imageRef}
        src={src}
        alt={alt}
        className={cn(className, failed ? 'hidden' : !loaded && 'invisible')}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          setFailed(true)
          onError?.(event)
        }}
      />
    </span>
  )
}

export function SkeletonImage(props: SkeletonImageProps) {
  return <ImageContent key={props.src} {...props} />
}
