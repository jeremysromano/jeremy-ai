import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightChipProps {
  text: string
  className?: string
  advisor?: boolean
}

export function InsightChip({ text, className, advisor = false }: InsightChipProps) {
  return (
    <div className={cn(
      'inline-flex items-start gap-2 rounded-card-sm px-3 py-2 text-b-sm',
      advisor
        ? 'bg-[#FEF3C7] text-[#44403C] border border-[#D6CFC7]'
        : 'bg-brand-50 text-brand-700 border border-brand-100',
      className
    )}>
      <Sparkles size={14} className={cn('shrink-0 mt-0.5', advisor ? 'text-[#92700A]' : 'text-brand-500')} />
      <span>{text}</span>
    </div>
  )
}
