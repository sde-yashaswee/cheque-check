import { ChequeWithRelations } from '@/types'
import { useMemo } from 'react'

export function useChequeStats(cheques: ChequeWithRelations[] | undefined) {
  return useMemo(() => {
    if (!cheques)
      return {
        todayCheques: [],
        outstanding: 0,
        issuedCount: 0,
        receivedCount: 0,
        clearedCount: 0,
        bouncedCount: 0,
        upcomingCount: 0,
        overdueCount: 0,
      }

    const todayDate = new Date().toISOString().split('T')[0]
    const todayCheques = cheques.filter((c) => c.cheque_date === todayDate)

    const outstanding = cheques.reduce((acc: number, curr) => {
      if (curr.status === 'Cleared') return acc
      return curr.type === 'Outward' ? acc + curr.amount : acc - curr.amount
    }, 0)

    const issuedCount = cheques.filter((c) => c.type === 'Outward').length
    const receivedCount = cheques.filter((c) => c.type === 'Inward').length
    const clearedCount = cheques.filter((c) => c.status === 'Cleared').length
    const bouncedCount = cheques.filter((c) => c.status === 'Bounced').length

    const upcomingCount = cheques.filter(
      (c) => c.cheque_date > todayDate && c.status !== 'Cleared',
    ).length
    const overdueCount = cheques.filter(
      (c) => c.cheque_date < todayDate && c.status !== 'Cleared',
    ).length

    return {
      todayCheques,
      outstanding,
      issuedCount,
      receivedCount,
      clearedCount,
      bouncedCount,
      upcomingCount,
      overdueCount,
    }
  }, [cheques])
}
