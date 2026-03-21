'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ringTrans } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number      // 0–max
  max?: number
  size?: number
  strokeWidth?: number
  color?: string     // stroke color
  trackColor?: string
  className?: string
  children?: React.ReactNode
  animate?: boolean
}

export function ProgressRing({
  value, max = 100, size = 120, strokeWidth = 10,
  color = '#4F46E5', trackColor = '#E2E8F0',
  className, children, animate: doAnimate = true,
}: ProgressRingProps) {
  const shouldReduce = useReducedMotion()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / max, 1)
  const offset = circumference * (1 - pct)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={trackColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill */}
        {doAnimate && !shouldReduce ? (
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={ringTrans}
          />
        ) : (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
