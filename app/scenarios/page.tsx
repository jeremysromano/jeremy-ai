'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { InsightChip } from '@/components/shared/InsightChip'
import { cardVariants, staggerVariants, chartVariants } from '@/lib/animations'
import { calcMonthlyPayment, calcPMI, calcCashToClose, generateAmortization } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

type LoanType = 'conventional' | 'fha' | 'va' | 'arm'
type Term = 15 | 20 | 30
type StrategyType = 'conservative' | 'balanced' | 'optimized'

interface ScenarioState {
  id: string
  label: string
  strategyType: StrategyType
  loanType: LoanType
  term: Term
  rate: number
  downPct: number
  isRecommended: boolean
  insight: string
  accentColor: string
}

const HOME_PRICE = 685000
const MONTHLY_TAXES = 1370
const MONTHLY_INSURANCE = 175

const STRATEGY_CONFIG: Record<StrategyType, { label: string; badge: string; accentColor: string }> = {
  conservative: { label: 'Lower Cash Upfront', badge: 'Minimum Cash', accentColor: '#6366F1' },
  balanced:     { label: 'Balanced Approach', badge: '★ Recommended', accentColor: '#059669' },
  optimized:    { label: 'Wealth Optimization', badge: 'Max Equity', accentColor: '#0D1B2A' },
}

const INITIAL_SCENARIOS: ScenarioState[] = [
  { id: 's1', label: 'Lower Cash Upfront', strategyType: 'conservative', loanType: 'fha', term: 30, rate: 6.875, downPct: 3.5, isRecommended: false, accentColor: '#6366F1', insight: 'Minimum cash to close. FHA gives access now, but PMI adds cost until 20% equity.' },
  { id: 's2', label: 'Balanced Approach', strategyType: 'balanced', loanType: 'conventional', term: 30, rate: 6.625, downPct: 10, isRecommended: true, accentColor: '#059669', insight: '10% down eliminates FHA, keeps cash invested, qualifies for best conventional pricing.' },
  { id: 's3', label: 'Wealth Optimization', strategyType: 'optimized', loanType: 'conventional', term: 15, rate: 6.125, downPct: 20, isRecommended: false, accentColor: '#0D1B2A', insight: '20% down + 15yr: zero PMI, maximum equity velocity. Highest monthly commitment.' },
]

function computeScenarioMetrics(s: ScenarioState) {
  const loanAmount = HOME_PRICE * (1 - s.downPct / 100)
  const monthly = calcMonthlyPayment(loanAmount, s.rate, s.term)
  const pmi = calcPMI(loanAmount, HOME_PRICE)
  const totalMonthly = monthly + pmi + MONTHLY_TAXES + MONTHLY_INSURANCE
  const totalInterest = monthly * s.term * 12 - loanAmount
  const cashToClose = calcCashToClose(HOME_PRICE, s.downPct)
  const amort = generateAmortization(loanAmount, s.rate, s.term)
  return { loanAmount, monthly, pmi, totalMonthly, totalInterest, cashToClose, amort }
}

function TermToggle({ value, onChange }: { value: Term; onChange: (t: Term) => void }) {
  return (
    <div className="flex rounded-btn overflow-hidden border border-[#E2E8F0]">
      {([15, 20, 30] as Term[]).map(t => (
        <button key={t}
          onClick={() => onChange(t)}
          className={`flex-1 py-1.5 text-[12px] font-semibold transition-colors ${value === t ? 'bg-brand-600 text-white' : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'}`}>
          {t}yr
        </button>
      ))}
    </div>
  )
}

function LoanToggle({ value, onChange }: { value: LoanType; onChange: (t: LoanType) => void }) {
  const opts: LoanType[] = ['conventional', 'fha', 'va', 'arm']
  return (
    <div className="flex rounded-btn overflow-hidden border border-[#E2E8F0]">
      {opts.map(t => (
        <button key={t}
          onClick={() => onChange(t)}
          className={`flex-1 py-1.5 text-[11px] font-semibold transition-colors uppercase ${value === t ? 'bg-brand-600 text-white' : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'}`}>
          {t === 'conventional' ? 'Conv' : t.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function RateSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-l-md text-[#64748B] uppercase tracking-wider">Rate</span>
        <span className="text-d-xs font-bold text-[#0D1B2A] tabular-nums">{value.toFixed(3)}%</span>
      </div>
      <input
        type="range" min={250} max={900} step={12.5}
        value={Math.round(value * 100)}
        onChange={e => onChange(parseInt(e.target.value) / 100)}
        className="w-full h-1.5 rounded-pill appearance-none bg-[#E2E8F0] cursor-pointer accent-brand-600"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-[#94A3B8]">2.5%</span>
        <span className="text-[10px] text-[#94A3B8]">9.0%</span>
      </div>
    </div>
  )
}

function DownSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-l-md text-[#64748B] uppercase tracking-wider">Down Payment</span>
        <span className="text-d-xs font-bold text-[#0D1B2A] tabular-nums">{value}%</span>
      </div>
      <input
        type="range" min={3} max={30} step={0.5}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-pill appearance-none bg-[#E2E8F0] cursor-pointer accent-brand-600"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-[#94A3B8]">3%</span>
        <span className="text-[10px] text-[#94A3B8]">30%</span>
      </div>
    </div>
  )
}

const CustomAmortTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-card-sm shadow-card-md p-2.5 text-[12px]">
      <p className="font-semibold text-[#0D1B2A] mb-1">Year {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  )
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioState[]>(INITIAL_SCENARIOS)

  const updateScenario = useCallback((id: string, updates: Partial<ScenarioState>) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const metrics = useMemo(() => scenarios.map(s => ({ id: s.id, ...computeScenarioMetrics(s) })), [scenarios])

  const baseMetric = metrics[1] // balanced as baseline

  // Amortization data merged for chart
  const amortChartData = useMemo(() => {
    const maxYears = Math.max(...scenarios.map(s => s.term))
    return Array.from({ length: maxYears + 1 }, (_, yr) => {
      const row: Record<string, number> = { year: yr }
      scenarios.forEach((s, i) => {
        const m = metrics[i]
        const point = m.amort.find(a => a.year === yr)
        if (point) {
          row[`balance${i}`] = point.balance
          row[`equity${i}`] = HOME_PRICE - point.balance
        }
      })
      return row
    })
  }, [metrics, scenarios])

  const AREA_COLORS = ['#6366F1', '#059669', '#0D1B2A']

  // Total cost bar chart data
  const totalCostData = useMemo(() => [
    { name: '5yr', ...Object.fromEntries(scenarios.map((s, i) => [`s${i}`, metrics[i].amort[5]?.totalPaid || 0])) },
    { name: '15yr', ...Object.fromEntries(scenarios.map((s, i) => [`s${i}`, metrics[i].amort[15]?.totalPaid || 0])) },
    { name: '30yr', ...Object.fromEntries(scenarios.map((s, i) => {
      const last = metrics[i].amort[metrics[i].amort.length - 1]
      return [`s${i}`, last?.totalPaid || 0]
    })) },
  ], [metrics, scenarios])

  return (
    <PageShell className="pb-20">
      <SectionHeader
        eyebrow="Scenario Studio"
        title="Three strategies. Your call."
        subtitle="Adjust any scenario to see how your payment, total cost, and cash-to-close change in real time."
        className="mb-8"
        action={
          <Link href="/readiness"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-btn text-b-sm font-semibold hover:bg-brand-700 transition-colors group">
            Check Readiness <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        }
      />

      {/* Shared assumptions bar */}
      <div className="mb-6 p-4 bg-white border border-[#E2E8F0] rounded-card shadow-card flex items-center gap-6 flex-wrap">
        <div>
          <p className="text-l-sm text-[#94A3B8] uppercase tracking-wider">Home Price</p>
          <p className="text-d-sm font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(HOME_PRICE)}</p>
        </div>
        <div className="w-px h-8 bg-[#E2E8F0]" />
        <div>
          <p className="text-l-sm text-[#94A3B8] uppercase tracking-wider">Credit Score</p>
          <p className="text-d-sm font-bold text-[#0D1B2A]">748 — Very Good</p>
        </div>
        <div className="w-px h-8 bg-[#E2E8F0]" />
        <div>
          <p className="text-l-sm text-[#94A3B8] uppercase tracking-wider">Taxes + Insurance</p>
          <p className="text-d-sm font-bold text-[#0D1B2A] tabular-nums">{formatCurrency(MONTHLY_TAXES + MONTHLY_INSURANCE)}/mo</p>
        </div>
        <div className="w-px h-8 bg-[#E2E8F0]" />
        <div>
          <p className="text-l-sm text-[#94A3B8] uppercase tracking-wider">Market Rate Range</p>
          <p className="text-d-sm font-bold text-[#0D1B2A]">6.125% – 6.875%</p>
        </div>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {scenarios.map((s, i) => {
          const m = metrics[i]
          const cfg = STRATEGY_CONFIG[s.strategyType]
          const isRec = s.isRecommended
          return (
            <motion.div
              key={s.id}
              variants={cardVariants} initial="initial" animate="animate"
              className={`bg-white rounded-card border shadow-card p-5 flex flex-col gap-4 relative ${
                isRec ? 'border-positive-400 ring-2 ring-positive-100 shadow-glow-pos' : 'border-[#E2E8F0]'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className="px-2.5 py-0.5 rounded-pill text-[11px] font-bold border"
                    style={{ color: cfg.accentColor, borderColor: cfg.accentColor + '40', background: cfg.accentColor + '10' }}
                  >
                    {cfg.badge}
                  </span>
                  {isRec && <Sparkles size={14} className="text-positive-600 shrink-0 mt-0.5" />}
                </div>
                <h3 className="text-b-lg font-bold text-[#0D1B2A]">{s.label}</h3>
              </div>

              {/* Controls */}
              <div className="space-y-3 p-3 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
                <TermToggle value={s.term} onChange={t => updateScenario(s.id, { term: t })} />
                <LoanToggle value={s.loanType} onChange={t => updateScenario(s.id, { loanType: t })} />
                <RateSlider value={s.rate} onChange={r => updateScenario(s.id, { rate: r })} />
                <DownSlider value={s.downPct} onChange={d => updateScenario(s.id, { downPct: d })} />
              </div>

              {/* Output metrics */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Monthly Total', value: m.totalMonthly, prefix: '$', big: true },
                  { label: 'Cash to Close', value: m.cashToClose, prefix: '$', big: false },
                  { label: 'Total Interest', value: m.totalInterest, prefix: '$', big: false },
                  { label: 'PMI', value: m.pmi, prefix: '$', suffix: m.pmi > 0 ? '/mo' : '', big: false },
                ].map(({ label, value, prefix, suffix, big }) => (
                  <div key={label} className={`p-2.5 rounded-card-sm bg-white border border-[#E2E8F0] ${big ? 'col-span-2' : ''}`}>
                    <p className="text-l-sm text-[#94A3B8] uppercase tracking-wider mb-0.5">{label}</p>
                    <p className={`font-bold tabular-nums ${big ? 'text-d-sm' : 'text-d-xs'}`}
                      style={{ color: big ? cfg.accentColor : '#0D1B2A' }}>
                      <AnimatedNumber value={value} prefix={prefix} suffix={suffix} compact />
                    </p>
                  </div>
                ))}
              </div>

              {/* Delta vs balanced */}
              {i !== 1 && (
                <div className="flex items-center justify-between text-b-sm p-2 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
                  <span className="text-[#64748B]">vs. Balanced:</span>
                  <span className={`font-semibold tabular-nums ${m.totalMonthly < baseMetric.totalMonthly ? 'text-positive-600' : 'text-risk-600'}`}>
                    {m.totalMonthly < baseMetric.totalMonthly ? '−' : '+'}{formatCurrency(Math.abs(m.totalMonthly - baseMetric.totalMonthly))}/mo
                  </span>
                </div>
              )}

              <InsightChip text={s.insight} className="text-[12px]" />
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Amortization / Balance over time */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
          <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-1">Loan Balance Over Time</p>
          <p className="text-b-sm text-[#94A3B8] mb-4">How quickly each strategy pays down your mortgage</p>
          <motion.div variants={chartVariants} className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={amortChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => v % 5 === 0 ? `Yr ${v}` : ''} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomAmortTooltip />} />
                {scenarios.map((s, i) => (
                  <Area
                    key={s.id}
                    dataKey={`balance${i}`}
                    name={s.label}
                    type="monotone"
                    stroke={AREA_COLORS[i]}
                    fill={AREA_COLORS[i] + '15'}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                    animationDuration={900}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {scenarios.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <div className="w-3 h-1 rounded" style={{ background: AREA_COLORS[i] }} />
                {s.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Total cost comparison */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
          <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-1">Cumulative Cost</p>
          <p className="text-b-sm text-[#94A3B8] mb-4">Total paid (P&I) at 5, 15, and full term</p>
          <motion.div variants={chartVariants} className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={totalCostData} barGap={4} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} cursor={{ fill: 'rgba(13,27,42,0.03)' }} />
                {scenarios.map((s, i) => (
                  <Bar key={s.id} dataKey={`s${i}`} name={s.label} fill={AREA_COLORS[i] + 'CC'} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {scenarios.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <div className="w-3 h-1 rounded" style={{ background: AREA_COLORS[i] }} />
                {s.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary diff row */}
      <motion.div variants={cardVariants} initial="initial" animate="animate"
        className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 mb-6">
        <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-4">Scenario Comparison Summary</p>
        <div className="overflow-x-auto">
          <table className="w-full text-b-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left py-2 text-[#94A3B8] font-medium">Metric</th>
                {scenarios.map((s, i) => (
                  <th key={s.id} className="text-right py-2 font-semibold" style={{ color: AREA_COLORS[i] }}>
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {[
                { label: 'Monthly Total', key: 'totalMonthly', format: (v: number) => formatCurrency(v) },
                { label: 'Cash to Close', key: 'cashToClose', format: (v: number) => formatCurrency(v) },
                { label: 'Total Interest', key: 'totalInterest', format: (v: number) => formatCurrency(v) },
                { label: 'Loan Amount', key: 'loanAmount', format: (v: number) => formatCurrency(v) },
              ].map(({ label, key, format }) => (
                <tr key={label}>
                  <td className="py-2.5 text-[#64748B]">{label}</td>
                  {metrics.map((m, i) => (
                    <td key={m.id} className="py-2.5 text-right font-semibold tabular-nums text-[#0D1B2A]">
                      {format((m as any)[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Link href="/readiness"
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-btn font-semibold hover:bg-brand-700 transition-colors group">
          Check Your Readiness <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </PageShell>
  )
}
