'use client'

interface JeremyLogoProps {
  size?: 'sm' | 'md' | 'lg'
  advisor?: boolean
}

/**
 * Calligraphic signature logo for jeremy.ai.
 *
 * Rendered as a fixed viewBox SVG so the swash underline always aligns
 * correctly with the script text regardless of rendered size.
 *
 * ViewBox: 300 × 120
 *   – Text baseline at y=70, Great Vibes 62px
 *   – Descenders reach ~y=92
 *   – Swash flourish at y=98–110
 */
const VB_W = 320   // wider viewBox gives the script more room on the right
const VB_H = 120

const SIZES = {
  sm: { w: 144, h: 54 },   // fits cleanly inside h-14 nav
  md: { w: 214, h: 80 },
  lg: { w: 343, h: 129 },
}

export function JeremyLogo({ size = 'sm', advisor = false }: JeremyLogoProps) {
  const { w, h } = SIZES[size]
  const color = advisor ? '#1C1917' : '#0D1B2A'

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      aria-label="jeremy.ai"
      role="img"
      style={{ overflow: 'visible' }}
    >
      {/* Script wordmark — Great Vibes matches the fluid connected cursive */}
      <text
        x="8"
        y="70"
        fontFamily="'Great Vibes', cursive"
        fontSize="62"
        fill={color}
      >
        jeremy.ai
      </text>

      {/*
        Signature underline swash:
        Starts under the j (lower-left), dips slightly, then sweeps right
        in a long gentle arc — mirroring the flourish in the reference logo.
      */}
      <path
        d="M 2,96 C 48,110 155,100 294,92"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
