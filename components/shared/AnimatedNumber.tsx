'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, animate, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  compact?: boolean
}

export function AnimatedNumber({
  value, duration = 0.9, decimals = 0, prefix = '', suffix = '', className, compact = false,
}: AnimatedNumberProps) {
  const shouldReduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)

  useEffect(() => {
    if (shouldReduce) {
      if (ref.current) ref.current.textContent = formatVal(value)
      return
    }
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.0, 0, 0.2, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = formatVal(v)
      },
    })
    return controls.stop
  }, [value, duration, shouldReduce])

  function formatVal(v: number): string {
    const rounded = parseFloat(v.toFixed(decimals))
    let str: string
    if (compact) {
      if (rounded >= 1_000_000) str = `${(rounded / 1_000_000).toFixed(1)}M`
      else if (rounded >= 1_000) str = `${(rounded / 1_000).toFixed(0)}K`
      else str = rounded.toLocaleString('en-US', { maximumFractionDigits: decimals })
    } else {
      str = rounded.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    }
    return `${prefix}${str}${suffix}`
  }

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {formatVal(value)}
    </span>
  )
}
