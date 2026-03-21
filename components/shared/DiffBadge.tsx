import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface DiffBadgeProps {
  base: number
  compare: number
  format?: 'currency' | 'percent' | 'number'
  invert?: boolean  // invert means higher is worse (e.g., total interest)
  className?: string
}

export function DiffBadge({ base, compare, format = 'currency', invert = false, className }: DiffBadgeProps) {
  const delta = compare - base
  if (delta === 0) return null

  const positive = invert ? delta < 0 : delta > 0
  const sign = delta > 0 ? '+' : ''

  let label: string
  if (format === 'currency') label = `${sign}${formatCurrency(delta)}`
  else if (format === 'percent') label = `${sign}${delta.toFixed(2)}%`
  else label = `${sign}${Math.round(delta).toLocaleString()}`

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] font-semibold tabular-nums',
      positive ? 'bg-positive-50 text-positive-700' : 'bg-risk-50 text-risk-700',
      className
    )}>
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {label}
    </span>
  )
}
