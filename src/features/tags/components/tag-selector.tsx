'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon as ChevronDown,
  CheckmarkCircle01Icon as Check,
  PlusSignIcon as Plus,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTags } from '@/features/tags/hooks/use-tags'
import type { Tag } from '@/types'
import { cn } from '@/lib/utils'

interface TagSelectorProps {
  businessId: string | undefined
  value: string[]
  onChange: (tagIds: string[]) => void
  placeholder?: string
}

export function TagSelector({
  businessId,
  value,
  onChange,
  placeholder = 'Add tags',
}: TagSelectorProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const { tags, createTag, isCreating } = useTags(businessId)
  const selected = tags.filter((tag) => value.includes(tag.id))

  const toggleTag = (tag: Tag) => {
    onChange(
      value.includes(tag.id)
        ? value.filter((id) => id !== tag.id)
        : [...value, tag.id],
    )
  }

  const addTag = async () => {
    const trimmedName = name.trim()
    if (!businessId || !trimmedName) return
    const tag = await createTag({
      business_id: businessId,
      name: trimmedName,
      color: '#0066cc',
    })
    onChange([...value, tag.id])
    setName('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-12 w-full justify-between rounded-sm border-primary/10"
          />
        }
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selected.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))
          )}
        </div>
        <HugeiconsIcon
          icon={ChevronDown}
          className="h-4 w-4 shrink-0 opacity-50"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(22rem,calc(100vw-2rem))] p-3"
        align="start"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New tag"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void addTag()
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => void addTag()}
              disabled={!name.trim() || isCreating}
              aria-label="Create tag"
            >
              <HugeiconsIcon icon={Plus} className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-muted"
                onClick={() => toggleTag(tag)}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
                <HugeiconsIcon
                  icon={Check}
                  className={cn(
                    'h-4 w-4 text-primary',
                    value.includes(tag.id) ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </button>
            ))}
            {tags.length === 0 && (
              <p className="py-3 text-center text-xs text-muted-foreground">
                No tags yet
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
