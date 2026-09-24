import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { reportService } from '@/services/report.service'
import { ProfileService } from '@/services/profile.service'
import { ChequeWithRelations } from '@/types'

export function useSettings() {
  const supabase = createClient()
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
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteProfile = async () => {
    await ProfileService.delete()
    router.push('/login')
  }

  return {
    handleExport,
    handleLogout,
    handleDeleteProfile,
  }
}
