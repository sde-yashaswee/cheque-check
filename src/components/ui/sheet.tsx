'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel02Icon as XIcon } from '@hugeicons/core-free-icons'
import { useTranslations } from 'next-intl'

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  render,
  nativeButton,
  ...props
}: DialogPrimitive.Trigger.Props) {
  const isNativeButton =
    nativeButton ??
    (!render ||
      (React.isValidElement(render) &&
        (render.type === 'button' || render.type === Button)))
  return (
    <DialogPrimitive.Trigger
      data-slot="sheet-trigger"
      render={render}
      nativeButton={isNativeButton}
      {...props}
    />
  )
}

function SheetClose({
  render,
  nativeButton,
  ...props
}: DialogPrimitive.Close.Props) {
  const isNativeButton =
    nativeButton ??
    (!render ||
      (React.isValidElement(render) &&
        (render.type === 'button' || render.type === Button)))
  return (
    <DialogPrimitive.Close
      data-slot="sheet-close"
      render={render}
      nativeButton={isNativeButton}
      {...props}
    />
  )
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/40 duration-300 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  showCloseButton = false,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  const t = useTranslations('Common')

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex flex-col gap-4 rounded-t-3xl bg-popover p-6 text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/5 duration-300 outline-none data-open:animate-in data-open:slide-in-from-bottom-full data-closed:animate-out data-closed:slide-out-to-bottom-full',
          'sm:left-1/2 sm:right-auto sm:w-full sm:max-w-[430px] sm:-translate-x-1/2',
          className,
        )}
        {...props}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-muted/30 shrink-0" />
        {children}
        {showCloseButton && (
          <SheetClose
            data-slot="sheet-close"
            nativeButton
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4 h-8 w-8 rounded-full"
                size="icon"
              />
            }
          >
            <HugeiconsIcon icon={XIcon} className="h-4 w-4" />
            <span className="sr-only">{t('close')}</span>
          </SheetClose>
        )}
      </DialogPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function SheetFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 pt-4', className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <SheetClose
          nativeButton
          render={
            <Button variant="outline" className="w-full h-12 rounded-xl" />
          }
        >
          Close
        </SheetClose>
      )}
    </div>
  )
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        'font-heading text-xl leading-none font-bold tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
