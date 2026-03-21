'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cardVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ActionCardProps {
  icon?: React.ReactNode
  label: string
  sublabel?: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'primary' | 'caution'
  className?: string
}

export function ActionCard({ icon, label, sublabel, href, onClick, variant = 'default', className }: ActionCardProps) {
  const base = cn(
    'flex items-center gap-3 rounded-card-sm px-4 py-3 cursor-pointer border transition-all group',
    variant === 'primary' && 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700',
    variant === 'caution' && 'bg-caution-50 text-caution-600 border-caution-200 hover:bg-caution-100',
    variant === 'default' && 'bg-white text-[#0D1B2A] border-[#E2E8F0] hover:border-brand-300 hover:shadow-card-md',
    className
  )

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className={cn('text-b-md font-medium truncate', variant === 'primary' ? 'text-white' : '')}>{label}</p>
        {sublabel && <p className={cn('text-b-sm truncate', variant === 'primary' ? 'text-white/70' : 'text-[#64748B]')}>{sublabel}</p>}
      </div>
      <ArrowRight size={16} className={cn(
        'shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all',
        variant === 'primary' ? 'text-white' : 'text-[#64748B]'
      )} />
    </>
  )

  if (href) return (
    <motion.div variants={cardVariants}>
      <Link href={href} className={base}>{content}</Link>
    </motion.div>
  )

  return (
    <motion.div variants={cardVariants} className={base} onClick={onClick} role={onClick ? 'button' : undefined}>
      {content}
    </motion.div>
  )
}
