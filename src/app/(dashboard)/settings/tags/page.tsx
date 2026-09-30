'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useBusiness } from '@/hooks/use-business'
import { useTags } from '@/features/tags/hooks/use-tags'
import { TagColorPicker } from '@/features/tags/components/tag-color-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Delete02Icon as Delete,
  Edit02Icon as Edit,
  Tick02Icon as Save,
} from '@hugeicons/core-free-icons'

export default function TagsPage() {
  const t = useTranslations('Settings')
  const { activeBusiness } = useBusiness()
  const { tags, isLoading, updateTag, deleteTag, isUpdating, isDeleting } =
    useTags(activeBusiness?.id)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftColor, setDraftColor] = useState('#0066cc')

  const startEditing = (id: string, name: string, color: string) => {
    setEditingId(id)
    setDraftName(name)
    setDraftColor(color)
  }

  const save = async () => {
    if (!editingId || !draftName.trim()) return
    await updateTag({
      id: editingId,
      input: { name: draftName.trim(), color: draftColor },
    })
    setEditingId(null)
  }

  if (!activeBusiness || isLoading) {
    return (
      <div className="max-w-2xl space-y-4 pb-20">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('manageTags')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('manageTagsDesc', { business: activeBusiness.name })}
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('noTagsYet')}
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) =>
            editingId === tag.id ? (
              <div
                key={tag.id}
                className="space-y-3 rounded-lg border bg-card p-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="h-9"
                    aria-label={t('tagName')}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => void save()}
                    disabled={isUpdating || !draftName.trim()}
                    aria-label={t('saveTag')}
                  >
                    <HugeiconsIcon icon={Save} className="h-4 w-4" />
                  </Button>
                </div>
                <TagColorPicker
                  value={draftColor}
                  onChange={setDraftColor}
                  label={t('tagColor')}
                />
              </div>
            ) : (
              <div
                key={tag.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="truncate font-semibold">{tag.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(tag.id, tag.name, tag.color)}
                    aria-label={t('editTag')}
                  >
                    <HugeiconsIcon icon={Edit} className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void deleteTag(tag.id)}
                    disabled={isDeleting}
                    aria-label={t('deleteTag')}
                  >
                    <HugeiconsIcon
                      icon={Delete}
                      className="h-4 w-4 text-destructive"
                    />
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
