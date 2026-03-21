'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle2, TrendingDown, Home, AlertCircle, ArrowRight,
  ChevronRight, Activity, MapPin, Sparkles, Shield, Zap,
} from 'lucide-react'
import { cardVariants, staggerVariants } from '@/lib/animations'
import { formatCurrency } from '@/lib/utils'
import { MOCK_PROPERTIES, MOCK_PROFILE } from '@/lib/mock-data'

// ── Types ──────────────────────────────────────────────────────────────────────

type MomentType = 'confirmation' | 'signal' | 'action'

interface FeedMoment {
  id: string
  type: MomentType
  Icon: React.FC<{ size?: number; className?: string }>
  headline: string
  detail: string
  time: string
  cta?: { label: string; href: string }
}

// ── Config ─────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<MomentType, {
  label: string
  iconColor: string
  badgeBg: string
  badgeText: string
  borderLeft: string
  cardBg: string
}> = {
  confirmation: {
    label: 'CONFIRMED',
    iconColor: '#059669',
    badgeBg: '#DCFCE7',
    badgeText: '#166534',
    borderLeft: '#059669',
    cardBg: '#FFFFFF',
  },
  signal: {
    label: 'SIGNAL',
    iconColor: '#4F46E5',
    badgeBg: '#EEF2FF',
    badgeText: '#3730A3',
    borderLeft: '#4F46E5',
    cardBg: '#FFFFFF',
  },
  action: {
    label: 'ACTION',
    iconColor: '#D97706',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    borderLeft: '#D97706',
    cardBg: '#FFFDF7',
  },
}

// ── Feed moments ────────────────────────────────────────────────────────────────

const FEED: FeedMoment[] = [
  {
    id: 'preapproval',
    type: 'signal',
    Icon: CheckCircle2,
    headline: "You're pre-approved up to $875,000",
    detail: 'Based on verified income at Palantir Technologies and your 762 credit score. Letter is ready to share with your agent.',
    time: 'Just now',
    cta: { label: 'View pre-approval letter', href: '/pre-approval' },
  },
  {
    id: 'rate-drop',
    type: 'signal',
    Icon: TrendingDown,
    headline: 'Rates dropped to 6.62% — saves you $142/mo on your target',
    detail: "30-yr fixed fell from 7.00% last week. On the $685k home you're watching with 10% down, your payment drops from $4,622 to $4,480.",
    time: '2 hours ago',
    cta: { label: 'Update scenarios', href: '/scenarios' },
  },
  {
    id: 'employment',
    type: 'confirmation',
    Icon: CheckCircle2,
    headline: 'Employment verified at Palantir Technologies',
    detail: '$295,000/yr income confirmed via payroll integration. No documents needed — pulled automatically from your employer.',
    time: 'Yesterday',
  },
  {
    id: 'homes-in-range',
    type: 'signal',
    Icon: Home,
    headline: '2 homes moved into your comfort zone this week',
    detail: 'New listings at $648k and $671k in South Austin match your criteria and fit comfortably within your $875,000 range.',
    time: 'Today',
    cta: { label: 'Browse them', href: '/search' },
  },
  {
    id: 'assets',
    type: 'confirmation',
    Icon: CheckCircle2,
    headline: 'Verified assets: $167,400 across 3 accounts',
    detail: 'Chase checking ($42,000), Chase savings ($53,400), and Fidelity brokerage ($72,000) — all confirmed via Plaid. No action needed.',
    time: '2 days ago',
  },
  {
    id: 'rental',
    type: 'action',
    Icon: AlertCircle,
    headline: 'One item could raise your ceiling by $87,000',
    detail: "Rental income of $42,000/yr from your Austin property hasn't been verified. Connecting it raises your ceiling from $1.05M to $1.14M.",
    time: 'Pending',
    cta: { label: 'Connect rental income', href: '/profile' },
  },
]

// ── Buying power tiers ──────────────────────────────────────────────────────────

const BUYING_POWER_TIERS = [
  { label: 'Comfortable', amount: 875_000,   pct: 60, color: '#059669', bg: '#DCFCE7', textColor: '#166534' },
  { label: 'Recommended', amount: 965_000,   pct: 76, color: '#4F46E5', bg: '#EEF2FF', textColor: '#3730A3' },
  { label: 'Ceiling',     amount: 1_050_000, pct: 89, color: '#D97706', bg: '#FEF3C7', textColor: '#92400E' },
]

// ── FeedCard ────────────────────────────────────────────────────────────────────

function FeedCard({ moment }: { moment: FeedMoment }) {
  const cfg = TYPE_CONFIG[moment.type]
  return (
    <motion.div variants={cardVariants}>
      <div
        className="rounded-card border border-[#E2E8F0] shadow-card overflow-hidden hover:shadow-card-md transition-shadow duration-200"
        style={{ background: cfg.cardBg, borderLeft: `3px solid ${cfg.borderLeft}` }}
      >
        <div className="p-5">
          {/* Badge + time */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-[10px] font-bold tracking-wider"
              style={{ background: cfg.badgeBg, color: cfg.badgeText }}
            >
              <moment.Icon size={9} />
              {cfg.label}
            </span>
            <span className="text-[11px] text-[#94A3B8]">{moment.time}</span>
          </div>

          {/* Headline */}
          <p className="text-[15px] font-semibold text-[#0D1B2A] leading-snug mb-1.5">
            {moment.headline}
          </p>

          {/* Detail */}
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            {moment.detail}
          </p>

          {/* CTA */}
          {moment.cta && (
            <div className="mt-3.5 pt-3.5 border-t border-[#F1F5F9]">
              <Link
                href={moment.cta.href}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors group/link"
              >
                {moment.cta.label}
                <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── BuyingPowerPanel ────────────────────────────────────────────────────────────

function BuyingPowerPanel() {
  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Buying Power</p>
        <Link href="/buying-power" className="text-[11px] text-[#4F46E5] font-semibold hover:text-[#4338CA] transition-colors">
          Full view →
        </Link>
      </div>
      <p className="text-[12px] text-[#94A3B8] mb-4">762 credit · $295k income · 24% DTI · verified</p>

      <div className="space-y-4">
        {BUYING_POWER_TIERS.map((tier, i) => (
          <div key={tier.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ background: tier.bg, color: tier.textColor }}
              >
                {tier.label}
              </span>
              <span className="text-[15px] font-bold tabular-nums text-[#0D1B2A]">
                {formatCurrency(tier.amount, true)}
              </span>
            </div>
            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: tier.color }}
                initial={{ width: 0 }}
                animate={{ width: `${tier.pct}%` }}
                transition={{ duration: 0.75, ease: [0.0, 0, 0.2, 1], delay: 0.25 + i * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── LiveSignalsPanel ────────────────────────────────────────────────────────────

function LiveSignalsPanel() {
  const signals = [
    { Icon: Activity, label: 'Rate watch', value: '6.62%',  sub: 'Down 0.38% this week', color: '#059669' },
    { Icon: Shield,   label: 'Assets',     value: '$167k',  sub: '3 accounts verified',  color: '#4F46E5' },
    { Icon: MapPin,   label: 'Austin, TX', value: '2 new',  sub: 'In your range today',  color: '#D97706' },
  ]

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5">
      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Live Signals</p>
      <div className="space-y-3.5">
        {signals.map(({ Icon, label, value, sub, color }) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}1A` }}
            >
              <Icon size={13} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#64748B]">{label}</span>
                <span className="text-[13px] font-bold tabular-nums text-[#0D1B2A]">{value}</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── WatchedPropertyPanel ────────────────────────────────────────────────────────

function WatchedPropertyPanel() {
  const property = MOCK_PROPERTIES[0]
  if (!property) return null
  const monthly = 4480

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Watching</p>
        <Link href="/search" className="text-[11px] text-[#4F46E5] font-semibold hover:text-[#4338CA] transition-colors">
          All homes →
        </Link>
      </div>

      <div className="rounded-card-sm border border-[#E2E8F0] overflow-hidden">
        {/* Property image area */}
        <div className={`h-[96px] ${property.gradient} relative`}>
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-white/90 text-[#166534]">
              Comfortable
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-pill bg-black/20 text-white">
              {property.daysOnMarket}d
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#0D1B2A]">
                {formatCurrency(property.price, true)}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{property.address}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[13px] font-bold text-[#4F46E5] tabular-nums">
                ${monthly.toLocaleString()}/mo
              </p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">at 6.62%</p>
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1.5">
            {property.beds}bd · {property.baths}ba · {property.sqft.toLocaleString()} sqft
          </p>
        </div>
      </div>

      <Link
        href="/search"
        className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-card-sm border border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-colors text-[12px] font-semibold text-[#4F46E5]"
      >
        Browse all homes <ChevronRight size={11} />
      </Link>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const firstName = MOCK_PROFILE.name.split(' ')[0]

  const counts = {
    signal:       FEED.filter(m => m.type === 'signal').length,
    confirmation: FEED.filter(m => m.type === 'confirmation').length,
    action:       FEED.filter(m => m.type === 'action').length,
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF] pt-14">
      <div className="max-w-screen-xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          className="mb-9"
        >
          {/* Active badge */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-white border border-[#E2E8F0] text-[11px] font-semibold text-[#4F46E5] shadow-sm">
              <Sparkles size={11} />
              JEREMY.AI · ACTIVE
            </span>
          </div>

          <h1 className="text-[30px] font-bold text-[#0D1B2A] leading-tight tracking-tight mb-1.5">
            Good morning, {firstName}.
          </h1>
          <p className="text-[15px] text-[#64748B]">
            Here&apos;s what&apos;s happening with your homeownership journey.
          </p>

          {/* Summary pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {counts.signal > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-[#EEF2FF] border border-[#C7D2FE] text-[12px] font-semibold text-[#3730A3]">
                <Zap size={11} />
                {counts.signal} signals
              </span>
            )}
            {counts.confirmation > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-[#DCFCE7] border border-[#BBF7D0] text-[12px] font-semibold text-[#166534]">
                <CheckCircle2 size={11} />
                {counts.confirmation} confirmed
              </span>
            )}
            {counts.action > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-[#FEF3C7] border border-[#FDE68A] text-[12px] font-semibold text-[#92400E]">
                <AlertCircle size={11} />
                {counts.action} action available
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* Left: Feed */}
          <motion.div
            variants={staggerVariants}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            <motion.p
              variants={cardVariants}
              className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest pb-1"
            >
              Right now
            </motion.p>

            {FEED.map(moment => (
              <FeedCard key={moment.id} moment={moment} />
            ))}
          </motion.div>

          {/* Right: Ambient panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
            className="space-y-4 lg:sticky lg:top-[72px]"
          >
            <BuyingPowerPanel />
            <LiveSignalsPanel />
            <WatchedPropertyPanel />
          </motion.div>

        </div>
      </div>
    </div>
  )
}
