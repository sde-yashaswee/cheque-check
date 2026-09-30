'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Tag01Icon as TagIcon,
  Tick02Icon as Check,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { FormSection } from '@/components/ui/form-section'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagColorPicker } from './tag-color-picker'

export interface TagFormValues {
  name: string
  color: string
}

interface TagFormProps {
  defaultValues: TagFormValues
  submitLabel: string
  isSaving: boolean
  onSubmit: (values: TagFormValues) => Promise<void> | void
  children?: React.ReactNode
}

export function TagForm({
  defaultValues,
  submitLabel,
  isSaving,
  onSubmit,
  children,
}: TagFormProps) {
  const t = useTranslations('Tags')
  const tc = useTranslations('Common')
  const [name, setName] = useState(defaultValues.name)
  const [color, setColor] = useState(defaultValues.color)
  const trimmedName = name.trim()

  return (
    <form
      className="space-y-10"
      onSubmit={(event) => {
        event.preventDefault()
        if (trimmedName) void onSubmit({ name: trimmedName, color })
      }}
    >
      <FormSection title={t('details')} icon={TagIcon}>
        <div className="space-y-2">
          <Label
            htmlFor="tag-name"
            className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {t('tagName')}
          </Label>
          <Input
            leftIcon={TagIcon}
            id="tag-name"
            value={name}
            maxLength={50}
            autoFocus={!defaultValues.name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('tagNamePlaceholder')}
            className="h-14 rounded-sm border-none bg-canvas-parchment text-lg font-semibold"
          />
        </div>

        <div className="space-y-3">
          <Label className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('tagColor')}
          </Label>
          <TagColorPicker
            value={color}
            onChange={setColor}
            label={t('tagColor')}
          />
        </div>

        <div className="space-y-2">
          <Label className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('preview')}
          </Label>
          <div className="flex h-12 items-center rounded-sm bg-canvas-parchment px-4 dark:bg-surface-tile-1">
            <span
              className="inline-flex h-7 max-w-full items-center truncate rounded-full px-3 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {trimmedName || t('tagNamePlaceholder')}
            </span>
          </div>
        </div>
      </FormSection>

      <div className="flex flex-col gap-3 pt-4">
        <Button
          type="submit"
          className="h-14 w-full rounded-full text-lg"
          disabled={!trimmedName || isSaving}
        >
          {isSaving ? tc('saving') : submitLabel}
          <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
        </Button>
        {children}
      </div>
    </form>
  )
}
