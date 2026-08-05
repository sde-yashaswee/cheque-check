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
      <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden shadow-2xl border-none">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Switch Business</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 p-6">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBusiness(b)}
              className={cn(
                "w-full rounded-2xl px-4 py-4 text-left text-body font-bold transition-all active:scale-[0.97]",
                activeBusiness?.id === b.id 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "bg-canvas-parchment hover:bg-muted text-muted-foreground"
              )}
            >
              {b.name}
            </button>
          ))}
          <Link href="/businesses/create" className="block pt-2">
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/20 px-4 py-4 text-primary font-bold hover:bg-primary/5 transition-colors">
              <Plus className="h-5 w-5" />
              <span>Add New Business</span>
            </button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
