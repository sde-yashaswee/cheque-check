'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon as AlertTriangle, Delete02Icon as Trash2 } from '@hugeicons/core-free-icons';

interface DeleteConfirmationDialogProps {
  title: string
  description: string
  confirmName: string
  onDelete: () => Promise<void>
  trigger?: React.ReactElement
}

export function DeleteConfirmationDialog({
  title,
  description,
  confirmName,
  onDelete,
  trigger
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (inputValue !== confirmName) return
    setLoading(true)
    try {
      await onDelete()
      setOpen(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || (
          <Button variant="destructive" className="rounded-2xl h-12">
            <HugeiconsIcon icon={Trash2} className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
      />
      <DialogContent className="rounded-3xl sm:max-w-[400px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
              <HugeiconsIcon icon={AlertTriangle} className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <div className="space-y-3 text-center">
              <Label htmlFor="confirm_name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                Type <span className="text-foreground font-mono font-black px-1.5 py-0.5 bg-muted rounded">{confirmName}</span> to confirm
              </Label>
              <Input
                id="confirm_name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={confirmName}
                className="h-14 bg-canvas-parchment border-none rounded-2xl font-mono font-bold text-lg text-center"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t">
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={inputValue !== confirmName || loading}
            className="w-full rounded-pill h-14 font-bold text-lg"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
