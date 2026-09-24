import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { reportService } from '@/services/report.service'
import { profileService } from '@/services/profile.service'
import { ChequeWithRelations } from '@/types'

export function useSettings() {
  const router = useRouter()

  const handleExport = (
    cheques: ChequeWithRelations[] | undefined,
    businessName: string,
  ) => {
    if (!cheques || cheques.length === 0) {
      alert('No cheques found to export.')
      return
    }
    reportService.exportToCSV(
      cheques,
      `${businessName || 'Business'}_Cheques.csv`,
    )
  }

  const handleLogout = async () => {
    await authService.signOut()
    router.push('/login')
  }

  const handleDeleteProfile = async () => {
    await profileService.delete()
    router.push('/login')
  }

  return {
    handleExport,
    handleLogout,
    handleDeleteProfile,
  }
}
