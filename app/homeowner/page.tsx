'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, TrendingUp, Wrench, Home, RefreshCw, DollarSign,
  Zap, ArrowUpRight, CreditCard, CheckCircle2, ChevronRight,
  ChevronDown, TrendingDown, BarChart3, Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { PageShell } from '@/components/layout/PageShell'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { InsightChip } from '@/components/shared/InsightChip'
import { cardVariants, staggerVariants, chartVariants } from '@/lib/animations'
import { MOCK_HOMEOWNER, MOCK_PROPERTIES } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

const MAINTENANCE_ICONS: Record<string, React.FC<any>> = {
  hvac: Wrench, plumbing: Wrench, roof: Home,
  landscaping: Wrench, electrical: Zap, general: Home,
}
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-lg p-3 text-[12px]">
      <p className="font-semibold text-[#0D1B2A] mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold tabular-nums">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

// ── Sub-section label ─────────────────────────────────────────────────────────

function GroupLabel({ children, signal }: { children: React.ReactNode; signal?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{children}</p>
      {signal && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-bold border border-[#BBF7D0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
          {signal}
        </span>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomeownerPage() {
  const h = MOCK_HOMEOWNER
  const [extraPayment, setExtraPayment] = useState(200)
  const [equityExpanded, setEquityExpanded] = useState(false)
  const currentMonth = 4

  const upcomingMaintenance = h.maintenanceEvents
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => a.month - b.month)
    .slice(0, 4)

  const totalMaintenanceCost = h.maintenanceEvents
    .filter(e => e.status === 'upcoming')
    .reduce((s, e) => s + e.estimatedCost, 0)

  const yearsSaved = ((extraPayment / 100) * 0.65).toFixed(1)
  const interestSaved = extraPayment * 0.65 * 12 * 10

  // Sell path calculations
  const sellingCosts = Math.round(h.currentValue * 0.06)        // agent + closing ~6%
  const netFromSale  = h.currentValue - h.loanBalance - sellingCosts  // ~$84K
  const rentEstimate = 3_200
  const monthlyShortfall   = rentEstimate - h.monthlyPayment    // negative (-$1,218)
  const monthlyAppreciation = Math.round(h.currentValue * 0.04 / 12)  // ~$2,420
  const netWealthPerMonth  = monthlyAppreciation + monthlyShortfall    // ~$1,202

  const equityChartData = h.equityHistory.map(p => ({
    label: p.label,
    'Home Value': p.homeValue,
    'Loan Balance': p.loanBalance,
    'Your Equity': p.equity,
  }))

  // Pay-off-by-60 math (rough)
  const extraFor60 = 141
  const interestSaved60 = 38000
  const payoffDate60 = 'Mar 2051'

  // HELOC numbers
  const helocAvailable = 86000
  const helocRate = 8.25
  const helocMonthly = Math.round((helocAvailable * (helocRate / 100 / 12) * Math.pow(1 + helocRate / 100 / 12, 120)) / (Math.pow(1 + helocRate / 100 / 12, 120) - 1))

  return (
    <PageShell>

      {/* ── 1. Payment Banner ── */}
      <motion.div
        variants={cardVariants} initial="initial" animate="animate"
        className="bg-white rounded-card border border-[#E2E8F0] shadow-card mb-6 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <CreditCard size={14} className="text-[#4F46E5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#0D1B2A]">Mortgage Payment</p>
            <p className="text-[11px] text-[#94A3B8]">Loan #JR-987-654-3210 · 2847 Waverly Hills Drive, Austin TX</p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-bold border border-[#BBF7D0]">
            <CheckCircle2 size={10} />
            CURRENT
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-[#F1F5F9]">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Last Payment</p>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-[28px] font-bold text-[#0D1B2A] tabular-nums leading-none">$4,418</p>
              <span className="mb-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-bold">
                <CheckCircle2 size={9} />PAID
              </span>
            </div>
            <p className="text-[13px] text-[#64748B]">Received March 1, 2026</p>
            <button className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors">
              View payment history <ChevronRight size={12} />
            </button>
          </div>
          <div className="px-6 py-5 bg-[#4F46E5]">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Next Payment Due</p>
            <p className="text-[13px] text-white/70 mb-1">April 1, 2026</p>
            <p className="text-[28px] font-bold text-white tabular-nums leading-none mb-5">$4,418</p>
            <button className="w-full py-2.5 rounded-xl bg-white text-[#4F46E5] text-[13px] font-bold hover:bg-[#EEF2FF] transition-colors">
              Make a Payment
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Equity Summary — collapsible ── */}
      <motion.div variants={cardVariants} initial="initial" animate="animate" className="mb-8">
        {/* Summary strip — always visible */}
        <button
          onClick={() => setEquityExpanded(v => !v)}
          className={`w-full flex items-center justify-between px-5 py-4 bg-white border border-[#E2E8F0] shadow-card hover:border-[#C7D2FE] transition-all ${equityExpanded ? 'rounded-t-card border-b-0' : 'rounded-card'}`}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            {[
              { label: 'Home Value', value: '$726K', accent: '#4F46E5', tag: '+6%' },
              { label: 'Equity',     value: '$128K', accent: '#059669', tag: 'Growing ↑' },
              { label: 'LTV',        value: '82%',   accent: '#0D1B2A', sub: 'PMI drops at 80%' },
              { label: 'Remaining',  value: '29.1 yrs', accent: '#0D1B2A' },
            ].map(({ label, value, accent, tag, sub }) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-[#94A3B8]">{label}</span>
                <span className="text-[15px] font-bold tabular-nums" style={{ color: accent }}>{value}</span>
                {tag && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: accent === '#059669' ? '#DCFCE7' : '#EEF2FF', color: accent }}>{tag}</span>}
                {sub && <span className="text-[10px] text-[#94A3B8] hidden sm:inline">· {sub}</span>}
              </div>
            ))}
          </div>
          <div className="shrink-0 ml-4 flex items-center gap-1.5 text-[12px] font-semibold text-[#4F46E5]">
            {equityExpanded ? 'Hide' : 'See details'}
            <ChevronDown size={14} className={`transition-transform duration-200 ${equityExpanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Expanded equity content */}
        <AnimatePresence>
          {equityExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-t-0 border-[#E2E8F0] rounded-b-card p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart — 2 cols */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Equity Growth</p>
                        <p className="text-[12px] text-[#94A3B8] mt-0.5">Home value vs. loan balance over 30 years</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider">Current Equity</p>
                        <p className="text-[22px] font-bold text-[#059669] tabular-nums">
                          <AnimatedNumber value={h.totalEquity} prefix="$" compact />
                        </p>
                      </div>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height={192}>
                        <AreaChart data={equityChartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                          <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={46} />
                          <Tooltip content={<CustomTooltip />} />
                          <defs>
                            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area dataKey="Home Value" type="monotone" stroke="#4F46E5" fill="url(#valueGrad)" strokeWidth={2} dot={false} />
                          <Area dataKey="Loan Balance" type="monotone" stroke="#E2E8F0" fill="#F8FAFC" strokeWidth={2} dot={false} />
                          <Area dataKey="Your Equity" type="monotone" stroke="#059669" fill="url(#equityGrad)" strokeWidth={2.5} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {[{ label: 'Home Value', color: '#4F46E5' }, { label: 'Loan Balance', color: '#CBD5E1' }, { label: 'Your Equity', color: '#059669' }].map(item => (
                        <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                          <div className="w-3 h-1 rounded" style={{ background: item.color }} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equity position ring */}
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest w-full">Equity Position</p>
                    <ProgressRing value={h.equityPct} max={100} size={130} strokeWidth={11} color="#059669" trackColor="#E2E8F0">
                      <div className="text-center">
                        <p className="text-[20px] font-bold text-[#059669] tabular-nums">
                          <AnimatedNumber value={h.equityPct} suffix="%" />
                        </p>
                        <p className="text-[11px] text-[#64748B]">Equity</p>
                      </div>
                    </ProgressRing>
                    <div className="w-full grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Own</p>
                        <p className="text-[15px] font-bold text-[#059669] tabular-nums">{formatCurrency(h.totalEquity, true)}</p>
                      </div>
                      <div className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Owe</p>
                        <p className="text-[15px] font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(h.loanBalance, true)}</p>
                      </div>
                    </div>
                    <InsightChip text="At 4% annual appreciation, you'll reach 30% equity in ~4 years." />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── 3. Strategy Center ── */}
      <div className="space-y-10">

        {/* ── Group A: Market Signals ── */}
        <motion.section variants={cardVariants} initial="initial" animate="animate">
          <GroupLabel signal="2 signals active">Market Signals</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Refi Watch — upgraded */}
            <div className="bg-white rounded-card border-2 border-[#059669] shadow-card p-5 flex flex-col gap-4" style={{ boxShadow: '0 0 0 4px rgba(5,150,105,0.06), 0 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
                    <RefreshCw size={16} className="text-[#059669]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Refinance</p>
                    <p className="text-[13px] font-bold text-[#0D1B2A]">Rate drop signal</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-bold border border-[#BBF7D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  SIGNAL ACTIVE
                </span>
              </div>

              <div>
                <p className="text-[22px] font-bold text-[#059669] tabular-nums leading-none">
                  Save <AnimatedNumber value={h.monthlyPotentialSavings} prefix="$" suffix="/mo" />
                </p>
                <p className="text-[12px] text-[#64748B] mt-1">
                  {formatCurrency(h.monthlyPotentialSavings * 12)}/yr · {formatCurrency(h.monthlyPotentialSavings * 12 * 20)} over 20 years
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Your rate', value: `${h.originalRate.toFixed(3)}%`, neutral: true },
                  { label: 'Market today', value: `${h.currentMarketRate.toFixed(3)}%`, green: true },
                  { label: 'Rate spread', value: `−${(h.originalRate - h.currentMarketRate).toFixed(2)}%` },
                  { label: 'Breakeven', value: '~28 months' },
                ].map(({ label, value, neutral, green }) => (
                  <div key={label} className={`p-2.5 rounded-xl border ${green ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</p>
                    <p className={`text-[14px] font-bold tabular-nums ${green ? 'text-[#059669]' : 'text-[#0D1B2A]'}`}>{value}</p>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#059669] text-white text-[13px] font-bold hover:bg-[#047857] transition-colors">
                Explore refinance <ArrowUpRight size={14} />
              </button>
            </div>

            {/* HELOC Opportunity */}
            <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                    <DollarSign size={16} className="text-[#D97706]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Access Equity</p>
                    <p className="text-[13px] font-bold text-[#0D1B2A]">HELOC available</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold border border-[#FDE68A]">
                  ELIGIBLE
                </span>
              </div>

              <div>
                <p className="text-[22px] font-bold text-[#D97706] tabular-nums leading-none">
                  Tap <AnimatedNumber value={helocAvailable} prefix="$" compact /> cash
                </p>
                <p className="text-[12px] text-[#64748B] mt-1">
                  Use for renovations, debt payoff, or investments — at a lower rate than credit cards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Available cash', value: `$${(helocAvailable / 1000).toFixed(0)}K` },
                  { label: 'Est. monthly', value: `$${helocMonthly.toLocaleString()}` },
                  { label: 'HELOC rate', value: `${helocRate}%` },
                  { label: 'Draw period', value: '10 yrs' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</p>
                    <p className="text-[14px] font-bold text-[#0D1B2A] tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-[#D97706] text-[#D97706] text-[13px] font-bold hover:bg-[#FEF3C7] transition-colors">
                Explore HELOC <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* ── Group B: Payoff Strategies ── */}
        <motion.section variants={cardVariants} initial="initial" animate="animate">
          <GroupLabel>Payoff Strategy</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pay Off Sooner — slider */}
            <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
                  <TrendingDown size={16} className="text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Pay Off Sooner</p>
                  <p className="text-[13px] font-bold text-[#0D1B2A]">
                    Add <span className="text-[#4F46E5]">${extraPayment}/mo</span>
                    {extraPayment > 0 && <span className="text-[#059669]"> — save {yearsSaved} yrs & {formatCurrency(interestSaved, true)}</span>}
                  </p>
                </div>
              </div>

              <p className="text-[12px] text-[#64748B] mb-5 ml-11">A small extra payment every month has a compounding effect on your payoff date.</p>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Extra Monthly</span>
                  <span className="text-[18px] font-bold text-[#4F46E5] tabular-nums">
                    +<AnimatedNumber value={extraPayment} prefix="$" />
                  </span>
                </div>
                <input
                  type="range" min={0} max={1000} step={50}
                  value={extraPayment}
                  onChange={e => setExtraPayment(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-[#E2E8F0] cursor-pointer accent-[#4F46E5]"
                />
                <div className="flex justify-between mt-1 text-[10px] text-[#94A3B8]">
                  <span>$0</span><span>$1,000</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Extra monthly', value: `$${extraPayment}` },
                  { label: 'Years saved', value: `${yearsSaved} yrs`, green: true },
                  { label: 'Interest saved', value: formatCurrency(interestSaved, true), green: true },
                  { label: 'New payoff', value: extraPayment > 0 ? 'Earlier!' : 'Jun 2054' },
                ].map(({ label, value, green }) => (
                  <div key={label} className={`p-2.5 rounded-xl border ${green && extraPayment > 0 ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</p>
                    <p className={`text-[13px] font-bold tabular-nums ${green && extraPayment > 0 ? 'text-[#059669]' : 'text-[#0D1B2A]'}`}>{value}</p>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#C7D2FE] text-[#4F46E5] text-[13px] font-semibold hover:bg-[#EEF2FF] transition-colors">
                Model this <ArrowRight size={13} />
              </button>
            </div>

            {/* Pay Off by Age 60 */}
            <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-black text-[#4F46E5]">60</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Pay Off by Age 60</p>
                  <p className="text-[13px] font-bold text-[#0D1B2A]">
                    Add <span className="text-[#4F46E5]">$141/mo</span> — mortgage-free at 60
                  </p>
                </div>
              </div>

              <p className="text-[12px] text-[#64748B]">
                You're currently 35. Paying an extra $141/month means your mortgage is completely gone by your 60th birthday.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Extra monthly', value: '$141' },
                  { label: 'Target age', value: '60' },
                  { label: 'Interest saved', value: `$${(interestSaved60 / 1000).toFixed(0)}K`, green: true },
                  { label: 'Payoff date', value: payoffDate60, green: true },
                ].map(({ label, value, green }) => (
                  <div key={label} className={`p-2.5 rounded-xl border ${green ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</p>
                    <p className={`text-[13px] font-bold tabular-nums ${green ? 'text-[#059669]' : 'text-[#0D1B2A]'}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="pt-1 border-t border-[#F1F5F9]">
                <InsightChip text="This is one of the highest-impact low-risk strategies for long-term wealth building." />
              </div>

              <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#C7D2FE] text-[#4F46E5] text-[13px] font-semibold hover:bg-[#EEF2FF] transition-colors">
                Plan this <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* ── Group C: Life Scenarios ── */}
        <motion.section variants={cardVariants} initial="initial" animate="animate">
          <GroupLabel>Life Scenarios</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* ── Combined Move Up card — 2 col span, two bands ── */}
            <div className="md:col-span-2 bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">

              {/* Card header */}
              <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-0.5">Move Up</p>
                  <p className="text-[15px] font-bold text-[#0D1B2A]">Which path fits your life right now?</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#94A3B8]">
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5] shrink-0" />Sell &amp; Move Up
                  <span className="text-[#E2E8F0] mx-0.5">·</span>
                  <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0" />Keep &amp; Buy Next
                </div>
              </div>

              {/* Two bands */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#F1F5F9]">

                {/* ── Band A: SELL & MOVE UP ── */}
                <div className="p-4 bg-[#F8FAFF] flex flex-col gap-3">
                  <span className="self-start inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wide">
                    Sell &amp; Move Up
                  </span>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Sell today → net <span className="font-semibold text-[#4F46E5]">{formatCurrency(netFromSale, true)}</span> cash.
                    That&apos;s ~{((netFromSale / 549_000) * 100).toFixed(0)}% down on the homes below.
                  </p>

                  {/* 3 property chips */}
                  <div className="flex gap-1.5">
                    {(['prop-2', 'prop-4', 'prop-6'] as const).map((propId) => {
                      const prop = MOCK_PROPERTIES.find(p => p.id === propId)
                      if (!prop) return null
                      return (
                        <Link key={propId} href={`/search/${propId}`}
                          className="flex-1 flex flex-col overflow-hidden rounded-xl border border-[#C7D2FE] hover:border-[#4F46E5] hover:shadow-md transition-all group">
                          <div className="h-[60px] overflow-hidden">
                            {prop.photo
                              ? <img src={prop.photo} alt={prop.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> // eslint-disable-line @next/next/no-img-element
                              : <div className={`w-full h-full bg-gradient-to-br ${prop.gradient}`} />}
                          </div>
                          <div className="bg-[#EEF2FF] group-hover:bg-[#E0E7FF] transition-colors px-1.5 py-1.5 text-center">
                            <p className="text-[11px] font-bold text-[#0D1B2A] tabular-nums">${(prop.price / 1000).toFixed(0)}K</p>
                            <p className="text-[9px] font-semibold text-[#4F46E5]">Comfortable</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Mini sell receipt */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-2.5 space-y-1">
                    {[
                      { label: 'Sale price', value: formatCurrency(h.currentValue) },
                      { label: 'Costs (6%)', value: `−${formatCurrency(sellingCosts)}`, red: true },
                      { label: 'Loan payoff', value: `−${formatCurrency(h.loanBalance)}`, red: true },
                    ].map(({ label, value, red }) => (
                      <div key={label} className="flex justify-between text-[11px]">
                        <span className="text-[#94A3B8]">{label}</span>
                        <span className={`font-semibold tabular-nums ${red ? 'text-[#E11D48]' : 'text-[#64748B]'}`}>{value}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#F1F5F9] pt-1 flex justify-between">
                      <span className="text-[12px] font-bold text-[#0D1B2A]">Net in pocket</span>
                      <span className="text-[12px] font-bold text-[#4F46E5] tabular-nums">{formatCurrency(netFromSale)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {[
                      { label: 'Est. new payment', value: '$3,800/mo' },
                      { label: 'Timeline', value: '90–120 days' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-[#94A3B8]">{label}</p>
                        <p className="text-[12px] font-bold text-[#0D1B2A] tabular-nums">{value}</p>
                      </div>
                    ))}
                  </div>

                  <Link href="/search" className="mt-auto text-[11px] font-semibold text-[#4F46E5] hover:text-[#3730A3] flex items-center gap-1 transition-colors">
                    See all homes in range <ArrowUpRight size={11} />
                  </Link>
                </div>

                {/* ── Band B: KEEP & BUY NEXT ── */}
                <div className="p-4 bg-[#F0FDF4] flex flex-col gap-3">
                  <span className="self-start inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#059669] text-white text-[10px] font-bold uppercase tracking-wide">
                    Keep &amp; Buy Next
                  </span>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Rent this home (<span className="font-semibold text-[#059669]">$3,200/mo</span>), keep the $84K, and use your
                    ~$45K savings as down payment on a new home.
                  </p>

                  {/* 2 more affordable property chips */}
                  <div className="flex gap-1.5">
                    {(['prop-3', 'prop-5'] as const).map((propId) => {
                      const prop = MOCK_PROPERTIES.find(p => p.id === propId)
                      if (!prop) return null
                      return (
                        <Link key={propId} href={`/search/${propId}`}
                          className="flex-1 flex flex-col overflow-hidden rounded-xl border border-[#BBF7D0] hover:border-[#059669] hover:shadow-md transition-all group">
                          <div className="h-[60px] overflow-hidden">
                            {prop.photo
                              ? <img src={prop.photo} alt={prop.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> // eslint-disable-line @next/next/no-img-element
                              : <div className={`w-full h-full bg-gradient-to-br ${prop.gradient}`} />}
                          </div>
                          <div className="bg-[#DCFCE7] group-hover:bg-[#BBF7D0] transition-colors px-1.5 py-1.5 text-center">
                            <p className="text-[11px] font-bold text-[#0D1B2A] tabular-nums">${(prop.price / 1000).toFixed(0)}K</p>
                            <p className="text-[9px] font-semibold text-[#059669]">Savings only</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Keep & Rent stats */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Rental income', value: '$3,200/mo' },
                      { label: 'Monthly shortfall', value: `−$${Math.abs(monthlyShortfall).toLocaleString()}`, red: true },
                      { label: 'Appreciation/mo', value: `+$${monthlyAppreciation.toLocaleString()}`, green: true },
                      { label: 'Net wealth/mo', value: `+${formatCurrency(netWealthPerMonth, true)}`, green: true },
                    ].map(({ label, value, green, red }) => (
                      <div key={label} className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                        <p className="text-[10px] text-[#94A3B8]">{label}</p>
                        <p className={`text-[12px] font-bold tabular-nums ${green ? 'text-[#059669]' : red ? 'text-[#E11D48]' : 'text-[#0D1B2A]'}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0]">
                    <p className="text-[11px] font-semibold text-[#166534]">
                      Two assets growing · building <span className="text-[#059669]">+{formatCurrency(netWealthPerMonth, true)}/mo</span> in wealth
                    </p>
                  </div>

                  <button className="mt-auto text-[11px] font-semibold text-[#059669] hover:text-[#047857] flex items-center gap-1 transition-colors">
                    Model this path <ArrowRight size={11} />
                  </button>
                </div>

              </div>
            </div>

            {/* ── Remodel — 1 col ── */}
            <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5 flex flex-col gap-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center mb-3">
                  <Wrench size={16} className="text-[#D97706]" />
                </div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Remodel</p>
                <p className="text-[15px] font-bold text-[#0D1B2A] leading-snug mb-1">
                  Kitchen remodel → <span className="text-[#D97706]">+$45K value</span>
                </p>
                <p className="text-[12px] text-[#64748B] leading-relaxed">
                  At your current equity, a $30K kitchen remodel returns 150% — one of the highest ROI home improvements.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Est. cost', value: '$28–32K' },
                  { label: 'Value added', value: '+$45K', amber: true },
                  { label: 'ROI', value: '~150%', amber: true },
                  { label: 'Timeline', value: '6–8 weeks' },
                ].map(({ label, value, amber }) => (
                  <div key={label} className={`p-2.5 rounded-xl border ${amber ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                    <p className="text-[10px] text-[#94A3B8]">{label}</p>
                    <p className={`text-[13px] font-bold tabular-nums ${amber ? 'text-[#D97706]' : 'text-[#0D1B2A]'}`}>{value}</p>
                  </div>
                ))}
              </div>
              <button className="mt-auto flex items-center gap-1 text-[12px] font-semibold text-[#D97706] hover:text-[#B45309] transition-colors">
                See remodel ROI <ArrowRight size={12} />
              </button>
            </div>

          </div>
        </motion.section>

        {/* ── 4. Maintenance — compact strip ── */}
        <motion.section variants={cardVariants} initial="initial" animate="animate">
          <GroupLabel>Home Maintenance</GroupLabel>
          <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold text-[#334155]">Upcoming this year</p>
              <span className="text-[13px] font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(totalMaintenanceCost)} projected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {upcomingMaintenance.map(event => {
                const isUrgent = event.month <= currentMonth + 1
                return (
                  <div key={event.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isUrgent ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-[#FEF3C7]' : 'bg-white border border-[#E2E8F0]'}`}>
                      <Wrench size={13} className={isUrgent ? 'text-[#D97706]' : 'text-[#94A3B8]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#0D1B2A] truncate">{event.label}</p>
                      <div className="flex items-center justify-between">
                        <p className={`text-[11px] ${isUrgent ? 'text-[#D97706] font-semibold' : 'text-[#94A3B8]'}`}>{MONTH_NAMES[event.month]}{isUrgent ? ' · Soon' : ''}</p>
                        <p className="text-[11px] font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(event.estimatedCost)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.section>

      </div>
    </PageShell>
  )
}
