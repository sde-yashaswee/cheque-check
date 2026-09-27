import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DRAFT_CREATE_PATHS, type DraftEntity } from '../lib/draft-fields'

// Detail pages can't render incomplete rows, so drafts open in the create flow instead.
export function useRedirectIfDraft(
  entity: DraftEntity,
  record: { id: string; is_draft?: boolean } | null | undefined,
) {
  const router = useRouter()
  const isDraft = !!record?.is_draft

  useEffect(() => {
    if (isDraft && record) {
      router.replace(`${DRAFT_CREATE_PATHS[entity]}?draftId=${record.id}`)
    }
  }, [entity, isDraft, record, router])

  return isDraft
}
