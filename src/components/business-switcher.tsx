'use client'

import { useBusiness } from "@/hooks/use-business"
import { ChevronDown, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"

interface BusinessSwitcherProps {
  trigger?: React.ReactElement
}

export function BusinessSwitcher({ trigger }: BusinessSwitcherProps) {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || (
          <button className="flex items-center gap-2 rounded-pill bg-canvas-parchment px-4 py-2 text-sm font-semibold transition-transform active:scale-95 dark:bg-surface-tile-1">
            <ChevronDown className="h-4 w-4" />
            <span>{activeBusiness?.name || 'Select Business'}</span>
          </button>
        )}
      />
      <DialogContent className="w-[340px] p-0 rounded-2xl overflow-hidden border border-primary/5 shadow-product" showCloseButton={false}>
        <Command className="bg-popover">
          <div className="px-5 py-4 border-b border-primary/5 bg-muted/30">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-80">Switch Business</h2>
          </div>
          <CommandInput placeholder="Search business..." className="h-14 border-none" />
          <CommandList className="max-h-[350px] p-2">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground font-medium">No business found.</CommandEmpty>
            <CommandGroup>
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  onSelect={() => {
                    setActiveBusiness(business)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200",
                    activeBusiness?.id === business.id ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm shadow-sm",
                    activeBusiness?.id === business.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 truncate">
                    <span className={cn(
                      "font-bold text-[15px] truncate",
                      activeBusiness?.id === business.id ? "text-primary" : "text-foreground"
                    )}>
                      {business.name}
                    </span>
                    {activeBusiness?.id === business.id && (
                      <span className="text-[10px] text-primary/70 font-semibold uppercase tracking-wider">Active Now</span>
                    )}
                  </div>
                  {activeBusiness?.id === business.id && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator className="bg-primary/5" />
          <div className="p-2">
            <Link href="/businesses/create" onClick={() => setOpen(false)} className="block">
              <CommandItem className="flex items-center gap-3 px-4 py-4 cursor-pointer text-primary hover:bg-primary/5 rounded-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest">Add New Business</span>
              </CommandItem>
            </Link>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
