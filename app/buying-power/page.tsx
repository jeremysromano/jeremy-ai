'use client'

import { motion } from 'framer-motion'
import { ArrowRight, AlertTriangle, TrendingUp, Shield, Zap, Bed, Bath, Square } from 'lucide-react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { MetricCard } from '@/components/shared/MetricCard'
import { GaugeBar } from '@/components/shared/GaugeBar'
import { InsightChip } from '@/components/shared/InsightChip'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { cardVariants, staggerVariants, chartVariants } from '@/lib/animations'
import { MOCK_PROFILE, MOCK_PRICE_BANDS, MOCK_STRESS_SCENARIOS, MOCK_PROPERTIES } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

const BAND_COLORS: Record<string, string> = {
  comfortable: '#059669',
  stretch: '#D97706',
  risk: '#E11D48',
}

const IMPACT_COLORS: Record<string, string> = {
  low: '#059669',
  medium: '#D97706',
  high: '#E11D48',
}

const chartData = [
  { label: 'Comfortable\n$450K–600K', minPrice: 450000, maxPrice: 600000, payment: 3200, qualifier: 'comfortable' },
  { label: 'Recommended\n$600K–720K', minPrice: 600000, maxPrice: 720000, payment: 4100, qualifier: 'stretch' },
  { label: 'Ceiling\n$720K–820K', minPrice: 720000, maxPrice: 820000, payment: 4900, qualifier: 'risk' },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-card-sm shadow-card-md p-3">
      <p className="text-b-sm font-semibold text-[#0D1B2A] mb-1">{formatCurrency(d.minPrice)} – {formatCurrency(d.maxPrice)}</p>
      <p className="text-b-sm text-[#64748B]">~{formatCurrency(d.payment)}/mo estimated</p>
    </div>
  )
}

export default function BuyingPowerPage() {
  const p = MOCK_PROFILE
  const monthlyGross = p.income.filter(i => i.verified).reduce((s, i) => s + i.annual, 0) / 12
  const currentPayment = 4150  // mock at recommended max
  const housingRatio = Math.round((currentPayment / monthlyGross) * 100)

  const alignedHomes = MOCK_PROPERTIES.filter(prop => prop.price >= 550000 && prop.price <= 720000)

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Buying Power"
        title="Where you stand, clearly."
        subtitle="Based on your verified income, assets, and credit — here's what you can confidently buy today."
        className="mb-8"
        action={
          <Link href="/scenarios"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-btn text-b-sm font-semibold hover:bg-brand-700 transition-colors group">
            Compare Scenarios <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        }
      />

      {/* Summary KPIs */}
      <motion.div
        variants={staggerVariants} initial="initial" animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      >
        <MetricCard label="Comfortable Max" value={600000} prefix="$" compact sublabel="Under 22% income ratio" />
        <MetricCard label="Recommended Max" value={720000} prefix="$" compact sublabel="At 28% housing ratio" />
        <MetricCard label="Absolute Ceiling" value={820000} prefix="$" compact sublabel="Near DTI limits" />
        <MetricCard label="Monthly at $685K" value={4418} prefix="$" sublabel="P&I + taxes + insurance" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Price Range Chart */}
        <div className="lg:col-span-2">
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
            <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-1">Price Range Analysis</p>
            <p className="text-b-sm text-[#94A3B8] mb-6">Monthly payment at each price band (10% down, 6.625%, 30yr)</p>
            <motion.div variants={chartVariants} className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={56} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false} tickLine={false}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(13,27,42,0.03)' }} />
                  <ReferenceLine
                    y={monthlyGross * 0.28}
                    stroke="#D97706"
                    strokeDasharray="4 4"
                    label={{ value: '28% threshold', fill: '#D97706', fontSize: 11, position: 'right' }}
                  />
                  <Bar dataKey="payment" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={800}>
                    {chartData.map((d) => (
                      <Cell key={d.qualifier} fill={BAND_COLORS[d.qualifier] + 'CC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Band cards */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {MOCK_PRICE_BANDS.map(band => (
                <div key={band.label}
                  className="p-3 rounded-card-sm border"
                  style={{ borderColor: BAND_COLORS[band.qualifier] + '40', background: BAND_COLORS[band.qualifier] + '08' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: BAND_COLORS[band.qualifier] }}>{band.label}</p>
                  <p className="text-d-xs font-bold text-[#0D1B2A] tabular-nums mb-0.5">{formatCurrency(band.monthlyPayment)}/mo</p>
                  <p className="text-[11px] text-[#94A3B8]">{band.description.split('.')[0]}.</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Payment Comfort + Stress */}
        <div className="space-y-5">
          {/* Comfort gauge */}
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
            <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-4">Payment Comfort</p>
            <GaugeBar
              value={housingRatio} max={50}
              label="Housing Expense Ratio"
              formatValue={v => `${v}%`}
              zones={[
                { max: 56, color: '#059669', label: 'Great (0–28%)' },
                { max: 72, color: '#D97706', label: 'OK (28–36%)' },
                { max: 100, color: '#E11D48', label: 'Risk (36%+)' },
              ]}
            />
            <div className="mt-4 flex items-center justify-between p-3 bg-[#F8FAFC] rounded-card-sm">
              <span className="text-b-sm text-[#64748B]">At $685K target</span>
              <span className="text-b-md font-bold text-[#0D1B2A] tabular-nums">{housingRatio}%</span>
            </div>
            <InsightChip
              className="mt-3"
              text="Your target home puts you at a comfortable housing ratio. You have meaningful buffer before stress scenarios become problematic."
            />
          </motion.div>

          {/* Stress test */}
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-[#64748B]" />
              <p className="text-l-sm uppercase tracking-widest text-[#64748B]">Stress Test</p>
            </div>
            <div className="space-y-3">
              {MOCK_STRESS_SCENARIOS.map(s => (
                <div key={s.label} className="p-3 rounded-card-sm bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-b-sm font-medium text-[#334155]">{s.label}</span>
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ color: IMPACT_COLORS[s.impact], background: IMPACT_COLORS[s.impact] + '15' }}>
                      {s.impact.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-b-sm">
                    <span className="text-[#64748B]">{formatCurrency(s.originalPayment)}/mo → </span>
                    <span className="font-semibold text-[#0D1B2A] tabular-nums">{formatCurrency(s.stressedPayment)}/mo</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{s.delta}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Financially aligned homes */}
      <motion.div variants={cardVariants} initial="initial" animate="animate"
        className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-1">Financially Aligned Homes</p>
            <p className="text-b-sm text-[#94A3B8]">In your $550K–$720K comfort zone</p>
          </div>
          <Zap size={16} className="text-brand-500" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {alignedHomes.map(h => (
            <div key={h.id} className="shrink-0 w-64 border border-[#E2E8F0] rounded-card-sm overflow-hidden bg-[#F8FAFC]">
              <div className={`h-32 bg-gradient-to-br ${h.gradient}`} />
              <div className="p-3">
                <p className="text-b-sm font-bold text-[#0D1B2A]">{formatCurrency(h.price)}</p>
                <p className="text-[12px] text-[#64748B] truncate">{h.address}</p>
                <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] mt-1.5">
                  <Bed size={11} />{h.beds}bd <Bath size={11} />{h.baths}ba <Square size={11} />{h.sqft.toLocaleString()}sf
                </div>
                <div className="mt-2 px-2 py-0.5 inline-flex rounded-full bg-positive-50 text-positive-700 text-[11px] font-semibold border border-positive-200">
                  Financially aligned
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <div className="mt-6 flex items-center gap-4 p-6 bg-brand-600 rounded-card text-white">
        <div className="flex-1">
          <p className="text-b-lg font-semibold">Ready to compare mortgage strategies?</p>
          <p className="text-b-sm text-white/70 mt-0.5">See three side-by-side scenarios optimized for your financial profile.</p>
        </div>
        <Link href="/scenarios"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-brand-700 rounded-btn text-b-sm font-semibold hover:bg-brand-50 transition-colors group">
          Scenario Studio <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </PageShell>
  )
}
