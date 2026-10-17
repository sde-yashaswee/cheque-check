'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { Json } from '@/types/database.types'
import { premiumWorkspaceService } from '../service'
import type { SavedTool, ToolKind } from '../types'
import { Confirmation, TextField } from './controls'
import type { RunAction } from './workspace'

export function SavedTools({
  businessId,
  kind,
  tools,
  payload,
  onApply,
  run,
  busy,
  disabled = false,
}: {
  businessId: string
  kind: ToolKind
  tools: SavedTool[]
  payload: Json
  onApply: (payload: Json) => void
  run: RunAction
  busy: boolean
  disabled?: boolean
}) {
  const t = useTranslations('PremiumWorkspace')
  const [name, setName] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <TextField
            label={t('toolName')}
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button
          disabled={busy || disabled || !name.trim()}
          onClick={() =>
            void run(async () => {
              await premiumWorkspaceService.saveTool(
                businessId,
                kind,
                name,
                payload,
              )
              setName('')
            })
          }
        >
          {t('save')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t('syncHelp')}</p>
      {!tools.length && (
        <p className="text-sm text-muted-foreground">{t('noSavedTools')}</p>
      )}
      <ul className="space-y-2">
        {tools.map((tool) => (
          <li key={tool.id} className="space-y-2 border-t pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="break-words font-medium">{tool.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      onApply(await premiumWorkspaceService.applyTool(tool.id))
                    })
                  }
                >
                  {t('apply')}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setDeleting(tool.id)}
                >
                  {t('delete')}
                </Button>
              </div>
            </div>
            {deleting === tool.id && (
              <Confirmation
                message={t('confirmDelete')}
                confirm={t('delete')}
                cancel={t('cancel')}
                busy={busy}
                onCancel={() => setDeleting(null)}
                onConfirm={() =>
                  void run(async () => {
                    await premiumWorkspaceService.deleteTool(tool.id)
                    setDeleting(null)
                  })
                }
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
