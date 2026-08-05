'use client'

import { useBusiness } from "@/hooks/use-business"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronRight, LogOut, User, Bell, Globe, CreditCard, Download, FileSpreadsheet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ReportService } from "@/services/report.service"
import { useQuery } from "@tanstack/react-query"
import { ChequeService } from "@/services/cheque.service"

export default function SettingsPage() {
  const { activeBusiness } = useBusiness()
  const supabase = createClient()
  const router = useRouter()

  const { data: cheques } = useQuery({
    queryKey: ['cheques', activeBusiness?.id],
    queryFn: () => ChequeService.getAll(activeBusiness!.id),
    enabled: !!activeBusiness?.id,
  })

  const handleExport = () => {
    if (!cheques) return
    ReportService.exportToCSV(cheques, `${activeBusiness?.name || 'Business'}_Cheques.csv`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sections = [
    {
      title: 'General',
      items: [
        { name: 'Currency', value: '₹ (INR)', icon: CreditCard },
        { name: 'Date Format', value: 'DD/MM/YYYY', icon: Globe },
      ]
    },
    {
      title: 'Reminders',
      items: [
        { name: 'Voice Calls', toggle: true, icon: Bell },
        { name: 'Reminder Frequency', value: '1 time/day', icon: Bell },
      ]
    },
    {
      title: 'Data & Reports',
      items: [
        { name: 'Export Cheques (CSV)', icon: FileSpreadsheet, action: handleExport },
      ]
    }
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <h1 className="text-display-lg">Settings</h1>

      {/* Profile Section */}
      <div className="flex items-center gap-4 rounded-lg bg-canvas-parchment p-4 dark:bg-surface-tile-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold">John Doe</p>
          <p className="text-xs text-muted-foreground">john@example.com</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
            <div className="divide-y rounded-lg border bg-card">
              {section.items.map((item: any) => (
                <div key={item.name} className={cn("flex items-center justify-between p-4", item.action && "cursor-pointer active:bg-muted")} onClick={item.action}>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-body">{item.name}</span>
                  </div>
                  {item.toggle ? (
                    <Switch defaultChecked />
                  ) : (
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-sm text-muted-foreground">{item.value}</span>}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="destructive" 
        className="w-full rounded-pill h-12" 
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">Cheque Reminder v1.0.0</p>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
