'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tag01Icon as TagIcon } from '@hugeicons/core-free-icons'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Tag, TagEntityType } from '@/types'
import { useEntityTags } from '@/features/tags/hooks/use-entity-tags'

interface TagChipsProps {
  tags: readonly Tag[] | undefined
  /** Show at most this many chips, then a "+N" chip. */
  max?: number
  linked?: boolean
  className?: string
}

export function TagChips({ tags, max, linked, className }: TagChipsProps) {
  if (!tags?.length) return null
  const visible = max ? tags.slice(0, max) : tags
  const hidden = tags.length - visible.length
  const chipClass =
    'inline-flex h-5 max-w-32 items-center truncate rounded-full px-2 text-[10px] font-semibold text-white'

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {visible.map((tag) =>
        linked ? (
          <Link
            key={tag.id}
            href={`/tags/${tag.id}`}
            className={cn(chipClass, 'h-6 px-2.5 text-xs')}
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </Link>
        ) : (
          <span
            key={tag.id}
            className={chipClass}
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ),
      )}
      {hidden > 0 && (
        <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-[10px] font-semibold text-muted-foreground">
          +{hidden}
        </span>
      )}
    </div>
  )
}

/** Read-only tags block for entity view pages. */
export function EntityTagsSection({
  entityType,
  entityId,
}: {
  entityType: TagEntityType
  entityId: string
}) {
  const t = useTranslations('Common')
  const { tags, isLoading } = useEntityTags(entityType, entityId)

  if (!isLoading && tags.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <HugeiconsIcon icon={TagIcon} className="h-3 w-3" />
        {t('tags')}
      </p>
      {isLoading ? (
        <div className="flex h-6 gap-1">
          <Skeleton stagger={false} className="h-6 w-16 rounded-full" />
          <Skeleton stagger={false} className="h-6 w-20 rounded-full" />
        </div>
      ) : (
        <TagChips tags={tags} linked />
      )}
    </div>
  )
}
