'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/toast'
import { useBusiness } from '@/hooks/use-business'
import { useTags } from '@/features/tags/hooks/use-tags'
import { TagForm } from '@/features/tags/components/tag-form'
import { nextTagColor } from '@/features/tags/lib/tag-colors'
import { Skeleton } from '@/components/ui/skeleton'

export default function CreateTagPage() {
  const t = useTranslations('Tags')
  const router = useRouter()
  const { activeBusiness } = useBusiness()
  const { tags, isLoading, createTag, isCreating } = useTags(activeBusiness?.id)

  if (!activeBusiness || isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-14 w-full rounded-sm" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-sm" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl pb-20">
      <TagForm
        defaultValues={{ name: '', color: nextTagColor(tags) }}
        submitLabel={t('createTag')}
        isSaving={isCreating}
        onSubmit={async (values) => {
          try {
            const tag = await createTag({
              business_id: activeBusiness.id,
              ...values,
            })
            toast.add({ title: t('tagCreated'), type: 'success' })
            router.replace(`/tags/${tag.id}`)
          } catch {
            toast.add({ title: t('saveFailed'), type: 'error' })
          }
        }}
      />
    </div>
  )
}
