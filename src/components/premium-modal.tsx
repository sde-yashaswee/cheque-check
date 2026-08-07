import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  description?: string;
  onCloseRedirect?: string; // Where to go if they close without buying (e.g. back to home)
}

export function PremiumModal({ open, onOpenChange, featureName = "This feature", description = "You need to purchase the lifetime premium plan to access this feature.", onCloseRedirect }: PremiumModalProps) {
  const router = useRouter()

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen && onCloseRedirect) {
      router.push(onCloseRedirect)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <HugeiconsIcon icon={StarIcon} className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Premium Feature</DialogTitle>
          <DialogDescription className="text-center text-base">
            <span className="font-semibold text-foreground block mb-2">{featureName} is locked.</span>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
          <Button 
            className="w-full h-12 text-base font-semibold"
            onClick={() => {
              onOpenChange(false)
              router.push('/features')
            }}
          >
            View Premium Plans
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-12 text-base"
            onClick={() => handleOpenChange(false)}
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
