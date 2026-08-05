"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import Link from "next/link"

interface ComboboxProps {
  options: { label: string; value: string; color?: string; icon?: string }[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  createUrl?: string
  createLabel?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyMessage = "No option found.",
  className,
  createUrl,
  createLabel = "Add new",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between h-12 rounded-sm border-primary/10", className)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption && (
            <EntityAvatar 
              name={selectedOption.label} 
              color={selectedOption.color} 
              icon={selectedOption.icon} 
              size="sm" 
            />
          )}
          <span className="truncate font-semibold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 rounded-lg overflow-hidden border border-primary/5" align="start">
        <Command className="rounded-none">
          <CommandInput placeholder={placeholder} className="h-12" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm">
              <p className="text-muted-foreground font-semibold">{emptyMessage}</p>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Command uses value for filtering
                  onSelect={() => {
                    onValueChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-3 px-4"
                >
                  <div className="flex items-center gap-2">
                    <EntityAvatar name={option.label} color={option.color} icon={option.icon} size="sm" />
                    <span className="font-semibold">{option.label}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 text-primary",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {createUrl && (
            <>
              <CommandSeparator />
              <div className="p-1">
                <Link href={createUrl}>
                  <div className="flex items-center gap-2 rounded-sm px-3 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer">
                    <PlusCircle className="h-4 w-4" />
                    {createLabel}
                  </div>
                </Link>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )

}
