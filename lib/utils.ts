import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

export function creditBandLabel(band: string): string {
  const map: Record<string, string> = {
    exceptional: 'Exceptional',
    very_good: 'Very Good',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  }
  return map[band] ?? band
}

export function creditBandColor(score: number): string {
  if (score >= 800) return 'text-positive-600'
  if (score >= 740) return 'text-positive-600'
  if (score >= 670) return 'text-brand-600'
  if (score >= 580) return 'text-caution-600'
  return 'text-risk-600'
}
