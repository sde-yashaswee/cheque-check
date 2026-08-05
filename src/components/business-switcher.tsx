'use client'

import { useBusiness } from "@/hooks/use-business"
import { ChevronDown, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function BusinessSwitcher() {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness()

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button className="flex items-center gap-2 rounded-pill bg-canvas-parchment px-4 py-2 text-sm font-semibold transition-transform active:scale-95 dark:bg-surface-tile-1">
            <ChevronDown className="h-4 w-4" />
            <span>{activeBusiness?.name || 'Select Business'}</span>
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-t-[32px] sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Switch Business</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBusiness(b)}
              className={cn(
                "w-full rounded-lg px-4 py-3 text-left text-body font-medium transition-colors",
                activeBusiness?.id === b.id 
                  ? "bg-primary text-white" 
                  : "bg-canvas-parchment hover:bg-muted"
              )}
            >
              {b.name}
            </button>
          ))}
          <Link href="/businesses/create" className="block">
            <button className="flex w-full items-center gap-2 rounded-lg border border-dashed border-primary/40 px-4 py-3 text-primary hover:bg-primary/5">
              <Plus className="h-4 w-4" />
              <span>Add New Business</span>
            </button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
