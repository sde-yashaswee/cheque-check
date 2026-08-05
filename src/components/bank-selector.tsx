"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { useQuery } from "@tanstack/react-query"
import { BankService } from "@/services/bank.service"

interface BankSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  className?: string
}

export function BankSelector({
  value,
  onValueChange,
  className,
}: BankSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const { data: banks } = useQuery({
    queryKey: ['master-banks'],
    queryFn: () => BankService.getAll(),
  })

  const selectedBank = banks?.find((bank) => bank.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <div className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between h-14 rounded-2xl bg-canvas-parchment border-none shadow-sm px-4 text-lg font-medium cursor-pointer", className)}>
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedBank ? (
                <EntityAvatar 
                  name={selectedBank.name} 
                  size="sm" 
                />
              ) : (
                <Landmark className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="truncate">
                {selectedBank ? selectedBank.name : "Select a bank"}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        }
      />
      <PopoverContent className="w-full p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
        <Command className="rounded-none">
          <CommandInput placeholder="Search bank..." className="h-12" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm">
              <p className="text-muted-foreground">No bank found.</p>
            </CommandEmpty>
            <CommandGroup>
              {banks?.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={bank.name}
                  onSelect={() => {
                    onValueChange(bank.id)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-3 px-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <EntityAvatar name={bank.name} size="sm" />
                    <span className="font-bold">{bank.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 text-primary",
                      value === bank.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
