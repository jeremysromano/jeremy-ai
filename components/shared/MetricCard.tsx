'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'
import { cardVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  compact?: boolean
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  sublabel?: string
  className?: string
  valueClassName?: string
  advisor?: boolean
  animate?: boolean
}

export function MetricCard({
  label, value, prefix, suffix, decimals = 0, compact = false,
  trend, trendLabel, sublabel, className, valueClassName, advisor = false, animate: doAnimate = true,
}: MetricCardProps) {
  const Card = doAnimate ? motion.div : 'div'
  const cardProps = doAnimate ? { variants: cardVariants, initial: 'initial', animate: 'animate' } : {}

  return (
    <Card
      {...(cardProps as any)}
      className={cn(
        'rounded-card p-6 flex flex-col gap-1',
        advisor ? 'bg-[#FAF8F5] shadow-a-card border border-[#D6CFC7]' : 'bg-white shadow-card border border-[#E2E8F0]',
        className
      )}
    >
      <p className={cn('text-l-sm uppercase tracking-widest', advisor ? 'text-[#78716C]' : 'text-[#64748B]')}>
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span className={cn('text-d-lg tabular-nums font-bold', advisor ? 'text-[#1C1917]' : 'text-[#0D1B2A]', valueClassName)}>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} compact={compact} />
        </span>
        {trend && (
          <span className={cn(
            'flex items-center gap-0.5 text-l-lg mb-1',
            trend === 'up' ? 'text-positive-600' : trend === 'down' ? 'text-risk-600' : 'text-[#94A3B8]'
          )}>
            {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
            {trendLabel && <span>{trendLabel}</span>}
          </span>
        )}
      </div>
      {sublabel && (
        <p className={cn('text-b-sm', advisor ? 'text-[#78716C]' : 'text-[#64748B]')}>{sublabel}</p>
      )}
    </Card>
  )
}
