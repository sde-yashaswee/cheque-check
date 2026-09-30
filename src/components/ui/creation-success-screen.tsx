'use client'

import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle01Icon as CheckCircle,
  ArrowRight01Icon as ArrowRight,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'

interface CreationSuccessScreenProps {
  title: string
  description: string
  ctaLabel: string
  onContinue: () => void
}

// Shared "entity created" screen used by cheque/party/account/business creation
// flows, mirroring the onboarding completion step's icon/motion treatment.
export function CreationSuccessScreen({
  title,
  description,
  ctaLabel,
  onContinue,
}: CreationSuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-10 py-12 text-center"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            damping: 12,
            stiffness: 200,
            delay: 0.15,
          }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-success text-success-foreground"
        >
          <HugeiconsIcon icon={CheckCircle} className="h-14 w-14" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 -z-10 rounded-full bg-success"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <Button
        onClick={onContinue}
        className="h-14 w-full max-w-sm rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95"
      >
        {ctaLabel}
        <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  )
}
