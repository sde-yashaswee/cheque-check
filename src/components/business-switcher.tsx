'use client'

import { useBusiness } from "@/hooks/use-business"
import { ChevronDown, Plus, Check, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"

interface BusinessSwitcherProps {
  trigger?: React.ReactElement
}

export function BusinessSwitcher({ trigger }: BusinessSwitcherProps) {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 rounded-pill bg-canvas-parchment px-4 py-2 text-sm font-semibold transition-transform active:scale-95 dark:bg-surface-tile-1">
            <ChevronDown className="h-4 w-4" />
            <span>{activeBusiness?.name || 'Select Business'}</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 rounded-3xl overflow-hidden border shadow-2xl" align="start">
        <Command className="bg-popover">
          <div className="px-4 py-3 border-b">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Switch Business</h2>
          </div>
          <CommandInput placeholder="Search business..." className="h-12 border-none" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No business found.</CommandEmpty>
            <CommandGroup>
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  onSelect={() => {
                    setActiveBusiness(business)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors",
                    activeBusiness?.id === business.id ? "bg-primary/5" : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs",
                    activeBusiness?.id === business.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={cn(
                    "flex-1 font-bold text-sm truncate",
                    activeBusiness?.id === business.id ? "text-primary" : "text-foreground"
                  )}>
                    {business.name}
                  </span>
                  {activeBusiness?.id === business.id && (
                    <Check className="h-4 w-4 text-primary font-black" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <Link href="/businesses/create" onClick={() => setOpen(false)}>
                <CommandItem className="flex items-center gap-3 px-4 py-4 cursor-pointer text-primary hover:bg-primary/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="font-black text-sm uppercase tracking-tight">Add New Business</span>
                </CommandItem>
              </Link>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
