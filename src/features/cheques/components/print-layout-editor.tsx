'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import {
  defaultPrintLayout,
  getPrintLayout as getLocalPrintLayout,
  type PrintLayout,
} from '@/features/cheques/lib/print-cheque'
import {
  PremiumGate,
  usePremiumAction,
} from '@/features/monetization/components/premium-gate'
import {
  getPrintLayout,
  savePrintLayout,
} from '@/features/premium-workspace/services/workspace.service'
import { toast } from '@/components/ui/toast'

const fields: Array<keyof PrintLayout> = [
  'payeeX',
  'payeeY',
  'amountX',
  'amountY',
  'dateX',
  'dateY',
  'chequeNumberX',
  'chequeNumberY',
]

const layoutQueryKey = (accountId: string) => [
  'premium-workspace',
  'print-layout',
  accountId,
]

function layoutInputs(layout: PrintLayout): Record<keyof PrintLayout, string> {
  return {
    payeeX: String(layout.payeeX),
    payeeY: String(layout.payeeY),
    amountX: String(layout.amountX),
    amountY: String(layout.amountY),
    dateX: String(layout.dateX),
    dateY: String(layout.dateY),
    chequeNumberX: String(layout.chequeNumberX),
    chequeNumberY: String(layout.chequeNumberY),
  }
}

export function PrintLayoutEditor({
  accountId,
  open: controlledOpen,
  onOpenChange,
}: {
  accountId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const t = useTranslations('Cheques')
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = (value: boolean) => {
    if (!isControlled) setUncontrolledOpen(value)
    onOpenChange?.(value)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={<Button variant="ghost" className="rounded-full" />}
        >
          {t('configurePrint')}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('configurePrint')}</DialogTitle>
        </DialogHeader>
        <PremiumGate feature="cheque-printing">
          <PrintLayoutLoader
            accountId={accountId}
            onSaved={() => setOpen(false)}
          />
        </PremiumGate>
      </DialogContent>
    </Dialog>
  )
}

function PrintLayoutLoader({
  accountId,
  onSaved,
}: {
  accountId: string
  onSaved: () => void
}) {
  const tp = useTranslations('Premium')
  const query = useQuery({
    queryKey: layoutQueryKey(accountId),
    queryFn: () => getPrintLayout(accountId),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })
  if (query.isPending || query.isFetching)
    return <p role="status">{tp('loading')}</p>
  if (query.isError)
    return (
      <div role="alert" className="space-y-3">
        <p>{query.error.message}</p>
        <Button onClick={() => void query.refetch()}>{tp('retry')}</Button>
      </div>
    )
  return (
    <PrintLayoutForm
      key={accountId}
      accountId={accountId}
      initialLayout={query.data ?? getLocalPrintLayout(accountId)}
      onSaved={onSaved}
    />
  )
}

function PrintLayoutForm({
  accountId,
  initialLayout,
  onSaved,
}: {
  accountId: string
  initialLayout: PrintLayout
  onSaved: () => void
}) {
  const t = useTranslations('Cheques')
  const tc = useTranslations('Common')
  const premium = usePremiumAction()
  const queryClient = useQueryClient()
  const [layout, setLayout] = useState(() => layoutInputs(initialLayout))
  const [isSaving, setIsSaving] = useState(false)

  const save = async () => {
    if (isSaving) return
    const parsed = { ...initialLayout }
    for (const key of fields) {
      const value = Number(layout[key])
      if (
        !layout[key].trim() ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > (key.endsWith('X') ? 210 : 297)
      ) {
        toast.add({
          title: tc('error'),
          description: t('printCoordinatesInvalid'),
          type: 'error',
        })
        return
      }
      parsed[key] = value
    }
    setIsSaving(true)
    try {
      if (!(await premium.verifyAccess('cheque-printing'))) return
      await savePrintLayout(accountId, parsed)
      queryClient.setQueryData(layoutQueryKey(accountId), parsed)
      onSaved()
    } catch (error) {
      toast.add({
        title: tc('error'),
        description: error instanceof Error ? error.message : tc('error'),
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {t('printCoordinatesHelp')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((key) => (
          <label key={key} className="space-y-1 text-xs font-semibold">
            {t(`printFields.${key}`)} (mm)
            <Input
              type="number"
              min="0"
              max={key.endsWith('X') ? 210 : 297}
              step="1"
              value={layout[key]}
              onChange={(event) =>
                setLayout((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              disabled={isSaving}
            />
          </label>
        ))}
      </div>
      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={isSaving}
          onClick={() => setLayout(layoutInputs(defaultPrintLayout))}
        >
          {t('resetPrintLayout')}
        </Button>
        <Button type="button" disabled={isSaving} onClick={() => void save()}>
          {t('savePrintLayout')}
        </Button>
      </div>
    </div>
  )
}
