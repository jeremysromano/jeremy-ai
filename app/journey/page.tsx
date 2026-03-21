'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShieldCheck, FileSignature, ClipboardCheck, Scale, Key,
  CheckCircle2, Circle, ChevronDown, ChevronRight, ArrowRight, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { InsightChip } from '@/components/shared/InsightChip'
import { cardVariants, staggerVariants, timelineVariants } from '@/lib/animations'
import { MOCK_JOURNEY } from '@/lib/mock-data'
import type { JourneyPhase, PhaseStatus } from '@/lib/types'

const ICON_MAP: Record<string, React.FC<any>> = {
  Search, ShieldCheck, FileSignature, ClipboardCheck, Scale, Key,
}

const STATUS_CONFIG: Record<PhaseStatus, { ring: string; fill: string; text: string; connector: string }> = {
  complete: { ring: '#059669', fill: '#059669', text: '#059669', connector: '#059669' },
  active:   { ring: '#4F46E5', fill: '#4F46E5', text: '#4F46E5', connector: '#E2E8F0' },
  upcoming: { ring: '#CBD5E1', fill: 'transparent', text: '#94A3B8', connector: '#E2E8F0' },
}

function PhaseNode({ phase, isLast }: { phase: JourneyPhase; isLast: boolean }) {
  const [open, setOpen] = useState(phase.status === 'active')
  const cfg = STATUS_CONFIG[phase.status]
  const Icon = ICON_MAP[phase.icon] ?? Circle
  const doneCount = phase.subSteps.filter(s => s.done).length

  return (
    <motion.div variants={timelineVariants} className="flex gap-5">
      {/* Timeline column */}
      <div className="flex flex-col items-center" style={{ width: 40 }}>
        {/* Node */}
        <motion.div
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10 relative"
          style={{
            borderColor: cfg.ring,
            background: phase.status === 'upcoming' ? '#F8FAFC' : cfg.fill,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24, delay: 0.1 }}
        >
          {phase.status === 'complete'
            ? <CheckCircle2 size={18} className="text-white" />
            : <Icon size={16} style={{ color: phase.status === 'upcoming' ? '#CBD5E1' : 'white' }} />
          }
          {/* Pulse for active */}
          {phase.status === 'active' && (
            <span className="absolute inset-0 rounded-full animate-ping border-2 border-brand-400 opacity-30" />
          )}
        </motion.div>

        {/* Connector line */}
        {!isLast && (
          <motion.div
            className="w-0.5 flex-1 mt-1 rounded-full"
            style={{ background: cfg.connector, minHeight: 40 }}
            initial={{ scaleY: 0, transformOrigin: 'top' }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8 min-w-0">
        <div
          className={`bg-white rounded-card border shadow-card overflow-hidden ${
            phase.status === 'active' ? 'border-brand-300 ring-1 ring-brand-100' :
            phase.status === 'complete' ? 'border-positive-200' : 'border-[#E2E8F0]'
          }`}
        >
          {/* Header */}
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`px-2 py-0.5 rounded-pill text-[11px] font-semibold border`}
                  style={{ color: cfg.text, borderColor: cfg.ring + '40', background: cfg.ring + '12' }}>
                  {phase.status === 'complete' ? 'Complete' : phase.status === 'active' ? 'In Progress' : 'Upcoming'}
                </span>
                {phase.status === 'active' && (
                  <span className="flex items-center gap-1 text-[11px] text-brand-600 font-semibold">
                    <Sparkles size={10} /> Current phase
                  </span>
                )}
              </div>
              <h3 className="text-b-lg font-bold text-[#0D1B2A]">{phase.label}</h3>
              <p className="text-b-sm text-[#64748B]">{phase.sublabel} · {phase.dateEstimate}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[12px] font-semibold tabular-nums ${
                doneCount === phase.subSteps.length ? 'text-positive-600' : 'text-[#94A3B8]'
              }`}>
                {doneCount}/{phase.subSteps.length}
              </span>
              {open ? <ChevronDown size={16} className="text-[#94A3B8]" /> : <ChevronRight size={16} className="text-[#94A3B8]" />}
            </div>
          </button>

          {/* Steps detail */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-[#E2E8F0] px-5 py-4 space-y-2.5">
                  {phase.subSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3">
                      {step.done
                        ? <CheckCircle2 size={15} className="text-positive-600 shrink-0" />
                        : <Circle size={15} className="text-[#CBD5E1] shrink-0" />
                      }
                      <span className={`text-b-sm ${step.done ? 'text-[#334155]' : 'text-[#94A3B8]'}`}>
                        {step.label}
                      </span>
                      {step.date && (
                        <span className="ml-auto text-[11px] text-[#94A3B8] shrink-0">{step.date}</span>
                      )}
                    </div>
                  ))}

                  {phase.insight && (
                    <InsightChip text={phase.insight} className="mt-3" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default function JourneyPage() {
  const activePhase = MOCK_JOURNEY.find(p => p.status === 'active')
  const completedCount = MOCK_JOURNEY.filter(p => p.status === 'complete').length
  const totalPhases = MOCK_JOURNEY.length

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Borrower Journey"
        title="Your path to the keys."
        subtitle="From home search to close — every step tracked, every signal explained."
        className="mb-6"
        action={
          <Link href="/homeowner"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-btn text-b-sm font-semibold hover:bg-brand-700 transition-colors group">
            Post-Close <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        }
      />

      {/* Progress summary */}
      <div className="mb-8 p-5 bg-white rounded-card border border-[#E2E8F0] shadow-card flex items-center gap-6">
        <div>
          <p className="text-l-sm uppercase tracking-widest text-[#64748B] mb-1">Overall Progress</p>
          <p className="text-d-md font-bold text-[#0D1B2A]">{completedCount} of {totalPhases} phases complete</p>
        </div>
        <div className="flex-1 h-2 bg-[#F1F5F9] rounded-pill overflow-hidden">
          <motion.div
            className="h-full rounded-pill bg-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalPhases) * 100}%` }}
            transition={{ duration: 0.9, ease: [0, 0, 0.2, 1], delay: 0.2 }}
          />
        </div>
        {activePhase && (
          <div className="shrink-0 text-right">
            <p className="text-l-sm text-[#64748B] uppercase tracking-wider">Current Phase</p>
            <p className="text-b-md font-semibold text-brand-600">{activePhase.label}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <motion.div variants={staggerVariants} initial="initial" animate="animate" className="max-w-3xl">
        {MOCK_JOURNEY.map((phase, i) => (
          <PhaseNode
            key={phase.id}
            phase={phase}
            isLast={i === MOCK_JOURNEY.length - 1}
          />
        ))}
      </motion.div>

      {/* Post-close teaser */}
      <div className="mt-4 max-w-3xl">
        <div className="ml-[60px] p-5 bg-brand-50 border border-brand-200 rounded-card">
          <p className="text-b-md font-semibold text-brand-700 mb-1">And then — homeownership intelligence.</p>
          <p className="text-b-sm text-brand-600 mb-3">Jeremy.ai doesn't stop at closing. Equity growth, refinance signals, and homeowner guidance continue automatically.</p>
          <Link href="/homeowner"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-btn text-b-sm font-semibold hover:bg-brand-700 transition-colors group">
            Preview Post-Close <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
