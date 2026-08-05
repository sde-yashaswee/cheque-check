'use client'

import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntityAvatarProps {
  name: string
  color?: string
  icon?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EntityAvatar({ name, color, icon, className, size = 'md' }: EntityAvatarProps) {
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

  const IconComponent = icon ? (LucideIcons as any)[icon] : null

  return (
    <div 
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: defaultColor }}
    >
      {IconComponent ? (
        <IconComponent className={iconSizeClasses[size]} />
      ) : (
        <span className={cn(
          "font-bold uppercase",
          size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-sm'
        )}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  )
}
