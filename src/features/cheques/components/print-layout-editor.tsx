'use client'

import { useState } from 'react'
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
  getPrintLayout,
  savePrintLayout,
  type PrintLayout,
} from '@/features/cheques/lib/print-cheque'

const fields: Array<{ key: keyof PrintLayout; label: string }> = [
  { key: 'payeeX', label: 'Payee X' },
  { key: 'payeeY', label: 'Payee Y' },
  { key: 'amountX', label: 'Amount X' },
  { key: 'amountY', label: 'Amount Y' },
  { key: 'dateX', label: 'Date X' },
  { key: 'dateY', label: 'Date Y' },
  { key: 'chequeNumberX', label: 'Cheque number X' },
  { key: 'chequeNumberY', label: 'Cheque number Y' },
]

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
  const [layout, setLayout] = useState<PrintLayout>(() =>
    getPrintLayout(accountId),
  )

  const update = (key: keyof PrintLayout, value: string) => {
    setLayout((current) => ({ ...current, [key]: Number(value) || 0 }))
  }

  const reset = () => setLayout(defaultPrintLayout)

  const save = () => {
    savePrintLayout(accountId, layout)
    setOpen(false)
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
        <p className="text-xs text-muted-foreground">
          {t('printCoordinatesHelp')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ key, label }) => (
            <label key={key} className="space-y-1 text-xs font-semibold">
              {label} (mm)
              <Input
                type="number"
                min="0"
                step="1"
                value={layout[key]}
                onChange={(event) => update(key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="flex justify-between gap-2">
          <Button type="button" variant="ghost" onClick={reset}>
            {t('resetPrintLayout')}
          </Button>
          <Button type="button" onClick={save}>
            {t('savePrintLayout')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
