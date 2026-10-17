'use client'

import {
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
  type InputHTMLAttributes,
} from 'react'
import { Button } from '@/components/ui/button'

export const controlClass =
  'w-full min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

export function Field({
  label,
  children,
}: {
  label: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children(id)}
    </div>
  )
}
export function TextField({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <Field label={label}>
      {(id) => <input {...props} id={id} className={controlClass} />}
    </Field>
  )
}
export function SelectField({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <Field label={label}>
      {(id) => (
        <select {...props} id={id} className={controlClass}>
          {children}
        </select>
      )}
    </Field>
  )
}
export function Confirmation({
  message,
  confirm,
  cancel,
  onConfirm,
  onCancel,
  busy,
}: {
  message: string
  confirm: string
  cancel: string
  onConfirm: () => void
  onCancel: () => void
  busy: boolean
}) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-md border border-border bg-muted p-4"
    >
      <p>{message}</p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={onConfirm}>
          {confirm}
        </Button>
        <Button variant="outline" disabled={busy} onClick={onCancel}>
          {cancel}
        </Button>
      </div>
    </div>
  )
}
