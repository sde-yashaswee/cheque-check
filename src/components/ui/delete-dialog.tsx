'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteConfirmationDialogProps {
  title: string
  description: string
  confirmName: string
  onDelete: () => Promise<void>
  trigger?: React.ReactNode
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
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" className="rounded-2xl h-12">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm_name" className="text-xs font-bold uppercase tracking-wider">
              Type <span className="text-foreground font-black px-1.5 py-0.5 bg-muted rounded">{confirmName}</span> to confirm
            </Label>
            <Input
              id="confirm_name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmName}
              className="h-12 bg-canvas-parchment border-none rounded-xl font-bold"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-12 flex-1">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={inputValue !== confirmName || loading}
            className="rounded-xl h-12 flex-1 shadow-md shadow-destructive/20"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
