'use client'

import { useState, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Camera01Icon as Camera, Delete02Icon as Trash } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { EntityAvatar } from './entity-avatar'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { StorageService } from '@/services/storage.service'
import { toast } from './toast'
import { logger } from '@/lib/logger'

interface EditableAvatarProps {
  name: string
  color?: string
  icon?: string
  imageUrl?: string | null
  onUpload: (url: string) => Promise<void>
  onDelete?: () => Promise<void>
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function EditableAvatar({
  name,
  color,
  icon,
  imageUrl,
  onUpload,
  onDelete,
  className,
  size = 'lg',
}: EditableAvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    xl: 'h-32 w-32',
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const publicUrl = await StorageService.uploadAvatar(file)
      await onUpload(publicUrl)
      toast.add({
        title: 'Success',
        description: 'Avatar updated successfully',
        type: 'success',
      })
      setIsOpen(false)
    } catch (error) {
      logger.error('Error uploading avatar', error)
      toast.add({
        title: 'Error',
        description: 'Failed to upload avatar',
        type: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsUploading(true)
    try {
      await onDelete()
      toast.add({
        title: 'Success',
        description: 'Avatar removed successfully',
        type: 'success',
      })
      setIsOpen(false)
    } catch (error) {
      logger.error('Error deleting avatar', error)
      toast.add({
        title: 'Error',
        description: 'Failed to remove avatar',
        type: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <button 
            className={cn(
              "relative group rounded-full overflow-hidden border-2 border-background transition-all active:scale-95",
              sizeClasses[size],
              className
            )}
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <EntityAvatar 
                name={name} 
                color={color} 
                icon={icon} 
                size={size === 'xl' ? 'lg' : size} 
                className="h-full w-full"
              />
            )}
            
            {/* Edit Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <HugeiconsIcon icon={Camera} className="text-white h-1/3 w-1/3"/>
            </div>
          </button>
        }
      />
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-8">
          <div className={cn("rounded-full overflow-hidden border-4 border-muted/20", sizeClasses.xl)}>
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-full w-full object-cover"/>
            ) : (
              <EntityAvatar name={name} color={color} icon={icon} size="lg"className="h-full w-full"/>
            )}
          </div>
          
          <div className="flex w-full gap-3">
            <Button 
              variant="outline"
              className="flex-1 rounded-full h-12"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload New'}
            </Button>
            {imageUrl && onDelete && (
              <Button 
                variant="ghost"
                className="rounded-full h-12 w-12 p-0 text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={isUploading}
              >
                <HugeiconsIcon icon={Trash} className="h-5 w-5"/>
              </Button>
            )}
          </div>
          <input 
            type="file"
            ref={fileInputRef} 
            className="hidden"
            accept="image/*"
            onChange={handleFileChange} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
