import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon as AlertCircle } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ErrorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  error?: Error & { digest?: string }
  reset?: () => void
}

export function ErrorView({
  title = "Something went wrong",
  description = "An unexpected error occurred. Our team has been notified.",
  error,
  reset,
  className,
  ...props
}: ErrorViewProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in zoom-in duration-300",
        className
      )}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <HugeiconsIcon icon={AlertCircle} className="h-10 w-10 text-destructive/60" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-destructive">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-[280px] mx-auto">
        {description}
      </p>
      {error?.digest && (
        <p className="mt-2 text-[10px] font-mono text-muted-foreground/50">
          ID: {error.digest}
        </p>
      )}
      {reset && (
        <div className="mt-6">
          <Button onClick={reset} variant="destructive" className="rounded-full px-8">
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
