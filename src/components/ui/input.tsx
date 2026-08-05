import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border border-input bg-canvas-parchment px-4 py-2 text-base transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-surface-tile-1",
        className
      )}
      {...props}
    />
  )
}

export { Input }
