'use client'

import { useBusiness } from "@/hooks/use-business"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  ChevronRight, 
  LogOut, 
  User, 
  Bell, 
  Globe, 
  CreditCard, 
  Download, 
  FileSpreadsheet, 
  Building2, 
  Landmark, 
  LayoutGrid, 
  Zap,
  Languages
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ReportService } from "@/services/report.service"
import { useQuery } from "@tanstack/react-query"
import { ChequeService } from "@/services/cheque.service"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Combobox } from "@/components/ui/combobox"
import { format, differenceInDays } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const { activeBusiness, businesses } = useBusiness()
  const { profile, updateProfile, isLoading: profileLoading } = useProfile()
  const supabase = createClient()
  const router = useRouter()

  const { data: cheques } = useQuery({
    queryKey: ['cheques', activeBusiness?.id],
    queryFn: () => ChequeService.getAll(activeBusiness!.id),
    enabled: !!activeBusiness?.id,
  })

  if (profileLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleExport = () => {
    if (!cheques || cheques.length === 0) {
      alert("No cheques found to export.")
      return
    }
    ReportService.exportToCSV(cheques, `${activeBusiness?.name || 'Business'}_Cheques.csv`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currencyOptions = [
    { label: '₹ (INR)', value: '₹' },
    { label: '$ (USD)', value: '$' },
    { label: '€ (EUR)', value: '€' },
    { label: '£ (GBP)', value: '£' },
  ]

  const dateFormatOptions = [
    { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
    { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
    { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
  ]

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Hinglish', value: 'hinglish' },
  ]

  const remindersPerDayOptions = [
    { label: '1 time/day', value: '1' },
    { label: '2 times/day', value: '2' },
    { label: '3 times/day', value: '3' },
  ]

  const reminderFrequencyOptions = [
    { label: '1 day before', value: '1' },
    { label: '3 days before', value: '3' },
    { label: '7 days before', value: '7' },
  ]

  const remainingDays = profile ? 30 - differenceInDays(new Date(), new Date(profile.created_at)) : 0

  const sections = [
    {
      title: 'General',
      items: [
        { 
          name: 'Currency', 
          icon: CreditCard,
          component: (
            <Combobox 
              options={currencyOptions} 
              value={profile?.currency} 
              onValueChange={(val) => updateProfile({ currency: val })}
              className="h-9 w-[120px]"
            />
          )
        },
        { 
          name: 'Date Format', 
          icon: Globe,
          component: (
            <Combobox 
              options={dateFormatOptions} 
              value={profile?.date_format} 
              onValueChange={(val) => updateProfile({ date_format: val })}
              className="h-9 w-[150px]"
            />
          )
        },
        { 
          name: 'Language', 
          icon: Languages,
          component: (
            <Combobox 
              options={languageOptions} 
              value="en" 
              onValueChange={() => {}}
              className="h-9 w-[120px]"
            />
          )
        },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'My Businesses', icon: Building2, href: '/businesses' },
        { name: 'Bank Accounts', icon: Landmark, href: '/banks' },
        { name: 'Features', icon: LayoutGrid, href: '/features' },
      ]
    },
    {
      title: 'Reminders',
      items: [
        { 
          name: 'Reminders Per Day', 
          icon: Bell,
          component: (
            <Combobox 
              options={remindersPerDayOptions} 
              value={profile?.reminders_per_day?.toString()} 
              onValueChange={(val) => updateProfile({ reminders_per_day: parseInt(val) })}
              className="h-9 w-[140px]"
            />
          )
        },
        { 
          name: 'Reminder Frequency', 
          icon: Zap,
          component: (
            <Combobox 
              options={reminderFrequencyOptions} 
              value={profile?.default_reminder_days?.toString()} 
              onValueChange={(val) => updateProfile({ default_reminder_days: parseInt(val) })}
              className="h-9 w-[150px]"
            />
          )
        },
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
    <div className="mx-auto max-w-2xl space-y-8 pb-20 pt-4">
      {/* Profile Section */}
      <div className="flex items-center gap-4 rounded-3xl bg-canvas-parchment p-5 dark:bg-surface-tile-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
          <User className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg leading-tight">{profile?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground font-medium">{profile?.email}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{remainingDays} days</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Trial</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">{section.title}</h3>
            <div className="divide-y rounded-3xl border bg-card overflow-hidden">
              {section.items.map((item: any) => {
                const content = (
                  <div key={item.name} className={cn("flex items-center justify-between p-4 transition-colors", (item.action || item.href) && "cursor-pointer active:bg-muted/50 hover:bg-muted/30")} onClick={item.action}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {item.component ? (
                      item.component
                    ) : item.toggle ? (
                      <Switch checked={item.checked} onCheckedChange={item.onChange} />
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.value && <span className="text-xs font-medium text-muted-foreground">{item.value}</span>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                      </div>
                    )}
                  </div>
                )

                if (item.href) {
                  return <Link href={item.href} key={item.name}>{content}</Link>
                }
                return content
              })}
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="destructive" 
        className="w-full rounded-pill h-14 text-lg font-medium" 
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" /> Sign Out
      </Button>

      <div className="text-center pb-8">
        <p className="text-xs text-muted-foreground font-medium opacity-50 uppercase tracking-widest">CheckCheck v1.0.0</p>
        <p className="text-[10px] text-muted-foreground mt-2 opacity-30">
          {format(new Date(), "PPpp")}
        </p>
      </div>
    </div>
  )
}
