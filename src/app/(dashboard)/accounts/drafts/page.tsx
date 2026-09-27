'use client'

import { DraftList } from '@/features/drafts'

export default function AccountDraftsPage() {
  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <DraftList entity="account" />
    </div>
  )
}
