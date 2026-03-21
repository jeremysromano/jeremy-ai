'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Zone {
  max: number    // upper bound of this zone (0–100 scale)
  color: string  // bg color class or hex
  label: string
}

interface GaugeBarProps {
  value: number        // current value
  max?: number
  zones?: Zone[]
  label?: string
  sublabel?: string
  showValue?: boolean
  formatValue?: (v: number) => string
  className?: string
  height?: number
}

export function GaugeBar({
  value, max = 100, zones, label, sublabel,
  showValue = true, formatValue, className, height = 10,
}: GaugeBarProps) {
  const shouldReduce = useReducedMotion()
  const pct = Math.min((value / max) * 100, 100)
  const displayVal = formatValue ? formatValue(value) : `${Math.round(pct)}%`

  // Determine fill color from zones
  let fillColor = '#4F46E5'
  if (zones) {
    for (const zone of zones) {
      if (pct <= zone.max) { fillColor = zone.color; break }
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-l-md text-[#64748B] uppercase tracking-wider">{label}</span>}
          {showValue && <span className="text-d-xs font-semibold text-[#0D1B2A] tabular-nums">{displayVal}</span>}
        </div>
      )}
      <div className="relative w-full rounded-pill overflow-hidden" style={{ height, background: '#E2E8F0' }}>
        {/* Zone backgrounds */}
        {zones?.map((zone, i) => {
          const prevMax = i === 0 ? 0 : zones[i - 1].max
          return (
            <div
              key={zone.label}
              className="absolute top-0 bottom-0"
              style={{
                left: `${prevMax}%`,
                width: `${zone.max - prevMax}%`,
                backgroundColor: zone.color,
                opacity: 0.15,
              }}
            />
          )
        })}
        {/* Fill */}
        {shouldReduce ? (
          <div
            className="absolute top-0 left-0 bottom-0 rounded-pill"
            style={{ width: `${pct}%`, backgroundColor: fillColor, transition: 'width 0.3s' }}
          />
        ) : (
          <motion.div
            className="absolute top-0 left-0 bottom-0 rounded-pill"
            style={{ backgroundColor: fillColor }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.0, 0, 0.2, 1], delay: 0.2 }}
          />
        )}
        {/* Marker */}
        {zones?.map((zone, i) => (
          i < zones.length - 1 && (
            <div
              key={`marker-${zone.label}`}
              className="absolute top-0 bottom-0 w-px bg-white/60"
              style={{ left: `${zone.max}%` }}
            />
          )
        ))}
      </div>
      {/* Zone labels */}
      {zones && (
        <div className="flex mt-1.5 text-[10px] text-[#94A3B8] font-medium">
          {zones.map((zone, i) => {
            const prevMax = i === 0 ? 0 : zones[i - 1].max
            return (
              <div key={zone.label} style={{ width: `${zone.max - prevMax}%` }} className="truncate px-0.5">
                {zone.label}
              </div>
            )
          })}
        </div>
      )}
      {sublabel && <p className="mt-1 text-b-sm text-[#64748B]">{sublabel}</p>}
    </div>
  )
}
