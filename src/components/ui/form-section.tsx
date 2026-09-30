import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

interface FormSectionProps {
  title: string
  icon: IconSvgElement
  children: React.ReactNode
}

export function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 border-b border-primary/5 pb-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon icon={icon} className="size-3.5" />
        </div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}
