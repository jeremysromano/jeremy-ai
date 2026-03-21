'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Zap, Clock, CheckCircle2, Lock,
  ArrowRight, Users, BarChart3, Target, DollarSign,
  Waves, Calendar, Bell, Activity, Star, Filter,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { StatusDot } from '@/components/shared/StatusDot'
import { cardVariants, staggerVariants } from '@/lib/animations'
import {
  MOCK_CLIENTS, MOCK_ADVISOR_METRICS, MOCK_INSIGHT_EVENTS,
} from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import type { ClientData, RiskLevel, BorrowerMember } from '@/lib/types'

// ── Config ────────────────────────────────────────────────────────────────────

type TabKey       = 'focus' | 'pipeline' | 'signals'
type WindowFilter = 'all' | 'closing' | '30' | '60' | '90+'

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; label: string }> = {
  low:      { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Low Risk' },
  medium:   { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Med Risk' },
  high:     { color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', label: 'High Risk' },
  critical: { color: '#7C2D12', bg: '#FFF7ED', border: '#FED7AA', label: 'Critical' },
}

const WINDOW_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  closing: { label: 'In Closing', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  '30':    { label: '30 Days',    color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
  '60':    { label: '60 Days',    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  '90+':   { label: '90+ Days',  color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0' },
}

const urgencyDot: Record<string, 'alert' | 'warning' | 'neutral'> = {
  high: 'alert', medium: 'warning', low: 'neutral',
}

// ── Shared Borrower UI ────────────────────────────────────────────────────────

function BorrowerAvatars({
  borrowers, groupType, size = 'md',
}: {
  borrowers: BorrowerMember[]; groupType: string; size?: 'sm' | 'md'
}) {
  const dim   = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-[12px]'
  const base  = `${dim} rounded-full border-2 border-[#FAF8F5] flex items-center justify-center font-bold text-[#44403C] shrink-0`
  const gap   = size === 'sm' ? '-6px' : '-8px'

  if (groupType === 'joint-purchase' && borrowers.length === 4) {
    const [a, b, c, d] = borrowers
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          <div className={`${base} bg-[#DDD6FE]`}>{a.initials}</div>
          <div className={`${base} bg-[#C4B5FD]`} style={{ marginLeft: gap }}>{b.initials}</div>
        </div>
        <span className="text-[#94A3B8] text-[13px] font-bold leading-none">×</span>
        <div className="flex">
          <div className={`${base} bg-[#BAE6FD]`}>{c.initials}</div>
          <div className={`${base} bg-[#7DD3FC]`} style={{ marginLeft: gap }}>{d.initials}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex">
      {borrowers.map((b, i) => (
        <div key={b.name} className={`${base} bg-[#EDE9E4]`} style={{ marginLeft: i > 0 ? gap : 0 }}>
          {b.initials}
        </div>
      ))}
    </div>
  )
}

function BorrowerNames({ borrowers, groupType }: { borrowers: BorrowerMember[]; groupType: string }) {
  if (groupType === 'joint-purchase' && borrowers.length === 4) {
    const [a, b, c, d] = borrowers
    return (
      <div className="text-[11px] text-[#78716C] leading-snug">
        <span className="font-medium text-[#44403C]">{a.name}</span> &amp; {b.name}
        <span className="mx-1 text-[#A8A29E]">·</span>
        <span className="font-medium text-[#44403C]">{c.name}</span> &amp; {d.name}
      </div>
    )
  }
  return (
    <div className="text-[11px] text-[#78716C] leading-snug">
      {borrowers.map((b, i) => (
        <span key={b.name}>
          {i > 0 && <span className="mx-1 text-[#A8A29E]">&amp;</span>}
          <span className="font-medium text-[#44403C]">{b.name.split(' ')[0]}</span>
          {' '}{b.name.split(' ').slice(1).join(' ')}
          {b.occupation && <span className="text-[#A8A29E]"> · {b.occupation}</span>}
        </span>
      ))}
    </div>
  )
}

// ── Full Borrower Group Card ──────────────────────────────────────────────────

function BorrowerGroupCard({ client }: { client: ClientData }) {
  const risk     = RISK_CONFIG[client.riskLevel]
  const wCfg     = WINDOW_CONFIG[client.closeWindow]
  const convColor = client.conversionProbability >= 80 ? '#059669'
    : client.conversionProbability >= 60 ? '#D97706' : '#E11D48'
  const isJoint  = client.groupType === 'joint-purchase'

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(28,25,23,0.10)' }}
      className="rounded-card-sm border shadow-a-card overflow-hidden cursor-pointer transition-all"
      style={{
        background: isJoint ? 'linear-gradient(145deg,#F0F9FF 0%,#FDF4FF 100%)' : '#FAF8F5',
        borderColor: isJoint ? '#BAE6FD' : '#D6CFC7',
      }}
    >
      {/* Joint-purchase property banner */}
      {isJoint && client.propertyContext && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#BAE6FD]"
          style={{ background: 'linear-gradient(90deg,#0EA5E9 0%,#7C3AED 100%)' }}>
          <Waves size={11} className="text-white/80 shrink-0" />
          <p className="text-[11px] font-bold text-white tracking-wide">{client.propertyContext}</p>
          <span className="ml-auto text-[10px] font-semibold text-white/70 uppercase tracking-widest">Joint Purchase</span>
        </div>
      )}

      <div className="p-4">
        {/* Header: avatars + name + window badge */}
        <div className="flex items-start gap-3 mb-3">
          <BorrowerAvatars borrowers={client.borrowers} groupType={client.groupType} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-b-md font-bold text-[#1C1917] truncate">{client.name}</p>
              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md border tabular-nums"
                style={{ color: wCfg.color, borderColor: wCfg.border, background: wCfg.bg }}>
                {client.daysToClose}d
              </span>
            </div>
            <BorrowerNames borrowers={client.borrowers} groupType={client.groupType} />
          </div>
        </div>

        {/* Rate lock urgency */}
        {client.rateLockExpiry && (
          <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-md bg-[#FFF1F2] border border-[#FECDD3]">
            <Lock size={10} className="text-[#E11D48] shrink-0" />
            <p className="text-[11px] font-semibold text-[#E11D48]">Rate lock expires {client.rateLockExpiry}</p>
          </div>
        )}

        {/* Price + activity */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-semibold text-[#44403C]">{formatCurrency(client.targetPrice)} target</p>
          <p className="text-[11px] text-[#A8A29E]">{client.lastActivity}</p>
        </div>

        {/* Readiness + conversion */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-md bg-[#EDE9E4] text-center">
            <p className="text-[10px] text-[#78716C] uppercase tracking-wider mb-0.5">Readiness</p>
            <p className="text-d-xs font-bold tabular-nums"
              style={{ color: client.readinessScore >= 80 ? '#059669' : client.readinessScore >= 60 ? '#D97706' : '#E11D48' }}>
              {client.readinessScore}
            </p>
          </div>
          <div className="p-2 rounded-md bg-[#EDE9E4] text-center">
            <p className="text-[10px] text-[#78716C] uppercase tracking-wider mb-0.5">Conv. Prob</p>
            <p className="text-d-xs font-bold tabular-nums" style={{ color: convColor }}>
              {client.conversionProbability}%
            </p>
          </div>
        </div>

        {/* Risk signals */}
        {client.riskSignals.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {client.riskSignals.slice(0, 2).map(s => (
              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>
                {s}
              </span>
            ))}
            {client.riskSignals.length > 2 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] text-[#78716C] bg-[#EDE9E4]">
                +{client.riskSignals.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Next best action */}
        <div className="p-2.5 rounded-md bg-[#FEF3C7] border border-[#FDE68A]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#92700A] mb-0.5">Next Best Action</p>
          <p className="text-[12px] text-[#44403C] leading-snug">{client.nextBestAction}</p>
        </div>

        {/* Pricing opportunity */}
        {client.pricingOpportunity && (
          <div className="mt-2 flex items-start gap-1.5">
            <Zap size={11} className="text-[#92700A] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#92700A] font-medium leading-snug">{client.pricingOpportunityDetail}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Compact Deal Row (pipeline list view) ─────────────────────────────────────

function DealRow({ client, index }: { client: ClientData; index: number }) {
  const risk      = RISK_CONFIG[client.riskLevel]
  const wCfg      = WINDOW_CONFIG[client.closeWindow]
  const convColor = client.conversionProbability >= 80 ? '#059669'
    : client.conversionProbability >= 60 ? '#D97706' : '#E11D48'
  const isJoint   = client.groupType === 'joint-purchase'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-card-sm border cursor-pointer group transition-all"
      style={{
        background: isJoint ? '#F0F9FF' : '#FAF8F5',
        borderColor: isJoint ? '#BAE6FD' : '#D6CFC7',
      }}
    >
      {/* Avatars */}
      <BorrowerAvatars borrowers={client.borrowers} groupType={client.groupType} size="sm" />

      {/* Name + next action */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-bold text-[#1C1917] truncate">{client.name}</p>
          {client.propertyContext && (
            <span className="flex items-center gap-1 text-[10px] text-[#0EA5E9] font-semibold shrink-0">
              <Waves size={8} />{client.propertyContext}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#78716C] truncate mt-0.5">{client.nextBestAction}</p>
      </div>

      {/* Days to close */}
      <div className="text-center shrink-0 w-8">
        <p className="text-[15px] font-bold tabular-nums leading-none" style={{ color: wCfg.color }}>
          {client.daysToClose}
        </p>
        <p className="text-[9px] text-[#A8A29E] uppercase tracking-wide mt-0.5">days</p>
      </div>

      {/* Readiness score */}
      <div className="text-center shrink-0 w-9">
        <p className="text-[13px] font-bold tabular-nums leading-none"
          style={{ color: client.readinessScore >= 80 ? '#059669' : client.readinessScore >= 60 ? '#D97706' : '#E11D48' }}>
          {client.readinessScore}
        </p>
        <p className="text-[9px] text-[#A8A29E] uppercase tracking-wide mt-0.5">rdy</p>
      </div>

      {/* Conv prob bar */}
      <div className="w-14 shrink-0">
        <div className="flex items-center justify-end mb-1">
          <p className="text-[11px] font-bold tabular-nums" style={{ color: convColor }}>
            {client.conversionProbability}%
          </p>
        </div>
        <div className="w-full h-1.5 bg-[#EDE9E4] rounded-pill overflow-hidden">
          <motion.div
            className="h-full rounded-pill"
            style={{ background: convColor }}
            initial={{ width: 0 }}
            animate={{ width: `${client.conversionProbability}%` }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: index * 0.05 }}
          />
        </div>
      </div>

      {/* Risk badge */}
      <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border"
        style={{ color: risk.color, background: risk.bg, borderColor: risk.border }}>
        {risk.label}
      </span>

      {/* Rate lock */}
      {client.rateLockExpiry && (
        <div className="flex items-center gap-1 shrink-0">
          <Lock size={9} className="text-[#E11D48]" />
          <p className="text-[10px] text-[#E11D48] font-semibold">
            {client.rateLockExpiry.replace(', 2026', '')}
          </p>
        </div>
      )}

      <ArrowRight size={13} className="text-[#C9C5BF] group-hover:text-[#78716C] shrink-0 transition-colors" />
    </motion.div>
  )
}

// ── Segment Section (pipeline All view) ───────────────────────────────────────

function SegmentSection({ window, clients }: { window: string; clients: ClientData[] }) {
  const cfg      = WINDOW_CONFIG[window]
  const totalLoan = clients.reduce((sum, c) => sum + c.loanAmount, 0)
  const avgConv  = Math.round(clients.reduce((sum, c) => sum + c.conversionProbability, 0) / clients.length)

  return (
    <div>
      {/* Segment header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
        <p className="text-l-sm uppercase tracking-widest font-semibold" style={{ color: cfg.color }}>
          {cfg.label}
        </p>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-pill border tabular-nums"
          style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
          {clients.length}
        </span>
        <span className="text-[11px] text-[#A8A29E]">·</span>
        <span className="text-[11px] text-[#78716C] font-medium">
          {formatCurrency(totalLoan, true)} loan value
        </span>
        <span className="text-[11px] text-[#A8A29E]">·</span>
        <span className="text-[11px] text-[#78716C] font-medium">{avgConv}% avg conv</span>
        <div className="ml-2 flex-1 h-px bg-[#EDE9E4]" />
      </div>

      {/* Deal rows */}
      <div className="space-y-1.5">
        {clients.map((c, i) => <DealRow key={c.id} client={c} index={i} />)}
      </div>
    </div>
  )
}

// ── Focus Tab ─────────────────────────────────────────────────────────────────

function FocusTab({ clients }: { clients: ClientData[] }) {
  const actNow    = [...clients]
    .filter(c => c.rateLockExpiry || c.riskLevel === 'high' || c.riskLevel === 'critical')
    .sort((a, b) => a.daysToClose - b.daysToClose)

  const closingNow = clients.filter(c => c.closeWindow === 'closing')
  const thirtyDay  = clients.filter(c => c.closeWindow === '30')
  const quickWins  = clients.filter(c => c.pricingOpportunity)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Left: main column ────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">

        {/* Act Now */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="p-5 bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-[#E11D48]" />
            <p className="text-l-sm uppercase tracking-widest text-[#78716C]">Act Now</p>
            <span className="ml-auto px-2 py-0.5 rounded-pill bg-[#FFF1F2] text-[#E11D48] text-[11px] font-bold border border-[#FECDD3]">
              {actNow.length} urgent
            </span>
          </div>
          <motion.div variants={staggerVariants} initial="initial" animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actNow.map(c => <BorrowerGroupCard key={c.id} client={c} />)}
          </motion.div>
        </motion.div>

        {/* Closing This Month */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="p-5 bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={15} className="text-[#059669]" />
            <p className="text-l-sm uppercase tracking-widest text-[#78716C]">Closing This Month</p>
            <span className="ml-auto px-2 py-0.5 rounded-pill bg-[#ECFDF5] text-[#059669] text-[11px] font-bold border border-[#A7F3D0]">
              {closingNow.length} deals
            </span>
          </div>
          <motion.div variants={staggerVariants} initial="initial" animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {closingNow.map(c => <BorrowerGroupCard key={c.id} client={c} />)}
          </motion.div>
        </motion.div>

        {/* 30-Day Horizon */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="p-5 bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-[#4F46E5]" />
            <p className="text-l-sm uppercase tracking-widest text-[#78716C]">30-Day Horizon</p>
            <span className="ml-auto px-2 py-0.5 rounded-pill text-[11px] font-bold border"
              style={{ background: '#EEF2FF', color: '#4F46E5', borderColor: '#C7D2FE' }}>
              {thirtyDay.length} deals
            </span>
          </div>
          <div className="space-y-1.5">
            {thirtyDay.map((c, i) => <DealRow key={c.id} client={c} index={i} />)}
          </div>
        </motion.div>
      </div>

      {/* ── Right: sidebar ───────────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Quick Wins */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[#92700A]" />
            <p className="text-l-sm uppercase tracking-widest text-[#78716C]">Quick Wins</p>
            <span className="ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-pill bg-[#FEF3C7] text-[#92700A] border border-[#FDE68A]">
              {quickWins.length} opp
            </span>
          </div>
          <div className="space-y-3">
            {quickWins.map(c => (
              <div key={c.id} className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-card-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex shrink-0">
                    {c.borrowers.slice(0, 2).map((b, i) => (
                      <div key={b.name}
                        className="w-6 h-6 rounded-full border border-[#FAF8F5] flex items-center justify-center text-[9px] font-bold bg-[#EDE9E4] text-[#44403C]"
                        style={{ marginLeft: i > 0 ? '-5px' : 0 }}>
                        {b.initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] font-bold text-[#1C1917] truncate">{c.name}</p>
                </div>
                <p className="text-[11px] text-[#44403C] leading-snug">{c.pricingOpportunityDetail}</p>
                <p className="text-[10px] text-[#A8A29E] mt-1.5">
                  {WINDOW_CONFIG[c.closeWindow].label} · {c.daysToClose}d to close
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pipeline snapshot */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card p-5">
          <p className="text-l-sm uppercase tracking-widest text-[#78716C] mb-4">Pipeline Snapshot</p>
          <div className="space-y-4">
            {(['closing', '30', '60', '90+'] as const).map(w => {
              const seg  = clients.filter(c => c.closeWindow === w)
              const cfg  = WINDOW_CONFIG[w]
              const val  = seg.reduce((s, c) => s + c.loanAmount, 0)
              const pct  = (seg.length / clients.length) * 100
              return (
                <div key={w}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      <p className="text-[12px] font-semibold text-[#1C1917]">{cfg.label}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-bold text-[#1C1917] tabular-nums">{seg.length}</span>
                      <span className="text-[10px] text-[#A8A29E] ml-1">{formatCurrency(val, true)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#EDE9E4] rounded-pill overflow-hidden">
                    <motion.div className="h-full rounded-pill" style={{ background: cfg.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── Pipeline Tab ──────────────────────────────────────────────────────────────

function PipelineTab({ clients }: { clients: ClientData[] }) {
  const [filter, setFilter] = useState<WindowFilter>('all')

  const counts = {
    closing: clients.filter(c => c.closeWindow === 'closing').length,
    '30':    clients.filter(c => c.closeWindow === '30').length,
    '60':    clients.filter(c => c.closeWindow === '60').length,
    '90+':   clients.filter(c => c.closeWindow === '90+').length,
  }

  const FILTERS: Array<{ key: WindowFilter; label: string }> = [
    { key: 'all',     label: `All  ·  ${clients.length}` },
    { key: 'closing', label: `In Closing  ·  ${counts.closing}` },
    { key: '30',      label: `30 Days  ·  ${counts['30']}` },
    { key: '60',      label: `60 Days  ·  ${counts['60']}` },
    { key: '90+',     label: `90+ Days  ·  ${counts['90+']}` },
  ]

  const filtered  = filter === 'all' ? clients : clients.filter(c => c.closeWindow === filter)
  const totalLoan = filtered.reduce((s, c) => s + c.loanAmount, 0)

  return (
    <div>
      {/* Filter strip */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={13} className="text-[#78716C] shrink-0" />
        {FILTERS.map(f => {
          const active   = filter === f.key
          const wCfg     = f.key !== 'all' ? WINDOW_CONFIG[f.key] : null
          const activeColor  = wCfg?.color  ?? '#44403C'
          const activeBg     = wCfg?.bg     ?? '#EDE9E4'
          const activeBorder = wCfg?.border ?? '#A8A29E'
          return (
            <button key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-pill text-[12px] font-semibold transition-all border"
              style={{
                background:   active ? activeBg  : '#FAF8F5',
                color:        active ? activeColor : '#78716C',
                borderColor:  active ? activeBorder : '#D6CFC7',
              }}>
              {f.label}
            </button>
          )
        })}
        <div className="ml-auto text-right">
          <p className="text-[10px] text-[#78716C] uppercase tracking-wide">Loan Value</p>
          <p className="text-[14px] font-bold text-[#1C1917] tabular-nums">{formatCurrency(totalLoan, true)}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}>
          {filter === 'all' ? (
            /* Segmented list — all 4 windows stacked */
            <div className="space-y-8">
              {(['closing', '30', '60', '90+'] as const).map(w => {
                const seg = clients.filter(c => c.closeWindow === w)
                if (!seg.length) return null
                return <SegmentSection key={w} window={w} clients={seg} />
              })}
            </div>
          ) : (
            /* Grid of full cards for filtered window */
            <motion.div variants={staggerVariants} initial="initial" animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(c => <BorrowerGroupCard key={c.id} client={c} />)}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Signals Tab ───────────────────────────────────────────────────────────────

function SignalsTab({ clients }: { clients: ClientData[] }) {
  const sortedByConv = [...clients].sort((a, b) => b.conversionProbability - a.conversionProbability)
  const pricingOps   = clients.filter(c => c.pricingOpportunity)

  const EVENT_STYLE: Record<string, { color: string; bg: string; label: string }> = {
    signal_change:       { color: '#4F46E5', bg: '#EEF2FF', label: 'Signal' },
    pricing_opportunity: { color: '#92700A', bg: '#FEF3C7', label: 'Pricing' },
    risk_alert:          { color: '#E11D48', bg: '#FFF1F2', label: 'Risk' },
    conversion_ready:    { color: '#059669', bg: '#ECFDF5', label: 'Ready' },
    document_added:      { color: '#0EA5E9', bg: '#F0F9FF', label: 'Doc' },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Intelligence feed — 2 cols */}
      <div className="lg:col-span-2">
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={14} className="text-[#4F46E5]" />
            <p className="text-l-sm uppercase tracking-widest text-[#78716C]">Intelligence Feed</p>
            <span className="ml-auto text-[11px] text-[#A8A29E]">Last 72 hours · {MOCK_INSIGHT_EVENTS.length} events</span>
          </div>
          <div className="space-y-3">
            {MOCK_INSIGHT_EVENTS.map((event, i) => {
              const es = EVENT_STYLE[event.eventType]
              return (
                <motion.div key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-card-sm border"
                  style={{ background: es.bg + '70', borderColor: es.bg }}>
                  <StatusDot
                    status={urgencyDot[event.urgency]}
                    pulse={event.urgency === 'high'}
                    size="md"
                    className="mt-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-[12px] font-bold text-[#1C1917] leading-tight">{event.clientName}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ color: es.color, background: es.bg }}>
                        {es.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#44403C] leading-snug">{event.message}</p>
                    <p className="text-[10px] text-[#A8A29E] mt-1">{event.timestamp}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-5">

        {/* Conversion rank */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={13} className="text-[#92700A]" />
            <p className="text-l-sm uppercase tracking-widest text-[#78716C]">Conversion Rank</p>
          </div>
          <div className="space-y-3">
            {sortedByConv.map((c, i) => {
              const convColor = c.conversionProbability >= 80 ? '#059669'
                : c.conversionProbability >= 60 ? '#D97706' : '#E11D48'
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#A8A29E] w-4 shrink-0 font-mono tabular-nums text-right">
                    {i + 1}
                  </span>
                  <div className="flex shrink-0">
                    {c.borrowers.slice(0, 2).map((b, j) => (
                      <div key={b.name}
                        className="w-6 h-6 rounded-full border border-[#FAF8F5] flex items-center justify-center text-[9px] font-bold"
                        style={{
                          background: c.groupType === 'joint-purchase' ? '#DDD6FE' : '#EDE9E4',
                          color: '#44403C', marginLeft: j > 0 ? '-5px' : 0,
                        }}>
                        {b.initials}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-[#1C1917] truncate">{c.name}</p>
                      <p className="text-[12px] font-bold tabular-nums shrink-0 ml-1" style={{ color: convColor }}>
                        {c.conversionProbability}%
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-[#EDE9E4] rounded-pill mt-1 overflow-hidden">
                      <motion.div className="h-full rounded-pill" style={{ background: convColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.conversionProbability}%` }}
                        transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: i * 0.06 }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Pricing wins */}
        <motion.div variants={cardVariants} initial="initial" animate="animate"
          className="bg-[#FAF8F5] border border-[#D6CFC7] shadow-a-card rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-[#92700A]" />
            <p className="text-l-sm uppercase tracking-widest text-[#78716C]">Pricing Wins</p>
          </div>
          <div className="space-y-3">
            {pricingOps.map(c => (
              <div key={c.id} className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-card-sm">
                <p className="text-[12px] font-bold text-[#1C1917] mb-1">{c.name}</p>
                <p className="text-[11px] text-[#44403C] leading-snug">{c.pricingOpportunityDetail}</p>
                <p className="text-[10px] text-[#A8A29E] mt-1.5">
                  {WINDOW_CONFIG[c.closeWindow].label} · {c.daysToClose}d
                </p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdvisorPage() {
  const [tab, setTab] = useState<TabKey>('focus')
  const m = MOCK_ADVISOR_METRICS

  const TABS = [
    { key: 'focus'    as TabKey, label: "Today's Focus", Icon: Bell },
    { key: 'pipeline' as TabKey, label: 'Full Pipeline', Icon: BarChart3 },
    { key: 'signals'  as TabKey, label: 'Signals',       Icon: Activity },
  ]

  return (
    <PageShell advisor className="pb-20">
      <SectionHeader
        eyebrow="Advisor Intelligence"
        title="Your pipeline. Your leverage."
        subtitle="Every borrower group ranked by conversion potential. Every signal surfaced. Every next action ready."
        className="mb-8"
        advisor
      />

      {/* ── Metrics bar ──────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerVariants} initial="initial" animate="animate"
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        {[
          { label: 'Active Groups',  value: m.activeClients,             Icon: Users,        suffix: '' },
          { label: 'Avg Readiness',  value: m.avgReadiness,              Icon: Target,       suffix: '' },
          { label: 'Closings / Mo',  value: m.closingsThisMonth,         Icon: CheckCircle2, suffix: '' },
          { label: 'Pipeline Value', value: m.pipelineValue / 1_000_000, Icon: DollarSign,   suffix: 'M', decimals: 1, prefix: '$' },
          { label: 'Avg Conv. Prob', value: m.avgConversionProb,         Icon: BarChart3,    suffix: '%' },
        ].map(({ label, value, Icon, suffix, decimals, prefix }) => (
          <motion.div key={label} variants={cardVariants}
            className="bg-[#FAF8F5] rounded-card border border-[#D6CFC7] shadow-a-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-l-sm uppercase tracking-widest text-[#78716C]">{label}</p>
              <Icon size={14} className="text-[#A8A29E]" />
            </div>
            <p className="text-d-md font-bold text-[#1C1917] tabular-nums">
              <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals ?? 0} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Tab switcher ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-[#D6CFC7] bg-[#EDE9E4] mb-7 w-fit">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key
          return (
            <button key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
              style={{
                background:  active ? '#FAF8F5' : 'transparent',
                color:       active ? '#1C1917' : '#78716C',
                boxShadow:   active ? '0 1px 4px rgba(28,25,23,0.10)' : 'none',
              }}>
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
          {tab === 'focus'    && <FocusTab    clients={MOCK_CLIENTS} />}
          {tab === 'pipeline' && <PipelineTab clients={MOCK_CLIENTS} />}
          {tab === 'signals'  && <SignalsTab  clients={MOCK_CLIENTS} />}
        </motion.div>
      </AnimatePresence>
    </PageShell>
  )
}
