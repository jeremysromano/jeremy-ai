'use client'

import { motion } from 'framer-motion'
import { Search, MapPin, SlidersHorizontal, Bed, Bath, Square, Calendar, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { cardVariants, staggerVariants } from '@/lib/animations'
import { MOCK_PROPERTIES } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import type { PropertyData } from '@/lib/types'

function affordabilitySignal(price: number): { label: string; color: string; key: string; detail: string } {
  if (price <= 600000) return { label: 'Comfortable', color: '#059669', key: 'comfortable', detail: 'Payment stays under 22% of your gross income.' }
  if (price <= 720000) return { label: 'Stretch', color: '#D97706', key: 'stretch', detail: 'Approaches 28% housing expense ratio. Still achievable.' }
  return { label: 'At the limit', color: '#E11D48', key: 'risk', detail: 'Near your maximum qualifying threshold.' }
}

function estPayment(price: number): number {
  // Rough: 10% down, 6.625%, 30yr + taxes + insurance
  const loan = price * 0.9
  const r = 6.625 / 100 / 12
  const n = 360
  const pi = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  return Math.round(pi + price * 0.024 / 12)
}

// Equity at years 1, 2, 3, 5 (10% down, 6.625%, 4% appreciation)
function equitySparkData(price: number): number[] {
  const loan = price * 0.9
  const down = price * 0.1
  const r = 6.625 / 100 / 12
  const n = 360
  const pmt = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  return [1, 2, 3, 5].map(yr => {
    let bal = loan
    for (let m = 0; m < yr * 12; m++) bal = Math.max(0, bal - (pmt - bal * r))
    return Math.round(down + (loan - bal) + price * (Math.pow(1.04, yr) - 1))
  })
}

// Jeremy's max-budget monthly payment — savings baseline
const MAX_BUDGET_PMT = estPayment(780_000)

function ListingPhotoMock({ gradient, type }: { gradient: string; type: string }) {
  const icons: Record<string, string> = {
    single_family: '🏠', condo: '🏢', townhouse: '🏘️', multi_family: '🏗️',
  }
  return (
    <div className={`w-full h-44 bg-gradient-to-br ${gradient} flex items-end p-3`}>
      <span className="text-2xl">{icons[type] ?? '🏠'}</span>
    </div>
  )
}

function InsightStrip({ price, goalInsight }: { price: number; goalInsight: string }) {
  const spark = equitySparkData(price)
  const yr5K  = Math.round(spark[3] / 1000)
  const savings = MAX_BUDGET_PMT - estPayment(price)
  const savingsFmt = `$${Math.round(savings / 50) * 50}/mo`

  // Tiny 44×16 upward sparkline
  const W = 44, H = 16
  const minV = spark[0], maxV = spark[3], rng = maxV - minV || 1
  const pts = spark.map((v, i) => ({
    x: 2 + (i / 3) * (W - 4),
    y: H - 2 - ((v - minV) / rng) * (H - 6),
  }))
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <div className="mb-3 px-3 py-2.5 rounded-lg bg-[#F5F4FF] border border-[#E0DEFF]">
      {/* Goal alignment */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles size={11} className="text-brand-600 shrink-0" />
        <span className="text-[11px] font-semibold text-brand-700 leading-tight">{goalInsight}</span>
      </div>
      {/* Equity sparkline + numbers */}
      <div className="flex items-center gap-2">
        <svg width={W} height={H} style={{ display: 'block', flexShrink: 0 }}>
          <path d={pathD} stroke="#4F46E5" strokeWidth="1.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={pts[3].x} cy={pts[3].y} r="2.5" fill="#4F46E5" />
        </svg>
        <span className="text-[11px] text-[#64748B]">
          <span className="font-semibold text-[#0D1B2A]">${yr5K}K</span> equity yr 5
        </span>
        {savings > 200 && <>
          <span className="text-[#C7C4F0] text-[10px]">·</span>
          <span className="text-[11px] font-medium text-[#059669]">saves {savingsFmt}</span>
        </>}
      </div>
    </div>
  )
}

function ListingCard({ property }: { property: PropertyData }) {
  const signal = affordabilitySignal(property.price)
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(13,27,42,0.12)' }}
    >
      <Link
        href={`/search/${property.id}`}
        className="block bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden transition-shadow hover:shadow-card-md"
      >
        {/* ── Photo ── */}
        <div className="relative w-full h-48 overflow-hidden bg-[#EEF2F7]">
          {property.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.photo}
              alt={property.address}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <ListingPhotoMock gradient={property.gradient} type={property.type} />
          )}
          {/* Affordability badge */}
          <span
            className="absolute top-3 right-3 px-2.5 py-1 rounded-pill text-[11px] font-semibold border backdrop-blur-md"
            style={{
              color: signal.color,
              borderColor: signal.color + '60',
              background: 'rgba(255,255,255,0.88)',
            }}
          >
            {signal.label}
          </span>
          {/* Days on market */}
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-medium text-white backdrop-blur-md"
            style={{ background: 'rgba(13,27,42,0.52)' }}>
            <Calendar size={10} className="inline mr-1 -mt-0.5" />{property.daysOnMarket}d on market
          </span>
        </div>

        <div className="p-4">
          {/* Price + address */}
          <div className="mb-2.5">
            <p className="text-d-sm font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(property.price)}</p>
            <p className="text-b-sm text-[#64748B] mt-0.5 leading-tight">{property.address}</p>
            <p className="text-b-sm text-[#94A3B8]">{property.city}, {property.state}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-[#64748B] text-b-sm mb-3">
            <span className="flex items-center gap-1"><Bed size={13} />{property.beds}bd</span>
            <span className="flex items-center gap-1"><Bath size={13} />{property.baths}ba</span>
            <span className="flex items-center gap-1"><Square size={13} />{property.sqft.toLocaleString()}sf</span>
            <span className="flex items-center gap-1 ml-auto text-[11px]">
              ${property.pricePerSqft}/sf
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {property.tags.map(t => (
              <span key={t} className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[11px] text-[#64748B]">{t}</span>
            ))}
          </div>

          {/* Jeremy insight strip */}
          {property.goalInsight && (
            <InsightStrip price={property.price} goalInsight={property.goalInsight} />
          )}

          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-btn bg-brand-600 text-white text-b-sm font-semibold">
            <Sparkles size={14} />
            View with Jeremy
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function SearchPage() {
  return (
    <PageShell className="pb-20">
      {/* Header */}
      <div className="mb-8">
        <p className="text-l-sm uppercase tracking-widest text-brand-600 mb-2">Home Search</p>
        <h1 className="text-d-lg font-bold text-[#0D1B2A]">Find your home.</h1>
        <p className="text-b-lg text-[#64748B] mt-2">Jeremy.ai analyzes affordability, payment confidence, and mortgage fit instantly as you browse.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-card-sm px-4 py-3 shadow-card">
          <MapPin size={16} className="text-[#94A3B8] shrink-0" />
          <input
            defaultValue="Austin, TX"
            className="flex-1 text-b-md text-[#0D1B2A] bg-transparent outline-none placeholder:text-[#94A3B8]"
            placeholder="City, ZIP, or address"
          />
          <Search size={16} className="text-[#94A3B8] shrink-0" />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E2E8F0] rounded-card-sm text-b-sm font-medium text-[#334155] shadow-card hover:border-brand-300 transition-colors">
          <SlidersHorizontal size={16} />
          Filters
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-card-sm text-b-sm font-semibold hover:bg-brand-700 transition-colors">
          <Search size={16} />
          Search
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-b-md text-[#64748B]"><span className="font-semibold text-[#0D1B2A]">{MOCK_PROPERTIES.length}</span> homes in Austin, TX</p>
        <div className="flex items-center gap-2 text-b-sm text-[#64748B]">
          <TrendingUp size={14} className="text-brand-500" />
          <span>Jeremy.ai affordability overlay active</span>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={staggerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {MOCK_PROPERTIES.map(p => (
          <ListingCard key={p.id} property={p} />
        ))}
      </motion.div>
    </PageShell>
  )
}
