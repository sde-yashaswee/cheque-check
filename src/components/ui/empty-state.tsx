import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: any
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  illustration?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in zoom-in duration-300",
        className
      )}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 mb-6">
        {illustration ? (
          illustration
        ) : Icon ? (
          <HugeiconsIcon icon={Icon} className="h-10 w-10 text-primary/40"/>
        ) : null}
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-[280px] mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action.onClick ? (
            <Button onClick={action.onClick} className="rounded-full px-8">
              {action.label}
            </Button>
          ) : action.href ? (
            <Button render={<Link href={action.href} />} className="rounded-full px-8">
              {action.label}
            </Button>
          ) : (
            <Button className="rounded-full px-8">{action.label}</Button>
          )}
        </div>
      )}
    </div>
  )
}

