import { useQuery } from '@tanstack/react-query'
import { chequeService } from '@/features/cheques/services/cheque.service'
import { ChequeStatus } from '@/types'
import { Cheque as ChequeEntity } from '@/domain/cheque.entity'
import { useOptimisticMutation } from './use-optimistic-mutation'
import { useProfile } from './use-profile'
import { buildNotifyPartyAction } from '@/features/cheques/lib/notify-party'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

export function useChequeDetail(id: string) {
  const { profile } = useProfile()
  const t = useTranslations('Cheques')
  const tc = useTranslations('Common')

  const {
    data: cheque,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['cheque', id],
    queryFn: () => chequeService.getById(id),
  })

  const mutation = useOptimisticMutation<
    ChequeEntity,
    ChequeStatus,
    ChequeEntity
  >({
    queryKey: ['cheque', id],
    additionalQueryKeys: cheque?.business_id
      ? [['cheques', cheque.business_id]]
      : [],
    mutationFn: (status: ChequeStatus) =>
      chequeService.updateStatus(id, status),
    update: (current, status) => {
      if (!current) return current
      return ChequeEntity.fromRow({ ...current.toJSON(), status })
    },
    onSuccess: async (updated) => {
      const actionProps = await buildNotifyPartyAction(
        updated,
        profile?.currency || '₹',
        t('notifyParty'),
      )
      toast.add({
        title: tc('success'),
        description: t('statusUpdated', { status: updated.status }),
        type: 'success',
        actionProps,
      })
    },
  })

  const updateStatus = (status: ChequeStatus) => {
    mutation.mutate(status)
  }

  return {
    cheque,
    isLoading,
    error,
    updateStatus,
    isUpdating: mutation.isPending,
  }
}
