'use client'

import * as React from 'react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CurrencyPrefixInputProps extends InputProps {
  currency: string
}

export const CurrencyPrefixInput = React.forwardRef<
  HTMLInputElement,
  CurrencyPrefixInputProps
>(({ currency, className, ...props }, ref) => {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base font-semibold text-muted-foreground pointer-events-none">
        {currency}
      </span>
      <Input ref={ref} className={cn('pl-10', className)} {...props} />
    </div>
  )
})
CurrencyPrefixInput.displayName = 'CurrencyPrefixInput'
