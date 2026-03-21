'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, ChevronRight, FileText, Lock,
  Users, Search, Clock, Zap, MapPin, PartyPopper,
} from 'lucide-react'
import { MOCK_PROPERTIES, calcMonthlyPayment, calcPMI } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Pre-Approval', done: true },
  { label: 'Choose Home',  done: true },
  { label: 'Move Forward', active: true },
  { label: 'Underwriting', done: false },
  { label: 'Close',        done: false },
]

// ── What happens automatically ────────────────────────────────────────────────

const AUTO_ITEMS = [
  { Icon: FileText,       text: 'Loan application submitted for this property' },
  { Icon: Lock,           text: 'Rate locked at 6.625% for 60 days' },
  { Icon: CheckCircle2,   text: 'Pre-approval letter updated with this address' },
  { Icon: Users,          text: 'Loan officer assigned and notified' },
  { Icon: Search,         text: 'Title search initiated with Austin Title Co.' },
  { Icon: Clock,          text: 'Escrow opened · funds protected in trust' },
]

// ── Consent items ─────────────────────────────────────────────────────────────

const CONSENTS = [
  {
    id: 'authorize',
    text: 'I authorize Jeremy.ai to submit my loan application for this property',
  },
  {
    id: 'credit',
    text: 'I authorize a hard credit inquiry for final mortgage underwriting',
  },
  {
    id: 'respa',
    text: 'I have received and acknowledge the Loan Estimate (required by RESPA)',
  },
]

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepIndicator() {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => (
        <div key={step.label} className="flex items-center">
          {/* Node */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                step.done
                  ? 'bg-[#059669] text-white'
                  : step.active
                  ? 'bg-[#4F46E5] text-white ring-4 ring-[#C7D2FE]'
                  : 'bg-[#E2E8F0] text-[#94A3B8]'
              }`}
            >
              {step.done ? <CheckCircle2 size={13} /> : idx + 1}
            </div>
            <span
              className={`text-[10px] font-semibold whitespace-nowrap ${
                step.active ? 'text-[#4F46E5]' : step.done ? 'text-[#059669]' : 'text-[#94A3B8]'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector */}
          {idx < STEPS.length - 1 && (
            <div
              className={`h-px w-10 sm:w-14 mx-1 mb-4 ${
                STEPS[idx + 1]?.done || STEPS[idx + 1]?.active ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Checkbox ──────────────────────────────────────────────────────────────────

function ConsentCheckbox({
  id, text, checked, onChange,
}: { id: string; text: string; checked: boolean; onChange: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(id)}
      className="flex items-start gap-3 text-left w-full group"
    >
      <div
        className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
          checked
            ? 'bg-[#4F46E5] border-[#4F46E5]'
            : 'border-[#CBD5E1] group-hover:border-[#4F46E5]'
        }`}
      >
        {checked && <CheckCircle2 size={11} className="text-white" />}
      </div>
      <span className="text-[13px] text-[#334155] leading-relaxed">{text}</span>
    </button>
  )
}

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessState({ address, city }: { address: string; city: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#EEF2FF] pt-14 flex items-center justify-center px-6"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 320, damping: 24 }}
          className="w-20 h-20 rounded-full bg-[#4F46E5] flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: '0 8px 32px rgba(79,70,229,0.35)' }}
        >
          <PartyPopper size={36} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h1 className="text-[28px] font-bold text-[#0D1B2A] mb-2 leading-tight">
            You&apos;re moving forward.
          </h1>
          <p className="text-[15px] text-[#64748B] mb-1">Application submitted for</p>
          <p className="text-[16px] font-semibold text-[#334155] mb-6">{address} · {city}, TX</p>

          {/* What's next */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 text-left mb-6">
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">What&apos;s next</p>
            <div className="space-y-2.5">
              {[
                { dot: '#059669', text: 'Rate locked at 6.625% for 60 days' },
                { dot: '#4F46E5', text: 'Loan officer reviewing your file' },
                { dot: '#D97706', text: 'Est. underwriting complete in 1–2 days' },
              ].map(({ dot, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                  <span className="text-[13px] text-[#334155]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/journey"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-[16px] bg-[#4F46E5] text-white text-[15px] font-bold hover:bg-[#4338CA] transition-colors mb-3"
            style={{ boxShadow: '0 4px 12px rgba(79,70,229,0.30)' }}
          >
            Track your journey
            <ChevronRight size={16} />
          </Link>

          <Link href="/" className="text-[13px] text-[#64748B] hover:text-[#334155] transition-colors">
            ← Back to homes
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  const property = MOCK_PROPERTIES.find(p => p.id === id)
  if (!property) return null

  const allChecked = CONSENTS.every(c => checked[c.id])

  const loanAmount = property.price * 0.9
  const pi = calcMonthlyPayment(loanAmount, 6.625, 30)
  const pmi = calcPMI(loanAmount, property.price)
  const totalMonthly = Math.round(pi + pmi + property.estimatedTaxes + property.estimatedInsurance + (property.hoa ?? 0))

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (submitted) {
    return <SuccessState address={property.address} city={property.city} />
  }

  return (
    <div className="min-h-screen bg-[#EEF2FF] pt-14">
      <div className="max-w-screen-lg mx-auto px-6 py-8">

        {/* Back */}
        <Link
          href={`/search/${property.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] font-medium hover:text-[#0D1B2A] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to property
        </Link>

        {/* Step indicator */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <StepIndicator />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[11px] font-bold text-[#3730A3]">
              <Zap size={10} />
              STEP 3 OF 5
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-[#0D1B2A] leading-tight">
            Move forward on this home.
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-[14px] text-[#64748B]">
            <MapPin size={13} className="text-[#94A3B8]" />
            {property.address} · {property.city}, {property.state} {property.zip}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* Left */}
          <div className="space-y-4">

            {/* What happens automatically */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[var(--shadow-card)] p-6"
            >
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">
                What happens automatically
              </p>
              <div className="space-y-4">
                {AUTO_ITEMS.map(({ Icon, text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[#4F46E5]" />
                    </div>
                    <span className="text-[14px] text-[#334155] leading-snug">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Consent + submit */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[var(--shadow-card)] p-6"
            >
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">
                Your confirmation
              </p>

              <div className="space-y-4 mb-6">
                {CONSENTS.map(consent => (
                  <ConsentCheckbox
                    key={consent.id}
                    id={consent.id}
                    text={consent.text}
                    checked={!!checked[consent.id]}
                    onChange={toggle}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={!allChecked}
                onClick={() => setSubmitted(true)}
                className={`w-full py-4 rounded-[16px] text-[15px] font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  allChecked
                    ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA] active:bg-[#3730A3] cursor-pointer'
                    : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                }`}
                style={allChecked ? { boxShadow: '0 4px 12px rgba(79,70,229,0.30)' } : {}}
              >
                {allChecked ? (
                  <>
                    Submit · Move forward
                    <ChevronRight size={16} />
                  </>
                ) : (
                  `Confirm all ${CONSENTS.length} items above to continue`
                )}
              </button>

              {!allChecked && (
                <p className="text-[11px] text-[#94A3B8] text-center mt-2.5">
                  {CONSENTS.filter(c => !checked[c.id]).length} of {CONSENTS.length} items remaining
                </p>
              )}
            </motion.div>

          </div>

          {/* Right — property summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
            className="lg:sticky lg:top-[80px] space-y-3"
          >
            <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[var(--shadow-card)] overflow-hidden">
              {/* Property photo */}
              <div className="h-[140px] relative overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[18px] font-bold text-white tabular-nums">
                    {formatCurrency(property.price)}
                  </p>
                  <p className="text-[11px] text-white/70 mt-0.5 truncate">{property.address}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#64748B]">Monthly payment</span>
                  <span className="text-[14px] font-bold text-[#0D1B2A] tabular-nums">
                    ${totalMonthly.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#64748B]">Down payment</span>
                  <span className="text-[13px] font-semibold text-[#334155] tabular-nums">
                    {formatCurrency(property.price * 0.1)} (10%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#64748B]">Rate</span>
                  <span className="text-[13px] font-semibold text-[#4F46E5]">6.625% · 30-yr</span>
                </div>
                <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[12px] text-[#64748B]">Pre-approval</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-bold">
                    <CheckCircle2 size={10} />
                    Active · $875K
                  </span>
                </div>
              </div>
            </div>

            {/* Reassurance note */}
            <div className="bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0] p-4">
              <p className="text-[12px] text-[#64748B] leading-relaxed">
                <span className="font-semibold text-[#334155]">No commitment yet.</span>{' '}
                Moving forward authorizes your loan application and rate lock — you can still withdraw before closing.
              </p>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  )
}
