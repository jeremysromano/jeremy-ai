'use client'

import { motion } from 'framer-motion'
import {
  Home, ArrowRight, ChevronRight, Sparkles,
  Building2, Wallet, Calendar, Lock
} from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { cardVariants } from '@/lib/animations'

// ── Current home snapshot ─────────────────────────────────────────────────────
// John bought in March 2021 — now 5 years in, ready to upgrade.
const HOME = {
  address: '742 Maple Drive',
  city: 'San Jose, CA 95125',
  purchaseDate: 'March 2021',
  purchasePrice: 650_000,

  // Mortgage statement
  servicer: 'Wells Fargo Home Mortgage',
  loanNumber: '****4471',
  originalBalance: 520_000,
  rate: 3.125,
  termYears: 30,
  payoffDate: 'February 2051',
  monthlyPayment: 3_328,    // total PITI
  principalAndInterest: 2_228,
  escrowMonthly: 1_100,
  nextDueDate: 'April 1, 2026',
  daysUntilDue: 11,
  currentBalance: 462_800,
  yearsRemaining: 25.0,
  loanProgress: 11,          // % of original loan paid down

  // YTD 2026
  ytdPrincipal: 3_840,
  ytdInterest: 10_240,
  escrowBalance: 4_180,

  // Equity
  currentValue: 787_000,
  totalEquity: 324_200,
  equityPct: 41,
  appreciationGain: 137_000,
  sellingCosts: 47_220,      // ~6% of current value
  netProceeds: 276_980,      // equity − selling costs → what rolls into next home

  // Upgrade pre-qualification
  upgradeRate: 6.75,
  upgradeBudget: 1_300_000,
  upgradeLoan: 1_023_000,    // 1.3M − 277K
  upgradePI: 6_750,          // P&I at 6.75%, 30yr
  upgradeTotalMonthly: 8_400,// PITI
}

// ── Three paths to the next home ─────────────────────────────────────────────
const PATHS = [
  {
    id: 'sell-first',
    Icon: Home,
    label: 'Sell First',
    sublabel: 'Then buy',
    tag: 'Most Common',
    tagColor: '#4F46E5', tagBg: '#EEF2FF', tagBorder: '#C7D2FE',
    stats: [
      { label: 'Transition window', value: '90–120 days' },
      { label: 'Bridge needed',     value: 'None' },
      { label: 'Cash to close',     value: '$277K ready' },
    ],
    insight: 'List your home, close, roll the proceeds straight into your next purchase. No overlapping mortgages, no bridge interest.',
    cta: 'Plan the timeline',
    href: '/journey',
  },
  {
    id: 'bridge',
    Icon: Building2,
    label: 'Bridge Loan',
    sublabel: 'Buy before you sell',
    tag: 'Move Fast',
    tagColor: '#D97706', tagBg: '#FFFBEB', tagBorder: '#FDE68A',
    stats: [
      { label: 'Bridge amount',  value: '$277K' },
      { label: 'Bridge cost',    value: '~$5K total interest' },
      { label: 'Sell current by', value: 'Sep 2026' },
    ],
    insight: 'Buy the ideal home now without waiting. Borrow against your equity — roughly $1,200/mo in bridge interest for 4–5 months.',
    cta: 'Calculate bridge cost',
    href: '/scenarios',
  },
  {
    id: 'keep-rent',
    Icon: Wallet,
    label: 'Keep & Rent',
    sublabel: 'Convert to investment',
    tag: 'Wealth Play',
    tagColor: '#059669', tagBg: '#ECFDF5', tagBorder: '#A7F3D0',
    stats: [
      { label: 'Rental rate est.', value: '$3,400/mo' },
      { label: 'Monthly cash flow', value: '+$72' },
      { label: 'In 10 years',       value: '2 properties' },
    ],
    insight: 'Rent Maple Drive, cover your mortgage, and build equity on two assets simultaneously. Use current savings for the next down payment.',
    cta: 'Model rent + buy',
    href: '/scenarios',
  },
]

export default function ReadinessPage() {
  return (
    <PageShell>

      {/* ── Property header ───────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants} initial="initial" animate="animate"
        className="mb-8 flex items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Home size={13} className="text-brand-600" />
            <p className="text-l-sm uppercase tracking-widest text-[#94A3B8]">Current Home</p>
          </div>
          <h1 className="text-d-md font-black text-[#0D1B2A] leading-none mb-1">{HOME.address}</h1>
          <p className="text-b-sm text-[#64748B]">{HOME.city} · Purchased {HOME.purchaseDate} · ${(HOME.purchasePrice / 1000).toFixed(0)}K</p>
        </div>
        <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-pill text-[13px] font-semibold text-[#059669]">
          {HOME.equityPct}% equity built
        </span>
      </motion.div>

      {/* ── Main 2-col grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── LEFT: Mortgage Statement ─────────────────────────────────────── */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-white rounded-card border border-[#E2E8F0] shadow-card flex flex-col">

          {/* Card header */}
          <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-[#E2E8F0]">
            <div>
              <p className="text-l-sm uppercase tracking-widest text-[#94A3B8] mb-0.5">Mortgage</p>
              <p className="text-b-md font-semibold text-[#0D1B2A]">{HOME.servicer}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#94A3B8]">Loan</p>
              <p className="text-b-sm font-mono font-semibold text-[#64748B]">{HOME.loanNumber}</p>
            </div>
          </div>

          <div className="px-6 pt-5 pb-4">
            {/* Next payment — most important data point */}
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-l-sm uppercase tracking-widest text-[#94A3B8] mb-1">Next Payment</p>
                <p className="text-d-lg font-black text-[#0D1B2A] tabular-nums leading-none">
                  $<AnimatedNumber value={HOME.monthlyPayment} />
                </p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1.5 text-[13px] font-semibold text-[#059669]">
                  <Calendar size={13} />
                  {HOME.nextDueDate}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Due in {HOME.daysUntilDue} days</p>
              </div>
            </div>

            {/* P&I + Escrow split */}
            <div className="flex gap-3 mb-5">
              <div className="flex-1 p-3 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
                <p className="text-[11px] text-[#94A3B8] mb-0.5">Principal & Interest</p>
                <p className="text-b-md font-bold text-[#0D1B2A]">${HOME.principalAndInterest.toLocaleString()}</p>
              </div>
              <div className="flex-1 p-3 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
                <p className="text-[11px] text-[#94A3B8] mb-0.5">Escrow (taxes + ins.)</p>
                <p className="text-b-md font-bold text-[#0D1B2A]">${HOME.escrowMonthly.toLocaleString()}</p>
              </div>
            </div>

            {/* Loan detail grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
              {[
                { label: 'Balance Remaining', value: `$${(HOME.currentBalance / 1000).toFixed(1)}K` },
                { label: 'Interest Rate',     value: `${HOME.rate}% · 30yr fixed` },
                { label: 'Payoff Date',        value: HOME.payoffDate },
                { label: 'Years Remaining',    value: `${HOME.yearsRemaining} yrs` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-[#94A3B8]">{label}</p>
                  <p className="text-b-sm font-semibold text-[#0D1B2A]">{value}</p>
                </div>
              ))}
            </div>

            {/* Payoff progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-[#94A3B8]">Loan paid off</p>
                <p className="text-[11px] font-semibold text-[#64748B]">{HOME.loanProgress}% · {30 - HOME.yearsRemaining} of 30 yrs</p>
              </div>
              <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${HOME.loanProgress}%` }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>
          </div>

          {/* YTD summary */}
          <div className="mt-auto px-6 pb-5">
            <p className="text-l-sm uppercase tracking-widest text-[#94A3B8] mb-3">2026 Year-to-Date</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Principal Paid', value: `$${HOME.ytdPrincipal.toLocaleString()}` },
                { label: 'Interest Paid',  value: `$${HOME.ytdInterest.toLocaleString()}` },
                { label: 'Escrow Balance', value: `$${HOME.escrowBalance.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0] text-center">
                  <p className="text-b-sm font-bold text-[#0D1B2A]">{value}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Equity + Upgrade Cross-Sell ──────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Equity Card */}
          <motion.div variants={cardVariants} initial="initial" animate="animate"
            className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-6">

            <p className="text-l-sm uppercase tracking-widest text-[#94A3B8] mb-4">Your Equity Position</p>

            {/* Big numbers */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-d-lg font-black text-[#059669] tabular-nums leading-none">
                  $<AnimatedNumber value={HOME.totalEquity} />
                </p>
                <p className="text-b-sm text-[#64748B] mt-0.5">equity in your home</p>
              </div>
              <div className="text-right">
                <p className="text-d-sm font-black text-[#059669]">{HOME.equityPct}%</p>
                <p className="text-[11px] text-[#94A3B8]">of home value</p>
              </div>
            </div>

            {/* Equity vs balance visual */}
            <div className="mb-4">
              <div className="h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#059669] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${HOME.equityPct}%` }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[11px]">
                <span className="font-medium text-[#059669]">Equity $324K</span>
                <span className="text-[#94A3B8]">Balance $463K</span>
              </div>
            </div>

            {/* Value + appreciation */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Home Value', sub: 'current estimate',
                  value: `$${(HOME.currentValue / 1000).toFixed(0)}K`, green: false },
                { label: 'Appreciation', sub: 'since purchase',
                  value: `+$${(HOME.appreciationGain / 1000).toFixed(0)}K`, green: true },
              ].map(({ label, sub, value, green }) => (
                <div key={label} className="p-3 bg-[#F8FAFC] rounded-card-sm border border-[#E2E8F0]">
                  <p className={`text-b-sm font-bold ${green ? 'text-[#059669]' : 'text-[#0D1B2A]'}`}>{value}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{label} · {sub}</p>
                </div>
              ))}
            </div>

            {/* Net available — the number that drives the upgrade */}
            <div className="p-4 rounded-card-sm bg-[#F0FDF4] border border-[#A7F3D0]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#059669] mb-1">Net available to next home</p>
                  <p className="text-d-sm font-black text-[#059669] tabular-nums">
                    ${HOME.netProceeds.toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-[11px] text-[#64748B]">
                  <p>After ~6% selling costs</p>
                  <p className="text-[#94A3B8]">agent · title · closing</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Upgrade Loan Cross-Sell ── */}
          <motion.div
            variants={cardVariants} initial="initial" animate="animate"
            className="rounded-card border border-[#C7D2FE] overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #EEF2FF 0%, #F5F3FF 100%)' }}
          >
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                  <Sparkles size={12} className="text-white" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
                  Upgrade Pre-Qualification
                </p>
              </div>

              <p className="text-d-md font-black text-[#0D1B2A] leading-tight mb-1">
                Up to{' '}
                <span className="text-brand-600">
                  ${(HOME.upgradeBudget / 1_000_000).toFixed(1)}M
                </span>{' '}
                buying power
              </p>
              <p className="text-b-sm text-[#64748B] mb-4">
                Your ${(HOME.netProceeds / 1000).toFixed(0)}K net equity covers a 21% down payment
              </p>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: 'Available rate',   value: `${HOME.upgradeRate}%` },
                  { label: 'Est. P&I',          value: `$${(HOME.upgradePI / 1000).toFixed(1)}K/mo` },
                  { label: 'Total w/ escrow',   value: `$${(HOME.upgradeTotalMonthly / 1000).toFixed(1)}K/mo` },
                ].map(({ label, value }) => (
                  <div key={label}
                    className="bg-white/70 backdrop-blur-sm rounded-card-sm p-3 border border-[#E0DEFF]">
                    <p className="text-b-sm font-bold text-[#0D1B2A]">{value}</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Link href="/scenarios"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-600 text-white rounded-btn text-b-sm font-semibold hover:bg-brand-700 transition-colors group">
                  Explore scenarios
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/buying-power"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/70 border border-[#C7D2FE] text-brand-700 rounded-btn text-b-sm font-semibold hover:bg-white transition-colors">
                  Buying power
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Path to the next home ─────────────────────────────────────────────── */}
      <div>
        <p className="text-l-sm uppercase tracking-widest text-[#94A3B8] font-semibold mb-5">
          Your Path to the Next Home
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PATHS.map(path => {
            const Icon = path.Icon
            return (
              <motion.div
                key={path.id}
                variants={cardVariants} initial="initial" animate="animate"
                className="bg-white rounded-card border border-[#E2E8F0] shadow-card p-5 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-card-sm bg-[#F1F5F9] flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-[#334155]" />
                    </div>
                    <div>
                      <p className="text-b-md font-bold text-[#0D1B2A] leading-tight">{path.label}</p>
                      <p className="text-[11px] text-[#64748B]">{path.sublabel}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-pill border"
                    style={{ color: path.tagColor, background: path.tagBg, borderColor: path.tagBorder }}>
                    {path.tag}
                  </span>
                </div>

                {/* Key stats — the 3 numbers that matter for this path */}
                <div className="space-y-2 mb-4">
                  {path.stats.map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <p className="text-[12px] text-[#94A3B8]">{stat.label}</p>
                      <p className="text-[12px] font-semibold text-[#0D1B2A]">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* One-sentence insight */}
                <p className="text-[12px] text-[#64748B] leading-relaxed mb-4 flex-1">
                  {path.insight}
                </p>

                {/* CTA */}
                <Link href={path.href}
                  className="flex items-center justify-between px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-btn text-b-sm font-semibold text-[#334155] transition-colors group">
                  {path.cta}
                  <ChevronRight size={14} className="text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

    </PageShell>
  )
}
