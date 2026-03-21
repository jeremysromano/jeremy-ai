'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Bed, Bath, Square, ChevronRight,
  CheckCircle2, AlertCircle, Lock, FileCheck, Key, Home,
  Shield, TrendingUp, Building2,
} from 'lucide-react'
import { MOCK_PROPERTIES, calcMonthlyPayment, calcCashToClose, calcPMI } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import { cardVariants, staggerVariants } from '@/lib/animations'

// ── Helpers ───────────────────────────────────────────────────────────────────

function affordabilityLabel(price: number) {
  if (price <= 875_000) return { label: 'Comfortable', bg: '#DCFCE7', text: '#166534' }
  if (price <= 965_000) return { label: 'Stretch', bg: '#FEF3C7', text: '#92400E' }
  return { label: 'Above range', bg: '#FEE2E2', text: '#991B1B' }
}

function propertyTypeLabel(type: string) {
  const map: Record<string, string> = {
    single_family: 'Single Family',
    townhouse: 'Townhouse',
    condo: 'Condo',
  }
  return map[type] ?? type
}

// ── Verified profile items ─────────────────────────────────────────────────────

const VERIFIED_ITEMS = [
  {
    icon: TrendingUp,
    label: 'Income verified — $237,000/yr',
    detail: 'Stripe base salary + RSU vesting confirmed automatically',
  },
  {
    icon: Shield,
    label: 'Credit score: 748 · Very Good',
    detail: 'Qualifies for best conventional pricing. No derogatory marks.',
  },
  {
    icon: Building2,
    label: 'Liquid assets: $317,500',
    detail: 'Chase checking, Ally HYSA, Schwab brokerage — verified via Plaid',
  },
  {
    icon: Home,
    label: 'Employment — Stripe, Inc.',
    detail: 'Full-time salaried, 3+ years tenure. Verified via VOE.',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const property = MOCK_PROPERTIES.find(p => p.id === id)

  if (!property) {
    return (
      <div className="min-h-screen bg-[#EEF2FF] pt-14 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748B] mb-3">Property not found.</p>
          <Link href="/" className="text-[#4F46E5] text-[14px] font-semibold hover:underline">
            ← Back to homes
          </Link>
        </div>
      </div>
    )
  }

  // ── Financials ──────────────────────────────────────────────────────────────
  const RATE = 6.625
  const DOWN_PCT = 10
  const loanAmount = property.price * (1 - DOWN_PCT / 100)
  const pi = calcMonthlyPayment(loanAmount, RATE, 30)
  const pmi = calcPMI(loanAmount, property.price)
  const taxes = property.estimatedTaxes
  const insurance = property.estimatedInsurance
  const hoa = property.hoa ?? 0
  const totalMonthly = Math.round(pi + pmi + taxes + insurance + hoa)
  const downPayment = property.price * (DOWN_PCT / 100)
  const cashToClose = calcCashToClose(property.price, DOWN_PCT)

  // Estimate equity at year 5 (4% annual appreciation, actual amortization)
  const r = RATE / 100 / 12
  let balance = loanAmount
  for (let m = 0; m < 60; m++) {
    const interest = balance * r
    balance -= pi - interest
  }
  const homeValue5 = Math.round(property.price * Math.pow(1.04, 5))
  const equity5 = homeValue5 - Math.round(balance)

  const affordability = affordabilityLabel(property.price)

  // Monthly breakdown rows
  const breakdown = [
    { label: 'Principal & Interest', value: Math.round(pi) },
    { label: 'Property Taxes', value: taxes },
    { label: 'Homeowners Insurance', value: insurance },
    ...(pmi > 0 ? [{ label: 'PMI (until 20% equity)', value: Math.round(pmi), warn: true }] : []),
    ...(hoa > 0 ? [{ label: 'HOA', value: hoa }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#EEF2FF] pt-14">

      {/* ── Hero ── */}
      <div className="relative w-full h-[280px] overflow-hidden">
        {property.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.photo}
            alt={property.address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${property.gradient}`} />
        )}
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        {/* Back */}
        <Link
          href="/"
          className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-[13px] font-medium hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={14} />
          Homes
        </Link>

        {/* Affordability badge */}
        <span
          className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-[12px] font-bold backdrop-blur-sm"
          style={{ background: `${affordability.bg}E6`, color: affordability.text }}
        >
          {affordability.label}
        </span>

        {/* Price + address */}
        <div className="absolute bottom-5 left-6 right-6">
          <p className="text-[30px] font-bold text-white leading-none tabular-nums">
            {formatCurrency(property.price)}
          </p>
          <p className="text-[14px] text-white/75 mt-1">
            {property.address} · {property.city}, {property.state} {property.zip}
          </p>
          <div className="flex items-center gap-4 mt-2.5">
            {[
              { Icon: Bed, value: `${property.beds} bed` },
              { Icon: Bath, value: `${property.baths} bath` },
              { Icon: Square, value: `${property.sqft.toLocaleString()} sqft` },
            ].map(({ Icon, value }) => (
              <span key={value} className="flex items-center gap-1.5 text-[13px] text-white/70">
                <Icon size={12} className="text-white/50" />
                {value}
              </span>
            ))}
            <span className="text-[13px] text-white/60">{property.daysOnMarket}d on market</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── Left column ── */}
          <motion.div
            variants={staggerVariants}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >

            {/* Property details */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[var(--shadow-card)] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">
                  {propertyTypeLabel(property.type)} · {property.city}, TX
                </span>
                <span className="text-[12px] text-[#94A3B8]">
                  Built {property.yearBuilt} · ${property.pricePerSqft}/sqft
                </span>
              </div>

              {/* Stat boxes */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { Icon: Bed, label: 'Bedrooms', value: String(property.beds) },
                  { Icon: Bath, label: 'Bathrooms', value: String(property.baths) },
                  { Icon: Square, label: 'Square Feet', value: property.sqft.toLocaleString() },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="text-center py-4 bg-[#F8FAFC] rounded-xl">
                    <Icon size={16} className="mx-auto mb-1.5 text-[#94A3B8]" />
                    <p className="text-[18px] font-bold text-[#0D1B2A]">{value}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {property.tags && property.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {property.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#EEF2FF] text-[#4F46E5] text-[12px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {property.hoa && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[12px] font-medium">
                      HOA ${property.hoa}/mo
                    </span>
                  )}
                </div>
              )}

              {/* Goal insight */}
              {property.goalInsight && (
                <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
                  <p className="text-[13px] text-[#4F46E5] font-medium">
                    ✦ {property.goalInsight}
                  </p>
                </div>
              )}
            </motion.div>

            {/* What Jeremy already knows */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[var(--shadow-card)] p-6"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-[#059669]" />
                </div>
                <p className="text-[15px] font-bold text-[#0D1B2A]">Your profile is ready for this home.</p>
              </div>
              <p className="text-[13px] text-[#64748B] mb-5 pl-9">
                No new documents needed for these items.
              </p>

              <div className="space-y-4">
                {VERIFIED_ITEMS.map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={12} className="text-[#059669]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0D1B2A]">{label}</p>
                      <p className="text-[12px] text-[#64748B] mt-0.5 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* One optional item */}
            <motion.div
              variants={cardVariants}
              className="rounded-[16px] border border-[#FDE68A] p-5"
              style={{ background: '#FFFDF5' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle size={14} className="text-[#D97706]" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[#92400E] uppercase tracking-wider mb-1">One optional item</p>
                  <p className="text-[14px] font-semibold text-[#0D1B2A] mb-1.5">
                    Rental income verification — $18,000/yr
                  </p>
                  <p className="text-[13px] text-[#78716C] leading-relaxed">
                    Uploading your lease agreement + bank deposit history confirms this income and raises your ceiling by $87K. Not required to make an offer.
                  </p>
                  <Link
                    href="/readiness"
                    className="inline-flex items-center gap-1 mt-2.5 text-[12px] font-semibold text-[#D97706] hover:text-[#B45309] transition-colors"
                  >
                    Upload docs <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>

          </motion.div>

          {/* ── Right column ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
            className="space-y-4 lg:sticky lg:top-[80px]"
          >

            {/* Your numbers */}
            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[var(--shadow-card)] p-6">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Your Numbers</p>

              {/* Total monthly */}
              <div className="text-center pb-5 border-b border-[#F1F5F9] mb-4">
                <p className="text-[44px] font-bold text-[#0D1B2A] tabular-nums leading-none">
                  ${totalMonthly.toLocaleString()}
                </p>
                <p className="text-[12px] text-[#94A3B8] mt-1.5">estimated monthly · 10% down</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 mb-5">
                {breakdown.map(({ label, value, warn }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className={`text-[13px] ${warn ? 'text-[#D97706]' : 'text-[#64748B]'}`}>
                      {label}
                    </span>
                    <span className="text-[13px] font-semibold text-[#334155] tabular-nums">
                      ${value.toLocaleString()}/mo
                    </span>
                  </div>
                ))}
              </div>

              {/* Cash + equity */}
              <div className="space-y-3 pt-4 border-t border-[#F1F5F9]">
                {[
                  { label: 'Down payment (10%)', value: formatCurrency(downPayment), accent: false },
                  { label: 'Cash to close (est.)', value: formatCurrency(cashToClose), accent: false },
                  { label: 'Est. equity — Year 5', value: formatCurrency(equity5), accent: true },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#64748B]">{label}</span>
                    <span className={`text-[14px] font-bold tabular-nums ${accent ? 'text-[#059669]' : 'text-[#0D1B2A]'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rate + pre-approval */}
              <div className="mt-5 pt-5 border-t border-[#F1F5F9] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} className="text-[#4F46E5]" />
                    <span className="text-[12px] text-[#64748B]">Rate quote</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#4F46E5]">6.625% · 30-yr fixed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#64748B]">Pre-approval</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-bold">
                    <CheckCircle2 size={10} />
                    Active · $875K
                  </span>
                </div>
              </div>
            </div>

            {/* Path to keys */}
            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[var(--shadow-card)] p-5">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Path to Keys</p>
              <div>
                {[
                  { Icon: FileCheck, label: 'Move forward', sub: 'Authorize & submit application', active: true },
                  { Icon: Home, label: 'Underwriting', sub: '1–2 business days', active: false },
                  { Icon: Key, label: 'Keys in hand', sub: 'Est. Apr 30, 2026', active: false },
                ].map(({ Icon, label, sub, active }, idx, arr) => (
                  <div key={label}>
                    <div className="flex items-center gap-3 py-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          active ? 'bg-[#4F46E5] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
                        }`}
                      >
                        <Icon size={13} />
                      </div>
                      <div>
                        <p className={`text-[13px] font-semibold ${active ? 'text-[#4F46E5]' : 'text-[#334155]'}`}>
                          {label}
                        </p>
                        <p className="text-[11px] text-[#94A3B8]">{sub}</p>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="ml-3.5 h-3.5 w-px bg-[#E2E8F0]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/search/${property.id}/apply`}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-[16px] bg-[#4F46E5] text-white text-[15px] font-bold hover:bg-[#4338CA] active:bg-[#3730A3] transition-colors"
              style={{ boxShadow: '0 4px 12px rgba(79,70,229,0.30)' }}
            >
              Move forward on this home
              <ChevronRight size={16} />
            </Link>

            <p className="text-[11px] text-[#94A3B8] text-center leading-relaxed">
              No commitment required · pre-approval already active
            </p>

          </motion.div>

        </div>
      </div>
    </div>
  )
}
