'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, TrendingDown, Wrench, Home, RefreshCw, DollarSign, Zap, ArrowUpRight, CreditCard, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { MetricCard } from '@/components/shared/MetricCard'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { InsightChip } from '@/components/shared/InsightChip'
import { cardVariants, staggerVariants, chartVariants } from '@/lib/animations'
import { MOCK_HOMEOWNER } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

const MAINTENANCE_ICONS: Record<string, React.FC<any>> = {
  hvac: Wrench, plumbing: Wrench, roof: Home, landscaping: Wrench,
  electrical: Zap, general: Home,
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-card-sm shadow-card-md p-3 text-[12px]">
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

export default function HomeownerPage() {
  const h = MOCK_HOMEOWNER
  const [extraPayment, setExtraPayment] = useState(200)
  const currentMonth = 4 // April — 11 months since close

  const upcomingMaintenance = h.maintenanceEvents
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => a.month - b.month)
    .slice(0, 4)

  const totalMaintenanceCost = h.maintenanceEvents
    .filter(e => e.status === 'upcoming')
    .reduce((s, e) => s + e.estimatedCost, 0)

  // Extra payment analysis (rough: each ~$100 extra saves ~8 months)
  const yearsSaved = ((extraPayment / 100) * 0.65).toFixed(1)
  const interestSaved = extraPayment * 0.65 * 12 * 10 // rough estimate

  const equityChartData = h.equityHistory.map(p => ({
    label: p.label,
    'Home Value': p.homeValue,
    'Loan Balance': p.loanBalance,
    'Your Equity': p.equity,
  }))

  return (
    <PageShell>

      {/* ── Payment Banner ── */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="bg-white rounded-card border border-[#E2E8F0] shadow-card mb-8 overflow-hidden"
      >
        {/* Banner header row */}
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

        {/* Two-column payment status */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Last payment — confirmed */}
          <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-[#F1F5F9]">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Last Payment</p>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-[28px] font-bold text-[#0D1B2A] tabular-nums leading-none">
                $4,418
              </p>
              <span className="mb-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-bold">
                <CheckCircle2 size={9} />
                PAID
              </span>
            </div>
            <p className="text-[13px] text-[#64748B]">Received March 1, 2026</p>
            <button className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors">
              View payment history <ChevronRight size={12} />
            </button>
          </div>

          {/* Next payment due — action area */}
          <div className="relative px-6 py-5 bg-[#4F46E5]">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Next Payment Due</p>
            <p className="text-[13px] text-white/70 mb-1">April 1, 2026</p>
            <p className="text-[28px] font-bold text-white tabular-nums leading-none mb-5">
              $4,418
            </p>
            <button className="w-full py-2.5 rounded-xl bg-white text-[#4F46E5] text-[13px] font-bold hover:bg-[#EEF2FF] transition-colors">
              Make a Payment
            </button>
          </div>
        </div>
      </motion.div>

      <SectionHeader
        eyebrow="Homeowner Intelligence"
        title="You closed. We keep watching."
        subtitle="Equity, refinance signals, and homeownership guidance — all in one place."
        className="mb-8"
      />

      {/* KPI bar */}
      <motion.div
        variants={staggerVariants} initial="initial" animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <MetricCard label="Current Home Value" value={h.currentValue} prefix="$" compact trend="up" trendLabel="+6%" />
        <MetricCard label="Total Equity" value={h.totalEquity} prefix="$" compact trend="up" />
        <MetricCard label="Loan-to-Value" value={h.ltv} suffix="%" sublabel="Below 80% → PMI drops" />
        <MetricCard label="Years Remaining" value={h.yearsRemaining} decimals={1} sublabel="On current schedule" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Equity growth chart — 2 cols */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="lg:col-span-2 bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-l-sm uppercase tracking-widest text-[#64748B]">Equity Growth</p>
              <p className="text-b-sm text-[#94A3B8] mt-0.5">Home value vs. loan balance over 30 years</p>
            </div>
            <div className="text-right">
              <p className="text-l-sm text-[#64748B] uppercase tracking-wider">Current Equity</p>
              <p className="text-d-md font-bold text-positive-600 tabular-nums">
                <AnimatedNumber value={h.totalEquity} prefix="$" compact />
              </p>
            </div>
          </div>
          <motion.div variants={chartVariants} className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={50} />
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
                <Area dataKey="Home Value" type="monotone" stroke="#4F46E5" fill="url(#valueGrad)" strokeWidth={2} dot={false} isAnimationActive animationDuration={900} />
                <Area dataKey="Loan Balance" type="monotone" stroke="#E2E8F0" fill="#F8FAFC" strokeWidth={2} dot={false} isAnimationActive animationDuration={900} />
                <Area dataKey="Your Equity" type="monotone" stroke="#059669" fill="url(#equityGrad)" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          <div className="flex items-center gap-4 mt-3">
            {[
              { label: 'Home Value', color: '#4F46E5' },
              { label: 'Loan Balance', color: '#CBD5E1' },
              { label: 'Your Equity', color: '#059669' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <div className="w-3 h-1 rounded" style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Equity snapshot + LTV ring */}
        <div className="space-y-5">
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 flex flex-col items-center gap-3">
            <p className="text-l-sm uppercase tracking-widest text-[#64748B] w-full">Equity Position</p>
            <ProgressRing value={h.equityPct} max={100} size={140} strokeWidth={12} color="#059669" trackColor="#E2E8F0">
              <div className="text-center">
                <p className="text-d-md font-bold text-positive-600 tabular-nums">
                  <AnimatedNumber value={h.equityPct} suffix="%" />
                </p>
                <p className="text-b-sm text-[#64748B]">Equity</p>
              </div>
            </ProgressRing>
            <div className="w-full grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Own</p>
                <p className="text-d-xs font-bold text-positive-600 tabular-nums">{formatCurrency(h.totalEquity, true)}</p>
              </div>
              <div className="p-2 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Owe</p>
                <p className="text-d-xs font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(h.loanBalance, true)}</p>
              </div>
            </div>
            <InsightChip text="At 4% annual appreciation, you'll reach 30% equity in approximately 4 years." />
          </motion.div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Refinance watch */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className={`bg-white rounded-card border shadow-card p-6 ${
            h.monthlyPotentialSavings >= 300 ? 'border-positive-300 ring-1 ring-positive-100' :
            h.monthlyPotentialSavings >= 100 ? 'border-caution-300' : 'border-[#E2E8F0]'
          }`}>
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={16} className={h.monthlyPotentialSavings >= 300 ? 'text-positive-600' : 'text-caution-500'} />
            <p className="text-l-sm uppercase tracking-widest text-[#64748B]">Refinance Watch</p>
            {h.monthlyPotentialSavings >= 300 && (
              <span className="ml-auto px-2 py-0.5 rounded-pill bg-positive-50 text-positive-700 text-[11px] font-bold border border-positive-200">
                Signal Active
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
              <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-1">Your Rate</p>
              <p className="text-d-sm font-bold text-[#0D1B2A] tabular-nums">{h.originalRate.toFixed(3)}%</p>
            </div>
            <div className="p-3 bg-positive-50 rounded-card-sm border border-positive-200">
              <p className="text-[11px] text-positive-700 uppercase tracking-wider mb-1">Market Today</p>
              <p className="text-d-sm font-bold text-positive-600 tabular-nums">{h.currentMarketRate.toFixed(3)}%</p>
            </div>
          </div>
          <div className="p-4 rounded-card-sm bg-positive-50 border border-positive-200 mb-4">
            <p className="text-[11px] text-positive-700 uppercase tracking-wider mb-1">Potential Monthly Savings</p>
            <p className="text-d-lg font-bold text-positive-600 tabular-nums">
              <AnimatedNumber value={h.monthlyPotentialSavings} prefix="$" suffix="/mo" />
            </p>
            <p className="text-b-sm text-positive-700 mt-0.5">{formatCurrency(h.monthlyPotentialSavings * 12)}/year · {formatCurrency(h.monthlyPotentialSavings * 12 * 20)} over 20yr</p>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-positive-600 text-white rounded-btn text-b-sm font-semibold hover:bg-positive-700 transition-colors">
            Explore Refinance <ArrowUpRight size={14} />
          </button>
        </motion.div>

        {/* Extra payment optimizer */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-600" />
            <p className="text-l-sm uppercase tracking-widest text-[#64748B]">Payment Optimizer</p>
          </div>
          <p className="text-b-sm text-[#64748B] mb-4">What if you paid a little more each month?</p>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-l-md text-[#64748B] uppercase tracking-wider">Extra Monthly</span>
              <span className="text-d-xs font-bold text-[#0D1B2A] tabular-nums">
                +<AnimatedNumber value={extraPayment} prefix="$" />
              </span>
            </div>
            <input
              type="range" min={0} max={1000} step={50}
              value={extraPayment}
              onChange={e => setExtraPayment(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-pill appearance-none bg-[#E2E8F0] cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between mt-0.5 text-[10px] text-[#94A3B8]">
              <span>$0</span><span>$1,000</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-brand-50 rounded-card-sm border border-brand-100">
              <span className="text-b-sm text-brand-700">Years saved</span>
              <span className="text-d-xs font-bold text-brand-600 tabular-nums">{yearsSaved} yrs</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-positive-50 rounded-card-sm border border-positive-100">
              <span className="text-b-sm text-positive-700">Interest saved</span>
              <span className="text-d-xs font-bold text-positive-600 tabular-nums">{formatCurrency(interestSaved, true)}</span>
            </div>
          </div>
          <InsightChip
            text={extraPayment > 0
              ? `${formatCurrency(extraPayment)}/mo extra could save you ${yearsSaved} years and ${formatCurrency(interestSaved, true)} in interest.`
              : 'Move the slider to see the impact of extra payments.'
            }
            className="mt-3"
          />
        </motion.div>

        {/* Maintenance calendar */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench size={15} className="text-[#64748B]" />
              <p className="text-l-sm uppercase tracking-widest text-[#64748B]">Maintenance</p>
            </div>
            <span className="text-b-sm font-semibold text-[#0D1B2A] tabular-nums">{formatCurrency(totalMaintenanceCost)} projected</span>
          </div>
          <div className="space-y-3">
            {upcomingMaintenance.map(event => {
              const Icon = MAINTENANCE_ICONS[event.category] ?? Wrench
              const isUrgent = event.month <= currentMonth + 1
              return (
                <div key={event.id} className={`flex items-start gap-3 p-3 rounded-card-sm border ${
                  isUrgent ? 'bg-caution-50 border-caution-200' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUrgent ? 'bg-caution-100' : 'bg-white border border-[#E2E8F0]'
                  }`}>
                    <Icon size={14} className={isUrgent ? 'text-caution-600' : 'text-[#94A3B8]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-b-sm font-semibold text-[#0D1B2A] truncate">{event.label}</p>
                      <span className="shrink-0 text-b-sm font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(event.estimatedCost)}</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isUrgent ? 'text-caution-600 font-semibold' : 'text-[#94A3B8]'}`}>
                      {MONTH_NAMES[event.month]} {isUrgent ? '— due soon' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Scenario prompts */}
      <motion.div variants={cardVariants} initial="initial" animate="animate"
        className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
        <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-2">Life Scenario Planning</p>
        <p className="text-b-sm text-[#94A3B8] mb-5">Big decisions start with the right numbers.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ── Move Up card (enhanced) ── */}
          <div className="p-5 rounded-card-sm border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col gap-4">
            {/* Header */}
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E6F7F3] flex items-center justify-center mb-3">
                <ArrowUpRight size={20} className="text-[#0F6E56]" />
              </div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Move Up</p>
              <p className="text-[16px] font-bold text-[#0D1B2A] leading-snug mb-1">
                Your <span className="text-[#059669]">$128K equity</span> buys a $950K home
              </p>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Roll your equity into a down payment. Three homes in your comfortable range right now.
              </p>
            </div>

            {/* Home chips */}
            <div className="flex gap-2">
              {[
                { id: 'prop-2', price: '$549K' },
                { id: 'prop-4', price: '$595K' },
                { id: 'prop-6', price: '$720K' },
              ].map(({ id, price }) => (
                <Link
                  key={id}
                  href={`/search/${id}`}
                  className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border border-[#B2EADC] bg-[#F0FBF8] hover:border-[#0F6E56] hover:bg-[#E6F7F3] transition-all"
                >
                  {/* House SVG */}
                  <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 10V20H9V14H15V20H22V10L12 2Z" fill="#9FE1CB" stroke="#0F6E56" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[12px] font-semibold text-[#0D1B2A]">{price}</span>
                  <span className="text-[10px] font-medium text-[#059669]">Comfortable</span>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0]" />

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: 'Net from sale',       value: '$277K' },
                { label: 'New buying power',     value: '$950K' },
                { label: 'Est. new payment',     value: '$5,800/mo' },
                { label: 'Timeline',             value: '90–120 days' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-[#94A3B8]">{label}</p>
                  <p className="text-[14px] font-bold text-[#0D1B2A] tabular-nums">{value}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/search"
              className="text-[13px] font-semibold text-[#059669] hover:text-[#0F6E56] flex items-center gap-1 transition-colors"
            >
              See all homes in range <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* ── Rent It card (unchanged) ── */}
          <div className="p-5 rounded-card-sm border border-[#E2E8F0] bg-[#F8FAFC] hover:border-brand-200 hover:shadow-card-md transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#05966915' }}>
              <DollarSign size={20} style={{ color: '#059669' }} />
            </div>
            <p className="text-b-md font-bold text-[#0D1B2A] mb-1">Rent It?</p>
            <p className="text-b-sm text-[#64748B] mb-3 leading-relaxed">
              This home could rent for ~$3,200/mo. Net cash flow: ~$680/mo after expenses.
            </p>
            <p className="text-b-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all text-[#059669]">
              Explore rental analysis <ArrowRight size={14} />
            </p>
          </div>

          {/* ── Remodel card (unchanged) ── */}
          <div className="p-5 rounded-card-sm border border-[#E2E8F0] bg-[#F8FAFC] hover:border-brand-200 hover:shadow-card-md transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#D9770615' }}>
              <Wrench size={20} style={{ color: '#D97706' }} />
            </div>
            <p className="text-b-md font-bold text-[#0D1B2A] mb-1">Remodel?</p>
            <p className="text-b-sm text-[#64748B] mb-3 leading-relaxed">
              A kitchen remodel adds 12–15% value on average. ROI at current equity: strong.
            </p>
            <p className="text-b-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all text-[#D97706]">
              See remodel ROI <ArrowRight size={14} />
            </p>
          </div>

        </div>
      </motion.div>
    </PageShell>
  )
}
