'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Briefcase, PiggyBank, CreditCard, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { MetricCard } from '@/components/shared/MetricCard'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { GaugeBar } from '@/components/shared/GaugeBar'
import { InsightChip } from '@/components/shared/InsightChip'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { cardVariants, staggerVariants } from '@/lib/animations'
import { MOCK_PROFILE } from '@/lib/mock-data'
import { formatCurrency, formatPct, creditBandLabel } from '@/lib/utils'

const creditColor = (score: number) =>
  score >= 740 ? '#059669' : score >= 670 ? '#4F46E5' : score >= 580 ? '#D97706' : '#E11D48'

const incomeTypeIcon: Record<string, React.ReactNode> = {
  salary: <Briefcase size={14} />,
  investment: <TrendingUp size={14} />,
  rental: <CreditCard size={14} />,
}

export default function ProfilePage() {
  const p = MOCK_PROFILE
  const totalIncome = p.income.reduce((s, i) => s + i.annual, 0)
  const liquidAssets = p.assets.filter(a => a.liquid).reduce((s, a) => s + a.value, 0)
  const totalAssets = p.assets.reduce((s, a) => s + a.value, 0)
  const totalMonthlyDebt = p.debts.reduce((s, d) => s + d.monthlyPayment, 0)
  const cc = creditColor(p.creditScore)

  return (
    <PageShell>
      {/* Hero */}
      <div className="flex items-start justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-d-sm font-bold shadow-glow-brand">
            {p.initials}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-d-md font-bold text-[#0D1B2A]">{p.name}</h1>
              <span className="px-2 py-0.5 rounded-pill text-[12px] font-semibold bg-positive-50 text-positive-700 border border-positive-200">
                {p.confidence}% Confident
              </span>
            </div>
            <p className="text-b-md text-[#64748B]">
              Jeremy understands your full financial picture. Two items are holding back your optimal pricing.
            </p>
          </div>
        </div>
        <Link
          href="/buying-power"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-btn text-b-md font-semibold hover:bg-brand-700 transition-colors group"
        >
          View Buying Power <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Top KPIs */}
      <motion.div
        variants={staggerVariants} initial="initial" animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      >
        <MetricCard label="Annual Income" value={totalIncome} prefix="$" compact trend="up" trendLabel="+12% YoY" />
        <MetricCard label="Liquid Assets" value={liquidAssets} prefix="$" compact />
        <MetricCard label="Buying Power" value={p.buyingPowerMax} prefix="$" compact sublabel="Up to this price" />
        <MetricCard label="Monthly Debt" value={totalMonthlyDebt} prefix="$" sublabel="Existing obligations" />
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left col — Credit + DTI */}
        <div className="space-y-5">
          {/* Credit Score */}
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
            <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-4">Credit Score</p>
            <div className="flex items-center gap-6">
              <ProgressRing value={p.creditScore} max={850} size={100} strokeWidth={9} color={cc} trackColor="#E2E8F0">
                <div className="text-center">
                  <p className="text-d-xs font-bold tabular-nums" style={{ color: cc }}>
                    <AnimatedNumber value={p.creditScore} />
                  </p>
                </div>
              </ProgressRing>
              <div>
                <p className="text-d-sm font-bold" style={{ color: cc }}>{creditBandLabel(p.creditBand)}</p>
                <p className="text-b-sm text-[#64748B] mt-1">Qualifies for best conventional pricing</p>
                <p className="text-b-sm text-[#94A3B8] mt-2">Out of 850</p>
              </div>
            </div>
          </motion.div>

          {/* DTI */}
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 space-y-4">
            <p className="text-l-sm uppercase tracking-widest text-[#64748B]">Debt-to-Income</p>
            <GaugeBar
              value={p.frontDTI} max={50} label="Front-end DTI"
              formatValue={v => `${v}%`}
              zones={[
                { max: 56, color: '#059669', label: '0–28%' },
                { max: 72, color: '#D97706', label: '28–36%' },
                { max: 100, color: '#E11D48', label: '36%+' },
              ]}
            />
            <GaugeBar
              value={p.backDTI} max={50} label="Back-end DTI"
              formatValue={v => `${v}%`}
              zones={[
                { max: 72, color: '#059669', label: '0–36%' },
                { max: 86, color: '#D97706', label: '36–43%' },
                { max: 100, color: '#E11D48', label: '43%+' },
              ]}
            />
            <InsightChip text="Both DTI ratios are healthy. Adding rental income would bring your back-end to 28%." />
          </motion.div>
        </div>

        {/* Center col — Income */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
          <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-5">Income Sources</p>
          <div className="space-y-4">
            {p.income.map(inc => {
              const pct = Math.round((inc.annual / totalIncome) * 100)
              return (
                <div key={inc.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#94A3B8]">{incomeTypeIcon[inc.type]}</span>
                      <span className="text-b-sm font-medium text-[#334155]">{inc.label}</span>
                      {inc.verified
                        ? <CheckCircle2 size={13} className="text-positive-600" />
                        : <AlertTriangle size={13} className="text-caution-500" />
                      }
                    </div>
                    <span className="text-b-sm font-semibold text-[#0D1B2A] tabular-nums">{formatCurrency(inc.annual)}</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-pill overflow-hidden">
                    <motion.div
                      className={`h-full rounded-pill ${inc.verified ? 'bg-brand-500' : 'bg-caution-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: 0.3 }}
                    />
                  </div>
                  {!inc.verified && (
                    <p className="text-[11px] text-caution-600 mt-1">Unverified — confirm to include in qualifying income</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="border-t border-[#E2E8F0] mt-5 pt-4 flex justify-between">
            <span className="text-b-sm text-[#64748B]">Total Annual</span>
            <span className="text-d-xs font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(totalIncome)}</span>
          </div>
        </motion.div>

        {/* Right col — Assets + Debts */}
        <div className="space-y-5">
          {/* Assets */}
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-l-sm uppercase tracking-widest text-[#64748B]">Assets</p>
              <PiggyBank size={16} className="text-[#94A3B8]" />
            </div>
            <div className="space-y-3">
              {p.assets.map(a => (
                <div key={a.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${a.liquid ? 'bg-positive-500' : 'bg-[#CBD5E1]'}`} />
                    <span className="text-b-sm text-[#334155]">{a.label}</span>
                  </div>
                  <span className="text-b-sm font-semibold text-[#0D1B2A] tabular-nums">{formatCurrency(a.value)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E2E8F0] mt-4 pt-3 flex justify-between">
              <span className="text-b-sm text-[#64748B]">Liquid</span>
              <span className="text-d-xs font-bold text-positive-600 tabular-nums">{formatCurrency(liquidAssets)}</span>
            </div>
          </motion.div>

          {/* Debts */}
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
            <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-4">Monthly Obligations</p>
            <div className="space-y-3">
              {p.debts.filter(d => d.monthlyPayment > 0).map(d => (
                <div key={d.id} className="flex items-center justify-between">
                  <span className="text-b-sm text-[#334155] truncate max-w-[150px]">{d.label}</span>
                  <span className="text-b-sm font-semibold text-[#0D1B2A] tabular-nums">{formatCurrency(d.monthlyPayment)}/mo</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E2E8F0] mt-4 pt-3 flex justify-between">
              <span className="text-b-sm text-[#64748B]">Total Monthly</span>
              <span className="text-d-xs font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(totalMonthlyDebt)}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Missing signals */}
      {p.missingSignals.length > 0 && (
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="p-5 rounded-card bg-caution-50 border border-caution-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-caution-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-b-md font-semibold text-caution-700 mb-2">Open items that affect your pricing</p>
              <ul className="space-y-1">
                {p.missingSignals.map(s => (
                  <li key={s} className="text-b-sm text-caution-600 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-caution-500 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/readiness"
              className="shrink-0 ml-auto flex items-center gap-1 text-b-sm font-semibold text-caution-700 hover:text-caution-800 transition-colors">
              Resolve <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Buying power CTA */}
      <div className="mt-6 flex items-center gap-4 p-6 bg-white rounded-card border border-[#E2E8F0] shadow-card">
        <div className="flex-1">
          <p className="text-b-md font-semibold text-[#0D1B2A]">Your buying power range</p>
          <p className="text-b-sm text-[#64748B] mt-0.5">Based on verified income, assets, and credit — today.</p>
        </div>
        <div className="text-right">
          <p className="text-d-sm font-bold text-brand-600 tabular-nums">{formatCurrency(p.buyingPowerMin)} – {formatCurrency(p.buyingPowerMax)}</p>
        </div>
        <Link href="/buying-power"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-btn text-b-sm font-semibold hover:bg-brand-700 transition-colors group">
          Explore <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </PageShell>
  )
}
