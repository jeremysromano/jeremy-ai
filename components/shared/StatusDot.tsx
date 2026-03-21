import { cn } from '@/lib/utils'

type Status = 'good' | 'warning' | 'alert' | 'neutral' | 'info'

const colors: Record<Status, string> = {
  good:    'bg-positive-500',
  warning: 'bg-caution-500',
  alert:   'bg-risk-500',
  neutral: 'bg-[#94A3B8]',
  info:    'bg-brand-500',
}

interface StatusDotProps {
  status: Status
  pulse?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function StatusDot({ status, pulse = false, size = 'sm', className }: StatusDotProps) {
  return (
    <span className={cn(
      'inline-block rounded-full shrink-0',
      size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
      colors[status],
      pulse && 'animate-pulse-slow',
      className
    )} />
  )
}
