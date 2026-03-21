import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
  advisor?: boolean
  action?: React.ReactNode
}

export function SectionHeader({ eyebrow, title, subtitle, className, advisor = false, action }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        {eyebrow && (
          <p className={cn('text-l-sm uppercase tracking-widest mb-1.5', advisor ? 'text-[#92700A]' : 'text-brand-600')}>
            {eyebrow}
          </p>
        )}
        <h2 className={cn('text-d-md font-bold', advisor ? 'text-[#1C1917]' : 'text-[#0D1B2A]')}>{title}</h2>
        {subtitle && (
          <p className={cn('mt-1.5 text-b-md max-w-2xl', advisor ? 'text-[#78716C]' : 'text-[#64748B]')}>{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
